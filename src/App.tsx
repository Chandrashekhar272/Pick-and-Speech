/**
 * Pick and Speech Competition App - ಆರಿಸಿ ಮಾತನಾಡು ಸ್ಪರ್ಧೆ
 * Specially designed for school competitions, Karnataka state schools, teachers, and students.
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ParishathHeader } from './components/ParishathHeader';
import { ChitPicker } from './components/ChitPicker';
import { SpeechTimer } from './components/SpeechTimer';
import { JudgesPortal } from './components/JudgesPortal';
import { AdminPortal } from './components/AdminPortal';
import { ScorecardModal } from './components/ScorecardModal';
import { StageModeModal } from './components/StageModeModal';
import { CertificatePortal } from './components/CertificatePortal';
import { ResetCompetitionModal } from './components/ResetCompetitionModal';
import { DEFAULT_TOPICS } from './data/defaultTopics';
import { DEFAULT_50_PARTICIPANTS, DEFAULT_31_PARISHATH_PARTICIPANTS, deduplicateParticipants } from './data/defaultParticipants';
import { DEFAULT_SIGNATORIES } from './data/defaultSignatories';
import { 
  Topic, 
  Participant, 
  Language, 
  TimerConfig, 
  JudgeScore, 
  Category, 
  DifficultyLevel,
  NavigationTab,
  CertificateSignatory
} from './types';
import { sound } from './utils/audio';
import { 
  useLiveSync, 
  resetScoresOnServer, 
  syncParticipantsToServer, 
  syncCurrentSpeakerToServer,
  deleteParticipantOnServer, 
  recordDeletedParticipantId,
  CHIEF_ADMIN_PASSWORD
} from './utils/onlineSync';
import { sanitizeCertificateText } from './utils/certificatePdf';

const STORAGE_KEY_TOPICS = 'pick_and_speech_topics_v4';
const STORAGE_KEY_PARTICIPANTS = 'parishath_registered_participants_v5';
const STORAGE_KEY_CONFIG = 'parishath_timer_config_v4';
const STORAGE_KEY_SCHOOL = 'pick_and_speech_school_name_v1';
const STORAGE_KEY_LANG = 'pick_and_speech_lang_v1';
const STORAGE_KEY_SIGNATORIES = 'pick_and_speech_signatories_v2';
const STORAGE_KEY_SIGNATORIES_LOCKED = 'pick_and_speech_signatories_locked_v2';
const STORAGE_KEY_COMPETITION_CLOSED = 'parishath_competition_closed_v1';

export default function App() {
  // 1. Language state: defaults to Kannada (kn)
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG);
    return saved === 'en' ? 'en' : 'kn';
  });

  // 2. School / Venue Name
  const [schoolName, setSchoolName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCHOOL);
      if (saved) {
        const cleaned = sanitizeCertificateText(saved);
        if (cleaned && cleaned.length > 2) return cleaned;
      }
    } catch {}
    return 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್ (ರಿ) ಮೈಸೂರು';
  });

  // 3. Sound status
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // 4. Active Tab: 'pick' | 'timer' | 'judges' | 'certificates' | 'admin'
  const [activeTab, setActiveTab] = useState<NavigationTab>('pick');

  // 5. Topics Bank
  const [topics, setTopics] = useState<Topic[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TOPICS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_TOPICS;
  });

  // 6. Participants: starts with registered 31 Parishath teachers
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PARTICIPANTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return deduplicateParticipants(parsed);
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_31_PARISHATH_PARTICIPANTS;
  });

  // 7. Six Official Signatories (Tandada Nayakaru, Mukhyastharu, Margadarshakaru, Sahakar Samiti, Rajya Tantrika Vibhaga, Samsthapaka Rajyadhyaksharu)
  const [signatories, setSignatories] = useState<CertificateSignatory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SIGNATORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_SIGNATORIES;
  });

  // Certificate Signatures Lock state: Default to true as user requested "lock madibidu"
  const [isSignaturesLocked, setIsSignaturesLocked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SIGNATORIES_LOCKED);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // fallback
    }
    return true; // Default locked as requested
  });

  // Real-time Live Sync hook for mobile judges and admin
  const { isOnline, isSyncing, activeJudges, triggerSync } = useLiveSync(
    participants,
    setParticipants
  );

  // 7. Active Topic & Active Participant
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [activeParticipant, setActiveParticipant] = useState<Participant | null>(null);

  // 8. Timer Configuration: Direct 3 minutes speech (No prep time needed, as requested: "tayaarige samay beda")
  const [timerConfig, setTimerConfig] = useState<TimerConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          prepTimeSeconds: 0,
          speechTimeSeconds: parsed.speechTimeSeconds || 180,
          warningBellSeconds: parsed.warningBellSeconds || 30,
          enableSound: parsed.enableSound !== undefined ? parsed.enableSound : true
        };
      }
    } catch {
      // fallback
    }
    return {
      prepTimeSeconds: 0,
      speechTimeSeconds: 180,
      warningBellSeconds: 30,
      enableSound: true
    };
  });

  // 9. Modals
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  const [isStageModeOpen, setIsStageModeOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOPICS, JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(participants));
    if (participants.length > 0) {
      syncParticipantsToServer(participants, schoolName);
    }
  }, [participants, schoolName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(timerConfig));
  }, [timerConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCHOOL, schoolName);
  }, [schoolName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SIGNATORIES, JSON.stringify(signatories));
  }, [signatories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SIGNATORIES_LOCKED, isSignaturesLocked ? 'true' : 'false');
  }, [isSignaturesLocked]);

  const handleToggleLockSignatures = () => {
    setIsSignaturesLocked(prev => !prev);
  };

  // Sound toggle
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setSoundEnabled(next);
  };

  // Language toggle
  const handleToggleLang = () => {
    setLang(prev => prev === 'kn' ? 'en' : 'kn');
  };

  // Topic Picked in ChitPicker
  const handleTopicPick = (topic: Topic) => {
    setActiveTopic(topic);
    if (activeParticipant) {
      setParticipants(prev => prev.map(p => {
        if (p.id === activeParticipant.id) {
          return { ...p, assignedTopic: topic };
        }
        return p;
      }));
    }
  };

  // Mark Topic as used/unused
  const handleMarkTopicUsed = (topicId: string, isUsed: boolean) => {
    setTopics(prev => prev.map(t => {
      if (t.id === topicId) {
        return { ...t, isUsed };
      }
      return t;
    }));
  };

  // Start Timer with a Topic
  const handleStartTimerWithTopic = (topic: Topic, participant?: Participant | null) => {
    setActiveTopic(topic);
    if (participant) {
      setActiveParticipant(participant);
      setParticipants(prev => prev.map(p => {
        if (p.id === participant.id) {
          return { ...p, assignedTopic: topic, status: 'speaking' };
        }
        return p;
      }));
    }
    setActiveTab('timer');
  };

  // Save Judge Score and auto-sync consolidated consensus across all judges
  const handleSaveScore = (participantId: string, score: JudgeScore) => {
    setParticipants(prev => prev.map(p => {
      if (p.id === participantId) {
        const currentJudgeScores = { ...(p.judgeScores || {}) };
        if (score.judgeId) {
          currentJudgeScores[score.judgeId] = score;
        }

        const judgeScoreList = Object.values(currentJudgeScores);
        const count = judgeScoreList.length;

        // Calculate consolidated consensus marks across all evaluating judges
        const avgContent = Math.round((judgeScoreList.reduce((acc, js) => acc + js.content, 0) / count) * 10) / 10;
        const avgLanguage = Math.round((judgeScoreList.reduce((acc, js) => acc + js.language, 0) / count) * 10) / 10;
        const avgPresentation = Math.round((judgeScoreList.reduce((acc, js) => acc + js.presentation, 0) / count) * 10) / 10;
        const avgTime = Math.round((judgeScoreList.reduce((acc, js) => acc + js.timeManagement, 0) / count) * 10) / 10;
        const avgImpact = Math.round((judgeScoreList.reduce((acc, js) => acc + js.impact, 0) / count) * 10) / 10;
        const avgTotal = Math.round((judgeScoreList.reduce((acc, js) => acc + js.total, 0) / count) * 10) / 10;

        const consensusScore: JudgeScore = {
          judgeId: 'consensus',
          judgeName: `${count}/4 ತೀರ್ಪುಗಾರರ ಸರಾಸರಿ`,
          content: avgContent,
          language: avgLanguage,
          presentation: avgPresentation,
          timeManagement: avgTime,
          impact: avgImpact,
          total: avgTotal,
          remarks: judgeScoreList.map(js => js.remarks).filter(Boolean).join(' | ') || score.remarks,
          timestamp: new Date().toLocaleTimeString('kn-IN')
        };

        return {
          ...p,
          scores: consensusScore,
          judgeScores: currentJudgeScores,
          status: 'completed'
        };
      }
      return p;
    }));
  };

  // Competition closed / finalized state
  const [isCompetitionClosed, setIsCompetitionClosed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('parishath_competition_closed_v1') === 'true';
    } catch {
      return false;
    }
  });

  const handleCloseCurrentCompetition = () => {
    setIsCompetitionClosed(true);
    try {
      localStorage.setItem('parishath_competition_closed_v1', 'true');
    } catch {}
  };

  const handleStartNewCompetition = (mode: 'sample50' | 'blank' | 'resetScoresOnly') => {
    setIsCompetitionClosed(false);
    try {
      localStorage.removeItem('parishath_competition_closed_v1');
    } catch {}

    // 1. Reset all topics used status
    const resetTopics = topics.map(t => ({ ...t, isUsed: false }));
    setTopics(resetTopics);
    try {
      localStorage.setItem(STORAGE_KEY_TOPICS, JSON.stringify(resetTopics));
    } catch {}

    // 2. Clear current speaker & topic on stage
    setActiveParticipant(null);
    setActiveTopic(null);

    // 3. Set participants based on mode
    let newParticipants: Participant[] = [];
    if (mode === 'sample50') {
      newParticipants = DEFAULT_50_PARTICIPANTS.map(p => ({
        ...p,
        scores: undefined,
        judgeScores: {},
        status: 'waiting' as const,
        assignedTopic: undefined
      }));
    } else if (mode === 'blank') {
      newParticipants = [];
    } else if (mode === 'resetScoresOnly') {
      newParticipants = participants.map(p => ({
        ...p,
        scores: undefined,
        judgeScores: {},
        status: 'waiting' as const,
        assignedTopic: undefined
      }));
    }

    setParticipants(newParticipants);
    resetScoresOnServer();
    syncParticipantsToServer(newParticipants, schoolName);

    // Navigate to spin wheel
    setActiveTab('pick');
  };

  // Comprehensive Round Reset: Clears 4 judges marks, topic picked states, and active speakers, but strictly preserves participant names and chest numbers
  const handleResetCompetitionRound = async () => {
    // 1. Reset participant marks & status (Names & chest numbers preserved 100%)
    const cleared: Participant[] = participants.map(p => ({
      ...p,
      scores: undefined,
      judgeScores: {},
      status: 'waiting' as const,
      assignedTopic: undefined
    }));
    setParticipants(cleared);
    setActiveParticipant(null);
    setActiveTopic(null);

    // 2. Reset all topics isUsed status so chits become unpicked
    const resetTopicsList: Topic[] = topics.map(t => ({
      ...t,
      isUsed: false
    }));
    setTopics(resetTopicsList);

    // 3. Reset on server
    try {
      await resetScoresOnServer(CHIEF_ADMIN_PASSWORD);
      await syncParticipantsToServer(cleared, schoolName);
      await syncCurrentSpeakerToServer(null, null);
    } catch (e) {
      console.error('Server sync error during competition reset:', e);
    }

    // 4. Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(cleared));
      localStorage.setItem(STORAGE_KEY_TOPICS, JSON.stringify(resetTopicsList));
    } catch {}

    // 5. Re-open competition if closed
    setIsCompetitionClosed(false);
    try {
      localStorage.setItem(STORAGE_KEY_COMPETITION_CLOSED, 'false');
    } catch {}
  };

  // Reset all scores and sync reset across all connected judges (preserves names & chits)
  const handleResetAllScores = () => {
    handleResetCompetitionRound();
  };

  // Add Participant (supports either full Participant object or name/chest/school)
  const handleAddParticipant = (
    nameOrParticipant: string | Participant,
    chestNo?: number,
    schoolOrClass?: string
  ) => {
    setParticipants(prev => {
      let updated: Participant[];
      if (typeof nameOrParticipant === 'object') {
        const exists = prev.some(p => p.id === nameOrParticipant.id || p.chestNo === nameOrParticipant.chestNo);
        if (exists) {
          updated = prev.map(p => (p.chestNo === nameOrParticipant.chestNo ? nameOrParticipant : p));
        } else {
          updated = [...prev, nameOrParticipant];
        }
      } else {
        const newParticipant: Participant = {
          id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          chestNo: chestNo || (prev.length + 1),
          name: nameOrParticipant,
          schoolOrClass: schoolOrClass || 'ಮೈಸೂರು',
          status: 'waiting'
        };
        updated = [...prev, newParticipant];
      }
      const deduped = deduplicateParticipants(updated);
      try {
        localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(deduped));
      } catch {}
      syncParticipantsToServer(deduped, schoolName);
      return deduped;
    });
  };

  // Bulk add or replace participants list and sync directly to server
  const handleBulkAddParticipants = (newParticipantList: Participant[], replace: boolean = false) => {
    setParticipants(prev => {
      const updated = replace ? newParticipantList : [...prev, ...newParticipantList];
      const deduped = deduplicateParticipants(updated);
      try {
        localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(deduped));
      } catch {}
      syncParticipantsToServer(deduped, schoolName);
      return deduped;
    });
  };

  const handleUpdateParticipantName = (id: string, name: string, chestNo?: number) => {
    setParticipants(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            name,
            ...(chestNo !== undefined ? { chestNo } : {})
          };
        }
        return p;
      });
      const deduped = deduplicateParticipants(updated);
      try {
        localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(deduped));
      } catch {}
      syncParticipantsToServer(deduped, schoolName);
      return deduped;
    });
    setActiveParticipant(prev => {
      if (prev && prev.id === id) {
        return {
          ...prev,
          name,
          ...(chestNo !== undefined ? { chestNo } : {})
        };
      }
      return prev;
    });
  };

  // Delete Participant
  const handleDeleteParticipant = (id: string) => {
    recordDeletedParticipantId(id);
    deleteParticipantOnServer(id);
    setParticipants(prev => {
      const updated = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(updated));
      } catch {}
      syncParticipantsToServer(updated, schoolName);
      return updated;
    });
    if (activeParticipant?.id === id) {
      setActiveParticipant(null);
    }
  };

  // Select Participant for speech
  const handleSelectForSpeech = (participant: Participant) => {
    setActiveParticipant(participant);
    if (participant.assignedTopic) {
      setActiveTopic(participant.assignedTopic);
    }
    setActiveTab('timer');
  };

  // Move to next speaker in competition
  const handleNextSpeaker = () => {
    if (participants.length === 0) {
      setActiveTab('pick');
      return;
    }
    const currentIndex = participants.findIndex(p => p.id === activeParticipant?.id);
    const nextIndex = (currentIndex >= 0 && currentIndex < participants.length - 1) ? currentIndex + 1 : 0;
    const nextParticipant = participants[nextIndex];
    setActiveParticipant(nextParticipant);
    if (nextParticipant.assignedTopic) {
      setActiveTopic(nextParticipant.assignedTopic);
    } else {
      setActiveTab('pick');
    }
  };

  // Open Score Modal directly for a participant
  const handleOpenScoreForParticipant = (participant: Participant) => {
    setActiveParticipant(participant);
    if (participant.assignedTopic) {
      setActiveTopic(participant.assignedTopic);
    }
    setIsScorecardOpen(true);
  };

  // Load 50 participants list and sync with server
  const handleLoadSampleParticipants = () => {
    setParticipants(DEFAULT_50_PARTICIPANTS);
    syncParticipantsToServer(DEFAULT_50_PARTICIPANTS, schoolName);
  };

  // Clear all participants for fresh live program
  const handleClearAllParticipants = () => {
    setParticipants([]);
    setActiveParticipant(null);
    syncParticipantsToServer([], schoolName);
  };

  // Topic Manager operations
  const handleAddTopic = (newTopic: Omit<Topic, 'id' | 'number'>) => {
    const maxNum = topics.reduce((max, t) => Math.max(max, t.number), 0);
    const created: Topic = {
      ...newTopic,
      id: `topic-${Date.now()}`,
      number: maxNum + 1
    };
    setTopics(prev => [...prev, created]);
  };

  const handleBulkAddTopics = (titles: string[], category: Category, level: DifficultyLevel) => {
    let currentMax = topics.reduce((max, t) => Math.max(max, t.number), 0);
    const newItems: Topic[] = titles.map((title, i) => ({
      id: `bulk-${Date.now()}-${i}`,
      number: ++currentMax,
      titleKn: title,
      titleEn: title,
      category,
      level,
      hintsKn: [title],
      hintsEn: [title],
      isUsed: false
    }));
    setTopics(prev => [...prev, ...newItems]);
  };

  const handleDeleteTopic = (id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
  };

  const handleToggleTopicUsed = (id: string, isUsed: boolean) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, isUsed } : t));
  };

  const handleResetToDefaultTopics = () => {
    setTopics(DEFAULT_TOPICS);
  };

  const handleClearAllUsedStatus = () => {
    setTopics(prev => prev.map(t => ({ ...t, isUsed: false })));
  };

  return (
    <div className="min-h-screen bg-stone-50/70 text-stone-900 flex flex-col">
      {/* Navigation Bar */}
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenStageMode={() => setIsStageModeOpen(true)}
        onOpenResetRound={() => setIsResetModalOpen(true)}
        activeParticipantCount={participants.length}
        isCompetitionClosed={isCompetitionClosed}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Official Banner Header */}
        <ParishathHeader lang={lang} className="mb-6 print:hidden" />

        {/* Tab 1: Pick Topic Chit */}
        {activeTab === 'pick' && (
          <ChitPicker
            lang={lang}
            topics={topics}
            onTopicPick={handleTopicPick}
            onMarkTopicUsed={handleMarkTopicUsed}
            participants={participants}
            currentParticipant={activeParticipant}
            onSelectParticipant={setActiveParticipant}
            onStartTimerWithTopic={handleStartTimerWithTopic}
            onRegisterParticipant={handleAddParticipant}
            onUpdateParticipantName={handleUpdateParticipantName}
            onDeleteParticipant={handleDeleteParticipant}
            onClearAllParticipants={handleClearAllParticipants}
          />
        )}

        {/* Tab 2: Speech Timer */}
        {activeTab === 'timer' && (
          <SpeechTimer
            lang={lang}
            activeTopic={activeTopic}
            activeParticipant={activeParticipant}
            participants={participants}
            onSelectParticipant={setActiveParticipant}
            timerConfig={timerConfig}
            onUpdateTimerConfig={setTimerConfig}
            onOpenScorecard={() => setIsScorecardOpen(true)}
            onOpenStageMode={() => setIsStageModeOpen(true)}
            onBackToPicker={() => setActiveTab('pick')}
            onNextSpeaker={handleNextSpeaker}
          />
        )}

        {/* Tab 3: Judges Login Menu (5 Criteria Evaluation) */}
        {activeTab === 'judges' && (
          <JudgesPortal
            lang={lang}
            participants={participants}
            currentParticipant={activeParticipant}
            onSelectParticipant={setActiveParticipant}
            onSaveScore={handleSaveScore}
          />
        )}

        {/* Tab: Digital E-Certificates (For all registered participants) */}
        {activeTab === 'certificates' && (
          <CertificatePortal
            lang={lang}
            schoolName={schoolName}
            participants={participants}
            signatories={signatories}
            onUpdateSignatories={setSignatories}
            onDeleteParticipant={handleDeleteParticipant}
            isSignaturesLocked={isSignaturesLocked}
            onToggleLockSignatures={handleToggleLockSignatures}
          />
        )}

        {/* Tab 4: Admin Menu (All Final Results & Competition Management) */}
        {activeTab === 'admin' && (
          <AdminPortal
            lang={lang}
            schoolName={schoolName}
            onUpdateSchoolName={setSchoolName}
            participants={participants}
            topics={topics}
            timerConfig={timerConfig}
            onUpdateTimerConfig={setTimerConfig}
            onAddParticipant={handleAddParticipant}
            onBulkAddParticipants={handleBulkAddParticipants}
            onUpdateParticipantName={handleUpdateParticipantName}
            onDeleteParticipant={handleDeleteParticipant}
            onSelectForSpeech={handleSelectForSpeech}
            onOpenScoreForParticipant={handleOpenScoreForParticipant}
            onLoadSampleParticipants={handleLoadSampleParticipants}
            onClearAllParticipants={handleClearAllParticipants}
            onAddTopic={handleAddTopic}
            onBulkAddTopics={handleBulkAddTopics}
            onDeleteTopic={handleDeleteTopic}
            onToggleTopicUsed={handleToggleTopicUsed}
            onResetToDefaultTopics={handleResetToDefaultTopics}
            onClearAllUsedStatus={handleClearAllUsedStatus}
            onResetAllScores={handleResetAllScores}
            signatories={signatories}
            onUpdateSignatories={setSignatories}
            isSignaturesLocked={isSignaturesLocked}
            onToggleLockSignatures={handleToggleLockSignatures}
            isOnline={isOnline}
            isSyncing={isSyncing}
            activeJudges={activeJudges}
            onTriggerSync={triggerSync}
            isCompetitionClosed={isCompetitionClosed}
            onCloseCurrentCompetition={handleCloseCurrentCompetition}
            onStartNewCompetition={handleStartNewCompetition}
          />
        )}
      </main>

      {/* Scorecard Modal */}
      <ScorecardModal
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
        lang={lang}
        participant={activeParticipant}
        topic={activeTopic}
        onSaveScore={handleSaveScore}
      />

      {/* Fullscreen Stage / Projector Mode */}
      <StageModeModal
        isOpen={isStageModeOpen}
        onClose={() => setIsStageModeOpen(false)}
        lang={lang}
        schoolName={schoolName}
        activeTopic={activeTopic}
        activeParticipant={activeParticipant}
        timerConfig={timerConfig}
      />

      {/* Safe Competition Round Reset Modal (Preserves Participant Names) */}
      <ResetCompetitionModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        lang={lang}
        onConfirmReset={handleResetCompetitionRound}
        participantCount={participants.length}
      />

      {/* Footer with Parishath Branding */}
      <footer className="mt-auto border-t-2 border-amber-200/90 bg-white/90 py-5 text-xs text-stone-600 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-0.5">
            <div className="font-bold text-amber-950 font-serif-kannada text-sm">
              {lang === 'kn'
                ? 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್ (ರಿ) ಮೈಸೂರು'
                : 'Karnataka Rajya Shikshakar Pratibha Parishath (R) Mysuru'}
            </div>
            <div className="text-[11px] text-amber-800">
              {lang === 'kn'
                ? 'ತಾಂತ್ರಿಕ ಶಿಕ್ಷಕರ ಸಮಿತಿಯ ವತಿಯಿಂದ • ಸಹಕಾರ ಸಮಿತಿಯ ಹಂತದ ಕಾರ್ಯಕ್ರಮ - ಆಶುಭಾಷಣ ಸ್ಪರ್ಧೆ'
                : 'Technical Teachers Committee • Cooperative Society Level Event - Aashubhashana Spardhe'}
            </div>
          </div>
          <div className="text-[11px] text-stone-500 font-serif-kannada">
            {lang === 'kn'
              ? 'ಶಿಕ್ಷಕರ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿಗಳ ಪ್ರತಿಭೆ ಅನಾವರಣಗೊಳಿಸುವ ಡಿಜಿಟಲ್ ವೇದಿಕೆ'
              : 'Digital Platform for Teachers & Student Talents'}
          </div>
        </div>
      </footer>
    </div>
  );
}
