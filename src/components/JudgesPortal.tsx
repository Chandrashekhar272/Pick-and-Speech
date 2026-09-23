import React, { useState } from 'react';
import { 
  Award, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Save, 
  Sparkles, 
  AlertCircle,
  LogIn,
  LogOut,
  Sliders,
  FileCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { Participant, Topic, Language, JudgeScore, JudgeProfile } from '../types';

interface JudgesPortalProps {
  lang: Language;
  participants: Participant[];
  currentParticipant: Participant | null;
  onSelectParticipant: (participant: Participant) => void;
  onSaveScore: (participantId: string, score: JudgeScore) => void;
}

export const DEFAULT_JUDGES: JudgeProfile[] = [
  { id: 'judge-1', name: 'ತೀರ್ಪುಗಾರರು ೧ (Judge 1)', role: 'ಮುಖ್ಯ ತೀರ್ಪುಗಾರರು' },
  { id: 'judge-2', name: 'ತೀರ್ಪುಗಾರರು ೨ (Judge 2)', role: 'ಸಹ ತೀರ್ಪುಗಾರರು' },
  { id: 'judge-3', name: 'ತೀರ್ಪುಗಾರರು ೩ (Judge 3)', role: 'ಸಹ ತೀರ್ಪುಗಾರರು' },
  { id: 'judge-4', name: 'ತೀರ್ಪುಗಾರರು ೪ (Judge 4)', role: 'ಸಹ ತೀರ್ಪುಗಾರರು' }
];

const REQUIRED_JUDGE_PASSWORD = 'Anishsk@123';
const STORAGE_KEY_JUDGE_AUTH = 'parishath_judge_auth_v2';
const STORAGE_KEY_JUDGE_SESSION = 'active_judge_session_v2';

export const JudgesPortal: React.FC<JudgesPortalProps> = ({
  lang,
  participants,
  currentParticipant,
  onSelectParticipant,
  onSaveScore
}) => {
  // Authentication state - password protected
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_JUDGE_AUTH) === 'true';
  });

  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Judge Profile
  const [selectedProfileForLogin, setSelectedProfileForLogin] = useState<JudgeProfile>(DEFAULT_JUDGES[0]);
  const [activeJudge, setActiveJudge] = useState<JudgeProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_JUDGE_SESSION);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_JUDGES[0];
  });

  const [selectedParticipantId, setSelectedParticipantId] = useState<string>(() => {
    return currentParticipant ? currentParticipant.id : (participants[0]?.id || '');
  });

  const [searchQuery, setSearchQuery] = useState<string>('');

  // 5 Criteria State for currently selected participant
  const [contentScore, setContentScore] = useState<number>(8);
  const [languageScore, setLanguageScore] = useState<number>(8);
  const [presentationScore, setPresentationScore] = useState<number>(8);
  const [timeScore, setTimeScore] = useState<number>(8);
  const [impactScore, setImpactScore] = useState<number>(8);
  const [remarks, setRemarks] = useState<string>('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Handle Login submission with password
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === REQUIRED_JUDGE_PASSWORD) {
      setIsAuthenticated(true);
      setActiveJudge(selectedProfileForLogin);
      localStorage.setItem(STORAGE_KEY_JUDGE_AUTH, 'true');
      localStorage.setItem(STORAGE_KEY_JUDGE_SESSION, JSON.stringify(selectedProfileForLogin));
      setAuthError(null);
      setPasswordInput('');
    } else {
      setAuthError(
        lang === 'kn'
          ? '❌ ತಪ್ಪಾದ ಪಾಸ್‌ವರ್ಡ್! ದಯವಿಟ್ಟು ಸರಿಯಾದ ತೀರ್ಪುಗಾರರ ಪಾಸ್‌ವರ್ಡ್ (Anishsk@123) ನಮೂದಿಸಿ.'
          : '❌ Incorrect password! Please enter the designated judge password (Anishsk@123).'
      );
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveJudge(null);
    localStorage.removeItem(STORAGE_KEY_JUDGE_AUTH);
    localStorage.removeItem(STORAGE_KEY_JUDGE_SESSION);
    setPasswordInput('');
    setAuthError(null);
  };

  const handleSwitchJudge = (judge: JudgeProfile) => {
    setActiveJudge(judge);
    localStorage.setItem(STORAGE_KEY_JUDGE_SESSION, JSON.stringify(judge));
  };

  // Load participant's existing score when selection changes
  const targetParticipant = participants.find(p => p.id === selectedParticipantId) || participants[0] || null;

  React.useEffect(() => {
    const judgeKey = activeJudge?.id || 'judge-1';
    const specificScore = targetParticipant?.judgeScores?.[judgeKey] 
      || (targetParticipant?.scores?.judgeId === judgeKey ? targetParticipant.scores : null);

    if (specificScore) {
      setContentScore(specificScore.content);
      setLanguageScore(specificScore.language);
      setPresentationScore(specificScore.presentation);
      setTimeScore(specificScore.timeManagement);
      setImpactScore(specificScore.impact);
      setRemarks(specificScore.remarks || '');
    } else {
      setContentScore(8);
      setLanguageScore(8);
      setPresentationScore(8);
      setTimeScore(8);
      setImpactScore(8);
      setRemarks('');
    }
    setSubmittedMessage(null);
  }, [selectedParticipantId, targetParticipant, activeJudge]);

  const totalMarks = contentScore + languageScore + presentationScore + timeScore + impactScore;

  // Submit Score
  const handleSubmitScore = () => {
    if (!targetParticipant) return;

    const newScore: JudgeScore = {
      judgeId: activeJudge?.id || 'judge-1',
      judgeName: activeJudge?.name || 'ತೀರ್ಪುಗಾರರು',
      content: contentScore,
      language: languageScore,
      presentation: presentationScore,
      timeManagement: timeScore,
      impact: impactScore,
      total: totalMarks,
      remarks: remarks.trim(),
      timestamp: new Date().toLocaleTimeString('kn-IN')
    };

    onSaveScore(targetParticipant.id, newScore);
    setSubmittedMessage(
      lang === 'kn'
        ? `ಚೆಸ್ಟ್ #${targetParticipant.chestNo} (${targetParticipant.name}) ರವರ ಅಂಕಗಳು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿವೆ!`
        : `Scores for Chest #${targetParticipant.chestNo} successfully saved!`
    );

    setTimeout(() => {
      setSubmittedMessage(null);
    }, 4000);
  };

  // Move to next participant
  const handleNextParticipant = () => {
    if (!targetParticipant) return;
    const currentIndex = participants.findIndex(p => p.id === targetParticipant.id);
    if (currentIndex >= 0 && currentIndex < participants.length - 1) {
      const nextP = participants[currentIndex + 1];
      setSelectedParticipantId(nextP.id);
      onSelectParticipant(nextP);
    }
  };

  // Criteria definitions
  const criteria = [
    {
      id: 'crit-content',
      labelKn: '೧. ವಿಷಯ ಜ್ಞಾನ & ಪರಿಕಲ್ಪನೆ (Content Knowledge)',
      labelEn: '1. Content Depth & Subject Relevance',
      descKn: 'ವಿಷಯದ ಸ್ಪಷ್ಟತೆ, ಮಾಹಿತಿ, ಐತಿಹಾಸಿಕ ಗ್ರಹಿಕೆ ಮತ್ತು ಹೊಸತನ',
      descEn: 'Factual accuracy, understanding, and topical depth',
      value: contentScore,
      setter: setContentScore
    },
    {
      id: 'crit-language',
      labelKn: '೨. ಭಾಷಾ ಶುದ್ಧತೆ & ನಿರರ್ಗಳತೆ (Fluency & Diction)',
      labelEn: '2. Language Fluency & Pronunciation',
      descKn: 'ಶುದ್ಧ ಉಚ್ಚಾರಣೆ, ವ್ಯಾಕರಣ, ಶಬ್ದ ಸಂಪತ್ತು ಮತ್ತು ವಾಕ್ಚಾತುರ್ಯ',
      descEn: 'Grammatical correctness, vocabulary, and smooth delivery',
      value: languageScore,
      setter: setLanguageScore
    },
    {
      id: 'crit-presentation',
      labelKn: '೩. ಹಾವಭಾವ & ವೇದಿಕೆ ಉಪಸ್ಥಿತಿ (Body Language)',
      labelEn: '3. Body Language & Stage Confidence',
      descKn: 'ಆತ್ಮವಿಶ್ವಾಸ, ಕಣ್ಣಿನ ಸಂಪರ್ಕ, ಮುಖಭಾವ ಮತ್ತು ಶಿಸ್ತು',
      descEn: 'Eye contact, composure, gestures, and presence',
      value: presentationScore,
      setter: setPresentationScore
    },
    {
      id: 'crit-time',
      labelKn: '೪. ಸಮಯ ಪಾಲನೆ & ಮುಕ್ತಾಯ (Time Discipline)',
      labelEn: '4. Time Management & Discipline',
      descKn: 'ನಿಗದಿತ ೩ ನಿಮಿಷ ಭಾಷಣದ ಸಮಯದಲ್ಲಿ ಭಾಷಣವನ್ನು ಸುಂದರವಾಗಿ ಮುಗಿಸುವುದು',
      descEn: 'Strict adherence to 3-minute speech time limit',
      value: timeScore,
      setter: setTimeScore
    },
    {
      id: 'crit-impact',
      labelKn: '೫. ಒಟ್ಟಾರೆ ಪ್ರಭಾವ & ಸಂದೇಶ (Overall Impact)',
      labelEn: '5. Overall Impact & Moral Value',
      descKn: 'ಸಭಿಕರ ಮೇಲೆ ಬೀರಿದ ಪ್ರಭಾವ, ಸಾರ್ಥಕ ಸಂದೇಶ ಮತ್ತು ಆಕರ್ಷಣೆ',
      descEn: 'Audience engagement, inspiration, and takeaway',
      value: impactScore,
      setter: setImpactScore
    }
  ];

  // Filter participants for search
  const filteredParticipants = participants.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.chestNo.toString().includes(searchQuery) ||
    p.schoolOrClass.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If not authenticated, render Password Login Screen
  if (!isAuthenticated || !activeJudge) {
    return (
      <div className="max-w-md mx-auto my-8 bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-xs">
          <ShieldCheck className="w-8 h-8 text-amber-700" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-serif-kannada">
          {lang === 'kn' ? 'ತೀರ್ಪುಗಾರರ ಅಧಿಕೃತ ಲಾಗಿನ್' : 'Judges Evaluation Login'}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1.5 mb-6">
          {lang === 'kn'
            ? 'ಸ್ಪರ್ಧಿಗಳ ಮೌಲ್ಯಮಾಪನ ಅಂಕಗಳನ್ನು ದಾಖಲಿಸಲು ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆರಿಸಿ ಮತ್ತು ನಿಗದಿತ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.'
            : 'Select your judge role and enter the authorized password to access evaluation.'}
        </p>

        <form onSubmit={handlePasswordSubmit} className="space-y-5 text-left">
          {/* Select Judge Profile */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2 font-serif-kannada">
              {lang === 'kn' ? 'ತೀರ್ಪುಗಾರರ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ:' : 'Select Judge Profile:'}
            </label>
            <div className="space-y-2">
              {DEFAULT_JUDGES.map((judge) => {
                const isSelected = selectedProfileForLogin.id === judge.id;
                return (
                  <button
                    type="button"
                    key={judge.id}
                    onClick={() => setSelectedProfileForLogin(judge)}
                    className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                      isSelected 
                        ? 'border-amber-600 bg-amber-50/90 ring-2 ring-amber-500/20' 
                        : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100'
                    }`}
                  >
                    <div>
                      <h4 className={`text-sm font-bold font-serif-kannada ${isSelected ? 'text-amber-950' : 'text-stone-800'}`}>
                        {judge.name}
                      </h4>
                      <span className="text-xs text-stone-500">{judge.role}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 font-serif-kannada">
              {lang === 'kn' ? 'ಲಾಗಿನ್ ಪಾಸ್‌ವರ್ಡ್ (Password):' : 'Judge Login Password:'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="judge-password-input"
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError(null);
                }}
                placeholder="ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ..."
                className="w-full pl-9 pr-10 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-mono"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {authError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="judge-login-btn"
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95 font-serif-kannada"
          >
            <Lock className="w-4 h-4" />
            <span>{lang === 'kn' ? 'ಲಾಗಿನ್ ಮಾಡಿ (Join as Judge)' : 'Login as Judge'}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-stone-200 text-center">
          <p className="text-[11px] text-stone-500">
            {lang === 'kn' 
              ? 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್ (ರಿ) ಮೈಸೂರು • ಆಶುಭಾಷಣ ಸ್ಪರ್ಧಾ ಮೌಲ್ಯಮಾಪನ' 
              : 'Karnataka State Teachers Talent Council • Extempore Evaluation'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Judge Status Header Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-xs">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-200">
                {lang === 'kn' ? 'ತೀರ್ಪುಗಾರರ ಲಾಗಿನ್ ಆಗಿದೆ' : 'Judges Logged In'}
              </span>
              <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                {activeJudge.role}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-amber-950 font-serif-kannada mt-0.5">
              {activeJudge.name}
            </h2>
          </div>
        </div>

        {/* Quick Switch Judge or Logout */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="hidden sm:flex items-center gap-1 bg-amber-50 p-1 rounded-xl border border-amber-200 text-xs">
            {DEFAULT_JUDGES.map((j) => (
              <button
                key={j.id}
                onClick={() => handleSwitchJudge(j)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  activeJudge.id === j.id
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-amber-900 hover:bg-amber-200/50'
                }`}
              >
                {j.name.split(' ')[0]} {j.name.split(' ')[1]}
              </button>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition"
            title="ಲಾಕ್ ಮಾಡಿ ಮತ್ತು ಲಾಗ್ ಔಟ್"
          >
            <LogOut className="w-3.5 h-3.5 text-stone-500" />
            <span>{lang === 'kn' ? 'ಲಾಗ್ ಔಟ್ (Lock)' : 'Logout'}</span>
          </button>
        </div>
      </div>

      {/* Main Judges Layout: Left Participant Sidebar, Right 5-Criteria Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Participant List & Selection (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-amber-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-700" />
              <h3 className="font-bold text-stone-900 font-serif-kannada text-sm sm:text-base">
                {lang === 'kn' ? 'ಸ್ಪರ್ಧಿಗಳ ಪಟ್ಟಿ' : 'Participants'}
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
              {participants.length}
            </span>
          </div>

          {/* Search bar */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'kn' ? 'ಹೆಸರು / ಚೆಸ್ಟ್ ಸಂಖ್ಯೆ ಹುಡುಕಿ...' : 'Search participant...'}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
          />

          {/* Participants Scroll List */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {filteredParticipants.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500">
                {lang === 'kn' ? 'ಯಾವುದೇ ಸ್ಪರ್ಧಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No participants found'}
              </div>
            ) : (
              filteredParticipants.map((p) => {
                const isSelected = p.id === selectedParticipantId;
                const hasScore = !!p.scores;

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedParticipantId(p.id);
                      onSelectParticipant(p);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/80 shadow-xs ring-1 ring-amber-400'
                        : 'border-stone-200/90 hover:border-stone-300 hover:bg-stone-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected 
                          ? 'bg-amber-700 text-white' 
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        #{p.chestNo}
                      </span>
                      <div className="truncate">
                        <div className={`text-xs sm:text-sm font-bold truncate font-serif-kannada ${
                          isSelected ? 'text-amber-950' : 'text-stone-800'
                        }`}>
                          {p.name}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate">
                          {p.schoolOrClass}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {(() => {
                        const judgeCount = Object.keys(p.judgeScores || {}).length;
                        const myScore = p.judgeScores?.[activeJudge?.id || '']?.total;
                        return (
                          <div className="text-right">
                            {myScore !== undefined ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 block">
                                {myScore} / 50
                              </span>
                            ) : (
                              <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md block">
                                {lang === 'kn' ? 'ಬಾಕಿ' : 'Pending'}
                              </span>
                            )}
                            <span className="text-[9px] text-stone-500 font-mono mt-0.5 block">
                              {judgeCount}/4 ತೀರ್ಪುಗಾರರು
                            </span>
                          </div>
                        );
                      })()}
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: 5-Criteria Evaluation Matrix (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-amber-200/90 shadow-xs space-y-6">
          
          {targetParticipant ? (
            <div>
              {/* Selected Participant Header Card */}
              <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-amber-700 text-white shadow-2xs">
                      #{targetParticipant.chestNo}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif-kannada">
                      {targetParticipant.name}
                    </h3>
                    <span className="text-xs text-stone-500">
                      ({targetParticipant.schoolOrClass})
                    </span>
                  </div>

                  {targetParticipant.assignedTopic && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-xl border border-amber-200">
                      <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="font-semibold truncate">
                        {lang === 'kn' ? targetParticipant.assignedTopic.titleKn : targetParticipant.assignedTopic.titleEn}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-stone-500 block">
                    {lang === 'kn' ? 'ಒಟ್ಟು ಅಂಕಗಳು:' : 'Calculated Total:'}
                  </span>
                  <span className="text-3xl font-black font-mono text-amber-900">
                    {totalMarks} <span className="text-sm font-normal text-stone-500">/ 50</span>
                  </span>
                </div>
              </div>

              {/* 4 Judges Multi-Evaluation Progress Status for this participant */}
              <div className="mb-6 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                <div className="text-[11px] font-bold text-amber-950 mb-2 flex items-center justify-between font-serif-kannada">
                  <span>{lang === 'kn' ? '೪ ತೀರ್ಪುಗಾರರ ಮೌಲ್ಯಮಾಪನ ಸ್ಥಿತಿ (Sync Status):' : '4 Judges Evaluation Sync Status:'}</span>
                  <span className="text-stone-500 font-normal">
                    {Object.keys(targetParticipant.judgeScores || {}).length} / 4 {lang === 'kn' ? 'ಪೂರ್ಣಗೊಂಡಿದೆ' : 'Completed'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DEFAULT_JUDGES.map((j) => {
                    const isCurrent = j.id === activeJudge?.id;
                    const jScore = targetParticipant.judgeScores?.[j.id];
                    return (
                      <div
                        key={j.id}
                        className={`p-2 rounded-xl text-center border transition ${
                          isCurrent
                            ? 'bg-amber-100/90 border-amber-400 ring-1 ring-amber-400/50'
                            : jScore
                              ? 'bg-white border-emerald-300 shadow-2xs'
                              : 'bg-stone-50/70 border-stone-200'
                        }`}
                      >
                        <div className="text-[10px] font-bold text-stone-700 truncate font-serif-kannada">
                          {j.name.split(' ')[0]} {j.name.split(' ')[1]} {isCurrent ? '(ನೀವು)' : ''}
                        </div>
                        <div className="text-xs font-black mt-0.5">
                          {jScore ? (
                            <span className="text-emerald-700 font-mono">{jScore.total} / 50 ✓</span>
                          ) : isCurrent ? (
                            <span className="text-amber-800 text-[11px] font-bold">ದಾಖಲಿಸಿ...</span>
                          ) : (
                            <span className="text-stone-400 text-[11px]">ಬಾಕಿ ⏳</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submitted message alert */}
              {submittedMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{submittedMessage}</span>
                </div>
              )}

              {/* 5-Criteria Sliders & Number Badges */}
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-serif-kannada">
                    {lang === 'kn' ? '೫ ಮಾನದಂಡಗಳ ಮೌಲ್ಯಮಾಪನ (ಪ್ರತಿಯೊಂದಕ್ಕೆ ೧೦ ಅಂಕ)' : '5 Evaluation Criteria (10 Marks Each)'}
                  </h4>
                  <span className="text-xs text-stone-500 font-medium">
                    {lang === 'kn' ? 'ಗರಿಷ್ಠ ೫೦ ಅಂಕಗಳು' : 'Max 50 Marks'}
                  </span>
                </div>

                {criteria.map((crit) => (
                  <div 
                    key={crit.id}
                    className="p-4 rounded-2xl bg-stone-50/50 border border-stone-200 hover:border-amber-300 transition space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-stone-900 font-serif-kannada">
                          {lang === 'kn' ? crit.labelKn : crit.labelEn}
                        </h5>
                        <p className="text-[11px] text-stone-500">
                          {lang === 'kn' ? crit.descKn : crit.descEn}
                        </p>
                      </div>

                      {/* Score display badge */}
                      <span className="px-3 py-1 rounded-xl text-sm font-black font-mono bg-white border border-amber-300 text-amber-900 shadow-2xs">
                        {crit.value} / 10
                      </span>
                    </div>

                    {/* Interactive range slider */}
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[11px] font-mono font-semibold text-stone-400 w-4">0</span>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={crit.value}
                        onChange={(e) => crit.setter(Number(e.target.value))}
                        className="flex-1 accent-amber-700 h-2 bg-stone-200 rounded-lg cursor-pointer"
                      />
                      <span className="text-[11px] font-mono font-semibold text-stone-600 w-4">10</span>
                    </div>
                  </div>
                ))}

                {/* Judge Remarks / Advice */}
                <div className="mt-4 pt-2">
                  <label className="block text-xs font-bold text-stone-800 mb-1.5 font-serif-kannada">
                    {lang === 'kn' ? 'ತೀರ್ಪುಗಾರರ ಅಭಿಪ್ರಾಯ / ಸಲಹೆ (Judge Remarks):' : 'Judge Feedback / Remarks:'}
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder={
                      lang === 'kn'
                        ? 'ಉದಾ: ಅತ್ಯುತ್ತಮ ಭಾಷಣ, ನಿರರ್ಗಳ ಮಾತು, ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಕೂಡಿದೆ...'
                        : 'e.g., Excellent diction, great stage presence...'
                    }
                    className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                {/* Submit & Next Button Bar */}
                <div className="pt-4 border-t border-amber-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 font-medium">
                      {lang === 'kn' ? 'ಅಂತಿಮ ಮೊತ್ತ:' : 'Total Calculated:'}
                    </span>
                    <span className="text-2xl font-black font-mono text-amber-900">
                      {totalMarks} / 50
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      id="submit-judge-score-btn"
                      onClick={handleSubmitScore}
                      className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95 font-serif-kannada"
                    >
                      <Save className="w-4 h-4" />
                      <span>{lang === 'kn' ? 'ಅಂಕಗಳನ್ನು ಸಲ್ಲಿಸಿ (Submit)' : 'Submit Scores'}</span>
                    </button>

                    <button
                      onClick={handleNextParticipant}
                      className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm border border-stone-300 flex items-center justify-center gap-1 transition"
                    >
                      <span>{lang === 'kn' ? 'ಮುಂದಿನ ಸ್ಪರ್ಧಿ' : 'Next'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-stone-500">
              {lang === 'kn' ? 'ದಯವಿಟ್ಟು ಅಂಕ ನೀಡಲು ಸ್ಪರ್ಧಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.' : 'Please select a participant to evaluate.'}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
