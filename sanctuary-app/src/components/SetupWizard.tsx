import { useState } from 'react';
import { pb, setPocketBaseUrl, testConnection } from '../lib/pocketbase';

interface SetupWizardProps {
  onComplete: (streamId: string) => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [pbUrl, setPbUrl] = useState('http://127.0.0.1:8090');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [streamName, setStreamName] = useState('Sunday Service');
  
  // Auth state for creating stream
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    try {
      setPocketBaseUrl(pbUrl);
      const isHealthy = await testConnection(pbUrl);
      if (isHealthy) {
        setStep(2);
      } else {
        setConnectionError('Could not connect to PocketBase. Is it running?');
      }
    } catch (e) {
      setConnectionError('Invalid URL format');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLoginAndCreate = async () => {
    setIsConnecting(true);
    setAuthError(null);
    try {
      await pb.collection('users').authWithPassword(email, password);
      
      // Create a new stream record
      const record = await pb.collection('streams').create({
        status: 'idle',
        heartbeat: new Date().toISOString(),
        metadata: {
            outputActive: false,
            quality: {}
        }
      });

      // Save to local storage for persistence
      localStorage.setItem('stream_id', record.id);
      
      onComplete(record.id);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white">🚀 Initial Setup</h2>
        <p className="text-gray-400">Let's get your sanctuary connected.</p>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Backend URL (PocketBase)
            </label>
            <input
              type="text"
              value={pbUrl}
              onChange={(e) => setPbUrl(e.target.value)}
              className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="http://127.0.0.1:8090"
            />
          </div>

          {connectionError && (
            <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
              {connectionError}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect to Backend'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-green-900/20 text-green-400 p-2 rounded text-sm mb-4 text-center">
            ✅ Connected to Backend
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600"
            />
          </div>
          
          <div className="border-t border-gray-700 my-4 pt-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
              New Stream Name
            </label>
            <input
              type="text"
              value={streamName}
              onChange={(e) => setStreamName(e.target.value)}
              className="w-full bg-gray-700 text-white rounded p-2 border border-gray-600"
            />
          </div>

          {authError && (
            <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
              {authError}
            </div>
          )}

          <button
            onClick={handleLoginAndCreate}
            disabled={isConnecting}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {isConnecting ? 'Setting up...' : 'Create Stream & Start'}
          </button>
        </div>
      )}
    </div>
  );
}
