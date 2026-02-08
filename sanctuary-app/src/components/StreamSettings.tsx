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
      setMessage({ text: 'Settings sent to OBS!', type: 'success' });
      setKey(''); // Clear sensitive data? Or keep it? Usually better to clear or mask.
    } catch (error) {
      setMessage({ text: 'Failed to update settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 mt-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <span>⚙️</span> Stream Integration Settings
      </h3>
      
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Platform</label>
          <select 
            value={service} 
            onChange={(e) => setService(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="YouTube - RTMPS">YouTube Live</option>
            <option value="Twitch">Twitch</option>
            <option value="Facebook Live">Facebook Live</option>
            <option value="Restream.io">Restream.io</option>
            <option value="Custom">Custom RTMP</option>
          </select>
        </div>

        {service === 'Custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Server URL</label>
            <input 
              type="text" 
              value={server}
              onChange={(e) => setServer(e.target.value)}
              placeholder="rtmp://..."
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Stream Key</label>
          <input 
            type="password" 
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Warning: Keep this secret!"
            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="pt-2">
            <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50 flex justify-center"
            >
                {saving ? 'Applying...' : 'Apply to OBS'}
            </button>
        </div>

        {message && (
          <div className={`text-sm p-2 rounded ${message.type === 'success' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
            {message.text}
          </div>
        )}
      </form>

      <div className="mt-4 text-xs text-gray-500">
        <p>💡 This will instantly update your OBS stream settings.</p>
        <p>Make sure OBS is running and connected.</p>
      </div>
    </div>
  );
}
