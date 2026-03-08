import { useState, useEffect } from 'react';
import { pb } from './lib/pocketbase';
import { useStream } from './lib/hooks';
import { isSome } from '@shared/option';
import { LoginForm } from './components/LoginForm';
import { StreamStatus } from './components/StreamStatus';
import { ControlButtons } from './components/ControlButtons';
import { StreamSettings } from './components/StreamSettings';
import { VideoQualitySettings } from './components/VideoQualitySettings';
import { StreamHealthMonitor } from './components/StreamHealthMonitor';
import { StreamControlsExtended } from './components/StreamControlsExtended';
import { SetupWizard } from './components/SetupWizard';
import { AnnouncementsBanner } from './components/AnnouncementsBanner';
import { PastoralReflections } from './components/PastoralReflections';
import { RecordingsList } from './components/RecordingsList';
import { HelpGuide } from './components/HelpGuide';
import { Logo } from './components/Logo';
import { useTheme } from './lib/ThemeContext';
import './App.css';

type Tab = 'control' | 'reflections' | 'recordings' | 'help';

function App() {
  const { setTheme, resolvedTheme } = useTheme();
  // Theme toggle is handled by setTheme in the button click
  // Initialize Stream ID from LocalStorage or Environment
  const [streamId, setStreamId] = useState<string>(() => {
    return localStorage.getItem('stream_id') || import.meta.env.VITE_STREAM_ID || '';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);
  const [userRole, setUserRole] = useState<string>('');
  const [activeTab, setActiveTab] = useState<Tab>('control');
  const [showQualitySettings, setShowQualitySettings] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Only hook into stream if we have an ID and are authenticated
  const { stream, loading, error } = useStream({ streamId, isAuthenticated });

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
  if (!streamId || streamId === 'your_stream_id_here') {
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
    <div className={`app-container-wrapper min-h-screen transition-colors duration-500 ${resolvedTheme === 'dark' ? 'dark bg-slate-950' : 'light bg-slate-50'}`}>
      <div className="app-container">
      {/* Live announcements banner — always visible */}
      <AnnouncementsBanner />

      <header className="app-header">
        <div className="flex items-center gap-4">
          <Logo className="w-12 h-12" />
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Sanctuary Stream</h1>
            <p className="text-slate-400 text-sm font-medium">
              Signed in as <span className="text-indigo-400">{pb.authStore.model?.name}</span> ({userRole})
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 bg-slate-800/40 hover:bg-slate-700/60 border border-white/5 rounded-xl transition-all text-slate-400 hover:text-white group"
            title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {resolvedTheme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:rotate-12 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M3 12h2.25m.386-6.364 1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M3 12h2.25m.386-6.364 1.591-1.591M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-rotate-12 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
          
          <button onClick={handleLogout} className="logout-btn flex items-center gap-2 group">
            <span>Sign Out</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </header>

      {/* Top-level tab bar */}
      <nav className="app-tabs" aria-label="App sections">
        <button
          className={`app-tab ${activeTab === 'control' ? 'app-tab--active' : ''}`}
          onClick={() => setActiveTab('control')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 0 1 0-5.303m5.304 0a3.75 3.75 0 0 1 0 5.303m-7.425 2.122a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          Stream Control
        </button>
        <button
          className={`app-tab ${activeTab === 'reflections' ? 'app-tab--active' : ''}`}
          onClick={() => setActiveTab('reflections')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
          Pastoral Reflections
        </button>
        <button
          className={`app-tab ${activeTab === 'recordings' ? 'app-tab--active' : ''}`}
          onClick={() => setActiveTab('recordings')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          Recordings
        </button>
        <button
          className={`app-tab ${activeTab === 'help' ? 'app-tab--active' : ''}`}
          onClick={() => setActiveTab('help')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
          </svg>
          Help
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

                {/* Stream Health Monitor - Only show when live */}
                {stream.value.status === 'live' && (
                  <StreamHealthMonitor stream={stream.value} />
                )}

                {canControl ? (
                  <>
                    <ControlButtons
                      isLive={stream.value.status === 'live'}
                      isRecording={stream.value.status === 'recording'}
                      disabled={stream.value.status === 'error'}
                    />
                    
                    <StreamControlsExtended 
                      stream={stream.value}
                      disabled={stream.value.status === 'error'}
                    />
                    <div className="flex justify-end gap-4 mt-4">
                      <button
                        onClick={() => setShowQualitySettings(!showQualitySettings)}
                        className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
                      >
                        {showQualitySettings ? '🔼 Hide Quality Controls' : '🎬 Video Quality'}
                      </button>
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
                      >
                        {showSettings ? '🔼 Hide Settings' : '⚙️ Stream Settings'}
                      </button>
                    </div>
                    {showQualitySettings && <VideoQualitySettings />}
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

        {/* ── Recordings Tab ─────────────────────────────────────── */}
        {activeTab === 'recordings' && <RecordingsList streamId={streamId} />}

        {/* ── Help Tab ───────────────────────────────────────────── */}
        {activeTab === 'help' && <HelpGuide />}
      </main>
      </div>
    </div>
  );
}

export default App;
