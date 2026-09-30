import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'live_competition_state.json');

// Judge credentials:
// Judge 1: judge1
// Judge 2: judge2
// Judge 3: judge3
// Judge 4: judge4
// Chief Judge & Admin: chandrusk@123
export const JUDGE_CREDENTIALS: Record<string, string> = {
  'judge-1': 'judge1',
  'judge-2': 'judge2',
  'judge-3': 'judge3',
  'judge-4': 'judge4',
  'judge-chief': 'chandrusk@123'
};
export const CHIEF_ADMIN_PASSWORD = 'chandrusk@123';

interface JudgeScoreRecord {
  judgeId: string;
  judgeName?: string;
  content: number;
  language: number;
  presentation: number;
  timeManagement: number;
  impact: number;
  total: number;
  remarks?: string;
  timestamp?: string;
}

interface ServerParticipant {
  id: string;
  chestNo: number;
  name: string;
  schoolOrClass: string;
  assignedTopic?: any;
  scores?: JudgeScoreRecord;
  judgeScores?: Record<string, JudgeScoreRecord>;
  status: 'waiting' | 'speaking' | 'completed';
}

interface ServerCompetitionState {
  participants: ServerParticipant[];
  currentParticipantId: string | null;
  activeTopicId: string | null;
  schoolName: string;
  activeJudges: Record<string, { lastPing: number; name: string; role: string }>;
  lastUpdated: number;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function cleanOrgName(input?: string): string {
  if (!input) return 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್ (ರಿ) ಮೈಸೂರು';
  const cleaned = input
    .replace(/ಸರ್ಕಾರಿ\s+ಹಿರಿಯ\s+ಪ್ರಾಥಮಿಕ\s+ಶಾಲೆ,?\s*ದೇಹಾ?ಳ್ಳಿ\s*(\(GHPS\s*Dehalli\))?/gi, '')
    .replace(/ಸರ್ಕಾರಿ\s+ಹಿರಿಯ\s+ಪ್ರಾಥಮಿಕ\s+ಶಾಲೆ/gi, '')
    .replace(/g\.?\s*h\.?\s*p\.?\s*s\.?\s*dehalli/gi, '')
    .replace(/ghps\s*dehalli/gi, '')
    .replace(/ದೇಹಾ?ಳ್ಳಿ/gi, '')
    .replace(/ಜಿ\.?\s*ಹೆಚ್\.?\s*ಪಿ\.?\s*ಎಸ್\.?/gi, '')
    .replace(/\bghps\b/gi, '')
    .replace(/\bdehalli\b/gi, '')
    .trim()
    .replace(/^[-–—•,\s/]+|[-–—•,\s/]+$/g, '');
  return cleaned || 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್ (ರಿ) ಮೈಸೂರು';
}

function loadState(): ServerCompetitionState {
  ensureDataDir();
  if (fs.existsSync(STATE_FILE)) {
    try {
      const content = fs.readFileSync(STATE_FILE, 'utf-8');
      const loaded = JSON.parse(content);
      if (!loaded.activeJudges) loaded.activeJudges = {};
      if (!loaded.activeJudges['judge-4']) {
        loaded.activeJudges['judge-4'] = { lastPing: 0, name: 'ತೀರ್ಪುಗಾರರು 4 (Judge 4)', role: 'ತೀರ್ಪುಗಾರರು 4' };
      }
      if (loaded.schoolName) {
        loaded.schoolName = cleanOrgName(loaded.schoolName);
      }
      return loaded;
    } catch (e) {
      console.error('Failed to read state file, fallback to empty:', e);
    }
  }
  return {
    participants: [],
    currentParticipantId: null,
    activeTopicId: null,
    schoolName: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಶಿಕ್ಷಕರ ಪ್ರತಿಭಾ ಪರಿಷತ್ (ರಿ) ಮೈಸೂರು',
    activeJudges: {
      'judge-1': { lastPing: 0, name: 'ತೀರ್ಪುಗಾರರು 1 (Judge 1)', role: 'ತೀರ್ಪುಗಾರರು 1' },
      'judge-2': { lastPing: 0, name: 'ತೀರ್ಪುಗಾರರು 2 (Judge 2)', role: 'ತೀರ್ಪುಗಾರರು 2' },
      'judge-3': { lastPing: 0, name: 'ತೀರ್ಪುಗಾರರು 3 (Judge 3)', role: 'ತೀರ್ಪುಗಾರರು 3' },
      'judge-4': { lastPing: 0, name: 'ತೀರ್ಪುಗಾರರು 4 (Judge 4)', role: 'ತೀರ್ಪುಗಾರರು 4' },
      'judge-chief': { lastPing: 0, name: 'ಮುಖ್ಯ ತೀರ್ಪುಗಾರರು (Chief Judge)', role: 'ಮುಖ್ಯ ತೀರ್ಪುಗಾರರು' }
    },
    lastUpdated: Date.now()
  };
}

let competitionState = loadState();

function saveState() {
  ensureDataDir();
  try {
    competitionState.lastUpdated = Date.now();
    fs.writeFileSync(STATE_FILE, JSON.stringify(competitionState, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save competition state:', e);
  }
}

function deduplicateServerParticipants(list: ServerParticipant[]): ServerParticipant[] {
  const seenChests = new Set<number>();
  const seenIds = new Set<string>();
  const result: ServerParticipant[] = [];

  for (const p of list) {
    if (!p) continue;
    const chest = p.chestNo;
    const id = p.id;
    if (chest !== undefined && seenChests.has(chest)) {
      continue;
    }
    if (id && seenIds.has(id)) {
      continue;
    }
    if (chest !== undefined) seenChests.add(chest);
    if (id) seenIds.add(id);
    result.push(p);
  }

  return result.sort((a, b) => a.chestNo - b.chestNo);
}

// Compute aggregate score from multiple judges
function computeConsensusScore(judgeScores: Record<string, JudgeScoreRecord>): JudgeScoreRecord | undefined {
  const scores = Object.values(judgeScores);
  if (scores.length === 0) return undefined;

  const count = scores.length;
  const content = Number((scores.reduce((sum, s) => sum + s.content, 0) / count).toFixed(1));
  const language = Number((scores.reduce((sum, s) => sum + s.language, 0) / count).toFixed(1));
  const presentation = Number((scores.reduce((sum, s) => sum + s.presentation, 0) / count).toFixed(1));
  const timeManagement = Number((scores.reduce((sum, s) => sum + s.timeManagement, 0) / count).toFixed(1));
  const impact = Number((scores.reduce((sum, s) => sum + s.impact, 0) / count).toFixed(1));
  
  // Total sum of category averages (out of 50)
  const total = Number((content + language + presentation + timeManagement + impact).toFixed(1));
  
  const remarksList = scores.map(s => s.remarks).filter(Boolean).join('; ');

  return {
    judgeId: 'consensus',
    judgeName: `${count} Judges Average`,
    content,
    language,
    presentation,
    timeManagement,
    impact,
    total,
    remarks: remarksList || undefined,
    timestamp: new Date().toISOString()
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // --- API ROUTES FOR MULTI-MOBILE JUDGE & ADMIN REAL-TIME SYNC ---

  // 1. Live Sync Status & State
  app.get('/api/sync', (req, res) => {
    res.json({
      success: true,
      participants: competitionState.participants,
      currentParticipantId: competitionState.currentParticipantId,
      activeTopicId: competitionState.activeTopicId,
      schoolName: competitionState.schoolName,
      activeJudges: competitionState.activeJudges,
      lastUpdated: competitionState.lastUpdated,
      serverTime: Date.now()
    });
  });

  // 2. Judge Password Login
  app.post('/api/judge/login', (req, res) => {
    const { judgeId, password } = req.body;
    if (!judgeId || !password) {
      return res.status(400).json({ success: false, message: 'Judge ID and password are required' });
    }

    const expectedPassword = JUDGE_CREDENTIALS[judgeId];
    if (expectedPassword && password.trim() === expectedPassword) {
      // Update judge active ping
      if (!competitionState.activeJudges[judgeId]) {
        competitionState.activeJudges[judgeId] = {
          lastPing: Date.now(),
          name: judgeId === 'judge-chief' ? 'ಮುಖ್ಯ ತೀರ್ಪುಗಾರರು' : `ತೀರ್ಪುಗಾರರು ${judgeId.replace('judge-', '')}`,
          role: judgeId === 'judge-chief' ? 'ಮುಖ್ಯ ತೀರ್ಪುಗಾರರು' : `ತೀರ್ಪುಗಾರರು ${judgeId.replace('judge-', '')}`
        };
      } else {
        competitionState.activeJudges[judgeId].lastPing = Date.now();
      }
      saveState();

      return res.json({
        success: true,
        judge: {
          id: judgeId,
          name: competitionState.activeJudges[judgeId].name,
          role: competitionState.activeJudges[judgeId].role
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: '❌ ತಪ್ಪಾದ ಪಾಸ್‌ವರ್ಡ್ (Incorrect Password). ಸರಿಯಾದ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.'
    });
  });

  // 3. Judge Heartbeat Ping
  app.post('/api/judge/ping', (req, res) => {
    const { judgeId } = req.body;
    if (judgeId && competitionState.activeJudges[judgeId]) {
      competitionState.activeJudges[judgeId].lastPing = Date.now();
      saveState();
    }
    res.json({ success: true, serverTime: Date.now() });
  });

  // 4. Online Score Submission from Judge's Mobile
  app.post('/api/judge/score', (req, res) => {
    const { judgeId, participantId, score } = req.body;
    if (!judgeId || !participantId || !score) {
      return res.status(400).json({ success: false, message: 'Missing judgeId, participantId, or score' });
    }

    // Update active ping
    if (competitionState.activeJudges[judgeId]) {
      competitionState.activeJudges[judgeId].lastPing = Date.now();
    }

    // Find participant
    let participant = competitionState.participants.find(p => p.id === participantId);
    if (!participant) {
      // If not yet present in server list, register placeholder or find by chestNo
      participant = {
        id: participantId,
        chestNo: req.body.chestNo || competitionState.participants.length + 1,
        name: req.body.participantName || `ಸ್ಪರ್ಧಿ ${participantId}`,
        schoolOrClass: req.body.schoolOrClass || '',
        status: 'completed',
        judgeScores: {}
      };
      competitionState.participants.push(participant);
    }

    if (!participant.judgeScores) {
      participant.judgeScores = {};
    }

    // Store this judge's score
    participant.judgeScores[judgeId] = {
      ...score,
      judgeId,
      timestamp: new Date().toISOString()
    };

    // Recompute consensus score across all judges
    participant.scores = computeConsensusScore(participant.judgeScores);
    participant.status = 'completed';

    saveState();

    res.json({
      success: true,
      participant,
      judgeScores: participant.judgeScores,
      lastUpdated: competitionState.lastUpdated
    });
  });

  // 5. Admin / Chief Judge Login
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password && password.trim() === CHIEF_ADMIN_PASSWORD) {
      // Mark chief judge as online
      if (competitionState.activeJudges['judge-chief']) {
        competitionState.activeJudges['judge-chief'].lastPing = Date.now();
      }
      saveState();
      return res.json({ success: true });
    }
    return res.status(401).json({
      success: false,
      message: '❌ ತಪ್ಪಾದ ಪಾಸ್‌ವರ್ಡ್! ಸರಿಯಾದ ಮುಖ್ಯ ತೀರ್ಪುಗಾರರ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.'
    });
  });

  // 6. Sync / Push Participants List from Client
  app.post('/api/sync/participants', (req, res) => {
    const { participants, schoolName } = req.body;
    if (Array.isArray(participants)) {
      // Merge participants preserving any existing judgeScores on the server
      const updatedList: ServerParticipant[] = participants.map(clientP => {
        const existing = competitionState.participants.find(p => p.id === clientP.id);
        const mergedJudgeScores = {
          ...(existing?.judgeScores || {}),
          ...(clientP.judgeScores || {})
        };
        const computedScore = Object.keys(mergedJudgeScores).length > 0 
          ? computeConsensusScore(mergedJudgeScores) 
          : clientP.scores;

        return {
          ...clientP,
          judgeScores: mergedJudgeScores,
          scores: computedScore
        };
      });

      competitionState.participants = deduplicateServerParticipants(updatedList);
      if (schoolName) {
        competitionState.schoolName = cleanOrgName(schoolName);
      }
      saveState();
    }

    res.json({
      success: true,
      participants: competitionState.participants,
      lastUpdated: competitionState.lastUpdated
    });
  });

  // 6b. Delete a single participant from server state
  app.post('/api/participants/delete', (req, res) => {
    const { participantId } = req.body;
    if (participantId) {
      competitionState.participants = competitionState.participants.filter(p => p.id !== participantId);
      if (competitionState.currentParticipantId === participantId) {
        competitionState.currentParticipantId = null;
      }
      competitionState.lastUpdated = Date.now();
      saveState();
      return res.json({
        success: true,
        participants: competitionState.participants,
        lastUpdated: competitionState.lastUpdated
      });
    }
    return res.status(400).json({ success: false, message: 'Missing participantId' });
  });

  // 7. Sync Currently Speaking Participant
  app.post('/api/sync/current-speaker', (req, res) => {
    const { currentParticipantId, activeTopicId } = req.body;
    competitionState.currentParticipantId = currentParticipantId !== undefined ? currentParticipantId : competitionState.currentParticipantId;
    competitionState.activeTopicId = activeTopicId !== undefined ? activeTopicId : competitionState.activeTopicId;
    saveState();
    res.json({ success: true, currentParticipantId: competitionState.currentParticipantId, activeTopicId: competitionState.activeTopicId });
  });

  // 8. Admin Reset All Scores
  app.post('/api/admin/reset-scores', (req, res) => {
    const { password } = req.body;
    if (password && password.trim() === CHIEF_ADMIN_PASSWORD) {
      competitionState.participants = competitionState.participants.map(p => ({
        ...p,
        scores: undefined,
        judgeScores: {},
        status: 'waiting'
      }));
      saveState();
      return res.json({ success: true, participants: competitionState.participants });
    }
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  });

  // --- VITE MIDDLEWARE / STATIC FILES ---
  const distDir = path.join(__dirname, 'dist');
  const distIndex = path.join(distDir, 'index.html');

  if (process.env.NODE_ENV === 'production' && fs.existsSync(distIndex)) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(distIndex);
    });
  } else {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.error('Vite server middleware initialization error:', viteErr);
      if (fs.existsSync(distIndex)) {
        app.use(express.static(distDir));
        app.get('*', (_req, res) => res.sendFile(distIndex));
      } else {
        app.get('*', (_req, res) => {
          res.status(500).send('Server error: Frontend build in progress.');
        });
      }
    }
  }

  // Global Error Handler to avoid unhandled crashes
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Server Error Handler]:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error', message: err?.message || String(err) });
    }
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Full-Stack Server] Live Competition Platform running on http://0.0.0.0:${PORT}`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
