import { useState } from 'react';
import { sendCommand } from '../lib/pocketbase';

interface VideoSettings {
  resolution: string;
  fps: number;
  videoBitrate: number;
  audioBitrate: number;
  encoder: string;
  preset: string;
  keyframeInterval: number;
}

interface AudioSettings {
  sampleRate: number;
  channels: 'stereo' | 'mono';
}

const RESOLUTION_PRESETS = [
  { value: '3840x2160', label: '4K (3840×2160)', recommended: false },
  { value: '2560x1440', label: '1440p (2560×1440)', recommended: false },
  { value: '1920x1080', label: '1080p (1920×1080)', recommended: true },
  { value: '1280x720', label: '720p (1280×720)', recommended: false },
  { value: '854x480', label: '480p (854×480)', recommended: false },
];

const FPS_OPTIONS = [
  { value: 24, label: '24 fps (Cinematic)' },
  { value: 30, label: '30 fps (Recommended)' },
  { value: 60, label: '60 fps (Smooth)' },
];

const ENCODER_OPTIONS = [
  { value: 'obs_x264', label: 'Software (x264) - CPU' },
  { value: 'ffmpeg_nvenc', label: 'NVIDIA NVENC - GPU' },
  { value: 'obs_qsv11', label: 'Intel QuickSync - GPU' },
  { value: 'amd_amf_h264', label: 'AMD AMF - GPU' },
];

const PRESET_OPTIONS_CPU = [
  { value: 'ultrafast', label: 'Ultrafast (Lowest quality)' },
  { value: 'veryfast', label: 'Very Fast' },
  { value: 'fast', label: 'Fast (Recommended)' },
  { value: 'medium', label: 'Medium (Higher quality)' },
  { value: 'slow', label: 'Slow (Best quality)' },
];

const PRESET_OPTIONS_GPU = [
  { value: 'performance', label: 'Performance (Fast)' },
  { value: 'quality', label: 'Quality (Recommended)' },
  { value: 'max-quality', label: 'Max Quality (Slow)' },
];

