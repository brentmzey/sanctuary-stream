import { useState, FormEvent } from 'react';
import { pb } from '../lib/pocketbase';
import { useTheme } from '../lib/ThemeContext';

interface LoginFormProps {
  onSuccess: () => void;
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="absolute top-4 right-4 z-50 flex gap-1 p-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
      <button 
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-white text-indigo-900 shadow-sm' : 'text-white hover:bg-white/10'}`}
        title="Light Mode"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
      </button>
      <button 
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md transition-all ${theme === 'dark' ? 'bg-slate-800 text-indigo-400 shadow-sm' : 'text-white hover:bg-white/10'}`}
        title="Dark Mode"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
        </svg>
      </button>
      <button 
        onClick={() => setTheme('system')}
        className={`p-2 rounded-md transition-all ${theme === 'system' ? 'bg-indigo-600 text-white shadow-sm' : 'text-white hover:bg-white/10'}`}
        title="System Preference"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
        </svg>
      </button>
    </div>
  );
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { resolvedTheme } = useTheme();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await pb.collection('users').authWithPassword(email, password);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${resolvedTheme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      <ThemeToggle />

      {/* Cyber Background Layer 1: The Matrix/Grid (Gentle Parallax) */}
      <div 
        className="absolute inset-[-10%] opacity-[0.05] dark:opacity-[0.1] pointer-events-none animate-parallax-slow"
        style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1.5px, transparent 0)`,
          backgroundSize: '50px 50px',
        }}
      ></div>

      {/* Cyber Background Layer 2: Dripping Strands (Pronounced & High Contrast) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(24)].map((_, i) => (
          <div 
            key={i}
            className={`absolute w-[1.5px] ${i % 3 === 0 ? 'bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent' : 'bg-gradient-to-b from-transparent via-indigo-500/40 to-transparent'}`}
            style={{
              left: `${(i * 4.2) + Math.random() * 2}%`,
              height: '100%',
              top: '-100%',
              animation: `drip ${4 + Math.random() * 8}s linear infinite`,
              animationDelay: `${Math.random() * 6}s`,
              opacity: 0.5 + Math.random() * 0.5
            }}
          >
            {/* Glowing Head */}
            <div className={`absolute bottom-0 left-[-2.5px] w-2 h-3 rounded-full blur-[2px] shadow-lg ${i % 3 === 0 ? 'bg-cyan-300 shadow-cyan-500/50' : 'bg-indigo-300 shadow-indigo-500/50'}`}></div>
            {/* Trailing node */}
            <div className="absolute top-[20%] left-[-1.5px] w-1.5 h-1.5 bg-white/40 rounded-full blur-[1px]"></div>
          </div>
        ))}
      </div>

      {/* Cyber Background Layer 3: Floating Nodes (Gentle Parallax) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full blur-[80px] opacity-20 dark:opacity-30 mix-blend-screen animate-parallax-circles"
            style={{
              width: `${200 + Math.random() * 300}px`,
              height: `${200 + Math.random() * 300}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 ? '#6366f1' : '#06b6d4',
              animationDelay: `${-Math.random() * 20}s`,
              animationDuration: `${20 + Math.random() * 30}s`
            }}
          ></div>
        ))}
      </div>

      {/* Main Login Card */}
      <div className={`w-full max-w-md p-10 backdrop-blur-3xl border rounded-3xl shadow-2xl relative z-10 mx-4 transition-all duration-300 ${
        resolvedTheme === 'dark' 
          ? 'bg-slate-900/70 border-white/10 shadow-indigo-500/10' 
          : 'bg-white/70 border-slate-200 shadow-slate-200'
      }`}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-[2rem] mb-6 shadow-2xl shadow-indigo-500/40 relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-white relative z-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 0 1 0-5.303m5.304 0a3.75 3.75 0 0 1 0 5.303m-7.425 2.122a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500">
            Sanctuary Stream
          </h1>
          <p className={`${resolvedTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-semibold tracking-wide text-sm uppercase`}>
            Precision Control for Sacred Spaces
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-2xl animate-shake flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span className="font-bold">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className={`block text-[10px] font-black uppercase tracking-[0.2em] ${resolvedTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Email Channel</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pastor@church.com"
                required
                disabled={loading}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-bold ${
                  resolvedTheme === 'dark' 
                    ? 'bg-slate-800/40 border-slate-700 text-white placeholder-slate-600' 
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className={`block text-[10px] font-black uppercase tracking-[0.2em] ${resolvedTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Access Key</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-bold ${
                  resolvedTheme === 'dark' 
                    ? 'bg-slate-800/40 border-slate-700 text-white placeholder-slate-600' 
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-black rounded-2xl shadow-2xl shadow-indigo-600/30 transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden active:scale-[0.98]"
          >
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            {loading ? (
              <>
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="tracking-widest uppercase text-xs">Authenticating...</span>
              </>
            ) : (
              <>
                <span className="tracking-widest uppercase text-xs">Initiate Command</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className={`mt-10 p-6 rounded-2xl border transition-colors ${
          resolvedTheme === 'dark' ? 'bg-slate-800/20 border-white/5' : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-xl ${resolvedTheme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 ${resolvedTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Protocol: Sandbox</p>
              <code className={`text-xs font-mono break-all font-bold ${resolvedTheme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}`}>
                pastor@local.dev / pastor123456
              </code>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes drip {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(200vh); opacity: 0; }
        }
        @keyframes parallax-slow {
          0% { transform: translate(-2%, -2%) rotate(0deg); }
          50% { transform: translate(2%, 2%) rotate(0.5deg); }
          100% { transform: translate(-2%, -2%) rotate(0deg); }
        }
        @keyframes parallax-circles {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-parallax-slow {
          animation: parallax-slow 25s ease-in-out infinite;
        }
        .animate-parallax-circles {
          animation: parallax-circles 30s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
