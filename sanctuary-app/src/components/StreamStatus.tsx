import React from 'react';
import type { StreamRecord } from '../lib/pocketbase';

interface StreamStatusProps {
  stream: StreamRecord;
}

export const StreamStatus: React.FC<StreamStatusProps> = ({ stream }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]';
      case 'recording':
        return 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)]';
      case 'error':
        return 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]';
      default:
        return 'bg-slate-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'live':
        return 'Streaming Live';
      case 'recording':
        return 'Recording Session';
      case 'idle':
        return 'System Ready';
      case 'error':
        return 'Connection Error';
      default:
        return status.toUpperCase();
    }
  };

  const lastHeartbeat = new Date(stream.heartbeat);
  const isStale = Date.now() - lastHeartbeat.getTime() > 30000;

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 mb-8 shadow-xl relative overflow-hidden group">
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className={`w-4 h-4 rounded-full animate-ping absolute inset-0 opacity-75 ${getStatusColor(stream.status)}`} />
            <div className={`w-4 h-4 rounded-full relative ${getStatusColor(stream.status)}`} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white leading-tight tracking-tight">
              {getStatusLabel(stream.status)}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {isStale ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-500">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold text-amber-500/90 uppercase tracking-wider">Station Offline</span>
                  <span className="text-xs text-slate-500 font-medium">— Last seen {lastHeartbeat.toLocaleTimeString()}</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Station Online</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right hidden sm:block">
          <div className="bg-slate-950/50 px-4 py-2 rounded-xl border border-white/5 inline-block">
            <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-[0.2em] mb-0.5">Stream ID</span>
            <span className="text-sm font-mono text-indigo-300 font-semibold">{stream.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
