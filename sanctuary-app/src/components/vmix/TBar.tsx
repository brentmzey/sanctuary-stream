import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { TransitionType, TransitionSpeed } from './TransitionSelector';

interface TBarProps {
  onCut: () => void;
  onAuto: () => void;
  isTransitioning: boolean;
  transitionType: TransitionType;
  transitionSpeed: TransitionSpeed;
  tBarValue: number; // 0–1 purely visual
  onTBarChange: (value: number) => void;
  hasPreviewScene: boolean;
}

const SPEED_MS: Record<TransitionSpeed, number> = {
  fast: 250,
  normal: 1000,
  slow: 2000,
};

export const TBar: React.FC<TBarProps> = ({
  onCut,
  onAuto,
  isTransitioning,
  transitionSpeed,
  tBarValue,
  onTBarChange,
  hasPreviewScene,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const [isDraggingState, setIsDraggingState] = useState(false);

  const getValueFromPointer = useCallback((clientY: number): number => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const rawValue = (clientY - rect.top) / rect.height;
    return Math.max(0, Math.min(1, rawValue));
  }, []);

  const springBackToZero = useCallback(() => {
    // Animate tBarValue back to 0 on release
    let current = tBarValue;
    const step = () => {
      current = current * 0.82; // ease-out spring
      if (current < 0.005) {
        onTBarChange(0);
        return;
      }
      onTBarChange(current);
      animFrameRef.current = requestAnimationFrame(step);
    };
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(step);
  }, [tBarValue, onTBarChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isTransitioning || !hasPreviewScene) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    setIsDraggingState(true);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    onTBarChange(getValueFromPointer(e.clientY));
  }, [isTransitioning, hasPreviewScene, getValueFromPointer, onTBarChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    onTBarChange(getValueFromPointer(e.clientY));
  }, [getValueFromPointer, onTBarChange]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsDraggingState(false);
    springBackToZero();
  }, [springBackToZero]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const thumbPercent = tBarValue * 100;
  const canTake = hasPreviewScene && !isTransitioning;
  const durationMs = SPEED_MS[transitionSpeed];

  return (
    <div className="flex flex-col items-center gap-3 px-3 select-none" style={{ minWidth: '80px' }}>
      {/* AUTO Button */}
      <button
        id="auto-transition-btn"
        onClick={onAuto}
        disabled={!canTake}
        className={`w-full py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest border transition-all duration-150
          ${canTake
            ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-[0_0_16px_rgba(99,102,241,0.45)] hover:shadow-[0_0_24px_rgba(99,102,241,0.6)]'
            : 'bg-slate-900/40 border-white/5 text-slate-600 cursor-not-allowed'
          }`}
      >
        {isTransitioning ? (
          <span className="flex justify-center">
            <span className="w-3 h-3 border-2 border-indigo-300/40 border-t-indigo-300 rounded-full animate-spin inline-block" />
          </span>
        ) : (
          <>AUTO<br />
          <span className="font-medium text-[8px] opacity-60">{durationMs}ms</span>
          </>
        )}
      </button>

      {/* T-Bar Track */}
      <div
        ref={trackRef}
        id="t-bar-track"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative flex-1 w-8 rounded-full border transition-all duration-150 cursor-ns-resize
          ${isDraggingState
            ? 'bg-slate-700/80 border-indigo-500/60'
            : 'bg-slate-900/60 border-white/10 hover:border-white/20'
          }
          ${(!canTake && !isDraggingState) ? 'cursor-not-allowed opacity-40' : ''}
        `}
        style={{ minHeight: '120px' }}
        title="Drag to preview fade (visual only — click AUTO or CUT to commit)"
      >
        {/* Track fill */}
        <div
          className="absolute left-0 right-0 bottom-0 rounded-full transition-colors duration-100"
          style={{
            height: `${thumbPercent}%`,
            background: 'linear-gradient(to top, rgba(99,102,241,0.6), rgba(99,102,241,0.15))',
          }}
        />

        {/* Thumb */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-7 h-4 rounded-md border transition-all duration-75
            ${isDraggingState
              ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.8)]'
              : 'bg-slate-600 border-slate-400 shadow-md'
            }`}
          style={{ top: `calc(${thumbPercent}% - 8px)` }}
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((pct) => (
          <div
            key={pct}
            className="absolute right-full mr-1 flex items-center"
            style={{ top: `${pct}%`, transform: 'translateY(-50%)' }}
          >
            <div className={`h-px ${pct === 50 ? 'w-2.5 bg-slate-400' : 'w-1.5 bg-slate-600'}`} />
          </div>
        ))}
      </div>

      {/* CUT Button */}
      <button
        id="cut-transition-btn"
        onClick={onCut}
        disabled={!canTake}
        className={`w-full py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest border transition-all duration-150
          ${canTake
            ? 'bg-rose-700 hover:bg-rose-600 border-rose-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.35)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]'
            : 'bg-slate-900/40 border-white/5 text-slate-600 cursor-not-allowed'
          }`}
      >
        CUT
      </button>

      {/* Visual hint */}
      <span className="text-[8px] text-slate-600 text-center leading-tight tracking-wide">
        Drag to<br />preview
      </span>
    </div>
  );
};
