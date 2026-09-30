import React, { useState } from 'react';
import { UserPlus, X, Check, Award, AlertCircle, Trash2, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Participant, Language } from '../types';

interface ParticipantRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  existingParticipants: Participant[];
  onRegister: (newParticipant: Participant) => void;
  onDeleteParticipant?: (id: string) => void;
}

export const ParticipantRegistrationModal: React.FC<ParticipantRegistrationModalProps> = ({
  isOpen,
  onClose,
  lang,
  existingParticipants,
  onRegister,
  onDeleteParticipant
}) => {
  // Suggest next available chest number
  const maxChestNo = existingParticipants.reduce((max, p) => Math.max(max, p.chestNo || 0), 0);
  const nextSuggestedChest = maxChestNo > 0 ? maxChestNo + 1 : 1;

  const [chestNo, setChestNo] = useState<number>(nextSuggestedChest);
  const [name, setName] = useState<string>('');
  const [schoolOrPlace, setSchoolOrPlace] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showMembersList, setShowMembersList] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
      <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-amber-300 shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <UserPlus className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="text-lg font-black font-serif-kannada leading-tight">
                {lang === 'kn' ? 'ಹೊಸ ಸ್ಪರ್ಧಿ ನೋಂದಣಿ & ಸದಸ್ಯರ ನಿರ್ವಹಣೆ' : 'Participant Registration & Management'}
              </h3>
              <p className="text-xs text-amber-200">
                {lang === 'kn' ? `ಸ್ಪರ್ಧಿಗಳನ್ನು ಸೇರಿಸಿ ಅಥವಾ ತೆಗೆದುಹಾಕಿ (${existingParticipants.length} ಸದಸ್ಯರು)` : `Add or remove members (${existingParticipants.length} enrolled)`}
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

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
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
                {lang === 'kn' ? 'ಸ್ಥಳ / ಜಿಲ್ಲೆ / ವಿಭಾಗ (Place / District)' : 'Place / District'}
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

          {/* Existing Members Section with Remove functionality */}
          {existingParticipants.length > 0 && (
            <div className="px-6 pb-6 border-t border-stone-200 pt-4 bg-stone-50/60">
              <button
                type="button"
                onClick={() => setShowMembersList(!showMembersList)}
                className="w-full flex items-center justify-between text-left p-3 rounded-2xl bg-white border border-stone-200 hover:border-amber-300 transition shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold text-stone-800 font-serif-kannada">
                    {lang === 'kn'
                      ? `ನೋಂದಾಯಿತ ಸದಸ್ಯರನ್ನು ವೀಕ್ಷಿಸಿ / ತೆಗೆದುಹಾಕಿ (${existingParticipants.length} ಸದಸ್ಯರು)`
                      : `View / Remove Registered Members (${existingParticipants.length})`}
                  </span>
                </div>
                {showMembersList ? (
                  <ChevronUp className="w-4 h-4 text-stone-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-500" />
                )}
              </button>

              {showMembersList && (
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                  {existingParticipants.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-2 shadow-2xs hover:border-amber-200"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center font-mono shrink-0">
                          #{p.chestNo}
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-bold text-stone-900 font-serif-kannada truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate">
                            {p.schoolOrClass}
                          </p>
                        </div>
                      </div>

                      {onDeleteParticipant && (
                        confirmDeleteId === p.id ? (
                          <div className="flex items-center gap-1 shrink-0 animate-in fade-in">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteParticipant(p.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                              title={lang === 'kn' ? 'ಖಚಿತವಾಗಿ ತೆಗೆದುಹಾಕಿ' : 'Confirm delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{lang === 'kn' ? 'ಖಚಿತ (Delete)' : 'Confirm'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold"
                              title={lang === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(p.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition flex items-center gap-1 shrink-0"
                            title={lang === 'kn' ? 'ಈ ಸದಸ್ಯರನ್ನು ತೆಗೆದುಹಾಕಿ' : 'Remove this member'}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>{lang === 'kn' ? 'ತೆಗೆದುಹಾಕಿ' : 'Remove'}</span>
                          </button>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
