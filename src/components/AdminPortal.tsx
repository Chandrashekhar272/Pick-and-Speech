import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Trophy, 
  Printer, 
  Download, 
  Award, 
  CheckCircle2, 
  Users, 
  BookOpen, 
  Settings, 
  Search, 
  RefreshCw, 
  Trash2, 
  FileText, 
  Clock, 
  Plus, 
  Loader2,
  Eye,
  X
} from 'lucide-react';
import { Participant, Topic, Language, TimerConfig, Category, DifficultyLevel } from '../types';
import { ParticipantManager } from './ParticipantManager';
import { TopicManager } from './TopicManager';
import { generateFinalResultsPDF } from '../utils/pdfExport';
import { DEFAULT_JUDGES } from './JudgesPortal';

interface AdminPortalProps {
  lang: Language;
  schoolName: string;
  onUpdateSchoolName: (name: string) => void;
  participants: Participant[];
  topics: Topic[];
  timerConfig: TimerConfig;
  onUpdateTimerConfig: (config: TimerConfig) => void;
  onAddParticipant: (name: string, chestNo: number, schoolOrClass: string) => void;
  onDeleteParticipant: (id: string) => void;
  onSelectForSpeech: (participant: Participant) => void;
  onOpenScoreForParticipant: (participant: Participant) => void;
  onLoadSampleParticipants: () => void;
  onClearAllParticipants: () => void;
  onAddTopic: (topic: Omit<Topic, 'id' | 'number'>) => void;
  onBulkAddTopics: (titles: string[], category: Category, level: DifficultyLevel) => void;
  onDeleteTopic: (id: string) => void;
  onToggleTopicUsed: (id: string, isUsed: boolean) => void;
  onResetToDefaultTopics: () => void;
  onClearAllUsedStatus: () => void;
  onResetAllScores: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  lang,
  schoolName,
  onUpdateSchoolName,
  participants,
  topics,
  timerConfig,
  onUpdateTimerConfig,
  onAddParticipant,
  onDeleteParticipant,
  onSelectForSpeech,
  onOpenScoreForParticipant,
  onLoadSampleParticipants,
  onClearAllParticipants,
  onAddTopic,
  onBulkAddTopics,
  onDeleteTopic,
  onToggleTopicUsed,
  onResetToDefaultTopics,
  onClearAllUsedStatus,
  onResetAllScores
}) => {
  // Admin Login state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('admin_authenticated') === 'true';
  });
  const [adminPin, setAdminPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Active Admin Sub-tab
  const [adminSubTab, setAdminSubTab] = useState<'results' | 'sync' | 'participants' | 'topics' | 'settings'>('results');
  const [inspectedParticipant, setInspectedParticipant] = useState<Participant | null>(null);

  // Search in results
  const [searchTerm, setSearchTerm] = useState('');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfExportSuccess, setPdfExportSuccess] = useState(false);

  // Handle PIN Login
  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (adminPin === '1234' || adminPin === 'admin' || adminPin === '') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      setPinError(null);
    } else {
      setPinError(lang === 'kn' ? 'ತಪ್ಪಾದ ಪಿನ್ (Default: 1234)' : 'Incorrect PIN (Default: 1234)');
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    setAdminPin('');
  };

  // Sort participants by score descending
  const scoredParticipants = participants
    .filter(p => p.scores !== undefined)
    .sort((a, b) => (b.scores?.total || 0) - (a.scores?.total || 0));

  const filteredResults = scoredParticipants.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.schoolOrClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.chestNo.toString().includes(searchTerm)
  );

  const firstPlace = scoredParticipants[0];
  const secondPlace = scoredParticipants[1];
  const thirdPlace = scoredParticipants[2];

  // Print Official Results with letterhead
  const handlePrint = () => {
    window.print();
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Rank',
      'Chest No',
      'Name',
      'Class/School',
      'Topic',
      'Content (10)',
      'Language (10)',
      'Presentation (10)',
      'Time (10)',
      'Impact (10)',
      'Total (50)',
      'Remarks'
    ];

    const rows = scoredParticipants.map((p, index) => [
      index + 1,
      p.chestNo,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.schoolOrClass.replace(/"/g, '""')}"`,
      p.assignedTopic ? `"${p.assignedTopic.titleKn.replace(/"/g, '""')}"` : '""',
      p.scores?.content || 0,
      p.scores?.language || 0,
      p.scores?.presentation || 0,
      p.scores?.timeManagement || 0,
      p.scores?.impact || 0,
      p.scores?.total || 0,
      `"${(p.scores?.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aashubhashana_Final_Results_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Official Final Results to PDF
  const handleExportPDF = async () => {
    try {
      setIsExportingPDF(true);
      await generateFinalResultsPDF({
        schoolName,
        lang,
        participants
      });
      setPdfExportSuccess(true);
      setTimeout(() => setPdfExportSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert(lang === 'kn' ? 'PDF ರಚನೆ ವಿಫಲವಾಯಿತು, ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.' : 'Failed to generate PDF, please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // If not authenticated, show Admin Login Box
  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border-2 border-amber-300 shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <ShieldCheck className="w-8 h-8 text-amber-700" />
        </div>
        <h2 className="text-xl font-black text-amber-950 font-serif-kannada">
          {lang === 'kn' ? 'ಅಡ್ಮಿನ್ ಲಾಗಿನ್ (Admin Menu)' : 'Administrator Login'}
        </h2>
        <p className="text-xs text-stone-600 mt-1 mb-6">
          {lang === 'kn'
            ? 'ಎಲ್ಲಾ ಸ್ಪರ್ಧಿಗಳ ಅಂತಿಮ ಫಲಿತಾಂಶ, ಶ್ರೇಯಾಂಕ ಪಟ್ಟಿ ಹಾಗೂ ನಿರ್ವಹಣೆಗೆ ಅಡ್ಮಿನ್ ಪಿನ್ ನಮೂದಿಸಿ.'
            : 'Enter PIN to access official final results, certifications, and system settings.'}
        </p>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 text-left mb-1.5 font-serif-kannada">
              {lang === 'kn' ? 'ಅಡ್ಮಿನ್ ಪಿನ್ (Default PIN: 1234)' : 'Admin PIN (Default: 1234)'}
            </label>
            <input
              type="password"
              placeholder="1234"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center font-mono font-bold text-lg tracking-widest"
              autoFocus
            />
            {pinError && (
              <p className="text-xs text-rose-600 font-bold mt-1.5 text-left">{pinError}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-md transition font-serif-kannada flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>{lang === 'kn' ? 'ಲಾಗಿನ್ ಮಾಡಿ' : 'Unlock Dashboard'}</span>
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => {
              setAdminPin('1234');
              setIsAdminAuthenticated(true);
              localStorage.setItem('admin_authenticated', 'true');
            }}
            className="text-xs text-amber-800 underline hover:text-amber-950 font-medium"
          >
            {lang === 'kn' ? 'ನೇರವಾಗಿ ಪ್ರವೇಶಿಸಿ (Quick Demo Access)' : 'Quick Demo Access (1234)'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Admin Sub Navigation & Status Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md">
                {lang === 'kn' ? 'ಅಡ್ಮಿನ್ ನಿಯಂತ್ರಣ ಮಂಡಳಿ' : 'Admin Control Center'}
              </span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {lang === 'kn' ? 'ಅಧಿಕೃತ ಪ್ರವೇಶ' : 'Authenticated'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-amber-950 font-serif-kannada mt-0.5">
              {lang === 'kn' ? 'ಎಲ್ಲಾ ಸ್ಪರ್ಧಿಗಳ ಅಂತಿಮ ಫಲಿತಾಂಶ & ನಿರ್ವಹಣೆ' : 'Final Results & Management Hub'}
            </h2>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200 overflow-x-auto">
          <button
            onClick={() => setAdminSubTab('results')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              adminSubTab === 'results'
                ? 'bg-amber-700 text-white shadow-xs font-serif-kannada'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{lang === 'kn' ? 'ಅಂತಿಮ ಫಲಿತಾಂಶ' : 'Final Results'}</span>
          </button>

          <button
            onClick={() => setAdminSubTab('sync')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              adminSubTab === 'sync'
                ? 'bg-amber-700 text-white shadow-xs font-serif-kannada'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'kn' ? '೪ ತೀರ್ಪುಗಾರರ ಸಿಂಕ್' : '4 Judges Sync'}</span>
          </button>

          <button
            onClick={() => setAdminSubTab('participants')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              adminSubTab === 'participants'
                ? 'bg-amber-700 text-white shadow-xs font-serif-kannada'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{lang === 'kn' ? 'ಸ್ಪರ್ಧಿಗಳ ಪಟ್ಟಿ' : 'Participants'}</span>
          </button>

          <button
            onClick={() => setAdminSubTab('topics')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              adminSubTab === 'topics'
                ? 'bg-amber-700 text-white shadow-xs font-serif-kannada'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{lang === 'kn' ? 'ವಿಷಯಗಳ ಬ್ಯಾಂಕ್' : 'Topic Bank'}</span>
          </button>

          <button
            onClick={handleLogout}
            title={lang === 'kn' ? 'ಅಡ್ಮಿನ್ ನಿರ್ಗಮನ' : 'Lock Admin'}
            className="px-2.5 py-2 text-stone-500 hover:text-rose-700 transition"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-tab 1: All Final Results & Winners (Requested: "admin login nalli ella result final irali") */}
      {adminSubTab === 'results' && (
        <div className="space-y-6">

          {/* Official Parishath Letterhead for Screen & Print */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-sm print:border-none print:shadow-none print:p-0">
            
            <div className="text-center pb-6 border-b-2 border-amber-200/80 mb-6">
              <div className="inline-block px-3 py-0.5 rounded-full bg-amber-100 text-[11px] font-bold text-amber-900 uppercase tracking-widest mb-1 print:hidden">
                {lang === 'kn' ? 'ಅಧಿಕೃತ ಅಂತಿಮ ಫಲಿತಾಂಶ ಪಟ್ಟಿ' : 'Official Final Results Sheet'}
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-950 font-serif-kannada">
                {lang === 'kn'
                  ? 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್ (ರಿ) ಮೈಸೂರು'
                  : 'Karnataka Rajya Shikshakar Pratibha Parishath (R) Mysuru'}
              </h1>
              <p className="text-xs sm:text-sm font-bold text-amber-800 mt-1">
                {lang === 'kn'
                  ? 'ತಾಂತ್ರಿಕ ಶಿಕ್ಷಕರ ಸಮಿತಿಯ ಸುಂದರ್ ಪಿಚೈ ತಂಡದ ವತಿಯಿಂದ • ಸಹಕಾರ ಸಮಿತಿಯ ಹಂತದ ಕಾರ್ಯಕ್ರಮ'
                  : 'Technical Teachers Committee - Sundar Pichai Team • Cooperative Society Level Event'}
              </p>
              <h2 className="text-lg sm:text-xl font-black text-amber-900 font-serif-kannada mt-1">
                {lang === 'kn' ? 'ಆಶುಭಾಷಣ ಸ್ಪರ್ಧೆ - ಅಂತಿಮ ಶ್ರೇಯಾಂಕ ಮತ್ತು ಅಂಕಪಟ್ಟಿ' : 'Aashubhashana Spardhe - Final Consolidated Scorecard'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {schoolName} • {new Date().toLocaleDateString('kn-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Action Buttons: Print and Export */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={lang === 'kn' ? 'ಸ್ಪರ್ಧಿಯ ಹೆಸರು ಅಥವಾ ಚೆಸ್ಟ್ ನಂ...' : 'Search participant...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {pdfExportSuccess && (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === 'kn' ? 'PDF ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ!' : 'PDF Downloaded!'}</span>
                  </span>
                )}

                <button
                  id="export-pdf-final-btn"
                  onClick={handleExportPDF}
                  disabled={isExportingPDF}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-800 active:scale-95 text-white shadow-xs transition flex items-center gap-1.5 font-serif-kannada border border-rose-800 disabled:opacity-50"
                  title="ಅಧಿಕೃತ ಕರ್ನಾಟಕ ಶಿಕ್ಷಕರ ಪರಿಷತ್ ಅಂತಿಮ ಫಲಿತಾಂಶ PDF ಡೌನ್‌ಲೋಡ್"
                >
                  {isExportingPDF ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{lang === 'kn' ? 'PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ...' : 'Generating PDF...'}</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5 text-rose-100" />
                      <span>{lang === 'kn' ? 'ಅಂತಿಮ ಫಲಿತಾಂಶ PDF ಡೌನ್‌ಲೋಡ್' : 'Download Final PDF'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-stone-600" />
                  <span>{lang === 'kn' ? 'CSV ಡೌನ್‌ಲೋಡ್' : 'Export CSV'}</span>
                </button>

                <button
                  id="print-final-results-btn"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-xs transition flex items-center gap-1.5 font-serif-kannada"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{lang === 'kn' ? 'ಮುದ್ರಿಸಿ (Print / PDF)' : 'Print / Save PDF'}</span>
                </button>
              </div>
            </div>

            {/* Winners Podium (1st, 2nd, 3rd) */}
            {scoredParticipants.length > 0 && (
              <div className="bg-gradient-to-b from-amber-50/80 to-stone-50 rounded-3xl p-6 border border-amber-200 shadow-xs mb-8 print:border print:p-4">
                <div className="text-center mb-5">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                    {lang === 'kn' ? 'ಅಂತಿಮ ವಿಜೇತರ ವೇದಿಕೆ (Top 3 Winners)' : 'Official Winners Podium'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-4 sm:gap-6 max-w-2xl mx-auto">
                  
                  {/* 2nd Prize */}
                  {secondPlace && (
                    <div className="order-2 sm:order-1 w-full sm:w-44 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-stone-200 border-2 border-stone-400 text-stone-700 flex items-center justify-center font-black text-base shadow-xs mb-2">
                        🥈 ೨
                      </div>
                      <div className="bg-white rounded-2xl p-4 border border-stone-300 shadow-xs w-full text-center flex flex-col justify-between h-36">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-stone-500">
                            {lang === 'kn' ? 'ದ್ವಿತೀಯ ಬಹುಮಾನ' : '2nd Prize'}
                          </span>
                          <h4 className="font-bold text-stone-900 text-sm line-clamp-1 mt-0.5 font-serif-kannada">
                            {secondPlace.name}
                          </h4>
                          <p className="text-[11px] text-stone-500 line-clamp-1">
                            {secondPlace.schoolOrClass}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-stone-100">
                          <span className="text-lg font-mono font-bold text-stone-800">
                            {secondPlace.scores?.total}
                          </span>
                          <span className="text-xs text-stone-400"> / 50</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1st Prize (Champion) */}
                  {firstPlace && (
                    <div className="order-1 sm:order-2 w-full sm:w-52 flex flex-col items-center -mt-4 sm:-mt-6">
                      <div className="w-16 h-16 rounded-2xl bg-amber-400 border-2 border-amber-600 text-amber-950 flex items-center justify-center font-black text-2xl shadow-md mb-2 animate-bounce print:animate-none">
                        🥇 ೧
                      </div>
                      <div className="bg-white rounded-3xl p-5 border-2 border-amber-400 shadow-md w-full text-center flex flex-col justify-between h-44 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                          {lang === 'kn' ? 'ಪ್ರಥಮ ಬಹುಮಾನ' : '1st Prize Winner'}
                        </div>
                        <div className="mt-1">
                          <h4 className="font-extrabold text-stone-900 text-base line-clamp-1 font-serif-kannada">
                            {firstPlace.name}
                          </h4>
                          <p className="text-xs text-amber-800 font-medium line-clamp-1">
                            {firstPlace.schoolOrClass}
                          </p>
                          {firstPlace.assignedTopic && (
                            <p className="text-[10px] text-stone-500 italic line-clamp-1 mt-1">
                              #{firstPlace.assignedTopic.number}: {lang === 'kn' ? firstPlace.assignedTopic.titleKn : firstPlace.assignedTopic.titleEn}
                            </p>
                          )}
                        </div>
                        <div className="pt-2 border-t border-amber-100">
                          <span className="text-2xl font-mono font-extrabold text-amber-800">
                            {firstPlace.scores?.total}
                          </span>
                          <span className="text-xs text-stone-500"> / 50</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3rd Prize */}
                  {thirdPlace && (
                    <div className="order-3 w-full sm:w-44 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-amber-700/20 border-2 border-amber-700/50 text-amber-900 flex items-center justify-center font-black text-base shadow-xs mb-2">
                        🥉 ೩
                      </div>
                      <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs w-full text-center flex flex-col justify-between h-32">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-stone-500">
                            {lang === 'kn' ? 'ತೃತೀಯ ಬಹುಮಾನ' : '3rd Prize'}
                          </span>
                          <h4 className="font-bold text-stone-900 text-sm line-clamp-1 mt-0.5 font-serif-kannada">
                            {thirdPlace.name}
                          </h4>
                          <p className="text-[11px] text-stone-500 line-clamp-1">
                            {thirdPlace.schoolOrClass}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-stone-100">
                          <span className="text-lg font-mono font-bold text-stone-800">
                            {thirdPlace.scores?.total}
                          </span>
                          <span className="text-xs text-stone-400"> / 50</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Comprehensive Consolidated Results Table */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden print:border-stone-400">
              <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 font-serif-kannada">
                  {lang === 'kn' ? 'ಎಲ್ಲಾ ಸ್ಪರ್ಧಿಗಳ ಅಂತಿಮ ಅಂಕಪಟ್ಟಿ ವಿವರ (೫ ಮಾನದಂಡಗಳು)' : 'Final Detailed Evaluation Breakdown'}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  {lang === 'kn' ? `ಮೌಲ್ಯಮಾಪನಗೊಂಡ ಒಟ್ಟು ಸ್ಪರ್ಧಿಗಳು: ${scoredParticipants.length}` : `Total Scored: ${scoredParticipants.length}`}
                </span>
              </div>

              {filteredResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-amber-50/60 border-b border-stone-200 text-stone-700 uppercase text-[11px] font-bold tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">{lang === 'kn' ? 'ಶ್ರೇಯಾಂಕ' : 'Rank'}</th>
                        <th className="py-2.5 px-3">{lang === 'kn' ? 'ಚೆಸ್ಟ್ ನಂ' : 'Chest #'}</th>
                        <th className="py-2.5 px-3">{lang === 'kn' ? 'ಸ್ಪರ್ಧಿಯ ಹೆಸರು' : 'Name'}</th>
                        <th className="py-2.5 px-3">{lang === 'kn' ? 'ತರಗತಿ / ಶಾಲೆ' : 'Class / School'}</th>
                        <th className="py-2.5 px-3 text-center">{lang === 'kn' ? 'ವಿಷಯ (೧೦)' : 'Content'}</th>
                        <th className="py-2.5 px-3 text-center">{lang === 'kn' ? 'ಭಾಷೆ (೧೦)' : 'Language'}</th>
                        <th className="py-2.5 px-3 text-center">{lang === 'kn' ? 'ಹಾವಭಾವ (೧೦)' : 'Presence'}</th>
                        <th className="py-2.5 px-3 text-center">{lang === 'kn' ? 'ಸಮಯ (೧೦)' : 'Time'}</th>
                        <th className="py-2.5 px-3 text-center">{lang === 'kn' ? 'ಪ್ರಭಾವ (೧೦)' : 'Impact'}</th>
                        <th className="py-2.5 px-3 text-center font-bold text-amber-950">{lang === 'kn' ? 'ಒಟ್ಟು (೫೦)' : 'Total (/50)'}</th>
                        <th className="py-2.5 px-3">{lang === 'kn' ? 'ಷರಾ' : 'Remarks'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredResults.map((p, index) => {
                        const rank = index + 1;
                        const s = p.scores!;
                        return (
                          <tr key={p.id} className={rank <= 3 ? 'bg-amber-50/40 font-medium' : 'hover:bg-stone-50'}>
                            <td className="py-2.5 px-3 font-bold text-stone-900">
                              {rank === 1 ? '🥇 ೧' : rank === 2 ? '🥈 ೨' : rank === 3 ? '🥉 ೩' : `#${rank}`}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-amber-800">
                              #{p.chestNo}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-stone-900 font-serif-kannada">
                              {p.name}
                            </td>
                            <td className="py-2.5 px-3 text-stone-600">
                              {p.schoolOrClass}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono">{s.content}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{s.language}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{s.presentation}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{s.timeManagement}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{s.impact}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-black text-base text-amber-800">
                              {s.total}
                            </td>
                            <td className="py-2.5 px-3 text-stone-500 text-xs italic max-w-xs truncate">
                              {s.remarks || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-stone-500 text-xs sm:text-sm">
                  {lang === 'kn'
                    ? 'ಇನ್ನೂ ಯಾವುದೇ ಸ್ಪರ್ಧಿಯ ಮೌಲ್ಯಮಾಪನ ದಾಖಲಾಗಿಲ್ಲ. "ತೀರ್ಪುಗಾರರ ಲಾಗಿನ್" ಮೆನುವಿನಲ್ಲಿ ಅಂಕಗಳನ್ನು ನಮೂದಿಸಿ.'
                    : 'No evaluations recorded yet. Enter scores in the Judges Login menu.'}
                </div>
              )}
            </div>

            {/* Official Certification / Signature Block for Print with all 4 judges */}
            <div className="mt-12 pt-8 border-t-2 border-stone-300 hidden print:grid grid-cols-5 text-center gap-2 text-xs font-serif-kannada">
              <div>
                <p className="font-bold text-stone-800 mb-10">ಮುಖ್ಯ ತೀರ್ಪುಗಾರರು</p>
                <div className="border-t border-stone-400 w-24 mx-auto pt-1">೧. ತೀರ್ಪುಗಾರರು - ೧</div>
              </div>
              <div>
                <p className="font-bold text-stone-800 mb-10">ಸಹ ತೀರ್ಪುಗಾರರು</p>
                <div className="border-t border-stone-400 w-24 mx-auto pt-1">೨. ತೀರ್ಪುಗಾರರು - ೨</div>
              </div>
              <div>
                <p className="font-bold text-stone-800 mb-10">ಸಹ ತೀರ್ಪುಗಾರರು</p>
                <div className="border-t border-stone-400 w-24 mx-auto pt-1">೩. ತೀರ್ಪುಗಾರರು - ೩</div>
              </div>
              <div>
                <p className="font-bold text-stone-800 mb-10">ಸಹ ತೀರ್ಪುಗಾರರು</p>
                <div className="border-t border-stone-400 w-24 mx-auto pt-1">೪. ತೀರ್ಪುಗಾರರು - ೪</div>
              </div>
              <div>
                <p className="font-bold text-stone-800 mb-10">ಅಧ್ಯಕ್ಷರು / ಸಂಚಾಲಕರು</p>
                <div className="border-t border-stone-400 w-28 mx-auto pt-1">ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್</div>
              </div>
            </div>

          </div>

          {/* Reset Action */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200 print:hidden text-xs">
            <span className="text-stone-500">
              {lang === 'kn' ? 'ಹೊಸ ಸ್ಪರ್ಧೆಗಾಗಿ ಎಲ್ಲಾ ಅಂಕಗಳನ್ನು ಮರುಹೊಂದಿಸಬಹುದು.' : 'Reset all evaluation scores for a fresh round.'}
            </span>
            <button
              onClick={() => {
                if (window.confirm(lang === 'kn' ? 'ಎಲ್ಲಾ ಸ್ಪರ್ಧಿಗಳ ಅಂಕಗಳನ್ನು ತೆರವುಗೊಳಿಸಲು ನೀವು ಖಚಿತವೇ?' : 'Are you sure you want to reset all scores?')) {
                  onResetAllScores();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition"
            >
              {lang === 'kn' ? 'ಅಂಕಗಳನ್ನು ರದ್ದುಮಾಡಿ (Reset Scores)' : 'Reset All Scores'}
            </button>
          </div>

        </div>
      )}

      {/* Sub-tab 2: 4 Judges Sync Matrix & Comparison Dashboard */}
      {adminSubTab === 'sync' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-200 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{lang === 'kn' ? '೪ ತೀರ್ಪುಗಾರರ ಲೈವ್ ಸಿಂಕ್ ಕನ್ಸೋಲ್' : '4 Judges Live Sync Console'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-amber-950 font-serif-kannada">
                  {lang === 'kn' ? 'ತೀರ್ಪುಗಾರರ ಮೌಲ್ಯಮಾಪನ ಸಮನ್ವಯ ಮತ್ತು ಸಿಂಕ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : 'Judges Multi-Evaluation Sync & Consensus Dashboard'}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  {lang === 'kn'
                    ? '೪ ತೀರ್ಪುಗಾರರು ಪ್ರತ್ಯೇಕವಾಗಿ ನೀಡಿದ ಅಂಕಗಳ ಲೈವ್ ಸಿಂಕ್ ಮತ್ತು ಸರಾಸರಿ (Consensus) ಲೆಕ್ಕಾಚಾರ'
                    : 'Real-time multi-judge synchronization, individual evaluation comparison, and consensus score aggregation'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setAdminSubTab('results')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-xs transition flex items-center gap-1.5 font-serif-kannada"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{lang === 'kn' ? 'ಅಂತಿಮ ಫಲಿತಾಂಶ ವೀಕ್ಷಣೆ' : 'View Final Results'}</span>
                </button>
              </div>
            </div>

            {/* 4 Judges Summary Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {DEFAULT_JUDGES.map((judge, idx) => {
                const evaluatedList = participants.filter(p => p.judgeScores?.[judge.id] !== undefined);
                const scoresList = evaluatedList.map(p => p.judgeScores![judge.id].total);
                const avgScore = scoresList.length > 0 
                  ? (scoresList.reduce((acc, curr) => acc + curr, 0) / scoresList.length).toFixed(1) 
                  : '-';
                const totalParticipantsCount = participants.length;
                const percentage = totalParticipantsCount > 0 
                  ? Math.round((evaluatedList.length / totalParticipantsCount) * 100) 
                  : 0;
                const isFullyComplete = totalParticipantsCount > 0 && evaluatedList.length === totalParticipantsCount;

                return (
                  <div 
                    key={judge.id}
                    className={`rounded-2xl p-4 border transition ${
                      isFullyComplete 
                        ? 'bg-emerald-50/70 border-emerald-300' 
                        : evaluatedList.length > 0 
                          ? 'bg-amber-50/60 border-amber-300' 
                          : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-stone-200/80 text-stone-800">
                        {judge.role}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isFullyComplete
                          ? 'bg-emerald-200 text-emerald-900'
                          : evaluatedList.length > 0
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-stone-200 text-stone-600'
                      }`}>
                        {isFullyComplete 
                          ? (lang === 'kn' ? 'ಪೂರ್ಣಗೊಂಡಿದೆ' : '100% Done') 
                          : evaluatedList.length > 0 
                            ? `${percentage}%` 
                            : (lang === 'kn' ? 'ಬಾಕಿ' : 'Pending')}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 font-serif-kannada">
                      {judge.name}
                    </h4>

                    <div className="mt-3 space-y-1.5 text-xs text-stone-600">
                      <div className="flex items-center justify-between">
                        <span>{lang === 'kn' ? 'ಮೌಲ್ಯಮಾಪನಗೊಂಡವರು:' : 'Evaluated:'}</span>
                        <span className="font-mono font-bold text-stone-900">
                          {evaluatedList.length} / {totalParticipantsCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{lang === 'kn' ? 'ಸರಾಸರಿ ನೀಡಿದ ಅಂಕ:' : 'Average Score:'}</span>
                        <span className="font-mono font-bold text-amber-800">
                          {avgScore} / 50
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-stone-200/80 rounded-full h-1.5 mt-3 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          isFullyComplete ? 'bg-emerald-600' : 'bg-amber-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4 Judges Score Matrix Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif-kannada">
                  {lang === 'kn' ? 'ಸ್ಪರ್ಧಿವಾರು ೪ ತೀರ್ಪುಗಾರರ ತುಲನಾತ್ಮಕ ಅಂಕಪಟ್ಟಿ' : 'Participant-wise 4 Judges Comparative Scoreboard'}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === 'kn'
                    ? 'ಯಾವುದೇ ಸ್ಪರ್ಧಿಯ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ೪ ತೀರ್ಪುಗಾರರ ಮಾನದಂಡವಾರು ಅಂಕಗಳನ್ನು ಪರಿಶೀಲಿಸಿ'
                    : 'Click "View Details" to inspect individual criteria marks submitted by all 4 judges'}
                </p>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={lang === 'kn' ? 'ಸ್ಪರ್ಧಿಯ ಹೆಸರು ಅಥವಾ ಚೆಸ್ಟ್...' : 'Search participant...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Matrix Table */}
            {participants.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs sm:text-sm">
                {lang === 'kn' ? 'ಯಾವುದೇ ಸ್ಪರ್ಧಿಗಳು ನೋಂದಾಯಿತವಾಗಿಲ್ಲ.' : 'No participants registered yet.'}
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
                      <th className="py-3 px-3 text-center font-bold text-amber-950">
                        {lang === 'kn' ? 'ಸಿಂಕ್ ಆದ ಸರಾಸರಿ' : 'Consensus Avg'}
                      </th>
                      <th className="py-3 px-3 text-center">{lang === 'kn' ? 'ಸಿಂಕ್ ಸ್ಥಿತಿ' : 'Sync Status'}</th>
                      <th className="py-3 px-3 text-center">{lang === 'kn' ? 'ವಿವರ' : 'Details'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {participants
                      .filter(p => 
                        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.schoolOrClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.chestNo.toString().includes(searchTerm)
                      )
                      .map((p) => {
                        const j1 = p.judgeScores?.['judge-1'];
                        const j2 = p.judgeScores?.['judge-2'];
                        const j3 = p.judgeScores?.['judge-3'];
                        const j4 = p.judgeScores?.['judge-4'];

                        const judgeCount = [j1, j2, j3, j4].filter(Boolean).length;
                        const isFullySynced = judgeCount === 4;

                        return (
                          <tr key={p.id} className="hover:bg-stone-50 transition">
                            <td className="py-3 px-3 font-mono font-bold text-amber-800">
                              #{p.chestNo}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-stone-900 font-serif-kannada">{p.name}</div>
                              <div className="text-[11px] text-stone-500">{p.schoolOrClass}</div>
                            </td>
                            
                            {/* Judge 1 */}
                            <td className="py-3 px-3 text-center">
                              {j1 ? (
                                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  {j1.total} / 50
                                </span>
                              ) : (
                                <span className="text-[11px] text-stone-400 font-mono">-</span>
                              )}
                            </td>

                            {/* Judge 2 */}
                            <td className="py-3 px-3 text-center">
                              {j2 ? (
                                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  {j2.total} / 50
                                </span>
                              ) : (
                                <span className="text-[11px] text-stone-400 font-mono">-</span>
                              )}
                            </td>

                            {/* Judge 3 */}
                            <td className="py-3 px-3 text-center">
                              {j3 ? (
                                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  {j3.total} / 50
                                </span>
                              ) : (
                                <span className="text-[11px] text-stone-400 font-mono">-</span>
                              )}
                            </td>

                            {/* Judge 4 */}
                            <td className="py-3 px-3 text-center">
                              {j4 ? (
                                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  {j4.total} / 50
                                </span>
                              ) : (
                                <span className="text-[11px] text-stone-400 font-mono">-</span>
                              )}
                            </td>

                            {/* Consensus Average */}
                            <td className="py-3 px-3 text-center">
                              {p.scores ? (
                                <span className="font-mono font-black text-sm text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-lg border border-amber-300">
                                  {p.scores.total} <span className="text-[10px] font-normal text-stone-500">/ 50</span>
                                </span>
                              ) : (
                                <span className="text-stone-400 text-xs">-</span>
                              )}
                            </td>

                            {/* Sync Status Badge */}
                            <td className="py-3 px-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isFullySynced
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : judgeCount > 0
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-stone-100 text-stone-500'
                              }`}>
                                {isFullySynced ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                    <span>{lang === 'kn' ? '೪/೪ ಸಿಂಕ್ ಆಗಿದೆ' : '4/4 Synced'}</span>
                                  </>
                                ) : judgeCount > 0 ? (
                                  <span>{judgeCount}/4 {lang === 'kn' ? 'ಸಿಂಕ್' : 'Synced'}</span>
                                ) : (
                                  <span>{lang === 'kn' ? 'ಬಾಕಿ ⏳' : 'Pending'}</span>
                                )}
                              </span>
                            </td>

                            {/* Details Action */}
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => setInspectedParticipant(p)}
                                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 transition flex items-center gap-1 mx-auto text-xs font-semibold"
                                title={lang === 'kn' ? '೪ ತೀರ್ಪುಗಾರರ ವಿವರ ವೀಕ್ಷಣೆ' : 'Inspect Details'}
                              >
                                <Eye className="w-3.5 h-3.5 text-amber-700" />
                                <span>{lang === 'kn' ? 'ವೀಕ್ಷಣೆ' : 'View'}</span>
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
        </div>
      )}

      {/* Sub-tab 3: Participant Management */}
      {adminSubTab === 'participants' && (
        <ParticipantManager
          lang={lang}
          participants={participants}
          onAddParticipant={onAddParticipant}
          onDeleteParticipant={onDeleteParticipant}
          onSelectForSpeech={onSelectForSpeech}
          onOpenScoreForParticipant={onOpenScoreForParticipant}
          onLoadSampleParticipants={onLoadSampleParticipants}
          onClearAllParticipants={onClearAllParticipants}
        />
      )}

      {/* Sub-tab 4: Topics Bank Management */}
      {adminSubTab === 'topics' && (
        <TopicManager
          lang={lang}
          topics={topics}
          onAddTopic={onAddTopic}
          onBulkAddTopics={onBulkAddTopics}
          onDeleteTopic={onDeleteTopic}
          onToggleTopicUsed={onToggleTopicUsed}
          onResetToDefault={onResetToDefaultTopics}
          onClearAllUsedStatus={onClearAllUsedStatus}
        />
      )}

      {/* Modal: Detailed 4 Judges Criteria Breakdown Inspection */}
      {inspectedParticipant && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-amber-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-1">
                  <span>#{inspectedParticipant.chestNo}</span>
                  <span>•</span>
                  <span>{inspectedParticipant.schoolOrClass}</span>
                </div>
                <h3 className="text-xl font-bold text-amber-950 font-serif-kannada">
                  {inspectedParticipant.name} - {lang === 'kn' ? '೪ ತೀರ್ಪುಗಾರರ ವಿಸ್ತೃತ ಮೌಲ್ಯಮಾಪನ ಅಂಕಗಳು' : '4 Judges Detailed Breakdown'}
                </h3>
                {inspectedParticipant.assignedTopic && (
                  <p className="text-xs text-amber-800 mt-1 font-medium">
                    {lang === 'kn' ? 'ವಿಷಯ:' : 'Topic:'} #{inspectedParticipant.assignedTopic.number} - {lang === 'kn' ? inspectedParticipant.assignedTopic.titleKn : inspectedParticipant.assignedTopic.titleEn}
                  </p>
                )}
              </div>

              <button
                onClick={() => setInspectedParticipant(null)}
                className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Criteria Breakdown Grid */}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-stone-100 text-stone-700 uppercase text-[11px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">{lang === 'kn' ? 'ಮಾನದಂಡ (ಗರಿಷ್ಠ ೧೦)' : 'Criteria (Max 10)'}</th>
                    {DEFAULT_JUDGES.map(j => (
                      <th key={j.id} className="py-2.5 px-3 text-center">{j.name.split(' ')[0]} {j.name.split(' ')[1]}</th>
                    ))}
                    <th className="py-2.5 px-3 text-center font-bold text-amber-950">{lang === 'kn' ? 'ಸರಾಸರಿ' : 'Avg'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {[
                    { key: 'content' as const, kn: '೧. ವಿಷಯ ಜ್ಞಾನ', en: '1. Content' },
                    { key: 'language' as const, kn: '೨. ಭಾಷಾ ಶುದ್ಧತೆ ಮತ್ತು ಶೈಲಿ', en: '2. Language & Fluency' },
                    { key: 'presentation' as const, kn: '೩. ಹಾವಭಾವ ಮತ್ತು ಪ್ರಸ್ತುತಿ', en: '3. Presentation & Body Language' },
                    { key: 'timeManagement' as const, kn: '೪. ಸಮಯ ಪಾಲನೆ', en: '4. Time Management' },
                    { key: 'impact' as const, kn: '೫. ಒಟ್ಟಾರೆ ಪ್ರಭಾವ ಮತ್ತು ಮುಕ್ತಾಯ', en: '5. Overall Impact' }
                  ].map((crit) => {
                    const vals = DEFAULT_JUDGES.map(j => inspectedParticipant.judgeScores?.[j.id]?.[crit.key]);
                    const validVals = vals.filter((v): v is number => typeof v === 'number');
                    const critAvg = validVals.length > 0 
                      ? (validVals.reduce((a, b) => a + b, 0) / validVals.length).toFixed(1) 
                      : '-';

                    return (
                      <tr key={crit.key} className="hover:bg-stone-50">
                        <td className="py-2.5 px-3 font-semibold text-stone-800 font-serif-kannada">
                          {lang === 'kn' ? crit.kn : crit.en}
                        </td>
                        {DEFAULT_JUDGES.map(j => {
                          const val = inspectedParticipant.judgeScores?.[j.id]?.[crit.key];
                          return (
                            <td key={j.id} className="py-2.5 px-3 text-center font-mono font-medium text-stone-700">
                              {val !== undefined ? val : '-'}
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-800 bg-amber-50/50">
                          {critAvg}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Total row */}
                  <tr className="bg-amber-100/60 font-bold border-t-2 border-amber-300">
                    <td className="py-3 px-3 text-amber-950 font-serif-kannada font-black">
                      {lang === 'kn' ? 'ಒಟ್ಟು ಅಂಕಗಳು (/೫೦)' : 'Total Score (/50)'}
                    </td>
                    {DEFAULT_JUDGES.map(j => {
                      const totalVal = inspectedParticipant.judgeScores?.[j.id]?.total;
                      return (
                        <td key={j.id} className="py-3 px-3 text-center font-mono font-black text-sm text-stone-900">
                          {totalVal !== undefined ? `${totalVal}` : '-'}
                        </td>
                      );
                    })}
                    <td className="py-3 px-3 text-center font-mono font-black text-base text-amber-900 bg-amber-200/60">
                      {inspectedParticipant.scores?.total || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Remarks by Judges */}
            <div className="mt-5 pt-4 border-t border-stone-200 space-y-2">
              <h4 className="text-xs font-bold uppercase text-stone-600">
                {lang === 'kn' ? 'ತೀರ್ಪುಗಾರರ ಷರಾ ಮತ್ತು ಮಾರ್ಗದರ್ಶನ:' : 'Judges Remarks:'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEFAULT_JUDGES.map(j => {
                  const rem = inspectedParticipant.judgeScores?.[j.id]?.remarks;
                  return (
                    <div key={j.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                      <span className="font-bold text-stone-800 block font-serif-kannada">
                        {j.name}:
                      </span>
                      <p className="text-stone-600 italic mt-1">
                        {rem ? `"${rem}"` : (lang === 'kn' ? 'ಯಾವುದೇ ಷರಾ ನೀಡಿಲ್ಲ' : 'No remarks recorded')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setInspectedParticipant(null)}
                className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold transition"
              >
                {lang === 'kn' ? 'ಮುಚ್ಚಿ (Close)' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
