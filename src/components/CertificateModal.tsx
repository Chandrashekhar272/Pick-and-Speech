import React, { useEffect, useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Palette, 
  Edit3, 
  Check, 
  Sparkles,
  School,
  FileCheck,
  Upload,
  PenTool,
  UserPlus,
  Trash2,
  RotateCcw,
  Lock,
  Unlock,
  ShieldCheck
} from 'lucide-react';
import { Participant, Language, CertificateTheme, CertificateSignatory } from '../types';
import { 
  renderCertificateToCanvas, 
  getParticipantCertificateTheme, 
  downloadCertificatePDF,
  preloadSignatoryImages
} from '../utils/certificatePdf';
import { DEFAULT_SIGNATORIES } from '../data/defaultSignatories';
import { SignatureEditorModal } from './SignatureEditorModal';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  participant: Participant | null;
  allParticipants: Participant[];
  schoolName: string;
  onSelectParticipant?: (p: Participant) => void;
  signatories?: CertificateSignatory[];
  onUpdateSignatories?: (sigs: CertificateSignatory[]) => void;
  isSignaturesLocked?: boolean;
  onToggleLockSignatures?: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  lang,
  participant,
  allParticipants,
  schoolName,
  onSelectParticipant,
  signatories = DEFAULT_SIGNATORIES,
  onUpdateSignatories,
  isSignaturesLocked = true,
  onToggleLockSignatures
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [overrideTheme, setOverrideTheme] = useState<CertificateTheme | 'auto'>('auto');
  const [isEditingSignatories, setIsEditingSignatories] = useState(false);
  const [editSigs, setEditSigs] = useState<CertificateSignatory[]>(() => {
    return (signatories && signatories.length >= 6) ? signatories : DEFAULT_SIGNATORIES;
  });
  const [editingSigForSignatureModal, setEditingSigForSignatureModal] = useState<CertificateSignatory | null>(null);

  // Keep editSigs in sync with props
  useEffect(() => {
    if (signatories && signatories.length >= 6) {
      setEditSigs(signatories);
    } else {
      setEditSigs(DEFAULT_SIGNATORIES);
    }
  }, [signatories]);

  // Determine active theme
  const autoInfo = participant ? getParticipantCertificateTheme(participant, allParticipants) : { theme: 'green' as CertificateTheme, rank: null };
  const effectiveTheme: CertificateTheme = overrideTheme === 'auto' ? autoInfo.theme : overrideTheme;

  // Re-render canvas whenever participant, theme, schoolName, or signatories change
  useEffect(() => {
    if (!isOpen || !participant || !canvasRef.current) return;
    
    let isCancelled = false;

    // Preload signature images if any, then render
    preloadSignatoryImages(editSigs).then(() => {
      if (isCancelled || !canvasRef.current) return;
      renderCertificateToCanvas(canvasRef.current, participant, {
        schoolName,
        lang,
        theme: effectiveTheme,
        rank: autoInfo.rank || undefined,
        signatories: editSigs
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, participant, effectiveTheme, schoolName, lang, editSigs, autoInfo.rank]);

  if (!isOpen || !participant) return null;

  const currentIndex = allParticipants.findIndex(p => p.id === participant.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allParticipants.length - 1;

  const handlePrev = () => {
    if (hasPrev && onSelectParticipant) {
      onSelectParticipant(allParticipants[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onSelectParticipant) {
      onSelectParticipant(allParticipants[currentIndex + 1]);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadCertificatePDF(participant, allParticipants, {
        schoolName,
        lang,
        signatories: editSigs
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Certificate - ${participant.name}</title>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; background: #fff; }
            img { width: 100vw; height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveSignatories = () => {
    if (onUpdateSignatories) {
      onUpdateSignatories(editSigs);
    }
    setIsEditingSignatories(false);
  };

  const handleSaveSignature = (sigId: string, signatureDataUrl?: string) => {
    const updated = editSigs.map(s => s.id === sigId ? { ...s, signatureImage: signatureDataUrl } : s);
    setEditSigs(updated);
    if (onUpdateSignatories) {
      onUpdateSignatories(updated);
    }
  };

  const getThemeBadge = () => {
    if (effectiveTheme === 'gold') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
          🥇 {lang === 'kn' ? 'ಪ್ರಥಮ ಬಹುಮಾನ • ಗೋಲ್ಡ್ & ವೈಟ್' : '1st Prize • Gold & White'}
        </span>
      );
    }
    if (effectiveTheme === 'silver') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">
          🥈 {lang === 'kn' ? 'ದ್ವಿತೀಯ ಬಹುಮಾನ • ಸಿಲ್ವರ್ & ಸಫೈರ್' : '2nd Prize • Silver & Sapphire'}
        </span>
      );
    }
    if (effectiveTheme === 'bronze') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300">
          🥉 {lang === 'kn' ? 'ತೃತೀಯ ಬಹುಮಾನ • ಬ್ರಾಂಜ್ & ಆಂಬರ್' : '3rd Prize • Bronze & Amber'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
        🎖️ {lang === 'kn' ? 'ಭಾಗವಹಿಸುವಿಕೆ • ಎಮರಾಲ್ಡ್ ಗ್ರೀನ್ & ಗೋಲ್ಡ್' : 'Participation • Emerald Green & Gold'}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-amber-200/80 overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 text-white px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-white font-serif-kannada">
                  {lang === 'kn' ? 'ಅಧಿಕೃತ ಇ-ಪ್ರಮಾಣಪತ್ರ ಮುನ್ನೋಟ (A4 Landscape)' : 'Official E-Certificate Preview (A4 Landscape)'}
                </h3>
                {getThemeBadge()}
                {isSignaturesLocked && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 text-xs font-bold">
                    <ShieldCheck className="w-3 h-3 text-emerald-300" />
                    <span>{lang === 'kn' ? '🔒 ಸಹಿಗಳು ಲಾಕ್ ಆಗಿದೆ' : '🔒 Signatures Locked'}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-200">
                #{participant.chestNo} • {participant.name} ({participant.schoolOrClass}) • {lang === 'kn' ? '೬ ಅಧಿಕೃತ ಸಹಿಗಳೊಂದಿಗೆ' : 'With 6 Official Signatures'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingSignatories(!isEditingSignatories)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-amber-100 border border-white/20 transition flex items-center gap-1.5"
              title={lang === 'kn' ? '೬ ಸಹಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ' : 'View 6 Signatures'}
            >
              {isSignaturesLocked ? (
                <Lock className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <PenTool className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span className="hidden sm:inline">
                {isSignaturesLocked 
                  ? (lang === 'kn' ? '🔒 ೬ ಸಹಿಗಳು (ಲಾಕ್)' : '🔒 6 Signatures') 
                  : (lang === 'kn' ? '೬ ಸಹಿಗಳು & ವಿವರ' : '6 Signatures')}
              </span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Edit / View Signatories Drawer / Box */}
        {isEditingSignatories && (
          <div className="bg-amber-50/95 border-b border-amber-200 p-4 space-y-3 max-h-72 overflow-y-auto">
            {isSignaturesLocked ? (
              /* LOCKED READ-ONLY VIEW */
              <div className="space-y-3">
                <div className="flex items-center justify-between sticky top-0 bg-amber-50/95 pb-2 border-b border-amber-200 z-10 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Lock className="w-4 h-4 text-emerald-700" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                        {lang === 'kn' ? `ಪ್ರಮಾಣಪತ್ರದ ${editSigs.length} ಅಧಿಕೃತ ಸಹಿದಾರರು (ಲಾಕ್ ಮಾಡಲಾಗಿದೆ):` : `${editSigs.length} Verified Signatories (Locked):`}
                      </h4>
                      <p className="text-[11px] text-stone-600">
                        {lang === 'kn'
                          ? 'ಎಲ್ಲಾ ಸಹಿದಾರರ ಹೆಸರು ಮತ್ತು ಸಹಿಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಲಾಕ್ ಮಾಡಲಾಗಿದೆ.'
                          : 'All signatory names and signatures are securely locked.'}
                      </p>
                    </div>
                  </div>

                  {onToggleLockSignatures && (
                    <button
                      type="button"
                      onClick={onToggleLockSignatures}
                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-2xs"
                    >
                      <Unlock className="w-3 h-3 text-amber-800" />
                      <span>{lang === 'kn' ? '🔓 ಅನ್‌ಲಾಕ್' : 'Unlock'}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {editSigs.map((sig, idx) => (
                    <div key={sig.id} className="bg-white p-3 rounded-2xl border border-emerald-200 text-xs space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded-md font-bold text-[11px] font-serif-kannada border border-emerald-200">
                          {idx + 1}. {sig.roleKn}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" />
                          <span>ದೃಢೀಕರಿಸಲಾಗಿದೆ</span>
                        </span>
                      </div>

                      <div>
                        <div className="font-bold text-stone-900 font-serif-kannada text-sm">
                          {sig.nameKn}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          {sig.name}
                        </div>
                        <div className="text-[11px] text-stone-700 font-medium mt-0.5">
                          {sig.designationKn || sig.roleKn}
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-stone-100">
                        <div className="h-12 w-full rounded-lg bg-stone-50 border border-stone-200 p-1 flex items-center justify-center overflow-hidden">
                          {sig.signatureImage ? (
                            <img src={sig.signatureImage} alt={sig.name} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="font-serif italic text-amber-900/80 text-xs font-bold">✍ {sig.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* UNLOCKED EDITABLE VIEW */
              <div className="space-y-3">
                <div className="flex items-center justify-between sticky top-0 bg-amber-50/95 pb-2 border-b border-amber-200 z-10 flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-amber-700" />
                      {lang === 'kn' ? `ಪ್ರಮಾಣಪತ್ರದಲ್ಲಿ ${editSigs.length} ಅಧಿಕೃತ ಸಹಿದಾರರು / ಸಮಿತಿ ಸದಸ್ಯರು:` : `${editSigs.length} Official Signatories / Committee Members:`}
                    </h4>
                    <p className="text-[11px] text-stone-600">
                      {lang === 'kn' 
                        ? 'ಸದಸ್ಯರನ್ನು ಸೇರಿಸಲು ಅಥವಾ ತೆಗೆದುಹಾಕಲು ಕೆಳಗಿನ ಬಟನ್‌ಗಳನ್ನು ಬಳಸಿ.' 
                        : 'Use the buttons below to add or remove members.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const newCount = editSigs.length + 1;
                        const newSig: CertificateSignatory = {
                          id: `sig-${Date.now()}`,
                          name: `Member ${newCount}`,
                          nameKn: `ಸದಸ್ಯರು ${newCount}`,
                          role: `Member ${newCount}`,
                          roleKn: `ಸದಸ್ಯರು`,
                          designation: `Committee Member`,
                          designationKn: `ಸಮಿತಿ ಸದಸ್ಯರು`
                        };
                        setEditSigs(prev => [...prev, newSig]);
                      }}
                      className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-amber-700" />
                      <span>{lang === 'kn' ? '+ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ' : '+ Add Member'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditSigs(DEFAULT_SIGNATORIES)}
                      className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{lang === 'kn' ? 'ಡೀಫಾಲ್ಟ್ ೬' : 'Reset to 6'}</span>
                    </button>

                    <button
                      onClick={() => {
                        handleSaveSignatories();
                        if (onToggleLockSignatures) {
                          onToggleLockSignatures();
                        }
                      }}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{lang === 'kn' ? 'ಉಳಿಸಿ & ಲಾಕ್ ಮಾಡಿ' : 'Save & Lock'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {editSigs.map((sig, idx) => (
                    <div key={sig.id} className="bg-white p-3 rounded-2xl border border-amber-200/80 text-xs space-y-2 shadow-2xs">
                      <div className="font-bold text-amber-900 flex items-center justify-between">
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold text-[11px]">
                          {idx + 1}. {sig.roleKn || sig.nameKn}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingSigForSignatureModal(sig)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold border border-amber-300 flex items-center gap-1 transition"
                          >
                            <PenTool className="w-3 h-3 text-amber-700" />
                            <span>{sig.signatureImage ? (lang === 'kn' ? 'ಸಹಿ ಬದಲಿಸಿ' : 'Change') : (lang === 'kn' ? 'ಸಹಿ' : 'Sign')}</span>
                          </button>

                          {editSigs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setEditSigs(prev => prev.filter(s => s.id !== sig.id))}
                              className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                              title={lang === 'kn' ? 'ಈ ಸದಸ್ಯರನ್ನು ತೆಗೆದುಹಾಕಿ' : 'Remove this member'}
                            >
                              <Trash2 className="w-3 h-3 text-rose-600" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-stone-600 block mb-0.5">
                          {lang === 'kn' ? 'ಹೆಸರು (ಕನ್ನಡ):' : 'Name (Kannada):'}
                        </label>
                        <input
                          type="text"
                          value={sig.nameKn}
                          onChange={e => {
                            const val = e.target.value;
                            setEditSigs(prev => prev.map((s, i) => i === idx ? { ...s, nameKn: val } : s));
                          }}
                          className="w-full px-2 py-1 border border-stone-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-stone-600 block mb-0.5">
                          {lang === 'kn' ? 'ಪದನಾಮ (ಕನ್ನಡ):' : 'Designation (Kannada):'}
                        </label>
                        <input
                          type="text"
                          value={sig.designationKn}
                          onChange={e => {
                            const val = e.target.value;
                            setEditSigs(prev => prev.map((s, i) => i === idx ? { ...s, designationKn: val } : s));
                          }}
                          className="w-full px-2 py-1 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      {/* Signature status indicator */}
                      <div className="pt-1 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
                        <span>{lang === 'kn' ? 'ಸಹಿ ಸ್ಥಿತಿ:' : 'Signature:'}</span>
                        {sig.signatureImage ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            ✓ {lang === 'kn' ? 'ಕಸ್ಟಮ್ ಸಹಿ ಸೇರಿಸಲಾಗಿದೆ' : 'Custom Image/Drawing'}
                          </span>
                        ) : (
                          <span className="italic text-stone-400">
                            {lang === 'kn' ? 'ಡೀಫಾಲ್ಟ್ ಕರ್ವ್ ಸಹಿ' : 'Default procedural'}
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

        {/* Certificate Canvas Preview Area */}
        <div className="flex-1 overflow-auto bg-stone-100 p-3 sm:p-6 flex items-center justify-center">
          <div className="relative shadow-2xl rounded-xl overflow-hidden border-2 border-stone-300/80 max-w-full bg-white">
            <canvas
              ref={canvasRef}
              className="w-full h-auto max-h-[64vh] object-contain block mx-auto"
            />
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-white border-t border-stone-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          
          {/* Navigation Between Participants */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              disabled={!hasPrev}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 text-stone-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'kn' ? 'ಹಿಂದಿನ' : 'Prev'}</span>
            </button>
            <span className="text-xs font-medium text-stone-500 px-2">
              {currentIndex + 1} / {allParticipants.length}
            </span>
            <button
              onClick={handleNext}
              disabled={!hasNext}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 text-stone-700"
            >
              <span className="hidden sm:inline">{lang === 'kn' ? 'ಮುಂದಿನ' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Theme Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500 hidden md:inline">
              {lang === 'kn' ? 'ಬಣ್ಣದ ಶೈಲಿ:' : 'Color Theme:'}
            </span>
            <select
              value={overrideTheme}
              onChange={e => setOverrideTheme(e.target.value as CertificateTheme | 'auto')}
              className="px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs bg-white text-stone-800 focus:ring-2 focus:ring-amber-500"
            >
              <option value="auto">
                {lang === 'kn' ? 'ಸ್ವಯಂಚಾಲಿತ (Auto - ರ್ಯಾಂಕ್ ಆಧಾರಿತ)' : 'Auto (Rank Based)'}
              </option>
              <option value="gold">
                🥇 {lang === 'kn' ? 'ಗೋಲ್ಡ್ & ವೈಟ್ (1st Prize)' : 'Gold & White (1st Prize)'}
              </option>
              <option value="silver">
                🥈 {lang === 'kn' ? 'ಸಿಲ್ವರ್ & ಸಫೈರ್ (2nd Prize)' : 'Silver & Sapphire (2nd Prize)'}
              </option>
              <option value="bronze">
                🥉 {lang === 'kn' ? 'ಕಂಚು & ಆಂಬರ್ (3rd Prize)' : 'Bronze & Amber (3rd Prize)'}
              </option>
              <option value="green">
                🎖️ {lang === 'kn' ? 'ಎಮರಾಲ್ಡ್ ಗ್ರೀನ್ & ಗೋಲ್ಡ್ (Participation)' : 'Emerald Green & Gold'}
              </option>
            </select>
          </div>

          {/* Download & Print Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'kn' ? 'ಪ್ರಿಂಟ್' : 'Print'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold shadow-sm hover:shadow flex items-center gap-2 transition disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {lang === 'kn' ? 'A4 Landscape PDF ಡೌನ್‌ಲೋಡ್' : 'Download A4 PDF'}
              </span>
            </button>
          </div>

        </div>

      </div>

      {/* Signature Editor Modal (Draw or Upload) */}
      <SignatureEditorModal
        isOpen={Boolean(editingSigForSignatureModal)}
        onClose={() => setEditingSigForSignatureModal(null)}
        lang={lang}
        signatory={editingSigForSignatureModal}
        onSaveSignature={handleSaveSignature}
      />
    </div>
  );
};
