import { useState, useEffect } from 'react';
import { StreamRecord } from '../lib/pocketbase';

interface StreamHealthMonitorProps {
  stream: StreamRecord;
}

interface HealthMetrics {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  bandwidth: number; // Kbps
  droppedFramesPercent: number;
  cpuUsage: number;
  uptime: number; // seconds
  recommendations: string[];
}

export function StreamHealthMonitor({ stream }: StreamHealthMonitorProps) {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);

  useEffect(() => {
    if (!stream || stream.status !== 'live') {
      setMetrics(null);
      return;
    }

    const calculateMetrics = (): HealthMetrics => {
      const quality = stream.metadata?.quality;
      const outputBytes = stream.metadata?.outputBytes || 0;
      const outputDuration = stream.metadata?.outputDuration || 1;
      
      const currentBitrate = outputDuration > 0 
        ? Math.round((outputBytes * 8) / outputDuration / 1000) 
        : 0;

      const droppedFrames = quality?.dropped_frames || 0;
      const fps = quality?.fps || 30;
      const totalFrames = Math.max((outputDuration / 1000) * fps, 1);
      const droppedPercent = (droppedFrames / totalFrames) * 100;
      
      const cpuUsage = quality?.cpu_usage || 0;
      const uptime = Math.floor(outputDuration / 1000);

      let overall: HealthMetrics['overall'] = 'excellent';
      const recommendations: string[] = [];

      if (droppedPercent > 5) {
        overall = 'critical';
        recommendations.push('High frame drops detected. Reduce bitrate or resolution.');
      } else if (droppedPercent > 2) {
        overall = 'poor';
        recommendations.push('Some frame drops occurring. Consider lowering settings.');
      } else if (droppedPercent > 0.5) {
        overall = 'fair';
        recommendations.push('Minor frame drops. Monitor your network connection.');
      }

      if (cpuUsage > 85) {
        overall = overall === 'excellent' ? 'poor' : overall;
        recommendations.push('High CPU usage. Enable hardware encoding (GPU).');
      }

      if (currentBitrate < 1000 && uptime > 30) {
        overall = 'critical';
        recommendations.push('Very low bitrate detected. Check your internet connection.');
      }

      if (recommendations.length === 0) {
        recommendations.push('Stream health is optimal. Performance is stable.');
      }

      return {
        overall,
        bandwidth: currentBitrate,
        droppedFramesPercent: droppedPercent,
        cpuUsage,
        uptime,
        recommendations,
      };
    };

    const newMetrics = calculateMetrics();
    setMetrics(newMetrics);
  }, [stream]);

  if (!metrics || stream.status !== 'live') {
    return null;
  }

  const healthStyles = {
    excellent: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-500' },
    good: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-500' },
    fair: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-500' },
    poor: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-500' },
    critical: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-500' },
  };

  const style = healthStyles[metrics.overall];

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 mt-8 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-indigo-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
            </svg>
          </div>
          Live Diagnostics
        </h3>
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${style.bg} ${style.border} ${style.text}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${style.dot}`}></div>
          {metrics.overall}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Bitrate</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white font-mono">{metrics.bandwidth.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-500 uppercase">Kbps</span>
          </div>
        </div>

        <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Frame Drops</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black font-mono ${metrics.droppedFramesPercent > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {metrics.droppedFramesPercent.toFixed(1)}%
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase">loss</span>
          </div>
        </div>

        <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">CPU Load</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black font-mono ${metrics.cpuUsage > 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {Math.round(metrics.cpuUsage)}%
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase">usage</span>
          </div>
        </div>

        <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Uptime</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white font-mono">{formatUptime(metrics.uptime)}</span>
          </div>
        </div>
      </div>

      <div className="bg-indigo-600/5 rounded-2xl p-6 border border-indigo-500/10">
        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
          </svg>
          Optimization Log
        </h4>
        <ul className="space-y-3">
          {metrics.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-300 font-medium">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
