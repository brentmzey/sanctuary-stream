import { useState } from 'react';
import { sendCommand } from '../lib/pocketbase';
import { CommandAction } from '@shared/schema';

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
  { value: '3840x2160', label: '4K Ultra HD', recommended: false },
  { value: '2560x1440', label: '1440p Quad HD', recommended: false },
  { value: '1920x1080', label: '1080p Full HD', recommended: true },
  { value: '1280x720', label: '720p HD Ready', recommended: false },
];

const ENCODER_OPTIONS = [
  { value: 'obs_x264', label: 'Software (x264) - CPU' },
  { value: 'ffmpeg_nvenc', label: 'NVIDIA NVENC - GPU' },
  { value: 'obs_qsv11', label: 'Intel QuickSync - GPU' },
];

export function VideoQualitySettings() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    resolution: '1920x1080',
    fps: 30,
    videoBitrate: 3500,
    audioBitrate: 160,
    encoder: 'obs_x264',
    preset: 'fast',
    keyframeInterval: 2,
  });

  const [audioSettings] = useState<AudioSettings>({
    sampleRate: 48000,
    channels: 'stereo',
  });

  const estimateDataUsage = () => {
    const totalBitrate = videoSettings.videoBitrate + videoSettings.audioBitrate;
    const mbPerMinute = (totalBitrate * 60) / 8000;
    const gbPerHour = (mbPerMinute * 60) / 1024;
    return { perMinute: mbPerMinute.toFixed(1), perHour: gbPerHour.toFixed(2) };
  };

  const dataUsage = estimateDataUsage();

  const handleSaveQuality = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const [width, height] = videoSettings.resolution.split('x').map(Number);
      await sendCommand(CommandAction.SetVideoSettings, { baseWidth: width, baseHeight: height, outputWidth: width, outputHeight: height, fpsNum: videoSettings.fps, fpsDen: 1 });
      await sendCommand(CommandAction.SetStreamEncoder, { encoder: videoSettings.encoder, settings: { bitrate: videoSettings.videoBitrate, keyint_sec: videoSettings.keyframeInterval, preset: videoSettings.preset, profile: 'high', rate_control: 'CBR' } });
      await sendCommand(CommandAction.SetAudioSettings, { sampleRate: audioSettings.sampleRate, channels: audioSettings.channels === 'stereo' ? 2 : 1, bitrate: videoSettings.audioBitrate });
      setMessage({ text: 'Quality settings synchronized with station!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to update quality settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 mt-8 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-indigo-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          Broadcast Engine
        </h3>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/5 px-3 py-1 rounded-full">
          Professional Grade
        </div>
      </div>

      <form onSubmit={handleSaveQuality} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Visual Configuration</h4>
            
            <div className="space-y-2">
              <label htmlFor="resolution-profile" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Resolution Profile</label>
              <select
                id="resolution-profile"
                value={videoSettings.resolution}
                onChange={(e) => setVideoSettings(prev => ({ ...prev, resolution: e.target.value }))}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
              >
                {RESOLUTION_PRESETS.map(preset => (
                  <option key={preset.value} value={preset.value}>{preset.label} {preset.recommended ? '★' : ''}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bitrate Control ({videoSettings.videoBitrate} Kbps)</label>
              <input
                type="range" min="1000" max="10000" step="500"
                value={videoSettings.videoBitrate}
                onChange={(e) => setVideoSettings(prev => ({ ...prev, videoBitrate: Number(e.target.value) }))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                <span>Low Bandwidth</span>
                <span>Fiber/Pro</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em]">Processing Engine</h4>
            
            <div className="space-y-2">
              <label htmlFor="hardware-encoder" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hardware Encoder</label>
              <select
                id="hardware-encoder"
                value={videoSettings.encoder}
                onChange={(e) => setVideoSettings(prev => ({ ...prev, encoder: e.target.value }))}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
              >
                {ENCODER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Frame Rate</label>
                <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
                  {[30, 60].map(f => (
                    <button
                      key={f} type="button"
                      onClick={() => setVideoSettings(prev => ({ ...prev, fps: f }))}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${videoSettings.fps === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {f} FPS
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="audio-quality" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Audio quality</label>
                <select
                  id="audio-quality"
                  value={videoSettings.audioBitrate}
                  onChange={(e) => setVideoSettings(prev => ({ ...prev, audioBitrate: Number(e.target.value) }))}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-xs font-bold text-white focus:outline-none"
                >
                  <option value={128}>128 Kbps (STD)</option>
                  <option value={160}>160 Kbps (HQ)</option>
                  <option value={320}>320 Kbps (Studio)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-indigo-600/5 rounded-2xl border border-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Resource Projection</h4>
            <p className="text-sm text-slate-400 font-medium">Estimated impact: <span className="text-white font-bold">{dataUsage.perMinute} MB/min</span> — Approximately <span className="text-white font-bold">{dataUsage.perHour} GB/hour</span></p>
          </div>
          <button
            type="submit" disabled={saving}
            className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all duration-200 uppercase tracking-widest text-xs disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : null}
            Synchronize Engine
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-bottom-2 duration-300 ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
            <div className="flex items-center gap-2">
              {message.text}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
