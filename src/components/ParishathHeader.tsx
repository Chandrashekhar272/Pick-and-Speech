import React from 'react';
import { Award, Sparkles, Landmark, Users } from 'lucide-react';
import { Language } from '../types';

interface ParishathHeaderProps {
  lang: Language;
  compact?: boolean;
  className?: string;
}

export const ParishathHeader: React.FC<ParishathHeaderProps> = ({ 
  lang, 
  compact = false,
  className = ''
}) => {
  if (compact) {
    return (
      <div className={`text-center py-2.5 px-4 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border-b border-amber-300 ${className}`}>
        <h2 className="text-sm sm:text-base md:text-lg font-black text-amber-950 font-serif-kannada tracking-tight">
          {lang === 'kn'
            ? 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್ (ರಿ) ಮೈಸೂರು'
            : 'Karnataka Rajya Shikshakar Pratibha Parishath (R) Mysuru'}
        </h2>
        <p className="text-[11px] sm:text-xs font-bold text-amber-900">
          {lang === 'kn'
            ? 'ತಾಂತ್ರಿಕ ಶಿಕ್ಷಕರ ಸಮಿತಿಯ ಸುಂದರ್ ಪಿಚೈ ತಂಡದ ವತಿಯಿಂದ • ಸಹಕಾರ ಸಮಿತಿಯ ಹಂತದ ಕಾರ್ಯಕ್ರಮ'
            : 'Technical Teachers Committee - Sundar Pichai Team • Cooperative Society Level Event'}
        </p>
        <div className="flex items-center justify-center gap-2 mt-0.5">
          <span className="text-xs sm:text-sm font-black text-amber-900 font-serif-kannada">
            {lang === 'kn' ? 'ಆಶುಭಾಷಣ ಸ್ಪರ್ಧೆ' : 'Aashubhashana Spardhe'}
          </span>
          <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
            {lang === 'kn' ? 'ಧ್ಯೇಯ: ಕರ್ನಾಟಕದ ಗತವೈಭವ' : 'Theme: Karnataka’s Glorious Heritage'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <section 
      id="parishath-official-banner"
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-b from-amber-100/95 via-amber-50/80 to-white border-2 border-amber-300 shadow-md p-5 sm:p-8 text-center ${className}`}
    >
      {/* Decorative Traditional Corner Accents */}
      <div className="absolute top-2 left-3 text-amber-400/50 select-none text-2xl font-serif">✦</div>
      <div className="absolute top-2 right-3 text-amber-400/50 select-none text-2xl font-serif">✦</div>
      <div className="absolute bottom-2 left-3 text-amber-400/40 select-none text-2xl font-serif">✦</div>
      <div className="absolute bottom-2 right-3 text-amber-400/40 select-none text-2xl font-serif">✦</div>

      {/* Official Emblem */}
      <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white shadow-lg shadow-amber-200/80 border-2 border-amber-200 mb-3 animate-in zoom-in-95">
        <Award className="w-8 h-8 sm:w-9 sm:h-9 text-amber-100" />
      </div>

      {/* Typography Hierarchy Level 1: Parishath Organization Name (VERY BIG SIZE) */}
      <div className="max-w-5xl mx-auto space-y-2">
        <div className="inline-block px-3.5 py-1 rounded-full bg-amber-200/80 border border-amber-300/90 text-xs sm:text-sm font-black text-amber-900 uppercase tracking-wider mb-1 shadow-2xs">
          {lang === 'kn' ? 'ರಾಜ್ಯ ಮಟ್ಟದ ಶಿಕ್ಷಣ ಹಾಗೂ ಪ್ರತಿಭಾ ವೇದಿಕೆ' : 'State Level Educational & Talent Forum'}
        </div>

        {/* Big Size Organization Name */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-amber-950 font-serif-kannada tracking-tight leading-snug sm:leading-tight drop-shadow-2xs">
          {lang === 'kn' ? (
            <span>ಕರ್ನಾಟಕ ರಾಜ್ಯ ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್ (ರಿ) ಮೈಸೂರು</span>
          ) : (
            <span>Karnataka Rajya Shikshakar Pratibha Parishath (R) Mysuru</span>
          )}
        </h1>

        {/* Hierarchy Level 2: Committee and Event Level */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm md:text-base font-bold text-amber-900 pt-1">
          <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-100 to-amber-50 border-2 border-amber-300 shadow-xs font-serif-kannada">
            {lang === 'kn' ? 'ತಾಂತ್ರಿಕ ಶಿಕ್ಷಕರ ಸಮಿತಿಯ ಸುಂದರ್ ಪಿಚೈ ತಂಡದ ವತಿಯಿಂದ' : 'From Technical Teachers Committee - Sundar Pichai Team'}
          </span>
          <span className="text-amber-500 font-bold hidden sm:inline">•</span>
          <span className="px-3.5 py-1.5 rounded-xl bg-white/95 border-2 border-amber-300 shadow-xs font-serif-kannada">
            {lang === 'kn' ? 'ಸಹಕಾರ ಸಮಿತಿಯ ಹಂತದ ಕಾರ್ಯಕ್ರಮ' : 'Cooperative Society Level Event'}
          </span>
        </div>

        {/* Decorative Traditional Divider */}
        <div className="flex items-center justify-center gap-3 py-2 my-1">
          <span className="h-[2px] w-14 sm:w-28 bg-gradient-to-r from-transparent via-amber-400 to-amber-600 rounded-full"></span>
          <Sparkles className="w-5 h-5 text-amber-600" />
          <span className="h-[2px] w-14 sm:w-28 bg-gradient-to-l from-transparent via-amber-400 to-amber-600 rounded-full"></span>
        </div>

        {/* Hierarchy Level 3: Main Topic Headline (Aashubhashana Spardhe) */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-900 font-serif-kannada tracking-normal">
          {lang === 'kn' ? 'ಆಶುಭಾಷಣ ಸ್ಪರ್ಧೆ' : 'Aashubhashana Spardhe'}
        </h2>
        
        {/* Theme Pill - ಕರ್ನಾಟಕದ ಗತವೈಭವ & 50 Participants */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs sm:text-sm font-bold shadow-xs">
            <Landmark className="w-3.5 h-3.5 text-amber-200" />
            <span>{lang === 'kn' ? 'ಸ್ಪರ್ಧಾ ವಿಷಯ: ಶಿಕ್ಷಣ, ಗುರು ಪರಂಪರೆ & ಸಮಾಜ ನಿರ್ಮಾಣ' : 'Topic Theme: Education, Teachers & Nation Building'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs sm:text-sm font-bold">
            <Users className="w-3.5 h-3.5 text-amber-700" />
            <span>{lang === 'kn' ? '೫೦ ಸ್ಪರ್ಧಿಗಳ ನೋಂದಣಿ ವೇದಿಕೆ' : '50 Registered Participants'}</span>
          </span>
        </div>
      </div>
    </section>
  );
};

