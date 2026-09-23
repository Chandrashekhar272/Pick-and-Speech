import React, { useState, useEffect } from 'react';
import { 
  Minimize2, 
  Play, 
  Pause, 
  RotateCcw, 
  Bell, 
  User, 
  Volume2, 
  VolumeX,
  Sparkles
} from 'lucide-react';
import { Topic, Participant, Language, TimerConfig } from '../types';
import { sound } from '../utils/audio';

interface StageModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  schoolName: string;
  activeTopic: Topic | null;
  activeParticipant: Participant | null;
  timerConfig: TimerConfig;
}

export const StageModeModal: React.FC<StageModeModalProps> = ({
  isOpen,
  onClose,
  lang,
  schoolName,
  activeTopic,
  activeParticipant,
  timerConfig
}) => {
  const [stage, setStage] = useState<'prep' | 'speech'>('speech');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(timerConfig.speechTimeSeconds);
  const [overtimeSeconds, setOvertimeSeconds] = useState(0);
  const [bellAlert, setBellAlert] = useState<'none' | 'warning' | 'final'>('none');
  const bellTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const warningBellFiredRef = React.useRef(false);
  const finalBellFiredRef = React.useRef(false);

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

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(timerConfig.speechTimeSeconds);
      setStage('speech');
      setIsRunning(false);
      setOvertimeSeconds(0);
      setBellAlert('none');
      warningBellFiredRef.current = false;
      finalBellFiredRef.current = false;
    }
  }, [isOpen, timerConfig]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (stage === 'speech' && prev <= 0) {
            setOvertimeSeconds((ot) => ot + 1);
            return 0;
          }

          if (stage === 'prep' && prev <= 1) {
            triggerWarningBell();
            setStage('speech');
            warningBellFiredRef.current = false;
            finalBellFiredRef.current = false;
            return timerConfig.speechTimeSeconds;
          }

          const next = prev - 1;

          if (stage === 'speech' && next <= timerConfig.warningBellSeconds && next > 0 && !warningBellFiredRef.current) {
            warningBellFiredRef.current = true;
            triggerWarningBell();
          }

          if (stage === 'speech' && next <= 0 && !finalBellFiredRef.current) {
            finalBellFiredRef.current = true;
            triggerFinalBell();
          }

          return next;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, stage, timerConfig]);

  if (!isOpen) return null;

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(Math.max(0, totalSec) / 60);
    const secs = Math.max(0, totalSec) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isOvertime = stage === 'speech' && secondsLeft === 0 && overtimeSeconds > 0;
  const isWarning = stage === 'speech' && secondsLeft <= timerConfig.warningBellSeconds && secondsLeft > 0;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-white flex flex-col justify-between p-6 sm:p-10 select-none animate-in fade-in">
      
      {/* Top Header Bar with Parishath Hierarchy */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div>
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wide text-amber-400 font-serif-kannada">
            {lang === 'kn' ? 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್ (ರಿ) ಮೈಸೂರು' : 'Karnataka Rajya Shikshakar Pratibha Parishath (R) Mysuru'}
          </div>
          <div className="text-[11px] sm:text-xs text-amber-200/80 font-medium">
            {lang === 'kn' ? 'ತಾಂತ್ರಿಕ ಶಿಕ್ಷಕರ ಸಮಿತಿಯ ವತಿಯಿಂದ • ಸಹಕಾರ ಸಮಿತಿಯ ಹಂತದ ಕಾರ್ಯಕ್ರಮ' : 'Technical Teachers Committee • Cooperative Society Level'}
          </div>
          <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white mt-0.5 font-serif-kannada">
            {lang === 'kn' ? 'ಆಶುಭಾಷಣ ಸ್ಪರ್ಧೆ' : 'Aashubhashana Spardhe'}
            <span className="text-xs font-normal text-stone-400 ml-2">({schoolName})</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => sound.playWarningBell()}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/30 transition flex items-center gap-1.5 font-serif-kannada"
          >
            <Bell className="w-4 h-4" />
            <span>{lang === 'kn' ? 'ಬೆಲ್' : 'Bell'}</span>
          </button>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <Minimize2 className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'kn' ? 'ಹೊರಬನ್ನಿ (Esc)' : 'Exit Stage'}</span>
          </button>
        </div>
      </div>

      {/* Main Center Area: Topic & Huge Timer */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-6 space-y-6 max-w-5xl mx-auto w-full">
        
        {/* Speaker info */}
        {activeParticipant && (
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-stone-900 border border-stone-700 shadow-md">
            <User className="w-4 h-4 text-amber-400" />
            <span className="text-xs uppercase tracking-wider text-stone-400">
              {lang === 'kn' ? 'ಸ್ಪರ್ಧಿ:' : 'Speaker:'}
            </span>
            <span className="text-sm sm:text-base font-bold text-white">
              #{activeParticipant.chestNo} {activeParticipant.name}
            </span>
            <span className="text-xs text-stone-400">
              ({activeParticipant.schoolOrClass})
            </span>
          </div>
        )}

        {/* Topic Title */}
        <div className="space-y-3 px-4">
          {activeTopic && (
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-400 bg-amber-950/60 px-3.5 py-1 rounded-full border border-amber-800/80">
              {lang === 'kn' ? `ಚೀಟಿ ಸಂಖ್ಯೆ #${activeTopic.number}` : `Chit Number #${activeTopic.number}`}
            </span>
          )}

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
            {activeTopic ? activeTopic.titleKn : (lang === 'kn' ? 'ಸ್ಪರ್ಧಾ ವಿಷಯ' : 'Pick a Speech Topic')}
          </h2>

          {activeTopic && (
            <p className="text-base sm:text-xl text-stone-400 font-medium italic">
              {activeTopic.titleEn}
            </p>
          )}
        </div>

        {/* Huge Countdown Display */}
        <div className="pt-2">
          {/* Active Stage Bell Notification Banner */}
          {bellAlert === 'warning' && (
            <div className="mb-4 mx-auto max-w-lg bg-amber-500 text-amber-950 font-black px-6 py-2.5 rounded-2xl shadow-xl flex items-center justify-center gap-3 animate-bounce">
              <Bell className="w-6 h-6 animate-spin text-amber-950" />
              <span className="text-sm sm:text-base font-serif-kannada">
                {lang === 'kn' ? '🔔 ಎಚ್ಚರಿಕೆ ಗಂಟೆ! ಇನ್ನು ೩೦ ಸೆಕೆಂಡುಗಳು ಮಾತ್ರ' : '🔔 Warning Bell! 30 Seconds Left'}
              </span>
            </div>
          )}

          {bellAlert === 'final' && (
            <div className="mb-4 mx-auto max-w-lg bg-rose-600 text-white font-black px-6 py-2.5 rounded-2xl shadow-xl flex items-center justify-center gap-3 animate-pulse">
              <Bell className="w-6 h-6 animate-bounce text-white" />
              <span className="text-sm sm:text-base font-serif-kannada">
                {lang === 'kn' ? '🚨 ಅಂತಿಮ ಗಂಟೆ ಮೊಳಗಿದೆ (೫ ಬಾರಿ ಬೆಲ್)! ಭಾಷಣ ಮುಕ್ತಾಯ' : '🚨 Final Bell (5 Rings)! Conclude Speech'}
              </span>
            </div>
          )}

          <div className={`font-mono text-7xl sm:text-9xl md:text-[11rem] font-black tracking-tighter transition-colors ${
            isOvertime 
              ? 'text-rose-500 animate-pulse' 
              : isWarning 
                ? 'text-amber-400' 
                : stage === 'prep'
                  ? 'text-sky-400'
                  : 'text-emerald-400'
          }`}>
            {isOvertime ? `+${formatTime(overtimeSeconds)}` : formatTime(secondsLeft)}
          </div>

          <div className="mt-2 text-xs sm:text-sm font-semibold tracking-wider uppercase text-stone-400">
            {stage === 'prep'
              ? (lang === 'kn' ? 'ತಯಾರಿ ಸಮಯ' : 'Preparation Time')
              : isOvertime
                ? (lang === 'kn' ? 'ಹೆಚ್ಚುವರಿ ಸಮಯ (ಸಮಯ ಮೀರಿದೆ)' : 'Overtime Limit Exceeded')
                : isWarning
                  ? (lang === 'kn' ? 'ಎಚ್ಚರಿಕೆ ಸಮಯ (ಅಂತಿಮ ಕ್ಷಣಗಳು)' : 'Warning Period')
                  : (lang === 'kn' ? 'ಭಾಷಣ ಸಮಯ' : 'Speech in Progress')}
          </div>
        </div>

      </div>

      {/* Bottom Floating Control Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4 border-t border-stone-800">
        <button
          onClick={() => {
            setIsRunning(false);
            setSecondsLeft(timerConfig.speechTimeSeconds);
            setOvertimeSeconds(0);
            setBellAlert('none');
          }}
          className="p-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 transition"
          title={lang === 'kn' ? 'ಮರುಹೊಂದಿಸಿ' : 'Reset'}
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-8 py-3.5 rounded-2xl font-bold text-base flex items-center gap-2.5 transition text-white shadow-lg ${
            isRunning 
              ? 'bg-amber-600 hover:bg-amber-500' 
              : 'bg-emerald-600 hover:bg-emerald-500'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-white" />
              <span>{lang === 'kn' ? 'ವಿರಾಮ' : 'Pause'}</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white" />
              <span>{lang === 'kn' ? 'ಪ್ರಾರಂಭಿಸಿ' : 'Start'}</span>
            </>
          )}
        </button>

        {/* Warning Bell Manual Trigger */}
        <button
          onClick={triggerWarningBell}
          className="px-4 py-3 rounded-2xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
          title={lang === 'kn' ? 'ಎಚ್ಚರಿಕೆ ಗಂಟೆ ಬಾರಿಸಿ' : 'Ring Warning Bell'}
        >
          <Bell className="w-4 h-4 text-amber-400" />
          <span>{lang === 'kn' ? 'ಎಚ್ಚರಿಕೆ ಗಂಟೆ' : 'Warning Bell'}</span>
        </button>

        {/* Final Bell Manual Trigger */}
        <button
          onClick={triggerFinalBell}
          className="px-4 py-3 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
          title={lang === 'kn' ? 'ಅಂತಿಮ ಬೆಲ್ (೫ ಬಾರಿ) ಬಾರಿಸಿ' : 'Ring Final Bell (5 Rings)'}
        >
          <Bell className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>{lang === 'kn' ? 'ಅಂತಿಮ ಗಂಟೆ (೫ ಬಾರಿ)' : 'Final Bell (5 Rings)'}</span>
        </button>
      </div>

    </div>
  );
};
