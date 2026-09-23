import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  Lightbulb, 
  Upload, 
  Check, 
  Layers
} from 'lucide-react';
import { Topic, Category, DifficultyLevel, Language } from '../types';
import { CATEGORY_LABELS } from '../data/defaultTopics';

interface TopicManagerProps {
  lang: Language;
  topics: Topic[];
  onAddTopic: (newTopic: Omit<Topic, 'id' | 'number'>) => void;
  onBulkAddTopics: (titles: string[], category: Category, level: DifficultyLevel) => void;
  onDeleteTopic: (id: string) => void;
  onToggleTopicUsed: (id: string, isUsed: boolean) => void;
  onResetToDefault: () => void;
  onClearAllUsedStatus: () => void;
}

export const TopicManager: React.FC<TopicManagerProps> = ({
  lang,
  topics,
  onAddTopic,
  onBulkAddTopics,
  onDeleteTopic,
  onToggleTopicUsed,
  onResetToDefault,
  onClearAllUsedStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Add Single Topic State
  const [titleKn, setTitleKn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [category, setCategory] = useState<Category>('education');
  const [level, setLevel] = useState<DifficultyLevel>('open');
  const [hintsText, setHintsText] = useState('');

  // Bulk Import State
  const [bulkText, setBulkText] = useState('');
  const [bulkCategory, setBulkCategory] = useState<Category>('education');
  const [bulkLevel, setBulkLevel] = useState<DifficultyLevel>('open');

  const filteredTopics = useMemo(() => {
    return topics.filter(t => {
      const matchSearch = 
        t.titleKn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.number.toString() === searchTerm.trim();

      const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;
      const matchLevel = selectedLevel === 'all' || t.level === selectedLevel;

      return matchSearch && matchCategory && matchLevel;
    });
  }, [topics, searchTerm, selectedCategory, selectedLevel]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleKn.trim()) return;

    const hints = hintsText
      .split('\n')
      .map(h => h.trim())
      .filter(h => h.length > 0);

    onAddTopic({
      titleKn: titleKn.trim(),
      titleEn: titleEn.trim() || titleKn.trim(),
      category,
      level,
      hintsKn: hints.length > 0 ? hints : [titleKn.trim()],
      hintsEn: hints.length > 0 ? hints : [titleEn.trim() || titleKn.trim()],
      isUsed: false
    });

    setTitleKn('');
    setTitleEn('');
    setHintsText('');
    setShowAddModal(false);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) return;
    onBulkAddTopics(lines, bulkCategory, bulkLevel);
    setBulkText('');
    setShowBulkModal(false);
  };

  const usedCount = topics.filter(t => t.isUsed).length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              {lang === 'kn' ? 'ಭಾಷಣ ವಿಷಯಗಳ ಬ್ಯಾಂಕ್' : 'Speech Topic Bank'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {lang === 'kn'
              ? `ಒಟ್ಟು ${topics.length} ವಿಷಯಗಳು ಲಭ್ಯವಿದೆ. (${usedCount} ಚೀಟಿಗಳನ್ನು ಬಳಸಲಾಗಿದೆ)`
              : `Total ${topics.length} topics ready. (${usedCount} topics drawn/used)`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {usedCount > 0 && (
            <button
              onClick={onClearAllUsedStatus}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'kn' ? 'ಬಳಸಿದ ಚೀಟಿಗಳನ್ನು ಮರುಹೊಂದಿಸಿ' : 'Reset Used Flags'}</span>
            </button>
          )}

          <button
            onClick={() => setShowBulkModal(true)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 transition flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-amber-700" />
            <span>{lang === 'kn' ? 'ಒಂದೇ ಬಾರಿ ಅನೇಕ ವಿಷಯಗಳನ್ನು ಸೇರಿಸಿ' : 'Bulk Import'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-700 hover:bg-amber-800 text-white shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'kn' ? 'ಹೊಸ ವಿಷಯ ಸೇರಿಸಿ' : 'Add Single Topic'}</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm(lang === 'kn' ? 'ಆರಂಭಿಕ ೩೦ ವಿಷಯಗಳಿಗೆ ಮರುಹೊಂದಿಸಬೇಕೇ?' : 'Reset to default 30 topics?')) {
                onResetToDefault();
              }
            }}
            className="p-2 rounded-xl text-xs text-stone-400 hover:text-stone-700 hover:bg-stone-100 border border-stone-200 transition"
            title={lang === 'kn' ? 'ಡೀಫಾಲ್ಟ್ ವಿಷಯಗಳಿಗೆ ಮರುಹೊಂದಿಸಿ' : 'Reset to Defaults'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder={lang === 'kn' ? 'ವಿಷಯದ ಹೆಸರು ಅಥವಾ ಸಂಖ್ಯೆಯಿಂದ ಹುಡುಕಿ...' : 'Search by topic title or number...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {lang === 'kn' ? 'ಎಲ್ಲಾ ವರ್ಗ' : 'All Categories'}
            </button>
            {(Object.keys(CATEGORY_LABELS) as Category[]).map(key => {
              const cat = CATEGORY_LABELS[key];
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                    selectedCategory === key
                      ? 'bg-amber-700 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {lang === 'kn' ? cat.kn : cat.en}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic) => {
          const cat = CATEGORY_LABELS[topic.category] || CATEGORY_LABELS.education;
          return (
            <div
              key={topic.id}
              className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
                topic.isUsed
                  ? 'bg-stone-50 border-stone-200 opacity-60'
                  : 'bg-white border-amber-200/90 shadow-xs hover:border-amber-400 hover:shadow-sm'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-700 text-white font-mono font-bold text-xs flex items-center justify-center">
                      #{topic.number}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md border bg-amber-50 text-amber-900 border-amber-200">
                      {lang === 'kn' ? cat.kn : cat.en}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleTopicUsed(topic.id, !topic.isUsed)}
                    title={topic.isUsed ? (lang === 'kn' ? 'ಬಳಸಿಲ್ಲ ಎಂದು ಗುರುತಿಸಿ' : 'Mark as Unused') : (lang === 'kn' ? 'ಬಳಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ' : 'Mark as Used')}
                    className={`text-xs px-2 py-0.5 rounded-md font-medium border flex items-center gap-1 transition ${
                      topic.isUsed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{topic.isUsed ? (lang === 'kn' ? 'ಬಳಸಲಾಗಿದೆ' : 'Used') : (lang === 'kn' ? 'ಲಭ್ಯ' : 'Ready')}</span>
                  </button>
                </div>

                {/* Title */}
                <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug">
                  {topic.titleKn}
                </h3>
                <p className="text-xs text-stone-500 mt-1 italic">
                  {topic.titleEn}
                </p>

                {/* Hints / Points */}
                <div className="mt-3 pt-2.5 border-t border-stone-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-600" />
                    {lang === 'kn' ? 'ಮುಖ್ಯಾಂಶಗಳು:' : 'Talking Points:'}
                  </span>
                  <ul className="space-y-1 text-xs text-stone-600">
                    {(lang === 'kn' ? topic.hintsKn : topic.hintsEn).slice(0, 2).map((hint, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                        <span className="text-amber-600">•</span>
                        <span>{hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Delete Action */}
              <div className="mt-4 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-400 capitalize font-medium">
                  {topic.level}
                </span>
                <button
                  onClick={() => onDeleteTopic(topic.id)}
                  title={lang === 'kn' ? 'ಅಳಿಸಿ' : 'Delete'}
                  className="text-stone-400 hover:text-rose-600 p-1 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Single Topic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-amber-300 space-y-4">
            <h3 className="text-base font-bold text-stone-900">
              {lang === 'kn' ? 'ಹೊಸ ಭಾಷಣ ವಿಷಯ ಸೇರಿಸಿ' : 'Add New Speech Topic'}
            </h3>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'kn' ? 'ಕನ್ನಡದಲ್ಲಿ ವಿಷಯದ ಶೀರ್ಷಿಕೆ:' : 'Topic Title in Kannada:'}
              </label>
              <input
                type="text"
                required
                placeholder={lang === 'kn' ? 'ಉದಾ: ಶಾಲಾ ದಿನಗಳು ಮತ್ತು ಸ್ನೇಹ' : 'e.g. ಶಾಲಾ ದಿನಗಳು ಮತ್ತು ಸ್ನೇಹ'}
                value={titleKn}
                onChange={(e) => setTitleKn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'kn' ? 'ಇಂಗ್ಲಿಷ್ ಅನುವಾದ (Title in English):' : 'Topic Title in English:'}
              </label>
              <input
                type="text"
                placeholder="e.g. School Days and True Friendship"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'kn' ? 'ವರ್ಗ:' : 'Category:'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {(Object.keys(CATEGORY_LABELS) as Category[]).map(k => (
                    <option key={k} value={k}>
                      {lang === 'kn' ? CATEGORY_LABELS[k].kn : CATEGORY_LABELS[k].en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'kn' ? 'ಹಂತ:' : 'Level:'}
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as DifficultyLevel)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="primary">{lang === 'kn' ? 'ಪ್ರಾಥಮಿಕ (Primary)' : 'Primary'}</option>
                  <option value="highschool">{lang === 'kn' ? 'ಪ್ರೌಢಶಾಲೆ (High School)' : 'High School'}</option>
                  <option value="open">{lang === 'kn' ? 'ಮುಕ್ತ / ಸಾರ್ವತ್ರಿಕ (Open)' : 'Open'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'kn' ? 'ಮಾತನಾಡಲು ಮುಖ್ಯ ಮುಖ್ಯಾಂಶಗಳು (ಪ್ರತಿ ಸಾಲಿನಲ್ಲಿ ಒಂದೊಂದು):' : 'Key Speaking Hints (one per line):'}
              </label>
              <textarea
                rows={3}
                placeholder={lang === 'kn' ? "ಮುಖ್ಯ ಅಂಶ ೧\nಮುಖ್ಯ ಅಂಶ ೨" : "Key point 1\nKey point 2"}
                value={hintsText}
                onChange={(e) => setHintsText(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800"
              >
                {lang === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-amber-700 text-white rounded-xl hover:bg-amber-800 shadow-xs"
              >
                {lang === 'kn' ? 'ವಿಷಯ ಸೇರಿಸಿ' : 'Save Topic'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <form onSubmit={handleBulkSubmit} className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-amber-300 space-y-4">
            <h3 className="text-base font-bold text-stone-900">
              {lang === 'kn' ? 'ಒಂದೇ ಬಾರಿ ಅನೇಕ ವಿಷಯಗಳನ್ನು ಸೇರಿಸಿ (Bulk Import)' : 'Bulk Import Topics'}
            </h3>
            <p className="text-xs text-stone-600">
              {lang === 'kn'
                ? 'ಪ್ರತಿ ಸಾಲಿನಲ್ಲಿ ಒಂದೊಂದು ಭಾಷಣ ವಿಷಯವನ್ನು ಪೇಸ್ಟ್ ಮಾಡಿ.'
                : 'Paste a list of speech topics, one per line.'}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'kn' ? 'ವರ್ಗ:' : 'Category:'}
                </label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {(Object.keys(CATEGORY_LABELS) as Category[]).map(k => (
                    <option key={k} value={k}>
                      {lang === 'kn' ? CATEGORY_LABELS[k].kn : CATEGORY_LABELS[k].en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'kn' ? 'ಹಂತ:' : 'Level:'}
                </label>
                <select
                  value={bulkLevel}
                  onChange={(e) => setBulkLevel(e.target.value as DifficultyLevel)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="primary">{lang === 'kn' ? 'ಪ್ರಾಥಮಿಕ' : 'Primary'}</option>
                  <option value="highschool">{lang === 'kn' ? 'ಪ್ರೌಢಶಾಲೆ' : 'High School'}</option>
                  <option value="open">{lang === 'kn' ? 'ಮುಕ್ತ' : 'Open'}</option>
                </select>
              </div>
            </div>

            <div>
              <textarea
                rows={6}
                required
                placeholder={lang === 'kn' 
                  ? "ನನ್ನ ಮೆಚ್ಚಿನ ಶಿಕ್ಷಕರು\nಪರಿಸರ ಸಂರಕ್ಷಣೆಯ ಅಗತ್ಯ\nಕನ್ನಡ ಸಾಹಿತ್ಯದ ಹಿರಿಮೆ"
                  : "My Favorite Teacher\nProtecting the Environment\nImportance of Sports"}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800"
              >
                {lang === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-amber-700 text-white rounded-xl hover:bg-amber-800 shadow-xs"
              >
                {lang === 'kn' ? 'ಸೇರಿಸಿ' : 'Import All'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
