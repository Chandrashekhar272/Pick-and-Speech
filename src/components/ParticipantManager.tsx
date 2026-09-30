import React, { useState } from 'react';
import { 
  UserPlus, 
  Users, 
  Trash2, 
  Play, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Clock, 
  BookOpen,
  Edit2,
  FileText,
  RefreshCw,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { Participant, Topic, Language, JudgeScore } from '../types';
import { CertificateModal } from './CertificateModal';

interface ParticipantManagerProps {
  lang: Language;
  participants: Participant[];
  onAddParticipant: (name: string, chestNo: number, schoolOrClass: string) => void;
  onBulkAddParticipants?: (list: Participant[], replace?: boolean) => void;
  onUpdateParticipantName?: (id: string, name: string, chestNo?: number) => void;
  onDeleteParticipant: (id: string) => void;
  onSelectForSpeech: (participant: Participant) => void;
  onOpenScoreForParticipant: (participant: Participant) => void;
  onLoadSampleParticipants: () => void;
  onClearAllParticipants: () => void;
  onForceSync?: () => Promise<void> | void;
}

export const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  lang,
  participants,
  onAddParticipant,
  onBulkAddParticipants,
  onUpdateParticipantName,
  onDeleteParticipant,
  onSelectForSpeech,
  onOpenScoreForParticipant,
  onLoadSampleParticipants,
  onClearAllParticipants,
  onForceSync
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [replaceOnBulk, setReplaceOnBulk] = useState(false);
  const [name, setName] = useState('');
  const [chestNo, setChestNo] = useState<number>(participants.length + 1);
  const [schoolOrClass, setSchoolOrClass] = useState('');
  const [certParticipant, setCertParticipant] = useState<Participant | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editChestNo, setEditChestNo] = useState<number>(1);
  const [editSchool, setEditSchool] = useState('');
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddParticipant(name.trim(), chestNo, schoolOrClass.trim() || (lang === 'kn' ? '( ಶಿಕ್ಷಕರ ಸಮಿತಿ )' : 'Teacher Committee'));
    setName('');
    setSchoolOrClass('');
    setChestNo(prev => prev + 1);
    setShowAddForm(false);
  };

  // Smart Bulk Parser for pasting 31+ members from WhatsApp / Sheets
  const parseBulkInput = (text: string): Participant[] => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed: Participant[] = [];
    let autoChest = 1;

    lines.forEach((line, idx) => {
      // Look for leading numbering e.g. "1) ...", "1. ...", "1 - ...", "#1 ..."
      const match = line.match(/^(?:#|\b)?(\d+)(?:[\.\)\-\:\s]+)(.*)$/);
      let chest = autoChest;
      let rawContent = line;

      if (match) {
        const parsedChest = parseInt(match[1], 10);
        if (!isNaN(parsedChest) && parsedChest > 0) {
          chest = parsedChest;
        }
        rawContent = match[2].trim();
      }

      // Check if there is school / committee in parenthesis or hyphen e.g. "ವಿದ್ಯಾವತಿ ಮಳೆಮಠ ( TLM & ಚಿತ್ರಕಲಾ ಶಿಕ್ಷಕರ ಸಮಿತಿ )"
      let namePart = rawContent;
      let schoolPart = '';

      const parenMatch = rawContent.match(/^(.*?)\s*(\(.*?\))\s*$/);
      if (parenMatch) {
        namePart = parenMatch[1].trim();
        schoolPart = parenMatch[2].trim();
      } else if (rawContent.includes(' - ')) {
        const parts = rawContent.split(' - ');
        namePart = parts[0].trim();
        schoolPart = parts.slice(1).join(' - ').trim();
      } else if (rawContent.includes(', ')) {
        const parts = rawContent.split(', ');
        namePart = parts[0].trim();
        schoolPart = parts.slice(1).join(', ').trim();
      }

      if (!namePart) namePart = rawContent;
      namePart = namePart.replace(/^[-–—•\s]+/, '').trim();

      parsed.push({
        id: `p-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        chestNo: chest,
        name: namePart,
        schoolOrClass: schoolPart || '( ಶಿಕ್ಷಕರ ಸಮಿತಿ )',
        status: 'waiting'
      });

      autoChest = Math.max(autoChest + 1, chest + 1);
    });

    return parsed;
  };

  const handleApplyBulk = () => {
    const parsedList = parseBulkInput(bulkText);
    if (parsedList.length === 0) return;

    if (onBulkAddParticipants) {
      onBulkAddParticipants(parsedList, replaceOnBulk);
    } else {
      parsedList.forEach(p => onAddParticipant(p.name, p.chestNo, p.schoolOrClass));
    }

    setBulkText('');
    setShowBulkModal(false);
    setSyncStatusMsg(lang === 'kn' ? `${parsedList.length} ಸದಸ್ಯರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಿ ಸರ್ವರ್‌ಗೆ ಸಿಂಕ್ ಮಾಡಲಾಗಿದೆ!` : `Successfully added and synced ${parsedList.length} participants!`);
    setTimeout(() => setSyncStatusMsg(null), 4000);
  };

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      if (onForceSync) {
        await onForceSync();
      }
      setSyncStatusMsg(lang === 'kn' ? `ಎಲ್ಲಾ ${participants.length} ಸ್ಪರ್ಧಿಗಳು ಲೈವ್ ಸರ್ವರ್‌ಗೆ ಸಿಂಕ್ ಆಗಿದ್ದಾರೆ!` : `All ${participants.length} participants synced to live server!`);
      setTimeout(() => setSyncStatusMsg(null), 3500);
    } catch {
      setSyncStatusMsg(lang === 'kn' ? 'ಸಿಂಕ್ ವಿಫಲವಾಗಿದೆ, ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.' : 'Sync failed, please retry.');
    } finally {
      setIsSyncing(false);
    }
  };

  const startEdit = (p: Participant) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditChestNo(p.chestNo);
    setEditSchool(p.schoolOrClass || '');
  };

  const saveEdit = (id: string) => {
    if (onUpdateParticipantName && editName.trim()) {
      onUpdateParticipantName(id, editName.trim(), editChestNo);
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-amber-700" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-amber-950 font-serif-kannada">
              {lang === 'kn' ? 'ಸ್ಪರ್ಧಿಗಳ ನೋಂದಣಿ & ಲೈವ್ ಸಿಂಕ್ ನಿರ್ವಹಣೆ' : 'Participant Registration & Live Sync'}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{participants.length} {lang === 'kn' ? 'ನೋಂದಾಯಿತ ಸ್ಪರ್ಧಿಗಳು' : 'Registered Participants'}</span>
            </span>
            <span className="text-xs text-stone-500 font-medium hidden sm:inline">
              • {lang === 'kn' ? 'ಎಲ್ಲಾ ಮೊಬೈಲ್ ಮತ್ತು ಶೇರ್ ಲಿಂಕ್‌ಗಳಿಗೆ ತಕ್ಷಣ ಸಿಂಕ್ ಆಗುತ್ತದೆ' : 'Syncs instantly to all shared judge devices'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Force Sync Button */}
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            title={lang === 'kn' ? 'ಶೇರ್ಡ್ ಆ್ಯಪ್ ಮತ್ತು ತೀರ್ಪುಗಾರರ ಫೋನ್‌ಗಳಿಗೆ ತಕ್ಷಣ ಸಿಂಕ್ ಮಾಡಿ' : 'Force sync all participants to shared app and judges'}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition flex items-center gap-1.5 shadow-2xs font-serif-kannada"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-800 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? (lang === 'kn' ? 'ಸಿಂಕ್ ಆಗುತ್ತಿದೆ...' : 'Syncing...') : (lang === 'kn' ? 'ಲೈವ್ ಸಿಂಕ್ (Sync Now)' : 'Sync to Server')}</span>
          </button>

          {/* Bulk Paste Button */}
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 transition flex items-center gap-1.5 shadow-2xs font-serif-kannada"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-700" />
            <span>{lang === 'kn' ? 'ಪಟ್ಟಿ ಅಂಟಿಸಿ (Bulk Paste)' : 'Bulk Paste List'}</span>
          </button>

          {/* Add Single Participant Button */}
          <button
            id="add-participant-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-xs transition flex items-center gap-1.5 font-serif-kannada"
          >
            <UserPlus className="w-4 h-4 text-amber-200" />
            <span>{lang === 'kn' ? 'ಹೊಸ ಸ್ಪರ್ಧಿ ಸೇರಿಸಿ' : 'Add Participant'}</span>
          </button>

          {participants.length > 0 && (
            confirmClearAll ? (
              <div className="flex items-center gap-1 animate-in fade-in">
                <button
                  onClick={() => {
                    onClearAllParticipants();
                    setConfirmClearAll(false);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1 shadow-xs font-serif-kannada"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === 'kn' ? 'ಖಚಿತ (ಎಲ್ಲರನ್ನೂ ತೆರವು)' : 'Confirm Clear'}</span>
                </button>
                <button
                  onClick={() => setConfirmClearAll(false)}
                  className="px-2 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClearAll(true)}
                className="px-3 py-2 rounded-xl text-xs font-medium text-stone-500 hover:text-rose-600 border border-stone-200 hover:border-rose-200 transition"
              >
                {lang === 'kn' ? 'ತೆರವುಗೊಳಿಸಿ' : 'Clear All'}
              </button>
            )
          )}
        </div>
      </div>

      {/* Sync Status Toast Notification */}
      {syncStatusMsg && (
        <div className="p-3 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{syncStatusMsg}</span>
        </div>
      )}

      {/* Bulk Add / Paste Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border-2 border-amber-300 animate-in fade-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center border border-indigo-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-amber-950 font-serif-kannada">
                    {lang === 'kn' ? 'ಸ್ಪರ್ಧಿಗಳ ಪಟ್ಟಿಯನ್ನು ಒಟ್ಟಿಗೆ ಅಂಟಿಸಿ (Bulk Paste)' : 'Bulk Paste Participant List'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {lang === 'kn' ? 'WhatsApp / Excel / Word ಪಟ್ಟಿಯಿಂದ ನೇರವಾಗಿ ಕಾಪಿ ಮಾಡಿ ಇಲ್ಲಿ ಪೇಸ್ಟ್ ಮಾಡಿ' : 'Paste from WhatsApp, Excel or Word directly'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 font-serif-kannada">
                {lang === 'kn' ? 'ಪ್ರತಿ ಸಾಲಿಗೆ ಒಬ್ಬ ಸ್ಪರ್ಧಿಯ ಹೆಸರು (ಉದಾ: 1) ವಿದ್ಯಾವತಿ ಮಳೆಮಠ - (TLM ಸಮಿತಿ)):' : 'Paste teacher names list (one per line):'}
              </label>
              <textarea
                rows={10}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`1) ವಿದ್ಯಾವತಿ ಮಳೆಮಠ ( TLM & ಚಿತ್ರಕಲಾ ಶಿಕ್ಷಕರ ಸಮಿತಿ )\n2) ಶೆಟ್ಟಿ ಆಶಾ ( ಮಕ್ಕಳ ಸಮಗ್ರ ವಿಕಾಸ ಸಮಿತಿ )\n3) ಕಸಪ್ಪ ಹಡಗಲಿ ( ಸಮಾಜ ಸೇವೆ ಮತ್ತು ಆರೋಗ್ಯ ಸಮಿತಿ )\n...`}
                className="w-full p-3.5 text-xs bg-stone-50 border border-stone-300 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono leading-relaxed"
              />
            </div>

            {bulkText.trim() && (
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 flex items-center justify-between">
                <span className="font-bold font-serif-kannada">
                  {lang === 'kn' 
                    ? `✓ ಒಟ್ಟು ${parseBulkInput(bulkText).length} ಸ್ಪರ್ಧಿಗಳ ಹೆಸರುಗಳು ಪತ್ತೆಯಾಗಿವೆ.` 
                    : `✓ Detected ${parseBulkInput(bulkText).length} participant records.`}
                </span>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={replaceOnBulk}
                    onChange={(e) => setReplaceOnBulk(e.target.checked)}
                    className="rounded text-amber-700 focus:ring-amber-500 w-4 h-4"
                  />
                  <span className="font-semibold text-stone-700">
                    {lang === 'kn' ? 'ಈಗಿರುವ ಪಟ್ಟಿಯನ್ನು ಬದಲಿಸಿ (Replace All)' : 'Replace Existing List'}
                  </span>
                </label>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
              >
                {lang === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleApplyBulk}
                disabled={!bulkText.trim()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-md transition flex items-center gap-1.5 font-serif-kannada disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'kn' ? 'ಪಟ್ಟಿಯನ್ನು ಸೇರಿಸಿ & ಸರ್ವರ್‌ಗೆ ಸಿಂಕ್ ಮಾಡಿ' : 'Save & Sync to Server'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Single Participant Modal / Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-amber-50/90 rounded-3xl p-6 border-2 border-amber-300 shadow-sm space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-amber-950 font-serif-kannada">
            {lang === 'kn' ? 'ಹೊಸ ಶಿಕ್ಷಕ ಸ್ಪರ್ಧಿಯ ವಿವರ ದಾಖಲಿಸಿ' : 'Register New Teacher Participant'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === 'kn' ? 'ಚೆಸ್ಟ್ ನಂಬರ್ (Chest No):' : 'Chest Number:'}
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={chestNo}
                onChange={(e) => setChestNo(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-serif-kannada">
                {lang === 'kn' ? 'ಶಿಕ್ಷಕರ ಪೂರ್ಣ ಹೆಸರು:' : 'Teacher Full Name:'}
              </label>
              <input
                type="text"
                placeholder={lang === 'kn' ? 'ಉದಾ: ಶ್ರೀಮತಿ ರತ್ನಮ್ಮ' : 'e.g., Smt. Ratnamma'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif-kannada"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 font-serif-kannada">
                {lang === 'kn' ? 'ಸಮಿತಿ / ಶಾಲೆ / ಜಿಲ್ಲೆ:' : 'Committee / School / District:'}
              </label>
              <input
                type="text"
                placeholder={lang === 'kn' ? 'ಉದಾ: ( ಮಹಿಳಾ ಶಿಕ್ಷಕರ ಸಮಿತಿ )' : 'e.g., Women Teachers Committee'}
                value={schoolOrClass}
                onChange={(e) => setSchoolOrClass(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif-kannada"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-800"
            >
              {lang === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-700 text-white hover:bg-amber-800 shadow-xs font-serif-kannada"
            >
              {lang === 'kn' ? 'ಸೇರಿಸಿ & ಸಿಂಕ್ ಮಾಡಿ' : 'Add & Sync'}
            </button>
          </div>
        </form>
      )}

      {/* Participants List */}
      {participants.length > 0 ? (
        <div className="bg-white rounded-3xl border-2 border-amber-200/90 shadow-sm overflow-hidden">
          <div className="p-4 bg-amber-50/70 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2 font-serif-kannada">
              <span className="text-xs font-bold text-amber-950">
                {lang === 'kn' ? `ನೋಂದಾಯಿತ ಒಟ್ಟು ಸ್ಪರ್ಧಿಗಳ ಪಟ್ಟಿ (${participants.length}):` : `Registered Participants (${participants.length}):`}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300">
              ● {lang === 'kn' ? 'ಲೈವ್ ಸಿಂಕ್ ಸಕ್ರಿಯವಾಗಿದೆ' : 'Live Synced'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">{lang === 'kn' ? 'ಚೆಸ್ಟ್ ನಂ.' : 'Chest #'}</th>
                  <th className="py-3 px-4">{lang === 'kn' ? 'ಶಿಕ್ಷಕರ ಹೆಸರು' : 'Teacher Name'}</th>
                  <th className="py-3 px-4">{lang === 'kn' ? 'ಸಮಿತಿ / ಸಂಸ್ಥೆ' : 'Committee / School'}</th>
                  <th className="py-3 px-4">{lang === 'kn' ? 'ಆಯ್ಕೆಯಾದ ವಿಷಯ' : 'Assigned Topic'}</th>
                  <th className="py-3 px-4">{lang === 'kn' ? 'ಅಂಕ (೫೦ ರಲ್ಲಿ)' : 'Score (/50)'}</th>
                  <th className="py-3 px-4 text-right">{lang === 'kn' ? 'ಕ್ರಮಗಳು' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {participants.map((p) => {
                  const hasScored = !!p.scores;
                  const isEditing = editingId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-amber-50/40 transition">
                      {/* Chest Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-900">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editChestNo}
                            onChange={(e) => setEditChestNo(parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 bg-white border border-amber-400 rounded-lg text-xs font-mono font-bold"
                          />
                        ) : (
                          <span>#{p.chestNo}</span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 font-semibold text-stone-900 font-serif-kannada">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-amber-400 rounded-lg text-xs font-bold"
                          />
                        ) : (
                          <span>{p.name}</span>
                        )}
                      </td>

                      {/* School / Committee */}
                      <td className="py-3.5 px-4 text-stone-600 font-serif-kannada">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editSchool}
                            onChange={(e) => setEditSchool(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-amber-400 rounded-lg text-xs"
                          />
                        ) : (
                          <span>{p.schoolOrClass}</span>
                        )}
                      </td>

                      {/* Topic */}
                      <td className="py-3.5 px-4">
                        {p.assignedTopic ? (
                          <div className="flex items-center gap-1.5 text-stone-800">
                            <span className="font-bold font-mono text-amber-700 text-xs">#{p.assignedTopic.number}</span>
                            <span className="line-clamp-1 max-w-xs font-medium font-serif-kannada">
                              {lang === 'kn' ? p.assignedTopic.titleKn : p.assignedTopic.titleEn}
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic text-xs font-serif-kannada">
                            {lang === 'kn' ? 'ಚೀಟಿ ಎತ್ತಿಲ್ಲ' : 'Not drawn yet'}
                          </span>
                        )}
                      </td>

                      {/* Scores */}
                      <td className="py-3.5 px-4">
                        {hasScored ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold font-mono text-xs">
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{p.scores?.total} / 50</span>
                          </div>
                        ) : (
                          <span className="text-stone-400 text-xs font-medium font-serif-kannada">
                            {lang === 'kn' ? 'ಅಂಕ ನೀಡಿಲ್ಲ' : 'Pending'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isEditing ? (
                            <button
                              onClick={() => saveEdit(p.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{lang === 'kn' ? 'ಉಳಿಸಿ' : 'Save'}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => startEdit(p)}
                              title={lang === 'kn' ? 'ಹೆಸರು ಬದಲಿಸಿ' : 'Edit name'}
                              className="p-1.5 rounded-lg text-stone-500 hover:text-amber-800 hover:bg-amber-100 transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Select for speech / timer */}
                          <button
                            onClick={() => onSelectForSpeech(p)}
                            title={lang === 'kn' ? 'ವೇದಿಕೆಗೆ ಕರೆಯಿರಿ (ಗಡಿಯಾರ ಆರಂಭಿಸಿ)' : 'Send to Stage & Timer'}
                            className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium text-xs flex items-center gap-1 transition"
                          >
                            <Play className="w-3.5 h-3.5 fill-amber-900" />
                            <span className="hidden md:inline">{lang === 'kn' ? 'ವೇದಿಕೆ' : 'Stage'}</span>
                          </button>

                          {/* Score Button */}
                          <button
                            onClick={() => onOpenScoreForParticipant(p)}
                            title={lang === 'kn' ? 'ತೀರ್ಪುಗಾರರ ಅಂಕ ನೀಡಿ' : 'Judge Score'}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs flex items-center gap-1 transition"
                          >
                            <Award className="w-3.5 h-3.5 text-stone-600" />
                            <span className="hidden md:inline">{lang === 'kn' ? 'ಅಂಕ' : 'Score'}</span>
                          </button>

                          {/* Certificate Button */}
                          <button
                            onClick={() => setCertParticipant(p)}
                            title={lang === 'kn' ? 'ಇ-ಪ್ರಮಾಣಪತ್ರ ವೀಕ್ಷಿಸಿ / ಡೌನ್‌ಲೋಡ್' : 'View / Download Certificate'}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium text-xs flex items-center gap-1 transition border border-emerald-200"
                          >
                            <Award className="w-3.5 h-3.5 text-emerald-700" />
                            <span className="hidden lg:inline">{lang === 'kn' ? 'ಪ್ರಮಾಣಪತ್ರ' : 'Certificate'}</span>
                          </button>

                          {/* Delete with inline confirmation */}
                          {confirmDeleteId === p.id ? (
                            <div className="flex items-center gap-1 animate-in fade-in">
                              <button
                                onClick={() => {
                                  onDeleteParticipant(p.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                                title={lang === 'kn' ? 'ಖಚಿತವಾಗಿ ತೆಗೆದುಹಾಕಿ' : 'Confirm delete'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{lang === 'kn' ? 'ಖಚಿತ' : 'Delete'}</span>
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(p.id)}
                              title={lang === 'kn' ? 'ತೆಗೆದುಹಾಕಿ' : 'Delete'}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 border border-dashed border-stone-300 text-center flex flex-col items-center justify-center">
          <Users className="w-12 h-12 text-stone-300 mb-3" />
          <h4 className="text-base font-bold text-stone-800 font-serif-kannada">
            {lang === 'kn' ? 'ಯಾವುದೇ ಸ್ಪರ್ಧಿಗಳನ್ನು ಸೇರಿಸಿಲ್ಲ' : 'No Participants Registered'}
          </h4>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mt-1">
            {lang === 'kn'
              ? 'ಹೊಸ ಸ್ಪರ್ಧಿಯನ್ನು ಸೇರಿಸಿ ಅಥವಾ "ಪಟ್ಟಿ ಅಂಟಿಸಿ (Bulk Paste)" ಮೂಲಕ ಎಲ್ಲಾ ಶಿಕ್ಷಕರ ಹೆಸರುಗಳನ್ನು ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಸೇರಿಸಿ.'
              : 'Add participants manually or click "Bulk Paste List" to add all teachers at once.'}
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-700 text-white hover:bg-amber-800 shadow-xs font-serif-kannada"
            >
              {lang === 'kn' ? 'ಪಟ್ಟಿ ಅಂಟಿಸಿ (Bulk Paste)' : 'Bulk Paste List'}
            </button>
            <button
              onClick={onLoadSampleParticipants}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200"
            >
              {lang === 'kn' ? '೫೦ ಮಾದರಿ ಶಿಕ್ಷಕರನ್ನು ಸೇರಿಸಿ' : 'Load 50 Sample Teachers'}
            </button>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={Boolean(certParticipant)}
        onClose={() => setCertParticipant(null)}
        lang={lang}
        participant={certParticipant}
        allParticipants={participants}
        schoolName="ಮೈಸೂರು"
      />
    </div>
  );
};
