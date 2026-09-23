import React, { useState, useMemo, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  RotateCw, 
  CheckCircle2, 
  Play, 
  Grid, 
  Disc, 
  RefreshCw,
  Lightbulb,
  UserPlus,
  Edit3,
  Check,
  User,
  Crown,
  Scroll,
  Landmark,
  Flag,
  Waves,
  Rocket,
  Flame,
  Feather,
  Music,
  Shuffle,
  Eye,
  AlertCircle,
  Clock,
  Quote,
  X,
  Award,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Topic, Participant, Language, Category } from '../types';
import { CATEGORY_LABELS } from '../data/defaultTopics';
import { getTopicVisual, TopicVisual } from '../data/topicVisuals';
import { sound } from '../utils/audio';
import { ParticipantRegistrationModal } from './ParticipantRegistrationModal';

interface ChitPickerProps {
  lang: Language;
  topics: Topic[];
  onTopicPick: (topic: Topic) => void;
  onMarkTopicUsed: (topicId: string, isUsed: boolean) => void;
  participants: Participant[];
  currentParticipant: Participant | null;
  onSelectParticipant: (participant: Participant | null) => void;
  onStartTimerWithTopic: (topic: Topic, participant?: Participant | null) => void;
  onRegisterParticipant?: (participant: Participant) => void;
  onUpdateParticipantName?: (id: string, name: string, chestNo?: number) => void;
}

