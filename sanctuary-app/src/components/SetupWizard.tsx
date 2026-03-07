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
  const [showHelp, setShowHelp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    try {
      setPocketBaseUrl(pbUrl);
      const isHealthy = await testConnection(pbUrl).unsafeRunAsync();
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
      
      const record = await pb.collection('streams').create({
        status: 'idle',
        heartbeat: new Date().toISOString(),
        metadata: {
            outputActive: false,
            quality: {}
        }
      });

      localStorage.setItem('stream_id', record.id);
      onComplete(record.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl flex flex-col md:flex-row bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl mx-4">
      <div className="flex-1 p-8 md:p-12">
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-6 shadow-xl shadow-indigo-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.59 8.31m5.84 2.58a14.98 14.98 0 0 1-6.16 12.12A14.98 14.98 0 0 1 3.27 10.89a14.98 14.98 0 0 1 6.16-12.12ZM21 3s-3.75 3.61-3.75 3.61m-13.5 13.5L3.75 21" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Initial Setup</h2>
          <p className="text-slate-400 font-medium">Link your sanctuary to the network.</p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Backend Service URL
                </label>
                <button 
                  onClick={() => setShowHelp(!showHelp)}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors md:hidden"
                >
                  {showHelp ? 'Hide Help' : 'What is this?'}
                </button>
              </div>
              <input
                type="text"
                value={pbUrl}
                onChange={(e) => setPbUrl(e.target.value)}
                className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600"
                placeholder="http://127.0.0.1:8090"
              />
            </div>

            {connectionError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl animate-shake">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25.0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
                  </svg>
                  {connectionError}
                </div>
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all duration-200 uppercase tracking-widest text-sm"
            >
              {isConnecting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Connecting</span>
                </div>
              ) : 'Establish Connection'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              Handshake Successful
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="admin-email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Email</label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="pastor@church.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="access-password" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Password</label>
                <input
                  id="access-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              
              <div className="pt-4 border-t border-white/5 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Station Name</label>
                <input
                  type="text"
                  value={streamName}
                  onChange={(e) => setStreamName(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {authError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
                {authError}
              </div>
            )}

            <button
              onClick={handleLoginAndCreate}
              disabled={isConnecting}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all duration-200 uppercase tracking-widest text-sm"
            >
              {isConnecting ? 'Registering Station...' : 'Create Stream Account'}
            </button>
          </div>
        )}
      </div>

      <div className={`w-full md:w-80 bg-slate-950/50 border-t md:border-t-0 md:border-l border-white/5 p-8 ${showHelp || step === 1 ? 'block' : 'hidden md:block'}`}>
        <h3 className="text-indigo-400 font-black uppercase tracking-widest text-xs mb-6">Setup Guide</h3>
        <div className="space-y-8">
          <section>
            <h4 className="text-white font-bold text-sm mb-2">Backend URL</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              This is the address of your Sanctuary PocketBase server. If running locally, use <code className="text-indigo-300">http://127.0.0.1:8090</code>.
            </p>
          </section>
          <section>
            <h4 className="text-white font-bold text-sm mb-2">Authentication</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Use your church admin credentials to link this station to your account.
            </p>
          </section>
          <section>
            <h4 className="text-white font-bold text-sm mb-2">Station Name</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              A friendly name like "Main Sanctuary" or "Youth Hall" to identify this broadcast point.
            </p>
          </section>
        </div>
        
        <div className="mt-12 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
          <p className="text-[10px] text-slate-500 font-medium leading-normal italic">
            "Providing a seamless window into the sanctuary for all who cannot be there in person."
          </p>
        </div>
      </div>
    </div>
  );
}