export function VideoQualitySettings() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    resolution: '1920x1080',
    fps: 30,
    videoBitrate: 3500,
    audioBitrate: 160,
    encoder: 'obs_x264',
    preset: 'fast',
    keyframeInterval: 2,
  });

  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    sampleRate: 48000,
    channels: 'stereo',
  });

  const isGPUEncoder = videoSettings.encoder !== 'obs_x264';
  const presetOptions = isGPUEncoder ? PRESET_OPTIONS_GPU : PRESET_OPTIONS_CPU;

  // Calculate recommended bitrate based on resolution and fps
  const getRecommendedBitrate = (resolution: string, fps: number): { min: number; max: number; recommended: number } => {
    const bitrateMap: Record<string, { base: number; min: number; max: number }> = {
      '3840x2160': { base: 25000, min: 20000, max: 51000 }, // 4K
      '2560x1440': { base: 9000, min: 6000, max: 13000 },   // 1440p
      '1920x1080': { base: 4500, min: 3000, max: 6000 },    // 1080p
      '1280x720': { base: 2500, min: 1500, max: 4000 },     // 720p
      '854x480': { base: 1000, min: 500, max: 2000 },       // 480p
    };

    const config = bitrateMap[resolution];
    if (!config) {
      // Fallback to 1080p if resolution not found
      const fallback = bitrateMap['1920x1080']!; // We know this exists
      const fpsMultiplier = fps === 60 ? 1.5 : 1.0;
      return {
        min: Math.round(fallback.min * fpsMultiplier),
        max: Math.round(fallback.max * fpsMultiplier),
        recommended: Math.round(fallback.base * fpsMultiplier),
      };
    }
    
    const fpsMultiplier = fps === 60 ? 1.5 : 1.0;
    
    return {
      min: Math.round(config.min * fpsMultiplier),
      max: Math.round(config.max * fpsMultiplier),
      recommended: Math.round(config.base * fpsMultiplier),
    };
  };

  const bitrateLimits = getRecommendedBitrate(videoSettings.resolution, videoSettings.fps);

  // Calculate estimated data usage
  const estimateDataUsage = () => {
    const totalBitrate = videoSettings.videoBitrate + videoSettings.audioBitrate;
    const bytesPerSecond = (totalBitrate * 1000) / 8;
    const mbPerMinute = (bytesPerSecond * 60) / (1024 * 1024);
    const gbPerHour = (mbPerMinute * 60) / 1024;
    
    return {
      perMinute: mbPerMinute.toFixed(1),
      perHour: gbPerHour.toFixed(2),
      threeHours: (gbPerHour * 3.25).toFixed(2), // 3h 15min
    };
  };

  const dataUsage = estimateDataUsage();

  const handleSaveQuality = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Parse resolution
      const [width, height] = videoSettings.resolution.split('x').map(Number);

      // Send video settings command
      await sendCommand('SET_VIDEO_SETTINGS', {
        baseWidth: width,
        baseHeight: height,
        outputWidth: width,
        outputHeight: height,
        fpsNum: videoSettings.fps,
        fpsDen: 1,
      });

      // Send encoder settings command
      await sendCommand('SET_STREAM_ENCODER', {
        encoder: videoSettings.encoder,
        settings: {
          bitrate: videoSettings.videoBitrate,
          keyint_sec: videoSettings.keyframeInterval,
          preset: videoSettings.preset,
          profile: 'high',
          rate_control: 'CBR',
        },
      });

      // Send audio settings command
      await sendCommand('SET_AUDIO_SETTINGS', {
        sampleRate: audioSettings.sampleRate,
        channels: audioSettings.channels === 'stereo' ? 2 : 1,
        bitrate: videoSettings.audioBitrate,
      });

      setMessage({ 
        text: '✅ Quality settings applied to OBS! Changes will take effect on next stream.', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Failed to update quality settings:', error);
      setMessage({ 
        text: '❌ Failed to update quality settings. Ensure OBS is running and connected.', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset: 'low' | 'medium' | 'high' | 'ultra') => {
    const presets = {
      low: {
        resolution: '854x480',
        fps: 30,
        videoBitrate: 1000,
        audioBitrate: 96,
        encoder: 'obs_x264',
        preset: 'veryfast',
        keyframeInterval: 2,
      },
      medium: {
        resolution: '1280x720',
        fps: 30,
        videoBitrate: 2500,
        audioBitrate: 128,
        encoder: 'obs_x264',
        preset: 'fast',
        keyframeInterval: 2,
      },
      high: {
        resolution: '1920x1080',
        fps: 30,
        videoBitrate: 4500,
        audioBitrate: 160,
        encoder: 'ffmpeg_nvenc',
        preset: 'quality',
        keyframeInterval: 2,
      },
      ultra: {
        resolution: '1920x1080',
        fps: 60,
        videoBitrate: 6000,
        audioBitrate: 320,
        encoder: 'ffmpeg_nvenc',
        preset: 'max-quality',
        keyframeInterval: 2,
      },
    };

    setVideoSettings(presets[preset]);
    setMessage({ text: `Applied ${preset.toUpperCase()} quality preset`, type: 'info' });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
          <span>🎬</span> Video & Audio Quality
        </h3>
        <div className="text-sm text-gray-400">
          Professional Controls
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Presets</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => applyPreset('low')}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors"
          >
            📱 Low Bandwidth<br/>
            <span className="text-xs text-gray-400">480p • 1 Mbps</span>
          </button>
          <button
            onClick={() => applyPreset('medium')}
            className="px-3 py-2 bg-blue-900 hover:bg-blue-800 rounded text-sm text-white transition-colors"
          >
            💻 Standard<br/>
            <span className="text-xs text-gray-400">720p • 2.5 Mbps</span>
          </button>
          <button
            onClick={() => applyPreset('high')}
            className="px-3 py-2 bg-green-900 hover:bg-green-800 rounded text-sm text-white transition-colors"
          >
            🎥 High Quality<br/>
            <span className="text-xs text-gray-400">1080p • 4.5 Mbps</span>
          </button>
          <button
            onClick={() => applyPreset('ultra')}
            className="px-3 py-2 bg-purple-900 hover:bg-purple-800 rounded text-sm text-white transition-colors"
          >
            ⭐ Ultra (60fps)<br/>
            <span className="text-xs text-gray-400">1080p • 6 Mbps</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveQuality} className="space-y-6">
        {/* Video Settings */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Video Settings</h4>
          
          {/* Resolution */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Resolution
              <span className="ml-2 text-xs text-gray-500">(Canvas & Output)</span>
            </label>
            <select
              value={videoSettings.resolution}
              onChange={(e) => setVideoSettings({ ...videoSettings, resolution: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              {RESOLUTION_PRESETS.map(preset => (
                <option key={preset.value} value={preset.value}>
                  {preset.label} {preset.recommended ? '(Recommended)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* FPS */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Frame Rate (FPS)</label>
            <div className="grid grid-cols-3 gap-2">
              {FPS_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setVideoSettings({ ...videoSettings, fps: option.value })}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    videoSettings.fps === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Video Bitrate */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Video Bitrate: <span className="text-blue-400 font-mono">{videoSettings.videoBitrate} Kbps</span>
              <span className="ml-2 text-xs text-gray-500">
                (Recommended: {bitrateLimits.recommended} Kbps)
              </span>
            </label>
            <input
              type="range"
              min={bitrateLimits.min}
              max={bitrateLimits.max}
              step="100"
              value={videoSettings.videoBitrate}
              onChange={(e) => setVideoSettings({ ...videoSettings, videoBitrate: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Min: {bitrateLimits.min} Kbps</span>
              <span>Max: {bitrateLimits.max} Kbps</span>
            </div>
          </div>

          {/* Encoder */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Encoder
              <span className="ml-2 text-xs text-gray-500">(GPU recommended for better performance)</span>
            </label>
            <select
              value={videoSettings.encoder}
              onChange={(e) => setVideoSettings({ ...videoSettings, encoder: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              {ENCODER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Preset */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {isGPUEncoder ? 'Quality Preset' : 'CPU Preset'}
            </label>
            <select
              value={videoSettings.preset}
              onChange={(e) => setVideoSettings({ ...videoSettings, preset: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              {presetOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Audio Settings */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white border-b border-gray-700 pb-2">Audio Settings</h4>
          
          {/* Audio Bitrate */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Audio Bitrate: <span className="text-green-400 font-mono">{videoSettings.audioBitrate} Kbps</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[96, 128, 160, 320].map(bitrate => (
                <button
                  key={bitrate}
                  type="button"
                  onClick={() => setVideoSettings({ ...videoSettings, audioBitrate: bitrate })}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    videoSettings.audioBitrate === bitrate
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {bitrate} Kbps
                  {bitrate === 160 && <div className="text-xs">Speech</div>}
                  {bitrate === 320 && <div className="text-xs">Music</div>}
                </button>
              ))}
            </div>
          </div>

          {/* Sample Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sample Rate</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAudioSettings({ ...audioSettings, sampleRate: 44100 })}
                className={`px-3 py-2 rounded text-sm transition-colors ${
                  audioSettings.sampleRate === 44100
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                44.1 kHz (CD Quality)
              </button>
              <button
                type="button"
                onClick={() => setAudioSettings({ ...audioSettings, sampleRate: 48000 })}
                className={`px-3 py-2 rounded text-sm transition-colors ${
                  audioSettings.sampleRate === 48000
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                48 kHz (Broadcast)
              </button>
            </div>
          </div>

          {/* Channels */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Channels</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAudioSettings({ ...audioSettings, channels: 'mono' })}
                className={`px-3 py-2 rounded text-sm transition-colors ${
                  audioSettings.channels === 'mono'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Mono (Speech only)
              </button>
              <button
                type="button"
                onClick={() => setAudioSettings({ ...audioSettings, channels: 'stereo' })}
                className={`px-3 py-2 rounded text-sm transition-colors ${
                  audioSettings.channels === 'stereo'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Stereo (Recommended)
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
          >
            {showAdvanced ? '▼' : '▶'} Advanced Settings
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
            <h4 className="text-sm font-medium text-gray-300">Advanced</h4>
            
            {/* Keyframe Interval */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Keyframe Interval: <span className="text-yellow-400 font-mono">{videoSettings.keyframeInterval} seconds</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={videoSettings.keyframeInterval}
                onChange={(e) => setVideoSettings({ ...videoSettings, keyframeInterval: Number(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 2 seconds for most platforms. Lower = better seeking, higher = better compression.
              </p>
            </div>
          </div>
        )}

        {/* Data Usage Estimate */}
        <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-300 mb-2">📊 Estimated Data Usage</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Per Minute</div>
              <div className="text-white font-mono font-bold">{dataUsage.perMinute} MB</div>
            </div>
            <div>
              <div className="text-gray-400">Per Hour</div>
              <div className="text-white font-mono font-bold">{dataUsage.perHour} GB</div>
            </div>
            <div>
              <div className="text-gray-400">3h 15m Service</div>
              <div className="text-white font-mono font-bold">{dataUsage.threeHours} GB</div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            💡 Your YouTube example ({dataUsage.threeHours} GB) will stream smoothly with these settings.
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Applying Settings...
              </>
            ) : (
              '✓ Apply Quality Settings to OBS'
            )}
          </button>
        </div>

        {message && (
          <div
            className={`text-sm p-3 rounded ${
              message.type === 'success'
                ? 'bg-green-900 text-green-200 border border-green-700'
                : message.type === 'error'
                ? 'bg-red-900 text-red-200 border border-red-700'
                : 'bg-blue-900 text-blue-200 border border-blue-700'
            }`}
          >
            {message.text}
          </div>
        )}
      </form>

      <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700 text-xs text-gray-400 space-y-2">
        <p><strong className="text-gray-300">📝 Notes:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Changes apply on next stream start (current stream not affected)</li>
          <li>GPU encoders (NVENC/QuickSync/AMF) recommended for better performance</li>
          <li>Higher bitrate = better quality but requires more bandwidth</li>
          <li>Test your upload speed: Should be 2x your video bitrate minimum</li>
          <li>For 3+ hour streams, 1080p @ 30fps @ 4500 Kbps is ideal</li>
        </ul>
      </div>
    </div>
  );
}
