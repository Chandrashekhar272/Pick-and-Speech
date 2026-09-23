import { Topic, Category } from '../types';

export const CATEGORY_LABELS: Record<Category, { kn: string; en: string }> = {
  education: { kn: 'ಗುರು ಶಿಷ್ಯ & ಶಾಲಾ ಶಿಕ್ಷಣ', en: 'Teachers & School Education' },
  moral: { kn: 'ಮೌಲ್ಯ ಶಿಕ್ಷಣ & ವ್ಯಕ್ತಿತ್ವ ವಿಕಸನ', en: 'Value Education & Personality' },
  culture: { kn: 'ಭಾರತೀಯ ಸಂಸ್ಕೃತಿ & ಏಕತೆ', en: 'Indian Culture & Unity' },
  leaders: { kn: 'ರಾಷ್ಟ್ರ ನಿರ್ಮಾಣ & ಆದರ್ಶ ನಾಯಕರು', en: 'Nation Building & Icons' },
  science: { kn: 'ಡಿಜಿಟಲ್ ತಂತ್ರಜ್ಞಾನ & ನಾವೀನ್ಯತೆ', en: 'Digital Tech & Innovation' },
  environment: { kn: 'ಪರಿಸರ, ಆರೋಗ್ಯ & ಸ್ವಚ್ಛತೆ', en: 'Environment & Healthy Living' },
  current: { kn: 'ಸಮಕಾಲೀನ ಸವಾಲುಗಳು & ಶಾಂತಿ', en: 'Contemporary Education & Peace' }
};

