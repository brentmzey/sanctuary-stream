import React from 'react';
import type { StreamRecord } from '../lib/pocketbase';

interface StreamStatusProps {
  stream: StreamRecord;
}

export const StreamStatus: React.FC<StreamStatusProps> = ({ stream }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]';
      case 'recording':
        return 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]';
      case 'error':
        return 'bg-yellow-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'live':
        return 'LIVE';
      case 'recording':
        return 'RECORDING';
      case 'idle':
        return 'IDLE';
      case 'error':
        return 'CONNECTION ERROR';
      default:
        return status.toUpperCase();
    }
  };

  const lastHeartbeat = new Date(stream.heartbeat);
  const isStale = Date.now() - lastHeartbeat.getTime() > 30000;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor(stream.status)}`} />
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">
              {getStatusLabel(stream.status)}
            </h2>
            <p className="text-sm text-slate-400">
              {isStale ? (
                <span className="text-yellow-500/80">⚠️ Station Offline (Last seen {lastHeartbeat.toLocaleTimeString()})</span>
              ) : (
                <span className="text-green-500/80">● Station Online</span>
              )}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-slate-500 block uppercase tracking-widest">Stream ID</span>
          <span className="text-sm font-mono text-slate-300">{stream.id}</span>
        </div>
      </div>
    </div>
  );
};
