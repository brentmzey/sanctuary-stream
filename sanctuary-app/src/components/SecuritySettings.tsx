import { useState } from 'react';
import { pb } from '../lib/pocketbase';

export function SecuritySettings() {
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await pb.collection('users').requestEmailChange(newEmail);
      setSuccessMsg('Confirmation link sent to ' + newEmail + '. Please check your inbox.');
      setNewEmail('');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request email change.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const email = pb.authStore.model?.email;
    if (!email) return;

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await pb.collection('users').requestPasswordReset(email);
      setSuccessMsg('Password reset link sent to your current email.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-32 h-32">
             <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
           </svg>
        </div>

        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-indigo-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          Security Protocol & Access
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Update Communication Channel</h4>
            <form onSubmit={handleEmailChange} className="space-y-4">
              <div className="relative">
                <input 
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new-email@church.com"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600 font-bold"
                />
              </div>
              <button 
                type="submit"
                disabled={loading || !newEmail}
                className="w-full py-3 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-600/20 hover:border-indigo-500 text-indigo-400 hover:text-white font-black rounded-xl transition-all duration-300 disabled:opacity-30 text-[10px] uppercase tracking-widest"
              >
                Request Email Change
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Key Rotation</h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              If you suspect your access key has been compromised, initiate a secure rotation sequence. A reset link will be dispatched to your primary email.
            </p>
            <button 
              onClick={handlePasswordReset}
              disabled={loading}
              className="w-full py-3 bg-rose-600/10 hover:bg-rose-600 border border-rose-600/20 hover:border-rose-500 text-rose-400 hover:text-white font-black rounded-xl transition-all duration-300 disabled:opacity-30 text-[10px] uppercase tracking-widest"
            >
              Rotate Access Key
            </button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full animate-pulse ${pb.authStore.model?.verified ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`}></div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-widest">
                  Status: {pb.authStore.model?.verified ? 'Verified & Encrypted' : 'Awaiting Verification'}
                </p>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                  Multi-Factor Authentication (MFA) is active for this account.
                </p>
              </div>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="mt-6 p-4 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-bottom-2 duration-300 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <div className="flex items-center gap-2">
              ✓ {successMsg}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-6 p-4 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-bottom-2 duration-300 bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <div className="flex items-center gap-2">
              ⚠ {errorMsg}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-indigo-600/5 border border-indigo-500/10">
        <div className="flex gap-4">
          <div className="p-2 bg-indigo-500/10 rounded-lg h-fit text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <div className="space-y-1">
            <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Security Advisory</h5>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Every authentication attempt triggers a <span className="text-indigo-400/80">Login Alert</span> to your registered email. Verification codes (OTP) expire after 5 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
