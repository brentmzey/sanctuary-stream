import { StreamRecord } from '../lib/pocketbase';

interface StreamStatusProps {
  stream: StreamRecord | null;
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

  return (
    <div className="status-card bg-gray-800">
      <div className={`status-indicator ${statusColors[stream.status]} pulse`}></div>
      <div>
        <div className="status-label">Status</div>
        <div className="status-value">{statusLabels[stream.status]}</div>
      </div>
      <div className="status-time">
        Last update: {new Date(stream.heartbeat).toLocaleTimeString()}
      </div>
    </div>
  );
}
