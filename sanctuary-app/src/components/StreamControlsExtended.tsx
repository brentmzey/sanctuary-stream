import { useState } from 'react';
import { sendCommand, StreamRecord, StreamInput } from '../lib/pocketbase';

interface StreamControlsExtendedProps {
  stream: StreamRecord;
  disabled?: boolean;
}

export function StreamControlsExtended({ stream, disabled }: StreamControlsExtendedProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleSceneChange = async (sceneName: string) => {
    setLoadingAction(`SCENE_${sceneName}`);
    try {
      await sendCommand('SET_SCENE', { sceneName }).unsafeRunAsync();
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMuteToggle = async (inputName: string, currentMuted: boolean) => {
    setLoadingAction(`MUTE_${inputName}`);
    try {
      await sendCommand('SET_MUTE', { inputName, muted: !currentMuted }).unsafeRunAsync();
    } finally {
      setLoadingAction(null);
    }
  };

  const scenes = (stream.metadata?.scenes as string[] | undefined) || [];
  const currentScene = (stream.metadata?.currentScene as string | undefined);
  const inputs = (stream.metadata?.inputs as StreamInput[] | undefined) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Scene Selection Card */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-indigo-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          Active Scenes
        </h3>
        
        {scenes.length === 0 ? (
          <p className="text-slate-500 text-sm italic">No scenes detected from OBS.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {scenes.map((scene: string) => (
              <button
                key={scene}
                onClick={() => handleSceneChange(scene)}
                disabled={disabled || loadingAction === `SCENE_${scene}`}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  currentScene === scene 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/60 hover:text-white border border-white/5'
                }`}
              >
                {loadingAction === `SCENE_${scene}` ? (
                   <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : scene}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Audio Mixer Card */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-emerald-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.5A2.25 2.25 0 012.25 15V9a2.25 2.25 0 012.25-2.25h2.25z" />
          </svg>
          Audio Sources
        </h3>
        
        {inputs.length === 0 ? (
          <p className="text-slate-500 text-sm italic">No audio inputs detected from OBS.</p>
        ) : (
          <div className="space-y-3">
            {inputs.map((input: StreamInput) => (
              <div key={input.name} className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-white/5">
                <span className="text-sm font-medium text-slate-300">{input.name}</span>
                <button
                  onClick={() => handleMuteToggle(input.name, input.muted)}
                  disabled={disabled || loadingAction === `MUTE_${input.name}`}
                  className={`p-2 rounded-lg transition-all ${
                    input.muted 
                      ? 'bg-rose-600/20 text-rose-400' 
                      : 'bg-emerald-600/20 text-emerald-400'
                  }`}
                >
                  {loadingAction === `MUTE_${input.name}` ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : input.muted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-11.25L3 4.5m1.5 1.5l1.5 1.5M4.5 4.5l1.5 1.5M3 3l1.5 1.5m12 0l-1.5 1.5m1.5-1.5l-1.5 1.5m1.5-1.5l1.5 1.5m-1.5-1.5l1.5 1.5M10.5 3v15m0 0l-4.72-4.72H4.5A2.25 2.25 0 012.25 15V9a2.25 2.25 0 012.25-2.25h2.25L10.5 3z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.5A2.25 2.25 0 012.25 15V9a2.25 2.25 0 012.25-2.25h2.25z" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
