import { useState } from 'react';
import { sendCommand } from '../lib/pocketbase';

interface ControlButtonsProps {
  isLive: boolean;
  isRecording: boolean;
  disabled?: boolean;
}

export function ControlButtons({ isLive, isRecording, disabled }: ControlButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCommand = async (action: 'START' | 'STOP' | 'RECORD_START' | 'RECORD_STOP') => {
    setLoading(action);
    try {
      await sendCommand(action);
      // Command created, bridge will execute it
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to send command: ${message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="control-grid">
      {!isLive ? (
        <button
          onClick={() => handleCommand('START')}
          disabled={disabled || loading !== null}
          className="control-btn bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
        >
          {loading === 'START' ? (
            <span className="flex items-center gap-2">
              <div className="spinner"></div>
              Starting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="text-2xl">▶️</span>
              Start Streaming
            </span>
          )}
        </button>
      ) : (
        <button
          onClick={() => handleCommand('STOP')}
          disabled={disabled || loading !== null}
          className="control-btn bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600"
        >
          {loading === 'STOP' ? (
            <span className="flex items-center gap-2">
              <div className="spinner"></div>
              Stopping...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="text-2xl">⏹️</span>
              Stop Streaming
            </span>
          )}
        </button>
      )}

      {!isRecording ? (
        <button
          onClick={() => handleCommand('RECORD_START')}
          disabled={disabled || loading !== null}
          className="control-btn bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600"
        >
          {loading === 'RECORD_START' ? (
            <span className="flex items-center gap-2">
              <div className="spinner"></div>
              Starting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="text-2xl">⏺️</span>
              Start Recording
            </span>
          )}
        </button>
      ) : (
        <button
          onClick={() => handleCommand('RECORD_STOP')}
          disabled={disabled || loading !== null}
          className="control-btn bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600"
        >
          {loading === 'RECORD_STOP' ? (
            <span className="flex items-center gap-2">
              <div className="spinner"></div>
              Stopping...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="text-2xl">⏹️</span>
              Stop Recording
            </span>
          )}
        </button>
      )}
    </div>
  );
}
