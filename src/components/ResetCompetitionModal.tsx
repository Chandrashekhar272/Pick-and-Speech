import React, { useState } from 'react';
import { RotateCcw, ShieldCheck, CheckCircle2, AlertTriangle, X, Lock, Check } from 'lucide-react';
import { Language } from '../types';
import { CHIEF_ADMIN_PASSWORD } from '../utils/onlineSync';

interface ResetCompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onConfirmReset: () => Promise<void> | void;
  participantCount: number;
}

export const ResetCompetitionModal: React.FC<ResetCompetitionModalProps> = ({
  isOpen,
  onClose,
  lang,
  onConfirmReset,
  participantCount
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    // If password provided, verify it matches chief admin
    if (password && password.trim() !== CHIEF_ADMIN_PASSWORD) {
      setError(lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ತಪ್ಪಾಗಿದೆ! (ಚೀಫ್ ಅಡ್ಮಿನ್ ಪಾಸ್‌ವರ್ಡ್: chandrusk@123)' : 'Invalid password! (Chief Admin Password: chandrusk@123)');
      return;
    }

    try {
      setIsProcessing(true);
      await onConfirmReset();
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPassword('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(lang === 'kn' ? 'ಮರುಹೊಂದಿಕೆ ವಿಫಲವಾಯಿತು, ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.' : 'Reset failed, please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border-2 border-amber-300 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center shadow-xs">
              <RotateCcw className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-lg font-black text-amber-950 font-serif-kannada">
                {lang === 'kn' ? 'ಸ್ಪರ್ಧಾ ಸುತ್ತು ಮರುಹೊಂದಿಕೆ (Reset Round)' : 'Reset Competition Round'}
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                {lang === 'kn' ? 'ಅಂಕಗಳು, ಚೀಟಿಗಳು & ಲೈವ್ ಸಿಂಕ್ ಮರುಹೊಂದಿಕೆ' : 'Reset scores, chits & live sync'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in fade-in zoom-in-90">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-stone-900 font-serif-kannada">
              {lang === 'kn' ? 'ಯಶಸ್ವಿಯಾಗಿ ಮರುಹೊಂದಿಸಲಾಗಿದೆ!' : 'Successfully Reset!'}
            </h4>
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              {lang === 'kn'
                ? 'ಎಲ್ಲಾ ಅಂಕಗಳು ಮತ್ತು ಚೀಟಿಗಳು ಮರುಹೊಂದಿಸಲ್ಪಟ್ಟಿವೆ. ಸ್ಪರ್ಧಿಗಳ ಹೆಸರುಗಳು ಸುರಕ್ಷಿತವಾಗಿವೆ.'
                : 'All scores and chits have been reset. Participant names are preserved.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="mt-5 space-y-4">
            
            {/* Guarantee Box: Participant Names Preserved */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                  {lang === 'kn' ? '✓ ಸ್ಪರ್ಧಿಗಳ ಹೆಸರುಗಳು ಅಳಿಸಿಹೋಗುವುದಿಲ್ಲ (Safe)' : '✓ Participant Names Preserved'}
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  {lang === 'kn' 
                    ? `ನೋಂದಾಯಿಸಲಾದ ಎಲ್ಲಾ ${participantCount} ಸ್ಪರ್ಧಿಗಳ ಹೆಸರುಗಳು, ಚೆಸ್ಟ್ ಸಂಖ್ಯೆಗಳು ಹಾಗೇ ಇರುತ್ತವೆ. (ಬೇಡವಾದ ಹೆಸರುಗಳನ್ನು ನೀವು ಮ್ಯಾನುಯಲ್ ಆಗಿ ಡಿಲೀಟ್ ಮಾಡಬಹುದು).`
                    : `All ${participantCount} participant names and chest numbers remain intact. You can manually delete any participant if needed.`}
                </p>
              </div>
            </div>

            {/* Detailed What Gets Reset List */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5 font-serif-kannada">
                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                <span>{lang === 'kn' ? 'ಈ ಕೆಳಗಿನವುಗಳು ಮಾತ್ರ ಮರುಹೊಂದಿಸಲ್ಪಡುತ್ತವೆ:' : 'The following will be reset:'}</span>
              </div>
              <ul className="text-xs text-stone-700 space-y-1.5 pl-5 list-disc font-serif-kannada">
                <li>
                  <strong className="text-stone-900">{lang === 'kn' ? '೪ ತೀರ್ಪುಗಾರರ ಅಂಕಗಳು' : 'All 4 Judges Scores'}</strong>: {lang === 'kn' ? 'ಎಲ್ಲಾ ಸ್ಪರ್ಧಿಗಳ ಅಂಕಗಳು ಶೂನ್ಯಗೊಳ್ಳುತ್ತವೆ (Scores cleared).' : 'All scores cleared.'}
                </li>
                <li>
                  <strong className="text-stone-900">{lang === 'kn' ? 'ಬಳಸಿದ ಅದೃಷ್ಟ ಚೀಟಿಗಳು' : 'Used Topics & Chits'}</strong>: {lang === 'kn' ? 'ಬಳಸಿದ ಎಲ್ಲಾ ವಿಷಯಗಳು ಮರುಬಳಕೆಗೆ ಮುಕ್ತವಾಗುತ್ತವೆ.' : 'All topics unpicked and fresh.'}
                </li>
                <li>
                  <strong className="text-stone-900">{lang === 'kn' ? 'ಅಡ್ಮಿನ್ & ಲೈವ್ ಸಿಂಕ್' : 'Admin & Live Sync'}</strong>: {lang === 'kn' ? 'ಸರ್ವರ್ ಸ್ಟೇಟ್ ಮತ್ತು ರಿಸಲ್ಟ್ ಶೀಟ್ ಹೊಸ ಸುತ್ತಿಗೆ ಸಿದ್ಧಗೊಳ್ಳುತ್ತದೆ.' : 'Server and consolidated results refreshed.'}
                </li>
              </ul>
            </div>

            {/* Chief Admin Passcode Optional/Safety Check */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'kn' ? 'ಮುಖ್ಯ ಅಡ್ಮಿನ್ ಪಾಸ್‌ವರ್ಡ್ (Chief Admin Password):' : 'Chief Admin Password:'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="chandrusk@123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                {lang === 'kn' ? 'ಚೀಫ್ ಅಡ್ಮಿನ್ ಪಾಸ್‌ವರ್ಡ್: chandrusk@123' : 'Chief Admin Password: chandrusk@123'}
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 rounded-xl transition"
              >
                {lang === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2 text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white rounded-xl shadow-md transition flex items-center gap-2 font-serif-kannada disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>
                  {isProcessing 
                    ? (lang === 'kn' ? 'ಮರುಹೊಂದಿಸಲಾಗುತ್ತಿದೆ...' : 'Resetting...') 
                    : (lang === 'kn' ? 'ಅಂಕ & ಚೀಟಿಗಳನ್ನು ಮರುಹೊಂದಿಸಿ' : 'Confirm Reset Round')}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
