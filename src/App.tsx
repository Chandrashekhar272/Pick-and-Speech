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
import { DEFAULT_TOPICS } from './data/defaultTopics';
import { DEFAULT_50_PARTICIPANTS } from './data/defaultParticipants';
import { 
  Topic, 
  Participant, 
  Language, 
  TimerConfig, 
  JudgeScore, 
  Category, 
  DifficultyLevel,
  NavigationTab
} from './types';
import { sound } from './utils/audio';

const STORAGE_KEY_TOPICS = 'pick_and_speech_topics_v4';
const STORAGE_KEY_PARTICIPANTS = 'parishath_registered_participants_v3';
const STORAGE_KEY_CONFIG = 'parishath_timer_config_v4';
const STORAGE_KEY_SCHOOL = 'pick_and_speech_school_name_v1';
const STORAGE_KEY_LANG = 'pick_and_speech_lang_v1';

export default function App() {
  // 1. Language state: defaults to Kannada (kn)
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG);
    return saved === 'en' ? 'en' : 'kn';
  });

  // 2. School / Venue Name
  const [schoolName, setSchoolName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_SCHOOL) || 'ಮೈಸೂರು ನಗರ ಕೇಂದ್ರ - ಸಹಕಾರ ಭವನ ಸಭಾಂಗಣ (Mysuru)';
  });

  // 3. Sound status
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // 4. Active Tab: 'pick' | 'timer' | 'judges' | 'admin'
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

  // 6. Participants: starts with ZERO (0) until user registers names
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PARTICIPANTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

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

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TOPICS, JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(timerConfig));
  }, [timerConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCHOOL, schoolName);
  }, [schoolName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  }, [lang]);

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

  // Reset all scores
  const handleResetAllScores = () => {
    setParticipants(prev => prev.map(p => ({
      ...p,
      scores: undefined,
      judgeScores: undefined,
      status: 'waiting'
    })));
  };

  // Add Participant (supports either full Participant object or name/chest/school)
  const handleAddParticipant = (
    nameOrParticipant: string | Participant,
    chestNo?: number,
    schoolOrClass?: string
  ) => {
    if (typeof nameOrParticipant === 'object') {
      setParticipants(prev => {
        const exists = prev.some(p => p.id === nameOrParticipant.id || p.chestNo === nameOrParticipant.chestNo);
        if (exists) {
          return prev.map(p => (p.chestNo === nameOrParticipant.chestNo ? nameOrParticipant : p));
        }
        return [...prev, nameOrParticipant];
      });
      return;
    }
    const newParticipant: Participant = {
      id: `p-${Date.now()}`,
      chestNo: chestNo || (participants.length + 1),
      name: nameOrParticipant,
      schoolOrClass: schoolOrClass || 'ಮೈಸೂರು',
      status: 'waiting'
    };
    setParticipants(prev => [...prev, newParticipant]);
  };

  const handleUpdateParticipantName = (id: string, name: string, chestNo?: number) => {
    setParticipants(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          name,
          ...(chestNo !== undefined ? { chestNo } : {})
        };
      }
      return p;
    }));
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
    setParticipants(prev => prev.filter(p => p.id !== id));
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

  // Load 50 participants list
  const handleLoadSampleParticipants = () => {
    setParticipants(DEFAULT_50_PARTICIPANTS);
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
        activeParticipantCount={participants.length}
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
            onDeleteParticipant={handleDeleteParticipant}
            onSelectForSpeech={handleSelectForSpeech}
            onOpenScoreForParticipant={handleOpenScoreForParticipant}
            onLoadSampleParticipants={handleLoadSampleParticipants}
            onClearAllParticipants={() => setParticipants([])}
            onAddTopic={handleAddTopic}
            onBulkAddTopics={handleBulkAddTopics}
            onDeleteTopic={handleDeleteTopic}
            onToggleTopicUsed={handleToggleTopicUsed}
            onResetToDefaultTopics={handleResetToDefaultTopics}
            onClearAllUsedStatus={handleClearAllUsedStatus}
            onResetAllScores={handleResetAllScores}
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
