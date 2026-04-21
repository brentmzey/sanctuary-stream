import React from 'react';

export interface ActiveOverlay {
  id: number;
  label: string;
  type: 'lower-third' | 'bug' | 'scripture' | 'fullscreen';
  position: string;
}

interface MonitorPanelProps {
  mode: 'preview' | 'program';
  sceneName: string | null;
  overlays: ActiveOverlay[];
  tBarBlend?: number; // 0–1, used to visually blend when T-Bar is dragged
  isTransitioning?: boolean;
  transitionType?: string;
}

export const MonitorPanel: React.FC<MonitorPanelProps> = ({
  mode,
  sceneName,
  overlays,
  tBarBlend = 0,
  isTransitioning = false,
  transitionType = 'fade',
}) => {
  const isProgram = mode === 'program';

  // T-Bar visual blend: program dims, preview brightens
  const blendOpacity = isProgram
    ? Math.max(0.15, 1 - tBarBlend)
    : Math.min(1, 0.15 + tBarBlend * 0.85);

  const borderClass = isProgram
    ? 'border-rose-500/60 shadow-[0_0_30px_rgba(239,68,68,0.25)]'
    : 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.12)]';

  const badgeBg = isProgram
    ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.6)]'
    : 'bg-emerald-600 text-white shadow-[0_0_8px_rgba(16,185,129,0.5)]';

  return (
    <div
      className={`relative flex-1 border-2 rounded-xl overflow-hidden bg-black/80 ${borderClass} transition-all duration-100`}
      style={{ aspectRatio: '16/9', opacity: tBarBlend > 0 ? blendOpacity : 1 }}
    >
      {/* Scan-line overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
        }}
      />

      {/* Transitioning shimmer */}
      {isTransitioning && transitionType === 'wipe' && (
        <div className="absolute inset-0 z-20 animate-wipe-in bg-black pointer-events-none" />
      )}

      {/* Scene name display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-5 select-none">
        {sceneName ? (
          <>
            <div className="w-16 h-16 mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white/30">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </div>
            <span className="text-white/70 text-sm font-bold tracking-widest uppercase text-center px-4 leading-tight">
              {sceneName}
            </span>
          </>
        ) : (
          <span className="text-white/20 text-xs font-bold tracking-widest uppercase">
            No Scene
          </span>
        )}
      </div>

      {/* Active overlays inside monitor */}
      {overlays.length > 0 && (
        <div className="absolute bottom-3 left-0 right-0 px-3 flex flex-col gap-1 z-30 pointer-events-none">
          {overlays.map((overlay) => (
            <div
              key={overlay.id}
              className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1.5 w-fit
                ${overlay.type === 'lower-third' ? 'bg-indigo-600/80 text-white' : ''}
                ${overlay.type === 'bug' ? 'bg-amber-500/80 text-black' : ''}
                ${overlay.type === 'scripture' ? 'bg-violet-600/80 text-white' : ''}
                ${overlay.type === 'fullscreen' ? 'bg-rose-600/80 text-white' : ''}
              `}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
              {overlay.label}
            </div>
          ))}
        </div>
      )}

      {/* Mode badge */}
      <div className="absolute top-2 left-2 z-40">
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded ${badgeBg} ${isProgram ? 'animate-pulse-slow' : ''}`}>
          {isProgram ? '● PROGRAM' : '○ PREVIEW'}
        </span>
      </div>

      {/* Program live pulse ring */}
      {isProgram && sceneName && (
        <div className="absolute inset-0 border-2 border-rose-500/0 rounded-xl z-50 pointer-events-none"
          style={{ animation: 'programRing 2s ease-in-out infinite' }} />
      )}
    </div>
  );
};
