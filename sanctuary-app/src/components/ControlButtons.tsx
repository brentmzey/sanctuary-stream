import { useState } from 'react';
import { sendCommand } from '../lib/pocketbase';
import { CommandAction } from '@shared/schema';

interface ControlButtonsProps {
  isLive: boolean;
  isRecording: boolean;
  disabled?: boolean;
}

export function ControlButtons({ isLive, isRecording, disabled }: ControlButtonsProps) {
  const [loadingAction, setLoadingAction] = useState<CommandAction | null>(null);

  const handleCommand = async (action: CommandAction) => {
    setLoadingAction(action);
    try {
      await sendCommand(action);
    } catch (error) {
      console.error('Command failed:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Stream Control Card */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-indigo-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
            Broadcast Control
          </h3>
          <p className="text-slate-400 text-sm mb-6">Manage the live broadcast to YouTube and other platforms.</p>
        </div>

        {!isLive ? (
          <button
            onClick={() => handleCommand(CommandAction.Start)}
            disabled={disabled || loadingAction !== null}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-200 flex items-center justify-center gap-3 group"
          >
            {loadingAction === CommandAction.Start ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 group-hover:scale-110 transition-transform">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-lg uppercase tracking-wider">Go Live</span>
          </button>
        ) : (
          <button
            onClick={() => handleCommand(CommandAction.Stop)}
            disabled={disabled || loadingAction !== null}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-3 group"
          >
            {loadingAction === CommandAction.Stop ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 group-hover:scale-110 transition-transform">
                <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-lg uppercase tracking-wider">End Stream</span>
          </button>
        )}
      </div>

      {/* Recording Control Card */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-rose-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6.75 6.75 0 1 0 0-13.5 6.75 6.75 0 0 0 0 13.5ZM12 16.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z" />
            </svg>
            Archive Recording
          </h3>
          <p className="text-slate-400 text-sm mb-6">Record a high-quality copy of the stream to the local station.</p>
        </div>

        {!isRecording ? (
          <button
            onClick={() => handleCommand(CommandAction.RecordStart)}
            disabled={disabled || loadingAction !== null}
            className="w-full py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 transition-all duration-200 flex items-center justify-center gap-3 group"
          >
            {loadingAction === CommandAction.RecordStart ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <div className="w-4 h-4 rounded-full bg-white group-hover:scale-125 transition-transform"></div>
            )}
            <span className="text-lg uppercase tracking-wider">Start Recording</span>
          </button>
        ) : (
          <button
            onClick={() => handleCommand(CommandAction.RecordStop)}
            disabled={disabled || loadingAction !== null}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-3 group"
          >
            {loadingAction === CommandAction.RecordStop ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 group-hover:scale-110 transition-transform">
                <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-lg uppercase tracking-wider">Stop Recording</span>
          </button>
        )}
      </div>
    </div>
  );
}
