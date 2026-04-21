import React, { useState, useRef } from 'react';
import { sendCommand } from '../../lib/pocketbase';
import { CommandAction } from '@shared/schema';

export interface OverlaySlot {
  id: number; // 1–8
  active: boolean;
  type: 'lower-third' | 'bug' | 'scripture' | 'fullscreen' | 'empty';
  label: string;
  content: {
    line1?: string;
    line2?: string;
    verse?: string;
    reference?: string;
  };
  position: 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-left' | 'top-right' | 'center';
  animateIn: 'fade' | 'slide-up' | 'fly-left' | 'fly-right';
  autoDismiss: number; // 0 = no auto-dismiss, >0 = seconds
}

const defaultSlots = (): OverlaySlot[] =>
  Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    active: false,
    type: 'empty',
    label: `OVL ${i + 1}`,
    content: {},
    position: 'bottom-left',
    animateIn: 'slide-up',
    autoDismiss: 0,
  }));

const TYPE_COLORS: Record<string, string> = {
  'lower-third': 'bg-indigo-500',
  'bug': 'bg-amber-500',
  'scripture': 'bg-violet-500',
  'fullscreen': 'bg-rose-500',
  'empty': 'bg-slate-700',
};

const TYPE_LABELS: Record<string, string> = {
  'lower-third': 'L3',
  'bug': 'BUG',
  'scripture': 'VERSE',
  'fullscreen': 'FULL',
  'empty': '—',
};

interface OverlayEditorProps {
  slot: OverlaySlot;
  onSave: (slot: OverlaySlot) => void;
  onClose: () => void;
}

