import React, { useState } from 'react';
import { UserPlus, X, Check, Award, AlertCircle } from 'lucide-react';
import { Participant, Language } from '../types';

interface ParticipantRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  existingParticipants: Participant[];
  onRegister: (newParticipant: Participant) => void;
}

export const ParticipantRegistrationModal: React.FC<ParticipantRegistrationModalProps> = ({
  isOpen,
  onClose,
  lang,
  existingParticipants,
  onRegister
}) => {
  // Suggest next available chest number
  const maxChestNo = existingParticipants.reduce((max, p) => Math.max(max, p.chestNo || 0), 0);
  const nextSuggestedChest = maxChestNo > 0 ? maxChestNo + 1 : 1;

  const [chestNo, setChestNo] = useState<number>(nextSuggestedChest);
  const [name, setName] = useState<string>('');
  const [schoolOrPlace, setSchoolOrPlace] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      const nextNo = existingParticipants.reduce((max, p) => Math.max(max, p.chestNo || 0), 0) + 1;
      setChestNo(nextNo);
      setName('');
      setSchoolOrPlace('');
      setError(null);
    }
  }, [isOpen, existingParticipants]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(lang === 'kn' ? 'ದಯವಿಟ್ಟು ಸ್ಪರ್ಧಿಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ' : 'Please enter participant name');
      return;
    }

    if (!chestNo || chestNo <= 0) {
      setError(lang === 'kn' ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಚೆಸ್ಟ್ ನಂಬರ್ ನಮೂದಿಸಿ' : 'Please enter valid chest number');
      return;
    }

    // Check if chest number is already taken
    const exists = existingParticipants.some(p => p.chestNo === chestNo);
    if (exists) {
      setError(
        lang === 'kn'
          ? `ಚೆಸ್ಟ್ #${chestNo} ಈಗಾಗಲೇ ನೋಂದಣಿಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಬೇರೆ ಸಂಖ್ಯೆ ನೀಡಿ.`
          : `Chest #${chestNo} is already registered. Please choose another.`
      );
      return;
    }

    const newParticipant: Participant = {
      id: `p-${Date.now()}`,
      chestNo,
      name: name.trim(),
      schoolOrClass: schoolOrPlace.trim() || (lang === 'kn' ? 'ಮೈಸೂರು' : 'Mysuru'),
      status: 'waiting'
    };

    onRegister(newParticipant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border-2 border-amber-300 shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <UserPlus className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="text-lg font-black font-serif-kannada leading-tight">
                {lang === 'kn' ? 'ಹೊಸ ಸ್ಪರ್ಧಿ ನೋಂದಣಿ' : 'Participant Registration'}
              </h3>
              <p className="text-xs text-amber-200">
                {lang === 'kn' ? 'ಆಶುಭಾಷಣ ಸ್ಪರ್ಧೆಗೆ ನೋಂದಣಿ ಫಾರ್ಮ್' : 'Extempore Speech Competition'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {lang === 'kn' ? 'ಚೆಸ್ಟ್ ನಂಬರ್ (Chest Number) *' : 'Chest Number *'}
            </label>
            <input
              type="number"
              min="1"
              max="999"
              value={chestNo}
              onChange={(e) => setChestNo(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-stone-900 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {lang === 'kn' ? 'ಸ್ಪರ್ಧಿಯ ಪೂರ್ಣ ಹೆಸರು (Participant Name) *' : 'Participant Full Name *'}
            </label>
            <input
              type="text"
              placeholder={lang === 'kn' ? 'ಉದಾ: ಸ್ಪಂದನಾ ಗೌಡ' : 'e.g. Spandana Gowda'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-stone-900 text-sm"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {lang === 'kn' ? 'ಊರು / ತಾಲೂಕು / ಶಾಲೆ (Place / School / Taluk)' : 'Place / School / District'}
            </label>
            <input
              type="text"
              placeholder={lang === 'kn' ? 'ಉದಾ: ಮೈಸೂರು / ಹಾಸನ / ಶಿವಮೊಗ್ಗ' : 'e.g. Mysuru / Hassan'}
              value={schoolOrPlace}
              onChange={(e) => setSchoolOrPlace(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 text-sm"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-amber-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition"
            >
              {lang === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-sm flex items-center gap-1.5 transition"
            >
              <Check className="w-4 h-4" />
              <span>{lang === 'kn' ? 'ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ' : 'Save & Register'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