export const DEFAULT_TOPICS: Topic[] = [
  // 1. ಶಿಕ್ಷಕರ ಮಹತ್ವ
  {
    id: 'topic-1',
    number: 1,
    titleKn: 'ಶಿಕ್ಷಕರ ಮಹತ್ವ - ಸಮಾಜದ ಕತ್ತಲೆಯನ್ನು ನೀಗಿಸುವ ಜ್ಞಾನದೀಪ',
    titleEn: 'The Significance of Teachers - Dispelling Darkness with Wisdom',
    category: 'education',
    level: 'open',
    hintsKn: [
      'ಅಜ್ಞಾನದ ತಿಮಿರವನ್ನು ಹೋಗಲಾಡಿಸಿ ಸುಜ್ಞಾನದ ಬೆಳಕು ಚೆಲ್ಲುವವರು ಶಿಕ್ಷಕರು',
      'ಮಗುವಿನ ವ್ಯಕ್ತಿತ್ವ ರೂಪಿಸುವಲ್ಲಿ ತಾಯಿಯ ನಂತರದ ಪ್ರಮುಖ ಮಾರ್ಗದರ್ಶಕರು',
      'ಸಮಾಜದ ಪ್ರತಿಯೊಂದು ಉನ್ನತ ವೃತ್ತಿಯ ಹಿಂದೆಯೂ ಒಬ್ಬ ಸಮರ್ಪಣಾ ಮನೋಭಾವದ ಶಿಕ್ಷಕನಿರುತ್ತಾನೆ',
      'ಬದುಕಿನ ಮೌಲ್ಯಗಳು, ಸಂಸ್ಕಾರ ಮತ್ತು ನೈತಿಕತೆಯನ್ನು ಕಲಿಸುವ ದಾರಿದೀಪ'
    ],
    hintsEn: [
      'Teachers illuminate the human mind by removing darkness of ignorance',
      'Foremost mentors shaping child personality next only to mother',
      'Behind every doctor, engineer or leader stands a dedicated teacher',
      'Guiding beacons instilling values, ethics and character in life'
    ]
  },
  // 2. ಗುರುವಿನ ಮಹಿಮೆ
  {
    id: 'topic-2',
    number: 2,
    titleKn: 'ಗುರುವಿನ ಮಹಿಮೆ - ಜೀವನ ಪಾವನಗೊಳಿಸುವ ಪವಿತ್ರ ಶಕ್ತಿ',
    titleEn: 'The Divine Glory of Guru - Sanctifying Human Life',
    category: 'culture',
    level: 'open',
    hintsKn: [
      'ಭಾರತೀಯ ಸಂಸ್ಕೃತಿಯಲ್ಲಿ ಗುರು ಪರಂಪರೆಗೆ ಅತ್ಯುನ್ನತ ಮತ್ತು ಪೂಜ್ಯ ಸ್ಥಾನ',
      'ಶಿಲೆಯಂತಹ ಮುಗ್ಧ ಮಗುವನ್ನು ಸುಂದರ ಮೂರ್ತಿಯನ್ನಾಗಿ ಕೆತ್ತುವ ಕಲಾಕಾರ ಗುರು',
      'ಕಷ್ಟ ಕಾಲದಲ್ಲಿ ಧೈರ್ಯ ತುಂಬಿ ಸನ್ಮಾರ್ಗದಲ್ಲಿ ಮುನ್ನಡೆಸುವ ನಿಸ್ವಾರ್ಥ ಮಾರ್ಗದರ್ಶಿ',
      'ಗುರುವಿನ ಆಶೀರ್ವಾದ ಮತ್ತು ಕೃಪೆ ಇದ್ದರೆ ಯಾವುದೇ ಕಠಿಣ ಗುರಿಯನ್ನು ಸಾಧಿಸಬಹುದು'
    ],
    hintsEn: [
      'Supreme status accorded to Guru tradition in Indian heritage',
      'Sculptor transforming unshaped stone into an inspiring idol',
      'Selfless mentor infusing courage during trying moments of life',
      'Divine blessings of Guru enable conquering the loftiest goals'
    ]
  },
  // 3. ಮೌಲ್ಯ ಶಿಕ್ಷಣ
  {
    id: 'topic-3',
    number: 3,
    titleKn: 'ಮೌಲ್ಯ ಶಿಕ್ಷಣ - ಸತ್ಪ್ರಜೆಗಳ ನಿರ್ಮಾಣಕ್ಕೆ ಅಡಿಪಾಯ',
    titleEn: 'Value Education - Foundation for Ideal Citizens',
    category: 'moral',
    level: 'open',
    hintsKn: [
      'ಕೇವಲ ಅಂಕ ಗಳಿಸುವುದಷ್ಟೇ ಅಲ್ಲದೆ ಉತ್ತಮ ನಡವಳಿಕೆ, ಸನ್ನಡತೆ ಕಲಿಸುವುದೇ ನಿಜವಾದ ಶಿಕ್ಷಣ',
      'ಸತ್ಯ, ಪ್ರೀತಿ, ಕರುಣೆ, ಸಹಬಾಳ್ವೆ ಮತ್ತು ಶಾಂತಿಯಂತಹ ಸಾರ್ವಕಾಲಿಕ ಮೌಲ್ಯಗಳ ಬೋಧನೆ',
      'ಇಂದಿನ ಯುವ ಪೀಳಿಗೆಯಲ್ಲಿ ನೈತಿಕ ಪ್ರಜ್ಞೆ ಮತ್ತು ದೇಶಪ್ರೇಮ ಬೆಳೆಸಲು ಮೌಲ್ಯ ಶಿಕ್ಷಣ ಅನಿವಾರ್ಯ',
      'ಸದ್ಗುಣಗಳಿಲ್ಲದ ಶಿಕ್ಷಣವು ಸಮಾಜಕ್ಕೆ ಕಂಟಕವಾಗಬಲ್ಲದು ಎಂಬ ಎಚ್ಚರಿಕೆ'
    ],
    hintsEn: [
      'True education imparts character, integrity and conduct beyond mere marks',
      'Nurturing universal values of truth, compassion, peace and harmony',
      'Essential for instilling ethical consciousness and patriotism in youth',
      'Knowledge without virtues can become dangerous to society'
    ]
  },
  // 4. ಪುಸ್ತಕ ಓದುವ ಹವ್ಯಾಸ
  {
    id: 'topic-4',
    number: 4,
    titleKn: 'ಪುಸ್ತಕ ಓದುವ ಹವ್ಯಾಸ - ಜ್ಞಾನ ವಿಕಾಸದ ಹೆಬ್ಬಾಗಿಲು',
    titleEn: 'The Habit of Book Reading - Gateway to Wisdom',
    category: 'education',
    level: 'open',
    hintsKn: [
      'ಓದು ಮನುಷ್ಯನನ್ನು ಪರಿಪೂರ್ಣನನ್ನಾಗಿ ಮಾಡುತ್ತದೆ (Reading makes a full man)',
      'ಪುಸ್ತಕಗಳು ನಮ್ಮ ಕಲ್ಪನಾ ಶಕ್ತಿ, ಶಬ್ದ ಭಂಡಾರ ಮತ್ತು ಆಲೋಚನಾ ಸಾಮರ್ಥ್ಯವನ್ನು ವಿಸ್ತರಿಸುತ್ತವೆ',
      'ಮಹಾನ್ ವ್ಯಕ್ತಿಗಳ ಜೀವನ ಚರಿತ್ರೆಗಳು ನಮ್ಮಲ್ಲಿ ಹೊಸ ಉತ್ಸಾಹ ಮತ್ತು ಪ್ರೇರಣೆ ತುಂಬುತ್ತವೆ',
      'ಮೊಬೈಲ್ ಮತ್ತು ಡಿಜಿಟಲ್ ಕಾಲದಲ್ಲೂ ಪುಸ್ತಕಗಳ ಒಡನಾಟವೇ ಶಾಶ್ವತ ಬೌದ್ಧಿಕ ಸಂಪತ್ತು'
    ],
    hintsEn: [
      'Reading maketh a full man: foundational virtue for intellect',
      'Expands imagination, vocabulary and analytical thinking ability',
      'Biographies of great visionaries ignite inspiration and zeal',
      'Books remain timeless intellectual treasure even in screen era'
    ]
  },
  // 5. ವಿದ್ಯಾರ್ಥಿಗಳಲ್ಲಿ ಆತ್ಮವಿಶ್ವಾಸ ಬೆಳೆಸುವುದು
  {
    id: 'topic-5',
    number: 5,
    titleKn: 'ವಿದ್ಯಾರ್ಥಿಗಳಲ್ಲಿ ಆತ್ಮವಿಶ್ವಾಸ ಬೆಳೆಸುವುದು - ಯಶಸ್ಸಿನ ಮೂಲ ಮಂತ್ರ',
    titleEn: 'Nurturing Self-Confidence in Students - Key to Success',
    category: 'moral',
    level: 'open',
    hintsKn: [
      'ಆತ್ಮವಿಶ್ವಾಸವೇ ಸಾಧನೆಯ ಪ್ರಥಮ ಸೋಪಾನ; ಅಂಜಿಕೆಯನ್ನು ತೊಡೆದುಹಾಕುವುದು',
      'ಸೋಲಿಗೆ ಹೆದರದೆ ಸತತ ಪ್ರಯತ್ನ ಮಾಡುವ ಸಕಾರಾತ್ಮಕ ಮನೋಭಾವ ಮೂಡಿಸುವುದು',
      'ಶಿಕ್ಷಕರು ಮತ್ತು ಪೋಷಕರು ಮಕ್ಕಳ ಸಣ್ಣ ಸಾಧನೆಗಳನ್ನೂ ಪ್ರೋತ್ಸಾಹಿಸಿ ಬೆನ್ನುತಟ್ಟುವುದು',
      'ನನ್ನಿಂದ ಸಾಧ್ಯ ಎಂಬ ದೃಢ ಸಂಕಲ್ಪವೇ ದೊಡ್ಡ ಗುರಿಗಳನ್ನು ಮುಟ್ಟಲು ಪ್ರೇರಕ'
    ],
    hintsEn: [
      'Confidence is the first step towards accomplishment; shedding stage fear',
      'Fostering resilience to face setbacks without losing spirit',
      'Teachers and parents recognizing and applauding small milestones',
      'The firm conviction of "I Can" unlocks extraordinary potential'
    ]
  },
  // 6. ಏಕತೆಯ ಮಹತ್ವ
  {
    id: 'topic-6',
    number: 6,
    titleKn: 'ಏಕತೆಯ ಮಹತ್ವ - ಸಂಘಟಿತ ಶಕ್ತಿಯೇ ರಾಷ್ಟ್ರದ ಬಲ',
    titleEn: 'The Significance of Unity - Collective Strength of Nation',
    category: 'culture',
    level: 'open',
    hintsKn: [
      'ಒಗ್ಗಟ್ಟಿನಲ್ಲಿ ಬಲವಿದೆ - ವೈಯಕ್ತಿಕ ಮತ್ತು ಸಾಮಾಜಿಕ ಪ್ರಗತಿಗೆ ಏಕತೆ ಅತ್ಯಗತ್ಯ',
      'ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳನ್ನು ಮರೆತು ಒಂದಾಗಿ ನಿಂತಾಗ ಯಾವುದೇ ಕಠಿಣ ಸವಾಲನ್ನು ಎದುರಿಸಬಹುದು',
      'ಶಾಲಾ ಮಟ್ಟದಲ್ಲಿ ಜಾತಿ, ಮತ, ಭಾಷೆಗಳ ಭೇದವಿಲ್ಲದೆ ಸಾಮರಸ್ಯದಿಂದ ಬೆಳೆಯುವ ಶಿಕ್ಷಣ',
      'ರಾಷ್ಟ್ರೀಯ ಹಿತಾಸಕ್ತಿಯಲ್ಲಿ ಸಮಸ್ತ ಭಾರತೀಯರ ಒಗ್ಗಟ್ಟೇ ದೇಶದ ಅಖಂಡತೆಯ ರಕ್ಷಾಕವಚ'
    ],
    hintsEn: [
      'United we stand, divided we fall - unity is indispensable for progress',
      'Overcoming differences to face national and social challenges together',
      'Classroom as cradle of harmony beyond caste, creed and tongue',
      'Solidarity of every Indian is the armor safeguarding national integrity'
    ]
  },
  // 7. ಆರೋಗ್ಯಕರ ಜೀವನ ಶೈಲಿ
  {
    id: 'topic-7',
    number: 7,
    titleKn: 'ಆರೋಗ್ಯಕರ ಜೀವನ ಶೈಲಿ - ಸಂತುಷ್ಟ ಹಾಗೂ ಸಾರ್ಥಕ ಬದುಕಿಗೆ ದಾರಿ',
    titleEn: 'Healthy Lifestyle - Path to Wholesome and Fulfilled Life',
    category: 'environment',
    level: 'open',
    hintsKn: [
      'ಆರೋಗ್ಯವೇ ಮಹಾಭಾಗ್ಯ - ಸದೃಢ ದೇಹದಲ್ಲಿ ಮಾತ್ರ ಸದೃಢ ಮನಸ್ಸು ನೆಲೆಸುತ್ತದೆ',
      'ಪೌಷ್ಟಿಕ ಸಮತೋಲಿತ ಆಹಾರ, ನಿಯಮಿತ ವ್ಯಾಯಾಮ ಮತ್ತು ಸಾಕಷ್ಟು ನಿದ್ರೆಯ ಮಹತ್ವ',
      'ಜಂಕ್ ಫುಡ್ ಮತ್ತು ಅತಿಯಾದ ಮೊಬೈಲ್ ಬಳಕೆಯಿಂದ ದೂರವಿರುವ ಸ್ವಯಂ ಶಿಸ್ತು',
      'ಯೋಗ, ಪ್ರಾಣಾಯಾಮ ಮತ್ತು ಮಾನಸಿಕ ಶಾಂತಿಯಿಂದ ಒತ್ತಡ ರಹಿತ ಸಂತೋಷದ ಜೀವನ'
    ],
    hintsEn: [
      'Health is supreme wealth - sound mind resides only in a sound body',
      'Balanced nutritious diet, daily exercise and adequate rest',
      'Self-discipline in avoiding junk food and screen addiction',
      'Yoga and pranayama for stress-free joyful mental wellness'
    ]
  },
  // 8. ಶಿಕ್ಷಕ ಮತ್ತು ಮಕ್ಕಳ ಬಾಂಧವ್ಯ
  {
    id: 'topic-8',
    number: 8,
    titleKn: 'ಶಿಕ್ಷಕ ಮತ್ತು ಮಕ್ಕಳ ಬಾಂಧವ್ಯ - ಪ್ರೀತಿ, ವಿಶ್ವಾಸದ ಮಧುರ ಒಡನಾಟ',
    titleEn: 'Bond Between Teacher and Children - Bond of Love & Trust',
    category: 'education',
    level: 'open',
    hintsKn: [
      'ಶಿಕ್ಷಕರು ಕೇವಲ ಪಾಠ ಮಾಡುವವರಲ್ಲ; ಸ್ನೇಹಿತರು, ಮಾರ್ಗದರ್ಶಕರು ಮತ್ತು ತತ್ವಜ್ಞಾನಿಗಳು',
      'ಮಕ್ಕಳ ಭಯ, ಸಂಕೋಚವನ್ನು ನಿವಾರಿಸಿ ಮುಕ್ತವಾಗಿ ಮಾತನಾಡುವ ಸ್ನೇಹಪರ ವಾತಾವರಣ ಸೃಷ್ಟಿ',
      'ಮಗುವಿನ ಪ್ರತಿಭೆ, ಕೊರತೆ ಮತ್ತು ಭಾವನೆಗಳನ್ನು ಆಪ್ತವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವ ಸಹಾನುಭೂತಿ',
      'ಪ್ರೀತಿಯಿಂದ ತಿದ್ದಿ ತೀಡಿದಾಗ ಮಾತ್ರ ಮಗು ಉನ್ನತ ವ್ಯಕ್ತಿಯಾಗಿ ಅರಳುತ್ತದೆ'
    ],
    hintsEn: [
      'Teachers are friends, philosophers and loving guides to students',
      'Creating fear-free classroom ambiance encouraging open questions',
      'Empathetic understanding of child emotions, strengths and needs',
      'Loving correction and nurturing brings out the finest human being'
    ]
  },
  // 9. ಶಿಕ್ಷಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೂತನ ತಂತ್ರಜ್ಞಾನ
  {
    id: 'topic-9',
    number: 9,
    titleKn: 'ಶಿಕ್ಷಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೂತನ ತಂತ್ರಜ್ಞಾನ - ಸ್ಮಾರ್ಟ್ ಕಲಿಕೆಯ ಕ್ರಾಂತಿ',
    titleEn: 'Modern Technology in Education - Revolution in Smart Learning',
    category: 'science',
    level: 'open',
    hintsKn: [
      'ಡಿಜಿಟಲ್ ಬೋರ್ಡ್‌ಗಳು, ಸ್ಮಾರ್ಟ್ ತರಗತಿಗಳು ಮತ್ತು ಸಂವಾದಾತ್ಮಕ ಆನ್‌ಲೈನ್ ಕಲಿಕಾ ಮಾದರಿಗಳು',
      'ಸಂಕೀರ್ಣ ಗಣಿತ, ವಿಜ್ಞಾನ ವಿಷಯಗಳನ್ನು ಅನಿಮೇಷನ್ ಮತ್ತು ವೀಡಿಯೊಗಳ ಮೂಲಕ ಸುಲಭವಾಗಿ ಗ್ರಹಿಸುವುದು',
      'ಪ್ರಪಂಚದ ಅಗಾಧ ಜ್ಞಾನಭಂಡಾರವನ್ನು ಬೆರಳ ತುದಿಯಲ್ಲಿ ಒದಗಿಸುವ ಇಂಟರ್ನೆಟ್ ಶಕ್ತಿ',
      'ತಂತ್ರಜ್ಞಾನವನ್ನು ಶಿಕ್ಷಣಕ್ಕೆ ಪೂರಕವಾಗಿ ವಿವೇಚನೆಯಿಂದ ಬಳಸುವ ಶಿಸ್ತು'
    ],
    hintsEn: [
      'Smart classrooms, interactive digital boards and visual aids',
      'Simplifying complex science and math via animations and models',
      'Internet placing the vast global knowledge pool at fingertips',
      'Prudent and disciplined use of technology aiding learning'
    ]
  },
  // 10. ಶಾಲೆ ಮತ್ತು ಸಮುದಾಯದ ಸಂಬಂಧ
  {
    id: 'topic-10',
    number: 10,
    titleKn: 'ಶಾಲೆ ಮತ್ತು ಸಮುದಾಯದ ಸಂಬಂಧ - ಶೈಕ್ಷಣಿಕ ವಿಕಾಸದ ಜಂಟಿ ಸೇತುವೆ',
    titleEn: 'School and Community Relationship - Joint Bridge of Growth',
    category: 'education',
    level: 'open',
    hintsKn: [
      'ಶಾಲೆ ಸಮಾಜದ ಒಂದು ಜೀವಂತ ಅಂಗ; ಸಮುದಾಯದ ಸಹಭಾಗಿತ್ವವಿಲ್ಲದೆ ಶಾಲೆ ಬೆಳೆಯಲಾರದು',
      'ಎಸ್‌ಡಿಎಂಸಿ (SDMC), ಪೋಷಕರು ಮತ್ತು ಗ್ರಾಮಸ್ಥರ ಸಕ್ರಿಯ ಬೆಂಬಲದಿಂದ ಶಾಲೆಯ ಸರ್ವಾಂಗೀಣ ಅಭಿವೃದ್ಧಿ',
      'ಗ್ರಾಮದ ಉತ್ಸವಗಳು, ರಾಷ್ಟ್ರೀಯ ಹಬ್ಬಗಳಲ್ಲಿ ಶಾಲಾ ಮಕ್ಕಳ ಮತ್ತು ಸಮುದಾಯದ ಒಗ್ಗಟ್ಟು',
      'ಶಾಲೆಯು ಕೇವಲ ಕಟ್ಟಡವಲ್ಲ, ಇಡೀ ಹಳ್ಳಿಯ ಸಂಸ್ಕೃತಿ ಮತ್ತು ಚೈತನ್ಯದ ಕೇಂದ್ರ'
    ],
    hintsEn: [
      'School is an organic limb of society; blooms with community partnership',
      'Active SDMC, parents and village leadership uplifting school infrastructure',
      'Celebrating national festivals uniting school children and community',
      'School is not mere bricks, but the cultural and intellectual heart of village'
    ]
  },
  // 11. ಆದರ್ಶ ವಿದ್ಯಾರ್ಥಿಗಳ ಗುಣಗಳು
  {
    id: 'topic-11',
    number: 11,
    titleKn: 'ಆದರ್ಶ ವಿದ್ಯಾರ್ಥಿಗಳ ಗುಣಗಳು - ಶಿಸ್ತು, ವಿನಯ ಮತ್ತು ಜ್ಞಾನದಾಹ',
    titleEn: 'Qualities of an Ideal Student - Discipline, Humility & Curiosity',
    category: 'moral',
    level: 'open',
    hintsKn: [
      'ವಿದ್ಯಾದದಾತಿ ವಿನಯಂ - ವಿದ್ಯೆಯ ಜೊತೆಗೆ ವಿನಯ, ನಮ್ರತೆ ಹಾಗೂ ಸದ್ವರ್ತನೆ ಬೆಳೆಸಿಕೊಳ್ಳುವುದು',
      'ಸಮಯಪ್ರಜ್ಞೆ, ಶಿಸ್ತುಬದ್ಧ ದಿನಚರಿ ಮತ್ತು ಗುರು-ಹಿರಿಯರಲ್ಲಿ ಅಚಲ ಗೌರವ',
      'ಹೊಸ ವಿಷಯಗಳನ್ನು ಕಲಿಯುವ ತೀವ್ರ ಕುತೂಹಲ ಹಾಗೂ ಸತತ ಪರಿಶ್ರಮದ ಗುಣ',
      'ನಿಸ್ವಾರ್ಥ ಸೇವಾ ಮನೋಭಾವ, ಪರಿಸರ ಕಾಳಜಿ ಮತ್ತು ಸಹಪಾಠಿಗಳಿಗೆ ನೆರವಾಗುವ ಗುಣ'
    ],
    hintsEn: [
      'True education yields modesty: humility is ornament of a student',
      'Punctuality, disciplined routine and heartfelt respect for elders',
      'Insatiable quest for knowledge and persistence in hard work',
      'Spirit of selfless service, environmental care and helping peers'
    ]
  },
  // 12. ನನ್ನ ನೆಚ್ಚಿನ ಶಿಕ್ಷಕರು
  {
    id: 'topic-12',
    number: 12,
    titleKn: 'ನನ್ನ ನೆಚ್ಚಿನ ಶಿಕ್ಷಕರು - ಬದುಕಿಗೆ ಹೊಸ ತಿರುವು ನೀಡಿದ ಮಹಾನ್ ಚೇತನ',
    titleEn: 'My Favorite Teacher - The Inspiring Soul of My Life',
    category: 'education',
    level: 'open',
    hintsKn: [
      'ತಮ್ಮ ಪ್ರೀತಿ, ಸರಳ ಬೋಧನಾ ಶೈಲಿ ಮತ್ತು ಅಪಾರ ತಾಳ್ಮೆಯಿಂದ ಮನಸೆಳೆದ ಗುರುಗಳು',
      'ಕಠಿಣ ವಿಷಯಗಳನ್ನೂ ಅತ್ಯಂತ ಆಸಕ್ತಿದಾಯಕವಾಗಿ ಕಥೆ, ನಿದರ್ಶನಗಳ ಮೂಲಕ ವಿವರಿಸಿದ ಕ್ಷಣಗಳು',
      'ತಪ್ಪು ಮಾಡಿದಾಗ ಸಿಟ್ಟಾಗದೆ ಸಮಾಧಾನದಿಂದ ಸರಿಪಡಿಸಿ ತಿದ್ದಿ ತೀಡಿದ ಔದಾರ್ಯ',
      'ಕಷ್ಟದ ಸನ್ನಿವೇಶದಲ್ಲಿ ಆತ್ಮಸ್ಥೈರ್ಯ ತುಂಬಿ ಗುರಿ ಮುಟ್ಟಲು ದಾರಿ ತೋರಿಸಿದ ಸ್ಮರಣೆ'
    ],
    hintsEn: [
      'Inspiring teacher touching hearts through patience, warmth and clarity',
      'Making tough subjects enjoyable through stories and real-world parallels',
      'Correcting errors gently with maternal care rather than harsh rebuke',
      'Infusing confidence during doubts and pointing toward noble goals'
    ]
  },
  // 13. ಶಿಕ್ಷಕರ ಮಹತ್ವ
  {
    id: 'topic-13',
    number: 13,
    titleKn: 'ಶಿಕ್ಷಕರ ಮಹತ್ವ - ದೇಶದ ಭವಿಷ್ಯ ರೂಪಿಸುವ ಅದೃಶ್ಯ ರೂವಾರಿಗಳು',
    titleEn: 'The Indispensable Value of Teachers - Invisible Sculptors',
    category: 'education',
    level: 'open',
    hintsKn: [
      'ಜಗತ್ತಿನ ಪ್ರತಿಯೊಬ್ಬ ವಿಜ್ಞಾನಿ, ವೈದ್ಯ, ಇಂಜಿನಿಯರ್, ನ್ಯಾಯಾಧೀಶರ ಹಿಂದೆಯೂ ಶಿಕ್ಷಕರಿದ್ದಾರೆ',
      'ಶಿಕ್ಷಕರು ಕೇವಲ ಅಕ್ಷರ ಕಲಿಸುವುದಿಲ್ಲ, ಬದುಕಿನ ನೈತಿಕ ದಾರಿಯನ್ನು ತಿದ್ದುತ್ತಾರೆ',
      'ಸಮಾಜದಲ್ಲಿ ಸತ್ಯ, ನ್ಯಾಯ ಮತ್ತು ಸಮಾನತೆಯ ಚಿಂತನೆಗಳನ್ನು ಬಿತ್ತುವ ಪ್ರಜಾಪ್ರಭುತ್ವದ ರಕ್ಷಕರು',
      'ಶಿಕ್ಷಕರನ್ನು ಗೌರವಿಸುವ ಸಮಾಜ ಸದಾ ಶಾಂತಿ ಮತ್ತು ಸಮೃದ್ಧಿಯಿಂದ ಮುನ್ನಡೆಯುತ್ತದೆ'
    ],
    hintsEn: [
      'Behind every doctor, engineer, scientist and judge stands a devoted teacher',
      'Teachers teach not merely syllables, but the art of living with dignity',
      'Guardians of democracy instilling truth, justice and equality in youth',
      'A society that honors teachers is blessed with peace and enduring prosperity'
    ]
  },
  // 14. ಶಿಕ್ಷಕರೇ ಸಮಾಜದ ಶಿಲ್ಪಿಗಳು
  {
    id: 'topic-14',
    number: 14,
    titleKn: 'ಶಿಕ್ಷಕರೇ ಸಮಾಜದ ಶಿಲ್ಪಿಗಳು - ನವಸಮಾಜದ ಭವ್ಯ ನಿರ್ಮಾಣ',
    titleEn: 'Teachers: The True Sculptors of Society',
    category: 'education',
    level: 'open',
    hintsKn: [
      'ಕಚ್ಚಾ ಮಣ್ಣಿನಂತಹ ಮಕ್ಕಳ ಮನಸ್ಸನ್ನು ಸುಂದರ ಸತ್ಪ್ರಜೆಗಳಾಗಿ ರೂಪಿಸುವ ಕುಶಲ ಶಿಲ್ಪಿಗಳು',
      'ಸಮಾಜದ ಮೌಲ್ಯಗಳು, ಸಂಸ್ಕೃತಿ ಮತ್ತು ಸದಾಚಾರವನ್ನು ಮುಂದಿನ ತಲೆಮಾರಿಗೆ ದಾಟಿಸುವ ಕೊಂಡಿ',
      'ಭ್ರಷ್ಟಾಚಾರ, ಅಸಮಾನತೆ ಮುಕ್ತ ನೈತಿಕ ಸಮಾಜ ನಿರ್ಮಾಣಕ್ಕೆ ತರಗತಿಯೇ ತಳಹದಿ',
      'ತರಗತಿಯ ಕೋಣೆಗಳಲ್ಲೇ ದೇಶದ ಭವಿಷ್ಯ ರೂಪಿಸಲ್ಪಡುತ್ತದೆ (ಕೊಠಾರಿ ಆಯೋಗದ ವರದಿ)'
    ],
    hintsEn: [
      'Sculptors shaping tender impressionable minds into virtuous citizens',
      'Bridge passing cultural heritage, ethics and wisdom across generations',
      'Classroom is the bedrock for corruption-free egalitarian society',
      'Destiny of a nation is being shaped inside its classrooms'
    ]
  },
  // 15. ಗುರು–ಶಿಷ್ಯರ ಸಂಬಂಧ
  {
    id: 'topic-15',
    number: 15,
    titleKn: 'ಗುರು–ಶಿಷ್ಯರ ಪವಿತ್ರ ಸಂಬಂಧ - ಜ್ಞಾನ, ಗೌರವ ಮತ್ತು ಸಮರ್ಪಣೆಯ ಸಂಗಮ',
    titleEn: 'Sacred Bond of Guru-Shishya - Reverence & Selfless Guidance',
    category: 'culture',
    level: 'open',
    hintsKn: [
      'ಭಾರತದ ಪ್ರಾಚೀನ ಗುರುಕುಲ ಪರಂಪರೆಯಿಂದ ಇಂದಿನ ಆಧುನಿಕ ಶಾಲೆಯವರೆಗಿನ ಪಾವಿತ್ರ್ಯತೆ',
      'ಶಿಷ್ಯನ ಶ್ರದ್ಧೆ, ಸಮರ್ಪಣೆ ಮತ್ತು ಗುರುವಿನ ಅಪಾರ ವಾತ್ಸಲ್ಯ, ನಿಸ್ವಾರ್ಥ ಮಾರ್ಗದರ್ಶನ',
      'ಶ್ರೀರಾಮಕೃಷ್ಣ ಪರಮಹಂಸರು ಮತ್ತು ಸ್ವಾಮಿ ವಿವೇಕಾನಂದರ ಪವಿತ್ರ ಗುರು-ಶಿಷ್ಯ ಬಾಂಧವ್ಯದ ಆದರ್ಶ',
      'ಕಾಲ ಬದಲಾದರೂ ಗುರು-ಶಿಷ್ಯರ ನಡುವಿನ ಪರಸ್ಪರ ಗೌರವ ಹಾಗೂ ಕೃತಜ್ಞತೆಯ ಮಹತ್ವ'
    ],
    hintsEn: [
      'Sacred legacy spanning ancient Gurukul systems to modern classrooms',
      'Disciple sincerity meeting teacher boundless compassion and guidance',
      'Immortal ideal of Sri Ramakrishna Paramahamsa and Swami Vivekananda',
      'Timeless virtue of reverence, loyalty and gratitude towards mentor'
    ]
  },
  // 16. ನನ್ನ ಜೀವನದಲ್ಲಿ ಶಿಕ್ಷಕರ ಪಾತ್ರ
  {
    id: 'topic-16',
    number: 16,
    titleKn: 'ನನ್ನ ಜೀವನದಲ್ಲಿ ಶಿಕ್ಷಕರ ಪಾತ್ರ - ಯಶಸ್ಸಿನ ಪ್ರೇರಕ ಶಕ್ತಿ',
    titleEn: 'Role of Teachers in My Life - Driving Force of Character',
    category: 'education',
    level: 'open',
    hintsKn: [
      'ಬಾಲ್ಯದ ಅಂಜಿಕೆಯನ್ನು ಹೋಗಲಾಡಿಸಿ ನನ್ನಲ್ಲಿ ಅಡಗಿದ್ದ ಸುಪ್ತ ಪ್ರತಿಭೆಯನ್ನು ಗುರುತಿಸಿದ ರೀತಿ',
      'ಸೋಲಿನ ಸಮಯದಲ್ಲಿ ಸಮಾಧಾನ ನೀಡಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸುವ ಛಲ ಕಲಿಸಿಕೊಟ್ಟ ಅನುಭವ',
      'ಕೇವಲ ಪಠ್ಯವಲ್ಲದೆ ಜೀವನದ ಶಿಸ್ತು, ಸತ್ಯವಂತಿಕೆ ಮತ್ತು ಪ್ರಾಮಾಣಿಕತೆಯನ್ನು ಕಲಿಸಿದ ಗುರುಗಳು',
      'ನನ್ನ ಇಂದಿನ ವ್ಯಕ್ತಿತ್ವ ಮತ್ತು ಸಾಧನೆಗೆ ನನ್ನ ಶಿಕ್ಷಕರೇ ಪ್ರತ್ಯಕ್ಷ ಸಾಕ್ಷಿ'
    ],
    hintsEn: [
      'Banishing childhood hesitation and unlocking dormant talents',
      'Infusing courage to rise after every stumble and try with vigor',
      'Teaching discipline, honesty and fortitude beyond textbooks',
      'Living testimony: whatever good I am today is my teachers gift'
    ]
  },
  // 17. ಉತ್ತಮ ಶಿಕ್ಷಕರ ಗುಣಗಳು
  {
    id: 'topic-17',
    number: 17,
    titleKn: 'ಉತ್ತಮ ಶಿಕ್ಷಕರ ಗುಣಗಳು - ಪ್ರೀತಿ, ತಾಳ್ಮೆ, ಜ್ಞಾನ ಮತ್ತು ಬದ್ಧತೆ',
    titleEn: 'Qualities of an Inspiring Teacher - Passion, Patience & Integrity',
    category: 'education',
    level: 'open',
    hintsKn: [
      'ಅಪಾರ ವಿಷಯ ಜ್ಞಾನ ಹಾಗೂ ಅದನ್ನು ಸರಳವಾಗಿ ಮಕ್ಕಳಿಗೆ ತಲುಪಿಸುವ ಬೋಧನಾ ಕಲೆ',
      'ಎಲ್ಲಾ ಮಕ್ಕಳನ್ನು ಸಮಾನವಾಗಿ ಕಾಣುವ ನಿಷ್ಪಕ್ಷಪಾತ ಧೋರಣೆ ಮತ್ತು ಅಪಾರ ತಾಳ್ಮೆ',
      'ನಿರಂತರ ಕಲಿಕಾ ಮನೋಭಾವ (ಸದಾ ಕಲಿಯುವ ಶಿಕ್ಷಕನೇ ಶ್ರೇಷ್ಠ ಬೋಧಕ)',
      'ನಗುಮುಖ, ಸಹಾನುಭೂತಿ ಮತ್ತು ಮಕ್ಕಳನ್ನು ಪ್ರೇರೇಪಿಸುವ ಉತ್ಸಾಹಭರಿತ ವ್ಯಕ್ತಿತ್ವ'
    ],
    hintsEn: [
      'Mastery over subjects communicated with effortless pedagogical grace',
      'Treating every child equally with boundless patience and warmth',
      'Lifelong learner attitude: an inspiring teacher remains a lifelong student',
      'Cheerful disposition, deep empathy and infectious enthusiasm'
    ]
  },
  // 18. ಶಿಕ್ಷಕರಿಂದ ಕಲಿತ ಜೀವನ ಪಾಠಗಳು
  {
    id: 'topic-18',
    number: 18,
    titleKn: 'ಶಿಕ್ಷಕರಿಂದ ಕಲಿತ ಜೀವನ ಪಾಠಗಳು - ಬದುಕಿನ ದಾರಿದೀಪಗಳು',
    titleEn: 'Invaluable Life Lessons Learned from Teachers',
    category: 'moral',
    level: 'open',
    hintsKn: [
      'ಪುಸ್ತಕದ ಅಕ್ಷರಗಳಿಗಿಂತ ಮಿಗಿಲಾಗಿ ಬದುಕುವ ಕಲೆಯನ್ನು ಕಲಿಸಿಕೊಟ್ಟ ಶಿಕ್ಷಕರು',
      'ಸೋಲುಗಳನ್ನು ಸಕಾರಾತ್ಮಕವಾಗಿ ಸ್ವೀಕರಿಸಿ, ಅದರಿಂದ ಪಾಠ ಕಲಿತು ಮುನ್ನುಗ್ಗುವ ಧೈರ್ಯ',
      'ಇತರರಿಗೆ ಗೌರವ ನೀಡುವುದು, ಹಸಿದವರಿಗೆ ನೆರವಾಗುವುದು ಮತ್ತು ನಿಸ್ವಾರ್ಥ ಸೇವೆ ಮಾಡುವುದು',
      'ಸಮಯಕ್ಕೆ ಬೆಲೆ ಕೊಡುವುದು ಮತ್ತು ಕರ್ತವ್ಯ ನಿಷ್ಠೆಯಲ್ಲಿ ಯಾವುದೇ ರಾಜಿ ಮಾಡಿಕೊಳ್ಳದಿರುವುದು'
    ],
    hintsEn: [
      'Teaching the sacred art of living beyond textbook formulas',
      'Embracing setbacks as lessons and stepping stones to greater heights',
      'Treating fellow human beings with dignity and spirit of selfless service',
      'Honoring time, honesty and uncompromised dedication to duty'
    ]
  },
  // 19. ಶಿಕ್ಷಕರ ದಿನಾಚರಣೆಯ ಮಹತ್ವ
  {
    id: 'topic-19',
    number: 19,
    titleKn: 'ಶಿಕ್ಷಕರ ದಿನಾಚರಣೆಯ ಮಹತ್ವ - ಡಾ. ಸರ್ವೇಪಲ್ಲಿ ರಾಧಾಕೃಷ್ಣನ್ ಅವರ ಆದರ್ಶ',
    titleEn: 'Significance of Teachers Day - Tribute to Dr. Radhakrishnan',
    category: 'leaders',
    level: 'open',
    hintsKn: [
      'ಸೆಪ್ಟೆಂಬರ್ ೫ - ಭಾರತದ ಶ್ರೇಷ್ಠ ತತ್ವಜ್ಞಾನಿ, ರಾಷ್ಟ್ರಪತಿ ಡಾ. ಸರ್ವೇಪಲ್ಲಿ ರಾಧಾಕೃಷ್ಣನ್ ಜನ್ಮದಿನ',
      'ಇಡೀ ದೇಶದ ಶಿಕ್ಷಕ ವೃಂದಕ್ಕೆ ಕೃತಜ್ಞತೆ ಮತ್ತು ಗೌರವ ಸಲ್ಲಿಸುವ ಪವಿತ್ರ ದಿನ',
      'ರಾಧಾಕೃಷ್ಣನ್ ಅವರ ಶಿಕ್ಷಣ ಪ್ರೇಮ ಮತ್ತು ಭಾರತೀಯ ದರ್ಶನಕ್ಕೆ ನೀಡಿದ ಕೊಡುಗೆಗಳ ಸ್ಮರಣೆ',
      'ಶಿಕ್ಷಕರ ತ್ಯಾಗ ಮತ್ತು ಪರಿಶ್ರಮವನ್ನು ಕೊಂಡಾಡಿ ಅವರ ಸೇವೆಗೆ ನಮನ ಸಲ್ಲಿಸುವ ಸಂದರ್ಭ'
    ],
    hintsEn: [
      'September 5: Celebrating birth anniversary of scholar President Dr. Radhakrishnan',
      'Nationwide festival expressing gratitude to the entire teaching fraternity',
      'Remembering Radhakrishnan contributions to philosophy and pedagogy',
      'Cherishing the tireless service of educators shaping next generations'
    ]
  },
  // 20. ಶಿಕ್ಷಣದ ಬೆಳಕಿನಲ್ಲಿ ಶಿಕ್ಷಕರ ಪಾತ್ರ
  {
    id: 'topic-20',
    number: 20,
    titleKn: 'ಶಿಕ್ಷಣದ ಬೆಳಕಿನಲ್ಲಿ ಶಿಕ್ಷಕರ ಪಾತ್ರ - ಅಂಧಕಾರ ಕಳೆವ ಜ್ಞಾನದ ಭಾಸ್ಕರ',
    titleEn: 'Teachers in the Light of Education - Dispelling Shadows',
    category: 'education',
    level: 'open',
    hintsKn: [
      'ತಮಸೋಮಾ ಜ್ಯೋತಿರ್ಗಮಯ - ಅಜ್ಞಾನದ ಕತ್ತಲೆಯಿಂದ ಜ್ಞಾನದ ಬೆಳಕಿನೆಡೆಗೆ ಕೊಂಡೊಯ್ಯುವವರು',
      'ಶಿಕ್ಷಣವು ಕೇವಲ ಉದ್ಯೋಗ ಪಡೆಯುವ ಸಾಧನವಲ್ಲ, ಅದು ಮನುಷ್ಯನನ್ನು ಸನ್ಮಾರ್ಗದಲ್ಲಿ ಮುನ್ನಡೆಸುವ ದೀವಟಿಗೆ',
      'ಮೂಢನಂಬಿಕೆ ಮತ್ತು ಅನಿಷ್ಟ ಪದ್ಧತಿಗಳನ್ನು ತೊಡೆದುಹಾಕಲು ವೈಜ್ಞಾನಿಕ ಮನೋಭಾವ ಬಿತ್ತುವ ಗುರು',
      'ಪ್ರತಿಯೊಬ್ಬ ಮಗುವಿನಲ್ಲಿ ಅಡಗಿರುವ ಜ್ಞಾನದ ದೀಪವನ್ನು ಬೆಳಗಿಸುವ ಪವಿತ್ರ ಕಾರ್ಯ'
    ],
    hintsEn: [
      'Tamasoma Jyotirgamaya - leading minds from darkness to brilliance of truth',
      'Education is not mere livelihood tool, but spiritual light guiding life',
      'Uprooting superstition by fostering scientific temper and rational inquiry',
      'Igniting the dormant flame of intellect inside every young student'
    ]
  },
  // 21. ರಾಷ್ಟ್ರ ನಿರ್ಮಾಣದಲ್ಲಿ ಶಿಕ್ಷಕರ ಕೊಡುಗೆ
  {
    id: 'topic-21',
    number: 21,
    titleKn: 'ರಾಷ್ಟ್ರ ನಿರ್ಮಾಣದಲ್ಲಿ ಶಿಕ್ಷಕರ ಕೊಡುಗೆ - ದೇಶದ ಪ್ರಗತಿಯ ಬೆನ್ನೆಲುಬು',
    titleEn: 'Contribution of Teachers in Nation Building - Pillars of Progress',
    category: 'leaders',
    level: 'open',
    hintsKn: [
      'ಸುಭದ್ರ ರಾಷ್ಟ್ರ ನಿರ್ಮಾಣವಾಗುವುದು ತರಗತಿಗಳಲ್ಲಿ ಬೆಳೆಯುವ ದೇಶಪ್ರೇಮಿ ಯುವಜನರಿಂದ',
      'ದೇಶದ ರಕ್ಷಣೆ, ಆಡಳಿತ, ವಿಜ್ಞಾನ, ಕೃಷಿ ಕ್ಷೇತ್ರಗಳಿಗೆ ದಕ್ಷ ನಾಯಕರನ್ನು ರೂಪಿಸುವವರು ಶಿಕ್ಷಕರು',
      'ಭಾಷೆ, ಗಡಿ, ಜಾತಿ ಮೀರಿದ ವಿಶಾಲ ರಾಷ್ಟ್ರೀಯ ಭಾವೈಕ್ಯತೆಯನ್ನು ಮಕ್ಕಳಲ್ಲಿ ಬಿತ್ತುವ ಜವಾಬ್ದಾರಿ',
      'ಶಿಕ್ಷಕರ ಶ್ರಮವೇ ಭಾರತವನ್ನು ವಿಶ್ವಗುರು ಸ್ಥಾನಕ್ಕೆ ಕೊಂಡೊಯ್ಯುವ ಮಹಾಶಕ್ತಿ'
    ],
    hintsEn: [
      'A great nation is built on patriotic, ethical youth trained in schools',
      'Nurturing leaders across defense, administration, science and agriculture',
      'Sowing seeds of national integration transcending caste, creed and boundary',
      'The silent toil of teachers drives India to its glorious destiny as Vishwaguru'
    ]
  },
  // 22. ಡಿಜಿಟಲ್ ಯುಗದಲ್ಲಿ ಶಿಕ್ಷಕರ ಪಾತ್ರ
  {
    id: 'topic-22',
    number: 22,
    titleKn: 'ಡಿಜಿಟಲ್ ಯುಗದಲ್ಲಿ ಶಿಕ್ಷಕರ ಪಾತ್ರ - ತಂತ್ರಜ್ಞಾನದ ಜೊತೆಗೆ ಮಾನವೀಯ ಸ್ಪರ್ಶ',
    titleEn: 'Role of Teachers in the Digital Era - Human Touch in Tech Age',
    category: 'science',
    level: 'open',
    hintsKn: [
      'ಗೂಗಲ್ ಮಾಹಿತಿ ನೀಡಬಲ್ಲದು, ಆದರೆ ಯಾವುದು ಸರಿ ಯಾವುದು ತಪ್ಪು ಎಂದು ವಿವೇಚನೆ ಕಲಿಸುವವನು ಶಿಕ್ಷಕ',
      'ಆನ್‌ಲೈನ್ ಕಲಿಕಾ ತಂತ್ರಜ್ಞಾನವನ್ನು ಸ್ವತಃ ಕರಗತ ಮಾಡಿಕೊಂಡು ಮಕ್ಕಳಿಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡುವುದು',
      'ಇಂಟರ್ನೆಟ್‌ನ ದುರ್ಬಳಕೆ, ಸೈಬರ್ ಅಪಾಯಗಳಿಂದ ಮಕ್ಕಳನ್ನು ರಕ್ಷಿಸಿ ನೈತಿಕ ಜಾಗೃತಿ ಮೂಡಿಸುವುದು',
      'ತಂತ್ರಜ್ಞಾನವೆಷ್ಟೇ ಬೆಳೆದರೂ ಶಿಕ್ಷಕನ ಪ್ರೀತಿ, ಕರುಣೆ ಮತ್ತು ನೇರ ಪ್ರೇರಣೆಗೆ ಯಾವುದೇ ಪರ್ಯಾಯವಿಲ್ಲ'
    ],
    hintsEn: [
      'Google gives facts, but only a teacher imparts wisdom and discernment',
      'Teachers mastering online tech to mentor students with cutting-edge tools',
      'Guarding children against digital hazards, addiction and cyber pitfalls',
      'No algorithm can replace warmth, compassion and live inspiration of a teacher'
    ]
  },
  // 23. ಮಕ್ಕಳ ಸರ್ವಾಂಗೀಣ ಅಭಿವೃದ್ಧಿಯಲ್ಲಿ ಶಿಕ್ಷಕರ ಪಾತ್ರ
  {
    id: 'topic-23',
    number: 23,
    titleKn: 'ಮಕ್ಕಳ ಸರ್ವಾಂಗೀಣ ಅಭಿವೃದ್ಧಿಯಲ್ಲಿ ಶಿಕ್ಷಕರ ಪಾತ್ರ - ಬೌದ್ಧಿಕ, ಶಾರೀರಿಕ, ಮಾನಸಿಕ ವಿಕಾಸ',
    titleEn: 'Holistic Child Development - Head, Heart and Hand (3H)',
    category: 'education',
    level: 'open',
    hintsKn: [
      'ಶಿಕ್ಷಣವೆಂದರೆ ಕೇವಲ ಪಠ್ಯಪುಸ್ತಕವಲ್ಲ; ಬುದ್ಧಿ, ಭಾವ ಮತ್ತು ಕೌಶಲ್ಯಗಳ ಸಮತೋಲಿತ ವಿಕಾಸ',
      'ಕ್ರೀಡೆ, ಚಿತ್ರಕಲೆ, ಸಾಹಿತ್ಯ, ಭಾಷಣದಂತಹ ಪಠ್ಯೇತರ ಚಟುವಟಿಕೆಗಳಿಗೆ ಪ್ರೋತ್ಸಾಹ',
      'ನಾಯಕತ್ವದ ಗುಣಗಳು, ಸಂವಹನ ಕೌಶಲ್ಯ ಮತ್ತು ಸಾಮಾಜಿಕ ಹೊಂದಾಣಿಕೆಯನ್ನು ಕಲಿಸುವುದು',
      'ಮಗುವಿನ ಮಾನಸಿಕ ಶಕ್ತಿ, ಸೃಜನಶೀಲತೆ ಮತ್ತು ಭಾವನಾತ್ಮಕ ಸಮತೋಲನವನ್ನು ಕಾಪಾಡುವುದು'
    ],
    hintsEn: [
      'True education integrates head, heart and hand for balanced human growth',
      'Encouraging sports, music, painting, drama and public speaking',
      'Cultivating leadership, emotional quotient and social adaptability',
      'Fostering creative confidence and mental resilience in young minds'
    ]
  },
  // 24. ಶಿಕ್ಷಕರಿಗೆ ಗೌರವ ಏಕೆ ಕೊಡಬೇಕು?
  {
    id: 'topic-24',
    number: 24,
    titleKn: 'ಶಿಕ್ಷಕರಿಗೆ ಗೌರವ ಏಕೆ ಕೊಡಬೇಕು? - ಕೃತಜ್ಞತಾ ಭಾವದ ಸಾರ್ಥಕತೆ',
    titleEn: 'Why Revere Teachers? - The Supreme Duty of Gratitude',
    category: 'moral',
    level: 'open',
    hintsKn: [
      'ಸ್ವಂತ ಮಕ್ಕಳಿಗಿಂತ ಹೆಚ್ಚಾಗಿ ತರಗತಿಯ ಪ್ರತಿಯೊಂದು ಮಗುವಿನ ಭವಿಷ್ಯಕ್ಕಾಗಿ ದಿನವಿಡೀ ಶ್ರಮಿಸುವ ನಿಸ್ವಾರ್ಥಿ',
      'ನಮ್ಮ ಬದುಕಿಗೆ ಅಕ್ಷರ, ಭಾಷೆ, ಸಂಸ್ಕಾರ ಮತ್ತು ಉನ್ನತ ಸ್ಥಾನಮಾನ ದೊರಕಿಸಿಕೊಟ್ಟ ಪುಣ್ಯಪುರುಷರು',
      'ಸಮಾಜದಲ್ಲಿ ನೈತಿಕ ಮೌಲ್ಯಗಳನ್ನು ಎತ್ತಿಹಿಡಿಯಲು ಶಿಕ್ಷಕರಿಗೆ ಸಲ್ಲುವ ಗೌರವವೇ ಅಳತೆಗೋಲು',
      'ಗುರುವಿಗೆ ತೋರುವ ಗೌರವವೇ ನಮ್ಮ ಜ್ಞಾನ ಮತ್ತು ಸಂಸ್ಕೃತಿಯ ಉನ್ನತಿಯನ್ನು ತೋರಿಸುತ್ತದೆ'
    ],
    hintsEn: [
      'Toiling unconditionally every day for children far beyond their own family',
      'Bestowing syllables, cultured behavior and wings to fly toward greatness',
      'A civilization stature is measured by how reverently it honors its teachers',
      'Respect toward teachers reflects depth of culture and inner refinement'
    ]
  },
  // 25. ಶಿಕ್ಷಕರು ಮತ್ತು ವಿದ್ಯಾರ್ಥಿಗಳ ನಡುವಿನ ಬಾಂಧವ್ಯ
  {
    id: 'topic-25',
    number: 25,
    titleKn: 'ಶಿಕ್ಷಕರು ಮತ್ತು ವಿದ್ಯಾರ್ಥಿಗಳ ನಡುವಿನ ಬಾಂಧವ್ಯ - ನಂಬಿಕೆ ಮತ್ತು ಪರಸ್ಪರ ಪ್ರೇರಣೆ',
    titleEn: 'Bond Between Teacher & Student - Mutual Trust & Empathy',
    category: 'education',
    level: 'open',
    hintsKn: [
      'ಭಯಮುಕ್ತ ಮತ್ತು ಮುಕ್ತ ಸಂವಾದದ ಸ್ನೇಹಮಯ ತರಗತಿ ವಾತಾವರಣ ನಿರ್ಮಿಸುವುದು',
      'ವಿದ್ಯಾರ್ಥಿಯ ಕಷ್ಟ-ಸುಖಗಳಿಗೆ ಕಿವಿಯಾಗಿ ಸಾಂತ್ವನ ಹೇಳುವ ತಾಯಿಯಂತಹ ಹೃದಯ',
      'ಕಲಿಕೆಯಲ್ಲಿ ಹಿಂದುಳಿದ ಮಗುವನ್ನು ಪ್ರೀತಿಯಿಂದ ಕೈಹಿಡಿದು ಮೇಲೆತ್ತುವ ವಿಶೇಷ ಕಾಳಜಿ',
      'ಶಾಲಾ ದಿನಗಳು ಮುಗಿದ ನಂತರವೂ ಬದುಕಿನುದ್ದಕ್ಕೂ ಹಸಿರಾಗಿ ಉಳಿಯುವ ಆಪ್ತ ನೆನಪುಗಳು'
    ],
    hintsEn: [
      'Fostering trust and open communication in cheerful classroom ecosystem',
      'Listening empathetically to students concerns with maternal tenderness',
      'Extra care lifting up struggling children to achieve their full potential',
      'Cherished memories of mentorship that remain green throughout adult life'
    ]
  },
  // 26. “ಗುರುವೇ ದಾರಿ ತೋರಿಸುವ ದೀಪ” – ಶಿಕ್ಷಕರ ಮಹತ್ವ
  {
    id: 'topic-26',
    number: 26,
    titleKn: '“ಗುರುವೇ ದಾರಿ ತೋರಿಸುವ ದೀಪ” – ಬದುಕಿನ ಕತ್ತಲೆಯನ್ನು ಓಡಿಸುವ ಬೆಳಕು',
    titleEn: '"Guru is the Guiding Lamp" - Illuminating Life’s Path',
    category: 'culture',
    level: 'open',
    hintsKn: [
      'ಜೀವನದ ಕವಲು ದಾರಿಗಳಲ್ಲಿ ಗೊಂದಲಕ್ಕೊಳಗಾದಾಗ ಸರಿಯಾದ ಮಾರ್ಗ ತೋರಿಸುವ ದಾರಿದೀಪ ಗುರು',
      'ಗಾಳಿಯ ಅಲೆಗಳಿಗೆ ನಲುಗುವ ಹಡಗಿಗೆ ದಡ ತೋರಿಸುವ ದೀಪಸ್ತಂಭದಂತೆ ಶಿಕ್ಷಕರ ಮಾರ್ಗದರ್ಶನ',
      'ಅಹಂಕಾರ ಮತ್ತು ಕೀಳರಿಮೆಯನ್ನು ತೊಡೆದು ಸತ್ಯ ಮತ್ತು ಧರ್ಮದ ಮಾರ್ಗದಲ್ಲಿ ನಡೆಸುವುದು',
      'ಗುರು ತೋರಿದ ದಾರಿಯಲ್ಲಿ ಸಾಗಿದವನು ಎಂದಿಗೂ ಹಾದಿ ತಪ್ಪಲಾರನು ಎಂಬ ವಿಶ್ವಾಸ'
    ],
    hintsEn: [
      'Lighthouse showing clear shore when youth are adrift in crossroads of life',
      'Guiding ships through storms of doubt, temptation and adversity',
      'Cleansing false ego and inferiority complex with truth and righteousness',
      'One who walks in the light of Guru steps never falters in destiny'
    ]
  },
  // 27. ಶಿಕ್ಷಕರು ರಾಷ್ಟ್ರ ನಿರ್ಮಾತೃಗಳು
  {
    id: 'topic-27',
    number: 27,
    titleKn: 'ಶಿಕ್ಷಕರು ರಾಷ್ಟ್ರ ನಿರ್ಮಾತೃಗಳು - ದೇಶದ ಭವಿಷ್ಯದ ರೂವಾರಿಗಳು',
    titleEn: 'Teachers: The True Nation Builders',
    category: 'leaders',
    level: 'open',
    hintsKn: [
      'ದೇಶದ ಪ್ರತಿಯೊಂದು ಸಂಸ್ಥೆ ಮತ್ತು ವ್ಯವಸ್ಥೆಯನ್ನು ಮುನ್ನಡೆಸುವ ನಾಯಕರನ್ನು ಸೃಷ್ಟಿಸುವವರು ಶಿಕ್ಷಕರು',
      'ತರಗತಿಯಲ್ಲಿ ಕಲಿಸುವ ಶಿಸ್ತು, ಪ್ರಾಮಾಣಿಕತೆ ಮತ್ತು ದೇಶಭಕ್ತಿಯೇ ದೇಶದ ನೈತಿಕ ಶಕ್ತಿ',
      'ಯಾವುದೇ ದೇಶದ ಸಂಪತ್ತು ಕೇವಲ ಚಿನ್ನ-ಹಣದಲ್ಲಿಲ್ಲ, ಅದು ಅಲ್ಲಿನ ಸುಶಿಕ್ಷಿತ ನಾಗರಿಕರಲ್ಲಿದೆ',
      'ರಾಷ್ಟ್ರದ ಏಳಿಗೆಗೆ ಸಮರ್ಪಿಸಿಕೊಂಡ ಶಿಕ್ಷಕರೇ ನಿಜವಾದ ಭಾರತ ರತ್ನಗಳು'
    ],
    hintsEn: [
      'Generating innovators, soldiers, judges and leaders for institutions of nation',
      'Integrity and civic discipline inculcated in school form moral muscle of India',
      'True wealth of a country lies not in gold, but in its educated ethical populace',
      'Teachers dedicating lifetimes to youth empowerment are the true national jewels'
    ]
  },
  // 28. ಮಹಿಳಾ ಸಬಲೀಕರಣದಲ್ಲಿ ಶಿಕ್ಷಣದ ಪಾತ್ರ
  {
    id: 'topic-28',
    number: 28,
    titleKn: 'ಮಹಿಳಾ ಸಬಲೀಕರಣದಲ್ಲಿ ಶಿಕ್ಷಣದ ಪಾತ್ರ - ಸ್ವಾಭಿಮಾನಿ ನಾರಿಯ ನವೋದಯ',
    titleEn: 'Role of Education in Womens Empowerment - Savitribai Phule Vision',
    category: 'leaders',
    level: 'open',
    hintsKn: [
      'ಒಬ್ಬ ಪುರುಷ ಕಲಿತರೆ ಆತ ಮಾತ್ರ ಕಲಿಯುತ್ತಾನೆ, ಒಬ್ಬ ಮಹಿಳೆ ಕಲಿತರೆ ಇಡೀ ಕುಟುಂಬವೇ ಕಲಿಯುತ್ತದೆ',
      'ಭಾರತದ ಪ್ರಥಮ ಶಿಕ್ಷಕಿ ಕ್ರಾಂತಜ್ಯೋತಿ ಸಾವಿತ್ರಿಬಾಯಿ ಫುಲೆ ಅವರ ಐತಿಹಾಸಿಕ ಹೋರಾಟದ ಸ್ಮರಣೆ',
      'ಶಿಕ್ಷಣದಿಂದ ಹೆಣ್ಣುಮಕ್ಕಳಲ್ಲಿ ಸ್ವಾಭಿಮಾನ, ಆರ್ಥಿಕ ಸ್ವಾವಲಂಬನೆ ಮತ್ತು ನಿರ್ಧಾರ ಕೈಗೊಳ್ಳುವ ಶಕ್ತಿ',
      'ಲಿಂಗ ತಾರತಮ್ಯ ಹೋಗಲಾಡಿಸಿ ಸಮಾಜದ ಎಲ್ಲಾ ರಂಗಗಳಲ್ಲೂ ಮಹಿಳೆಯರ ಸಮಾನ ಪ್ರಾತಿನಿಧ್ಯ'
    ],
    hintsEn: [
      'Educate a man, you educate an individual; educate a woman, you educate a family',
      'Tribute to Savitribai Phule: pioneer of girls education against all odds',
      'Education gives women self-reliance, dignity and economic independence',
      'Eradicating gender discrimination and opening leadership paths for women'
    ]
  },
  // 29. ಸ್ವಚ್ಛ ಭಾರತ
  {
    id: 'topic-29',
    number: 29,
    titleKn: 'ಸ್ವಚ್ಛ ಭಾರತ - ನೈರ್ಮಲ್ಯವೇ ಸೇವೆಯ ಸಂಕಲ್ಪ',
    titleEn: 'Swachh Bharat - Cleanliness is Civic Devotion & Health',
    category: 'environment',
    level: 'open',
    hintsKn: [
      'ಸ್ವಚ್ಛತೆಯೇ ಸೇವೆ - ಮಹಾತ್ಮ ಗಾಂಧೀಜಿಯವರ ಕನಸಿನ ಸ್ವಚ್ಛ, ಸುಂದರ ಭಾರತ ನಿರ್ಮಾಣ',
      'ಪರಿಸರ ನೈರ್ಮಲ್ಯ ಮತ್ತು ವೈಯಕ್ತಿಕ ನೈರ್ಮಲ್ಯವು ರೋಗಮುಕ್ತ ಆರೋಗ್ಯಕ್ಕೆ ಅತ್ಯಗತ್ಯ',
      'ಪ್ಲಾಸ್ಟಿಕ್ ಮುಕ್ತ ಶಾಲೆ ಮತ್ತು ಪರಿಸರ ನಿರ್ಮಾಣಕ್ಕೆ ಶಾಲಾ ಮಕ್ಕಳಿಂದಲೇ ಜಾಗೃತಿ',
      'ಕಸವನ್ನು ಕಂಡ ಕಂಡಲ್ಲಿ ಎಸೆಯದೆ ಕಸದಬುಟ್ಟಿಗೆ ಹಾಕುವ ನಾಗರಿಕ ಪ್ರಜ್ಞೆ ಮತ್ತು ಜವಾಬ್ದಾರಿ'
    ],
    hintsEn: [
      'Cleanliness is service: realizing Mahatma Gandhis vision of clean India',
      'Hygiene of body and surroundings is indispensable for disease-free life',
      'Eliminating single-use plastic through student-led awareness drives',
      'Civic sense of segregating waste and keeping public spaces pristine'
    ]
  },
  // 30. ಪರಿಸರ ಸಂರಕ್ಷಣೆ ನಮ್ಮ ಕರ್ತವ್ಯ
  {
    id: 'topic-30',
    number: 30,
    titleKn: 'ಪರಿಸರ ಸಂರಕ್ಷಣೆ ನಮ್ಮ ಕರ್ತವ್ಯ - ಹಸಿರು ಧರೆಯೇ ಉಸಿರು',
    titleEn: 'Environmental Conservation: Our Foremost Duty',
    category: 'environment',
    level: 'open',
    hintsKn: [
      'ಪ್ರಕೃತಿ ನಮಗೆ ಜೀವವಾಯು, ನೀರು, ಆಹಾರ ನೀಡುವ ದೈವಿಕ ತಾಯಿ; ಅದನ್ನು ರಕ್ಷಿಸುವುದು ಕರ್ತವ್ಯ',
      'ಮರಗಳನ್ನು ಬೆಳೆಸುವುದು (ಸಾಲುಮರದ ತಿಮ್ಮಕ್ಕನವರ ಪ್ರೇರಣೆ), ಅರಣ್ಯನಾಶ ಮತ್ತು ಮಾಲಿನ್ಯ ತಡೆಗಟ್ಟುವುದು',
      'ಜಾಗತಿಕ ತಾಪಮಾನ ಏರಿಕೆ (ಗ್ಲೋಬಲ್ ವಾರ್ಮಿಂಗ್) ಮತ್ತು ಹವಾಮಾನ ವೈಪರೀತ್ಯದ ವಿರುದ್ಧ ಎಚ್ಚರ',
      'ಮಳೆನೀರು ಕೊಯ್ಲು, ನೈಸರ್ಗಿಕ ಸಂಪನ್ಮೂಲಗಳ ಮಿತಬಳಕೆ ಮತ್ತು ಮುಂದಿನ ಪೀಳಿಗೆಗೆ ಹಸಿರು ಭೂಮಿ ಉಳಿಸುವುದು'
    ],
    hintsEn: [
      'Nature is maternal bounty providing air, water and food; our duty to preserve',
      'Planting trees inspired by Saalumarada Thimmakka; stopping deforestation',
      'Combating global warming and plastic crisis through conscious daily habits',
      'Rainwater harvesting and conserving resources for future generations'
    ]
  },
  // 31. ಗ್ರಾಮೀಣ ಶಿಕ್ಷಣದ ಸವಾಲುಗಳು
  {
    id: 'topic-31',
    number: 31,
    titleKn: 'ಗ್ರಾಮೀಣ ಶಿಕ್ಷಣದ ಸವಾಲುಗಳು - ಸಮಾನ ಅವಕಾಶಗಳ ಸಬಲೀಕರಣ',
    titleEn: 'Challenges and Prospects in Rural Education',
    category: 'current',
    level: 'open',
    hintsKn: [
      'ಭಾರತದ ಆತ್ಮ ಹಳ್ಳಿಗಳಲ್ಲಿದೆ; ಗ್ರಾಮೀಣ ಪ್ರದೇಶದ ಶಾಲೆಗಳ ಮೂಲಸೌಕರ್ಯ ಬಲವರ್ಧನೆ',
      'ವಿದ್ಯುತ್, ಇಂಟರ್ನೆಟ್, ಸಾರಿಗೆ ಕೊರತೆಗಳ ನಡುವೆಯೂ ಶಿಕ್ಷಕರ ಅಪ್ರತಿಮ ಸೇವಾ ಮನೋಭಾವ',
      'ಗ್ರಾಮೀಣ ಮಕ್ಕಳಲ್ಲಿರುವ ಅಪ್ರತಿಮ ಪ್ರತಿಭೆಯನ್ನು ಗುರುತಿಸಿ ಸಮಾನ ವೇದಿಕೆ ಕಲ್ಪಿಸುವುದು',
      'ಸರ್ಕಾರಿ ಶಾಲೆಗಳ ಸಬಲೀಕರಣ ಮತ್ತು ಸಮುದಾಯದ ಸಹಕಾರದಿಂದ ಶಾಲಾ ಪ್ರಗತಿ'
    ],
    hintsEn: [
      'India lives in her villages: strengthening infrastructure in rural schools',
      'Rural teachers showing phenomenal dedication despite logistical hurdles',
      'Unleashing extraordinary rustic talent on equal state and national stages',
      'Empowering public government schools with strong community support'
    ]
  },
  // 32. ವೈವಿಧ್ಯತೆಯಲ್ಲಿ ಏಕತೆ
  {
    id: 'topic-32',
    number: 32,
    titleKn: 'ವೈವಿಧ್ಯತೆಯಲ್ಲಿ ಏಕತೆ - ಭಾರತೀಯ ಸಂಸ್ಕೃತಿಯ ಅದ್ಭುತ ವೈಭವ',
    titleEn: 'Unity in Diversity - The Glorious Fabric of India',
    category: 'culture',
    level: 'open',
    hintsKn: [
      'ನೂರಾರು ಭಾಷೆಗಳು, ಧರ್ಮಗಳು, ಆಚಾರ-ವಿಚಾರಗಳಿದ್ದರೂ ನಾವೆಲ್ಲರೂ ಒಂದೇ ಎಂಬ ಭಾರತೀಯತೆ',
      'ಭಿನ್ನ ಭಿನ್ನ ಹೂವುಗಳು ಸೇರಿ ಸುಂದರ ಹಾರವಾಗುವಂತೆ ಭಾರತದ ಬಹುಸಂಸ್ಕೃತಿ',
      'ಪರಸ್ಪರ ಗೌರವ, ಧಾರ್ಮಿಕ ಸಹಿಷ್ಣುತೆ ಮತ್ತು ಸೌಹಾರ್ದತೆಯೇ ನಮ್ಮ ನೈಜ ಬಲ',
      'ರಾಷ್ಟ್ರಧ್ವಜ ಮತ್ತು ರಾಷ್ಟ್ರಗೀತೆಯಡಿ ಎಲ್ಲರೂ ಒಂದಾಗಿ ನಿಲ್ಲುವ ಭಾವೈಕ್ಯತೆ'
    ],
    hintsEn: [
      'Hundreds of languages and customs bound by single heartbeat of Indianness',
      'Different fragrant blossoms weaving into one spectacular floral garland',
      'Mutual respect, religious tolerance and fraternal love form our core strength',
      'Standing shoulder to shoulder under the Tricolor singing national anthem'
    ]
  },
  // 33. ಭಾರತದ ಭವಿಷ್ಯ ಮತ್ತು ಯುವ ಜನತೆ
  {
    id: 'topic-33',
    number: 33,
    titleKn: 'ಭಾರತದ ಭವಿಷ್ಯ ಮತ್ತು ಯುವ ಜನತೆ - ಸ್ವಾಮಿ ವಿವೇಕಾನಂದರ ಕನಸಿನ ನವಭಾರತ',
    titleEn: 'Future of India and Youth Power - Swami Vivekananda Vision',
    category: 'leaders',
    level: 'open',
    hintsKn: [
      'ಪ್ರಪಂಚದಲ್ಲೇ ಅತಿ ಹೆಚ್ಚು ಯುವಜನತೆಯನ್ನು ಹೊಂದಿರುವ ಯುವ ಭಾರತದ ಚೈತನ್ಯ',
      'ಯುವಕರು ದೇಶದ ಭವಿಷ್ಯ ಮಾತ್ರವಲ್ಲ, ವರ್ತಮಾನದ ಅತ್ಯುನ್ನತ ಪರಿವರ್ತನಾ ಶಕ್ತಿ',
      'ಕೌಶಲ್ಯ, ತಂತ್ರಜ್ಞಾನ, ನವೋದ್ಯಮ (Startups) ಮತ್ತು ಕ್ರೀಡೆಗಳಲ್ಲಿ ಜಾಗತಿಕ ಸಾಧನೆ',
      'ದುಶ್ಚಟಗಳಿಂದ ದೂರವಿದ್ದು ರಾಷ್ಟ್ರ ನಿರ್ಮಾಣ ಕಾರ್ಯದಲ್ಲಿ ಸಕ್ರಿಯವಾಗಿ ಪಾಲ್ಗೊಳ್ಳುವ ಸಂಕಲ್ಪ'
    ],
    hintsEn: [
      'India holds worlds largest youthful population brimming with energy',
      'Youth are not merely future, but dynamic drivers of the present',
      'Shining globally in startups, scientific research, art and sports',
      'Staying free from addictions and dedicating energy to national resurgence'
    ]
  },
  // 34. ಸಂವಿಧಾನಿಕ ಮೌಲ್ಯಗಳ ಮಹತ್ವ
  {
    id: 'topic-34',
    number: 34,
    titleKn: 'ಸಂವಿಧಾನಿಕ ಮೌಲ್ಯಗಳ ಮಹತ್ವ - ಡಾ. ಬಿ.ಆರ್. ಅಂಬೇಡ್ಕರ್ ಅವರ ಕೊಡುಗೆ',
    titleEn: 'Significance of Constitutional Values - Dr. B.R. Ambedkar Vision',
    category: 'leaders',
    level: 'open',
    hintsKn: [
      'ಭಾರತದ ಸಂವಿಧಾನವು ಪ್ರತಿಯೊಬ್ಬ ಪ್ರಜೆಗೂ ನ್ಯಾಯ, ಸ್ವಾತಂತ್ರ್ಯ, ಸಮಾನತೆ ಮತ್ತು ಭ್ರಾತೃತ್ವ ನೀಡಿದೆ',
      'ಡಾ. ಬಿ.ಆರ್. ಅಂಬೇಡ್ಕರ್ ಅವರ ದಾರ್ಶನಿಕ ಸಂವಿಧಾನ ರಚನೆಯ ಮಹತ್ವ',
      'ಹಕ್ಕುಗಳ ಜೊತೆಗೆ ಕರ್ತವ್ಯಗಳನ್ನೂ ಪಾಲಿಸುವ ಜವಾಬ್ದಾರಿಯುತ ಪ್ರಜಾಪ್ರಭುತ್ವದ ಅರಿವು',
      'ಸಂವಿಧಾನದ ಪೀಠಿಕೆಯ ಆಶಯಗಳನ್ನು ಪ್ರತಿಯೊಬ್ಬ ವಿದ್ಯಾರ್ಥಿಯೂ ಮೈಗೂಡಿಸಿಕೊಳ್ಳುವುದು'
    ],
    hintsEn: [
      'Guarantees justice, liberty, equality and fraternity to every citizen',
      'Tribute to Dr. B.R. Ambedkar monumental vision drafting the Constitution',
      'Balancing fundamental rights with conscientious constitutional duties',
      'Inculcating the preamble values into everyday student life and civic thought'
    ]
  },
  // 35. ಸಸ್ಯಹಾರ ಮತ್ತು ಆರೋಗ್ಯಕರ ಜೀವನ
  {
    id: 'topic-35',
    number: 35,
    titleKn: 'ಸಸ್ಯಹಾರ ಮತ್ತು ಆರೋಗ್ಯಕರ ಜೀವನ - ಅಹಿಂಸೆ ಮತ್ತು ಪೌಷ್ಟಿಕತೆಯ ಮೇಳೈಕೆ',
    titleEn: 'Vegetarianism and Healthy Living - Nutrition & Compassion',
    category: 'environment',
    level: 'open',
    hintsKn: [
      'ಪ್ರಕೃತಿದತ್ತ ಹಣ್ಣು, ತರಕಾರಿ, ಧಾನ್ಯಗಳು, ಬೇಳೆಕಾಳುಗಳ ಪೌಷ್ಟಿಕ ಮಹತ್ವ',
      'ಸಸ್ಯಹಾರದಿಂದ ಜೀರ್ಣಕ್ರಿಯೆ ಸುಲಭ, ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ವೃದ್ಧಿ ಮತ್ತು ದೀರ್ಘಾಯುಷ್ಯ',
      'ಪ್ರಾಣಿ ದಯೆ, ಅಹಿಂಸೆ ಮತ್ತು ಪರಿಸರ ಸಮತೋಲನಕ್ಕೆ ಸಸ್ಯಹಾರ ನೀಡುವ ಮಹಾನ್ ಕೊಡುಗೆ',
      'ಸತ್ವಯುತ ಸಾತ್ವಿಕ ಆಹಾರವು ಮನಸ್ಸನ್ನು ಶಾಂತವಾಗಿ ಮತ್ತು ಏಕಾಗ್ರತೆಯಿಂದ ಇರಿಸುತ್ತದೆ'
    ],
    hintsEn: [
      'Nutritional richness of vegetables, fruits, whole grains and lentils',
      'Easy digestion, enhanced immunity, lighter carbon footprint and longevity',
      'Compassion to all living beings: non-violence at the dining table',
      'Sattvic nourishment promotes mental clarity, tranquility and focus'
    ]
  },
  // 36. ವಿಶ್ವ ಶಾಂತಿಗೆ ಶಿಕ್ಷಣದ ಕೊಡುಗೆಗಳು
  {
    id: 'topic-36',
    number: 36,
    titleKn: 'ವಿಶ್ವ ಶಾಂತಿಗೆ ಶಿಕ್ಷಣದ ಕೊಡುಗೆಗಳು - ಯುದ್ಧ ರಹಿತ ಸಾಮರಸ್ಯದ ಜಗತ್ತು',
    titleEn: 'Contribution of Education towards World Peace - Universal Harmony',
    category: 'current',
    level: 'open',
    hintsKn: [
      'ಯುದ್ಧಗಳು ಮೊದಲು ಹುಟ್ಟುವುದು ಮಾನವನ ಮನಸ್ಸಿನಲ್ಲಿ, ಶಾಂತಿಯ ರಕ್ಷಣೆಯೂ ಮನಸ್ಸಿನಲ್ಲೇ ಆಗಬೇಕು',
      'ದ್ವೇಷ, ಅಸಹನೆ ಮತ್ತು ಹಿಂಸೆಯನ್ನು ಹೋಗಲಾಡಿಸಿ ಮಾನವೀಯ ಪ್ರೇಮವನ್ನು ಬಿತ್ತುವ ಶಿಕ್ಷಣ',
      'ವಸುದೈವ ಕುಟುಂಬಕಂ - ಇಡೀ ವಿಶ್ವವೇ ಒಂದು ಸುಂದರ ಕುಟುಂಬವೆಂಬ ವಿಶಾಲ ಮನೋಭಾವ',
      'ಸಂವಾದ, ಮಾತುಕತೆ ಮತ್ತು ಅಹಿಂಸೆಯ ಮೂಲಕ ಜಾಗತಿಕ ಸಮಸ್ಯೆಗಳನ್ನು ಬಗೆಹರಿಸುವ ಬುದ್ಧಿವಂತಿಕೆ'
    ],
    hintsEn: [
      'Wars begin in the minds of men; it is in minds that defenses of peace must rise',
      'Education uprooting hatred and replacing it with universal empathy',
      'Vasudhaiva Kutumbakam: treating the entire planet as one loving family',
      'Resolving conflicts through dialogue, mutual respect and non-violence'
    ]
  },
  // 37. ಕ್ರೀಡೆ ಮತ್ತು ಶಿಕ್ಷಣದ ಸಮತೋಲನ
  {
    id: 'topic-37',
    number: 37,
    titleKn: 'ಕ್ರೀಡೆ ಮತ್ತು ಶಿಕ್ಷಣದ ಸಮತೋಲನ - ಮಾನಸಿಕ ಮತ್ತು ಶಾರೀರಿಕ ಪರಿಪೂರ್ಣತೆ',
    titleEn: 'Harmonizing Sports and Academics - Mind & Body Equilibrium',
    category: 'education',
    level: 'open',
    hintsKn: [
      'ಕೇವಲ ಪುಸ್ತಕದ ಹುಳುವಾಗದೆ ಮೈದಾನದಲ್ಲಿ ಆಟವಾಡುವುದರಿಂದ ದೈಹಿಕ ಸಾಮರ್ಥ್ಯ ಹೆಚ್ಚುತ್ತದೆ',
      'ಕ್ರೀಡೆಗಳು ಶಿಸ್ತು, ತಂಡ ಸ್ಪೂರ್ತಿ, ಸೋಲೊಪ್ಪಿಕೊಳ್ಳುವ ಕ್ರೀಡಾ ಮನೋಭಾವ ಕಲಿಸುತ್ತವೆ',
      'ಓದು ಮತ್ತು ಆಟ ಎರಡರಲ್ಲೂ ಸಮತೋಲನ ಕಾಯ್ದುಕೊಂಡಾಗ ಮಾತ್ರ ಸರ್ವಾಂಗೀಣ ವಿಕಾಸ ಸಾಧ್ಯ',
      'ದೈಹಿಕ ಕಸರತ್ತು ಮೆದುಳನ್ನು ಸದಾ ಚುರುಕಾಗಿ ಮತ್ತು ಒತ್ತಡರಹಿತವಾಗಿ ಇಡುತ್ತದೆ'
    ],
    hintsEn: [
      'Playground develops physical stamina alongside intellectual study',
      'Sports instill discipline, teamwork, sportsman spirit and resilience',
      'Balanced life between books and playground yields true human mastery',
      'Physical activity refreshes neurological sharpness and relieves academic stress'
    ]
  },
  // 38. ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣದಲ್ಲಿ ಮೌಲ್ಯ ಶಿಕ್ಷಣದ ಮಹತ್ವ
  {
    id: 'topic-38',
    number: 38,
    titleKn: 'ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣದಲ್ಲಿ ಮೌಲ್ಯ ಶಿಕ್ಷಣದ ಮಹತ್ವ - ಎಳೆಯ ವಯಸ್ಸಿನಲ್ಲೇ ಸಂಸ್ಕಾರದ ಬಿತ್ತನೆ',
    titleEn: 'Moral Education in Primary School - Sowing Character Early',
    category: 'moral',
    level: 'open',
    hintsKn: [
      'ಗಿಡವಾಗಿ ಬಗ್ಗದ್ದು ಮರವಾಗಿ ಬಗ್ಗೀತೇ - ಎಳೆಯ ವಯಸ್ಸಿನಲ್ಲಿ ಕಲಿತ ಸಂಸ್ಕಾರವೇ ಜೀವನಪರ್ಯಂತ ಉಳಿಯುತ್ತದೆ',
      'ಕಥೆಗಳು, ಹಾಡುಗಳು ಮತ್ತು ಪ್ರತ್ಯಕ್ಷ ನಿದರ್ಶನಗಳ ಮೂಲಕ ಪ್ರಾಮಾಣಿಕತೆ, ಸಹಾನುಭೂತಿ ಕಲಿಸುವುದು',
      'ಪ್ರಕೃತಿ ಪ್ರೇಮ, ಹಿರಿಯರನ್ನು ಗೌರವಿಸುವುದು ಮತ್ತು ಸತ್ಯ ನುಡಿಯುವ ಸುಂದರ ಹವ್ಯಾಸಗಳು',
      'ಪ್ರಾಥಮಿಕ ಶಾಲಾ ಶಿಕ್ಷಕರ ಆದರ್ಶ ನಡವಳಿಕೆಯೇ ಮಕ್ಕಳಿಗೆ ಜೀವಂತ ಪಾಠ'
    ],
    hintsEn: [
      'Bend the twig, shape the tree: early childhood impressions last a lifetime',
      'Teaching honesty, kindness and sharing via folk tales and songs',
      'Instilling love for nature, truthfulness and reverence for elders',
      'Primary teacher exemplary conduct serves as children living textbook'
    ]
  },
  // 39. ಡಿಜಿಟಲ್ ಯುಗದಲ್ಲಿ ಶಿಕ್ಷಕರ ಜವಾಬ್ದಾರಿಗಳು
  {
    id: 'topic-39',
    number: 39,
    titleKn: 'ಡಿಜಿಟಲ್ ಯುಗದಲ್ಲಿ ಶಿಕ್ಷಕರ ಜವಾಬ್ದಾರಿಗಳು - ನವ ಪೀಳಿಗೆಯ ಸೈಬರ್ ದಾರಿದೀಪ',
    titleEn: 'Responsibilities of Teachers in the Digital Age - Modern Mentors',
    category: 'science',
    level: 'open',
    hintsKn: [
      'ಡಿಜಿಟಲ್ ಮಾಹಿತಿಯ ಮಹಾಪೂರದಲ್ಲಿ ಯಾವುದು ಸತ್ಯ, ಯಾವುದು ಸುಳ್ಳು ಎಂದು ತಿಳಿಸುವ ವಿವೇಚನೆ',
      'ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ಸ್ಕ್ರೀನ್ ವ್ಯಸನ ಮತ್ತು ಗೇಮಿಂಗ್ ಚಟದಿಂದ ಪಾರುಮಾಡಿ ಸೃಜನಶೀಲತೆಗೆ ತಿರುಗಿಸುವುದು',
      'ಆನ್‌ಲೈನ್ ಶಿಕ್ಷಣದ ಜೊತೆಗೆ ಮುಖಾಮುಖಿ ಸಂವಾದ ಮತ್ತು ಮಾನವೀಯ ಮೌಲ್ಯಗಳನ್ನು ಗಟ್ಟಿಗೊಳಿಸುವುದು',
      'ಭವಿಷ್ಯದ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI) ಮತ್ತು ತಂತ್ರಜ್ಞಾನಕ್ಕೆ ನೈತಿಕ ಚೌಕಟ್ಟು ಒದಗಿಸುವುದು'
    ],
    hintsEn: [
      'Teaching discrimination between authentic knowledge and fake digital noise',
      'Protecting students from screen addiction, steering towards creative creation',
      'Preserving human warmth and live dialogues alongside remote learning',
      'Providing an ethical compass for artificial intelligence and modern tech'
    ]
  },
  // 40. ಸಮಯ ನಿರ್ವಹಣೆಯ ಮಹತ್ವ
  {
    id: 'topic-40',
    number: 40,
    titleKn: 'ಸಮಯ ನಿರ್ವಹಣೆಯ ಮಹತ್ವ - ಕ್ಷಣ ಕ್ಷಣವೂ ಅಮೂಲ್ಯ ಸಾಧನೆಯ ಹೆಜ್ಜೆ',
    titleEn: 'The Art of Time Management - Every Second is a Golden Chance',
    category: 'moral',
    level: 'open',
    hintsKn: [
      'ಕಳೆದುಹೋದ ಹಣ ಸಂಪಾದಿಸಬಹುದು, ಕಳೆದುಹೋದ ಸಮಯವನ್ನು ಎಂದಿಗೂ ಮರಳಿ ತರಲಾಗದು',
      'ವಿದ್ಯಾರ್ಥಿ ಜೀವನದಲ್ಲಿ ದಿನಚರಿಯ ಯೋಜನೆ, ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ಆದ್ಯತೆಗಳ ನಿರ್ಧಾರ',
      'ಮುಂದೂಡುವ ಹವ್ಯಾಸವನ್ನು (Procrastination) ಬಿಟ್ಟು ಇಂದಿನ ಕೆಲಸವನ್ನು ಇಂದೇ ಮಾಡುವ ಶಿಸ್ತು',
      'ಸಮಯವನ್ನು ಸರಿಯಾಗಿ ನಿರ್ವಹಿಸಿದ ವ್ಯಕ್ತಿಯು ಜೀವನದ ಎಲ್ಲಾ ರಂಗಗಳಲ್ಲೂ ಯಶಸ್ವಿಯಾಗುತ್ತಾನೆ'
    ],
    hintsEn: [
      'Lost wealth can be regained, but lost time can never be retrieved',
      'Planning daily timetable, prioritizing important tasks over trivialities',
      'Overcoming procrastination: completing todays duty today itself',
      'Mastery over time is the secret behind every great achiever in history'
    ]
  },
  // 41. ಧ್ಯಾನ ಮತ್ತು ಏಕಾಗ್ರತೆ
  {
    id: 'topic-41',
    number: 41,
    titleKn: 'ಧ್ಯಾನ ಮತ್ತು ಏಕಾಗ್ರತೆ - ಪ್ರಶಾಂತ ಮನಸ್ಸೇ ವಿಜಯದ ಗುಟ್ಟು',
    titleEn: 'Meditation and Concentration - Calm Mind Unlocks Mastery',
    category: 'moral',
    level: 'open',
    hintsKn: [
      'ಚಂಚಲ ಮನಸ್ಸನ್ನು ನಿಯಂತ್ರಿಸಿ ಏಕಾಗ್ರತೆಯನ್ನು ಸಾಧಿಸಲು ನಿತ್ಯ ಧ್ಯಾನವೇ ದಿವ್ಯೌಷಧ',
      'ಪರೀಕ್ಷಾ ಭಯ, ಆತಂಕ ಮತ್ತು ಒತ್ತಡವನ್ನು ನಿವಾರಿಸಿ ಸ್ಮರಣಶಕ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸುವ ವಿಧಾನ',
      'ದಿನಕ್ಕೆ ೧೦ ನಿಮಿಷಗಳ ಧ್ಯಾನವು ಆಂತರಿಕ ಶಾಂತಿ, ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ಸ್ಪಷ್ಟ ಆಲೋಚನೆ ನೀಡುತ್ತದೆ',
      'ಯೋಗ ಮತ್ತು ಪ್ರಾಣಾಯಾಮವು ಮಾನಸಿಕ ಹಾಗೂ ಬೌದ್ಧಿಕ ಬೆಳವಣಿಗೆಗೆ ಪೂರಕ'
    ],
    hintsEn: [
      'Meditation is the panacea for taming a restless wandering intellect',
      'Dissolving exam anxiety while amplifying photographic memory recall',
      '10 minutes of daily mindfulness bestows immense calm and focus',
      'Pranayama and breath awareness empowering overall cognitive vigor'
    ]
  },
  // 42. ಪುಸ್ತಕಗಳು ನಮ್ಮ ಉತ್ತಮ ಸ್ನೇಹಿತರು
  {
    id: 'topic-42',
    number: 42,
    titleKn: 'ಪುಸ್ತಕಗಳು ನಮ್ಮ ಉತ್ತಮ ಸ್ನೇಹಿತರು - ಎಂದಿಗೂ ದ್ರೋಹ ಬಗೆಯದ ಆಪ್ತ ಒಡನಾಡಿ',
    titleEn: 'Books: Our Truest and Lifelong Best Friends',
    category: 'education',
    level: 'open',
    hintsKn: [
      'ನಾವೊಬ್ಬರೇ ಇದ್ದಾಗಲೂ ಎಂದಿಗೂ ಒಂಟಿತನ ಕಾಡದಂತೆ ಜ್ಞಾನ ಮತ್ತು ಸಂತೋಷ ನೀಡುವ ಸಂಗಾತಿ',
      'ನಮ್ಮನ್ನು ಜಗತ್ತಿನ ಯಾವುದೇ ಕಾಲ ಮತ್ತು ಪ್ರದೇಶಕ್ಕೆ ಕ್ಷಣಮಾತ್ರದಲ್ಲಿ ಕೊಂಡೊಯ್ಯುವ ಮಂತ್ರದಂಡ',
      'ಒಳ್ಳೆಯ ಪುಸ್ತಕವು ನೂರು ಜನ ಸ್ನೇಹಿತರಿಗೆ ಸಮಾನ (ಡಾ. ಎ.ಪಿ.ಜೆ. ಅಬ್ದುಲ್ ಕಲಾಂ)',
      'ಪುಸ್ತಕಗಳು ನೈತಿಕ ದಾರಿ ತಪ್ಪದಂತೆ ಕಾಪಾಡುವ ಜೀವಂತ ಮಾರ್ಗದರ್ಶಿಗಳು'
    ],
    hintsEn: [
      'Unfailing companions that ensure solitude is never lonely, but enriching',
      'Magical chariot transporting readers across centuries and continents',
      'One good book is equal to a hundred good friends (Dr. APJ Abdul Kalam)',
      'Everlasting mentors keeping the flame of morality shining bright'
    ]
  },
  // 43. ಸಕಾರಾತ್ಮಕ ಚಿಂತನೆಯ ಶಕ್ತಿ
  {
    id: 'topic-43',
    number: 43,
    titleKn: 'ಸಕಾರಾತ್ಮಕ ಚಿಂತನೆಯ ಶಕ್ತಿ - ಅಸಾಧ್ಯವನ್ನು ಸಾಧ್ಯವಾಗಿಸುವ ಅಂತರಂಗದ ಬಲ',
    titleEn: 'The Power of Positive Thinking - Transforming Obstacles',
    category: 'moral',
    level: 'open',
    hintsKn: [
      'ಯದ್ಭಾವಂ ತದ್ಭವತಿ - ನಾವು ಹೇಗೆ ಯೋಚಿಸುತ್ತೇವೋ ಹಾಗೆಯೇ ನಮ್ಮ ಜೀವನ ರೂಪುಗೊಳ್ಳುತ್ತದೆ',
      'ಕಷ್ಟಗಳು ಮತ್ತು ಸೋಲುಗಳಲ್ಲಿ ಅವಕಾಶಗಳನ್ನು ಕಾಣುವ ಸಕಾರಾತ್ಮಕ ದೃಷ್ಟಿಕೋನ',
      'ನಕಾರಾತ್ಮಕ ಯೋಚನೆಗಳು ಮನಸ್ಸಿನ ಶಕ್ತಿಯನ್ನು ಕುಂದಿಸುತ್ತವೆ; ಆಶಾವಾದವು ಹೊಸ ಚೈತನ್ಯ ನೀಡುತ್ತದೆ',
      'ಸದಾ ಒಳ್ಳೆಯದನ್ನೇ ಯೋಚಿಸಿ, ಒಳ್ಳೆಯದನ್ನೇ ಮಾತನಾಡಿ, ಸತ್ಕಾರ್ಯಗಳಲ್ಲೇ ನಿರತರಾಗುವ ಸಂಕಲ್ಪ'
    ],
    hintsEn: [
      'As you think, so you become: thoughts crystallize into reality',
      'An optimist spots opportunities even in the midst of bitter hardship',
      'Negative doubts sap energy; radiant optimism revitalizes willpower',
      'Commitment to think noble, speak kindly and engage in constructive action'
    ]
  },
  // 44. ಶಿಕ್ಷಕರ ಜೀವನದ ಸ್ಮರಣೀಯ ಅನುಭವ
  {
    id: 'topic-44',
    number: 44,
    titleKn: 'ಶಿಕ್ಷಕರ ಜೀವನದ ಸ್ಮರಣೀಯ ಅನುಭವ - ಸಾರ್ಥಕ ಸೇವೆಯ ಭಾವಪೂರ್ಣ ಕ್ಷಣಗಳು',
    titleEn: 'Memorable Experiences in a Teachers Life - Golden Moments',
    category: 'education',
    level: 'open',
    hintsKn: [
      'ಹಿಂದುಳಿದ ಮಗು ಓದಿನಲ್ಲಿ ಮುಂದುವರಿದಾಗ ಶಿಕ್ಷಕನ ಕಣ್ಣಲ್ಲಿ ಮೂಡುವ ಆನಂದಬಾಷ್ಪ',
      'ತಾನು ಕಲಿಸಿದ ಶಿಷ್ಯ ಸಮಾಜದಲ್ಲಿ ಉನ್ನತ ಅಧಿಕಾರಿ ಅಥವಾ ಸಜ್ಜನನಾಗಿ ನಿಂತು ನಮಸ್ಕರಿಸಿದ ಸಾರ್ಥಕ ಕ್ಷಣ',
      'ಶಾಲೆಯ ರಂಗಭೂಮಿ, ಕ್ರೀಡೆ ಅಥವಾ ವಿಜ್ಞಾನ ಮೇಳಗಳಲ್ಲಿ ಮಕ್ಕಳು ಗೆದ್ದು ತಂದ ಟ್ರೋಫಿ ನೋಡಿ ಹಿಗ್ಗು',
      'ಬಡ ವಿದ್ಯಾರ್ಥಿಯೊಬ್ಬನ ಕಣ್ಣೀರನ್ನು ಒರೆಸಿ ಅವನಿಗೆ ಆಸರೆಯಾದ ಮರೆಯಲಾಗದ ಘಟನೆ'
    ],
    hintsEn: [
      'Tears of fulfillment when a struggling student blossoms into an achiever',
      'The sublime pride when an alumnus bows with gratitude as an honorable citizen',
      'Joy watching young students lift trophies in debate, science and sports',
      'Unforgettable memories of wiping tears of underprivileged children'
    ]
  },
  // 45. ನನ್ನ ಆದರ್ಶ ಶಿಕ್ಷಕ
  {
    id: 'topic-45',
    number: 45,
    titleKn: 'ನನ್ನ ಆದರ್ಶ ಶಿಕ್ಷಕ - ನಿಷ್ಕಳಂಕ ವ್ಯಕ್ತಿತ್ವದ ಜೀವಂತ ನಿದರ್ಶನ',
    titleEn: 'My Role Model Teacher - Living Embodiment of Virtue',
    category: 'education',
    level: 'open',
    hintsKn: [
      'ಮಾತು ಮತ್ತು ಕೃತಿ ಎರಡರಲ್ಲೂ ಸಾಮ್ಯತೆ ಹೊಂದಿದ್ದ ಪ್ರಾಮಾಣಿಕ ಗುರುಗಳು',
      'ಕೇವಲ ಪಠ್ಯಕ್ಕೆ ಸೀಮಿತವಾಗದೆ ಸಮಾಜಮುಖಿ ಚಿಂತನೆ, ಮಾನವೀಯತೆ ಕಲಿಸಿದ ರೀತಿ',
      'ಸಮಯಪಾಲನೆ, ಸರಳತೆ ಮತ್ತು ನಿಷ್ಕಪಟ ಪ್ರೀತಿಯಿಂದ ಎಲ್ಲರ ಅಚ್ಚುಮೆಚ್ಚಿನ ಗುರು',
      'ಅವರಂತೆಯೇ ನಾನೂ ಸಮಾಜಕ್ಕೆ ಉಪಯುಕ್ತ ವ್ಯಕ್ತಿಯಾಗಬೇಕೆಂಬ ದೃಢ ಪ್ರೇರಣೆ'
    ],
    hintsEn: [
      'Preached by personal example: perfect harmony between words and deeds',
      'Going beyond syllabus to teach civic responsibility and boundless empathy',
      'Punctual, austere, loving and adored by generations of students',
      'Igniting the lifelong inspiration in me to serve society with honor'
    ]
  },
  // 46. ವಿದ್ಯಾರ್ಥಿಗಳಲ್ಲಿ ಆತ್ಮವಿಶ್ವಾಸ ಬೆಳೆಸುವುದು
  {
    id: 'topic-46',
    number: 46,
    titleKn: 'ವಿದ್ಯಾರ್ಥಿಗಳಲ್ಲಿ ಆತ್ಮವಿಶ್ವಾಸ ಬೆಳೆಸುವುದು - ಪ್ರತಿಭೆಯ ಅನಾವರಣದ ಕೀಲಿಕೈ',
    titleEn: 'Building Self-Confidence in Students - Unlocking Potential',
    category: 'moral',
    level: 'open',
    hintsKn: [
      'ಪ್ರತಿಯೊಂದು ಮಗುವಿನಲ್ಲೂ ಒಂದೊಂದು ವಿಶಿಷ್ಟ ಪ್ರತಿಭೆ ಅಡಗಿರುತ್ತದೆ; ಅದನ್ನು ಗುರುತಿಸಿ ಪ್ರೋತ್ಸಾಹಿಸುವುದು',
      'ವೇದಿಕೆ ಭಯ (Stage Fear) ಹೋಗಲಾಡಿಸಲು ನಿರಂತರ ಭಾಷಣ, ಚರ್ಚೆಗಳಲ್ಲಿ ಭಾಗವಹಿಸಲು ಉತ್ತೇಜನ',
      'ನೀನು ಮಾಡಬಲ್ಲೆ ಎಂಬ ಶಿಕ್ಷಕರ ಒಂದು ಪ್ರೋತ್ಸಾಹದ ಮಾತು ಮಗುವಿನ ಇಡೀ ಭವಿಷ್ಯವನ್ನೇ ಬದಲಿಸಬಲ್ಲದು',
      'ತಪ್ಪುಗಳು ಕಲಿಕೆಯ ಸಹಜ ಭಾಗವೆಂದು ತಿಳಿಸಿ ಧೈರ್ಯ ತುಂಬುವ ತಾಯ್ತನ'
    ],
    hintsEn: [
      'Every child possesses unique latent brilliance waiting to be discovered',
      'Conquering stage fright by providing repeated platforms to speak and express',
      'A teachers word "You Can Do It" can alter a young childs entire destiny',
      'Teaching that mistakes are natural stepping stones to mastery'
    ]
  },
  // 47. ಕಲಿಕೆಯಲ್ಲಿ ತಂತ್ರಜ್ಞಾನದ ಬಳಕೆ
  {
    id: 'topic-47',
    number: 47,
    titleKn: 'ಕಲಿಕೆಯಲ್ಲಿ ತಂತ್ರಜ್ಞಾನದ ಬಳಕೆ - ಜ್ಞಾನಾರ್ಜನೆಯ ನವೀನ ಹಾದಿ',
    titleEn: 'Smart Use of Technology in Learning - Modern Pedagogy',
    category: 'science',
    level: 'open',
    hintsKn: [
      'ಡಿಜಿಟಲ್ ಲೈಬ್ರರಿ, ಇ-ಪುಸ್ತಕಗಳು ಮತ್ತು ಶೈಕ್ಷಣಿಕ ಆ್ಯಪ್‌ಗಳ ಮೂಲಕ ಜ್ಞಾನ ವೃದ್ಧಿ',
      'ಸಂವಾದಾತ್ಮಕ ಕ್ವಿಜ್‌ಗಳು, ವರ್ಚುವಲ್ ಲ್ಯಾಬ್‌ಗಳ ಮೂಲಕ ಸ್ವಯಂ ಕಲಿಕೆಗೆ ಅವಕಾಶ',
      'ಜಾಗತಿಕ ಮಟ್ಟದ ಶೈಕ್ಷಣಿಕ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಯಾವುದೇ ಹಳ್ಳಿಯ ಮೂಲೆಯಲ್ಲೂ ಪಡೆಯುವ ಸೌಲಭ್ಯ',
      'ವಿವೇಚನಾಯುಕ್ತ ಬಳಕೆ ಮತ್ತು ಸೈಬರ್ ಭದ್ರತೆಯ ಅರಿವಿನೊಂದಿಗೆ ತಂತ್ರಜ್ಞಾನದ ಸದುಪಯೋಗ'
    ],
    hintsEn: [
      'Digital libraries, audiobooks and interactive learning portals',
      'Self-paced learning via simulated experiments and interactive quiz modules',
      'Democratizing top-tier educational resources to the remotest hamlets',
      'Safe, ethical and cybersecurity-aware utilization of technology'
    ]
  },
  // 48. ಶಾಲಾ ಶಿಕ್ಷಣದಲ್ಲಿ ಪೋಷಕರ ಸಹಭಾಗಿತ್ವ
  {
    id: 'topic-48',
    number: 48,
    titleKn: 'ಶಾಲಾ ಶಿಕ್ಷಣದಲ್ಲಿ ಪೋಷಕರ ಸಹಭಾಗಿತ್ವ - ಮಗುವಿನ ಉಜ್ವಲ ಭವಿಷ್ಯಕ್ಕೆ ಜಂಟಿ ಹೆಜ್ಜೆ',
    titleEn: 'Parental Partnership in School Education - Hand in Hand',
    category: 'education',
    level: 'open',
    hintsKn: [
      'ಶಿಕ್ಷಕರು ಮತ್ತು ಪೋಷಕರು ಒಂದೇ ನಾಣ್ಯದ ಎರಡು ಮುಖಗಳು; ಇಬ್ಬರ ಸಮನ್ವಯದಿಂದ ಮಾತ್ರ ಮಗುವಿನ ಪ್ರಗತಿ',
      'ಶಾಲಾ ಸಭೆಗಳಲ್ಲಿ (PTM) ಸಕ್ರಿಯವಾಗಿ ಭಾಗವಹಿಸಿ ಮಗುವಿನ ಶೈಕ್ಷಣಿಕ ಹಾಗೂ ನಡವಳಿಕೆಯ ಬೆಳವಣಿಗೆಯ ಚರ್ಚೆ',
      'ಮನೆಯಲ್ಲೂ ಓದುವ ಪ್ರಶಾಂತ ವಾತಾವರಣ ಕಲ್ಪಿಸಿ, ಮೊಬೈಲ್ ಮಿತಬಳಕೆಗೆ ಪೋಷಕರ ಪ್ರೋತ್ಸಾಹ',
      'ಶಾಲೆಯ ಚಟುವಟಿಕೆಗಳು, ಹಬ್ಬಗಳಲ್ಲಿ ಪೋಷಕರ ಪಾಲ್ಗೊಳ್ಳುವಿಕೆಯಿಂದ ಹೆಚ್ಚುವ ಆಪ್ತತೆ'
    ],
    hintsEn: [
      'Teachers and parents are two wheels of a chariot guiding child growth',
      'Active attendance in parent-teacher forums reviewing holistic progress',
      'Fostering peaceful study atmosphere at home curbing screen overuse',
      'Parents participating in school celebrations building close social bond'
    ]
  },
  // 49. ಓದುವ ಅಭ್ಯಾಸ ಬೆಳೆಸುವಲ್ಲಿ ಶಿಕ್ಷಕರ ಪಾತ್ರ
  {
    id: 'topic-49',
    number: 49,
    titleKn: 'ಓದುವ ಅಭ್ಯಾಸ ಬೆಳೆಸುವಲ್ಲಿ ಶಿಕ್ಷಕರ ಪಾತ್ರ - ಅಕ್ಷರ ಲೋಕದ ವಿಸ್ಮಯಕ್ಕೆ ಕೊಂಡೊಯ್ಯುವ ಕೈಂಕರ್ಯ',
    titleEn: 'Role of Teachers in Cultivating Reading Culture',
    category: 'education',
    level: 'open',
    hintsKn: [
      'ತರಗತಿಯಲ್ಲಿ ಕಥೆ ಹೇಳುವ ಮೂಲಕ ಮಕ್ಕಳಲ್ಲಿ ಪುಸ್ತಕ ಓದುವ ಕುತೂಹಲ ಮತ್ತು ಹಸಿವನ್ನು ಜಾಗೃತಗೊಳಿಸುವುದು',
      'ಶಾಲಾ ಗ್ರಂಥಾಲಯದ ಸದ್ಬಳಕೆ ಮತ್ತು ವಾರಕ್ಕೊಂದು ಪುಸ್ತಕ ಓದುವ ಚಳವಳಿ ನಡೆಸುವುದು',
      'ಓದಿದ ಪುಸ್ತಕದ ಸಾರಾಂಶವನ್ನು ತರಗತಿಯಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳುವ ವೇದಿಕೆ ನಿರ್ಮಿಸುವುದು',
      'ಉತ್ತಮ ಪುಸ್ತಕಗಳನ್ನು ಉಡುಗೊರೆಯಾಗಿ ನೀಡಿ ಓದುವ ಸಂಸ್ಕೃತಿಯನ್ನು ಪೋಷಿಸುವುದು'
    ],
    hintsEn: [
      'Igniting reading hunger through expressive storytelling in classrooms',
      'Promoting active library hours with "A Book a Week" campaigns',
      'Encouraging students to present book reviews and favorites before peers',
      'Gifting inspiring literature for birthdays and honors fostering book love'
    ]
  },
  // 50. ವಿವಿಧತೆಯಲ್ಲಿ ಏಕತೆ - ನಮ್ಮ ಭಾರತ
  {
    id: 'topic-50',
    number: 50,
    titleKn: 'ವಿವಿಧತೆಯಲ್ಲಿ ಏಕತೆ - ನಮ್ಮ ಭಾರತ • ಸರ್ವಧರ್ಮ ಸೌಹಾರ್ದತೆಯ ಪುಣ್ಯಭೂಮಿ',
    titleEn: 'Unity in Diversity: Our Glorious India - Land of Harmony',
    category: 'culture',
    level: 'open',
    hintsKn: [
      'ಹಿಮಾಲಯದಿಂದ ಕನ್ಯಾಕುಮಾರಿಯವರೆಗೆ ಹಬ್ಬಿರುವ ನಾನಾ ಭಾಷೆ, ಸಂಸ್ಕೃತಿ, ಹಬ್ಬಗಳ ಸುಂದರ ಸಂಗಮ',
      'ನಾವೆಲ್ಲರೂ ಒಂದೇ ತಾಯಿ ಭಾರತ ಮಾತೆಯ ಮಕ್ಕಳೆಂಬ ಹೆಮ್ಮೆಯ ಸಾರ್ವಭೌಮ ಭಾವ',
      'ಸಂವಿಧಾನ, ತ್ರಿವರ್ಣ ಧ್ವಜ ಮತ್ತು ರಾಷ್ಟ್ರಗೀತೆಯ ನೆರಳಿನಲ್ಲಿ ವಿಶ್ವಕ್ಕೆ ಶಾಂತಿ-ಸಹಬಾಳ್ವೆಯ ಸಂದೇಶ',
      'ಸರ್ವೇ ಭವಂತು ಸುಖಿನಃ • ಸರ್ವೇ ಸಂತು ನಿರಾಮಯಾಃ ಎಂಬ ಭಾರತೀಯ ಸಾರ್ವಕಾಲಿಕ ಪ್ರಾರ್ಥನೆ'
    ],
    hintsEn: [
      'Exquisite mosaic of languages, cultures and festivals from Himalayas to ocean',
      'Sovereign pride that we are all loving children of one Mother India',
      'Radiating world message of peace under the Tricolor and Constitution',
      'Timeless universal blessing: May all beings everywhere be happy and healthy'
    ]
  }
];
