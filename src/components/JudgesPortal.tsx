import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  Wifi,
  Loader2,
  RefreshCw,
  BarChart3,
  Trophy,
  Check
} from 'lucide-react';
import { Participant, Topic, Language, JudgeScore, JudgeProfile } from '../types';
import { 
  DEFAULT_JUDGES, 
  JUDGE_PASSWORDS, 
  submitJudgeScoreOnline, 
  pingJudgeOnline, 
  fetchLiveSync 
} from '../utils/onlineSync';

export { DEFAULT_JUDGES, JUDGE_PASSWORDS };

interface JudgesPortalProps {
  lang: Language;
  participants: Participant[];
  currentParticipant: Participant | null;
  onSelectParticipant: (participant: Participant) => void;
  onSaveScore: (participantId: string, score: JudgeScore) => void;
}

const STORAGE_KEY_JUDGE_AUTH = 'parishath_judge_auth_v3';
const STORAGE_KEY_JUDGE_SESSION = 'active_judge_session_v3';

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
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

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

  // 5 Criteria State for currently selected participant (0-10 each, total out of 50 in English numbers)
  const [contentScore, setContentScore] = useState<number>(8);
  const [languageScore, setLanguageScore] = useState<number>(8);
  const [presentationScore, setPresentationScore] = useState<number>(8);
  const [timeScore, setTimeScore] = useState<number>(8);
  const [impactScore, setImpactScore] = useState<number>(8);
  const [remarks, setRemarks] = useState<string>('');
  
  const [isSubmittingOnline, setIsSubmittingOnline] = useState<boolean>(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<boolean>(true);
  const [chiefModeTab, setChiefModeTab] = useState<'matrix' | 'compare' | 'score'>('matrix');

  // Periodically ping online server to mark this judge online
  useEffect(() => {
    if (isAuthenticated && activeJudge) {
      pingJudgeOnline(activeJudge.id).then(res => setOnlineStatus(res));
      const interval = setInterval(() => {
        pingJudgeOnline(activeJudge.id).then(res => setOnlineStatus(res));
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, activeJudge]);

  // Handle Login submission with individual password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    const expected = JUDGE_PASSWORDS[selectedProfileForLogin.id];

    if (passwordInput.trim() === expected) {
      setIsAuthenticated(true);
      setActiveJudge(selectedProfileForLogin);
      localStorage.setItem(STORAGE_KEY_JUDGE_AUTH, 'true');
      localStorage.setItem(STORAGE_KEY_JUDGE_SESSION, JSON.stringify(selectedProfileForLogin));
      setAuthError(null);
      setPasswordInput('');
      await pingJudgeOnline(selectedProfileForLogin.id);
    } else {
      setAuthError(
        lang === 'kn'
          ? `❌ ತಪ್ಪಾದ ಪಾಸ್‌ವರ್ಡ್! ಸರಿಯಾದ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.`
          : `❌ Incorrect password! Please enter correct judge credentials.`
      );
    }
    setIsLoggingIn(false);
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
    pingJudgeOnline(judge.id);
  };

  // Load participant's existing score when selection changes
  const targetParticipant = participants.find(p => p.id === selectedParticipantId) || participants[0] || null;

  useEffect(() => {
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

  // Submit Score - Both Local State and Live Online Sync to Admin
  const handleSubmitScore = async () => {
    if (!targetParticipant || !activeJudge) return;

    const newScore: JudgeScore = {
      judgeId: activeJudge.id,
      judgeName: activeJudge.name,
      content: contentScore,
      language: languageScore,
      presentation: presentationScore,
      timeManagement: timeScore,
      impact: impactScore,
      total: totalMarks,
      remarks: remarks.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    // 1. Update local state immediately
    onSaveScore(targetParticipant.id, newScore);

    // 2. Sync to online server in real-time so Admin on PC or other mobiles sees it live!
    setIsSubmittingOnline(true);
    try {
      const result = await submitJudgeScoreOnline(activeJudge.id, targetParticipant, newScore);
      if (result.success) {
        setSubmittedMessage(
          lang === 'kn'
            ? `✓ #${targetParticipant.chestNo} (${targetParticipant.name}) ರವರ ಅಂಕಗಳನ್ನು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಯಶಸ್ವಿಯಾಗಿ ಸಿಂಕ್ ಮಾಡಲಾಗಿದೆ!`
            : `✓ Scores for #${targetParticipant.chestNo} (${targetParticipant.name}) synced online to Admin!`
        );
      } else {
        setSubmittedMessage(
          lang === 'kn'
            ? `✓ ಅಂಕಗಳನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಉಳಿಸಲಾಗಿದೆ (ಆನ್‌ಲೈನ್ ಸಿಂಕ್: ${result.message || 'ಬಾಕಿ'})`
            : `✓ Scores saved locally (Online sync pending)`
        );
      }
    } catch {
      setSubmittedMessage(
        lang === 'kn'
          ? `✓ ಅಂಕಗಳನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಉಳಿಸಲಾಗಿದೆ.`
          : `✓ Scores saved locally.`
      );
    } finally {
      setIsSubmittingOnline(false);
      setTimeout(() => {
        setSubmittedMessage(null);
      }, 4500);
    }
  };

  // Chief Judge Action: Approve and sync consensus across all judges
  const handleChiefJudgeApproveConsensus = async () => {
    if (!targetParticipant || !activeJudge) return;
    const scores = Object.values(targetParticipant.judgeScores || {});
    if (scores.length === 0) {
      alert(lang === 'kn' ? 'ಯಾವುದೇ ತೀರ್ಪುಗಾರರು ಇನ್ನೂ ಅಂಕ ನೀಡಿಲ್ಲ.' : 'No judges have submitted marks yet.');
      return;
    }
    const count = scores.length;
    const avgContent = Math.round((scores.reduce((sum, s) => sum + s.content, 0) / count) * 10) / 10;
    const avgLanguage = Math.round((scores.reduce((sum, s) => sum + s.language, 0) / count) * 10) / 10;
    const avgPresentation = Math.round((scores.reduce((sum, s) => sum + s.presentation, 0) / count) * 10) / 10;
    const avgTime = Math.round((scores.reduce((sum, s) => sum + s.timeManagement, 0) / count) * 10) / 10;
    const avgImpact = Math.round((scores.reduce((sum, s) => sum + s.impact, 0) / count) * 10) / 10;
    const avgTotal = Math.round((avgContent + avgLanguage + avgPresentation + avgTime + avgImpact) * 10) / 10;

    const consensusScore: JudgeScore = {
      judgeId: 'consensus',
      judgeName: `${count}/4 ತೀರ್ಪುಗಾರರ ಸರಾಸರಿ (ಮುಖ್ಯ ತೀರ್ಪುಗಾರರ ಅನುಮೋದಿತ)`,
      content: avgContent,
      language: avgLanguage,
      presentation: avgPresentation,
      timeManagement: avgTime,
      impact: avgImpact,
      total: avgTotal,
      remarks: remarks.trim() || scores.map(s => s.remarks).filter(Boolean).join(' | ') || 'ಮುಖ್ಯ ತೀರ್ಪುಗಾರರ ಅನುಮೋದನೆ',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    onSaveScore(targetParticipant.id, consensusScore);

    setIsSubmittingOnline(true);
    try {
      const res = await submitJudgeScoreOnline('judge-chief', targetParticipant, consensusScore);
      if (res.success) {
        setSubmittedMessage(
          lang === 'kn'
            ? `✓ #${targetParticipant.chestNo} (${targetParticipant.name}) ರವರ ಒಮ್ಮತದ ಸರಾಸರಿ ಅಂಕಗಳನ್ನು ಮುಖ್ಯ ತೀರ್ಪುಗಾರರಾಗಿ ಯಶಸ್ವಿಯಾಗಿ ಅನುಮೋದಿಸಿ ಲೈವ್ ಸಿಂಕ್ ಮಾಡಲಾಗಿದೆ!`
            : `✓ Consensus score approved and synced online by Chief Judge!`
        );
      } else {
        setSubmittedMessage(
          lang === 'kn' ? `✓ ಅಂಕಗಳನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಉಳಿಸಲಾಗಿದೆ.` : `✓ Scores saved locally.`
        );
      }
    } catch {
      setSubmittedMessage(lang === 'kn' ? `✓ ಅಂಕಗಳನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಉಳಿಸಲಾಗಿದೆ.` : `✓ Scores saved locally.`);
    } finally {
      setIsSubmittingOnline(false);
      setTimeout(() => setSubmittedMessage(null), 4500);
    }
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

  // Criteria definitions with English numbers as requested
  const criteria = [
    {
      id: 'crit-content',
      labelKn: '1. ವಿಷಯ ಜ್ಞಾನ & ಪರಿಕಲ್ಪನೆ (Content Knowledge)',
      labelEn: '1. Content Depth & Subject Relevance',
      descKn: 'ವಿಷಯದ ಸ್ಪಷ್ಟತೆ, ಮಾಹಿತಿ, ಐತಿಹಾಸಿಕ ಗ್ರಹಿಕೆ ಮತ್ತು ಹೊಸತನ (0-10 ಅಂಕ)',
      descEn: 'Factual accuracy, understanding, and topical depth (0-10 marks)',
      value: contentScore,
      setter: setContentScore
    },
    {
      id: 'crit-language',
      labelKn: '2. ಭಾಷಾ ಶುದ್ಧತೆ & ನಿರರ್ಗಳತೆ (Fluency & Diction)',
      labelEn: '2. Language Fluency & Pronunciation',
      descKn: 'ಶುದ್ಧ ಉಚ್ಚಾರಣೆ, ವ್ಯಾಕರಣ, ಶಬ್ದ ಸಂಪತ್ತು ಮತ್ತು ವಾಕ್ಚಾತುರ್ಯ (0-10 ಅಂಕ)',
      descEn: 'Grammatical correctness, vocabulary, and smooth delivery (0-10 marks)',
      value: languageScore,
      setter: setLanguageScore
    },
    {
      id: 'crit-presentation',
      labelKn: '3. ಹಾವಭಾವ & ವೇದಿಕೆ ಉಪಸ್ಥಿತಿ (Body Language)',
      labelEn: '3. Body Language & Stage Confidence',
      descKn: 'ಆತ್ಮವಿಶ್ವಾಸ, ಕಣ್ಣಿನ ಸಂಪರ್ಕ, ಮುಖಭಾವ ಮತ್ತು ಶಿಸ್ತು (0-10 ಅಂಕ)',
      descEn: 'Eye contact, composure, gestures, and presence (0-10 marks)',
      value: presentationScore,
      setter: setPresentationScore
    },
    {
      id: 'crit-time',
      labelKn: '4. ಸಮಯ ಪಾಲನೆ & ಮುಕ್ತಾಯ (Time Discipline)',
      labelEn: '4. Time Management & Discipline',
      descKn: 'ನಿಗದಿತ 3 ನಿಮಿಷ ಭಾಷಣದ ಸಮಯದಲ್ಲಿ ಭಾಷಣವನ್ನು ಮುಗಿಸುವುದು (0-10 ಅಂಕ)',
      descEn: 'Strict adherence to 3-minute speech time limit (0-10 marks)',
      value: timeScore,
      setter: setTimeScore
    },
    {
      id: 'crit-impact',
      labelKn: '5. ಒಟ್ಟಾರೆ ಪ್ರಭಾವ & ಸಂದೇಶ (Overall Impact)',
      labelEn: '5. Overall Impact & Moral Value',
      descKn: 'ಸಭಿಕರ ಮೇಲೆ ಬೀರಿದ ಪ್ರಭಾವ, ಸಾರ್ಥಕ ಸಂದೇಶ ಮತ್ತು ಆಕರ್ಷಣೆ (0-10 ಅಂಕ)',
      descEn: 'Audience engagement, inspiration, and takeaway (0-10 marks)',
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

  // If not authenticated, render Password Login Screen with individual passwords
  if (!isAuthenticated || !activeJudge) {
    return (
      <div className="max-w-md mx-auto my-8 bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center mx-auto mb-4 border border-amber-300 shadow-md">
          <ShieldCheck className="w-8 h-8 text-amber-100" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-serif-kannada">
          {lang === 'kn' ? 'ತೀರ್ಪುಗಾರರ ಮೊಬೈಲ್ ಲಾಗಿನ್' : 'Judges Online Mobile Login'}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1.5 mb-6">
          {lang === 'kn'
            ? 'ತೀರ್ಪುಗಾರರು ತಮ್ಮ ಮೊಬೈಲ್‌ನಿಂದ ಲಾಗಿನ್ ಆಗಲು ತಮ್ಮ ಪಾತ್ರವನ್ನು ಆರಿಸಿ, ನಿಗದಿತ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.'
            : 'Select your judge role and enter your designated password to log in and sync scores online.'}
        </p>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
          {/* Select Judge Profile */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2 font-serif-kannada">
              {lang === 'kn' ? 'ನೀವು ಯಾವ ತೀರ್ಪುಗಾರರಾಗಿ ಸೇರಲು ಬಯಸುವಿರಿ?' : 'Select Which Judge You Are Joining As:'}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {DEFAULT_JUDGES.map((judge) => {
                const isSelected = selectedProfileForLogin.id === judge.id;

                return (
                  <button
                    type="button"
                    key={judge.id}
                    onClick={() => {
                      setSelectedProfileForLogin(judge);
                      setAuthError(null);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                      isSelected 
                        ? 'border-amber-600 bg-amber-50/90 ring-2 ring-amber-500/20 shadow-xs' 
                        : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100'
                    }`}
                  >
                    <div>
                      <h4 className={`text-xs sm:text-sm font-bold font-serif-kannada ${isSelected ? 'text-amber-950' : 'text-stone-800'}`}>
                        {judge.name}
                      </h4>
                      <span className="text-[11px] text-stone-500">
                        {judge.role}
                      </span>
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
              {lang === 'kn' ? `${selectedProfileForLogin.name} ಪಾಸ್‌ವರ್ಡ್:` : `Password for ${selectedProfileForLogin.name}:`}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
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
                placeholder={lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ...' : 'Enter judge password...'}
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-mono bg-white"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {authError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="judge-login-btn"
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95 font-serif-kannada disabled:opacity-50"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            <span>{lang === 'kn' ? 'ಲಾಗಿನ್ ಆಗಿ (Join as Judge)' : 'Login & Join as Judge'}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-stone-200 text-center">
          <p className="text-[11px] text-stone-500">
            {lang === 'kn' 
              ? 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್ (ರಿ) ಮೈಸೂರು • ರಿಯಲ್-ಟೈಮ್ ಮೊಬೈಲ್ ಸಿಂಕ್' 
              : 'Karnataka State Teachers Talent Council • Real-Time Mobile Sync'}
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-200">
                {lang === 'kn' ? 'ತೀರ್ಪುಗಾರರ ಲಾಗಿನ್' : 'Judge Active'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>{lang === 'kn' ? 'ಆನ್‌ಲೈನ್ ಸಿಂಕ್ ಸಕ್ರಿಯ' : 'Live Sync Active'}</span>
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

      {/* Chief Judge Live Sync Hub Banner & View Mode Toggles */}
      {activeJudge.id === 'judge-chief' && (
        <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-stone-900 rounded-3xl p-5 text-white shadow-md space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-bold font-mono border border-amber-300/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>👑 {lang === 'kn' ? 'ಮುಖ್ಯ ತೀರ್ಪುಗಾರರ ಲೈವ್ ಸಿಂಕ್ ಕಂಟ್ರೋಲ್ ರೂಮ್' : 'Chief Judge Live Sync Control Room'}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black font-serif-kannada mt-1.5">
                {lang === 'kn' ? '೪ ತೀರ್ಪುಗಾರರ ಅಂಕಗಳ ಲೈವ್ ಸಮನ್ವಯ & ಅಂತಿಮ ಅನುಮೋದನೆ' : '4 Judges Live Sync Consolidation & Approval'}
              </h3>
              <p className="text-xs text-amber-100/80">
                {lang === 'kn'
                  ? 'ತೀರ್ಪುಗಾರರು ೧, ೨, ೩, ೪ ನೀಡಿದ ಅಂಕಗಳನ್ನು ಇಲ್ಲಿ ರಿಯಲ್-ಟೈಮ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ, ತುಲನೆ ಮಾಡಿ ಮತ್ತು ಅನುಮೋದಿಸಿ.'
                  : 'Monitor marks submitted live by Judges 1, 2, 3, 4, compare criteria breakdowns, and approve final consensus.'}
              </p>
            </div>

            {/* Sub-tab pills */}
            <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/10 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setChiefModeTab('matrix')}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  chiefModeTab === 'matrix' ? 'bg-amber-500 text-stone-950 font-black shadow-xs' : 'text-stone-300 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{lang === 'kn' ? '೪ ತೀರ್ಪುಗಾರರ ಸಿಂಕ್ ಪಟ್ಟಿ' : 'Live Sync Matrix'}</span>
              </button>
              <button
                type="button"
                onClick={() => setChiefModeTab('compare')}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  chiefModeTab === 'compare' ? 'bg-amber-500 text-stone-950 font-black shadow-xs' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{lang === 'kn' ? 'ವಿವರ ತುಲನೆ & ಅನುಮೋದನೆ' : 'Detailed 4-Judge Review'}</span>
              </button>
              <button
                type="button"
                onClick={() => setChiefModeTab('score')}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  chiefModeTab === 'score' ? 'bg-amber-500 text-stone-950 font-black shadow-xs' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{lang === 'kn' ? 'ಸ್ವಂತ ಮೌಲ್ಯಮಾಪನ' : 'Score Sheet'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1 FOR CHIEF JUDGE: Live Sync Matrix of All Participants */}
      {activeJudge.id === 'judge-chief' && chiefModeTab === 'matrix' ? (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-300 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif-kannada">
                {lang === 'kn' ? 'ಸ್ಪರ್ಧಿವಾರು ೪ ತೀರ್ಪುಗಾರರ ಲೈವ್ ಅಂಕ ಸಿಂಕ್ ಪಟ್ಟಿ' : 'Live Participant Score Matrix (Judges 1 to 4)'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {lang === 'kn'
                  ? 'ತೀರ್ಪುಗಾರರು ತಮ್ಮ ಮೊಬೈಲ್‌ಗಳಿಂದ ಅಂಕ ಸಲ್ಲಿಸಿದ ತಕ್ಷಣ ಇಲ್ಲಿ ಲೈವ್ ಅಪ್‌ಡೇಟ್ ಆಗುತ್ತದೆ'
                  : 'Scores update in real-time as individual judges submit from their phones'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'kn' ? 'ಹುಡುಕಿ (ಹೆಸರು / ಚೆಸ್ಟ್)...' : 'Search participant...'}
                className="px-3.5 py-1.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50/50 w-full sm:w-60"
              />
            </div>
          </div>

          {/* Quick Summary of Judges 1 to 4 Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'judge-1', title: 'ತೀರ್ಪುಗಾರರು ೧ (Judge 1)' },
              { id: 'judge-2', title: 'ತೀರ್ಪುಗಾರರು ೨ (Judge 2)' },
              { id: 'judge-3', title: 'ತೀರ್ಪುಗಾರರು ೩ (Judge 3)' },
              { id: 'judge-4', title: 'ತೀರ್ಪುಗಾರರು ೪ (Judge 4)' }
            ].map(j => {
              const evalCount = participants.filter(p => p.judgeScores?.[j.id] !== undefined).length;
              const isAllDone = participants.length > 0 && evalCount === participants.length;
              return (
                <div key={j.id} className={`p-3 rounded-2xl border ${isAllDone ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50/60 border-amber-200'}`}>
                  <span className="text-[11px] font-bold text-stone-800 font-serif-kannada block truncate">{j.title}</span>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className="text-stone-500">{lang === 'kn' ? 'ಮೌಲ್ಯಮಾಪನ:' : 'Scored:'}</span>
                    <span className="font-mono font-bold text-amber-900">{evalCount} / {participants.length}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Matrix Table */}
          {filteredParticipants.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-xs sm:text-sm">
              {lang === 'kn' ? 'ಯಾವುದೇ ಸ್ಪರ್ಧಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ.' : 'No participants found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-amber-50/70 border-b border-stone-200 text-stone-700 uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-3">{lang === 'kn' ? 'ಚೆಸ್ಟ್ ನಂ' : 'Chest #'}</th>
                    <th className="py-3 px-3">{lang === 'kn' ? 'ಸ್ಪರ್ಧಿಯ ಹೆಸರು' : 'Name'}</th>
                    <th className="py-3 px-3 text-center">{lang === 'kn' ? 'ತೀರ್ಪುಗಾರರು ೧' : 'Judge 1'}</th>
                    <th className="py-3 px-3 text-center">{lang === 'kn' ? 'ತೀರ್ಪುಗಾರರು ೨' : 'Judge 2'}</th>
                    <th className="py-3 px-3 text-center">{lang === 'kn' ? 'ತೀರ್ಪುಗಾರರು ೩' : 'Judge 3'}</th>
                    <th className="py-3 px-3 text-center">{lang === 'kn' ? 'ತೀರ್ಪುಗಾರರು ೪' : 'Judge 4'}</th>
                    <th className="py-3 px-3 text-center font-bold text-amber-950">{lang === 'kn' ? 'ಒಮ್ಮತದ ಸರಾಸರಿ' : 'Consensus Avg'}</th>
                    <th className="py-3 px-3 text-center">{lang === 'kn' ? 'ಸ್ಥಿತಿ' : 'Status'}</th>
                    <th className="py-3 px-3 text-center">{lang === 'kn' ? 'ಕ್ರಮ' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredParticipants.map(p => {
                    const j1 = p.judgeScores?.['judge-1'];
                    const j2 = p.judgeScores?.['judge-2'];
                    const j3 = p.judgeScores?.['judge-3'];
                    const j4 = p.judgeScores?.['judge-4'];
                    const count = [j1, j2, j3, j4].filter(Boolean).length;
                    const isAll = count >= 4;

                    return (
                      <tr key={p.id} className="hover:bg-stone-50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-amber-800">#{p.chestNo}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-stone-900 font-serif-kannada">{p.name}</div>
                          <div className="text-[11px] text-stone-500 truncate">{p.schoolOrClass}</div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          {j1 ? <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">{j1.total} / 50</span> : <span className="text-[11px] text-stone-400 font-mono">-</span>}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {j2 ? <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">{j2.total} / 50</span> : <span className="text-[11px] text-stone-400 font-mono">-</span>}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {j3 ? <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">{j3.total} / 50</span> : <span className="text-[11px] text-stone-400 font-mono">-</span>}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {j4 ? <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">{j4.total} / 50</span> : <span className="text-[11px] text-stone-400 font-mono">-</span>}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-black text-amber-900 text-sm">
                          {p.scores?.total !== undefined ? `${p.scores.total} / 50` : '-'}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {isAll ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>4/4 {lang === 'kn' ? 'ಪೂರ್ಣ' : 'Done'}</span>
                            </span>
                          ) : count > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 font-mono">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>{count}/4 {lang === 'kn' ? 'ಪ್ರಗತಿ' : 'Progress'}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-400 font-mono">0/4 {lang === 'kn' ? 'ಬಾಕಿ' : 'Waiting'}</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedParticipantId(p.id);
                              onSelectParticipant(p);
                              setChiefModeTab('compare');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-2xs transition font-serif-kannada"
                          >
                            {lang === 'kn' ? 'ತುಲನೆ & ಅನುಮೋದನೆ' : 'Review & Approve'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeJudge.id === 'judge-chief' && chiefModeTab === 'compare' ? (
        /* VIEW 2 FOR CHIEF JUDGE: Detailed Multi-Judge Breakdown & Approval */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Participant Selector (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-amber-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-700" />
                <h3 className="font-bold text-stone-900 font-serif-kannada text-sm sm:text-base">
                  {lang === 'kn' ? 'ಸ್ಪರ್ಧಿಗಳ ಆಯ್ಕೆ' : 'Select Speaker'}
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
                {participants.length}
              </span>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'kn' ? 'ಹುಡುಕಿ (ಹೆಸರು / ಚೆಸ್ಟ್)...' : 'Search participant...'}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/50"
            />

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {filteredParticipants.map(p => {
                const isSelected = p.id === selectedParticipantId;
                const judgeCount = Object.keys(p.judgeScores || {}).length;

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedParticipantId(p.id);
                      onSelectParticipant(p);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between gap-2.5 ${
                      isSelected 
                        ? 'border-amber-600 bg-amber-50/90 ring-1 ring-amber-500 shadow-2xs' 
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-8 h-8 rounded-xl font-bold font-mono text-xs flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-700'
                      }`}>
                        #{p.chestNo}
                      </span>
                      <div className="truncate">
                        <h4 className="font-bold text-stone-900 text-xs sm:text-sm font-serif-kannada truncate">{p.name}</h4>
                        <p className="text-[11px] text-stone-500 truncate">{p.schoolOrClass}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md ${
                      judgeCount >= 4 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {judgeCount}/4
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: 4 Judge Detailed Criteria Comparison Cards & Approval (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-300 shadow-xs space-y-6">
            {targetParticipant ? (
              <div className="space-y-6">
                {/* Speaker Header */}
                <div className="bg-gradient-to-r from-amber-50 to-stone-50 rounded-2xl p-4 sm:p-5 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-700 text-white font-bold font-mono text-lg flex items-center justify-center shrink-0 shadow-xs">
                      #{targetParticipant.chestNo}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                        {lang === 'kn' ? 'ಪರಿಶೀಲಿಸುತ್ತಿರುವ ಸ್ಪರ್ಧಿ' : 'Inspecting Speaker'}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-stone-900 font-serif-kannada mt-0.5">
                        {targetParticipant.name}
                      </h3>
                      <p className="text-xs text-stone-600">{targetParticipant.schoolOrClass}</p>
                    </div>
                  </div>

                  {targetParticipant.assignedTopic && (
                    <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs sm:max-w-xs shadow-2xs">
                      <span className="font-bold text-amber-800 block mb-0.5">
                        {lang === 'kn' ? 'ಆಯ್ಕೆಯಾದ ವಿಷಯ' : 'Topic'} #{targetParticipant.assignedTopic.number}:
                      </span>
                      <p className="text-stone-800 font-serif-kannada font-medium line-clamp-2">
                        "{targetParticipant.assignedTopic.titleKn}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Submitted message alert */}
                {submittedMessage && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{submittedMessage}</span>
                  </div>
                )}

                {/* 4 Judges Individual Breakdown Cards */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 font-serif-kannada mb-3 flex items-center justify-between">
                    <span>{lang === 'kn' ? '೪ ತೀರ್ಪುಗಾರರ ಮಾನದಂಡವಾರು ಅಂಕಗಳ ತುಲನೆ (0-10 ಅಂಕಗಳು):' : '4 Judges Individual Criteria Marks (0-10):'}</span>
                    <span className="text-stone-500 font-mono text-[11px]">
                      {Object.keys(targetParticipant.judgeScores || {}).length} / 4 {lang === 'kn' ? 'ದಾಖಲಾಗಿದೆ' : 'Submitted'}
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'judge-1', title: 'ತೀರ್ಪುಗಾರರು ೧ (Judge 1)' },
                      { id: 'judge-2', title: 'ತೀರ್ಪುಗಾರರು ೨ (Judge 2)' },
                      { id: 'judge-3', title: 'ತೀರ್ಪುಗಾರರು ೩ (Judge 3)' },
                      { id: 'judge-4', title: 'ತೀರ್ಪುಗಾರರು ೪ (Judge 4)' }
                    ].map(j => {
                      const score = targetParticipant.judgeScores?.[j.id];

                      return (
                        <div key={j.id} className={`p-4 rounded-2xl border transition ${
                          score ? 'bg-amber-50/50 border-amber-300 shadow-2xs' : 'bg-stone-50/70 border-stone-200'
                        }`}>
                          <div className="flex items-center justify-between border-b border-stone-200/80 pb-2 mb-2.5">
                            <span className="font-bold text-xs text-stone-900 font-serif-kannada">{j.title}</span>
                            {score ? (
                              <span className="font-mono font-black text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                                {score.total} / 50 ✓
                              </span>
                            ) : (
                              <span className="text-[11px] text-stone-400 font-mono">ಬಾಕಿ ⏳</span>
                            )}
                          </div>

                          {score ? (
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between text-stone-600">
                                <span>೧. ವಿಷಯ ಜ್ಞಾನ:</span>
                                <span className="font-mono font-bold text-stone-900">{score.content} / 10</span>
                              </div>
                              <div className="flex justify-between text-stone-600">
                                <span>೨. ಭಾಷಾ ಶುದ್ಧತೆ:</span>
                                <span className="font-mono font-bold text-stone-900">{score.language} / 10</span>
                              </div>
                              <div className="flex justify-between text-stone-600">
                                <span>೩. ಹಾವಭಾವ:</span>
                                <span className="font-mono font-bold text-stone-900">{score.presentation} / 10</span>
                              </div>
                              <div className="flex justify-between text-stone-600">
                                <span>೪. ಸಮಯ ಪಾಲನೆ:</span>
                                <span className="font-mono font-bold text-stone-900">{score.timeManagement} / 10</span>
                              </div>
                              <div className="flex justify-between text-stone-600">
                                <span>೫. ಒಟ್ಟಾರೆ ಪ್ರಭಾವ:</span>
                                <span className="font-mono font-bold text-stone-900">{score.impact} / 10</span>
                              </div>
                              {score.remarks && (
                                <div className="pt-2 border-t border-amber-200/70 text-[11px] text-amber-900 italic">
                                  "{score.remarks}"
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="py-4 text-center text-xs text-stone-400 italic">
                              {lang === 'kn' ? 'ಈ ತೀರ್ಪುಗಾರರಿಂದ ಇನ್ನೂ ಅಂಕ ಸಲ್ಲಿಕೆಯಾಗಿಲ್ಲ' : 'No marks submitted yet'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Consensus Summary Box & Chief Judge Approval */}
                {(() => {
                  const scores = Object.values(targetParticipant.judgeScores || {});
                  const count = scores.length;
                  const avgContent = count > 0 ? (scores.reduce((sum, s) => sum + s.content, 0) / count).toFixed(1) : '-';
                  const avgLanguage = count > 0 ? (scores.reduce((sum, s) => sum + s.language, 0) / count).toFixed(1) : '-';
                  const avgPresentation = count > 0 ? (scores.reduce((sum, s) => sum + s.presentation, 0) / count).toFixed(1) : '-';
                  const avgTime = count > 0 ? (scores.reduce((sum, s) => sum + s.timeManagement, 0) / count).toFixed(1) : '-';
                  const avgImpact = count > 0 ? (scores.reduce((sum, s) => sum + s.impact, 0) / count).toFixed(1) : '-';
                  const avgTotal = count > 0 ? (
                    Number(avgContent) + Number(avgLanguage) + Number(avgPresentation) + Number(avgTime) + Number(avgImpact)
                  ).toFixed(1) : '-';

                  return (
                    <div className="bg-gradient-to-r from-amber-100/90 to-amber-50 rounded-3xl p-5 sm:p-6 border-2 border-amber-400 shadow-md space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-300">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 bg-amber-300/80 px-2.5 py-0.5 rounded-full">
                            {lang === 'kn' ? 'ಒಮ್ಮತದ ಸರಾಸರಿ (Consensus)' : 'Consensus Average'}
                          </span>
                          <h4 className="text-base sm:text-lg font-black text-amber-950 font-serif-kannada mt-1">
                            {lang === 'kn' ? `${count} ತೀರ್ಪುಗಾರರ ಒಟ್ಟಾರೆ ಸರಾಸರಿ ಅಂಕಗಳು` : `${count} Judges Consolidated Score`}
                          </h4>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-amber-900 block font-semibold">{lang === 'kn' ? 'ಒಟ್ಟು ಅಂಕಗಳು:' : 'Total Average:'}</span>
                          <span className="text-3xl font-black font-mono text-amber-950">{avgTotal} / 50</span>
                        </div>
                      </div>

                      {/* Criteria Averages Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                        <div className="bg-white/80 p-2 rounded-xl border border-amber-200">
                          <span className="text-stone-500 block text-[10px]">{lang === 'kn' ? 'ವಿಷಯ' : 'Content'}</span>
                          <span className="font-mono font-bold text-amber-950 text-sm">{avgContent}</span>
                        </div>
                        <div className="bg-white/80 p-2 rounded-xl border border-amber-200">
                          <span className="text-stone-500 block text-[10px]">{lang === 'kn' ? 'ಭಾಷೆ' : 'Language'}</span>
                          <span className="font-mono font-bold text-amber-950 text-sm">{avgLanguage}</span>
                        </div>
                        <div className="bg-white/80 p-2 rounded-xl border border-amber-200">
                          <span className="text-stone-500 block text-[10px]">{lang === 'kn' ? 'ಹಾವಭಾವ' : 'Presence'}</span>
                          <span className="font-mono font-bold text-amber-950 text-sm">{avgPresentation}</span>
                        </div>
                        <div className="bg-white/80 p-2 rounded-xl border border-amber-200">
                          <span className="text-stone-500 block text-[10px]">{lang === 'kn' ? 'ಸಮಯ' : 'Time'}</span>
                          <span className="font-mono font-bold text-amber-950 text-sm">{avgTime}</span>
                        </div>
                        <div className="bg-white/80 p-2 rounded-xl border border-amber-200">
                          <span className="text-stone-500 block text-[10px]">{lang === 'kn' ? 'ಪ್ರಭಾವ' : 'Impact'}</span>
                          <span className="font-mono font-bold text-amber-950 text-sm">{avgImpact}</span>
                        </div>
                      </div>

                      {/* Chief Judge Remarks */}
                      <div>
                        <label className="block text-xs font-bold text-amber-950 mb-1 font-serif-kannada">
                          {lang === 'kn' ? 'ಮುಖ್ಯ ತೀರ್ಪುಗಾರರ ಅಧಿಕೃತ ಷರಾ / ಮಾರ್ಗದರ್ಶನ:' : 'Chief Judge Final Remarks:'}
                        </label>
                        <input
                          type="text"
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder={lang === 'kn' ? 'ಉದಾ: ೪ ತೀರ್ಪುಗಾರರ ಸರಾಸರಿ ಪರಿಶೀಲಿಸಿ ಅನುಮೋದಿಸಲಾಗಿದೆ...' : 'e.g., Reviewed and approved consensus...'}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* Chief Judge Approve & Live Sync Button */}
                      <button
                        type="button"
                        onClick={handleChiefJudgeApproveConsensus}
                        disabled={isSubmittingOnline || count === 0}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-stone-950 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-98 font-serif-kannada disabled:opacity-50"
                      >
                        {isSubmittingOnline ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{lang === 'kn' ? 'ಅನುಮೋದನೆ ಲೈವ್ ಸಿಂಕ್ ಆಗುತ್ತಿದೆ...' : 'Approving & Syncing Live...'}</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-5 h-5 text-amber-200" />
                            <span>{lang === 'kn' ? '👑 ಮುಖ್ಯ ತೀರ್ಪುಗಾರರ ಅಧಿಕೃತ ಅನುಮೋದನೆ & ಅಂತಿಮ ಲೈವ್ ಸಿಂಕ್' : 'Approve Consensus & Sync Live as Chief Judge'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-12 text-center text-stone-500">
                {lang === 'kn' ? 'ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಲು ಸ್ಪರ್ಧಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.' : 'Please select a participant.'}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* VIEW 3: Standard 5-Criteria Direct Scoring Sheet (For Field Judges or Chief Direct Scoring) */
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
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
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
                const hasMyScore = !!p.judgeScores?.[activeJudge.id];

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedParticipantId(p.id);
                      onSelectParticipant(p);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between gap-2.5 ${
                      isSelected 
                        ? 'border-amber-600 bg-amber-50/90 ring-1 ring-amber-500 shadow-2xs' 
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-8 h-8 rounded-xl font-bold font-mono text-xs flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'bg-amber-700 text-white' 
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        #{p.chestNo}
                      </span>
                      <div className="truncate">
                        <h4 className="font-bold text-stone-900 text-xs sm:text-sm font-serif-kannada truncate">
                          {p.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 truncate">
                          {p.schoolOrClass}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {hasMyScore ? (
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {p.judgeScores![activeJudge.id].total} / 50 ✓
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          ಬಾಕಿ
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: 5-Criteria Evaluation Sheet (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-300 shadow-xs space-y-6">
          
          {targetParticipant ? (
            <div>
              {/* Recipient Header Card */}
              <div className="bg-gradient-to-r from-amber-50 to-stone-50 rounded-2xl p-4 sm:p-5 border border-amber-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-700 text-white font-bold font-mono text-lg flex items-center justify-center shrink-0 shadow-xs">
                    #{targetParticipant.chestNo}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                      {lang === 'kn' ? 'ಪ್ರಸ್ತುತ ಸ್ಪರ್ಧಿ' : 'Active Speaker'}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-stone-900 font-serif-kannada mt-0.5">
                      {targetParticipant.name}
                    </h3>
                    <p className="text-xs text-stone-600">
                      {targetParticipant.schoolOrClass}
                    </p>
                  </div>
                </div>

                {targetParticipant.assignedTopic && (
                  <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs sm:max-w-xs shadow-2xs">
                    <span className="font-bold text-amber-800 block mb-0.5">
                      {lang === 'kn' ? 'ಆಯ್ಕೆಯಾದ ವಿಷಯ' : 'Drawn Topic'} #{targetParticipant.assignedTopic.number}:
                    </span>
                    <p className="text-stone-800 font-serif-kannada font-medium line-clamp-2">
                      "{targetParticipant.assignedTopic.titleKn}"
                    </p>
                  </div>
                )}
              </div>

              {/* 4 Judges Multi-Evaluation Progress Status for this participant */}
              <div className="mb-6 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                <div className="text-[11px] font-bold text-amber-950 mb-2 flex items-center justify-between font-serif-kannada">
                  <span>{lang === 'kn' ? '೪ ತೀರ್ಪುಗಾರರ ಮೌಲ್ಯಮಾಪನ ಸಿಂಕ್ ಸ್ಥಿತಿ (Online Sync Status):' : '4 Judges Evaluation Sync Status:'}</span>
                  <span className="text-stone-500 font-normal font-mono">
                    {Object.keys(targetParticipant.judgeScores || {}).length} / 4 {lang === 'kn' ? 'ಪೂರ್ಣಗೊಂಡಿದೆ' : 'Completed'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
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
                    {lang === 'kn' ? '5 ಮಾನದಂಡಗಳ ಮೌಲ್ಯಮಾಪನ (ಪ್ರತಿಯೊಂದಕ್ಕೆ 10 ಅಂಕಗಳು)' : '5 Evaluation Criteria (10 Marks Each)'}
                  </h4>
                  <span className="text-xs text-stone-500 font-medium font-mono">
                    {lang === 'kn' ? 'ಗರಿಷ್ಠ 50 ಅಂಕಗಳು' : 'Max 50 Marks'}
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
                      {lang === 'kn' ? 'ಒಟ್ಟು ಅಂಕಗಳು:' : 'Total Calculated:'}
                    </span>
                    <span className="text-2xl font-black font-mono text-amber-900">
                      {totalMarks} / 50
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      id="submit-judge-score-btn"
                      onClick={handleSubmitScore}
                      disabled={isSubmittingOnline}
                      className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95 font-serif-kannada disabled:opacity-50"
                    >
                      {isSubmittingOnline ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{lang === 'kn' ? 'ಲೈವ್ ಸಿಂಕ್ ಆಗುತ್ತಿದೆ...' : 'Syncing Live...'}</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>{lang === 'kn' ? 'ಅಂಕ ಸಲ್ಲಿಸಿ & ಲೈವ್ ಸಿಂಕ್ ಮಾಡಿ' : 'Save & Sync Online'}</span>
                        </>
                      )}
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
      )}
    </div>
  );
};
