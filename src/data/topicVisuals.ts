export interface TopicVisual {
  topicNumber: number;
  eraKn: string;
  eraEn: string;
  symbol: 'crown' | 'sword' | 'scroll' | 'temple' | 'palace' | 'flag' | 'river' | 'rocket' | 'lamp' | 'feather' | 'drum';
  quoteKn: string;
  heritageBadgeKn: string;
  gradient: string;
  bgTint: string;
  borderTint: string;
  accentText: string;
}

export const TOPIC_VISUALS: Record<number, TopicVisual> = {
  1: {
    topicNumber: 1,
    eraKn: 'ಗುರು ತತ್ವ • ಜ್ಞಾನಜ್ಯೋತಿ',
    eraEn: 'Light of Knowledge • Guru Principle',
    symbol: 'lamp',
    quoteKn: '“ಗುರುಬ್ರಹ್ಮ ಗುರುರ್ವಿಷ್ಣುಃ ಗುರುರ್ದೇವೋ ಮಹೇಶ್ವರಃ • ಗುರು ಸಾಕ್ಷಾತ್ ಪರಬ್ರಹ್ಮ ತಸ್ಮೈ ಶ್ರೀಗುರವೇ ನಮಃ”',
    heritageBadgeKn: 'ಶಿಕ್ಷಕರ ಮಹತ್ವ • ಜ್ಞಾನಜ್ಯೋತಿ',
    gradient: 'from-amber-600 via-yellow-600 to-amber-700',
    bgTint: 'bg-amber-50/90',
    borderTint: 'border-amber-400',
    accentText: 'text-amber-900'
  },
  2: {
    topicNumber: 2,
    eraKn: 'ದಾಸ ಸಾಹಿತ್ಯ & ಆಧ್ಯಾತ್ಮಿಕ ಪರಂಪರೆ',
    eraEn: 'Bhakti Tradition & Spiritual Wisdom',
    symbol: 'scroll',
    quoteKn: '“ಗುರುವಿನ ಗುಲಾಮನಾಗುವ ತನಕ ದೊರೆಯದಣ್ಣ ಮುಕುತಿ - ಪುರಂದರದಾಸರು”',
    heritageBadgeKn: 'ಗುರು ಮಹಿಮೆ • ದಾಸ ಸಂದೇಶ',
    gradient: 'from-orange-600 via-amber-600 to-yellow-600',
    bgTint: 'bg-orange-50/90',
    borderTint: 'border-orange-400',
    accentText: 'text-orange-950'
  },
  3: {
    topicNumber: 3,
    eraKn: 'ವ್ಯಕ್ತಿತ್ವ ವಿಕಸನ & ಸದ್ಗುಣ ಸಂಪತ್ತು',
    eraEn: 'Value Education & Noble Character',
    symbol: 'feather',
    quoteKn: '“ತಲೆಗೆ ಜ್ಞಾನ, ಹೃದಯಕ್ಕೆ ಕರುಣೆ, ಕೈಗೆ ಕೌಶಲ್ಯ ನೀಡುವುದೇ ನಿಜವಾದ ಶಿಕ್ಷಣ - ಸ್ವಾಮಿ ವಿವೇಕಾನಂದ”',
    heritageBadgeKn: 'ಮೌಲ್ಯ ಶಿಕ್ಷಣ • ಸದ್ಗುಣ',
    gradient: 'from-emerald-700 via-teal-600 to-green-700',
    bgTint: 'bg-emerald-50/90',
    borderTint: 'border-emerald-400',
    accentText: 'text-emerald-950'
  },
  4: {
    topicNumber: 4,
    eraKn: 'ಸಾಹಿತ್ಯ ಸಾಗರ & ವಾಚನಾಭ್ಯಾಸ',
    eraEn: 'Habit of Reading & Intellectual Wealth',
    symbol: 'scroll',
    quoteKn: '“ಒಳ್ಳೆಯ ಪುಸ್ತಕವೊಂದನ್ನು ಓದುವುದೆಂದರೆ ಮಹಾನ್ ಚೇತನದೊಂದಿಗೆ ಸಂಭಾಷಿಸಿದಂತೆ”',
    heritageBadgeKn: 'ಪುಸ್ತಕ ಸಂಸ್ಕೃತಿ • ವಾಚನಾಭ್ಯಾಸ',
    gradient: 'from-blue-700 via-indigo-600 to-blue-800',
    bgTint: 'bg-blue-50/90',
    borderTint: 'border-blue-400',
    accentText: 'text-blue-950'
  },
  5: {
    topicNumber: 5,
    eraKn: 'ಮನೋಬಲ & ವಿಜಯ ಸಂಕಲ್ಪ',
    eraEn: 'Courage & Self-Confidence',
    symbol: 'sword',
    quoteKn: '“ಎದ್ದೇಳಿ, ಗುರಿ ಮುಟ್ಟುವ ತನಕ ನಿಲ್ಲದಿರಿ - ಸ್ವಾಮಿ ವಿವೇಕಾನಂದ”',
    heritageBadgeKn: 'ಆತ್ಮವಿಶ್ವಾಸ • ವಿಜಯ ಸಂಕಲ್ಪ',
    gradient: 'from-red-600 via-rose-600 to-amber-600',
    bgTint: 'bg-red-50/90',
    borderTint: 'border-red-400',
    accentText: 'text-red-950'
  },
  6: {
    topicNumber: 6,
    eraKn: 'ರಾಷ್ಟ್ರೀಯ ಸೌಹಾರ್ದ & ಸಾಮರಸ್ಯ',
    eraEn: 'National Solidarity & Unity',
    symbol: 'flag',
    quoteKn: '“ಒಂದೇ ತಾಯಿ ಮಕ್ಕಳಂತೆ ಬಾಳೋಣ • ಕೂಡಿ ಬಾಳಿದರೆ ಸ್ವರ್ಗ ಸುಖ”',
    heritageBadgeKn: 'ಏಕತೆಯ ಶಕ್ತಿ • ಸೌಹಾರ್ದ',
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    bgTint: 'bg-amber-50/90',
    borderTint: 'border-amber-400',
    accentText: 'text-amber-950'
  },
  7: {
    topicNumber: 7,
    eraKn: 'ಆಯುರ್ವೇದ & ಯೋಗ ಪರಂಪರೆ',
    eraEn: 'Yoga, Wellness & Balanced Life',
    symbol: 'river',
    quoteKn: '“ಆರೋಗ್ಯವೇ ಮಹಾಭಾಗ್ಯ • ಶರೀರಮಾದ್ಯಂ ಖಲು ಧರ್ಮಸಾಧನಮ್”',
    heritageBadgeKn: 'ಆರೋಗ್ಯ ಜೀವನ • ಯೋಗಾಸನ',
    gradient: 'from-teal-600 via-emerald-600 to-cyan-700',
    bgTint: 'bg-teal-50/90',
    borderTint: 'border-teal-400',
    accentText: 'text-teal-950'
  },
  8: {
    topicNumber: 8,
    eraKn: 'ವಾತ್ಸಲ್ಯ ಮೈತ್ರಿ & ಸಹಾನುಭೂತಿ',
    eraEn: 'Compassion & Teacher-Child Bond',
    symbol: 'feather',
    quoteKn: '“ಪ್ರೀತಿ ಇಲ್ಲದ ಶಿಕ್ಷಣ ಪರಿಪೂರ್ಣವಾಗದು • ಮಗುವಿನ ಮುಗುಳುನಗೆಯೇ ಗುರುವಿನ ಸಾರ್ಥಕತೆ”',
    heritageBadgeKn: 'ಗುರು-ಶಿಷ್ಯ ಸ್ನೇಹ • ವಾತ್ಸಲ್ಯ',
    gradient: 'from-pink-600 via-rose-500 to-amber-600',
    bgTint: 'bg-pink-50/90',
    borderTint: 'border-pink-400',
    accentText: 'text-pink-950'
  },
  9: {
    topicNumber: 9,
    eraKn: 'ಡಿಜಿಟಲ್ ಕ್ರಾಂತಿ & ನವೀನ ಶಿಕ್ಷಣ',
    eraEn: 'Digital Revolution & Smart Classroom',
    symbol: 'rocket',
    quoteKn: '“ತಂತ್ರಜ್ಞಾನವು ಸಮರ್ಥ ಶಿಕ್ಷಕರ ಕೈಯಲ್ಲಿ ಅದ್ಭುತ ಪರಿವರ್ತನಾ ಶಕ್ತಿಯಾಗಬಲ್ಲದು”',
    heritageBadgeKn: 'ಸ್ಮಾರ್ಟ್ ಶಿಕ್ಷಣ • ನವೀನ ತಂತ್ರಜ್ಞಾನ',
    gradient: 'from-cyan-700 via-blue-600 to-indigo-700',
    bgTint: 'bg-cyan-50/90',
    borderTint: 'border-cyan-400',
    accentText: 'text-cyan-950'
  },
  10: {
    topicNumber: 10,
    eraKn: 'ಗ್ರಾಮೀಣ ವಿಕಾಸ & ಸಮುದಾಯ ಶಕ್ತಿ',
    eraEn: 'School-Community Joint Partnership',
    symbol: 'temple',
    quoteKn: '“ಶಾಲೆ ಬೆಳೆದರೆ ಊರು ಬೆಳೆಯುತ್ತದೆ • ಸಮುದಾಯದ ಹೆಮ್ಮೆಯೇ ಶಾಲೆಯ ಹಿರಿಮೆ”',
    heritageBadgeKn: 'ಶಾಲೆ-ಸಮುದಾಯ • ಜಂಟಿ ಸೇತುವೆ',
    gradient: 'from-amber-700 via-stone-600 to-amber-800',
    bgTint: 'bg-stone-50/90',
    borderTint: 'border-amber-400',
    accentText: 'text-stone-900'
  },
  11: {
    topicNumber: 11,
    eraKn: 'ವಿದ್ಯಾರ್ಥಿ ಲಕ್ಷಣ & ಶಿಸ್ತು',
    eraEn: 'Ideal Student & Discipline',
    symbol: 'crown',
    quoteKn: '“ವಿದ್ಯಾದದಾತಿ ವಿನಯಂ ವಿನಯಾದ್ಯಾತಿ ಪಾತ್ರತಾಮ್ • ವಿನಯವೇ ವಿದ್ಯಾರ್ಥಿಯ ಶ್ರೇಷ್ಠ ಆಭರಣ”',
    heritageBadgeKn: 'ಆದರ್ಶ ವಿದ್ಯಾರ್ಥಿ • ಶಿಸ್ತು',
    gradient: 'from-violet-700 via-purple-600 to-indigo-700',
    bgTint: 'bg-purple-50/90',
    borderTint: 'border-purple-400',
    accentText: 'text-purple-950'
  },
  12: {
    topicNumber: 12,
    eraKn: 'ನೆನಪಿನ ಮಂದಾರ & ಕೃತಜ್ಞತೆ',
    eraEn: 'Inspiring Mentor & Heartfelt Gratitude',
    symbol: 'feather',
    quoteKn: '“ಒಬ್ಬ ಉತ್ತಮ ಶಿಕ್ಷಕ ಹೃದಯವನ್ನು ತಟ್ಟಿ, ಮನಸ್ಸನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತಾನೆ”',
    heritageBadgeKn: 'ನೆಚ್ಚಿನ ಗುರುಗಳು • ಕೃತಜ್ಞತೆ',
    gradient: 'from-amber-600 via-red-500 to-amber-700',
    bgTint: 'bg-amber-50/90',
    borderTint: 'border-amber-400',
    accentText: 'text-amber-950'
  },
  13: {
    topicNumber: 13,
    eraKn: 'ಜ್ಞಾನದೀವಟಿಗೆ & ಸಾಮಾಜಿಕ ಹೊಣೆ',
    eraEn: 'Pillars of Social Transformation',
    symbol: 'lamp',
    quoteKn: '“ಶಿಕ್ಷಕರು ಉರಿಯುವ ಮೇಣದಬತ್ತಿಯಂತೆ, ತಾನು ಕರಗುತ್ತಾ ಇತರರಿಗೆ ಬೆಳಕು ನೀಡುತ್ತಾರೆ”',
    heritageBadgeKn: 'ಶಿಕ್ಷಕರ ಮಹತ್ವ • ಬೆಳಕಿನ ದೀವಟಿಗೆ',
    gradient: 'from-yellow-600 via-amber-600 to-orange-700',
    bgTint: 'bg-yellow-50/90',
    borderTint: 'border-yellow-400',
    accentText: 'text-amber-950'
  },
  14: {
    topicNumber: 14,
    eraKn: 'ರಾಷ್ಟ್ರೀಯ ಶಿಕ್ಷಣ ಆಯೋಗ & ಶಿಲ್ಪಿಗಳು',
    eraEn: 'Architects of Societal Transformation',
    symbol: 'temple',
    quoteKn: '“ಭಾರತದ ಭವಿಷ್ಯವು ಅದರ ತರಗತಿ ಕೋಣೆಗಳಲ್ಲಿ ರೂಪುಗೊಳ್ಳುತ್ತಿದೆ - ಕೊಠಾರಿ ಆಯೋಗ”',
    heritageBadgeKn: 'ಸಮಾಜದ ಶಿಲ್ಪಿಗಳು • ನವ ನಿರ್ಮಾಣ',
    gradient: 'from-stone-700 via-amber-700 to-red-700',
    bgTint: 'bg-stone-50/90',
    borderTint: 'border-stone-400',
    accentText: 'text-stone-900'
  },
  15: {
    topicNumber: 15,
    eraKn: 'ಪ್ರಾಚೀನ ಗುರುಕುಲ & ಶ್ರದ್ಧಾ ಸಂಸ್ಕೃತಿ',
    eraEn: 'Sacred Guru-Shishya Confluence',
    symbol: 'scroll',
    quoteKn: '“ಶ್ರದ್ಧಾವಾನ್ ಲಭತೇ ಜ್ಞಾನಮ್ • ಶ್ರದ್ಧೆಯಿಂದ ಮಾತ್ರ ದೈವಿಕ ವಿದ್ಯೆ ಸಿದ್ಧಿಸುತ್ತದೆ”',
    heritageBadgeKn: 'ಗುರು-ಶಿಷ್ಯ ಪರಂಪರೆ • ಶ್ರದ್ಧೆ',
    gradient: 'from-amber-700 via-orange-600 to-yellow-600',
    bgTint: 'bg-amber-50/90',
    borderTint: 'border-amber-400',
    accentText: 'text-amber-950'
  },
  16: {
    topicNumber: 16,
    eraKn: 'ವ್ಯಕ್ತಿ ನಿರ್ಮಾಣ & ಜೀವನ ಪಯಣ',
    eraEn: 'Sculpting Personality & Character',
    symbol: 'lamp',
    quoteKn: '“ನಾನು ಬದುಕಲು ತಂದೆ-ತಾಯಿಗೆ ಋಣಿ, ಸುಂದರವಾಗಿ ಬದುಕಲು ಶಿಕ್ಷಕರಿಗೆ ಋಣಿ - ಅಲೆಕ್ಸಾಂಡರ್”',
    heritageBadgeKn: 'ಜೀವನದಲ್ಲಿ ಶಿಕ್ಷಕರು • ಮಾರ್ಗದರ್ಶನ',
    gradient: 'from-blue-600 via-indigo-600 to-purple-700',
    bgTint: 'bg-blue-50/90',
    borderTint: 'border-blue-400',
    accentText: 'text-blue-950'
  },
  17: {
    topicNumber: 17,
    eraKn: 'ಆದರ್ಶ ಬೋಧನೆ & ನಿಸ್ವಾರ್ಥತೆ',
    eraEn: 'Exemplary Teaching & Infinite Patience',
    symbol: 'crown',
    quoteKn: '“ಸಾಮಾನ್ಯ ಶಿಕ್ಷಕ ಹೇಳುತ್ತಾನೆ, ಉತ್ತಮ ಶಿಕ್ಷಕ ವಿವರಿಸುತ್ತಾನೆ, ಶ್ರೇಷ್ಠ ಶಿಕ್ಷಕ ಪ್ರೇರೇಪಿಸುತ್ತಾನೆ”',
    heritageBadgeKn: 'ಉತ್ತಮ ಶಿಕ್ಷಕ • ಪ್ರೇರಕ ಚೇತನ',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    bgTint: 'bg-emerald-50/90',
    borderTint: 'border-emerald-400',
    accentText: 'text-emerald-950'
  },
  18: {
    topicNumber: 18,
    eraKn: 'ಸಂಸ್ಕಾರ ಸಿರಿ & ಬದುಕಿನ ಮೌಲ್ಯ',
    eraEn: 'Enduring Life Lessons & Values',
    symbol: 'feather',
    quoteKn: '“ಶಿಕ್ಷಕರು ಕಲಿಸುವ ಜೀವನ ಪಾಠಗಳು ಎಂದಿಗೂ ಅಳಿಸಿಹೋಗದ ಅಮೂಲ್ಯ ರತ್ನಗಳು”',
    heritageBadgeKn: 'ಜೀವನ ಪಾಠಗಳು • ಸಂಸ್ಕಾರ',
    gradient: 'from-amber-700 via-yellow-600 to-amber-600',
    bgTint: 'bg-amber-50/90',
    borderTint: 'border-amber-400',
    accentText: 'text-amber-900'
  },
  19: {
    topicNumber: 19,
    eraKn: 'ಡಾ. ಸರ್ವೇಪಲ್ಲಿ ರಾಧಾಕೃಷ್ಣನ್ ಯುಗ',
    eraEn: 'Dr. Radhakrishnan Legacy & Teachers Day',
    symbol: 'flag',
    quoteKn: '“ಶಿಕ್ಷಕರು ದೇಶದ ಅತ್ಯಂತ ಪ್ರಕಾಶಮಾನವಾದ ಜ್ಞಾನಜ್ಯೋತಿಗಳು - ಡಾ. ಸರ್ವೇಪಲ್ಲಿ ರಾಧಾಕೃಷ್ಣನ್”',
    heritageBadgeKn: 'ಶಿಕ್ಷಕರ ದಿನಾಚರಣೆ • ಸೆಪ್ಟೆಂಬರ್ ೫',
    gradient: 'from-red-600 via-amber-600 to-yellow-600',
    bgTint: 'bg-red-50/90',
    borderTint: 'border-red-400',
    accentText: 'text-red-950'
  },
  20: {
    topicNumber: 20,
    eraKn: 'ಉಪನಿಷತ್ ಸಂದೇಶ & ಜ್ಞಾನೋದಯ',
    eraEn: 'Tamasoma Jyotirgamaya • Dawn of Wisdom',
    symbol: 'lamp',
    quoteKn: '“ತಮಸೋಮಾ ಜ್ಯೋತಿರ್ಗಮಯ • ಅಜ್ಞಾನದ ಕತ್ತಲೆಯನ್ನು ನೀಗಿಸುವವನೇ ಸದ್ಗುರು”',
    heritageBadgeKn: 'ಶಿಕ್ಷಣದ ಬೆಳಕು • ತಮಸೋಮಾ ಜ್ಯೋತಿರ್ಗಮಯ',
    gradient: 'from-yellow-500 via-amber-600 to-orange-600',
    bgTint: 'bg-amber-50/90',
    borderTint: 'border-amber-400',
    accentText: 'text-amber-950'
  },
  21: {
    topicNumber: 21,
    eraKn: 'ದೇಶಪ್ರೇಮ & ನವ ಭಾರತ ನಿರ್ಮಾಣ',
    eraEn: 'Patriotism & Nation Building Force',
    symbol: 'flag',
    quoteKn: '“ಶಿಕ್ಷಕರು ದೇಶದ ಶಕ್ತಿಶಾಲಿ ಅಡಿಪಾಯ • ರಾಷ್ಟ್ರದ ಭವ್ಯ ಭವಿಷ್ಯ ಅವರ ಕೈಯಲ್ಲಿದೆ”',
    heritageBadgeKn: 'ರಾಷ್ಟ್ರ ನಿರ್ಮಾಣ • ದೇಶಪ್ರೇಮ',
    gradient: 'from-orange-600 via-amber-600 to-green-700',
    bgTint: 'bg-orange-50/90',
    borderTint: 'border-orange-400',
    accentText: 'text-orange-950'
  },
  22: {
    topicNumber: 22,
    eraKn: 'ಮಾಹಿತಿ ತಂತ್ರಜ್ಞಾನ & ವಿವೇಕದ ಸ್ಪರ್ಶ',
    eraEn: 'Digital Wisdom & Cyber Guidance',
    symbol: 'rocket',
    quoteKn: '“ತಂತ್ರಜ್ಞಾನ ಕೇವಲ ಒಂದು ಸಾಧನ, ಮಕ್ಕಳ ಹೃದಯ ತಟ್ಟಲು ಶಿಕ್ಷಕರೇ ಅನಿವಾರ್ಯ”',
    heritageBadgeKn: 'ಡಿಜಿಟಲ್ ಯುಗ • ತಾಂತ್ರಿಕ ಶಿಕ್ಷಕ',
    gradient: 'from-indigo-600 via-blue-600 to-cyan-600',
    bgTint: 'bg-indigo-50/90',
    borderTint: 'border-indigo-400',
    accentText: 'text-indigo-950'
  },
  23: {
    topicNumber: 23,
    eraKn: 'ಸಮಗ್ರ ವ್ಯಕ್ತಿತ್ವ & ತ್ರಿಕೋನ ವಿಕಾಸ (3H)',
    eraEn: 'Head, Heart & Hand • Integral Education',
    symbol: 'crown',
    quoteKn: '“ಮಗುವಿನ ದೇಹ, ಮನಸ್ಸು ಮತ್ತು ಆತ್ಮದಲ್ಲಿರುವ ಅತ್ಯುತ್ತಮವಾದುದನ್ನು ಹೊರತೆಗೆಯುವುದೇ ಶಿಕ್ಷಣ - ಮಹಾತ್ಮ ಗಾಂಧಿ”',
    heritageBadgeKn: 'ಸರ್ವಾಂಗೀಣ ವಿಕಾಸ • ಸಮಗ್ರ ಶಿಕ್ಷಣ',
    gradient: 'from-violet-700 via-purple-600 to-rose-600',
    bgTint: 'bg-purple-50/90',
    borderTint: 'border-purple-400',
    accentText: 'text-purple-950'
  },
  24: {
    topicNumber: 24,
    eraKn: 'ತೈತ್ತಿರೀಯ ಉಪನಿಷತ್ ಪರಂಪರೆ',
    eraEn: 'Matru Devo Bhava • Acharya Devo Bhava',
    symbol: 'temple',
    quoteKn: '“ಮಾತೃದೇವೋ ಭವ, ಪಿತೃದೇವೋ ಭವ, ಆಚಾರ್ಯದೇವೋ ಭವ - ತೈತ್ತಿರೀಯ ಉಪನಿಷತ್”',
    heritageBadgeKn: 'ಗುರು ಗೌರವ • ಕೃತಜ್ಞತೆ',
    gradient: 'from-amber-700 via-yellow-600 to-amber-800',
    bgTint: 'bg-amber-50/90',
    borderTint: 'border-amber-400',
    accentText: 'text-amber-950'
  },
  25: {
    topicNumber: 25,
    eraKn: 'ಸ್ನೇಹಪರ ಕಲಿಕೆ & ಆತ್ಮೀಯತೆ',
    eraEn: 'Mutual Trust & Classroom Harmony',
    symbol: 'feather',
    quoteKn: '“ಪ್ರೀತಿ ಮತ್ತು ವಿಶ್ವಾಸದಿಂದ ಕಟ್ಟಿದ ಸಂಬಂಧವೇ ಪರಿಪೂರ್ಣ ಶಿಕ್ಷಣದ ಜೀವಾಳ”',
    heritageBadgeKn: 'ಶಿಕ್ಷಕ-ವಿದ್ಯಾರ್ಥಿ ಬಾಂಧವ್ಯ • ವಿಶ್ವಾಸ',
    gradient: 'from-rose-600 via-pink-600 to-amber-600',
    bgTint: 'bg-rose-50/90',
    borderTint: 'border-rose-400',
    accentText: 'text-rose-950'
  },
  26: {
    topicNumber: 26,
    eraKn: 'ದಾರಿದೀಪ & ಸನ್ಮಾರ್ಗ ಬೋಧನೆ',
    eraEn: 'Guiding Light & Moral Compass',
    symbol: 'lamp',
    quoteKn: '“ದೀಪದಿಂದ ದೀಪವನು ಹಚ್ಚಬೇಕು • ಜ್ಞಾನದ ದೀವಟಿಗೆಯ ಹಿಡಿದು ಸಾಗಬೇಕು”',
    heritageBadgeKn: 'ದಾರಿದೀಪ • ಜ್ಞಾನ ಮಾರ್ಗ',
    gradient: 'from-amber-600 via-yellow-500 to-red-600',
    bgTint: 'bg-amber-50/90',
    borderTint: 'border-amber-400',
    accentText: 'text-amber-950'
  },
  27: {
    topicNumber: 27,
    eraKn: 'ಭಾರತ ಭಾಗ್ಯವಿಧಾತರು & ಶಿಕ್ಷಕರು',
    eraEn: 'Nation Builders & Social Architects',
    symbol: 'flag',
    quoteKn: '“ಒಂದು ದೇಶದ ಮಹತ್ವವು ಅಲ್ಲಿನ ಶಿಕ್ಷಕರ ಶ್ರೇಷ್ಠತೆಯಿಂದ ಅಳೆಯಲ್ಪಡುತ್ತದೆ”',
    heritageBadgeKn: 'ರಾಷ್ಟ್ರ ನಿರ್ಮಾತೃಗಳು • ದೇಶಸೇವೆ',
    gradient: 'from-red-600 via-amber-600 to-emerald-700',
    bgTint: 'bg-red-50/90',
    borderTint: 'border-red-400',
    accentText: 'text-red-950'
  },
  28: {
    topicNumber: 28,
    eraKn: 'ಕ್ರಾಂತಜ್ಯೋತಿ ಸಾವಿತ್ರಿಬಾಯಿ ಫುಲೆ ಯುಗ',
    eraEn: 'Savitribai Phule & Womens Education',
    symbol: 'crown',
    quoteKn: '“ಶಿಕ್ಷಣವೇ ಮಹಿಳೆಗೆ ಅತ್ಯಂತ ಪ್ರಬಲವಾದ ಆಯುಧ • ಸ್ವಾಭಿಮಾನದ ಬದುಕಿಗೆ ಶಿಕ್ಷಣವೇ ದಾರಿ”',
    heritageBadgeKn: 'ಮಹಿಳಾ ಸಬಲೀಕರಣ • ಸಾವಿತ್ರಿಬಾಯಿ ಫುಲೆ',
    gradient: 'from-purple-700 via-pink-600 to-amber-600',
    bgTint: 'bg-purple-50/90',
    borderTint: 'border-purple-400',
    accentText: 'text-purple-950'
  },
  29: {
    topicNumber: 29,
    eraKn: 'ಗಾಂಧಿ ತತ್ವ & ನೈರ್ಮಲ್ಯ ಸಂಕಲ್ಪ',
    eraEn: 'Swachh Bharat & Sanitation Ethos',
    symbol: 'river',
    quoteKn: '“ಸ್ವಚ್ಛತೆಯು ಭಗವಂತನ ಆರಾಧನೆಗಿಂತಲೂ ಮಿಗಿಲಾದುದು - ಮಹಾತ್ಮ ಗಾಂಧಿ”',
    heritageBadgeKn: 'ಸ್ವಚ್ಛ ಭಾರತ • ಪರಿಸರ ನೈರ್ಮಲ್ಯ',
    gradient: 'from-green-600 via-emerald-600 to-teal-700',
    bgTint: 'bg-green-50/90',
    borderTint: 'border-green-400',
    accentText: 'text-green-950'
  },
  30: {
    topicNumber: 30,
    eraKn: 'ಸಾಲುಮರದ ತಿಮ್ಮಕ್ಕ ಪರಂಪರೆ & ಹಸಿರು ಭೂಮಿ',
    eraEn: 'Nature Stewardship & Green Earth',
    symbol: 'river',
    quoteKn: '“ಗಿಡ ನೆಟ್ಟು ಬೆಳೆಸಿ • ಹಸಿರೇ ಉಸಿರು, ಪ್ರಕೃತಿಯೇ ನಮ್ಮ ಜೀವನಾಡಿ”',
    heritageBadgeKn: 'ಪರಿಸರ ರಕ್ಷಣೆ • ಸಾಲುಮರದ ತಿಮ್ಮಕ್ಕ',
    gradient: 'from-emerald-700 via-green-600 to-lime-600',
    bgTint: 'bg-emerald-50/90',
    borderTint: 'border-emerald-400',
    accentText: 'text-emerald-950'
  },
  31: {
    topicNumber: 31,
    eraKn: 'ಹಳ್ಳಿಗಳ ಭಾರತ & ಸಮಾನ ಶಿಕ್ಷಣ',
    eraEn: 'Rural Education & Equal Opportunity',
    symbol: 'temple',
    quoteKn: '“ಹಳ್ಳಿಯ ಶಾಲೆಗಳು ಬಲಗೊಂಡರೆ ಮಾತ್ರ ಇಡೀ ಭಾರತ ಪ್ರಗತಿಯ ಪಥದಲ್ಲಿ ಸಾಗಲು ಸಾಧ್ಯ”',
    heritageBadgeKn: 'ಗ್ರಾಮೀಣ ಶಿಕ್ಷಣ • ಸಮಾನ ಅವಕಾಶ',
    gradient: 'from-amber-700 via-stone-600 to-amber-800',
    bgTint: 'bg-stone-50/90',
    borderTint: 'border-amber-400',
    accentText: 'text-stone-900'
  },
  32: {
    topicNumber: 32,
    eraKn: 'ಕುವೆಂಪು ಸಂದೇಶ & ಸರ್ವಜನಾಂಗ ಸೌಹಾರ್ದ',
    eraEn: 'Unity in Diversity & Cultural Harmony',
    symbol: 'flag',
    quoteKn: '“ಸರ್ವಜನಾಂಗದ ಶಾಂತಿಯ ತೋಟ • ಕುವೆಂಪು ಅವರ ಅಮರ ಸಂದೇಶ”',
    heritageBadgeKn: 'ವೈವಿಧ್ಯತೆಯಲ್ಲಿ ಏಕತೆ • ಸೌಹಾರ್ದ',
    gradient: 'from-amber-600 via-red-600 to-purple-600',
    bgTint: 'bg-amber-50/90',
    borderTint: 'border-amber-400',
    accentText: 'text-amber-950'
  },
  33: {
    topicNumber: 33,
    eraKn: 'ಸ್ವಾಮಿ ವಿವೇಕಾನಂದ ಯುವ ಭಾರತ',
    eraEn: 'Youth Empowerment & Vivekananda Vision',
    symbol: 'sword',
    quoteKn: '“ನನಗೆ ನೂರು ಜನ ನಿಷ್ಠಾವಂತ ಯುವಕರನ್ನು ಕೊಡಿ, ನಾನು ಭಾರತವನ್ನೇ ಬದಲಾಯಿಸುತ್ತೇನೆ - ಸ್ವಾಮಿ ವಿವೇಕಾನಂದ”',
    heritageBadgeKn: 'ಯುವಶಕ್ತಿ • ನವ ಭಾರತ',
    gradient: 'from-red-600 via-orange-600 to-amber-600',
    bgTint: 'bg-red-50/90',
    borderTint: 'border-red-400',
    accentText: 'text-red-950'
  },
  34: {
    topicNumber: 34,
    eraKn: 'ಡಾ. ಬಿ.ಆರ್. ಅಂಬೇಡ್ಕರ್ ಸಂವಿಧಾನ ದರ್ಶನ',
    eraEn: 'Constitutional Values & Social Justice',
    symbol: 'scroll',
    quoteKn: '“ಸಂವಿಧಾನ ಕೇವಲ ವಕೀಲರ ದಾಖಲೆಯಲ್ಲ, ಅದು ಜೀವಂತ ಬದುಕಿನ ಪವಿತ್ರ ವಾಹನ - ಡಾ. ಅಂಬೇಡ್ಕರ್”',
    heritageBadgeKn: 'ಸಂವಿಧಾನ ಮೌಲ್ಯ • ಸಮಾನತೆ',
    gradient: 'from-blue-700 via-indigo-700 to-slate-800',
    bgTint: 'bg-blue-50/90',
    borderTint: 'border-blue-400',
    accentText: 'text-blue-950'
  },
  35: {
    topicNumber: 35,
    eraKn: 'ಸಾತ್ವಿಕ ಆಹಾರ & ಅಹಿಂಸಾ ಧರ್ಮ',
    eraEn: 'Vegetarianism & Wholesome Health',
    symbol: 'river',
    quoteKn: '“ಪ್ರಾಣಿಗಳಲ್ಲಿ ದಯೆ ಇರಲಿ • ಸಾತ್ವಿಕ ಆಹಾರವೇ ಸುಖೀ ಜೀವನಕ್ಕೆ ಮೂಲ”',
    heritageBadgeKn: 'ಸಸ್ಯಹಾರ • ಸಾತ್ವಿಕ ಜೀವನ',
    gradient: 'from-green-600 via-teal-600 to-emerald-700',
    bgTint: 'bg-green-50/90',
    borderTint: 'border-green-400',
    accentText: 'text-green-950'
  },
  36: {
    topicNumber: 36,
    eraKn: 'ಯುನೆಸ್ಕೋ & ವಸುದೈವ ಕುಟುಂಬಕಂ',
    eraEn: 'World Peace & Universal Fellowship',
    symbol: 'lamp',
    quoteKn: '“ವಸುಧೈವ ಕುಟುಂಬಕಮ್ • ಇಡೀ ವಿಶ್ವವೇ ಒಂದೇ ಶಾಂತಿಯುತ ಕುಟುಂಬ”',
    heritageBadgeKn: 'ವಿಶ್ವ ಶಾಂತಿ • ವಸುಧೈವ ಕುಟುಂಬಕಂ',
    gradient: 'from-sky-600 via-blue-600 to-indigo-700',
    bgTint: 'bg-sky-50/90',
    borderTint: 'border-sky-400',
    accentText: 'text-sky-950'
  },
  37: {
    topicNumber: 37,
    eraKn: 'ಕ್ರೀಡಾ ಸ್ಫೂರ್ತಿ & ಸಮತೋಲಿತ ಶಿಕ್ಷಣ',
    eraEn: 'Sportsmanship & Academic Balance',
    symbol: 'crown',
    quoteKn: '“ಕ್ರೀಡಾಂಗಣದಲ್ಲಿ ಕಲಿತ ಶಿಸ್ತು ಮತ್ತು ಸೋಲೊಪ್ಪುವ ಗುಣ ಬದುಕಿನ ಕಣದಲ್ಲೂ ಗೆಲುವು ತರುತ್ತದೆ”',
    heritageBadgeKn: 'ಕ್ರೀಡೆ & ಶಿಕ್ಷಣ • ತಂಡ ಸ್ಪೂರ್ತಿ',
    gradient: 'from-amber-600 via-orange-600 to-yellow-600',
    bgTint: 'bg-amber-50/90',
    borderTint: 'border-amber-400',
    accentText: 'text-amber-950'
  },
  38: {
    topicNumber: 38,
    eraKn: 'ಎಳೆಯ ಪ್ರಾಯದ ಸಂಸ್ಕಾರ ಬಿತ್ತನೆ',
    eraEn: 'Primary Moral Character Inculcation',
    symbol: 'feather',
    quoteKn: '“ಗಿಡವಾಗಿ ಬಗ್ಗದ್ದು ಮರವಾಗಿ ಬಗ್ಗೀತೇ • ಎಳೆಯ ವಯಸ್ಸಿನ ಸಂಸ್ಕಾರವೇ ಬದುಕಿನ ಭದ್ರ ಬುನಾದಿ”',
    heritageBadgeKn: 'ಪ್ರಾಥಮಿಕ ಮೌಲ್ಯ • ಸಂಸ್ಕಾರ',
    gradient: 'from-teal-600 via-emerald-600 to-green-700',
    bgTint: 'bg-teal-50/90',
    borderTint: 'border-teal-400',
    accentText: 'text-teal-950'
  },
  39: {
    topicNumber: 39,
    eraKn: 'ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ & ನೈತಿಕ ಜವಾಬ್ದಾರಿ',
    eraEn: 'Cyber Age Responsibility & Teachers Role',
    symbol: 'rocket',
    quoteKn: '“ಜ್ಞಾನದ ಜೊತೆ ವಿವೇಕವನ್ನೂ ಕಲಿಸುವುದೇ ಡಿಜಿಟಲ್ ಕಾಲದ ಶಿಕ್ಷಕರ ಶ್ರೇಷ್ಠ ಜವಾಬ್ದಾರಿ”',
    heritageBadgeKn: 'ಡಿಜಿಟಲ್ ಜವಾಬ್ದಾರಿ • ವಿವೇಕ',
    gradient: 'from-violet-700 via-indigo-600 to-blue-700',
    bgTint: 'bg-violet-50/90',
    borderTint: 'border-violet-400',
    accentText: 'text-violet-950'
  },
  40: {
    topicNumber: 40,
    eraKn: 'ಸಮಯಪ್ರಜ್ಞೆ & ಕರ್ತವ್ಯ ನಿಷ್ಠೆ',
    eraEn: 'Punctuality & Time Management',
    symbol: 'feather',
    quoteKn: '“ಕಾಲವೇ ದೇವರು • ಸಮಯವನ್ನು ಗೌರವಿಸಿದವನನ್ನು ಜಗತ್ತು ಗೌರವಿಸುತ್ತದೆ”',
    heritageBadgeKn: 'ಸಮಯ ಪ್ರಜ್ಞೆ • ಶಿಸ್ತು',
    gradient: 'from-amber-700 via-amber-600 to-yellow-600',
    bgTint: 'bg-amber-50/90',
    borderTint: 'border-amber-400',
    accentText: 'text-amber-950'
  },
  41: {
    topicNumber: 41,
    eraKn: 'ಪತಂಜಲಿ ಯೋಗಸೂತ್ರ & ಮನಶಾಂತಿ',
    eraEn: 'Mindfulness, Meditation & Focus',
    symbol: 'lamp',
    quoteKn: '“ಯೋಗಶ್ಚ ಚಿತ್ತವೃತ್ತಿ ನಿರೋಧಃ • ಶಾಂತ ಮನಸ್ಸೇ ಮಹಾನ್ ಶಕ್ತಿಯ ಮೂಲ”',
    heritageBadgeKn: 'ಧ್ಯಾನ & ಏಕಾಗ್ರತೆ • ಮನಃಶಾಂತಿ',
    gradient: 'from-emerald-700 via-teal-600 to-cyan-700',
    bgTint: 'bg-emerald-50/90',
    borderTint: 'border-emerald-400',
    accentText: 'text-emerald-950'
  },
  42: {
    topicNumber: 42,
    eraKn: 'ಜ್ಞಾನಮಿತ್ರ & ಪುಸ್ತಕ ವೈಭವ',
    eraEn: 'Books as Lifelong True Friends',
    symbol: 'scroll',
    quoteKn: '“ಒಂದು ಒಳ್ಳೆಯ ಪುಸ್ತಕವು ನೂರು ಉತ್ತಮ ಸ್ನೇಹಿತರಿಗೆ ಸಮಾನ - ಡಾ. ಎ.ಪಿ.ಜೆ. ಅಬ್ದುಲ್ ಕಲಾಂ”',
    heritageBadgeKn: 'ಪುಸ್ತಕ ಮಿತ್ರ • ಜ್ಞಾನ ಭಂಡಾರ',
    gradient: 'from-blue-700 via-indigo-600 to-amber-700',
    bgTint: 'bg-blue-50/90',
    borderTint: 'border-blue-400',
    accentText: 'text-blue-950'
  },
  43: {
    topicNumber: 43,
    eraKn: 'ಮನಸ್ಸಿನ ಚೈತನ್ಯ & ಆಶಾವಾದ',
    eraEn: 'Power of Positive Thinking & Optimism',
    symbol: 'sword',
    quoteKn: '“ಯದ್ಭಾವಂ ತದ್ಭವತಿ • ಆಶಾವಾದವೇ ಗೆಲುವಿನ ಹೆದ್ದಾರಿ”',
    heritageBadgeKn: 'ಸಕಾರಾತ್ಮಕ ಚಿಂತನೆ • ಆಶಾವಾದ',
    gradient: 'from-rose-600 via-amber-600 to-yellow-600',
    bgTint: 'bg-rose-50/90',
    borderTint: 'border-rose-400',
    accentText: 'text-rose-950'
  },
  44: {
    topicNumber: 44,
    eraKn: 'ಗುರು ಸಾರ್ಥಕತೆ & ಭಾವಸ್ಪರ್ಶ',
    eraEn: 'Cherished Moments in Teaching',
    symbol: 'feather',
    quoteKn: '“ಶಿಷ್ಯನ ಯಶಸ್ಸಿನಲ್ಲಿ ತನ್ನ ಸಾರ್ಥಕತೆಯನ್ನು ಕಾಣುವುದೇ ಶಿಕ್ಷಕನ ಅತಿ ದೊಡ್ಡ ಆನಂದ”',
    heritageBadgeKn: 'ಸ್ಮರಣೀಯ ಅನುಭವ • ಗುರು ಸಾರ್ಥಕತೆ',
    gradient: 'from-amber-600 via-yellow-600 to-amber-700',
    bgTint: 'bg-amber-50/90',
    borderTint: 'border-amber-400',
    accentText: 'text-amber-950'
  },
  45: {
    topicNumber: 45,
    eraKn: 'ಪ್ರೇರಣಾ ಮೂರ್ತಿ & ಆದರ್ಶ ಬದುಕು',
    eraEn: 'Role Model Mentor & Integrity',
    symbol: 'crown',
    quoteKn: '“ಆದರ್ಶ ಶಿಕ್ಷಕರ ನಡತೆಯೇ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಅತ್ಯಂತ ಪ್ರಬಲವಾದ ಜೀವಂತ ಬೋಧನೆ”',
    heritageBadgeKn: 'ಆದರ್ಶ ಶಿಕ್ಷಕ • ಪ್ರೇರಣಾ ಮೂರ್ತಿ',
    gradient: 'from-purple-700 via-indigo-600 to-amber-600',
    bgTint: 'bg-purple-50/90',
    borderTint: 'border-purple-400',
    accentText: 'text-purple-950'
  },
  46: {
    topicNumber: 46,
    eraKn: 'ಧೈರ್ಯ, ಸಾಹಸ & ಪ್ರತಿಭಾ ವಿಕಾಸ',
    eraEn: 'Instilling Courage & Stage Confidence',
    symbol: 'sword',
    quoteKn: '“ಆತ್ಮವಿಶ್ವಾಸವೇ ಯಶಸ್ಸಿನ ಪ್ರಥಮ ರಹಸ್ಯ - ರಾಲ್ಫ್ ವಾಲ್ಡೋ ಎಮರ್ಸನ್”',
    heritageBadgeKn: 'ಆತ್ಮವಿಶ್ವಾಸ • ಪ್ರತಿಭಾ ವಿಕಾಸ',
    gradient: 'from-red-600 via-rose-600 to-amber-600',
    bgTint: 'bg-red-50/90',
    borderTint: 'border-red-400',
    accentText: 'text-red-950'
  },
  47: {
    topicNumber: 47,
    eraKn: 'ಡಿಜಿಟಲ್ ಬೋಧನಾ ವಿಧಾನ & ಸ್ಮಾರ್ಟ್ ಕಲಿಕೆ',
    eraEn: 'Innovative Pedagogy & Technology',
    symbol: 'rocket',
    quoteKn: '“ತಂತ್ರಜ್ಞಾನವು ಕಲ್ಪನೆಯ ರೆಕ್ಕೆಗಳಿಗೆ ಜ್ಞಾನದ ಬಲ ತುಂಬುತ್ತದೆ”',
    heritageBadgeKn: 'ಕಲಿಕಾ ತಂತ್ರಜ್ಞಾನ • ಸ್ಮಾರ್ಟ್ ಕ್ಲಾಸ್',
    gradient: 'from-cyan-700 via-blue-600 to-indigo-700',
    bgTint: 'bg-cyan-50/90',
    borderTint: 'border-cyan-400',
    accentText: 'text-cyan-950'
  },
  48: {
    topicNumber: 48,
    eraKn: 'ಮನೆ-ಶಾಲೆ ಸಮನ್ವಯ & ಸಂಸ್ಕಾರ',
    eraEn: 'Parent-School Partnership & Child Future',
    symbol: 'temple',
    quoteKn: '“ಮನೆ ಮೊದಲ ಪಾಠಶಾಲೆ, ಜನನಿ ತಾನೇ ಮೊದಲ ಗುರು • ಶಾಲೆ ಮತ್ತು ಮನೆಯ ಹೊಂದಾಣಿಕೆಯೇ ಸಾರ್ಥಕ”',
    heritageBadgeKn: 'ಪೋಷಕರ ಸಹಭಾಗಿತ್ವ • ಮನೆ-ಶಾಲೆ',
    gradient: 'from-amber-700 via-stone-600 to-amber-800',
    bgTint: 'bg-stone-50/90',
    borderTint: 'border-amber-400',
    accentText: 'text-stone-900'
  },
  49: {
    topicNumber: 49,
    eraKn: 'ವಾಚನ ಚಳವಳಿ & ಗ್ರಂಥಾಲಯ ಸಂಸ್ಕೃತಿ',
    eraEn: 'Reading Culture & Library Movement',
    symbol: 'scroll',
    quoteKn: '“ಓದುವ ಹವ್ಯಾಸವು ಮನಸ್ಸಿಗೆ ಅತ್ಯುತ್ತಮ ವ್ಯಾಯಾಮ • ಓದುವ ಮಗುವೇ ನಾಳೆಯ ಸಮರ್ಥ ನಾಯಕ”',
    heritageBadgeKn: 'ಓದುವ ಸಂಸ್ಕೃತಿ • ವಾಚನ ಚಳವಳಿ',
    gradient: 'from-indigo-700 via-blue-600 to-purple-700',
    bgTint: 'bg-indigo-50/90',
    borderTint: 'border-indigo-400',
    accentText: 'text-indigo-950'
  },
  50: {
    topicNumber: 50,
    eraKn: 'ಸರ್ವಧರ್ಮ ಸಮನ್ವಯ & ವಿಶ್ವಶಾಂತಿ',
    eraEn: 'Unity in Diversity • Immortal Soul of India',
    symbol: 'flag',
    quoteKn: '“ಭಾರತವೆಂದರೆ ಕೇವಲ ಮಣ್ಣಲ್ಲ, ಅದೊಂದು ಜೀವಂತ ತಪೋಭೂಮಿ • ವಿವಿಧತೆಯಲ್ಲಿ ಏಕತೆಯೇ ನಮ್ಮ ಜೀವಾಳ”',
    heritageBadgeKn: 'ನಮ್ಮ ಭಾರತ • ವಿವಿಧತೆಯಲ್ಲಿ ಏಕತೆ',
    gradient: 'from-red-600 via-amber-500 to-emerald-700',
    bgTint: 'bg-amber-50/90',
    borderTint: 'border-red-400',
    accentText: 'text-red-950'
  }
};

export function getTopicVisual(topicNumber: number): TopicVisual {
  if (TOPIC_VISUALS[topicNumber]) {
    return TOPIC_VISUALS[topicNumber];
  }
  // Safe cyclic fallback
  const fallbackIndex = ((topicNumber - 1) % 50) + 1;
  return TOPIC_VISUALS[fallbackIndex] || TOPIC_VISUALS[1];
}
