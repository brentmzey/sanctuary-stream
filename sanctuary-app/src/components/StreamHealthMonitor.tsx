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
  const [bitrateHistory, setBitrateHistory] = useState<number[]>([]);

  useEffect(() => {
    if (!stream || stream.status !== 'live') {
      setMetrics(null);
      return;
    }

    const calculateMetrics = (): HealthMetrics => {
      const quality = stream.metadata?.quality;
      const outputBytes = stream.metadata?.outputBytes || 0;
      const outputDuration = stream.metadata?.outputDuration || 1;
      
      // Calculate current bitrate (in Kbps)
      const currentBitrate = outputDuration > 0 
        ? Math.round((outputBytes * 8) / outputDuration / 1000) 
        : 0;

      const droppedFrames = quality?.dropped_frames || 0;
      const fps = quality?.fps || 30;
      const totalFrames = Math.max((outputDuration / 1000) * fps, 1);
      const droppedPercent = (droppedFrames / totalFrames) * 100;
      
      const cpuUsage = quality?.cpu_usage || 0;
      const uptime = Math.floor(outputDuration / 1000);

      // Determine overall health
      let overall: HealthMetrics['overall'] = 'excellent';
      const recommendations: string[] = [];

      if (droppedPercent > 5) {
        overall = 'critical';
        recommendations.push('⚠️ High frame drops detected. Reduce bitrate or resolution.');
      } else if (droppedPercent > 2) {
        overall = 'poor';
        recommendations.push('⚠️ Some frame drops occurring. Consider lowering settings.');
      } else if (droppedPercent > 0.5) {
        overall = 'fair';
        recommendations.push('💡 Minor frame drops. Monitor your network connection.');
      }

      if (cpuUsage > 85) {
        overall = overall === 'excellent' ? 'poor' : overall;
        recommendations.push('🔥 High CPU usage. Enable hardware encoding (GPU).');
      } else if (cpuUsage > 70) {
        overall = overall === 'excellent' ? 'fair' : overall;
        recommendations.push('💡 Moderate CPU usage. Consider hardware encoding.');
      }

      if (currentBitrate < 1000 && uptime > 30) {
        overall = 'critical';
        recommendations.push('⚠️ Very low bitrate detected. Check your internet connection.');
      }

      if (recommendations.length === 0) {
        recommendations.push('✅ Stream health is optimal. Keep up the great work!');
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

    // Update bitrate history for graph
    setBitrateHistory(prev => {
      const updated = [...prev, newMetrics.bandwidth];
      // Keep last 60 data points (1 minute if updating every second)
      return updated.slice(-60);
    });
  }, [stream]);

  if (!metrics || stream.status !== 'live') {
    return null;
  }

  const healthColors = {
    excellent: 'bg-green-600',
    good: 'bg-blue-600',
    fair: 'bg-yellow-600',
    poor: 'bg-orange-600',
    critical: 'bg-red-600',
  };

  const healthLabels = {
    excellent: '🟢 Excellent',
    good: '🔵 Good',
    fair: '🟡 Fair',
    poor: '🟠 Poor',
    critical: '🔴 Critical',
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Simple sparkline chart
  const renderBitrateSparkline = () => {
    if (bitrateHistory.length < 2) return null;

    const max = Math.max(...bitrateHistory, 1);
    const width = 100;
    const height = 30;
    const points = bitrateHistory.map((value, index) => {
      const x = (index / (bitrateHistory.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-blue-400"
        />
      </svg>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <span>💊</span> Stream Health
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium text-white ${healthColors[metrics.overall]}`}>
          {healthLabels[metrics.overall]}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Bitrate</div>
          <div className="text-2xl font-mono font-bold text-white">
            {metrics.bandwidth.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Kbps</div>
          <div className="mt-2">{renderBitrateSparkline()}</div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Frame Drops</div>
          <div className={`text-2xl font-mono font-bold ${
            metrics.droppedFramesPercent > 2 ? 'text-red-400' : 
            metrics.droppedFramesPercent > 0.5 ? 'text-yellow-400' : 
            'text-green-400'
          }`}>
            {metrics.droppedFramesPercent.toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500">of total frames</div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">CPU Usage</div>
          <div className={`text-2xl font-mono font-bold ${
            metrics.cpuUsage > 85 ? 'text-red-400' : 
            metrics.cpuUsage > 70 ? 'text-yellow-400' : 
            'text-green-400'
          }`}>
            {metrics.cpuUsage.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">processor load</div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Uptime</div>
          <div className="text-2xl font-mono font-bold text-white">
            {formatUptime(metrics.uptime)}
          </div>
          <div className="text-xs text-gray-500">live duration</div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-3">📋 Recommendations</h4>
        <div className="space-y-2">
          {metrics.recommendations.map((rec, index) => (
            <div
              key={index}
              className={`text-sm p-2 rounded ${
                rec.startsWith('⚠️') ? 'bg-red-900/30 text-red-200' :
                rec.startsWith('🔥') ? 'bg-orange-900/30 text-orange-200' :
                rec.startsWith('💡') ? 'bg-yellow-900/30 text-yellow-200' :
                'bg-green-900/30 text-green-200'
              }`}
            >
              {rec}
            </div>
          ))}
        </div>
      </div>

      {/* Network Health Indicators */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className={`p-2 rounded text-center text-xs ${
          metrics.bandwidth > 2000 ? 'bg-green-900/30 text-green-300' : 'bg-gray-900 text-gray-500'
        }`}>
          {metrics.bandwidth > 2000 ? '✓' : '○'} Bandwidth OK
        </div>
        <div className={`p-2 rounded text-center text-xs ${
          metrics.droppedFramesPercent < 1 ? 'bg-green-900/30 text-green-300' : 'bg-gray-900 text-gray-500'
        }`}>
          {metrics.droppedFramesPercent < 1 ? '✓' : '○'} Frame Stability
        </div>
        <div className={`p-2 rounded text-center text-xs ${
          metrics.cpuUsage < 80 ? 'bg-green-900/30 text-green-300' : 'bg-gray-900 text-gray-500'
        }`}>
          {metrics.cpuUsage < 80 ? '✓' : '○'} CPU Headroom
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        💡 Monitor updated in real-time. Data refreshes every few seconds.
      </div>
    </div>
  );
}