const OverlayEditor: React.FC<OverlayEditorProps> = ({ slot, onSave, onClose }) => {
  const [draft, setDraft] = useState<OverlaySlot>(slot);

  const update = (patch: Partial<OverlaySlot>) => setDraft((d) => ({ ...d, ...patch }));
  const updateContent = (patch: Partial<OverlaySlot['content']>) =>
    setDraft((d) => ({ ...d, content: { ...d.content, ...patch } }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer panel */}
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl z-10 
        animate-slide-up-panel max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-2">
            <span className={`w-5 h-5 rounded text-[9px] flex items-center justify-center font-black ${TYPE_COLORS[draft.type]}`}>
              {draft.id}
            </span>
            Configure Overlay {draft.id}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* Label */}
        <div className="mb-4">
          <label className="overlay-label">Button Label</label>
          <input
            className="overlay-input"
            value={draft.label}
            onChange={(e) => update({ label: e.target.value })}
            placeholder="e.g. Pastor Name"
            maxLength={16}
          />
        </div>

        {/* Type */}
        <div className="mb-4">
          <label className="overlay-label">Overlay Type</label>
          <div className="grid grid-cols-4 gap-2">
            {(['lower-third', 'bug', 'scripture', 'fullscreen'] as const).map((t) => (
              <button
                key={t}
                onClick={() => update({ type: t })}
                className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all
                  ${draft.type === t
                    ? `${TYPE_COLORS[t]} border-transparent text-white`
                    : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'
                  }`}
              >
                {TYPE_LABELS[t]}<br />
                <span className="font-medium opacity-70 text-[7px]">
                  {t === 'lower-third' ? 'Lower 3rd' : t === 'bug' ? 'Bug/Logo' : t === 'scripture' ? 'Verse' : 'Full Screen'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content fields */}
        {draft.type === 'lower-third' && (
          <>
            <div className="mb-3">
              <label className="overlay-label">Name / Title (Line 1)</label>
              <input className="overlay-input" value={draft.content.line1 || ''} onChange={(e) => updateContent({ line1: e.target.value })} placeholder="Pastor John Smith" />
            </div>
            <div className="mb-4">
              <label className="overlay-label">Role / Subtitle (Line 2)</label>
              <input className="overlay-input" value={draft.content.line2 || ''} onChange={(e) => updateContent({ line2: e.target.value })} placeholder="Lead Pastor" />
            </div>
          </>
        )}

        {draft.type === 'scripture' && (
          <>
            <div className="mb-3">
              <label className="overlay-label">Scripture Verse Text</label>
              <textarea className="overlay-input resize-none h-20" value={draft.content.verse || ''} onChange={(e) => updateContent({ verse: e.target.value })} placeholder="For God so loved the world..." />
            </div>
            <div className="mb-4">
              <label className="overlay-label">Reference</label>
              <input className="overlay-input" value={draft.content.reference || ''} onChange={(e) => updateContent({ reference: e.target.value })} placeholder="John 3:16 (NIV)" />
            </div>
          </>
        )}

        {draft.type === 'bug' && (
          <div className="mb-4">
            <label className="overlay-label">Bug Label</label>
            <input className="overlay-input" value={draft.content.line1 || ''} onChange={(e) => updateContent({ line1: e.target.value })} placeholder="LIVE" />
          </div>
        )}

        {/* Position */}
        <div className="mb-4">
          <label className="overlay-label">Position</label>
          <div className="grid grid-cols-3 gap-1.5 max-w-[200px]">
            {(['top-left', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right', 'center'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => update({ position: pos })}
                className={`py-1.5 text-[8px] font-bold uppercase tracking-wide rounded border transition-all
                  ${draft.position === pos ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'}`}
              >
                {pos.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Animate In */}
        <div className="mb-4">
          <label className="overlay-label">Entrance Animation</label>
          <div className="flex gap-2 flex-wrap">
            {(['fade', 'slide-up', 'fly-left', 'fly-right'] as const).map((anim) => (
              <button
                key={anim}
                onClick={() => update({ animateIn: anim })}
                className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide rounded-lg border transition-all
                  ${draft.animateIn === anim ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'}`}
              >
                {anim}
              </button>
            ))}
          </div>
        </div>

        {/* Auto dismiss */}
        <div className="mb-6">
          <label className="overlay-label">Auto-Dismiss (0 = manual)</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={30}
              step={5}
              value={draft.autoDismiss}
              onChange={(e) => update({ autoDismiss: parseInt(e.target.value) })}
              className="flex-1 accent-indigo-500 h-1.5"
            />
            <span className="text-sm font-mono text-white min-w-[40px] text-right">{draft.autoDismiss === 0 ? '∞' : `${draft.autoDismiss}s`}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm font-bold transition-all">Cancel</button>
          <button
            onClick={() => { onSave(draft); onClose(); }}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black uppercase tracking-wider transition-all shadow-[0_0_16px_rgba(99,102,241,0.4)]"
          >
            Save Overlay
          </button>
        </div>
      </div>
    </div>
  );
};

interface OverlayManagerProps {
  disabled?: boolean;
}

export const OverlayManager: React.FC<OverlayManagerProps> = ({ disabled }) => {
  const [slots, setSlots] = useState<OverlaySlot[]>(defaultSlots);
  const [editingId, setEditingId] = useState<number | null>(null);
  const dismissTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const toggleOverlay = async (id: number) => {
    const slot = slots.find((s) => s.id === id);
    if (!slot || slot.type === 'empty') { setEditingId(id); return; }
    if (disabled) return;

    const nowActive = !slot.active;

    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: nowActive } : s))
    );

    // Fire overlay command
    try {
      await sendCommand(CommandAction.SetOverlay, {
        overlayId: id,
        active: nowActive,
        type: slot.type,
        content: slot.content,
        position: slot.position,
        animateIn: slot.animateIn,
      }).unsafeRunAsync();
    } catch { /* no-op */ }

    // Auto-dismiss
    if (nowActive && slot.autoDismiss > 0) {
      if (dismissTimers.current[id]) clearTimeout(dismissTimers.current[id]);
      dismissTimers.current[id] = setTimeout(() => {
        setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, active: false } : s)));
      }, slot.autoDismiss * 1000);
    }
  };

  const saveSlot = (updated: OverlaySlot) => {
    setSlots((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const editingSlot = editingId !== null ? slots.find((s) => s.id === editingId) : null;

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-violet-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
          </svg>
          Overlays
        </h3>
        <span className="text-[9px] text-slate-500 font-medium">Right-click slot to edit · click to toggle</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot) => (
          <div key={slot.id} className="flex flex-col gap-1">
            <button
              id={`overlay-slot-${slot.id}`}
              onClick={() => toggleOverlay(slot.id)}
              onContextMenu={(e) => { e.preventDefault(); setEditingId(slot.id); }}
              className={`relative rounded-xl border-2 py-3 px-2 transition-all duration-200 group
                ${slot.active
                  ? `${TYPE_COLORS[slot.type]} border-transparent shadow-[0_0_16px_rgba(99,102,241,0.5)] text-white scale-[1.03]`
                  : slot.type !== 'empty'
                    ? 'bg-slate-800/60 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
                    : 'bg-slate-900/40 border-dashed border-white/10 text-slate-600 hover:border-white/20'
                }`}
            >
              {/* Active pulse dot */}
              {slot.active && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
              <div className="text-[9px] font-black uppercase tracking-wide text-center leading-tight">
                <div className="opacity-50 mb-0.5">OVL {slot.id}</div>
                <div className={slot.type !== 'empty' ? '' : 'opacity-30'}>
                  {slot.type !== 'empty' ? slot.label : '+'}
                </div>
              </div>
            </button>
            {/* Type badge */}
            <span className={`text-[7px] font-black uppercase tracking-widest text-center
              ${slot.type !== 'empty' ? 'text-slate-500' : 'text-slate-700'}`}>
              {slot.type !== 'empty' ? TYPE_LABELS[slot.type] : 'empty'}
            </span>
          </div>
        ))}
      </div>

      {editingSlot && (
        <OverlayEditor
          slot={editingSlot}
          onSave={saveSlot}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
};
