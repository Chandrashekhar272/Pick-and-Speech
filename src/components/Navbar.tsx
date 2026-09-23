import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Sparkles, 
  Languages, 
  Clock, 
  Award,
  ShieldCheck,
  Bell,
  Edit2,
  Disc
} from 'lucide-react';
import { Language, NavigationTab } from '../types';
import { sound } from '../utils/audio';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenStageMode: () => void;
  activeParticipantCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  activeTab,
  setActiveTab,
  soundEnabled,
  onToggleSound,
  onOpenStageMode,
  activeParticipantCount
}) => {
  const navItems = [
    {
      id: 'pick' as const,
      labelKn: 'ಅದೃಷ್ಟ ಚಕ್ರ (Spin Wheel)',
      labelEn: 'Spin Wheel & Chits',
      icon: Disc
    },
    {
      id: 'timer' as const,
      labelKn: 'ಸ್ಪರ್ಧಾ ಗಡಿಯಾರ',
      labelEn: 'Speech Timer',
      icon: Clock
    },
    {
      id: 'judges' as const,
      labelKn: 'ತೀರ್ಪುಗಾರರ ಲಾಗಿನ್',
      labelEn: 'Judges Menu',
      icon: Award
    },
    {
      id: 'admin' as const,
      labelKn: 'ಅಡ್ಮಿನ್ ಲಾಗಿನ್ (ಫೈನಲ್ ರಿಸಲ್ಟ್)',
      labelEn: 'Admin Menu (Final Results)',
      icon: ShieldCheck
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur border-b-2 border-amber-200/90 shadow-sm">
      {/* Top Banner with Official Parishath Hierarchy */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2.5 gap-2 border-b border-amber-100">
          
          {/* Official Parishath Header Hierarchy */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white flex items-center justify-center font-bold text-lg shadow-sm border border-amber-400 shrink-0">
              <Award className="w-7 h-7 text-amber-200" />
            </div>

            <div className="space-y-0.5">
              {/* Hierarchy Level 1: Organization Name (Big Size) */}
              <div className="text-sm sm:text-base md:text-lg font-black text-amber-950 font-serif-kannada tracking-tight leading-tight">
                {lang === 'kn' ? (
                  <span>ಕರ್ನಾಟಕ ರಾಜ್ಯ ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್ (ರಿ) ಮೈಸೂರು</span>
                ) : (
                  <span>Karnataka Rajya Shikshakar Pratibha Parishath (R) Mysuru</span>
                )}
              </div>

              {/* Hierarchy Level 2: Committee & Level */}
              <div className="text-[11px] sm:text-xs font-bold text-amber-800 flex flex-wrap items-center gap-1.5">
                <span className="text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200">
                  {lang === 'kn' ? 'ತಾಂತ್ರಿಕ ಶಿಕ್ಷಕರ ಸಮಿತಿಯ ಸುಂದರ್ ಪಿಚೈ ತಂಡದ ವತಿಯಿಂದ' : 'Technical Teachers Committee - Sundar Pichai Team'}
                </span>
                <span className="text-amber-400">•</span>
                <span className="bg-white/80 px-2 py-0.5 rounded-md border border-amber-200">
                  {lang === 'kn' ? 'ಸಹಕಾರ ಸಮಿತಿಯ ಹಂತದ ಕಾರ್ಯಕ್ರಮ' : 'Cooperative Society Level Event'}
                </span>
              </div>

              {/* Hierarchy Level 3: Main Topic Headline & Gatavaibhav Theme */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <h1 className="text-sm sm:text-base font-black text-amber-900 font-serif-kannada">
                  {lang === 'kn' ? 'ಆಶುಭಾಷಣ ಸ್ಪರ್ಧೆ' : 'Aashubhashana Spardhe'}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                  <span>{lang === 'kn' ? 'ವಿಷಯ: ಶಿಕ್ಷಣ & ಸಮಾಜ ನಿರ್ಮಾಣ' : 'Theme: Education & Nation Building'}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full border border-stone-200">
                  <span>{activeParticipantCount} {lang === 'kn' ? 'ಸ್ಪರ್ಧಿಗಳು' : 'Participants'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Test Bell */}
            <button
              id="test-bell-button"
              onClick={() => sound.playWarningBell()}
              title={lang === 'kn' ? 'ಶಾಲಾ ಬೆಲ್ ಪರೀಕ್ಷಿಸಿ' : 'Test Bell'}
              className="px-2.5 py-1.5 text-xs font-bold text-amber-950 bg-amber-50 border border-amber-300 rounded-xl hover:bg-amber-100 transition flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">{lang === 'kn' ? 'ಬೆಲ್ ಪರೀಕ್ಷಿಸಿ' : 'Bell'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              id="sound-toggle-button"
              onClick={onToggleSound}
              title={soundEnabled ? (lang === 'kn' ? 'ಧ್ವನಿ ಆಫ್ ಮಾಡಿ' : 'Mute Sound') : (lang === 'kn' ? 'ಧ್ವನಿ ಆನ್ ಮಾಡಿ' : 'Unmute Sound')}
              className={`p-2 rounded-xl border transition ${
                soundEnabled 
                  ? 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200' 
                  : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Stage/Projector Mode */}
            <button
              id="stage-mode-button"
              onClick={onOpenStageMode}
              className="px-3 py-1.5 text-xs font-bold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 hover:border-amber-400 transition flex items-center gap-1.5 shadow-2xs font-serif-kannada"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">{lang === 'kn' ? 'ಪ್ರೊಜೆಕ್ಟರ್ ಪರದೆ' : 'Stage'}</span>
            </button>

            {/* Language Switcher */}
            <button
              id="language-toggle-button"
              onClick={onToggleLang}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-700 hover:bg-amber-800 text-white transition flex items-center gap-1.5 shadow-xs font-serif-kannada"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === 'kn' ? 'English' : 'ಕನ್ನಡ'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation: Pick, Timer, Judges Menu, Admin Menu */}
        <nav className="flex space-x-2 overflow-x-auto py-2.5 scrollbar-none" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all font-serif-kannada ${
                  isActive
                    ? 'bg-amber-700 text-white shadow-sm border border-amber-800'
                    : 'text-stone-700 hover:text-amber-950 hover:bg-amber-100/70 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-200' : 'text-stone-500'}`} />
                <span>{lang === 'kn' ? item.labelKn : item.labelEn}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
