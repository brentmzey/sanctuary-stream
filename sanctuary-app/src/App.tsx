import { useState, useEffect } from 'react';
import { pb } from './lib/pocketbase';
import { useStream } from './lib/hooks';
import { LoginForm } from './components/LoginForm';
import { StreamStatus } from './components/StreamStatus';
import { ControlButtons } from './components/ControlButtons';
import './App.css';

const STREAM_ID = import.meta.env.VITE_STREAM_ID || '';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const { stream, loading, error } = useStream({ streamId: STREAM_ID });

  useEffect(() => {
    const auth = pb.authStore.isValid;
    setIsAuthenticated(auth);
    if (auth && pb.authStore.model) {
      setUserRole(pb.authStore.model.role);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    if (pb.authStore.model) {
      setUserRole(pb.authStore.model.role);
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    setIsAuthenticated(false);
    setUserRole('');
  };

  if (!STREAM_ID) {
    return (
      <div className="app-container">
        <div className="error-banner">
          ⚠️ STREAM_ID not configured. Please set VITE_STREAM_ID in your .env file.
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onSuccess={handleLoginSuccess} />;
  }

  const canControl = userRole === 'admin' || userRole === 'pastor';

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1 className="text-2xl font-bold text-white">Sanctuary Stream Control</h1>
          <p className="text-gray-400">
            Signed in as {pb.authStore.model?.name} ({userRole})
          </p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Sign Out
        </button>
      </header>

      <main className="app-main">
        {loading && (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading stream status...</p>
          </div>
        )}

        {error && (
          <div className="error-banner">
            ⚠️ Error: {error}
          </div>
        )}

        {stream && (
          <>
            <StreamStatus stream={stream} />

            {canControl ? (
              <ControlButtons
                isLive={stream.status === 'live'}
                isRecording={stream.status === 'recording'}
                disabled={stream.status === 'error'}
              />
            ) : (
              <div className="permission-notice">
                <p>ℹ️ You don't have permission to control streaming.</p>
                <p className="text-sm text-gray-400">Only admins and pastors can start/stop streams.</p>
              </div>
            )}

            {stream.youtube_url && (
              <div className="youtube-link">
                <a 
                  href={stream.youtube_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  📺 Watch Live Stream
                </a>
              </div>
            )}

            {stream.metadata && (
              <div className="metadata-card">
                <h3 className="text-lg font-semibold text-white mb-2">Stream Details</h3>
                <div className="metadata-grid">
                  {stream.metadata.outputActive !== undefined && (
                    <div>
                      <span className="metadata-label">Output Active:</span>
                      <span className="metadata-value">
                        {stream.metadata.outputActive ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                  )}
                  {stream.metadata?.outputDuration !== undefined && typeof stream.metadata.outputDuration === 'number' && (
                    <div>
                      <span className="metadata-label">Duration:</span>
                      <span className="metadata-value">
                        {Math.floor(stream.metadata.outputDuration / 1000)}s
                      </span>
                    </div>
                  )}
                  {stream.metadata?.outputBytes !== undefined && typeof stream.metadata.outputBytes === 'number' && (
                    <div>
                      <span className="metadata-label">Data Sent:</span>
                      <span className="metadata-value">
                        {(stream.metadata.outputBytes / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
