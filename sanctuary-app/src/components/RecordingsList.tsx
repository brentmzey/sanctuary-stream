import { useState, useEffect } from 'react';
import { getRecordings, RecordingRecord } from '../lib/pocketbase';

export function RecordingsList({ streamId }: { streamId: string }) {
  const [recordings, setRecordings] = useState<RecordingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecordings(streamId).unsafeRunAsync()
      .then(setRecordings)
      .finally(() => setLoading(false));
  }, [streamId]);

  if (loading) return <div className="loading-state"><div className="spinner-large"></div></div>;

  return (
    <div className="recordings-container space-y-4">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
        <span className="text-emerald-500">🎥</span> Recent Recordings
      </h2>
      
      {recordings.length === 0 ? (
        <div className="permission-notice">
          <p className="text-slate-400">No recordings found for this stream.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {recordings.map((rec) => (
            <div key={rec.id} className="metadata-item flex justify-between items-center group hover:bg-slate-800/80 transition-colors">
              <div>
                <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{rec.title}</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  {new Date(rec.created).toLocaleString()} • {(rec.size ? (rec.size / (1024 * 1024)).toFixed(2) : '0')} MB
                </p>
              </div>
              <a 
                href={`https://drive.google.com/file/d/${rec.file_id}/view`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-600/20 rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
              >
                View on Drive
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
