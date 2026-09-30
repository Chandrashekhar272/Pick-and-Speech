import React, { useState, useMemo, useEffect } from 'react';
import { 
  Award, 
  Download, 
  Search, 
  Printer, 
  Eye, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  FileText, 
  Edit3, 
  Sliders, 
  Palette,
  ShieldAlert,
  ChevronRight,
  BookOpen,
  PenTool,
  Upload,
  Check,
  Trash2,
  UserPlus,
  RotateCcw,
  Lock,
  Unlock,
  ShieldCheck
} from 'lucide-react';
import { Participant, Language, CertificateSignatory, CertificateTheme } from '../types';
import { 
  getParticipantCertificateTheme, 
  downloadCertificatePDF, 
  downloadAllCertificatesPDF,
  sanitizeCertificateText
} from '../utils/certificatePdf';
import { CertificateModal } from './CertificateModal';
import { SignatureEditorModal } from './SignatureEditorModal';
import { DEFAULT_SIGNATORIES } from '../data/defaultSignatories';

interface CertificatePortalProps {
  lang: Language;
  schoolName: string;
  participants: Participant[];
  signatories?: CertificateSignatory[];
  onUpdateSignatories?: (sigs: CertificateSignatory[]) => void;
  onDeleteParticipant?: (id: string) => void;
  isSignaturesLocked?: boolean;
  onToggleLockSignatures?: () => void;
}

