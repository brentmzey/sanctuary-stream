import { StreamRecord } from '../lib/pocketbase';

interface StreamStatusProps {
  stream: StreamRecord | null;
}

// Functional helper: "Map" for optional values
function mapOption<T, R>(value: T | undefined | null, mapper: (v: T) => R): R | null {
  return value !== undefined && value !== null ? mapper(value) : null;
}

export function StreamStatus({ stream }: StreamStatusProps) {
  if (!stream) {
    return (
      <div className="status-card bg-gray-800 text-gray-400">
        <div className="status-indicator bg-gray-600"></div>
        <div>
          <div className="status-label">Status</div>
          <div className="status-value">Unknown</div>
        </div>
      </div>
    );
  }

  const statusColors = {
    live: 'bg-red-600',
    recording: 'bg-orange-500',
    idle: 'bg-gray-600',
    error: 'bg-red-800'
  };

  const statusLabels = {
    live: '🔴 LIVE',
    recording: '⏺️ Recording',
    idle: '⚫ Idle',
    error: '⚠️ Error'
  };

  const quality = stream.metadata?.quality;

  return (
    <div className="status-card bg-gray-800">
      <div className="flex items-center gap-4 border-b border-gray-700 pb-4 mb-4">
        <div className={`status-indicator ${statusColors[stream.status]} pulse`}></div>
        <div>
          <div className="status-label">Status</div>
          <div className="status-value">{statusLabels[stream.status]}</div>
        </div>
        <div className="status-time ml-auto">
          Last update: {new Date(stream.heartbeat).toLocaleTimeString()}
        </div>
      </div>

      {/* Quality Metrics Section - Only visible if quality data exists */}
      {quality && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {mapOption(quality.fps, (fps) => (
            <div key="fps" className="metric-box bg-gray-700 p-2 rounded">
              <div className="text-xs text-gray-400">FPS</div>
              <div className="text-lg font-mono font-bold text-white">{fps.toFixed(1)}</div>
            </div>
          ))}

          {mapOption(quality.dropped_frames, (dropped) => (
            <div key="dropped" className={`metric-box p-2 rounded ${dropped > 0 ? 'bg-red-900/30' : 'bg-gray-700'}`}>
              <div className="text-xs text-gray-400">Dropped Frames</div>
              <div className={`text-lg font-mono font-bold ${dropped > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {dropped}
              </div>
            </div>
          ))}

          {mapOption(quality.cpu_usage, (cpu) => (
             <div key="cpu" className="metric-box bg-gray-700 p-2 rounded">
               <div className="text-xs text-gray-400">CPU Usage</div>
               <div className="text-lg font-mono font-bold text-white">{cpu.toFixed(1)}%</div>
             </div>
          ))}
          
           {mapOption(stream.metadata?.outputBytes, (bytes) => (
             <div key="data" className="metric-box bg-gray-700 p-2 rounded">
               <div className="text-xs text-gray-400">Data Sent</div>
               <div className="text-lg font-mono font-bold text-white">{(bytes / 1024 / 1024).toFixed(1)} MB</div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
