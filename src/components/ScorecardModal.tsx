import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle2, User, BookOpen } from 'lucide-react';
import { Participant, Topic, Language, JudgeScore } from '../types';

interface ScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  participant: Participant | null;
  topic: Topic | null;
  onSaveScore: (participantId: string, score: JudgeScore) => void;
}

export const ScorecardModal: React.FC<ScorecardModalProps> = ({
  isOpen,
  onClose,
  lang,
  participant,
  topic,
  onSaveScore
}) => {
  const [contentScore, setContentScore] = useState<number>(8);
  const [languageScore, setLanguageScore] = useState<number>(8);
  const [presentationScore, setPresentationScore] = useState<number>(8);
  const [timeScore, setTimeScore] = useState<number>(8);
  const [impactScore, setImpactScore] = useState<number>(8);
  const [remarks, setRemarks] = useState<string>('');

  useEffect(() => {
    if (participant?.scores) {
      setContentScore(participant.scores.content);
      setLanguageScore(participant.scores.language);
      setPresentationScore(participant.scores.presentation);
      setTimeScore(participant.scores.timeManagement);
      setImpactScore(participant.scores.impact);
      setRemarks(participant.scores.remarks || '');
    } else {
      setContentScore(8);
      setLanguageScore(8);
      setPresentationScore(8);
      setTimeScore(8);
      setImpactScore(8);
      setRemarks('');
    }
  }, [participant]);

  if (!isOpen) return null;

  const totalScore = contentScore + languageScore + presentationScore + timeScore + impactScore;

  const handleSave = () => {
    if (!participant) return;
    const finalScore: JudgeScore = {
      content: contentScore,
      language: languageScore,
      presentation: presentationScore,
      timeManagement: timeScore,
      impact: impactScore,
      total: totalScore,
      remarks: remarks.trim()
    };

    onSaveScore(participant.id, finalScore);
    onClose();
  };

  const criteria = [
    {
      id: 'content',
      labelKn: '೧. ವಿಷಯ ಜ್ಞಾನ & ಪರಿಕಲ್ಪನೆ',
      labelEn: '1. Content Knowledge & Subject Depth',
      descKn: 'ವಿಷಯದ ಸ್ಪಷ್ಟತೆ, ಮಾಹಿತಿ ಮತ್ತು ಹೊಸತನ',
      descEn: 'Relevance to topic, factual accuracy, clarity',
      value: contentScore,
      setter: setContentScore
    },
    {
      id: 'language',
      labelKn: '೨. ಭಾಷಾ ಶುದ್ಧತೆ & ನಿರರ್ಗಳತೆ',
      labelEn: '2. Language Fluency & Diction',
      descKn: 'ಸ್ಪಷ್ಟ ಉಚ್ಛಾರಣೆ, ಶಬ್ದ ಸಂಪತ್ತು ಮತ್ತು ವಾಕ್ಯ ರಚನೆ',
      descEn: 'Pronunciation, vocabulary, and smooth delivery',
      value: languageScore,
      setter: setLanguageScore
    },
    {
      id: 'presentation',
      labelKn: '೩. ಹಾವಭಾವ & ಆತ್ಮವಿಶ್ವಾಸ',
      labelEn: '3. Body Language & Confidence',
      descKn: 'ವೇದಿಕೆ ಉಪಸ್ಥಿತಿ, ಮುಖಭಾವ ಮತ್ತು ದೃಢತೆ',
      descEn: 'Eye contact, posture, composure on stage',
      value: presentationScore,
      setter: setPresentationScore
    },
    {
      id: 'time',
      labelKn: '೪. ಸಮಯ ಪಾಲನೆ',
      labelEn: '4. Time Management & Discipline',
      descKn: 'ನಿಗದಿತ ಸಮಯದಲ್ಲಿ ಭಾಷಣವನ್ನು ಸುಂದರವಾಗಿ ಮುಗಿಸುವುದು',
      descEn: 'Staying within the allotted speech limit',
      value: timeScore,
      setter: setTimeScore
    },
    {
      id: 'impact',
      labelKn: '೫. ಒಟ್ಟಾರೆ ಪ್ರಭಾವ & ಮುಕ್ತಾಯ',
      labelEn: '5. Overall Presentation & Impact',
      descKn: 'ಪ್ರೇಕ್ಷಕರ ಆಕರ್ಷಣೆ ಮತ್ತು ಪರಿಣಾಮಕಾರಿ ಸಂದೇಶ',
      descEn: 'Audience engagement, memorable conclusion',
      value: impactScore,
      setter: setImpactScore
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-amber-300 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {lang === 'kn' ? 'ತೀರ್ಪುಗಾರರ ಮೌಲ್ಯಮಾಪನ ಅಂಕಪಟ್ಟಿ' : 'Judges Evaluation Scorecard'}
              </h3>
              <p className="text-xs text-amber-100">
                {lang === 'kn' ? 'ಒಟ್ಟು ೫೦ ಅಂಕಗಳ ಮಾನದಂಡ' : 'Evaluated out of 50 total marks'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Participant & Topic Sub-Banner */}
        <div className="px-6 py-3 bg-amber-50/80 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-700" />
            <span className="font-semibold text-stone-700">
              {lang === 'kn' ? 'ಸ್ಪರ್ಧಿ:' : 'Speaker:'}
            </span>
            <span className="font-bold text-stone-900">
              {participant ? `#${participant.chestNo} - ${participant.name} (${participant.schoolOrClass})` : (lang === 'kn' ? 'ಸ್ಪರ್ಧಿ ಆಯ್ಕೆಯಾಗಿಲ್ಲ' : 'Unassigned')}
            </span>
          </div>

          {topic && (
            <div className="flex items-center gap-1.5 text-stone-600">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span className="truncate max-w-xs font-medium">
                #{topic.number}: {lang === 'kn' ? topic.titleKn : topic.titleEn}
              </span>
            </div>
          )}
        </div>

        {/* Body Scoring Criteria */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {criteria.map((c) => (
            <div key={c.id} className="bg-stone-50 p-3.5 sm:p-4 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">
                    {lang === 'kn' ? c.labelKn : c.labelEn}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    {lang === 'kn' ? c.descKn : c.descEn}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-xl border border-stone-300 font-mono font-bold text-sm sm:text-base text-amber-800">
                  <span>{c.value}</span>
                  <span className="text-xs text-stone-400 font-normal">/ 10</span>
                </div>
              </div>

              {/* Range Slider & Quick Number Buttons */}
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={c.value}
                  onChange={(e) => c.setter(parseFloat(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="hidden sm:flex items-center gap-1">
                  {[6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => c.setter(num)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                        c.value === num
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Remarks / Teacher Feedback */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {lang === 'kn' ? 'ತೀರ್ಪುಗಾರರ ಅಭಿಪ್ರಾಯ / ಸಲಹೆ (Remarks):' : 'Judge Remarks / Feedback:'}
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={lang === 'kn' ? 'ಉದಾ: ಅತ್ಯುತ್ತಮ ಆತ್ಮವಿಶ್ವಾಸ, ಸಮಯ ಪಾಲನೆ ಚೆನ್ನಾಗಿದೆ...' : 'e.g., Excellent confidence, clear diction...'}
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Footer with Total & Save */}
        <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-stone-600">
              {lang === 'kn' ? 'ಒಟ್ಟು ಅಂಕಗಳು:' : 'Total Score:'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-700">
                {totalScore}
              </span>
              <span className="text-xs sm:text-sm font-medium text-stone-500">
                / 50
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-800"
            >
              {lang === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
            </button>
            <button
              id="save-score-submit-button"
              onClick={handleSave}
              disabled={!participant}
              className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'kn' ? 'ಅಂಕಗಳನ್ನು ದಾಖಲಿಸಿ' : 'Save Score'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
