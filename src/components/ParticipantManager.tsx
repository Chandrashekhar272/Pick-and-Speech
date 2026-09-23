import React, { useState } from 'react';
import { 
  UserPlus, 
  Users, 
  Trash2, 
  Play, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Clock, 
  BookOpen,
  Edit2
} from 'lucide-react';
import { Participant, Topic, Language, JudgeScore } from '../types';

interface ParticipantManagerProps {
  lang: Language;
  participants: Participant[];
  onAddParticipant: (name: string, chestNo: number, schoolOrClass: string) => void;
  onDeleteParticipant: (id: string) => void;
  onSelectForSpeech: (participant: Participant) => void;
  onOpenScoreForParticipant: (participant: Participant) => void;
  onLoadSampleParticipants: () => void;
  onClearAllParticipants: () => void;
}

export const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  lang,
  participants,
  onAddParticipant,
  onDeleteParticipant,
  onSelectForSpeech,
  onOpenScoreForParticipant,
  onLoadSampleParticipants,
  onClearAllParticipants
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [chestNo, setChestNo] = useState<number>(participants.length + 1);
  const [schoolOrClass, setSchoolOrClass] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddParticipant(name.trim(), chestNo, schoolOrClass.trim() || (lang === 'kn' ? '೮ನೇ ತರಗತಿ' : 'Class 8'));
    setName('');
    setSchoolOrClass('');
    setChestNo(prev => prev + 1);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              {lang === 'kn' ? 'ಸ್ಪರ್ಧಿಗಳ ನಿರ್ವಹಣೆ' : 'Participant Management'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {lang === 'kn'
              ? 'ಸ್ಪರ್ಧೆಯಲ್ಲಿ ಭಾಗವಹಿಸುವ ವಿದ್ಯಾರ್ಥಿಗಳ ವಿವರ, ಚೀಟಿ ಮತ್ತು ಅಂಕಗಳ ವಿವರ'
              : 'Manage student speakers, track drawn topics, and record judging scores.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {participants.length === 0 && (
            <button
              onClick={onLoadSampleParticipants}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'kn' ? 'ಮಾದರಿ ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ಸೇರಿಸಿ' : 'Load Sample Students'}</span>
            </button>
          )}

          <button
            id="add-participant-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-xs transition flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>{lang === 'kn' ? 'ಹೊಸ ಸ್ಪರ್ಧಿ ಸೇರಿಸಿ' : 'Add Participant'}</span>
          </button>

          {participants.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm(lang === 'kn' ? 'ಎಲ್ಲಾ ಸ್ಪರ್ಧಿಗಳ ಪಟ್ಟಿಯನ್ನು ತೆರವುಗೊಳಿಸಬೇಕೇ?' : 'Clear all participants?')) {
                  onClearAllParticipants();
                }
              }}
              className="px-3 py-2 rounded-xl text-xs font-medium text-stone-500 hover:text-rose-600 border border-stone-200 hover:border-rose-200 transition"
            >
              {lang === 'kn' ? 'ಎಲ್ಲಾ ತೆರವುಗೊಳಿಸಿ' : 'Clear All'}
            </button>
          )}
        </div>
      </div>

      {/* Add Participant Modal / Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-amber-50/80 rounded-3xl p-6 border border-amber-300 shadow-sm space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-amber-950">
            {lang === 'kn' ? 'ಹೊಸ ಸ್ಪರ್ಧಿಯ ವಿವರ ದಾಖಲಿಸಿ' : 'Register New Participant'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === 'kn' ? 'ಚೆಸ್ಟ್ ನಂಬರ್ (Chest No):' : 'Chest Number:'}
              </label>
              <input
                type="number"
                min="1"
                required
                value={chestNo}
                onChange={(e) => setChestNo(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು:' : 'Student Name:'}
              </label>
              <input
                type="text"
                required
                placeholder={lang === 'kn' ? 'ಉದಾ: ಸ್ಪಂದನಾ ಗೌಡ' : 'e.g., Spandana Gowda'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === 'kn' ? 'ಶಾಲೆ / ತರಗತಿ:' : 'Class / School:'}
              </label>
              <input
                type="text"
                placeholder={lang === 'kn' ? 'ಉದಾ: ೮ನೇ ತರಗತಿ, ಜಿ.ಹೆಚ್.ಪಿ.ಎಸ್' : 'e.g., Class 8, GHPS'}
                value={schoolOrClass}
                onChange={(e) => setSchoolOrClass(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-800"
            >
              {lang === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-700 text-white hover:bg-amber-800 shadow-xs"
            >
              {lang === 'kn' ? 'ಸೇರಿಸಿ' : 'Add Student'}
            </button>
          </div>
        </form>
      )}

      {/* Participants List */}
      {participants.length > 0 ? (
        <div className="bg-white rounded-3xl border border-amber-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-amber-50/70 border-b border-amber-100 text-stone-600 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">{lang === 'kn' ? 'ಚೆಸ್ಟ್ ನಂ.' : 'Chest #'}</th>
                  <th className="py-3 px-4">{lang === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿ ಹೆಸರು' : 'Name'}</th>
                  <th className="py-3 px-4">{lang === 'kn' ? 'ಶಾಲೆ / ತರಗತಿ' : 'Class / School'}</th>
                  <th className="py-3 px-4">{lang === 'kn' ? 'ಆಯ್ಕೆಯಾದ ವಿಷಯ' : 'Assigned Topic'}</th>
                  <th className="py-3 px-4">{lang === 'kn' ? 'ಅಂಕ (೫೦ ರಲ್ಲಿ)' : 'Score (/50)'}</th>
                  <th className="py-3 px-4 text-right">{lang === 'kn' ? 'ಕ್ರಮಗಳು' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {participants.map((p) => {
                  const hasScored = !!p.scores;
                  return (
                    <tr key={p.id} className="hover:bg-amber-50/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-900">
                        #{p.chestNo}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-stone-900">
                        {p.name}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {p.schoolOrClass}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.assignedTopic ? (
                          <div className="flex items-center gap-1.5 text-stone-800">
                            <span className="font-bold font-mono text-amber-700 text-xs">#{p.assignedTopic.number}</span>
                            <span className="line-clamp-1 max-w-xs font-medium">
                              {lang === 'kn' ? p.assignedTopic.titleKn : p.assignedTopic.titleEn}
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic text-xs">
                            {lang === 'kn' ? 'ಚೀಟಿ ಎತ್ತಿಲ್ಲ' : 'Not drawn yet'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {hasScored ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold font-mono text-xs">
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{p.scores?.total} / 50</span>
                          </div>
                        ) : (
                          <span className="text-stone-400 text-xs font-medium">
                            {lang === 'kn' ? 'ಅಂಕ ನೀಡಿಲ್ಲ' : 'Pending'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Select for speech / timer */}
                          <button
                            onClick={() => onSelectForSpeech(p)}
                            title={lang === 'kn' ? 'ವೇದಿಕೆಗೆ ಕರೆಯಿರಿ (ಗಡಿಯಾರ ಆರಂಭಿಸಿ)' : 'Send to Stage & Timer'}
                            className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium text-xs flex items-center gap-1 transition"
                          >
                            <Play className="w-3.5 h-3.5 fill-amber-900" />
                            <span className="hidden md:inline">{lang === 'kn' ? 'ವೇದಿಕೆ' : 'Stage'}</span>
                          </button>

                          {/* Score Button */}
                          <button
                            onClick={() => onOpenScoreForParticipant(p)}
                            title={lang === 'kn' ? 'ತೀರ್ಪುಗಾರರ ಅಂಕ ನೀಡಿ' : 'Judge Score'}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs flex items-center gap-1 transition"
                          >
                            <Award className="w-3.5 h-3.5 text-stone-600" />
                            <span className="hidden md:inline">{lang === 'kn' ? 'ಅಂಕ' : 'Score'}</span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDeleteParticipant(p.id)}
                            title={lang === 'kn' ? 'ತೆಗೆದುಹಾಕಿ' : 'Delete'}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 border border-dashed border-stone-300 text-center flex flex-col items-center justify-center">
          <Users className="w-12 h-12 text-stone-300 mb-3" />
          <h4 className="text-base font-bold text-stone-800">
            {lang === 'kn' ? 'ಯಾವುದೇ ಸ್ಪರ್ಧಿಗಳನ್ನು ಸೇರಿಸಿಲ್ಲ' : 'No Participants Registered'}
          </h4>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mt-1">
            {lang === 'kn'
              ? 'ಹೊಸ ಸ್ಪರ್ಧಿಯನ್ನು ಸೇರಿಸಿ ಅಥವಾ ತ್ವರಿತವಾಗಿ ಪರೀಕ್ಷಿಸಲು "ಮಾದರಿ ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ಸೇರಿಸಿ" ಬಟನ್ ಒತ್ತಿ.'
              : 'Add participants manually or click "Load Sample Students" to quickly populate the list.'}
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={onLoadSampleParticipants}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 shadow-xs"
            >
              {lang === 'kn' ? 'ಮಾದರಿ ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ಸೇರಿಸಿ' : 'Load Sample Students'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
