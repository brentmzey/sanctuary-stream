import { useState, useEffect } from 'react';
import { pb } from './lib/pocketbase';
import { useStream } from './lib/hooks';
import { isSome } from '@shared/option';
import { LoginForm } from './components/LoginForm';
import { StreamStatus } from './components/StreamStatus';
import { ControlButtons } from './components/ControlButtons';
import { StreamSettings } from './components/StreamSettings';
import { SetupWizard } from './components/SetupWizard';
import { AnnouncementsBanner } from './components/AnnouncementsBanner';
import { PastoralReflections } from './components/PastoralReflections';
import './App.css';

function App() {
  // Initialize Stream ID from LocalStorage or Environment
  const [streamId, setStreamId] = useState<string>(() => {
    return localStorage.getItem('stream_id') || import.meta.env.VITE_STREAM_ID || '';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'control' | 'reflections'>('control');

  // Only hook into stream if we have an ID
  const { stream, loading, error } = useStream({ streamId });

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

  const handleSetupComplete = (newStreamId: string) => {
    setStreamId(newStreamId);
    if (pb.authStore.model) {
      setIsAuthenticated(true);
      setUserRole(pb.authStore.model.role);
    }
  };

  // 1. Show Setup Wizard if no Stream ID is configured
  if (!streamId) {
    return (
      <div className="app-container flex items-center justify-center h-screen">
        <SetupWizard onComplete={handleSetupComplete} />
      </div>
    );
  }

  // 2. Show Login if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onSuccess={handleLoginSuccess} />;
  }

  const canControl = userRole === 'admin' || userRole === 'pastor';

  return (
    <div className="app-container">
      {/* Live announcements banner — always visible */}
      <AnnouncementsBanner />

      <header className="app-header">
        <div>
          <h1 className="text-2xl font-bold text-white">Sanctuary Stream</h1>
          <p className="text-gray-400">
            Signed in as {pb.authStore.model?.name} ({userRole})
          </p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Sign Out
        </button>
      </header>

      {/* Top-level tab bar */}
      <nav className="app-tabs" aria-label="App sections">
        <button
          className={`app-tab ${activeTab === 'control' ? 'app-tab--active' : ''}`}
          onClick={() => setActiveTab('control')}
        >
          🎙️ Stream Control
        </button>
        <button
          className={`app-tab ${activeTab === 'reflections' ? 'app-tab--active' : ''}`}
          onClick={() => setActiveTab('reflections')}
        >
          ✦ Reflections
        </button>
      </nav>

      <main className="app-main">
        {/* ── Stream Control Tab ─────────────────────────────────── */}
        {activeTab === 'control' && (
          <>
            {loading && (
              <div className="loading-state">
                <div className="spinner-large"></div>
                <p>Loading stream status...</p>
              </div>
            )}

            {isSome(error) && (
              <div className="error-banner">
                ⚠️ Error: {error.value}
              </div>
            )}

            {isSome(stream) && (
              <>
                <StreamStatus stream={stream.value} />

                {canControl ? (
                  <>
                    <ControlButtons
                      isLive={stream.value.status === 'live'}
                      isRecording={stream.value.status === 'recording'}
                      disabled={stream.value.status === 'error'}
                    />
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
                      >
                        {showSettings ? '🔼 Hide Settings' : '⚙️ Stream Settings'}
                      </button>
                    </div>
                    {showSettings && <StreamSettings />}
                  </>
                ) : (
                  <div className="permission-notice">
                    <p>ℹ️ You don't have permission to control streaming.</p>
                    <p className="text-sm text-gray-400">Only admins and pastors can start/stop streams.</p>
                  </div>
                )}

                {stream.value.youtube_url && (
                  <div className="youtube-link">
                    <a
                      href={stream.value.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      📺 Watch Live Stream
                    </a>
                  </div>
                )}

                {stream.value.metadata && (
                  <div className="metadata-card">
                    <h3 className="text-lg font-semibold text-white mb-2">Stream Details</h3>
                    <div className="metadata-grid">
                      {stream.value.metadata.outputActive !== undefined && (
                        <div>
                          <span className="metadata-label">Output Active:</span>
                          <span className="metadata-value">
                            {stream.value.metadata.outputActive ? '✅ Yes' : '❌ No'}
                          </span>
                        </div>
                      )}
                      {stream.value.metadata?.outputDuration !== undefined && typeof stream.value.metadata.outputDuration === 'number' && (
                        <div>
                          <span className="metadata-label">Duration:</span>
                          <span className="metadata-value">
                            {Math.floor(stream.value.metadata.outputDuration / 1000)}s
                          </span>
                        </div>
                      )}
                      {stream.value.metadata?.outputBytes !== undefined && typeof stream.value.metadata.outputBytes === 'number' && (
                        <div>
                          <span className="metadata-label">Data Sent:</span>
                          <span className="metadata-value">
                            {(stream.value.metadata.outputBytes / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── Reflections Tab ────────────────────────────────────── */}
        {activeTab === 'reflections' && <PastoralReflections />}
      </main>
    </div>
  );
}

export default App;
