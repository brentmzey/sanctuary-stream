import React from 'react';
import type { StreamRecord } from '../lib/pocketbase';
import { StreamStatus as PBStreamStatus } from '@shared/schema';

interface StreamStatusProps {
  stream: StreamRecord;
}

export const StreamStatus: React.FC<StreamStatusProps> = ({ stream }) => {
  const getStatusColor = (status: PBStreamStatus) => {
    switch (status) {
      case PBStreamStatus.Live:
        return 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]';
      case PBStreamStatus.Recording:
        return 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)]';
      case PBStreamStatus.Error:
        return 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]';
      default:
        return 'bg-slate-500';
    }
  };

  const getStatusLabel = (status: PBStreamStatus) => {
    switch (status) {
      case PBStreamStatus.Live:
        return 'Streaming Live';
      case PBStreamStatus.Recording:
        return 'Recording Session';
      case PBStreamStatus.Idle:
        return 'System Ready';
      case PBStreamStatus.Error:
        return 'Connection Error';
      default:
        return String(status);
    }
  };

  const lastHeartbeat = new Date(stream.heartbeat);
  const isStale = Date.now() - lastHeartbeat.getTime() > 30000;

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden group">
      {/* Serene background accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl -mr-40 -mt-40 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-8">
          <div className="relative">
            <div className={`w-5 h-5 rounded-full animate-ping absolute inset-0 opacity-40 ${getStatusColor(stream.status)}`} />
            <div className={`w-5 h-5 rounded-full relative ${getStatusColor(stream.status)}`} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white leading-tight tracking-tighter">
              {getStatusLabel(stream.status)}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              {isStale ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-500">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest text-shadow-sm">Station Offline</span>
                  <span className="text-[10px] text-slate-500 font-bold tracking-tight uppercase">Last heartbeat: {lastHeartbeat.toLocaleTimeString()}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <div className="w-1.5 h-1.2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest text-shadow-sm">Station Online</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right hidden md:block">
          <div className="bg-slate-950/60 px-5 py-3 rounded-2xl border border-white/5 inline-block shadow-inner">
            <span className="text-[9px] font-black text-slate-500 block uppercase tracking-[0.25em] mb-1">Transmission Channel</span>
            <span className="text-xs font-mono text-indigo-400 font-bold tracking-wider select-all">{stream.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
