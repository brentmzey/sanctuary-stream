import React, { useState, useEffect, useRef } from 'react';
import { sendCommand } from '../../lib/pocketbase';
import type { StreamInput } from '../../lib/pocketbase';
import { CommandAction } from '@shared/schema';

interface ChannelState extends StreamInput {
  volume: number; // 0–100 (fader position)
  vuLevel: number; // 0–100 simulated VU
  vuPeak: number;
}

interface AudioMixerProps {
  inputs: StreamInput[];
  disabled?: boolean;
}

// Simulated VU animation that oscillates when not muted
function useVuMeter(muted: boolean) {
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const frameRef = useRef<number | null>(null);
  const peakTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (muted) {
      setLevel(0);
      setPeak(0);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }

    let t = Math.random() * 1000;
    const animate = () => {
      t += 0.06;
      // Organic noise using sin waves
      const base = 55 + Math.sin(t * 0.9) * 18 + Math.sin(t * 2.1) * 10 + Math.sin(t * 5.3) * 6;
      const noise = (Math.random() - 0.5) * 8;
      const val = Math.max(0, Math.min(100, base + noise));
      setLevel(val);
      setPeak((prev) => {
        if (val > prev) {
          if (peakTimer.current) clearTimeout(peakTimer.current);
          peakTimer.current = setTimeout(() => setPeak(0), 1500);
          return val;
        }
        return prev;
      });
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (peakTimer.current) clearTimeout(peakTimer.current);
    };
  }, [muted]);

  return { level, peak };
}

const VUMeter: React.FC<{ level: number; peak: number; muted: boolean }> = ({ level, peak, muted }) => {
  const bars = 16;
  return (
    <div className="flex gap-[2px] items-end" style={{ height: '60px' }}>
      {Array.from({ length: bars }, (_, i) => {
        const barThreshold = (i / bars) * 100;
        const isActive = !muted && level > barThreshold;
        const isPeak = !muted && Math.abs(peak - barThreshold) < 6 && peak > 0;
        const isHot = barThreshold > 80;
        const isWarm = barThreshold > 60;
        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-30"
            style={{
              height: `${((i + 1) / bars) * 100}%`,
              background: isPeak
                ? '#fff'
                : isActive
                  ? isHot
                    ? 'rgba(239,68,68,0.9)'
                    : isWarm
                      ? 'rgba(251,191,36,0.85)'
                      : 'rgba(16,185,129,0.85)'
                  : 'rgba(255,255,255,0.06)',
            }}
          />
        );
      })}
    </div>
  );
};

const ChannelStrip: React.FC<{
  channel: ChannelState;
  onMuteToggle: (name: string, muted: boolean) => void;
  onVolumeChange: (name: string, volume: number) => void;
  disabled?: boolean;
}> = ({ channel, onMuteToggle, onVolumeChange, disabled }) => {
  const { level, peak } = useVuMeter(channel.muted);

  return (
    <div className={`flex flex-col items-center gap-2 px-2 py-3 rounded-xl border transition-all w-20 shrink-0
      ${channel.muted ? 'bg-slate-950/60 border-white/5 opacity-60' : 'bg-slate-900/60 border-white/8'}`}
    >
      {/* VU Meter */}
      <VUMeter level={level} peak={peak} muted={channel.muted} />

      {/* dB label */}
      <span className="text-[8px] font-mono text-slate-500 tabular-nums">
        {channel.muted ? '-∞' : `${Math.round(-60 + (channel.volume / 100) * 60)} dB`}
      </span>

      {/* Fader */}
      <div className="relative w-4 flex flex-col items-center" style={{ height: '80px' }}>
        <input
          type="range"
          min={0}
          max={100}
          value={channel.volume}
          disabled={disabled || channel.muted}
          onChange={(e) => onVolumeChange(channel.name, parseInt(e.target.value))}
          className="vmix-fader"
          style={{
            writingMode: 'vertical-lr',
            direction: 'rtl',
            WebkitAppearance: 'slider-vertical',
            width: '18px',
            height: '80px',
            cursor: 'ns-resize',
          }}
        />
      </div>

      {/* Mute button */}
      <button
        onClick={() => onMuteToggle(channel.name, channel.muted)}
        disabled={disabled}
        className={`w-full py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all
          ${channel.muted
            ? 'bg-rose-600/80 border-rose-500/60 text-white'
            : 'bg-transparent border-white/10 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-400'
          }`}
      >
        {channel.muted ? 'MUTE' : 'M'}
      </button>

      {/* Channel name */}
      <span className="text-[8px] font-bold text-slate-400 text-center uppercase tracking-wider leading-tight truncate w-full text-center">
        {channel.name.length > 8 ? channel.name.slice(0, 7) + '…' : channel.name}
      </span>
    </div>
  );
};

export const AudioMixer: React.FC<AudioMixerProps> = ({ inputs, disabled }) => {
  const [channels, setChannels] = useState<ChannelState[]>([]);

  useEffect(() => {
    setChannels(
      inputs.map((inp) => ({
        ...inp,
        volume: inp.volume ?? 100,
        vuLevel: 0,
        vuPeak: 0,
      }))
    );
  }, [inputs]);

  const handleMuteToggle = async (name: string, currentMuted: boolean) => {
    setChannels((prev) =>
      prev.map((c) => (c.name === name ? { ...c, muted: !currentMuted } : c))
    );
    try {
      await sendCommand(CommandAction.SetMute, { inputName: name, muted: !currentMuted }).unsafeRunAsync();
    } catch { /* no-op */ }
  };

  const handleVolumeChange = async (name: string, volume: number) => {
    setChannels((prev) => prev.map((c) => (c.name === name ? { ...c, volume } : c)));
    try {
      await sendCommand(CommandAction.SetVolume, { inputName: name, volume }).unsafeRunAsync();
    } catch { /* no-op */ }
  };

  if (inputs.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-emerald-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.5A2.25 2.25 0 012.25 15V9a2.25 2.25 0 012.25-2.25h2.25z" />
          </svg>
          Audio Mixer
        </h3>
        <p className="text-slate-600 text-sm italic">No audio sources — connect OBS to populate channels</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-emerald-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.5A2.25 2.25 0 012.25 15V9a2.25 2.25 0 012.25-2.25h2.25z" />
          </svg>
          Audio Mixer
        </h3>
        <span className="text-[9px] text-slate-500">{channels.filter((c) => !c.muted).length}/{channels.length} active</span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 audio-mixer-scroll justify-center">
        {channels.map((ch) => (
          <ChannelStrip
            key={ch.name}
            channel={ch}
            onMuteToggle={handleMuteToggle}
            onVolumeChange={handleVolumeChange}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};
