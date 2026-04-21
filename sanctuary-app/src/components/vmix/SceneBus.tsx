import React from 'react';

interface SceneTileProps {
  name: string;
  isProgram: boolean;
  isPreview: boolean;
  isTransitioning: boolean;
  onSendToPreview: (name: string) => void;
}

const SceneTile: React.FC<SceneTileProps> = ({
  name,
  isProgram,
  isPreview,
  isTransitioning,
  onSendToPreview,
}) => {
  const borderColor = isProgram
    ? 'border-rose-500 shadow-[0_0_14px_rgba(239,68,68,0.4)]'
    : isPreview
      ? 'border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.3)]'
      : 'border-white/5 hover:border-white/20';

  const badge = isProgram
    ? <span className="absolute top-1.5 left-1.5 text-[8px] font-black uppercase tracking-widest bg-rose-600 text-white px-1.5 py-0.5 rounded-sm z-10">PGM</span>
    : isPreview
      ? <span className="absolute top-1.5 left-1.5 text-[8px] font-black uppercase tracking-widest bg-emerald-600 text-white px-1.5 py-0.5 rounded-sm z-10">PRV</span>
      : null;

  return (
    <button
      className={`relative shrink-0 w-28 rounded-lg border-2 bg-black/60 overflow-hidden transition-all duration-150 group
        ${borderColor}
        ${isTransitioning ? 'pointer-events-none opacity-60' : 'hover:brightness-110 active:scale-95'}`}
      style={{ aspectRatio: '16/9' }}
      onClick={() => onSendToPreview(name)}
      title={`Send "${name}" to Preview`}
    >
      {badge}

      {/* Scene thumbnail placeholder */}
      <div className="absolute inset-0 flex flex-col items-center justify-center"
        style={{
          background: isProgram
            ? 'linear-gradient(135deg, rgba(220,38,38,0.08), rgba(0,0,0,0.9))'
            : isPreview
              ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(0,0,0,0.9))'
              : 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(0,0,0,0.9))',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"
          className={`w-6 h-6 mb-1.5 transition-colors duration-150
            ${isProgram ? 'text-rose-500/50' : isPreview ? 'text-emerald-500/50' : 'text-white/15 group-hover:text-white/30'}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
        <span className={`text-[9px] font-bold uppercase tracking-wide text-center px-1 leading-tight
          ${isProgram ? 'text-rose-300/80' : isPreview ? 'text-emerald-300/80' : 'text-white/40 group-hover:text-white/60'}`}>
          {name}
        </span>
      </div>
    </button>
  );
};

interface SceneBusProps {
  scenes: string[];
  programScene: string | null;
  previewScene: string | null;
  isTransitioning: boolean;
  onSendToPreview: (name: string) => void;
}

export const SceneBus: React.FC<SceneBusProps> = ({
  scenes,
  programScene,
  previewScene,
  isTransitioning,
  onSendToPreview,
}) => {
  if (scenes.length === 0) {
    return (
      <div className="bg-black/40 border border-white/5 rounded-xl px-6 py-4 flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
        <span className="text-slate-600 text-sm font-medium italic">No scenes from OBS — connect OBS WebSocket to populate input bank</span>
      </div>
    );
  }

  return (
    <div className="bg-black/40 border border-white/5 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2.5 px-1">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Input Bank</span>
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-[9px] text-slate-600">Click a scene to send to Preview</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scene-bus-scroll">
        {scenes.map((scene) => (
          <SceneTile
            key={scene}
            name={scene}
            isProgram={scene === programScene}
            isPreview={scene === previewScene}
            isTransitioning={isTransitioning}
            onSendToPreview={onSendToPreview}
          />
        ))}
      </div>
    </div>
  );
};
