import React from 'react';

export type TransitionType = 'cut' | 'fade' | 'wipe' | 'zoom';
export type TransitionSpeed = 'fast' | 'normal' | 'slow';

interface TransitionSelectorProps {
  selected: TransitionType;
  speed: TransitionSpeed;
  onSelect: (t: TransitionType) => void;
  onSpeedChange: (s: TransitionSpeed) => void;
}

const TRANSITIONS: { type: TransitionType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    type: 'cut',
    label: 'CUT',
    description: 'Instant switch',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4Z" />
      </svg>
    ),
  },
  {
    type: 'fade',
    label: 'FADE',
    description: 'Cross-dissolve',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM6.75 9.25a.75.75 0 0 0 0 1.5h4.59l-2.1 1.95a.75.75 0 0 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 1 0-1.02 1.1l2.1 1.95H6.75Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    type: 'wipe',
    label: 'WIPE',
    description: 'Slide left→right',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    type: 'zoom',
    label: 'ZOOM',
    description: 'Scale in',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM17.555 5.168a1 1 0 1 0-1.11-1.665A5.963 5.963 0 0 0 14 8c0 1.39.476 2.67 1.268 3.67a1 1 0 0 0 1.537-1.282A3.962 3.962 0 0 1 16 8c0-.99.36-1.896.955-2.597a.75.75 0 0 0-.4-.235ZM8 14a6 6 0 1 0 0-12A6 6 0 0 0 8 14Zm0 2a8 8 0 1 1 0-16A8 8 0 0 1 8 16Z" />
      </svg>
    ),
  },
];

const SPEEDS: { value: TransitionSpeed; label: string; ms: number }[] = [
  { value: 'fast', label: 'Fast', ms: 250 },
  { value: 'normal', label: 'Normal', ms: 1000 },
  { value: 'slow', label: 'Slow', ms: 2000 },
];

export const TransitionSelector: React.FC<TransitionSelectorProps> = ({
  selected,
  speed,
  onSelect,
  onSpeedChange,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Transition type buttons */}
      <div className="flex gap-2">
        {TRANSITIONS.map((t) => (
          <button
            key={t.type}
            id={`transition-${t.type}`}
            onClick={() => onSelect(t.type)}
            title={t.description}
            className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-lg border transition-all duration-150 group
              ${selected === t.type
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/15 hover:text-white'
              }`}
          >
            <span className={`transition-transform duration-150 ${selected === t.type ? 'scale-110' : 'group-hover:scale-105'}`}>
              {t.icon}
            </span>
            <span className="text-[9px] font-black tracking-widest uppercase">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Speed selector — hidden when CUT is selected */}
      <div className={`flex gap-1.5 transition-all duration-200 ${selected === 'cut' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest self-center mr-1">Speed</span>
        {SPEEDS.map((s) => (
          <button
            key={s.value}
            id={`speed-${s.value}`}
            onClick={() => onSpeedChange(s.value)}
            className={`flex-1 text-[9px] font-black uppercase tracking-wider py-1.5 rounded-md border transition-all
              ${speed === s.value
                ? 'bg-slate-700 border-slate-500 text-white'
                : 'bg-transparent border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
              }`}
          >
            {s.label}
            <span className="block text-[7px] font-medium opacity-60">{s.ms}ms</span>
          </button>
        ))}
      </div>
    </div>
  );
};