export const ChitPicker: React.FC<ChitPickerProps> = ({
  lang,
  topics,
  onTopicPick,
  onMarkTopicUsed,
  participants,
  currentParticipant,
  onSelectParticipant,
  onStartTimerWithTopic,
  onRegisterParticipant,
  onUpdateParticipantName
}) => {
  // Mode: wheel is primary default as requested by user
  const [pickerMode, setPickerMode] = useState<'wheel' | 'grid' | 'bowl'>('wheel');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unused' | 'used'>('all');

  // Participant quick registration state
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isAddingNewInline, setIsAddingNewInline] = useState(false);
  const [directSpeakerName, setDirectSpeakerName] = useState('');
  const [directChestNo, setDirectChestNo] = useState<number>(1);
  const [directSchool, setDirectSchool] = useState('');
  const [saveConfirmation, setSaveConfirmation] = useState(false);

  // Spin Wheel & Chit State
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Drawn number & revealed topic state
  const [drawnChitNumber, setDrawnChitNumber] = useState<number | null>(null);
  const [revealedTopic, setRevealedTopic] = useState<Topic | null>(null);
  const [isChitOpened, setIsChitOpened] = useState(false);
  const [isColourfulModalOpen, setIsColourfulModalOpen] = useState(false);

  // Ref to 50 numbers grid container for smooth scroll
  const gridSectionRef = useRef<HTMLDivElement>(null);
  const highlightedChitRef = useRef<HTMLButtonElement>(null);

  // Topic shuffle seed so each chit number can have a randomized or direct linked topic
  const [topicShuffleSeed, setTopicShuffleSeed] = useState<number[]>(() => {
    return Array.from({ length: 50 }, (_, i) => i + 1);
  });

  // Calculate next available chest number
  const nextChestNo = useMemo(() => {
    if (participants.length === 0) return 1;
    const maxChest = Math.max(...participants.map(p => p.chestNo), 0);
    return maxChest + 1;
  }, [participants]);

  // Sync direct input fields when current participant changes
  useEffect(() => {
    if (currentParticipant) {
      setDirectSpeakerName(currentParticipant.name);
      setDirectChestNo(currentParticipant.chestNo);
      setDirectSchool(currentParticipant.schoolOrClass || '');
    } else {
      setDirectSpeakerName('');
      setDirectChestNo(nextChestNo);
      setDirectSchool('');
    }
  }, [currentParticipant, nextChestNo]);

  // Handle saving direct participant name entry
  const handleApplyDirectName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = directSpeakerName.trim();
    if (!trimmed) return;

    if (currentParticipant && !isAddingNewInline && onUpdateParticipantName) {
      onUpdateParticipantName(currentParticipant.id, trimmed, directChestNo);
    } else if (onRegisterParticipant) {
      const newP: Participant = {
        id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        chestNo: directChestNo,
        name: trimmed,
        schoolOrClass: directSchool.trim() || (lang === 'kn' ? 'ಸ್ಪರ್ಧಿ' : 'Participant'),
        status: 'waiting'
      };
      onRegisterParticipant(newP);
      onSelectParticipant(newP);
      setIsAddingNewInline(false);
    }
    setSaveConfirmation(true);
    setTimeout(() => setSaveConfirmation(false), 2000);
  };

  // Shuffle topic links among chits
  const handleShuffleTopics = () => {
    const arr = [...topicShuffleSeed];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setTopicShuffleSeed(arr);
    sound.playTick();
  };

  // Get topic linked to a chit number (1 to 50)
  const getLinkedTopic = (chitNo: number): Topic => {
    // 1. If participant with this chest number has an assigned topic, prefer it
    const matchedParticipant = participants.find(p => p.chestNo === chitNo);
    if (matchedParticipant?.assignedTopic) {
      return matchedParticipant.assignedTopic;
    }
    // 2. Map via shuffle seed to topics bank
    const topicNumIndex = topicShuffleSeed[(chitNo - 1) % topicShuffleSeed.length];
    const found = topics.find(t => t.number === topicNumIndex);
    if (found) return found;
    // Fallback to direct number
    return topics[(chitNo - 1) % topics.length] || topics[0];
  };

  // All 50 topics numbers available for the spin wheel and the 50 numbers grid below
  const all50Numbers = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => i + 1);
  }, []);

  // Filtered 50 numbers list
  const filtered50Numbers = useMemo(() => {
    return all50Numbers.filter(num => {
      const topic = getLinkedTopic(num);
      if (selectedFilter === 'unused') return !topic.isUsed;
      if (selectedFilter === 'used') return topic.isUsed;
      return true;
    });
  }, [all50Numbers, selectedFilter, topicShuffleSeed, topics, participants]);

  // When touching / selecting any number from the 50 numbers or wheel
  const handleSelectChitNumber = (chitNo: number, openModalDirectly: boolean = true) => {
    setDrawnChitNumber(chitNo);
    const linkedTopic = getLinkedTopic(chitNo);
    setRevealedTopic(linkedTopic);
    setIsChitOpened(true);
    sound.playChitReveal();
    onTopicPick(linkedTopic);

    // Auto-select corresponding participant if registered with this chest number
    const matchingParticipant = participants.find(p => p.chestNo === chitNo);
    if (matchingParticipant && !currentParticipant) {
      onSelectParticipant(matchingParticipant);
    }

    if (openModalDirectly) {
      setIsColourfulModalOpen(true);
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#dc2626', '#eab308', '#d97706', '#16a34a', '#2563eb', '#9333ea']
        });
      } catch {
        // safe fallback
      }
    }
  };

  // Spin Wheel action: accurately lands on a winning number
  const handleSpinWheel = () => {
    if (isDrawing) return;
    setIsDrawing(true);
    setDrawnChitNumber(null);
    setRevealedTopic(null);
    setIsChitOpened(false);
    setIsColourfulModalOpen(false);

    // Choose winning number from 1 to 50 (preferring unused if any)
    const unusedNumbers = all50Numbers.filter(n => !getLinkedTopic(n).isUsed);
    const pool = unusedNumbers.length > 0 ? unusedNumbers : all50Numbers;
    const winningChitNo = pool[Math.floor(Math.random() * pool.length)];

    // Exact rotational geometry:
    // Total slices = 50, each slice = 7.2 degrees
    const sliceAngle = 360 / 50;
    const winningIndex = winningChitNo - 1; // 0-based
    const sliceCenterAngle = (winningIndex + 0.5) * sliceAngle;
    
    // Top pointer is at 0 degrees (12 o'clock). To bring sliceCenterAngle to the top:
    const targetModAngle = (360 - sliceCenterAngle) % 360;
    const currentRotMod = wheelRotation % 360;
    const diff = (targetModAngle - currentRotMod + 360) % 360;
    
    // 5 to 7 full revolutions for exciting realistic spin
    const fullSpins = 1800 + (Math.floor(Math.random() * 2) * 360);
    const newRotation = wheelRotation + fullSpins + diff;
    setWheelRotation(newRotation);

    // Sound ticks during spin
    sound.unlockAudio();
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      tickCount++;
      if (tickCount % 2 === 0) sound.playTick();
      if (tickCount >= 18) clearInterval(tickInterval);
    }, 140);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsDrawing(false);
      // Select the winning number and display it among the 50 numbers below!
      handleSelectChitNumber(winningChitNo, false);

      // Play chime fanfare
      sound.playChitReveal();

      // Confetti burst
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.4 },
          colors: ['#dc2626', '#eab308', '#d97706', '#16a34a', '#2563eb']
        });
      } catch {
        // safe fallback
      }

      // Smooth scroll to the highlighted number in the 50-grid
      setTimeout(() => {
        if (highlightedChitRef.current) {
          highlightedChitRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 300);

    }, 2800);
  };

  // Helper to render topic symbol icon
  const renderTopicIcon = (symbol: TopicVisual['symbol'], className: string = 'w-6 h-6') => {
    switch (symbol) {
      case 'crown': return <Crown className={className} />;
      case 'sword': return <SwordIcon className={className} />;
      case 'scroll': return <Scroll className={className} />;
      case 'temple': return <Landmark className={className} />;
      case 'palace': return <Landmark className={className} />;
      case 'flag': return <Flag className={className} />;
      case 'river': return <Waves className={className} />;
      case 'rocket': return <Rocket className={className} />;
      case 'lamp': return <Flame className={className} />;
      case 'feather': return <Feather className={className} />;
      case 'drum': return <Music className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  return (
    <div className="space-y-6">

      {/* 1. SPEAKER REGISTRATION & ON-THE-SPOT PREPARATION BAR */}
      <div className="bg-gradient-to-r from-amber-100/90 via-yellow-50 to-amber-100/90 rounded-3xl p-5 border-2 border-amber-300 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          
          {/* A. DIRECT SPEAKER NAME ENTRY */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-3.5 sm:p-4 border-2 border-amber-300 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-amber-900 font-serif-kannada flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                <span>
                  {isAddingNewInline || participants.length === 0
                    ? (lang === 'kn' ? 'ಹೊಸ ಸ್ಪರ್ಧಿಯ ಹೆಸರು ಬರೆದು ಸಿದ್ಧಗೊಳಿಸಿ:' : 'Write Speaker Name to Prepare:')
                    : (lang === 'kn' ? 'ಪ್ರಸ್ತುತ ಸ್ಪರ್ಧಿಯ ಹೆಸರು ತಿದ್ದುಪಡಿ / ಹೊಸತು ಸೇರಿಸಿ:' : 'Edit Speaker Name / Add New:')}
                </span>
              </label>

              {saveConfirmation && (
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {lang === 'kn' ? 'ಸಿದ್ಧಗೊಂಡಿದೆ!' : 'Prepared & Added!'}
                </span>
              )}
            </div>

            <form onSubmit={handleApplyDirectName} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Chest Number */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[11px] font-bold text-stone-500 font-serif-kannada">
                  {lang === 'kn' ? 'ಚೆಸ್ಟ್:' : 'Chest:'}
                </span>
                <input
                  id="direct-chest-input"
                  type="number"
                  min="1"
                  max="999"
                  value={directChestNo}
                  onChange={(e) => setDirectChestNo(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-2 text-center text-sm font-bold font-mono rounded-xl border-2 border-amber-300 bg-amber-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
                  placeholder="No"
                  required
                />
              </div>

              {/* Name input */}
              <input
                id="direct-speaker-name-input"
                type="text"
                value={directSpeakerName}
                onChange={(e) => setDirectSpeakerName(e.target.value)}
                placeholder={lang === 'kn' ? 'ಸ್ಪರ್ಧಿಯ ಹೆಸರು ಬರೆಯಿರಿ (ಉದಾ: ರಮೇಶ್, ಕಾವ್ಯ...)' : 'Type speaker name here...'}
                className="flex-1 px-3 py-2 text-sm font-semibold rounded-xl border-2 border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 placeholder:text-stone-400"
                required
              />

              {/* School / Class input */}
              <input
                id="direct-speaker-school-input"
                type="text"
                value={directSchool}
                onChange={(e) => setDirectSchool(e.target.value)}
                placeholder={lang === 'kn' ? 'ಶಾಲೆ / ತರಗತಿ (ಐಚ್ಛಿಕ)' : 'School/Class'}
                className="w-36 px-2.5 py-2 text-xs font-medium rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-700 hidden sm:block"
              />

              {/* Submit / Prepare Button */}
              <button
                id="apply-speaker-name-button"
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'kn' ? 'ಸಿದ್ಧಗೊಳಿಸಿ' : 'Save Speaker'}</span>
              </button>
            </form>

            {participants.length > 0 && !isAddingNewInline && (
              <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
                <span>{lang === 'kn' ? 'ಹೊಸ ಸ್ಪರ್ಧಿಯನ್ನು ಸೇರಿಸಬೇಕೆ?' : 'Add another speaker?'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewInline(true);
                    setDirectSpeakerName('');
                    setDirectChestNo(nextChestNo);
                    setDirectSchool('');
                  }}
                  className="text-amber-700 font-bold hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{lang === 'kn' ? '+ ಹೊಸ ಸ್ಪರ್ಧಿ ಸೇರಿಸಿ' : '+ Add New Speaker'}</span>
                </button>
              </div>
            )}
          </div>

          {/* B. DROPDOWN SELECTION */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-3.5 sm:p-4 border-2 border-amber-300 shadow-2xs flex flex-col justify-between">
            <div>
              <label className="text-xs font-bold text-amber-900 font-serif-kannada flex items-center justify-between mb-1.5">
                <span>{lang === 'kn' ? 'ಸ್ಪರ್ಧಿಗಳ ಆಯ್ಕೆ ಪಟ್ಟಿ:' : 'Speakers Selection List:'}</span>
                <span className="text-[11px] text-amber-700 font-mono">({participants.length} ಸ್ಪರ್ಧಿಗಳು)</span>
              </label>

              <select
                id="active-participant-select"
                value={currentParticipant?.id || ''}
                disabled={participants.length === 0}
                onChange={(e) => {
                  const found = participants.find(p => p.id === e.target.value) || null;
                  onSelectParticipant(found);
                }}
                className={`w-full text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 border-2 transition focus:outline-none focus:ring-2 ${
                  participants.length === 0
                    ? 'bg-stone-100 border-stone-300 text-stone-400 cursor-not-allowed'
                    : 'bg-amber-50/70 border-amber-400 text-stone-900 focus:ring-amber-500'
                }`}
              >
                {participants.length === 0 ? (
                  <option value="">
                    {lang === 'kn' 
                      ? '-- ಹೆಸರು ಬರೆದು ಸೇರಿಸಿ (0 ಸ್ಪರ್ಧಿಗಳು) --' 
                      : '-- Add speaker name on left first --'}
                  </option>
                ) : (
                  <>
                    <option value="">
                      {lang === 'kn' 
                        ? `-- ಸ್ಪರ್ಧಿಯನ್ನು ಆರಿಸಿ (${participants.length} ಲಭ್ಯ) --` 
                        : `-- Choose Speaker (${participants.length} available) --`}
                    </option>
                    {participants.map(p => (
                      <option key={p.id} value={p.id}>
                        #{p.chestNo} {p.name} {p.schoolOrClass ? `(${p.schoolOrClass})` : ''}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Current Active Speaker pill */}
            {currentParticipant ? (
              <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-amber-700 text-white font-bold text-xs flex items-center justify-center font-mono">
                    #{currentParticipant.chestNo}
                  </span>
                  <div>
                    <span className="font-bold text-stone-900 font-serif-kannada">{currentParticipant.name}</span>
                    {currentParticipant.schoolOrClass && (
                      <span className="text-stone-500 ml-1 text-[11px]">({currentParticipant.schoolOrClass})</span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300">
                  {lang === 'kn' ? 'ಸಿದ್ಧ' : 'Ready'}
                </span>
              </div>
            ) : (
              <div className="mt-2 text-[11px] text-stone-500 italic">
                {lang === 'kn' ? '👉 ಸ್ಪರ್ಧಿಯ ಹೆಸರು ಬರೆಯಿರಿ ಅಥವಾ ಡ್ರಾಪ್‌ಡೌನ್‌ನಿಂದ ಆರಿಸಿ.' : '👉 Write name on the left or select from dropdown.'}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 2. MAIN STAGE: SPIN WHEEL (ಅದೃಷ್ಟ ಚಕ್ರ) & TOPIC PRESENTATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER: THE INTERACTIVE SPIN WHEEL */}
        <div className="lg:col-span-7 bg-gradient-to-b from-amber-50/90 via-stone-50 to-amber-100/50 rounded-3xl p-6 border-2 border-amber-300 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* Header Title with Sound & Shuffle */}
          <div className="w-full flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-red-600 via-amber-600 to-amber-700 text-white text-xs font-bold font-serif-kannada shadow-2xs flex items-center gap-1.5">
                <Disc className="w-3.5 h-3.5 text-yellow-300" />
                <span>{lang === 'kn' ? 'ಶಿಕ್ಷಣ & ಗುರು ಮಹಿಮೆಯ ಅದೃಷ್ಟ ಚಕ್ರ' : 'Teachers & Education Spin Wheel'}</span>
              </span>
              <span className="text-xs text-stone-500 font-mono hidden sm:inline">
                (೫೦ ಚೀಟಿಗಳು)
              </span>
            </div>

            <button
              onClick={handleShuffleTopics}
              title={lang === 'kn' ? 'ಚೀಟಿಗಳಿಗೆ ವಿಷಯಗಳನ್ನು ಶಫಲ್ ಮಾಡಿ' : 'Shuffle Topic Mapping'}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-medium flex items-center gap-1 transition shadow-2xs"
            >
              <Shuffle className="w-3 h-3 text-amber-700" />
              <span>{lang === 'kn' ? 'ಶಫಲ್' : 'Shuffle'}</span>
            </button>
          </div>

          <p className="text-xs text-stone-600 mb-2 text-center font-serif-kannada">
            {lang === 'kn' 
              ? 'ಚಕ್ರ ತಿರುಗಿಸಿ! ಚಕ್ರದಲ್ಲಿ ಬರುವ ಸಂಖ್ಯೆ ಕೆಳಗಿನ ೫೦ ಸಂಖ್ಯೆಗಳಲ್ಲಿ ಪ್ರಕಾಶಿಸುತ್ತದೆ.'
              : 'Spin the wheel! The drawn number will glow in the 50 numbers below.'}
          </p>

          {/* Spin Wheel Disc Component */}
          <div className="relative my-3 w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 flex items-center justify-center select-none">
            
            {/* Top Golden Pointer */}
            <div className="absolute -top-4 z-30 flex flex-col items-center pointer-events-none drop-shadow-xl">
              <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-red-600" />
              <div className="w-3.5 h-3.5 rounded-full bg-yellow-300 -mt-6 border-2 border-red-800 shadow-md animate-pulse" />
            </div>

            {/* Rotating SVG Wheel Disc */}
            <div
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                transition: isDrawing ? 'transform 2.8s cubic-bezier(0.12, 0.88, 0.22, 1)' : 'none'
              }}
              className="w-full h-full rounded-full border-8 border-amber-800 shadow-2xl overflow-hidden relative flex items-center justify-center bg-amber-100"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {all50Numbers.map((num, idx) => {
                  const total = 50;
                  const sliceAngle = 360 / total; // 7.2 degrees
                  const startAngle = idx * sliceAngle;
                  
                  // Coordinate geometry
                  const rad1 = (startAngle - 90) * (Math.PI / 180);
                  const rad2 = (startAngle + sliceAngle - 90) * (Math.PI / 180);
                  const x1 = 50 + 50 * Math.cos(rad1);
                  const y1 = 50 + 50 * Math.sin(rad1);
                  const x2 = 50 + 50 * Math.cos(rad2);
                  const y2 = 50 + 50 * Math.sin(rad2);
                  const largeArc = sliceAngle > 180 ? 1 : 0;
                  
                  // Alternating Karnataka Flag & Royal Empire Palette: Red, Golden Yellow, Amber, Maroon
                  const colors = ['#dc2626', '#eab308', '#b45309', '#f59e0b', '#991b1b', '#d97706'];
                  const fillColor = colors[idx % colors.length];

                  // Mid angle for number label
                  const midAngle = startAngle + sliceAngle / 2;
                  const textRad = (midAngle - 90) * (Math.PI / 180);
                  const textX = 50 + 36 * Math.cos(textRad);
                  const textY = 50 + 36 * Math.sin(textRad);

                  return (
                    <g key={num}>
                      <path
                        d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={fillColor}
                        stroke="#78350f"
                        strokeWidth="0.4"
                      />
                      <text
                        x={textX}
                        y={textY}
                        fill="#ffffff"
                        fontSize="3.2"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${midAngle + 90} ${textX} ${textY})`}
                        style={{ filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.8))' }}
                      >
                        {num}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Wheel Center Brass Hub with Click-to-Spin */}
              <button
                type="button"
                onClick={handleSpinWheel}
                disabled={isDrawing}
                className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-amber-950 via-amber-700 to-yellow-400 border-4 border-white shadow-2xl flex flex-col items-center justify-center text-white font-bold z-20 cursor-pointer hover:scale-105 active:scale-95 transition disabled:opacity-80"
              >
                <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
                <span className="text-[11px] font-black uppercase font-serif-kannada tracking-wide">
                  {lang === 'kn' ? 'ತಿರುಗಿಸಿ' : 'SPIN'}
                </span>
              </button>
            </div>
          </div>

          {/* Primary Spin Button */}
          <button
            id="spin-wheel-button"
            onClick={handleSpinWheel}
            disabled={isDrawing}
            className="mt-4 px-10 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-700 hover:from-red-700 hover:to-amber-800 text-white font-black text-base shadow-lg hover:shadow-xl flex items-center gap-3 transition active:scale-95 disabled:opacity-50 border-2 border-yellow-300/60 font-serif-kannada"
          >
            <RotateCw className={`w-5 h-5 ${isDrawing ? 'animate-spin' : ''}`} />
            <span>{isDrawing ? (lang === 'kn' ? 'ಚಕ್ರ ತಿರುಗುತ್ತಿದೆ...' : 'Spinning...') : (lang === 'kn' ? 'ಅದೃಷ್ಟ ಚಕ್ರ ತಿರುಗಿಸಿ! (Spin Wheel)' : 'Spin the Wheel!')}</span>
          </button>

          {/* Announcement banner when a number is drawn */}
          {drawnChitNumber !== null && (
            <div className="mt-4 w-full p-3.5 rounded-2xl bg-gradient-to-r from-red-100 via-yellow-100 to-amber-100 border-2 border-amber-400 text-center animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-xl">🎉</span>
                <span className="font-bold text-amber-950 font-serif-kannada text-sm sm:text-base">
                  {lang === 'kn' 
                    ? `ಅದೃಷ್ಟ ಚಕ್ರದಲ್ಲಿ ಸಂಖ್ಯೆ #${drawnChitNumber} ಬಂದಿದೆ!` 
                    : `Lucky Number #${drawnChitNumber} Drawn on Wheel!`}
                </span>
                <button
                  onClick={() => setIsColourfulModalOpen(true)}
                  className="ml-2 px-3 py-1 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{lang === 'kn' ? 'ವಿಷಯ & ಉಲ್ಲೇಖಗಳನ್ನು ನೋಡಿ' : 'View Topic & Quotes'}</span>
                </button>
              </div>
              <p className="text-xs text-amber-900 mt-1 font-serif-kannada">
                👇 <b>ಕೆಳಗಿನ ೫೦ ಸಂಖ್ಯೆಗಳ ಪಟ್ಟಿಯಲ್ಲಿ ಸಂಖ್ಯೆ #{drawnChitNumber} ಹೊಳೆಯುತ್ತಿದೆ!</b> ಅದರ ಮೇಲೆ ಟಚ್ ಮಾಡಿ ವಿಷಯ ತೆರೆಯಿರಿ.
              </p>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: PREVIEW OF DRAWN TOPIC WITH QUOTES & ELEMENTS */}
        <div className="lg:col-span-5 flex flex-col">
          {revealedTopic ? (() => {
            const visual = getTopicVisual(revealedTopic.number);
            return (
              <div 
                id="revealed-topic-side-card"
                className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-amber-400 shadow-xl relative overflow-hidden transition-all animate-in fade-in"
              >
                {/* Colorful Header Banner */}
                <div className={`-mx-5 -mt-5 sm:-mx-6 sm:-mt-6 p-4 bg-gradient-to-r ${visual.gradient} text-white relative overflow-hidden`}>
                  <div className="absolute right-0 top-0 bottom-0 opacity-20 flex items-center pr-2 pointer-events-none">
                    {renderTopicIcon(visual.symbol, 'w-32 h-32')}
                  </div>

                  <div className="flex items-center justify-between gap-2 relative z-10">
                    <div className="flex items-center gap-2.5">
                      <span className="w-10 h-10 rounded-xl bg-white/25 backdrop-blur-xs border border-white/50 text-white font-mono font-black text-lg flex items-center justify-center shadow-xs">
                        #{revealedTopic.number}
                      </span>
                      <div>
                        <span className="text-[11px] font-bold tracking-wider uppercase opacity-95 block font-serif-kannada">
                          {visual.heritageBadgeKn}
                        </span>
                        <h4 className="text-xs font-semibold text-yellow-200">
                          {visual.eraKn}
                        </h4>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsColourfulModalOpen(true)}
                      className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1 border border-white/40 transition"
                      title="ದೊಡ್ಡ ಪರದೆಯಲ್ಲಿ ನೋಡಿ"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{lang === 'kn' ? 'ದೊಡ್ಡದಾಗಿ' : 'Expand'}</span>
                    </button>
                  </div>
                </div>

                {/* Famous Quote Element Banner */}
                {visual.quoteKn && (
                  <div className="mt-4 px-3.5 py-2.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-xs font-bold text-amber-950 font-serif-kannada flex items-start gap-2 shadow-2xs">
                    <Quote className="w-5 h-5 text-amber-700 shrink-0 rotate-180 mt-0.5" />
                    <span className="italic leading-relaxed">{visual.quoteKn}</span>
                  </div>
                )}

                {/* Main Topic Title */}
                <div className="my-3.5">
                  <h3 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug font-serif-kannada">
                    {revealedTopic.titleKn}
                  </h3>
                  <p className="text-xs font-medium text-stone-600 mt-1 italic">
                    {revealedTopic.titleEn}
                  </p>
                </div>

                {/* Topic Hints / Key Speaking Points */}
                <div className="bg-amber-50/70 rounded-2xl p-3.5 border border-amber-200 mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 font-serif-kannada mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-700" />
                    <span>{lang === 'kn' ? 'ಭಾಷಣದ ಮುಖ್ಯಾಂಶಗಳು (Speaking Points):' : 'Key Talking Points:'}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-stone-800 font-serif-kannada">
                    {(lang === 'kn' ? revealedTopic.hintsKn : revealedTopic.hintsEn).slice(0, 3).map((hint, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-1.5 shrink-0" />
                        <span>{hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Speaker info if active */}
                {currentParticipant && (
                  <div className="mb-3.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                    <span className="text-stone-500 font-serif-kannada">
                      {lang === 'kn' ? 'ಪ್ರಸ್ತುತ ಸ್ಪರ್ಧಿ:' : 'Active Speaker:'}
                    </span>
                    <span className="font-bold text-stone-900 font-serif-kannada">
                      #{currentParticipant.chestNo} {currentParticipant.name}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    id="start-timer-from-card"
                    onClick={() => onStartTimerWithTopic(revealedTopic, currentParticipant)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-700 via-red-600 to-amber-700 hover:from-amber-800 hover:to-red-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-98 font-serif-kannada border border-yellow-300/40"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{lang === 'kn' ? 'ಈ ವಿಷಯದೊಂದಿಗೆ ೩ ನಿಮಿಷ ಭಾಷಣ ಪ್ರಾರಂಭಿಸಿ' : 'Start 3-Min Speech Timer'}</span>
                  </button>

                  <button
                    onClick={() => setIsColourfulModalOpen(true)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs flex items-center justify-center gap-1.5 transition font-serif-kannada border border-amber-300"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-800" />
                    <span>{lang === 'kn' ? 'ಪೂರ್ಣ ಮಾಹಿತಿ & ಉಲ್ಲೇಖಗಳ ಪರದೆ ತೆರೆಯಿರಿ' : 'Open Full Colourful Matter & Quotes'}</span>
                  </button>
                </div>

              </div>
            );
          })() : (
            /* Empty State on Right side */
            <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-amber-300 flex flex-col items-center justify-center text-center h-full min-h-[360px]">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 shadow-2xs">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-stone-800 font-serif-kannada">
                {lang === 'kn' ? 'ಯಾವುದೇ ಚೀಟಿ ಆರಿಸಿಲ್ಲ' : 'No Chit Picked Yet'}
              </h4>
              <p className="text-xs text-stone-500 max-w-xs mt-1.5 leading-relaxed font-serif-kannada">
                {lang === 'kn'
                  ? 'ಎಡಭಾಗದಲ್ಲಿರುವ ಅದೃಷ್ಟ ಚಕ್ರ ತಿರುಗಿಸಿ ಅಥವಾ ಕೆಳಗಿನ ೫೦ ಸಂಖ್ಯೆಗಳಲ್ಲಿ ಯಾವುದೇ ಸಂಖ್ಯೆಯನ್ನು ಟಚ್ ಮಾಡಿ!'
                  : 'Spin the wheel on the left or touch any of the 50 numbers below!'}
              </p>
              <button
                onClick={handleSpinWheel}
                disabled={isDrawing}
                className="mt-4 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs flex items-center gap-2 font-serif-kannada"
              >
                <RotateCw className="w-4 h-4" />
                <span>{lang === 'kn' ? 'ಚಕ್ರ ತಿರುಗಿಸಿ' : 'Spin Wheel'}</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 3. 50 NUMBERS GRID DIRECTLY BELOW THE SPIN WHEEL (as requested: "aa spin nalli baro number adar kelage iro 50 numbers ge adu show aagabeku aaga aa no ge touch madidag aa matter with quotes elements jotege colourful aagi show aagabeku") */}
      <div 
        ref={gridSectionRef}
        id="50-numbers-section" 
        className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-300 shadow-sm space-y-4"
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <h3 className="text-base sm:text-lg font-black text-amber-950 font-serif-kannada flex items-center gap-2">
                <span>{lang === 'kn' ? 'ಆಶುಭಾಷಣದ ೫೦ ಚೀಟಿ ಸಂಖ್ಯೆಗಳು (1 to 50 Chits)' : '50 Speech Topic Chits (1 to 50)'}</span>
              </h3>
            </div>
            <p className="text-xs text-stone-600 mt-1 font-serif-kannada">
              {lang === 'kn' 
                ? 'ಚಕ್ರದಲ್ಲಿ ಬಂದ ಸಂಖ್ಯೆ ಇಲ್ಲಿ ಪ್ರಕಾಶಿಸುತ್ತದೆ. ಯಾವುದೇ ಸಂಖ್ಯೆಯ ಮೇಲೆ ಟಚ್ ಮಾಡಿ ಆ ವಿಷಯ, ಉಲ್ಲೇಖಗಳು ಮತ್ತು ಚಿಹ್ನೆಗಳನ್ನು ನೋಡಿ!'
                : 'The drawn spin number glows here. Touch ANY number to view that topic, famous quotes, and visual elements!'}
            </p>
          </div>

          {/* Filter pills: All 50 / Unused / Used */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 self-start sm:self-auto">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition font-serif-kannada ${
                selectedFilter === 'all' ? 'bg-amber-700 text-white shadow-2xs' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              {lang === 'kn' ? 'ಎಲ್ಲಾ ೫೦' : 'All 50'}
            </button>
            <button
              onClick={() => setSelectedFilter('unused')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition font-serif-kannada ${
                selectedFilter === 'unused' ? 'bg-amber-700 text-white shadow-2xs' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              {lang === 'kn' ? 'ಬಳಸದ ಚೀಟಿಗಳು' : 'Unused'}
            </button>
            <button
              onClick={() => setSelectedFilter('used')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition font-serif-kannada ${
                selectedFilter === 'used' ? 'bg-amber-700 text-white shadow-2xs' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              {lang === 'kn' ? 'ಬಳಸಿದವು' : 'Used'}
            </button>
          </div>
        </div>

        {/* Highlight notification bar if a number is drawn */}
        {drawnChitNumber !== null && (
          <div className="bg-gradient-to-r from-amber-500 via-red-600 to-amber-600 text-white p-3 rounded-2xl shadow-md flex items-center justify-between gap-3 text-xs sm:text-sm animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-xl">👉</span>
              <span className="font-bold font-serif-kannada">
                {lang === 'kn'
                  ? `ಚಕ್ರದಲ್ಲಿ ಸಂಖ್ಯೆ #${drawnChitNumber} ಬಂದಿದೆ! ಕೆಳಗೆ ತೋರಿಸಿರುವ ಸಂಖ್ಯೆ #${drawnChitNumber} ಅನ್ನು ಟಚ್ ಮಾಡಿ:`
                  : `Wheel landed on #${drawnChitNumber}! Touch number #${drawnChitNumber} below to view topic:`}
              </span>
            </div>
            <button
              onClick={() => handleSelectChitNumber(drawnChitNumber, true)}
              className="px-3.5 py-1.5 rounded-xl bg-white text-red-700 font-extrabold text-xs shadow-xs hover:bg-yellow-100 transition shrink-0"
            >
              {lang === 'kn' ? 'ಈಗಲೇ ಟಚ್ ಮಾಡಿ!' : 'Touch Now!'}
            </button>
          </div>
        )}

        {/* THE 50 NUMBERS GRID */}
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-2.5 pt-2">
          {filtered50Numbers.map((num) => {
            const isHighlighted = drawnChitNumber === num;
            const topic = getLinkedTopic(num);
            const visual = getTopicVisual(topic.number);
            const isUsed = topic.isUsed;

            return (
              <button
                key={num}
                ref={isHighlighted ? highlightedChitRef : null}
                id={`chit-number-btn-${num}`}
                onClick={() => handleSelectChitNumber(num, true)}
                className={`relative rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-center border-2 transition-all cursor-pointer group active:scale-95 ${
                  isHighlighted
                    ? 'bg-gradient-to-tr from-red-600 via-amber-600 to-yellow-500 text-white border-yellow-300 shadow-xl ring-4 ring-yellow-400 scale-105 z-10 animate-bounce'
                    : isUsed
                      ? 'bg-stone-100 text-stone-400 border-stone-300 hover:bg-amber-50 hover:text-stone-700 hover:border-amber-400'
                      : 'bg-white hover:bg-amber-50 text-stone-900 border-amber-300 hover:border-amber-500 hover:shadow-md'
                }`}
              >
                {/* Highlight badge tag */}
                {isHighlighted && (
                  <span className="absolute -top-2.5 bg-yellow-300 text-red-900 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs uppercase tracking-tight font-serif-kannada">
                    {lang === 'kn' ? 'ಬಂದಿದೆ!' : 'Drawn!'}
                  </span>
                )}

                {/* Used checkmark badge */}
                {isUsed && !isHighlighted && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 absolute top-1 right-1" />
                )}

                {/* Icon symbol representation */}
                <div className={`mb-1 transition-transform group-hover:scale-110 ${isHighlighted ? 'text-yellow-200' : 'text-amber-700'}`}>
                  {renderTopicIcon(visual.symbol, 'w-4 h-4')}
                </div>

                {/* Prominent Number */}
                <span className={`font-mono text-sm sm:text-base font-black ${isHighlighted ? 'text-white' : 'text-amber-950'}`}>
                  #{num}
                </span>

                {/* Heritage era micro-label */}
                <span className={`text-[9px] font-serif-kannada truncate max-w-full block opacity-80 ${isHighlighted ? 'text-yellow-100' : 'text-stone-500'}`}>
                  {visual.heritageBadgeKn.split('•')[0].split('&')[0].trim()}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 4. COLOURFUL TOPIC MODAL WITH QUOTES & ELEMENTS (as requested: "aa matter with quotes elements jotege colourful aagi show aagabeku") */}
      {isColourfulModalOpen && revealedTopic && (() => {
        const visual = getTopicVisual(revealedTopic.number);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div 
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400 relative flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
            >
              
              {/* TOP VIBRANT COLOURFUL GRADIENT HEADER WITH VISUAL EMBLEM */}
              <div className={`p-6 sm:p-7 bg-gradient-to-r ${visual.gradient} text-white relative overflow-hidden shadow-md shrink-0`}>
                
                {/* Large Background Historical Symbol */}
                <div className="absolute right-2 top-0 bottom-0 opacity-15 flex items-center pointer-events-none">
                  {renderTopicIcon(visual.symbol, 'w-48 h-48')}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsColourfulModalOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/25 hover:bg-black/40 text-white transition backdrop-blur-xs z-20"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Chit Number Badge & Dynasty/Era */}
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/60 text-white font-mono font-black text-2xl flex items-center justify-center shadow-md">
                    #{revealedTopic.number}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-black tracking-wider uppercase bg-white/20 px-3 py-0.5 rounded-full inline-block backdrop-blur-xs font-serif-kannada">
                      {visual.heritageBadgeKn}
                    </span>
                    <h3 className="text-sm sm:text-base font-semibold text-yellow-200 mt-1">
                      {visual.eraKn}
                    </h3>
                  </div>
                </div>

                {/* Topic Heritage Icon Pill */}
                <div className="mt-3 inline-flex items-center gap-2 bg-black/20 backdrop-blur-xs px-3 py-1 rounded-xl text-xs text-yellow-100 border border-white/20 font-serif-kannada">
                  {renderTopicIcon(visual.symbol, 'w-4 h-4 text-yellow-300')}
                  <span>{lang === 'kn' ? 'ವಿಷಯದ ಲಾಂಛನ & ಜ್ಞಾನ ಚಿಹ್ನೆ' : 'Topic Emblem & Symbol'}</span>
                </div>
              </div>

              {/* MODAL BODY (SCROLLABLE) */}
              <div className="p-6 sm:p-7 space-y-5 overflow-y-auto flex-1">
                
                {/* PROMINENT QUOTE SECTION WITH QUOTES ELEMENTS */}
                {visual.quoteKn && (
                  <div className="relative p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 border-2 border-amber-400 shadow-sm">
                    <Quote className="w-8 h-8 text-amber-700/40 absolute top-3 left-3 rotate-180 pointer-events-none" />
                    <div className="pl-6">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block mb-1 font-serif-kannada">
                        {lang === 'kn' ? 'ಖ್ಯಾತ ಉಲ್ಲೇಖ / ಘೋಷಣೆ (Famous Historical Quote):' : 'Famous Historical Quote / Saying:'}
                      </span>
                      <p className="text-base sm:text-lg font-bold text-amber-950 font-serif-kannada italic leading-relaxed">
                        {visual.quoteKn}
                      </p>
                    </div>
                  </div>
                )}

                {/* MAIN TOPIC TITLE & MATTER */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full font-serif-kannada">
                    {lang === 'kn' ? 'ಆಶುಭಾಷಣದ ಮುಖ್ಯ ವಿಷಯ (Topic Title):' : 'Main Speech Topic:'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2 font-serif-kannada leading-tight">
                    {revealedTopic.titleKn}
                  </h2>
                  <p className="text-sm font-medium text-stone-600 mt-1 italic">
                    {revealedTopic.titleEn}
                  </p>
                </div>

                {/* DETAILED SPEAKING MATTER / POINTS */}
                <div className="bg-gradient-to-br from-stone-50 to-amber-50/60 rounded-2xl p-5 border border-amber-300">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-950 font-serif-kannada mb-3">
                    <Lightbulb className="w-5 h-5 text-amber-700" />
                    <span>{lang === 'kn' ? 'ಭಾಷಣದಲ್ಲಿ ಪ್ರಸ್ತಾಪಿಸಬೇಕಾದ ಮುಖ್ಯಾಂಶಗಳು (Speaking Points & Matter):' : 'Key Talking Points for Speech:'}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {(lang === 'kn' ? revealedTopic.hintsKn : revealedTopic.hintsEn).map((hint, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs font-serif-kannada">
                        <span className="w-6 h-6 rounded-lg bg-amber-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-stone-800 leading-relaxed pt-0.5">
                          {hint}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CURRENT SPEAKER BADGE */}
                {currentParticipant && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-amber-700" />
                      <span className="text-stone-600 font-serif-kannada">{lang === 'kn' ? 'ಸ್ಪರ್ಧಿಯ ಹೆಸರು:' : 'Speaker:'}</span>
                      <span className="font-bold text-stone-950 font-serif-kannada">
                        #{currentParticipant.chestNo} {currentParticipant.name}
                      </span>
                    </div>
                    {currentParticipant.schoolOrClass && (
                      <span className="text-stone-600 bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-xs">
                        {currentParticipant.schoolOrClass}
                      </span>
                    )}
                  </div>
                )}

              </div>

              {/* MODAL FOOTER ACTION CONTROLS */}
              <div className="p-4 sm:p-5 bg-stone-50 border-t border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <button
                  onClick={() => setIsColourfulModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs sm:text-sm border border-stone-300 transition"
                >
                  {lang === 'kn' ? 'ಮುಚ್ಚಿ (Close)' : 'Close'}
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setIsColourfulModalOpen(false);
                      handleSpinWheel();
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs sm:text-sm border border-amber-300 transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{lang === 'kn' ? 'ಮತ್ತೊಂದು ಸಂಖ್ಯೆ' : 'Pick Another'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsColourfulModalOpen(false);
                      onStartTimerWithTopic(revealedTopic, currentParticipant);
                    }}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-700 hover:from-red-700 hover:to-amber-800 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{lang === 'kn' ? '೩ ನಿಮಿಷ ಭಾಷಣ ಪ್ರಾರಂಭಿಸಿ' : 'Start 3-Min Speech'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Participant Registration Modal */}
      {isRegistrationModalOpen && (
        <ParticipantRegistrationModal
          isOpen={isRegistrationModalOpen}
          onClose={() => setIsRegistrationModalOpen(false)}
          lang={lang}
          existingParticipants={participants}
          onRegister={(p: Participant) => {
            if (onRegisterParticipant) onRegisterParticipant(p);
            onSelectParticipant(p);
          }}
        />
      )}

    </div>
  );
};

// Custom sword icon component
const SwordIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" />
    <line x1="19" y1="21" x2="21" y2="19" />
  </svg>
);
