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
  X,
  Copy,
  Check,
  Wifi,
  Share2,
  RotateCcw
} from 'lucide-react';
import { Participant, Topic, Language, TimerConfig, Category, DifficultyLevel, CertificateSignatory } from '../types';
import { ParticipantManager } from './ParticipantManager';
import { TopicManager } from './TopicManager';
import { CertificatePortal } from './CertificatePortal';
import { CertificateModal } from './CertificateModal';
import { generateFinalResultsPDF } from '../utils/pdfExport';
import { DEFAULT_JUDGES } from '../utils/onlineSync';
import { DEFAULT_SIGNATORIES } from '../data/defaultSignatories';

interface AdminPortalProps {
  lang: Language;
  schoolName: string;
  onUpdateSchoolName: (name: string) => void;
  participants: Participant[];
  topics: Topic[];
  timerConfig: TimerConfig;
  onUpdateTimerConfig: (config: TimerConfig) => void;
  onAddParticipant: (name: string, chestNo: number, schoolOrClass: string) => void;
  onBulkAddParticipants?: (list: Participant[], replace?: boolean) => void;
  onUpdateParticipantName?: (id: string, name: string, chestNo?: number) => void;
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
  signatories?: CertificateSignatory[];
  onUpdateSignatories?: (sigs: CertificateSignatory[]) => void;
  isSignaturesLocked?: boolean;
  onToggleLockSignatures?: () => void;
  isOnline?: boolean;
  isSyncing?: boolean;
  activeJudges?: Record<string, { lastPing: number; name: string; role: string }>;
  onTriggerSync?: () => Promise<void>;
  isCompetitionClosed?: boolean;
  onCloseCurrentCompetition?: () => void;
  onStartNewCompetition?: (mode: 'sample50' | 'blank' | 'resetScoresOnly') => void;
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
  onBulkAddParticipants,
  onUpdateParticipantName,
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
  onResetAllScores,
  signatories = DEFAULT_SIGNATORIES,
  onUpdateSignatories,
  isSignaturesLocked = true,
  onToggleLockSignatures,
  isOnline = true,
  isSyncing = false,
  activeJudges = {},
  onTriggerSync,
  isCompetitionClosed = false,
  onCloseCurrentCompetition,
  onStartNewCompetition
}) => {
  // Admin Login state - Password: chandrusk@123 as requested by user
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('admin_authenticated_v3') === 'true';
  });
  const [adminPin, setAdminPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Active Admin Sub-tab
  const [adminSubTab, setAdminSubTab] = useState<'results' | 'sync' | 'certificates' | 'participants' | 'topics' | 'settings'>('results');
  const [inspectedParticipant, setInspectedParticipant] = useState<Participant | null>(null);
  const [certModalParticipant, setCertModalParticipant] = useState<Participant | null>(null);

  // Score sheet table view mode: '4judges' is primary default as requested by user
  const [tableViewMode, setTableViewMode] = useState<'4judges' | '5criteria'>('4judges');
  const [isNewCompetitionModalOpen, setIsNewCompetitionModalOpen] = useState(false);
  const [isCloseCompetitionModalOpen, setIsCloseCompetitionModalOpen] = useState(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Search in results
  const [searchTerm, setSearchTerm] = useState('');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfExportSuccess, setPdfExportSuccess] = useState(false);

  // Handle PIN Login: Chief Judge password chandrusk@123 as requested by user
  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (adminPin.trim() === 'chandrusk@123') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('admin_authenticated_v3', 'true');
      setPinError(null);
    } else {
      setPinError(
        lang === 'kn'
          ? '❌ ತಪ್ಪಾದ ಪಾಸ್‌ವರ್ಡ್! ಸರಿಯಾದ ಮುಖ್ಯ ತೀರ್ಪುಗಾರರ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.'
          : '❌ Incorrect password! Please enter correct Chief Judge password.'
      );
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('admin_authenticated_v3');
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

  // If not authenticated, show Admin / Chief Judge Login Box
  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border-2 border-amber-300 shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center mx-auto mb-4 border border-amber-300 shadow-md">
          <ShieldCheck className="w-8 h-8 text-amber-100" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-amber-950 font-serif-kannada">
          {lang === 'kn' ? 'ಮುಖ್ಯ ತೀರ್ಪುಗಾರರು & ಅಡ್ಮಿನ್ ಲಾಗಿನ್' : 'Chief Judge & Admin Login'}
        </h2>
        <p className="text-xs text-stone-600 mt-1 mb-6">
          {lang === 'kn'
            ? 'ತೀರ್ಪುಗಾರರ ಲೈವ್ ಸಿಂಕ್ ಫಲಿತಾಂಶ ಹಾಗೂ ಅಂತಿಮ ಶ್ರೇಯಾಂಕ ಪಟ್ಟಿಗಾಗಿ ಮುಖ್ಯ ತೀರ್ಪುಗಾರರ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.'
            : 'Enter Chief Judge authorized password to access live sync scoreboard, consolidated rankings, and management.'}
        </p>

        <form onSubmit={handlePinSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 font-serif-kannada">
              {lang === 'kn' ? 'ಮುಖ್ಯ ತೀರ್ಪುಗಾರರ ಪಾಸ್‌ವರ್ಡ್:' : 'Chief Judge Password:'}
            </label>
            <input
              type="password"
              placeholder={lang === 'kn' ? 'ಮುಖ್ಯ ತೀರ್ಪುಗಾರರ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ...' : 'Enter Chief Judge password...'}
              value={adminPin}
              onChange={(e) => {
                setAdminPin(e.target.value);
                setPinError(null);
              }}
              className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center font-mono font-bold text-base bg-white"
              autoFocus
            />
            {pinError && (
              <p className="text-xs text-rose-600 font-bold mt-1.5 text-left">{pinError}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-bold text-sm shadow-md transition font-serif-kannada flex items-center justify-center gap-2 active:scale-95"
            >
              <Unlock className="w-4 h-4" />
              <span>{lang === 'kn' ? 'ಮುಖ್ಯ ತೀರ್ಪುಗಾರರಾಗಿ ಪ್ರವೇಶಿಸಿ' : 'Login as Chief Judge / Admin'}</span>
            </button>
          </div>
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
            onClick={() => setAdminSubTab('certificates')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              adminSubTab === 'certificates'
                ? 'bg-amber-700 text-white shadow-xs font-serif-kannada'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{lang === 'kn' ? 'ಇ-ಪ್ರಮಾಣಪತ್ರಗಳು' : 'E-Certificates'}</span>
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

          {/* Prominent Competition Control Bar (Requested: "spardhe close madi hosadagi start madalu menu nidu") */}
          <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm shrink-0 ${
                isCompetitionClosed 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {isCompetitionClosed ? '🔒' : '🎙️'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isCompetitionClosed 
                      ? 'bg-rose-900/70 text-rose-200 border border-rose-700' 
                      : 'bg-emerald-900/70 text-emerald-200 border border-emerald-700'
                  }`}>
                    {isCompetitionClosed 
                      ? (lang === 'kn' ? 'ಸ್ಪರ್ಧೆ ಮುಕ್ತಾಯಗೊಂಡಿದೆ (Closed)' : 'Competition Concluded') 
                      : (lang === 'kn' ? 'ಲೈವ್ ಸ್ಪರ್ಧೆ ಚಾಲ್ತಿಯಲ್ಲಿದೆ (Live)' : 'Live Competition Ongoing')}
                  </span>
                  <span className="text-xs text-amber-200/80 font-medium">
                    {participants.length} {lang === 'kn' ? 'ಸ್ಪರ್ಧಿಗಳು' : 'Participants'} • {scoredParticipants.length} {lang === 'kn' ? 'ಮೌಲ್ಯಮಾಪನಗೊಂಡಿದ್ದಾರೆ' : 'Evaluated'}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-amber-100 font-serif-kannada mt-1">
                  {lang === 'kn' 
                    ? 'ಸ್ಪರ್ಧಾ ನಿಯಂತ್ರಣ: ಈಗಿನ ಸ್ಪರ್ಧೆ ಮುಕ್ತಾಯ & ಹೊಸ ಸ್ಪರ್ಧೆ ಆರಂಭ' 
                    : 'Competition Control: End Round & Start Fresh'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {!isCompetitionClosed ? (
                <button
                  id="close-competition-btn"
                  onClick={() => setIsCloseCompetitionModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-rose-700 hover:bg-rose-800 text-white shadow-xs transition flex items-center gap-2 font-serif-kannada border border-rose-600"
                  title="ಸ್ಪರ್ಧೆಯನ್ನು ಅಧಿಕೃತವಾಗಿ ಮುಕ್ತಾಯಗೊಳಿಸಿ ಅಂತಿಮ ಫಲಿತಾಂಶ ಪ್ರಕಟಿಸಿ"
                >
                  <Lock className="w-4 h-4 text-rose-200" />
                  <span>{lang === 'kn' ? 'ಈಗಿನ ಸ್ಪರ್ಧೆ ಮುಕ್ತಾಯಗೊಳಿಸಿ' : 'Close Current Competition'}</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-900/40 border border-rose-700/60 text-rose-200 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>{lang === 'kn' ? 'ಫಲಿತಾಂಶ ಅಂತಿಮಗೊಂಡಿದೆ' : 'Results Finalized'}</span>
                </div>
              )}

              <button
                id="start-new-competition-btn"
                onClick={() => setIsNewCompetitionModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-md transition flex items-center gap-2 font-serif-kannada border border-amber-300 active:scale-95"
                title="ಹಳೆಯ ಅಂಕಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ ಹೊಸ ಸ್ಪರ್ಧೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ"
              >
                <RefreshCw className="w-4 h-4 text-amber-950" />
                <span>{lang === 'kn' ? '✨ ಹೊಸ ಸ್ಪರ್ಧೆ ಪ್ರಾರಂಭಿಸಿ' : '✨ Start New Competition'}</span>
              </button>
            </div>
          </div>

          {/* Action notification toast */}
          {actionSuccessNotice && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccessNotice}</span>
              </div>
              <button onClick={() => setActionSuccessNotice(null)} className="text-stone-500 hover:text-stone-800 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

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

            {/* Action Buttons: View Switcher, Search, Print and Export */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 print:hidden">
              
              {/* Left: View Switcher: 4 Judges Score Sheet vs 5 Criteria */}
              <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl border border-stone-200 self-start">
                <button
                  id="view-mode-4judges-btn"
                  onClick={() => setTableViewMode('4judges')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 font-serif-kannada ${
                    tableViewMode === '4judges'
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{lang === 'kn' ? '೪ ತೀರ್ಪುಗಾರರ ಅಂಕಪಟ್ಟಿ' : '4 Judges Score Sheet'}</span>
                </button>
                <button
                  id="view-mode-5criteria-btn"
                  onClick={() => setTableViewMode('5criteria')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 font-serif-kannada ${
                    tableViewMode === '5criteria'
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{lang === 'kn' ? '೫ ಮಾನದಂಡಗಳ ವಿವರ' : '5 Criteria Breakdown'}</span>
                </button>
              </div>

              {/* Right: Search + Export Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={lang === 'kn' ? 'ಹೆಸರು ಅಥವಾ ಚೆಸ್ಟ್ ನಂ...' : 'Search participant...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                  />
                </div>

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
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-800 active:scale-95 text-white shadow-xs transition flex items-center gap-1.5 font-serif-kannada border border-rose-800 disabled:opacity-50"
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
                      <span>{lang === 'kn' ? 'ಅಂತಿಮ ಫಲಿತಾಂಶ PDF' : 'Download PDF'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-stone-600" />
                  <span>{lang === 'kn' ? 'CSV' : 'CSV'}</span>
                </button>

                <button
                  id="print-final-results-btn"
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-xs transition flex items-center gap-1.5 font-serif-kannada"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{lang === 'kn' ? 'ಮುದ್ರಿಸಿ (Print)' : 'Print'}</span>
                </button>

                <button
                  id="admin-reset-round-btn"
                  onClick={onResetAllScores}
                  title={lang === 'kn' ? 'ಸ್ಪರ್ಧಾ ಅಂಕಗಳು & ಚೀಟಿಗಳ ಮರುಹೊಂದಿಕೆ (ಸ್ಪರ್ಧಿಗಳ ಹೆಸರುಗಳು ಸುರಕ್ಷಿತ)' : 'Reset Round Scores & Chits (Preserves Names)'}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-100/90 hover:bg-amber-200 text-amber-950 border-2 border-amber-300 shadow-2xs transition flex items-center gap-1.5 font-serif-kannada"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-800" />
                  <span>{lang === 'kn' ? 'ಸುತ್ತು ಮರುಹೊಂದಿಸಿ' : 'Reset Round'}</span>
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
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                          <div>
                            <span className="text-lg font-mono font-bold text-stone-800">
                              {secondPlace.scores?.total}
                            </span>
                            <span className="text-xs text-stone-400"> / 50</span>
                          </div>
                          <button
                            onClick={() => setCertModalParticipant(secondPlace)}
                            className="px-2 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs print:hidden"
                          >
                            <Award className="w-3 h-3 text-slate-300" />
                            <span>{lang === 'kn' ? 'ಸಿಲ್ವರ್' : 'Silver'}</span>
                          </button>
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
                      <div className="bg-white rounded-3xl p-5 border-2 border-amber-400 shadow-md w-full text-center flex flex-col justify-between h-48 relative">
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
                        <div className="pt-2 border-t border-amber-100 flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-mono font-extrabold text-amber-800">
                              {firstPlace.scores?.total}
                            </span>
                            <span className="text-xs text-stone-500"> / 50</span>
                          </div>
                          <button
                            onClick={() => setCertModalParticipant(firstPlace)}
                            className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs print:hidden"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-200" />
                            <span>{lang === 'kn' ? 'ಗೋಲ್ಡ್ ಪ್ರಮಾಣಪತ್ರ' : 'Gold Cert'}</span>
                          </button>
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
                      <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs w-full text-center flex flex-col justify-between h-36">
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
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                          <div>
                            <span className="text-lg font-mono font-bold text-stone-800">
                              {thirdPlace.scores?.total}
                            </span>
                            <span className="text-xs text-stone-400"> / 50</span>
                          </div>
                          <button
                            onClick={() => setCertModalParticipant(thirdPlace)}
                            className="px-2 py-1 bg-orange-700 hover:bg-orange-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs print:hidden"
                          >
                            <Award className="w-3 h-3 text-orange-200" />
                            <span>{lang === 'kn' ? 'ಬ್ರಾಂಜ್' : 'Bronze'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Comprehensive Consolidated Results Table (Requested: "4 judges nidida score sheet and total biluvante irali") */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden print:border-stone-400">
              <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-800 font-serif-kannada">
                    {tableViewMode === '4judges'
                      ? (lang === 'kn' ? '೪ ತೀರ್ಪುಗಾರರ ಅಂಕಪಟ್ಟಿ & ಒಟ್ಟು ಸರಾಸರಿ' : '4 Judges Consolidated Score Sheet & Total')
                      : (lang === 'kn' ? 'ಎಲ್ಲಾ ಸ್ಪರ್ಧಿಗಳ ಅಂತಿಮ ಅಂಕಪಟ್ಟಿ ವಿವರ (೫ ಮಾನದಂಡಗಳು)' : '5 Criteria Detailed Breakdown')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                    {tableViewMode === '4judges' ? '೪ ತೀರ್ಪುಗಾರರ ನೋಟ' : '೫ ಮಾನದಂಡ ನೋಟ'}
                  </span>
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  {lang === 'kn' ? `ಮೌಲ್ಯಮಾಪನಗೊಂಡ ಒಟ್ಟು ಸ್ಪರ್ಧಿಗಳು: ${scoredParticipants.length}` : `Total Scored: ${scoredParticipants.length}`}
                </span>
              </div>

              {filteredResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    {/* View 1: 4 Judges Score Sheet Table Header (Default) */}
                    {tableViewMode === '4judges' ? (
                      <thead className="bg-amber-50/70 border-b border-stone-200 text-stone-700 uppercase text-[11px] font-bold tracking-wider">
                        <tr>
                          <th className="py-3 px-3">{lang === 'kn' ? 'ಶ್ರೇಯಾಂಕ' : 'Rank'}</th>
                          <th className="py-3 px-3">{lang === 'kn' ? 'ಚೆಸ್ಟ್ ನಂ' : 'Chest #'}</th>
                          <th className="py-3 px-3">{lang === 'kn' ? 'ಶಿಕ್ಷಕರ ಹೆಸರು' : 'Teacher Name'}</th>
                          <th className="py-3 px-3">{lang === 'kn' ? 'ಸಂಸ್ಥೆ / ಸ್ಥಳ' : 'School / Location'}</th>
                          <th className="py-3 px-3 text-center bg-amber-100/50 text-amber-950 font-bold">{lang === 'kn' ? 'ತೀರ್ಪು ೧ (೫೦)' : 'Judge 1 (50)'}</th>
                          <th className="py-3 px-3 text-center bg-amber-100/50 text-amber-950 font-bold">{lang === 'kn' ? 'ತೀರ್ಪು ೨ (೫೦)' : 'Judge 2 (50)'}</th>
                          <th className="py-3 px-3 text-center bg-amber-100/50 text-amber-950 font-bold">{lang === 'kn' ? 'ತೀರ್ಪು ೩ (೫೦)' : 'Judge 3 (50)'}</th>
                          <th className="py-3 px-3 text-center bg-amber-100/50 text-amber-950 font-bold">{lang === 'kn' ? 'ತೀರ್ಪು ೪ (೫೦)' : 'Judge 4 (50)'}</th>
                          <th className="py-3 px-3 text-center font-black text-amber-950 bg-amber-200/80">{lang === 'kn' ? 'ಅಂತಿಮ ಒಟ್ಟು (೫೦)' : 'Total (/50)'}</th>
                          <th className="py-3 px-3 text-center print:hidden">{lang === 'kn' ? 'ಮಾನದಂಡ ವಿವರ' : 'Breakdown'}</th>
                          <th className="py-3 px-3 text-center print:hidden">{lang === 'kn' ? 'ಇ-ಪ್ರಮಾಣಪತ್ರ' : 'Certificate'}</th>
                        </tr>
                      </thead>
                    ) : (
                      /* View 2: 5 Criteria Breakdown Table Header */
                      <thead className="bg-amber-50/60 border-b border-stone-200 text-stone-700 uppercase text-[11px] font-bold tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">{lang === 'kn' ? 'ಶ್ರೇಯಾಂಕ' : 'Rank'}</th>
                          <th className="py-2.5 px-3">{lang === 'kn' ? 'ಚೆಸ್ಟ್ ನಂ' : 'Chest #'}</th>
                          <th className="py-2.5 px-3">{lang === 'kn' ? 'ಶಿಕ್ಷಕರ ಹೆಸರು' : 'Name'}</th>
                          <th className="py-2.5 px-3">{lang === 'kn' ? 'ಸಂಸ್ಥೆ / ಸ್ಥಳ' : 'School'}</th>
                          <th className="py-2.5 px-3 text-center">{lang === 'kn' ? 'ವಿಷಯ (10)' : 'Content (10)'}</th>
                          <th className="py-2.5 px-3 text-center">{lang === 'kn' ? 'ಭಾಷೆ (10)' : 'Language (10)'}</th>
                          <th className="py-2.5 px-3 text-center">{lang === 'kn' ? 'ಹಾವಭಾವ (10)' : 'Presence (10)'}</th>
                          <th className="py-2.5 px-3 text-center">{lang === 'kn' ? 'ಸಮಯ (10)' : 'Time (10)'}</th>
                          <th className="py-2.5 px-3 text-center">{lang === 'kn' ? 'ಪ್ರಭಾವ (10)' : 'Impact (10)'}</th>
                          <th className="py-2.5 px-3 text-center font-bold text-amber-950">{lang === 'kn' ? 'ಒಟ್ಟು (50)' : 'Total (/50)'}</th>
                          <th className="py-2.5 px-3">{lang === 'kn' ? 'ಷರಾ' : 'Remarks'}</th>
                          <th className="py-2.5 px-3 text-center print:hidden">{lang === 'kn' ? 'ಇ-ಪ್ರಮಾಣಪತ್ರ' : 'E-Certificate'}</th>
                        </tr>
                      </thead>
                    )}

                    <tbody className="divide-y divide-stone-100">
                      {filteredResults.map((p, index) => {
                        const rank = index + 1;
                        const s = p.scores!;
                        const j1 = p.judgeScores?.['judge-1']?.total;
                        const j2 = p.judgeScores?.['judge-2']?.total;
                        const j3 = p.judgeScores?.['judge-3']?.total;
                        const j4 = p.judgeScores?.['judge-4']?.total;

                        if (tableViewMode === '4judges') {
                          return (
                            <tr key={p.id} className={rank <= 3 ? 'bg-amber-50/40 font-medium' : 'hover:bg-stone-50'}>
                              <td className="py-3 px-3 font-bold text-stone-900 font-mono">
                                {rank === 1 ? '🥇 1' : rank === 2 ? '🥈 2' : rank === 3 ? '🥉 3' : `#${rank}`}
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-amber-900">
                                #{p.chestNo}
                              </td>
                              <td className="py-3 px-3 font-bold text-stone-900 font-serif-kannada">
                                {p.name}
                              </td>
                              <td className="py-3 px-3 text-stone-600">
                                {p.schoolOrClass}
                              </td>
                              <td className="py-3 px-3 text-center bg-amber-50/20">
                                {j1 !== undefined ? (
                                  <button
                                    onClick={() => setInspectedParticipant(p)}
                                    title={lang === 'kn' ? 'ತೀರ್ಪುಗಾರರು ೧ ವಿವರ ನೋಡಿ' : 'View Judge 1 details'}
                                    className="font-mono font-bold text-stone-900 bg-white border border-stone-200 px-2 py-0.5 rounded-md hover:border-amber-400 transition"
                                  >
                                    {j1}
                                  </button>
                                ) : (
                                  <span className="text-stone-400 text-xs italic font-medium">-</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center bg-amber-50/20">
                                {j2 !== undefined ? (
                                  <button
                                    onClick={() => setInspectedParticipant(p)}
                                    title={lang === 'kn' ? 'ತೀರ್ಪುಗಾರರು ೨ ವಿವರ ನೋಡಿ' : 'View Judge 2 details'}
                                    className="font-mono font-bold text-stone-900 bg-white border border-stone-200 px-2 py-0.5 rounded-md hover:border-amber-400 transition"
                                  >
                                    {j2}
                                  </button>
                                ) : (
                                  <span className="text-stone-400 text-xs italic font-medium">-</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center bg-amber-50/20">
                                {j3 !== undefined ? (
                                  <button
                                    onClick={() => setInspectedParticipant(p)}
                                    title={lang === 'kn' ? 'ತೀರ್ಪುಗಾರರು ೩ ವಿವರ ನೋಡಿ' : 'View Judge 3 details'}
                                    className="font-mono font-bold text-stone-900 bg-white border border-stone-200 px-2 py-0.5 rounded-md hover:border-amber-400 transition"
                                  >
                                    {j3}
                                  </button>
                                ) : (
                                  <span className="text-stone-400 text-xs italic font-medium">-</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center bg-amber-50/20">
                                {j4 !== undefined ? (
                                  <button
                                    onClick={() => setInspectedParticipant(p)}
                                    title={lang === 'kn' ? 'ತೀರ್ಪುಗಾರರು ೪ ವಿವರ ನೋಡಿ' : 'View Judge 4 details'}
                                    className="font-mono font-bold text-stone-900 bg-white border border-stone-200 px-2 py-0.5 rounded-md hover:border-amber-400 transition"
                                  >
                                    {j4}
                                  </button>
                                ) : (
                                  <span className="text-stone-400 text-xs italic font-medium">-</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center font-mono font-black text-base text-amber-950 bg-amber-100/60">
                                <span className="inline-block px-2.5 py-0.5 bg-amber-200/90 rounded-md border border-amber-300">
                                  {s.total}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center print:hidden">
                                <button
                                  onClick={() => setInspectedParticipant(p)}
                                  title={lang === 'kn' ? '೪ ತೀರ್ಪುಗಾರರ ೫ ಮಾನದಂಡಗಳ ವಿಸ್ತೃತ ತುಲನೆ' : 'Inspect 4 Judges Breakdown'}
                                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-950 border border-stone-200 hover:border-amber-300 text-xs font-bold flex items-center gap-1 mx-auto transition"
                                >
                                  <Eye className="w-3.5 h-3.5 text-amber-700" />
                                  <span>{lang === 'kn' ? 'ವಿವರ' : 'Details'}</span>
                                </button>
                              </td>
                              <td className="py-3 px-3 text-center print:hidden">
                                <button
                                  onClick={() => setCertModalParticipant(p)}
                                  title={lang === 'kn' ? 'ಪ್ರಮಾಣಪತ್ರ ವೀಕ್ಷಿಸಿ / ಡೌನ್‌ಲೋಡ್' : 'View / Download Certificate'}
                                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1 mx-auto transition"
                                >
                                  <Award className="w-3.5 h-3.5 text-amber-700" />
                                  <span className="hidden sm:inline">{lang === 'kn' ? 'ಪ್ರಮಾಣಪತ್ರ' : 'Certificate'}</span>
                                </button>
                              </td>
                            </tr>
                          );
                        }

                        // View 2: 5 Criteria Breakdown Table Row
                        return (
                          <tr key={p.id} className={rank <= 3 ? 'bg-amber-50/40 font-medium' : 'hover:bg-stone-50'}>
                            <td className="py-2.5 px-3 font-bold text-stone-900 font-mono">
                              {rank === 1 ? '🥇 1' : rank === 2 ? '🥈 2' : rank === 3 ? '🥉 3' : `#${rank}`}
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
                            <td className="py-2.5 px-3 text-center print:hidden">
                              <button
                                onClick={() => setCertModalParticipant(p)}
                                title={lang === 'kn' ? 'ಪ್ರಮಾಣಪತ್ರ ವೀಕ್ಷಿಸಿ / ಡೌನ್‌ಲೋಡ್' : 'View / Download Certificate'}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1 mx-auto transition"
                              >
                                <Award className="w-3.5 h-3.5 text-amber-700" />
                                <span className="hidden sm:inline">{lang === 'kn' ? 'ಪ್ರಮಾಣಪತ್ರ' : 'Certificate'}</span>
                              </button>
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

            {/* Official Certification / Signature Block for Print with all 4 judges & Chief Judge */}
            <div className="mt-12 pt-8 border-t-2 border-stone-300 hidden print:grid grid-cols-6 text-center gap-2 text-xs font-serif-kannada">
              <div>
                <p className="font-bold text-stone-800 mb-10">ಮುಖ್ಯ ತೀರ್ಪುಗಾರರು</p>
                <div className="border-t border-stone-400 w-24 mx-auto pt-1 font-mono">1. ಮುಖ್ಯ ತೀರ್ಪು</div>
              </div>
              <div>
                <p className="font-bold text-stone-800 mb-10">ತೀರ್ಪುಗಾರರು 1</p>
                <div className="border-t border-stone-400 w-24 mx-auto pt-1 font-mono">2. ತೀರ್ಪುಗಾರರು - 1</div>
              </div>
              <div>
                <p className="font-bold text-stone-800 mb-10">ತೀರ್ಪುಗಾರರು 2</p>
                <div className="border-t border-stone-400 w-24 mx-auto pt-1 font-mono">3. ತೀರ್ಪುಗಾರರು - 2</div>
              </div>
              <div>
                <p className="font-bold text-stone-800 mb-10">ತೀರ್ಪುಗಾರರು 3</p>
                <div className="border-t border-stone-400 w-24 mx-auto pt-1 font-mono">4. ತೀರ್ಪುಗಾರರು - 3</div>
              </div>
              <div>
                <p className="font-bold text-stone-800 mb-10">ತೀರ್ಪುಗಾರರು 4</p>
                <div className="border-t border-stone-400 w-24 mx-auto pt-1 font-mono">5. ತೀರ್ಪುಗಾರರು - 4</div>
              </div>
              <div>
                <p className="font-bold text-stone-800 mb-10">ಅಧ್ಯಕ್ಷರು / ಸಂಚಾಲಕರು</p>
                <div className="border-t border-stone-400 w-28 mx-auto pt-1 font-mono">6. ಶಿಕ್ಷಕರ ಪರಿಷತ್</div>
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
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{lang === 'kn' ? '4 ತೀರ್ಪುಗಾರರ ಮೊಬೈಲ್ ಲೈವ್ ಸಿಂಕ್ ಕನ್ಸೋಲ್' : '4 Judges Mobile Live Sync Console'}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>{lang === 'kn' ? 'ಆನ್‌ಲೈನ್ ಸಿಂಕ್ ಸಕ್ರಿಯ' : 'Live Sync Active'}</span>
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-amber-950 font-serif-kannada">
                  {lang === 'kn' ? 'ತೀರ್ಪುಗಾರರ ಮೊಬೈಲ್ ಮೌಲ್ಯಮಾಪನ & ರಿಯಲ್-ಟೈಮ್ ಸಿಂಕ್' : 'Judges Real-Time Mobile Evaluation & Sync'}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  {lang === 'kn'
                    ? 'ತೀರ್ಪುಗಾರರು ತಮ್ಮ ಮೊಬೈಲ್‌ನಿಂದ ಸಲ್ಲಿಸಿದ ಅಂಕಗಳು ಇಲ್ಲಿ ರಿಯಲ್-ಟೈಮ್‌ನಲ್ಲಿ ಸಿಂಕ್ ಆಗಿ ಸರಾಸರಿ (Consensus) ಲೆಕ್ಕಾಚಾರವಾಗುತ್ತವೆ.'
                    : 'Scores submitted by judges from their individual mobiles automatically sync here in real-time.'}
                </p>
              </div>

              {/* Action Buttons: Sync Now & Copy Mobile Link */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                {onTriggerSync && (
                  <button
                    onClick={() => onTriggerSync()}
                    disabled={isSyncing}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition flex items-center gap-1.5 shadow-2xs"
                    title="ಸರ್ವರ್‌ನೊಂದಿಗೆ ತಕ್ಷಣ ಸಿಂಕ್ ಮಾಡಿ"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? (lang === 'kn' ? 'ಸಿಂಕ್ ಆಗುತ್ತಿದೆ...' : 'Syncing...') : (lang === 'kn' ? 'ಈಗಲೇ ಸಿಂಕ್ ಮಾಡಿ' : 'Sync Now')}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const url = typeof window !== 'undefined' 
                      ? `${window.location.origin}${window.location.pathname}?tab=judges`
                      : '';
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(url);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 3000);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition flex items-center gap-1.5 shadow-2xs"
                  title="ತೀರ್ಪುಗಾರರಿಗೆ ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಕಳುಹಿಸಲು ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">{lang === 'kn' ? 'ಲಿಂಕ್ ಕಾಪಿ ಆಗಿದೆ!' : 'Link Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-stone-600" />
                      <span>{lang === 'kn' ? 'ತೀರ್ಪುಗಾರರ ಮೊಬೈಲ್ ಲಿಂಕ್ ಕಾಪಿ' : 'Copy Judge Mobile Link'}</span>
                    </>
                  )}
                </button>

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
              {DEFAULT_JUDGES.map((judge) => {
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

                const lastPing = activeJudges[judge.id]?.lastPing || 0;
                const isOnlineNow = Date.now() - lastPing < 90000;

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
                      {isOnlineNow ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span>Online</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-600 font-mono">
                          Offline
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 font-serif-kannada">
                      {judge.name}
                    </h4>
                    <span className="text-[11px] text-stone-500 font-mono mt-0.5 inline-block">
                      ID: {judge.id}
                    </span>

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
                  {lang === 'kn' ? 'ಸ್ಪರ್ಧಿವಾರು 4 ತೀರ್ಪುಗಾರರ ತುಲನಾತ್ಮಕ ಅಂಕಪಟ್ಟಿ' : 'Participant-wise 4 Judges Comparative Scoreboard'}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === 'kn'
                    ? 'ಯಾವುದೇ ಸ್ಪರ್ಧಿಯ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ 4 ತೀರ್ಪುಗಾರರ ಮಾನದಂಡವಾರು ಅಂಕಗಳನ್ನು ಪರಿಶೀಲಿಸಿ'
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
                      <th className="py-3 px-3 text-center">{lang === 'kn' ? 'ತೀರ್ಪುಗಾರರು 1' : 'Judge 1'}</th>
                      <th className="py-3 px-3 text-center">{lang === 'kn' ? 'ತೀರ್ಪುಗಾರರು 2' : 'Judge 2'}</th>
                      <th className="py-3 px-3 text-center">{lang === 'kn' ? 'ತೀರ್ಪುಗಾರರು 3' : 'Judge 3'}</th>
                      <th className="py-3 px-3 text-center">{lang === 'kn' ? 'ತೀರ್ಪುಗಾರರು 4' : 'Judge 4'}</th>
                      <th className="py-3 px-3 text-center font-bold text-amber-950">
                        {lang === 'kn' ? 'ಮುಖ್ಯ ತೀರ್ಪು / ಸರಾಸರಿ' : 'Consensus Avg'}
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
                        const jChief = p.judgeScores?.['judge-chief'];

                        const judgeCount = [j1, j2, j3, j4].filter(Boolean).length;
                        const isFullySynced = judgeCount >= 4;

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
                            <td className="py-3 px-3 text-center font-mono font-black text-amber-900 text-sm">
                              {p.scores?.total !== undefined ? `${p.scores.total} / 50` : (jChief ? `${jChief.total} / 50` : '-')}
                            </td>

                            {/* Sync Status Badge */}
                            <td className="py-3 px-3 text-center">
                              {isFullySynced ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>{judgeCount}/4 Done</span>
                                </span>
                              ) : judgeCount > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 font-mono">
                                  <Clock className="w-3 h-3 text-amber-700" />
                                  <span>{judgeCount}/4 In Progress</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-500 font-mono">
                                  <span>0/4 Waiting</span>
                                </span>
                              )}
                            </td>

                            {/* Details Button */}
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => setInspectedParticipant(p)}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200 transition"
                              >
                                {lang === 'kn' ? 'ವೀಕ್ಷಿಸಿ' : 'View'}
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

      {/* Sub-tab: E-Certificates */}
      {adminSubTab === 'certificates' && (
        <CertificatePortal
          lang={lang}
          schoolName={schoolName}
          participants={participants}
          signatories={signatories}
          onUpdateSignatories={onUpdateSignatories}
          onDeleteParticipant={onDeleteParticipant}
          isSignaturesLocked={isSignaturesLocked}
          onToggleLockSignatures={onToggleLockSignatures}
        />
      )}

      {/* Sub-tab 3: Participant Management */}
      {adminSubTab === 'participants' && (
        <ParticipantManager
          lang={lang}
          participants={participants}
          onAddParticipant={onAddParticipant}
          onBulkAddParticipants={onBulkAddParticipants}
          onUpdateParticipantName={onUpdateParticipantName}
          onDeleteParticipant={onDeleteParticipant}
          onSelectForSpeech={onSelectForSpeech}
          onOpenScoreForParticipant={onOpenScoreForParticipant}
          onLoadSampleParticipants={onLoadSampleParticipants}
          onClearAllParticipants={onClearAllParticipants}
          onForceSync={onTriggerSync}
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

      {/* Certificate Preview & Download Modal */}
      <CertificateModal
        isOpen={Boolean(certModalParticipant)}
        onClose={() => setCertModalParticipant(null)}
        lang={lang}
        participant={certModalParticipant}
        allParticipants={participants}
        schoolName={schoolName}
        signatories={signatories}
        onUpdateSignatories={onUpdateSignatories}
      />

      {/* Modal: Start New Competition (Requested: "spardhe close madi hosadagi start madalu menu nidu") */}
      {isNewCompetitionModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border-2 border-amber-300 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 border border-amber-400 flex items-center justify-center font-bold text-lg">
                  ✨
                </div>
                <div>
                  <h3 className="text-lg font-black text-amber-950 font-serif-kannada">
                    {lang === 'kn' ? 'ಹೊಸ ಆಶುಭಾಷಣ ಸ್ಪರ್ಧೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ' : 'Start New Competition Round'}
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {lang === 'kn' ? 'ಹೊಸ ರೌಂಡ್‌ಗಾಗಿ ಕೆಳಗಿನ ಯಾವುದಾದರೂ ಒಂದು ವಿಧಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ:' : 'Choose how you want to initialize the new round:'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewCompetitionModalOpen(false)}
                className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {/* Option 1: 50 Registered Teachers (Recommended) */}
              <button
                onClick={() => {
                  onStartNewCompetition?.('sample50');
                  setIsNewCompetitionModalOpen(false);
                  setActionSuccessNotice(lang === 'kn' ? '೫೦ ನೋಂದಾಯಿತ ಶಿಕ್ಷಕರೊಂದಿಗೆ ಹೊಸ ಸ್ಪರ್ಧೆ ಆರಂಭವಾಗಿದೆ!' : 'Started fresh round with 50 registered teachers!');
                }}
                className="w-full text-left p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/70 hover:bg-amber-100/80 transition flex items-start gap-3.5 group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  50
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-amber-950 font-serif-kannada group-hover:text-amber-900">
                      {lang === 'kn' ? '೧. ೫೦ ನೋಂದಾಯಿತ ಶಿಕ್ಷಕರೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸಿ (ಶಿಫಾರಸು)' : '1. Load 50 Registered Teachers (Recommended)'}
                    </h4>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      {lang === 'kn' ? 'ಜನಪ್ರಿಯ' : 'Default'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {lang === 'kn'
                      ? 'ಎಲ್ಲಾ ಹಳೆಯ ಅಂಕಗಳನ್ನು ರದ್ದುಗೊಳಿಸುತ್ತದೆ, ೫೦ ಚೀಟಿಗಳನ್ನು ಮುಕ್ತಗೊಳಿಸುತ್ತದೆ ಮತ್ತು ೫೦ ಅಧಿಕೃತ ಶಿಕ್ಷಕರ ಪಟ್ಟಿಯೊಂದಿಗೆ ಅದೃಷ್ಟ ಚಕ್ರಕ್ಕೆ ಸಿದ್ಧಪಡಿಸುತ್ತದೆ.'
                      : 'Resets all scores to zero, frees all 50 chits, and readies the spin wheel with 50 registered teachers.'}
                  </p>
                </div>
              </button>

              {/* Option 2: Blank List for Fresh Live Registration */}
              <button
                onClick={() => {
                  onStartNewCompetition?.('blank');
                  setIsNewCompetitionModalOpen(false);
                  setActionSuccessNotice(lang === 'kn' ? 'ಖಾಲಿ ಪಟ್ಟಿಯೊಂದಿಗೆ ಹೊಸ ಸ್ಪರ್ಧೆ ಆರಂಭವಾಗಿದೆ. ಹೊಸ ಸ್ಪರ್ಧಿಗಳನ್ನು ನೋಂದಾಯಿಸಿ.' : 'Started blank competition round. Register new participants now.');
                }}
                className="w-full text-left p-4 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100 transition flex items-start gap-3.5 group"
              >
                <div className="w-9 h-9 rounded-xl bg-stone-700 text-white font-bold flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-stone-900 font-serif-kannada group-hover:text-stone-950">
                    {lang === 'kn' ? '೨. ಖಾಲಿ ಪಟ್ಟಿಯೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸಿ (ಇಂದಿನ ಹೊಸ ನೋಂದಣಿ)' : '2. Start With Blank List (Live Registration)'}
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {lang === 'kn'
                      ? 'ಎಲ್ಲಾ ಹಳೆಯ ಸ್ಪರ್ಧಿಗಳು ಮತ್ತು ಅಂಕಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತೆರವುಗೊಳಿಸುತ್ತದೆ. ಇಂದಿನ ವೇದಿಕೆಗೆ ಬರುವ ಶಿಕ್ಷಕರ ಹೆಸರನ್ನು ನೇರವಾಗಿ ನೋಂದಾಯಿಸಬಹುದು.'
                      : 'Clears all participants and scores completely for registering attendees from scratch.'}
                  </p>
                </div>
              </button>

              {/* Option 3: Reset Scores Only */}
              <button
                onClick={() => {
                  onStartNewCompetition?.('resetScoresOnly');
                  setIsNewCompetitionModalOpen(false);
                  setActionSuccessNotice(lang === 'kn' ? 'ಪ್ರಸ್ತುತ ಸ್ಪರ್ಧಿಗಳ ಎಲ್ಲಾ ಅಂಕಗಳನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ!' : 'All scores reset to zero for current participants!');
                }}
                className="w-full text-left p-4 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition flex items-start gap-3.5 group"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center shrink-0 mt-0.5">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-rose-950 font-serif-kannada">
                    {lang === 'kn' ? '೩. ಕೇವಲ ಅಂಕಗಳನ್ನು ರದ್ದುಮಾಡಿ (ಅದೇ ಸ್ಪರ್ಧಿಗಳೊಂದಿಗೆ)' : '3. Reset Scores Only (Keep Current Participants)'}
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {lang === 'kn'
                      ? 'ಪ್ರಸ್ತುತ ಪಟ್ಟಿಯಲ್ಲಿರುವ ಸ್ಪರ್ಧಿಗಳನ್ನು ಹಾಗೆಯೇ ಉಳಿಸಿಕೊಂಡು, ೪ ತೀರ್ಪುಗಾರರ ಎಲ್ಲಾ ಅಂಕಗಳನ್ನು ಶೂನ್ಯಕ್ಕೆ ಮರುಹೊಂದಿಸುತ್ತದೆ.'
                      : 'Keeps existing participant names and resets only the 4 judges scores and total back to pending.'}
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsNewCompetitionModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900"
              >
                {lang === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Close Current Competition (Requested: "spardhe close madi") */}
      {isCloseCompetitionModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-300 animate-in fade-in zoom-in-95 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 mx-auto flex items-center justify-center text-2xl mb-4 border border-rose-200">
              🛑
            </div>
            
            <h3 className="text-lg font-black text-rose-950 font-serif-kannada">
              {lang === 'kn' ? 'ಈಗಿನ ಸ್ಪರ್ಧೆಯನ್ನು ಮುಕ್ತಾಯಗೊಳಿಸಬೇಕೇ?' : 'Conclude Current Competition?'}
            </h3>
            
            <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
              {lang === 'kn'
                ? 'ಸ್ಪರ್ಧೆಯನ್ನು ಮುಕ್ತಾಯಗೊಳಿಸಿದರೆ, ತೀರ್ಪುಗಾರರ ಮೌಲ್ಯಮಾಪನವು ಅಂತಿಮಗೊಳ್ಳುತ್ತದೆ. ಅಗ್ರ ೩ ವಿಜೇತರ ಪಟ್ಟಿ ಹಾಗೂ ಎಲ್ಲಾ ಸ್ಪರ್ಧಿಗಳ ಅಂತಿಮ ಅಂಕಪಟ್ಟಿ ಅಧಿಕೃತಗೊಳ್ಳುತ್ತದೆ.'
                : 'Closing will officially finalize the 4 judges score evaluations, declare top winners, and lock the final official result sheet.'}
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setIsCloseCompetitionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 border border-stone-200"
              >
                {lang === 'kn' ? 'ಹಿಂತಿರುಗಿ' : 'Back'}
              </button>
              <button
                onClick={() => {
                  onCloseCurrentCompetition?.();
                  setIsCloseCompetitionModalOpen(false);
                  setActionSuccessNotice(lang === 'kn' ? 'ಸ್ಪರ್ಧೆಯನ್ನು ಅಧಿಕೃತವಾಗಿ ಮುಕ್ತಾಯಗೊಳಿಸಲಾಗಿದೆ! ಅಂತಿಮ ಫಲಿತಾಂಶಗಳನ್ನು ಘೋಷಿಸಲಾಗಿದೆ.' : 'Competition successfully concluded and official results declared!');
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white shadow-xs font-serif-kannada transition"
              >
                {lang === 'kn' ? 'ಹೌದು, ಮುಕ್ತಾಯಗೊಳಿಸಿ' : 'Yes, Conclude'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