export const CertificatePortal: React.FC<CertificatePortalProps> = ({
  lang,
  schoolName,
  participants,
  signatories = DEFAULT_SIGNATORIES,
  onUpdateSignatories,
  onDeleteParticipant,
  isSignaturesLocked: propIsLocked,
  onToggleLockSignatures
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'top3' | 'participation'>('all');
  const [selectedParticipantForModal, setSelectedParticipantForModal] = useState<Participant | null>(null);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isEditingSignatories, setIsEditingSignatories] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Local fallback if prop not provided: default to true (locked) as requested
  const [localIsLocked, setLocalIsLocked] = useState<boolean>(true);
  const isSignaturesLocked = propIsLocked !== undefined ? propIsLocked : localIsLocked;

  // Password-protected unlock dialog states
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [lockToast, setLockToast] = useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleRequestToggleLock = () => {
    if (isSignaturesLocked) {
      setUnlockPassword('');
      setUnlockError(null);
      setIsUnlockModalOpen(true);
    } else {
      if (onToggleLockSignatures) {
        onToggleLockSignatures();
      } else {
        setLocalIsLocked(true);
      }
      setIsEditingSignatories(false);
      setLockToast(lang === 'kn' ? '🔒 ಎಲ್ಲಾ ಪ್ರಮಾಣಪತ್ರ ಸಹಿಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಲಾಕ್ ಮಾಡಲಾಗಿದೆ!' : '🔒 All certificate signatures locked successfully!');
      setTimeout(() => setLockToast(null), 3500);
    }
  };

  const handleConfirmUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (unlockPassword.trim() === 'chandrusk@123' || unlockPassword.trim() === '1234') {
      if (onToggleLockSignatures) {
        onToggleLockSignatures();
      } else {
        setLocalIsLocked(false);
      }
      setIsUnlockModalOpen(false);
      setUnlockPassword('');
      setUnlockError(null);
      setIsEditingSignatories(true);
    } else {
      setUnlockError(lang === 'kn' ? 'ತಪ್ಪಾದ ಪಾಸ್‌ವರ್ಡ್! ಸರಿಯಾದ ಅಧಿಕೃತ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.' : 'Incorrect password! Please enter authorized password.');
    }
  };
  
  // Ensure we have active signatories
  const [activeSigs, setActiveSigs] = useState<CertificateSignatory[]>(() => {
    return (signatories && signatories.length > 0) ? signatories : DEFAULT_SIGNATORIES;
  });

  // Sync activeSigs when props change
  useEffect(() => {
    if (signatories && signatories.length > 0) {
      setActiveSigs(signatories);
    }
  }, [signatories]);

  const [sigToEditSignature, setSigToEditSignature] = useState<CertificateSignatory | null>(null);

  // Scored participants descending
  const scoredParticipants = useMemo(() => {
    return [...participants]
      .filter(p => p.scores !== undefined)
      .sort((a, b) => (b.scores?.total || 0) - (a.scores?.total || 0));
  }, [participants]);

  // Map participant to their calculated rank / theme
  const participantsWithThemes = useMemo(() => {
    return participants.map(p => {
      const { theme, rank } = getParticipantCertificateTheme(p, participants);
      return {
        participant: p,
        theme,
        rank
      };
    });
  }, [participants]);

  // Filtered list
  const filteredParticipants = useMemo(() => {
    return participantsWithThemes.filter(({ participant, rank, theme }) => {
      // Search
      const matchesSearch = 
        participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.schoolOrClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.chestNo.toString().includes(searchTerm);

      if (!matchesSearch) return false;

      if (filterType === 'top3') {
        return rank !== null && rank <= 3;
      }
      if (filterType === 'participation') {
        return rank === null || rank > 3;
      }
      return true;
    });
  }, [participantsWithThemes, searchTerm, filterType]);

  // Download single certificate
  const handleDownloadSingle = async (p: Participant) => {
    try {
      setDownloadingId(p.id);
      await downloadCertificatePDF(p, participants, {
        schoolName,
        lang,
        signatories: activeSigs
      });
    } finally {
      setDownloadingId(null);
    }
  };

  // Download all certificates
  const handleDownloadAll = async () => {
    if (participants.length === 0) return;
    try {
      setIsExportingAll(true);
      setExportProgress({ current: 0, total: participants.length });
      await downloadAllCertificatesPDF(participants, {
        schoolName,
        lang,
        signatories: activeSigs,
        onProgress: (current, total) => {
          setExportProgress({ current, total });
        }
      });
    } finally {
      setIsExportingAll(false);
      setExportProgress(null);
    }
  };

  const handleSaveSignatories = () => {
    if (onUpdateSignatories) {
      onUpdateSignatories(activeSigs);
    }
    setIsEditingSignatories(false);
  };

  const handleSaveSignature = (sigId: string, signatureDataUrl?: string) => {
    const updated = activeSigs.map(s => s.id === sigId ? { ...s, signatureImage: signatureDataUrl } : s);
    setActiveSigs(updated);
    if (onUpdateSignatories) {
      onUpdateSignatories(updated);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-amber-500/40 relative overflow-hidden">
        {/* Background Decorative Rings */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-amber-500/10 pointer-events-none blur-xl" />
        <div className="absolute right-32 -bottom-16 w-48 h-48 rounded-full bg-emerald-500/10 pointer-events-none blur-xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {lang === 'kn' ? 'ಡಿಜಿಟಲ್ ಇ-ಪ್ರಮಾಣಪತ್ರ ವಿಭಾಗ (A4 Landscape)' : 'Official E-Certificate Portal (A4 Landscape)'}
                </span>
              </div>

              {isSignaturesLocked ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/60 text-emerald-200 text-xs font-bold shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{lang === 'kn' ? '🔒 ಅಧಿಕೃತ ಸಹಿಗಳು ಲಾಕ್ ಆಗಿದೆ' : '🔒 Signatures Verified & Locked'}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/30 border border-amber-400/60 text-amber-200 text-xs font-bold">
                  <Unlock className="w-3.5 h-3.5 text-amber-300" />
                  <span>{lang === 'kn' ? '🔓 ಸಹಿ ತಿದ್ದುಪಡಿ ಸಕ್ರಿಯ' : '🔓 Signatures Unlocked'}</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-serif-kannada tracking-tight text-white">
              {lang === 'kn'
                ? 'ಎಲ್ಲಾ ಸ್ಪರ್ಧಿಗಳ ವೃತ್ತಿಪರ ಲ್ಯಾಂಡ್‌ಸ್ಕೇಪ್ ಇ-ಪ್ರಮಾಣಪತ್ರಗಳು'
                : 'Professional A4 Landscape E-Certificates for All Participants'}
            </h1>

            <p className="text-sm text-amber-100/90 leading-relaxed font-serif-kannada">
              {lang === 'kn'
                ? 'ಸ್ಪರ್ಧೆಯಲ್ಲಿ ನೋಂದಾಯಿಸಿಕೊಂಡ ಎಲ್ಲಾ ಸ್ಪರ್ಧಿಗಳಿಗೂ ಅಧಿಕೃತ ೬ ಸಹಿಗಳೊಂದಿಗೆ (ಶ್ರೀ ನರಸಿಂಹಮೂರ್ತಿ, ಶ್ರೀಮತಿ ರೋಷನ್ ಬೇಗಂ, ಶ್ರೀ ಕರಿಬಸಪ್ಪ, ಶ್ರೀಮತಿ ಉಮಾದೇವಿ, ಶ್ರೀ ಚಂದ್ರಶೇಖರ್ ನಾಯಕ್, ಶ್ರೀ ಪಿ. ಮಹೇಶ್) ಪರಿಪೂರ್ಣ A4 ಲ್ಯಾಂಡ್‌ಸ್ಕೇಪ್ ವಿನ್ಯಾಸ. ಅಗ್ರ ೩ ವಿಜೇತರಿಗೆ ಗೋಲ್ಡ್, ಸಿಲ್ವರ್, ಬ್ರಾಂಜ್ ಹಾಗೂ ಉಳಿದವರಿಗೆ ಎಮರಾಲ್ಡ್ ಗ್ರೀನ್ ಮತ್ತು ಗೋಲ್ಡ್ ಬಣ್ಣದ ಪ್ರಮಾಣಪತ್ರ.'
                : 'High-fidelity A4 landscape certificates for all registered candidates with 6 verified digital signatures across the bottom. Unique color themes for Top 3 (Gold, Silver, Bronze) and Deep Emerald Green & Gold for all participants.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Signature View / Edit Button */}
            <button
              onClick={() => setIsEditingSignatories(!isEditingSignatories)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition flex items-center gap-2 backdrop-blur-sm"
            >
              <PenTool className="w-4 h-4 text-amber-300" />
              <span>{lang === 'kn' ? '೬ ಸಹಿಗಳು & ಹುದ್ದೆಗಳು' : '6 Signatures & Roles'}</span>
            </button>

            {/* Lock / Unlock Toggle Button */}
            <button
              onClick={handleRequestToggleLock}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition flex items-center gap-2 backdrop-blur-sm ${
                isSignaturesLocked
                  ? 'bg-emerald-600/30 hover:bg-emerald-600/40 border-emerald-400/40 text-emerald-100 shadow-xs'
                  : 'bg-amber-600/30 hover:bg-amber-600/40 border-amber-400/40 text-amber-100'
              }`}
              title={
                isSignaturesLocked
                  ? (lang === 'kn' ? 'ಸಹಿಗಳನ್ನು ಅನ್‌ಲಾಕ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ' : 'Click to unlock signatures')
                  : (lang === 'kn' ? 'ಸಹಿಗಳನ್ನು ಲಾಕ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ' : 'Click to lock signatures')
              }
            >
              {isSignaturesLocked ? (
                <>
                  <Lock className="w-4 h-4 text-emerald-300" />
                  <span>{lang === 'kn' ? '🔒 ಸಹಿಗಳನ್ನು ಲಾಕ್ ಮಾಡಲಾಗಿದೆ' : '🔒 Signatures Locked'}</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-amber-300" />
                  <span>{lang === 'kn' ? '🔓 ಅನ್‌ಲಾಕ್ ಆಗಿದೆ (ಲಾಕ್ ಮಾಡಿ)' : '🔓 Unlocked (Click to Lock)'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadAll}
              disabled={isExportingAll || participants.length === 0}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-amber-950 font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition flex items-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isExportingAll ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-950" />
              ) : (
                <Download className="w-4 h-4 text-amber-950" />
              )}
              <span>
                {isExportingAll
                  ? `${lang === 'kn' ? 'ಡೌನ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ' : 'Exporting...'} (${exportProgress?.current}/${exportProgress?.total})`
                  : lang === 'kn'
                  ? `ಎಲ್ಲರ ಪ್ರಮಾಣಪತ್ರಗಳು (${participants.length}) A4 PDF`
                  : `Download All Certificates (${participants.length})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Signatories Section (Collapsible - Verified Read-Only when Locked, Editable when Unlocked) */}
      {isEditingSignatories && (
        <div className={`bg-white rounded-3xl p-6 border-2 shadow-md space-y-5 transition ${
          isSignaturesLocked ? 'border-emerald-300 bg-emerald-50/20' : 'border-amber-300'
        }`}>
          {isSignaturesLocked ? (
            /* LOCKED VIEW: Verified Authenticated Signatories Cards */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold border border-emerald-300 shadow-xs shrink-0">
                    <ShieldCheck className="w-6 h-6 text-emerald-700" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-stone-900 text-base sm:text-lg font-serif-kannada">
                        {lang === 'kn' ? `ಪ್ರಮಾಣಪತ್ರದ ${activeSigs.length} ಅಧಿಕೃತ ಸಹಿದಾರರು & ಹುದ್ದೆಗಳು:` : `${activeSigs.length} Official Verified Committee Signatories:`}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 font-mono">
                        <Lock className="w-3 h-3 text-emerald-700" />
                        <span>{lang === 'kn' ? 'ಸುರಕ್ಷಿತವಾಗಿ ಲಾಕ್ ಆಗಿದೆ' : 'Locked & Secured'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {lang === 'kn'
                        ? 'ನಿಮ್ಮ ಕೋರಿಕೆಯಂತೆ ಪ್ರಮಾಣಪತ್ರದ ಎಲ್ಲಾ ಸಹಿದಾರರ ಹೆಸರುಗಳು, ಹುದ್ದೆಗಳು ಮತ್ತು ಸಹಿಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಲಾಕ್ ಮಾಡಲಾಗಿದೆ. ಯಾವುದೇ ಆಕಸ್ಮಿಕ ಬದಲಾವಣೆ ಅಥವಾ ಡಿಲೀಟ್ ಆಗದಂತೆ ಸುರಕ್ಷಿತಗೊಳಿಸಲಾಗಿದೆ.'
                        : 'As requested, all signatory names, roles, and signatures are securely locked and verified against accidental edits.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRequestToggleLock}
                    className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs border border-amber-300 flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <Unlock className="w-3.5 h-3.5 text-amber-800" />
                    <span>{lang === 'kn' ? '🔓 ತಿದ್ದುಪಡಿಗೆ ಅನ್‌ಲಾಕ್ ಮಾಡಿ' : 'Unlock to Edit'}</span>
                  </button>
                </div>
              </div>

              {/* Locked Verified Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeSigs.map((sig, idx) => (
                  <div 
                    key={sig.id} 
                    className="bg-white rounded-2xl p-4 border border-emerald-200/90 shadow-2xs space-y-3 relative hover:border-emerald-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-black text-xs font-serif-kannada border border-emerald-200">
                        {idx + 1}. {sig.roleKn}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{lang === 'kn' ? 'ದೃಢೀಕರಿಸಲಾಗಿದೆ' : 'Verified'}</span>
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-stone-900 font-serif-kannada">
                        {sig.nameKn}
                      </h4>
                      <p className="text-xs text-stone-600 font-medium font-mono">
                        {sig.name}
                      </p>
                      <div className="mt-2 inline-block px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-800 font-serif-kannada">
                        {sig.designationKn || sig.roleKn}
                      </div>
                    </div>

                    {/* Verified Signature Box */}
                    <div className="pt-2 border-t border-stone-200">
                      <div className="h-16 w-full rounded-xl bg-stone-50 border border-stone-200 p-2 flex items-center justify-center relative overflow-hidden">
                        {sig.signatureImage ? (
                          <img 
                            src={sig.signatureImage} 
                            alt={sig.name} 
                            className="max-h-full max-w-full object-contain filter contrast-125"
                          />
                        ) : (
                          <div className="font-serif italic text-amber-900/80 text-sm font-bold tracking-wider select-none">
                            ✍ {sig.name}
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" />
                          <span>ಅಧಿಕೃತ ಸಹಿ</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* UNLOCKED VIEW: Full Editing Form */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <PenTool className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base font-serif-kannada">
                      {lang === 'kn' ? `ಪ್ರಮಾಣಪತ್ರದಲ್ಲಿ ${activeSigs.length} ಅಧಿಕೃತ ಸಮಿತಿ ಸದಸ್ಯರು / ಸಹಿದಾರರು:` : `${activeSigs.length} Official Committee Members / Signatories:`}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {lang === 'kn'
                        ? 'ಇಲ್ಲಿ ನೀವು ನಮೂದಿಸಿದ ಹೆಸರು, ಹುದ್ದೆ ಹಾಗೂ ಅಪ್‌ಲೋಡ್/ಬರೆದ ಸಹಿಗಳು ನೇರವಾಗಿ ಎಲ್ಲಾ A4 Landscape ಪ್ರಮಾಣಪತ್ರಗಳಲ್ಲೂ ಮುದ್ರಣಗೊಳ್ಳುತ್ತವೆ.'
                        : 'The names, designations, and uploaded/drawn signatures are directly rendered across the bottom of all certificates.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const newCount = activeSigs.length + 1;
                      const newSig: CertificateSignatory = {
                        id: `sig-${Date.now()}`,
                        name: `Member ${newCount}`,
                        nameKn: `ಸದಸ್ಯರು ${newCount}`,
                        role: `Member ${newCount}`,
                        roleKn: `ಸದಸ್ಯರು`,
                        designation: `Committee Member`,
                        designationKn: `ಸಮಿತಿ ಸದಸ್ಯರು`
                      };
                      setActiveSigs(prev => [...prev, newSig]);
                    }}
                    className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-amber-700" />
                    <span>{lang === 'kn' ? '+ ಹೊಸ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ' : '+ Add Member'}</span>
                  </button>

                  {resetConfirmOpen ? (
                    <div className="flex items-center gap-1.5 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300">
                      <span className="text-[11px] font-bold text-amber-950 font-serif-kannada">
                        {lang === 'kn' ? 'ಡೀಫಾಲ್ಟ್ ೬ ಸಹಿಗಳಿಗೆ ಮರುಹೊಂದಿಸಬೇಕೇ?' : 'Reset to 6 signatories?'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSigs(DEFAULT_SIGNATORIES);
                          if (onUpdateSignatories) {
                            onUpdateSignatories(DEFAULT_SIGNATORIES);
                          }
                          setResetConfirmOpen(false);
                        }}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold"
                      >
                        {lang === 'kn' ? 'ಹೌದು' : 'Yes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetConfirmOpen(false)}
                        className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-[10px] font-bold"
                      >
                        {lang === 'kn' ? 'ಬೇಡ' : 'No'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setResetConfirmOpen(true)}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                      title={lang === 'kn' ? 'ಡೀಫಾಲ್ಟ್ ೬ ಸಹಿಗಳಿಗೆ ಮರುಹೊಂದಿಸಿ' : 'Reset to default 6 signatories'}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{lang === 'kn' ? 'ಡೀಫಾಲ್ಟ್ ೬ ಸಹಿಗಳು' : 'Reset to 6'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      handleSaveSignatories();
                      if (onToggleLockSignatures) {
                        onToggleLockSignatures();
                      } else {
                        setLocalIsLocked(true);
                      }
                      setIsEditingSignatories(false);
                      setLockToast(lang === 'kn' ? '🔒 ಎಲ್ಲಾ ಪ್ರಮಾಣಪತ್ರ ಸಹಿಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಲಾಕ್ ಮಾಡಲಾಗಿದೆ!' : '🔒 All certificate signatures locked successfully!');
                      setTimeout(() => setLockToast(null), 3500);
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{lang === 'kn' ? 'ಉಳಿಸಿ & ಲಾಕ್ ಮಾಡಿ' : 'Save & Lock'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeSigs.map((sig, idx) => (
                  <div key={sig.id} className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-black text-xs font-serif-kannada">
                        {idx + 1}. {sig.roleKn}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSigToEditSignature(sig)}
                          className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1 transition shadow-2xs"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>{sig.signatureImage ? (lang === 'kn' ? 'ಸಹಿ ಬದಲಿಸಿ' : 'Edit') : (lang === 'kn' ? 'ಸಹಿ' : 'Sign')}</span>
                        </button>

                        {activeSigs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(lang === 'kn'
                                ? `ನೀವು "${sig.nameKn || sig.name}" ಅವರನ್ನು ಸಹಿದಾರರ / ಸಮಿತಿ ಸದಸ್ಯರ ಪಟ್ಟಿಯಿಂದ ತೆಗೆದುಹಾಕಲು ಬಯಸುವಿರಾ?`
                                : `Remove "${sig.nameKn || sig.name}" from committee signatories?`)) {
                                setActiveSigs(prev => prev.filter(s => s.id !== sig.id));
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                            title={lang === 'kn' ? 'ಈ ಸದಸ್ಯರನ್ನು ತೆಗೆದುಹಾಕಿ' : 'Remove this member'}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {lang === 'kn' ? 'ಸಹಿದಾರರ ಪೂರ್ಣ ಹೆಸರು (ಕನ್ನಡ):' : 'Full Name (Kannada):'}
                      </label>
                      <input
                        type="text"
                        value={sig.nameKn}
                        onChange={e => {
                          const val = e.target.value;
                          setActiveSigs(prev => prev.map((s, i) => i === idx ? { ...s, nameKn: val } : s));
                        }}
                        className="w-full px-3 py-1.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 bg-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {lang === 'kn' ? 'ಹೆಸರು (ಇಂಗ್ಲಿಷ್):' : 'Name (English):'}
                      </label>
                      <input
                        type="text"
                        value={sig.name}
                        onChange={e => {
                          const val = e.target.value;
                          setActiveSigs(prev => prev.map((s, i) => i === idx ? { ...s, name: val } : s));
                        }}
                        className="w-full px-3 py-1.5 border border-stone-300 rounded-xl text-xs text-stone-700 bg-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {lang === 'kn' ? 'ಪದನಾಮ / ಹುದ್ದೆ (ಕನ್ನಡ):' : 'Designation (Kannada):'}
                      </label>
                      <input
                        type="text"
                        value={sig.designationKn}
                        onChange={e => {
                          const val = e.target.value;
                          setActiveSigs(prev => prev.map((s, i) => i === idx ? { ...s, designationKn: val } : s));
                        }}
                        className="w-full px-3 py-1.5 border border-stone-300 rounded-xl text-xs text-stone-800 bg-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Signature status preview */}
                    <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-xs">
                      <span className="text-stone-500">{lang === 'kn' ? 'ಸಹಿ ಸ್ಥಿತಿ:' : 'Status:'}</span>
                      {sig.signatureImage ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-700 font-bold text-xs">✓ {lang === 'kn' ? 'ಕಸ್ಟಮ್ ಸಹಿ ಸಕ್ರಿಯ' : 'Custom Active'}</span>
                          <button
                            type="button"
                            onClick={() => handleSaveSignature(sig.id, undefined)}
                            className="text-[11px] text-red-600 hover:underline"
                          >
                            {lang === 'kn' ? 'ಅಳಿಸಿ' : 'Clear'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-stone-500 text-[11px] italic">
                          {lang === 'kn' ? 'ವಾಸ್ತವಿಕ ಹಸ್ತಾಕ್ಷರ ಕರ್ವ್ (Default)' : 'Procedural Script Curve'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Color Code Legend Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1st Place */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
            🥇
          </div>
          <div>
            <div className="text-xs font-bold text-amber-950 font-serif-kannada">
              {lang === 'kn' ? 'ಪ್ರಥಮ ಬಹುಮಾನ' : '1st Prize'}
            </div>
            <div className="text-[11px] font-semibold text-amber-700">
              {lang === 'kn' ? 'ರಾಯಲ್ ಗೋಲ್ಡ್ & ವೈಟ್' : 'Royal Gold & White'}
            </div>
          </div>
        </div>

        {/* 2nd Place */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-300 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
            🥈
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 font-serif-kannada">
              {lang === 'kn' ? 'ದ್ವಿತೀಯ ಬಹುಮಾನ' : '2nd Prize'}
            </div>
            <div className="text-[11px] font-semibold text-slate-600">
              {lang === 'kn' ? 'ಸಿಲ್ವರ್ & ಸಫೈರ್ ಬ್ಲೂ' : 'Silver & Sapphire'}
            </div>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-200 text-orange-900 flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
            🥉
          </div>
          <div>
            <div className="text-xs font-bold text-orange-950 font-serif-kannada">
              {lang === 'kn' ? 'ತೃತೀಯ ಬಹುಮಾನ' : '3rd Prize'}
            </div>
            <div className="text-[11px] font-semibold text-orange-700">
              {lang === 'kn' ? 'ಕಂಚು & ವಾರ್ಮ್ ಆಂಬರ್' : 'Warm Bronze & Amber'}
            </div>
          </div>
        </div>

        {/* Remaining Participants */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-200 text-emerald-900 flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
            🎖️
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-950 font-serif-kannada">
              {lang === 'kn' ? 'ಭಾಗವಹಿಸುವಿಕೆ (ಉಳಿದವರು)' : 'Participation (Others)'}
            </div>
            <div className="text-[11px] font-semibold text-emerald-700">
              {lang === 'kn' ? 'ಎಮರಾಲ್ಡ್ ಗ್ರೀನ್ & ಗೋಲ್ಡ್' : 'Emerald Green & Gold'}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={lang === 'kn' ? 'ಸ್ಪರ್ಧಿಯ ಹೆಸರು, ಚೆಸ್ಟ್ ಸಂಖ್ಯೆ ಅಥವಾ ಶಾಲೆ ಹುಡುಕಿ...' : 'Search by name, chest #, or school...'}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'all'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {lang === 'kn' ? `ಎಲ್ಲರೂ (${participants.length})` : `All (${participants.length})`}
          </button>

          <button
            onClick={() => setFilterType('top3')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              filterType === 'top3'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span>🏆</span>
            <span>{lang === 'kn' ? 'ವಿಜೇತರು (ಟಾಪ್ ೩)' : 'Top 3 Winners'}</span>
          </button>

          <button
            onClick={() => setFilterType('participation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              filterType === 'participation'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span>🎖️</span>
            <span>{lang === 'kn' ? 'ಸಕ್ರಿಯ ಸಹಭಾಗಿತ್ವ' : 'Participation'}</span>
          </button>
        </div>

      </div>

      {/* Participants Certificate Cards Grid */}
      {filteredParticipants.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs space-y-3">
          <Users className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-800 text-base">
            {lang === 'kn' ? 'ಯಾವುದೇ ಸ್ಪರ್ಧಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'No Participants Found'}
          </h3>
          <p className="text-xs text-stone-500">
            {lang === 'kn'
              ? 'ಹುಡುಕಾಟದ ಪದವನ್ನು ಬದಲಾಯಿಸಿ ಅಥವಾ "ಸ್ಪರ್ಧಾ ಚೀಟಿ ಆರಿಸಿ" ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಹೊಸ ಸ್ಪರ್ಧಿಗಳನ್ನು ನೋಂದಾಯಿಸಿ.'
              : 'Adjust search filter or register participants in the Picker tab.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredParticipants.map(({ participant, theme, rank }) => {
            const isTop3 = rank !== null && rank <= 3;
            const isDownloading = downloadingId === participant.id;

            return (
              <div
                key={participant.id}
                className={`bg-white rounded-3xl p-5 border-2 transition hover:shadow-md flex flex-col justify-between gap-4 relative overflow-hidden ${
                  theme === 'gold'
                    ? 'border-amber-400 bg-amber-50/20'
                    : theme === 'silver'
                    ? 'border-slate-400 bg-slate-50/20'
                    : theme === 'bronze'
                    ? 'border-orange-400 bg-orange-50/20'
                    : 'border-emerald-300 bg-emerald-50/20'
                }`}
              >
                {/* Theme indicator accent bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    theme === 'gold'
                      ? 'bg-amber-500'
                      : theme === 'silver'
                      ? 'bg-slate-400'
                      : theme === 'bronze'
                      ? 'bg-orange-500'
                      : 'bg-emerald-600'
                  }`}
                />

                <div className="space-y-3">
                  {/* Top line badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-stone-100 text-stone-800 border border-stone-200">
                      #{participant.chestNo}
                    </span>

                    {/* Rank / Theme badge */}
                    {theme === 'gold' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        🥇 {lang === 'kn' ? 'ಪ್ರಥಮ ಬಹುಮಾನ (Gold)' : '1st Prize'}
                      </span>
                    )}
                    {theme === 'silver' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-800 border border-slate-300 flex items-center gap-1">
                        🥈 {lang === 'kn' ? 'ದ್ವಿತೀಯ ಬಹುಮಾನ (Silver)' : '2nd Prize'}
                      </span>
                    )}
                    {theme === 'bronze' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-900 border border-orange-300 flex items-center gap-1">
                        🥉 {lang === 'kn' ? 'ತೃತೀಯ ಬಹುಮಾನ (Bronze)' : '3rd Prize'}
                      </span>
                    )}
                    {theme === 'green' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                        🎖️ {lang === 'kn' ? 'ಸಹಭಾಗಿತ್ವ (Green & Gold)' : 'Participation'}
                      </span>
                    )}
                  </div>

                  {/* Participant Name & Details */}
                  <div>
                    <h4 className="text-base font-bold text-stone-900 font-serif-kannada">
                      {participant.name}
                    </h4>
                    <p className="text-xs text-stone-500">
                      {sanitizeCertificateText(participant.schoolOrClass) || sanitizeCertificateText(schoolName) || 'ಮೈಸೂರು'}
                    </p>
                  </div>

                  {/* Assigned Topic if any */}
                  {participant.assignedTopic && (
                    <div className="bg-stone-50 p-2 rounded-xl border border-stone-200 text-[11px] text-stone-700">
                      <span className="font-bold text-amber-800">
                        {lang === 'kn' ? 'ವಿಷಯ' : 'Topic'}:
                      </span>{' '}
                      #{participant.assignedTopic.number} {participant.assignedTopic.titleKn}
                    </div>
                  )}

                  {/* Scores if evaluated */}
                  {participant.scores && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
                      <span className="text-amber-700 font-bold">
                        {lang === 'kn' ? 'ಗಳಿಸಿದ ಅಂಕ' : 'Score'}:
                      </span>
                      <span>{participant.scores.total} / 50</span>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-stone-200/80 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedParticipantForModal(participant)}
                    className="flex-1 py-2 px-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-700" />
                    <span>{lang === 'kn' ? 'ಮುನ್ನೋಟ' : 'Preview'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadSingle(participant)}
                    disabled={isDownloading}
                    className={`py-2 px-3.5 rounded-xl text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50 ${
                      theme === 'gold'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : theme === 'silver'
                        ? 'bg-slate-700 hover:bg-slate-800'
                        : theme === 'bronze'
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'bg-emerald-700 hover:bg-emerald-800'
                    }`}
                  >
                    {isDownloading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{lang === 'kn' ? 'A4 PDF' : 'A4 PDF'}</span>
                  </button>

                  {onDeleteParticipant && (
                    confirmDeleteId === participant.id ? (
                      <div className="flex items-center gap-1 shrink-0 animate-in fade-in">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteParticipant(participant.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                          title={lang === 'kn' ? 'ಖಚಿತವಾಗಿ ತೆಗೆದುಹಾಕಿ' : 'Confirm delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{lang === 'kn' ? 'ಖಚಿತ' : 'Delete'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(participant.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition shrink-0"
                        title={lang === 'kn' ? 'ಈ ಸದಸ್ಯರನ್ನು ತೆಗೆದುಹಾಕಿ' : 'Remove this member'}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Certificate Preview Modal */}
      <CertificateModal
        isOpen={Boolean(selectedParticipantForModal)}
        onClose={() => setSelectedParticipantForModal(null)}
        lang={lang}
        participant={selectedParticipantForModal}
        allParticipants={participants}
        schoolName={schoolName}
        onSelectParticipant={setSelectedParticipantForModal}
        signatories={activeSigs}
        onUpdateSignatories={sigs => {
          setActiveSigs(sigs);
          if (onUpdateSignatories) {
            onUpdateSignatories(sigs);
          }
        }}
        isSignaturesLocked={isSignaturesLocked}
        onToggleLockSignatures={handleRequestToggleLock}
      />

      {/* Signature Editor Modal (Draw or Upload) */}
      <SignatureEditorModal
        isOpen={Boolean(sigToEditSignature)}
        onClose={() => setSigToEditSignature(null)}
        lang={lang}
        signatory={sigToEditSignature}
        onSaveSignature={handleSaveSignature}
      />

      {/* Toast Notification */}
      {lockToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-bounce">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold font-serif-kannada">{lockToast}</span>
        </div>
      )}

      {/* Password Unlock Modal */}
      {isUnlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-amber-300 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto border border-amber-300">
              <Lock className="w-7 h-7 text-amber-800" />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-amber-950 font-serif-kannada">
                {lang === 'kn' ? 'ಅಧಿಕೃತ ಸಹಿಗಳ ಅನ್‌ಲಾಕ್' : 'Unlock Official Signatures'}
              </h3>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed font-serif-kannada">
                {lang === 'kn'
                  ? 'ಪ್ರಮಾಣಪತ್ರದ ಅಧಿಕೃತ ಸಹಿಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಲಾಕ್ ಮಾಡಲಾಗಿದೆ. ತಿದ್ದುಪಡಿ ಮಾಡಲು ದಯವಿಟ್ಟು ಮುಖ್ಯ ತೀರ್ಪುಗಾರರ ಅಧಿಕೃತ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.'
                  : 'Official certificate signatures are locked to prevent alterations. Enter Chief Judge password to edit.'}
              </p>
            </div>

            <form onSubmit={handleConfirmUnlock} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 font-serif-kannada">
                  {lang === 'kn' ? 'ಮುಖ್ಯ ತೀರ್ಪುಗಾರರ ಪಾಸ್‌ವರ್ಡ್:' : 'Chief Judge Password:'}
                </label>
                <input
                  type="password"
                  placeholder={lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ...' : 'Enter password...'}
                  value={unlockPassword}
                  onChange={e => {
                    setUnlockPassword(e.target.value);
                    setUnlockError(null);
                  }}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center font-mono font-bold text-base bg-white"
                  autoFocus
                />
                {unlockError && (
                  <p className="text-xs text-red-600 mt-1.5 text-center font-bold">
                    {unlockError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsUnlockModalOpen(false);
                    setUnlockPassword('');
                    setUnlockError(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition"
                >
                  {lang === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-md transition"
                >
                  {lang === 'kn' ? 'ಅನ್‌ಲಾಕ್ ಮಾಡಿ' : 'Unlock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
