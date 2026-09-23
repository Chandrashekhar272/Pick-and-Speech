import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Bell, 
  SkipForward, 
  Award, 
  Sliders, 
  Volume2, 
  Sparkles,
  Maximize2,
  Clock,
  User,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { Topic, Participant, Language, TimerConfig } from '../types';
import { sound } from '../utils/audio';

interface SpeechTimerProps {
  lang: Language;
  activeTopic: Topic | null;
  activeParticipant: Participant | null;
  participants?: Participant[];
  onSelectParticipant?: (p: Participant) => void;
  timerConfig: TimerConfig;
  onUpdateTimerConfig: (newConfig: TimerConfig) => void;
  onOpenScorecard: () => void;
  onOpenStageMode: () => void;
  onBackToPicker: () => void;
  onNextSpeaker?: () => void;
}

export const SpeechTimer: React.FC<SpeechTimerProps> = ({
  lang,
  activeTopic,
  activeParticipant,
  participants = [],
  onSelectParticipant,
  timerConfig,
  onUpdateTimerConfig,
  onOpenScorecard,
  onOpenStageMode,
  onBackToPicker,
  onNextSpeaker
}) => {
  // Timer Stages: Direct 3 min speech is default ('speech') as requested: "tayaarige samay beda"
  const [stage, setStage] = useState<'prep' | 'speech'>('speech');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(timerConfig.speechTimeSeconds);
  const [overtimeSeconds, setOvertimeSeconds] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Warning bell and final bell fired flags to guarantee automatic single execution
  const warningBellFiredRef = useRef(false);
  const finalBellFiredRef = useRef(false);
  const [bellAlert, setBellAlert] = useState<'none' | 'warning' | 'final'>('none');
  const bellTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerWarningBell = () => {
    sound.unlockAudio();
    sound.playWarningBell();
    setBellAlert('warning');
    if (bellTimeoutRef.current) clearTimeout(bellTimeoutRef.current);
    bellTimeoutRef.current = setTimeout(() => setBellAlert('none'), 4500);
  };

  const triggerFinalBell = () => {
    sound.unlockAudio();
    sound.playFinalBell();
    setBellAlert('final');
    if (bellTimeoutRef.current) clearTimeout(bellTimeoutRef.current);
    bellTimeoutRef.current = setTimeout(() => setBellAlert('none'), 5500);
  };

  // Sync when timerConfig changes
  useEffect(() => {
    if (!isRunning) {
      if (stage === 'prep') {
        setSecondsLeft(timerConfig.prepTimeSeconds);
      } else {
        setSecondsLeft(timerConfig.speechTimeSeconds);
      }
    }
  }, [timerConfig, stage, isRunning]);

  // Main countdown loop with robust automatic bell triggers
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          // In speech stage, if timer reaches 0, enter overtime
          if (stage === 'speech' && prev <= 0) {
            setOvertimeSeconds((ot) => ot + 1);
            return 0;
          }

          // In prep stage, when hitting 0, play chime and auto-advance to speech!
          if (stage === 'prep' && prev <= 1) {
            sound.playWarningBell();
            setStage('speech');
            warningBellFiredRef.current = false;
            finalBellFiredRef.current = false;
            setBellAlert('warning');
            if (bellTimeoutRef.current) clearTimeout(bellTimeoutRef.current);
            bellTimeoutRef.current = setTimeout(() => setBellAlert('none'), 4000);
            return timerConfig.speechTimeSeconds;
          }

          const nextValue = prev - 1;

          // AUTOMATIC WARNING BELL: at 30 seconds remaining in speech (Ding!)
          if (
            stage === 'speech' &&
            nextValue <= timerConfig.warningBellSeconds &&
            nextValue > 0 &&
            !warningBellFiredRef.current
          ) {
            warningBellFiredRef.current = true;
            sound.playWarningBell();
            setBellAlert('warning');
            if (bellTimeoutRef.current) clearTimeout(bellTimeoutRef.current);
            bellTimeoutRef.current = setTimeout(() => setBellAlert('none'), 4500);
          }

          // AUTOMATIC FINAL BELL: at 0 seconds remaining in speech (Double Ding-Ding!)
          if (stage === 'speech' && nextValue <= 0 && !finalBellFiredRef.current) {
            finalBellFiredRef.current = true;
            sound.playFinalBell();
            setBellAlert('final');
            if (bellTimeoutRef.current) clearTimeout(bellTimeoutRef.current);
            bellTimeoutRef.current = setTimeout(() => setBellAlert('none'), 5500);
          }

          // Final 3 seconds subtle tick
          if (stage === 'speech' && nextValue > 0 && nextValue <= 3) {
            sound.playTick();
          }

          return nextValue;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, stage, timerConfig]);

  const handleTogglePlay = () => {
    sound.unlockAudio();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setStage('speech');
    setSecondsLeft(timerConfig.speechTimeSeconds);
    setOvertimeSeconds(0);
    warningBellFiredRef.current = false;
    finalBellFiredRef.current = false;
    setBellAlert('none');
  };

  // Give chance again to current speaker
  const handleGiveChanceAgain = () => {
    setIsRunning(false);
    setStage('speech');
    setSecondsLeft(timerConfig.speechTimeSeconds);
    setOvertimeSeconds(0);
    warningBellFiredRef.current = false;
    finalBellFiredRef.current = false;
  };

  const handleSetPrepStage = () => {
    setIsRunning(false);
    setStage('prep');
    setSecondsLeft(timerConfig.prepTimeSeconds);
    setOvertimeSeconds(0);
    warningBellFiredRef.current = false;
    finalBellFiredRef.current = false;
  };

  const handleSetSpeechStage = () => {
    setIsRunning(false);
    setStage('speech');
    setSecondsLeft(timerConfig.speechTimeSeconds);
    setOvertimeSeconds(0);
    warningBellFiredRef.current = false;
    finalBellFiredRef.current = false;
  };

  // Format mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(Math.max(0, totalSec) / 60);
    const secs = Math.max(0, totalSec) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Compute progress percentage
  const totalDuration = stage === 'prep' ? timerConfig.prepTimeSeconds : timerConfig.speechTimeSeconds;
  const progressPercent = totalDuration > 0 ? Math.min(100, Math.max(0, (secondsLeft / totalDuration) * 100)) : 0;

  // Visual status colors
  const isOvertime = stage === 'speech' && secondsLeft === 0 && overtimeSeconds > 0;
  const isWarningZone = stage === 'speech' && secondsLeft <= timerConfig.warningBellSeconds && secondsLeft > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Current Topic & Participant Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                {activeTopic ? `#${activeTopic.number} ${lang === 'kn' ? 'ಚೀಟಿ' : 'Chit'}` : (lang === 'kn' ? 'ವಿಷಯ ನಿಗದಿಪಡಿಸಿಲ್ಲ' : 'No Topic Selected')}
              </span>
              {activeParticipant && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200 flex items-center gap-1">
                  <User className="w-3 h-3 text-stone-500" />
                  <span>#{activeParticipant.chestNo} {activeParticipant.name}</span>
                  <span className="text-stone-400">({activeParticipant.schoolOrClass})</span>
                </span>
              )}
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug font-serif-kannada">
              {activeTopic ? activeTopic.titleKn : (lang === 'kn' ? 'ಸ್ಪರ್ಧಾ ವಿಷಯವನ್ನು ಆರಿಸಿ' : 'Select a topic to start')}
            </h2>
            {activeTopic && (
              <p className="text-xs sm:text-sm text-stone-600 italic">
                {activeTopic.titleEn}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={onBackToPicker}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 transition"
            >
              {lang === 'kn' ? 'ಹೊಸ ಚೀಟಿ ಆರಿಸಿ' : 'Change Topic'}
            </button>
            <button
              onClick={onOpenStageMode}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition flex items-center gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-700" />
              <span>{lang === 'kn' ? 'ದೊಡ್ಡ ಪರದೆ (Stage)' : 'Stage Mode'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Bell Alert Banners */}
      {bellAlert === 'warning' && (
        <div className="bg-amber-500 text-white rounded-2xl p-4 shadow-lg border-2 border-amber-300 flex items-center justify-center gap-3 animate-bounce">
          <Bell className="w-6 h-6 animate-spin text-white" />
          <div className="text-center font-serif-kannada">
            <span className="font-black text-base sm:text-lg block">
              {lang === 'kn' ? '🔔 ಎಚ್ಚರಿಕೆ ಗಂಟೆ ಮೊಳಗಿದೆ! (Warning Bell Rung!)' : '🔔 Warning Bell Rung!'}
            </span>
            <span className="text-xs text-amber-100">
              {lang === 'kn' ? `ಭಾಷಣ ಮುಕ್ತಾಯಕ್ಕೆ ಇನ್ನು ಕೇವಲ ${timerConfig.warningBellSeconds} ಸೆಕೆಂಡುಗಳು ಉಳಿದಿವೆ!` : `${timerConfig.warningBellSeconds} seconds remaining to conclude speech!`}
            </span>
          </div>
        </div>
      )}

      {bellAlert === 'final' && (
        <div className="bg-rose-600 text-white rounded-2xl p-4 shadow-lg border-2 border-rose-300 flex items-center justify-center gap-3 animate-pulse">
          <Bell className="w-7 h-7 text-white animate-bounce" />
          <div className="text-center font-serif-kannada">
            <span className="font-black text-base sm:text-lg block">
              {lang === 'kn' ? '🚨 ಅಂತಿಮ ಗಂಟೆ ಮೊಳಗಿದೆ (೫ ಬಾರಿ ಬೆಲ್ - Ding Ding Ding Ding Ding!)' : '🚨 Final Bell Rung (5 Rings - Conclude Speech!)'}
            </span>
            <span className="text-xs text-rose-100">
              {lang === 'kn' ? '೩ ನಿಮಿಷಗಳ ಸಮಯ ಮುಕ್ತಾಯವಾಗಿದೆ! ದಯವಿಟ್ಟು ಭಾಷಣವನ್ನು ಮುಕ್ತಾಯಗೊಳಿಸಿ.' : 'Time is up! Please conclude speech immediately.'}
            </span>
          </div>
        </div>
      )}

      {/* Interactive Competition Bells Control Deck */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 rounded-2xl p-4 border-2 border-amber-300/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-stone-900 flex items-center gap-2 font-serif-kannada">
              <span>{lang === 'kn' ? 'ಸ್ಪರ್ಧಾ ಗಂಟೆಗಳು (Warning & 5-Ring Final Bell)' : 'Competition Bells System'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">ಆಟೋ ಸಕ್ರಿಯ</span>
            </div>
            <p className="text-[11px] text-stone-600 font-serif-kannada">
              {lang === 'kn'
                ? `ಸ್ವಯಂಚಾಲಿತ: ೩೦ ಸೆ. ಉಳಿದಾಗ ಎಚ್ಚರಿಕೆ ಗಂಟೆ • ೩ ನಿಮಿಷ ಮುಗಿದಾಗ ೫ ಬಾರಿ ಅಂತಿಮ ಗಂಟೆ. ನೀವು ನೇರವಾಗಿಯೂ ಬಾರಿಸಬಹುದು.`
                : `Auto: Warning bell before 30s • Final bell (5 rings) after 3 min. Manual ring supported.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Warning Bell Button */}
          <button
            id="ring-warning-bell-btn"
            onClick={triggerWarningBell}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 font-serif-kannada border border-amber-600"
            title="ಏಕ ಗಂಟೆ (Single Gong) - ೩೦ ಸೆ. ಉಳಿದಾಗ"
          >
            <Bell className="w-4 h-4 fill-white" />
            <span>{lang === 'kn' ? '🔔 ಎಚ್ಚರಿಕೆ ಗಂಟೆ' : 'Ring Warning Bell'}</span>
          </button>

          {/* Final Bell Button */}
          <button
            id="ring-final-bell-btn"
            onClick={triggerFinalBell}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 font-serif-kannada border border-rose-700"
            title="೫ ಬಾರಿ ಗಂಟೆ (5 Bell Rings) - ಸಮಯ ಮುಗಿದಾಗ"
          >
            <Bell className="w-4 h-4 fill-white animate-pulse" />
            <span>{lang === 'kn' ? '🛎️ ಅಂತಿಮ ಗಂಟೆ (೫ ಬಾರಿ)' : 'Final Bell (5 Rings)'}</span>
          </button>
        </div>
      </div>

      {/* Main Timer Display Unit */}
      <div className={`rounded-3xl p-6 sm:p-10 border-2 transition-all shadow-xs relative overflow-hidden flex flex-col items-center justify-center text-center ${
        isOvertime 
          ? 'bg-rose-50/90 border-rose-400' 
          : isWarningZone 
            ? 'bg-amber-50/90 border-amber-400' 
            : stage === 'prep'
              ? 'bg-blue-50/60 border-blue-200'
              : 'bg-emerald-50/60 border-emerald-300'
      }`}>
        
        {/* Stage Switcher Tabs - Direct 3 Min Speech is Primary */}
        <div className="flex items-center gap-2 mb-4 bg-white/80 p-1 rounded-2xl border border-stone-200 shadow-2xs">
          <button
            onClick={handleSetSpeechStage}
            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition font-serif-kannada ${
              stage === 'speech'
                ? (isOvertime ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-700 text-white shadow-2xs')
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {lang === 'kn' ? 'ನೇರ ಭಾಷಣ ಸಮಯ (೩ ನಿಮಿಷ)' : 'Direct Speech Time (3 Min)'}
          </button>
          <button
            onClick={handleSetPrepStage}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition font-serif-kannada ${
              stage === 'prep'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            {lang === 'kn' ? 'ತಯಾರಿ ಸಮಯ (ಐಚ್ಛಿಕ)' : 'Prep Time (Optional)'}
          </button>
        </div>

        {/* Big Digital Clock Display */}
        <div className="relative my-2">
          <div className={`font-mono text-6xl sm:text-8xl md:text-9xl font-extrabold tracking-tight select-none transition-colors ${
            isOvertime 
              ? 'text-rose-700' 
              : isWarningZone 
                ? 'text-amber-800' 
                : stage === 'prep'
                  ? 'text-blue-900'
                  : 'text-stone-900'
          }`}>
            {isOvertime ? `+${formatTime(overtimeSeconds)}` : formatTime(secondsLeft)}
          </div>
          
          {/* Progress Track */}
          <div className="w-64 sm:w-80 h-2.5 bg-stone-200/80 rounded-full overflow-hidden mx-auto mt-4">
            <div
              className={`h-full transition-all duration-1000 ${
                stage === 'prep' 
                  ? 'bg-blue-600' 
                  : isWarningZone 
                    ? 'bg-amber-600' 
                    : isOvertime
                      ? 'bg-rose-600'
                      : 'bg-emerald-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stage helper text */}
        <p className="text-xs sm:text-sm font-medium text-stone-600 mt-2 font-serif-kannada max-w-lg">
          {stage === 'prep'
            ? (lang === 'kn' ? 'ಸ್ಪರ್ಧಿಗೆ ೩ ನಿಮಿಷ ತಯಾರಿ ಸಮಯ (ಮತ್ತೊಬ್ಬ ಸ್ಪರ್ಧಿ ಭಾಷಣ ಮಾಡುವವರೆಗೆ / ಸಿದ್ಧತೆಗಾಗಿ). ಸಮಯ ಮುಗಿದ ತಕ್ಷಣ ಭಾಷಣ ಆರಂಭವಾಗುತ್ತದೆ.' : '3 minutes preparation time while another participant speaks or to gather thoughts.')
            : isOvertime
              ? (lang === 'kn' ? 'ಅಂತಿಮ ಬೆಲ್ ಆಗಿದೆ; ದಯವಿಟ್ಟು ಭಾಷಣವನ್ನು ಮುಕ್ತಾಯಗೊಳಿಸಿ.' : 'Final bell has rung; please conclude speech.')
              : isWarningZone
                ? (lang === 'kn' ? 'ಎಚ್ಚರಿಕೆ ಗಂಟೆ ಆಗಿದೆ! ಅಂತಿಮ ೩೦ ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಭಾಷಣ ಮುಕ್ತಾಯದ ಕಡೆಗೆ ತನ್ನಿ.' : 'Warning bell rung! Conclude within 30 seconds.')
                : (lang === 'kn' ? 'ವೇದಿಕೆಯಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ, ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ೩ ನಿಮಿಷ ಮಾತನಾಡಿ.' : 'Speak clearly and confidently on stage for 3 minutes.')}
        </p>

        {/* Primary Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-7">
          
          {/* Reset */}
          <button
            id="timer-reset-button"
            onClick={handleReset}
            className="p-3.5 rounded-2xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 hover:border-stone-400 transition shadow-2xs active:scale-95"
            title={lang === 'kn' ? 'ಮರುಹೊಂದಿಸಿ (Reset)' : 'Reset Timer'}
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Play / Pause */}
          <button
            id="timer-toggle-play-button"
            onClick={handleTogglePlay}
            className={`px-8 py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center gap-3 transition shadow-md active:scale-95 text-white ${
              isRunning 
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30' 
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-6 h-6 fill-white" />
                <span>{lang === 'kn' ? 'ವಿರಾಮ (Pause)' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-white" />
                <span>
                  {secondsLeft === (stage === 'prep' ? timerConfig.prepTimeSeconds : timerConfig.speechTimeSeconds)
                    ? (lang === 'kn' ? 'ಪ್ರಾರಂಭಿಸಿ (Start)' : 'Start')
                    : (lang === 'kn' ? 'ಮುಂದುವರಿಸಿ (Resume)' : 'Resume')}
                </span>
              </>
            )}
          </button>

          {/* Skip Prep to Speech */}
          {stage === 'prep' && (
            <button
              id="timer-skip-prep-button"
              onClick={handleSetSpeechStage}
              className="px-4 py-3.5 rounded-2xl bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-900 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95 font-serif-kannada"
            >
              <SkipForward className="w-4 h-4" />
              <span>{lang === 'kn' ? 'ಈಗಲೇ ಭಾಷಣ ಆರಂಭಿಸಿ' : 'Start Speech Now'}</span>
            </button>
          )}

          {/* Give Chance Again to Same Speaker */}
          <button
            onClick={handleGiveChanceAgain}
            className="px-4 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95 font-serif-kannada"
            title="ಈ ಸ್ಪರ್ಧಿಗೆ ಮತ್ತೊಮ್ಮೆ ಅವಕಾಶ ನೀಡಿ"
          >
            <RefreshCw className="w-4 h-4 text-stone-600" />
            <span>{lang === 'kn' ? 'ಪುನಃ ಅವಕಾಶ ನೀಡಿ' : 'Give Chance Again'}</span>
          </button>

          {/* Next Speaker's Turn */}
          <button
            onClick={onNextSpeaker}
            className="px-5 py-3.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition active:scale-95 font-serif-kannada"
          >
            <span>{lang === 'kn' ? 'ಮುಂದಿನ ಸ್ಪರ್ಧಿಗೆ ಅವಕಾಶ' : 'Next Speaker'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Action: Grade / Score Speaker */}
        <div className="mt-8 pt-6 border-t border-stone-200/80 w-full flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-stone-500 text-left font-serif-kannada">
            {activeParticipant ? (
              <span>{lang === 'kn' ? 'ಪ್ರಸ್ತುತ ಸ್ಪರ್ಧಿ:' : 'Current Speaker:'} <b>#{activeParticipant.chestNo} {activeParticipant.name}</b></span>
            ) : (
              <span>{lang === 'kn' ? 'ಸ್ಪರ್ಧಿಗೆ ಅಂಕಗಳನ್ನು ನಮೂದಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ' : 'Enter evaluation marks for this speech'}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              id="open-scorecard-button"
              onClick={onOpenScorecard}
              className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-2xs transition active:scale-95 font-serif-kannada"
            >
              <Award className="w-4 h-4" />
              <span>{lang === 'kn' ? 'ತೀರ್ಪುಗಾರರ ಅಂಕಪಟ್ಟಿ (Score)' : 'Score This Speech'}</span>
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl border transition ${
                showSettings ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
              }`}
              title={lang === 'kn' ? 'ಸಮಯದ ಸೆಟ್ಟಿಂಗ್ಸ್' : 'Timer Settings'}
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Timer Presets & Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 font-serif-kannada">
              <Sliders className="w-4 h-4 text-amber-600" />
              <span>{lang === 'kn' ? 'ಸಮಯದ ಸಂರಚನೆ (Timer Settings)' : 'Timer Configuration'}</span>
            </h3>
            <span className="text-xs text-stone-500 font-medium font-serif-kannada">
              {lang === 'kn' ? 'ಸ್ಪರ್ಧೆಯ ನಿಯಮಗಳಿಗೆ ತಕ್ಕಂತೆ ಬದಲಾಯಿಸಿ' : 'Adjust as per competition rules'}
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <button
              onClick={() => {
                onUpdateTimerConfig({
                  prepTimeSeconds: 180,
                  speechTimeSeconds: 180,
                  warningBellSeconds: 30,
                  enableSound: true
                });
                handleReset();
              }}
              className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-400 text-left transition hover:bg-amber-100/70"
            >
              <div className="text-xs font-bold text-amber-950 font-serif-kannada flex items-center justify-between">
                <span>{lang === 'kn' ? 'ಆಶುಭಾಷಣ ನಿಯಮ (ಅಧಿಕೃತ)' : 'Standard Extempore'}</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono">Official</span>
              </div>
              <div className="text-[11px] text-stone-600 mt-1 font-serif-kannada">
                {lang === 'kn' ? '೩ ನಿಮಿಷ ತಯಾರಿ + ೩ ನಿಮಿಷ ಭಾಷಣ (೩೦ಸೆ. ಬೆಲ್)' : '3m Prep + 3m Speech (30s Bell)'}
              </div>
            </button>

            <button
              onClick={() => {
                onUpdateTimerConfig({
                  prepTimeSeconds: 60,
                  speechTimeSeconds: 120,
                  warningBellSeconds: 30,
                  enableSound: true
                });
                handleReset();
              }}
              className="p-3 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-400 text-left transition hover:bg-amber-50/60"
            >
              <div className="text-xs font-bold text-stone-900 font-serif-kannada">
                {lang === 'kn' ? 'ಮಧ್ಯಮ ಸಮಯ' : 'Medium Duration'}
              </div>
              <div className="text-[11px] text-stone-600 mt-1 font-serif-kannada">
                {lang === 'kn' ? '೧ ನಿಮಿಷ ತಯಾರಿ + ೨ ನಿಮಿಷ ಭಾಷಣ' : '1m Prep + 2m Speech'}
              </div>
            </button>

            <button
              onClick={() => {
                onUpdateTimerConfig({
                  prepTimeSeconds: 30,
                  speechTimeSeconds: 90,
                  warningBellSeconds: 15,
                  enableSound: true
                });
                handleReset();
              }}
              className="p-3 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-400 text-left transition hover:bg-amber-50/60"
            >
              <div className="text-xs font-bold text-stone-900 font-serif-kannada">
                {lang === 'kn' ? 'ವೇಗದ ಮಾತು (Quick)' : 'Quick Mode'}
              </div>
              <div className="text-[11px] text-stone-600 mt-1 font-serif-kannada">
                {lang === 'kn' ? '೩೦ಸೆ. ತಯಾರಿ + ೧:೩೦ ನಿಮಿಷ ಭಾಷಣ' : '30s Prep + 1m 30s Speech'}
              </div>
            </button>
          </div>

          {/* Custom Duration Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-stone-100">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-serif-kannada">
                {lang === 'kn' ? 'ತಯಾರಿ ಸಮಯ (ಸೆಕೆಂಡುಗಳಲ್ಲಿ):' : 'Prep Time (seconds):'}
              </label>
              <input
                type="number"
                min="0"
                max="600"
                step="10"
                value={timerConfig.prepTimeSeconds}
                onChange={(e) => onUpdateTimerConfig({ ...timerConfig, prepTimeSeconds: Number(e.target.value) || 180 })}
                className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-serif-kannada">
                {lang === 'kn' ? 'ಭಾಷಣದ ಸಮಯ (ಸೆಕೆಂಡುಗಳಲ್ಲಿ):' : 'Speech Time (seconds):'}
              </label>
              <input
                type="number"
                min="30"
                max="600"
                step="10"
                value={timerConfig.speechTimeSeconds}
                onChange={(e) => onUpdateTimerConfig({ ...timerConfig, speechTimeSeconds: Number(e.target.value) || 180 })}
                className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-serif-kannada">
                {lang === 'kn' ? 'ಎಚ್ಚರಿಕೆ ಬೆಲ್ ಸಮಯ (ಉಳಿದಿರುವ ಸೆ.):' : 'Warning Bell (Sec before end):'}
              </label>
              <input
                type="number"
                min="5"
                max="120"
                step="5"
                value={timerConfig.warningBellSeconds}
                onChange={(e) => onUpdateTimerConfig({ ...timerConfig, warningBellSeconds: Number(e.target.value) || 30 })}
                className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Speaking Points Drawer / Quick reference */}
      {activeTopic && (
        <div className="bg-amber-50/50 rounded-3xl p-5 border border-amber-200">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-2 font-serif-kannada">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>{lang === 'kn' ? 'ಸ್ಪರ್ಧಿಗಾಗಿ ಮುಖ್ಯಾಂಶಗಳು (Reference Points):' : 'Key Talking Points for Reference:'}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-stone-700">
            {(lang === 'kn' ? activeTopic.hintsKn : activeTopic.hintsEn).map((h, i) => (
              <div key={i} className="flex items-start gap-2 bg-white/90 p-2.5 rounded-xl border border-amber-100 font-serif-kannada">
                <span className="text-amber-600 font-bold">•</span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
