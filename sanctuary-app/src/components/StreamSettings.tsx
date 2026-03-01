import { useState } from 'react';
import { sendCommand } from '../lib/pocketbase';

export function StreamSettings() {
  const [service, setService] = useState('YouTube - RTMPS');
  const [server, setServer] = useState('auto');
  const [key, setKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) {
      setMessage({ text: 'Stream Key is required', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await sendCommand('SET_STREAM_SETTINGS', {
        service,
        server,
        key
      });
      setMessage({ text: 'Settings pushed to station!', type: 'success' });
      setKey(''); 
    } catch (error) {
      setMessage({ text: 'Failed to update settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 mt-8 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
        <div className="p-2 bg-indigo-600/20 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-indigo-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.128 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m2.786 14.242-.513-1.41m-14.095-5.128-.513-1.41m14.481-2.025-1.15.964m-11.49 9.642-1.15.964m7.071-9.411-.75 1.3m7.5 12.99-.75 1.3" />
          </svg>
        </div>
        Integration Profiles
      </h3>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Streaming Platform</label>
            <select 
              value={service} 
              onChange={(e) => setService(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="YouTube - RTMPS">YouTube Live</option>
              <option value="Twitch">Twitch</option>
              <option value="Facebook Live">Facebook Live</option>
              <option value="Restream.io">Restream.io</option>
              <option value="Custom">Custom RTMP Endpoint</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stream Key (Secret)</label>
            <input 
              type="password" 
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {service === 'Custom' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">RTMP Server URL</label>
            <input 
              type="text" 
              value={server}
              onChange={(e) => setServer(e.target.value)}
              placeholder="rtmp://custom.server.com/live"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="text-xs text-slate-500 max-w-[60%] font-medium">
            💡 Applying these settings will instantly update the station's broadcast configuration.
          </div>
          <button 
            type="submit" 
            disabled={saving}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200 disabled:opacity-50 uppercase tracking-widest text-xs flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Syncing
              </>
            ) : 'Push to Station'}
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-bottom-2 duration-300 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
                </svg>
              )}
              {message.text}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
