export type Language = 'kn' | 'en';

export type NavigationTab = 'pick' | 'timer' | 'judges' | 'admin';

export type Category = 
  | 'leaders'       // ರಾಷ್ಟ್ರೀಯ ನಾಯಕರು & ಮಹಾಪುರುಷರು
  | 'environment'   // ಪರಿಸರ ಮತ್ತು ನಿಸರ್ಗ
  | 'education'     // ಶಿಕ್ಷಣ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿ ಜೀವನ
  | 'science'       // ವಿಜ್ಞಾನ ಮತ್ತು ತಂತ್ರಜ್ಞಾನ
  | 'culture'       // ಕನ್ನಡ ನಾಡು-ನುಡಿ & ಸಂಸ್ಕೃತಿ
  | 'moral'         // ಸಾಮಾಜಿಕ ಮತ್ತು ನೈತಿಕ ಮೌಲ್ಯಗಳು
  | 'current';      // ಸಮಕಾಲೀನ & ಸಾಮಾನ್ಯ ಜ್ಞಾನ

export type DifficultyLevel = 'primary' | 'highschool' | 'open';

export interface Topic {
  id: string;
  number: number;
  titleKn: string;
  titleEn: string;
  category: Category;
  level: DifficultyLevel;
  hintsKn: string[];
  hintsEn: string[];
  isUsed?: boolean;
  eraKn?: string;
  eraEn?: string;
  symbol?: string; // 'crown' | 'sword' | 'scroll' | 'temple' | 'palace' | 'flag' | 'river' | 'rocket' | 'lamp' | 'feather'
  quoteKn?: string;
  quoteEn?: string;
  badgeColor?: string;
}

export interface JudgeProfile {
  id: string;
  name: string;
  role: string;
}

export interface JudgeScore {
  judgeId?: string;
  judgeName?: string;
  content: number;        // ೧. ವಿಷಯ ಜ್ಞಾನ & ಪರಿಕಲ್ಪನೆ (0-10)
  language: number;       // ೨. ಭಾಷಾ ಶುದ್ಧತೆ & ನಿರರ್ಗಳತೆ (0-10)
  presentation: number;   // ೩. ಹಾವಭಾವ & ವೇದಿಕೆ ಉಪಸ್ಥಿತಿ (0-10)
  timeManagement: number; // ೪. ಸಮಯ ಪಾಲನೆ & ಶಿಸ್ತು (0-10)
  impact: number;         // ೫. ಒಟ್ಟಾರೆ ಪ್ರಭಾವ & ಸಂದೇಶ (0-10)
  total: number;          // ಒಟ್ಟು ಅಂಕಗಳು (0-50)
  remarks?: string;
  timestamp?: string;
}

export interface Participant {
  id: string;
  chestNo: number;
  name: string;
  schoolOrClass: string;
  assignedTopic?: Topic;
  scores?: JudgeScore;
  judgeScores?: Record<string, JudgeScore>;
  status: 'waiting' | 'speaking' | 'completed';
}

export interface TimerConfig {
  prepTimeSeconds: number;     // e.g. 60s
  speechTimeSeconds: number;   // e.g. 120s (2 mins)
  warningBellSeconds: number;  // e.g. 30s before end
  enableSound: boolean;
}

