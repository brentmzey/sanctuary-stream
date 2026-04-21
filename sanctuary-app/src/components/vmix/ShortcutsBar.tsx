import React, { useState } from 'react';
import { sendCommand } from '../../lib/pocketbase';
import { CommandAction } from '@shared/schema';

interface MacroButton {
  id: string;
  label: string;
  sublabel?: string;
  color: 'red' | 'amber' | 'indigo' | 'slate' | 'emerald' | 'violet';
  action: () => Promise<void>;
  keyHint?: string;
}

interface ShortcutsBarProps {
  isLive: boolean;
  isRecording: boolean;
  disabled?: boolean;
  onFadeToBlack?: () => void;
}

const COLOR_CLASSES: Record<string, string> = {
  red: 'bg-rose-700/80 hover:bg-rose-600 border-rose-600/40 text-white shadow-[0_0_12px_rgba(220,38,38,0.2)]',
  amber: 'bg-amber-600/80 hover:bg-amber-500 border-amber-500/40 text-black shadow-[0_0_12px_rgba(245,158,11,0.2)]',
  indigo: 'bg-indigo-600/80 hover:bg-indigo-500 border-indigo-500/40 text-white shadow-[0_0_12px_rgba(99,102,241,0.2)]',
  slate: 'bg-slate-700/80 hover:bg-slate-600 border-white/10 text-slate-200',
  emerald: 'bg-emerald-700/80 hover:bg-emerald-600 border-emerald-600/40 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]',
  violet: 'bg-violet-700/80 hover:bg-violet-600 border-violet-600/40 text-white shadow-[0_0_12px_rgba(139,92,246,0.2)]',
};

export const ShortcutsBar: React.FC<ShortcutsBarProps> = ({
  isLive,
  isRecording,
  disabled,
  onFadeToBlack,
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [fadeBlack, setFadeBlack] = useState(false);

  const run = async (id: string, action: () => Promise<void>) => {
    if (loadingId || disabled) return;
    setLoadingId(id);
    try {
      await action();
    } catch { /* no-op */ } finally {
      setLoadingId(null);
    }
  };

  const macros: MacroButton[] = [
    {
      id: 'fade-to-black',
      label: fadeBlack ? 'Restore' : 'Fade Black',
      sublabel: fadeBlack ? 'Click to restore' : 'Program → Black',
      color: fadeBlack ? 'amber' : 'slate',
      keyHint: 'F',
      action: async () => {
        const next = !fadeBlack;
        setFadeBlack(next);
        onFadeToBlack?.();
        await sendCommand(CommandAction.FadeToBlack, { active: next }).unsafeRunAsync();
      },
    },
    {
      id: 'restart-scene',
      label: 'Restart',
      sublabel: 'Reset scene',
      color: 'slate',
      keyHint: 'R',
      action: async () => {
        await sendCommand(CommandAction.ApplyTransition, { action: 'restart' }).unsafeRunAsync();
      },
    },
    {
      id: 'toggle-stream',
      label: isLive ? 'End Stream' : 'Go Live',
      sublabel: isLive ? 'Stop broadcast' : 'Start broadcast',
      color: isLive ? 'red' : 'emerald',
      keyHint: 'S',
      action: async () => {
        await sendCommand(isLive ? CommandAction.Stop : CommandAction.Start).unsafeRunAsync();
      },
    },
    {
      id: 'toggle-record',
      label: isRecording ? 'Stop REC' : 'Record',
      sublabel: isRecording ? 'End archive' : 'Local archive',
      color: isRecording ? 'red' : 'violet',
      keyHint: 'D',
      action: async () => {
        await sendCommand(isRecording ? CommandAction.RecordStop : CommandAction.RecordStart).unsafeRunAsync();
      },
    },
  ];

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-amber-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Macros</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {macros.map((macro) => (
          <button
            key={macro.id}
            id={`macro-${macro.id}`}
            onClick={() => run(macro.id, macro.action)}
            disabled={!!disabled || loadingId !== null}
            className={`relative flex flex-col items-center justify-center py-3 px-2 rounded-xl border font-bold transition-all duration-150
              ${COLOR_CLASSES[macro.color]}
              ${disabled || loadingId !== null ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}
            `}
          >
            {loadingId === macro.id ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-[10px] font-black uppercase tracking-wide leading-tight text-center">{macro.label}</span>
                {macro.sublabel && (
                  <span className="text-[7px] font-medium opacity-60 mt-0.5 text-center leading-tight">{macro.sublabel}</span>
                )}
              </>
            )}
            {macro.keyHint && (
              <span className="absolute bottom-1 right-1.5 text-[7px] opacity-30 font-mono font-black">{macro.keyHint}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
