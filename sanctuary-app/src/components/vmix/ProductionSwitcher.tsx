import React, { useState, useCallback, useEffect } from 'react';
import { sendCommand } from '../../lib/pocketbase';
import type { StreamRecord, StreamInput } from '../../lib/pocketbase';
import { CommandAction, StreamStatus } from '@shared/schema';
import { MonitorPanel } from './MonitorPanel';
import type { ActiveOverlay } from './MonitorPanel';
import { TBar } from './TBar';
import { TransitionSelector } from './TransitionSelector';
import type { TransitionType, TransitionSpeed } from './TransitionSelector';
import { SceneBus } from './SceneBus';
import { OverlayManager } from './OverlayManager';
import { AudioMixer } from './AudioMixer';
import { ShortcutsBar } from './ShortcutsBar';

interface ProductionSwitcherProps {
  stream: StreamRecord;
  disabled?: boolean;
}

const SPEED_MS: Record<TransitionSpeed, number> = {
  fast: 250,
  normal: 1000,
  slow: 2000,
};

export const ProductionSwitcher: React.FC<ProductionSwitcherProps> = ({ stream, disabled }) => {
  const scenes = (stream.metadata?.scenes as string[] | undefined) || [];
  const inputs = (stream.metadata?.inputs as StreamInput[] | undefined) || [];
  const obsCurrentScene = (stream.metadata?.currentScene as string | undefined) ?? null;

  // Initialize programScene from OBS state, or first scene
  const [programScene, setProgramScene] = useState<string | null>(
    obsCurrentScene ?? scenes[0] ?? null
  );
  const [previewScene, setPreviewScene] = useState<string | null>(null);
  const [tBarValue, setTBarValue] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<TransitionType>('fade');
  const [transitionSpeed, setTransitionSpeed] = useState<TransitionSpeed>('normal');
  const [isFadedToBlack, setIsFadedToBlack] = useState(false);

  // Sync programScene with OBS updates
  useEffect(() => {
    if (obsCurrentScene && obsCurrentScene !== programScene) {
      setProgramScene(obsCurrentScene);
    }
  }, [obsCurrentScene]);

  // Overlays shown in monitors
  const [activeMonitorOverlays] = useState<ActiveOverlay[]>([]);

  // ------------------------------------------------------------------
  // TAKE to program — commits the transition and fires SET_SCENE
  // ------------------------------------------------------------------
  const commitTransition = useCallback(
    async (mode: 'cut' | 'auto') => {
      if (!previewScene || isTransitioning) return;

      const incoming = previewScene;

      if (mode === 'cut') {
        // Instant: swap immediately, fire command, done
        setProgramScene(incoming);
        setPreviewScene(null);
        setTBarValue(0);
        try {
          await sendCommand(CommandAction.SetScene, { sceneName: incoming }).unsafeRunAsync();
        } catch { /* no-op */ }
        return;
      }

      // AUTO: play animation, fire command when done
      setIsTransitioning(true);
      const durationMs = SPEED_MS[transitionSpeed];

      // Animate T-Bar from 0 → 1 during transition
      const startTime = performance.now();
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        setTBarValue(progress);
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Transition complete
          setProgramScene(incoming);
          setPreviewScene(null);
          setTBarValue(0);
          setIsTransitioning(false);
        }
      };
      requestAnimationFrame(animate);

      try {
        await sendCommand(CommandAction.SetScene, { sceneName: incoming }).unsafeRunAsync();
      } catch { /* no-op */ }
    },
    [previewScene, isTransitioning, transitionSpeed]
  );

  const handleSendToPreview = useCallback(
    (sceneName: string) => {
      if (isTransitioning) return;
      // Toggle off preview if same scene clicked again
      setPreviewScene((prev) => (prev === sceneName ? null : sceneName));
      setTBarValue(0);
    },
    [isTransitioning]
  );

  const handleFadeToBlack = () => {
    setIsFadedToBlack((prev) => !prev);
  };

  const isLive = stream.status === StreamStatus.Live;
  const isRecording = stream.status === StreamStatus.Recording;
  const hasPreviewScene = previewScene !== null;

  return (
    <div className="production-switcher flex flex-col gap-4 mt-2">

      {/* ── MONITOR ROW ────────────────────────────────────────────── */}
      <div className="bg-black/50 border border-white/8 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-stretch gap-2" style={{ minHeight: '180px' }}>
          {/* Preview Monitor */}
          <MonitorPanel
            mode="preview"
            sceneName={previewScene}
            overlays={activeMonitorOverlays}
            tBarBlend={tBarValue}
          />

          {/* T-Bar + Transition Controls */}
          <div className="flex flex-col gap-3 items-center py-1">
            <TBar
              onCut={() => commitTransition('cut')}
              onAuto={() => commitTransition('auto')}
              isTransitioning={isTransitioning}
              transitionType={transitionType}
              transitionSpeed={transitionSpeed}
              tBarValue={tBarValue}
              onTBarChange={setTBarValue}
              hasPreviewScene={hasPreviewScene}
            />
          </div>

          {/* Program Monitor */}
          <div
            className="flex-1 transition-all duration-300"
            style={{ opacity: isFadedToBlack ? 0.05 : 1 }}
          >
            <MonitorPanel
              mode="program"
              sceneName={programScene}
              overlays={activeMonitorOverlays}
              tBarBlend={tBarValue}
              isTransitioning={isTransitioning}
              transitionType={transitionType}
            />
          </div>
        </div>

        {/* Fade-to-black indicator */}
        {isFadedToBlack && (
          <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-black/60 border border-amber-500/20 rounded-lg w-fit">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">FADE TO BLACK ACTIVE</span>
          </div>
        )}
      </div>

      {/* ── TRANSITION SELECTOR ─────────────────────────────────────── */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-indigo-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Transition</span>
          {hasPreviewScene && !isTransitioning && (
            <span className="ml-auto text-[9px] text-emerald-400 font-bold animate-pulse">
              ↑ Ready — drag T-bar to preview, then CUT or AUTO
            </span>
          )}
          {isTransitioning && (
            <span className="ml-auto text-[9px] text-indigo-400 font-bold animate-pulse">Transitioning…</span>
          )}
        </div>
        <TransitionSelector
          selected={transitionType}
          speed={transitionSpeed}
          onSelect={setTransitionType}
          onSpeedChange={setTransitionSpeed}
        />
      </div>

      {/* ── SCENE BUS ───────────────────────────────────────────────── */}
      <SceneBus
        scenes={scenes}
        programScene={programScene}
        previewScene={previewScene}
        isTransitioning={isTransitioning}
        onSendToPreview={handleSendToPreview}
      />

      {/* ── OVERLAY MANAGER ─────────────────────────────────────────── */}
      <OverlayManager disabled={disabled} />

      {/* ── AUDIO MIXER ─────────────────────────────────────────────── */}
      <AudioMixer inputs={inputs} disabled={disabled} />

      {/* ── SHORTCUTS BAR ───────────────────────────────────────────── */}
      <ShortcutsBar
        isLive={isLive}
        isRecording={isRecording}
        disabled={disabled}
        onFadeToBlack={handleFadeToBlack}
      />
    </div>
  );
};
