import { useState, useEffect, useCallback, useRef } from 'react';
import { Participant, JudgeScore, JudgeProfile } from '../types';
import { deduplicateParticipants } from '../data/defaultParticipants';

export interface SyncResponse {
  success: boolean;
  participants: Participant[];
  currentParticipantId: string | null;
  activeTopicId: string | null;
  schoolName: string;
  activeJudges: Record<string, { lastPing: number; name: string; role: string }>;
  lastUpdated: number;
  serverTime: number;
}

// Judge credentials:
// Judge 1: judge1
// Judge 2: judge2
// Judge 3: judge3
// Judge 4: judge4
// Chief Judge & Admin: chandrusk@123
export const JUDGE_PASSWORDS: Record<string, string> = {
  'judge-1': 'judge1',
  'judge-2': 'judge2',
  'judge-3': 'judge3',
  'judge-4': 'judge4',
  'judge-chief': 'chandrusk@123'
};
export const CHIEF_ADMIN_PASSWORD = 'chandrusk@123';

export const DEFAULT_JUDGES: JudgeProfile[] = [
  { id: 'judge-1', name: 'ತೀರ್ಪುಗಾರರು 1 (Judge 1)', role: 'ತೀರ್ಪುಗಾರರು 1' },
  { id: 'judge-2', name: 'ತೀರ್ಪುಗಾರರು 2 (Judge 2)', role: 'ತೀರ್ಪುಗಾರರು 2' },
  { id: 'judge-3', name: 'ತೀರ್ಪುಗಾರರು 3 (Judge 3)', role: 'ತೀರ್ಪುಗಾರರು 3' },
  { id: 'judge-4', name: 'ತೀರ್ಪುಗಾರರು 4 (Judge 4)', role: 'ತೀರ್ಪುಗಾರರು 4' },
  { id: 'judge-chief', name: 'ಮುಖ್ಯ ತೀರ್ಪುಗಾರರು (Chief Judge)', role: 'ಮುಖ್ಯ ತೀರ್ಪುಗಾರರು' }
];

export async function fetchLiveSync(): Promise<SyncResponse | null> {
  try {
    const res = await fetch('/api/sync');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function submitJudgeScoreOnline(
  judgeId: string,
  participant: Participant,
  score: JudgeScore
): Promise<{ success: boolean; participant?: Participant; message?: string }> {
  try {
    const res = await fetch('/api/judge/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        judgeId,
        participantId: participant.id,
        participantName: participant.name,
        chestNo: participant.chestNo,
        schoolOrClass: participant.schoolOrClass,
        score
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.message || 'Failed to submit score' };
    }
    const data = await res.json();
    return { success: true, participant: data.participant };
  } catch (e: any) {
    return { success: false, message: e?.message || 'Network error' };
  }
}

export async function syncParticipantsToServer(
  participants: Participant[],
  schoolName?: string
): Promise<boolean> {
  try {
    const res = await fetch('/api/sync/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participants, schoolName })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function syncCurrentSpeakerToServer(
  currentParticipantId: string | null,
  activeTopicId?: string | null
): Promise<boolean> {
  try {
    const res = await fetch('/api/sync/current-speaker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentParticipantId, activeTopicId })
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Track recently deleted IDs to prevent polling race resurrection
const recentlyDeletedParticipantIds = new Set<string>();

export function recordDeletedParticipantId(id: string) {
  recentlyDeletedParticipantIds.add(id);
}

export async function deleteParticipantOnServer(participantId: string): Promise<boolean> {
  recordDeletedParticipantId(participantId);
  try {
    const res = await fetch('/api/participants/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function resetScoresOnServer(password: string = CHIEF_ADMIN_PASSWORD): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/reset-scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function pingJudgeOnline(judgeId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/judge/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ judgeId })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function loginJudgeOnline(judgeId: string, password: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/judge/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ judgeId, password })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      return { success: true };
    }
    return { success: false, message: data.message || 'Invalid password' };
  } catch {
    // Fallback to local credential check if network offline
    const expected = JUDGE_PASSWORDS[judgeId];
    if (expected && password.trim() === expected) {
      return { success: true };
    }
    return { success: false, message: 'Invalid password' };
  }
}

export async function loginAdminOnline(password: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      return { success: true };
    }
    return { success: false, message: data.message || 'Invalid admin password' };
  } catch {
    if (password.trim() === CHIEF_ADMIN_PASSWORD) {
      return { success: true };
    }
    return { success: false, message: 'Invalid admin password' };
  }
}

/**
 * React Hook for Real-Time Multi-Device Sync
 */
export function useLiveSync(
  participants: Participant[],
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>,
  activeJudgeId?: string | null
) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<Date | null>(null);
  const [activeJudges, setActiveJudges] = useState<Record<string, { lastPing: number; name: string; role: string }>>({});
  const [serverCurrentSpeakerId, setServerCurrentSpeakerId] = useState<string | null>(null);

  const isLocalUpdateRef = useRef(false);

  // Manual Trigger or Periodic Poll
  const performSync = useCallback(async () => {
    try {
      setIsSyncing(true);
      const data = await fetchLiveSync();
      if (data && data.success) {
        setIsOnline(true);
        setLastSyncedTime(new Date());
        setActiveJudges(data.activeJudges || {});
        if (data.currentParticipantId !== undefined) {
          setServerCurrentSpeakerId(data.currentParticipantId);
        }

        // If server has participants, merge with local state
        if (data.participants && data.participants.length > 0) {
          setParticipants(prev => {
            // Check if server data is different
            const merged = data.participants.map(serverP => {
              const localP = prev.find(p => p.id === serverP.id || p.chestNo === serverP.chestNo);
              if (!localP) return serverP;

              // If server reset scores (empty judgeScores & undefined scores), adopt server reset
              const isServerScoreReset = !serverP.scores && (!serverP.judgeScores || Object.keys(serverP.judgeScores).length === 0);
              
              const combinedJudgeScores = isServerScoreReset
                ? {}
                : {
                    ...(localP.judgeScores || {}),
                    ...(serverP.judgeScores || {})
                  };

              // Preferred score is server computed consensus if available, else local (unless reset)
              const bestScore = isServerScoreReset ? undefined : (serverP.scores || localP.scores);

              return {
                ...localP,
                ...serverP,
                id: serverP.id || localP.id,
                judgeScores: combinedJudgeScores,
                scores: bestScore
              };
            });

            // Also keep any local participants not yet on server, excluding any recently deleted or already present by chestNo
            const validMerged = merged.filter(p => !recentlyDeletedParticipantIds.has(p.id));
            const extraLocal = prev.filter(lp => 
              !data.participants.some(sp => sp.id === lp.id || sp.chestNo === lp.chestNo) && 
              !recentlyDeletedParticipantIds.has(lp.id)
            );
            const combinedAll = deduplicateParticipants([...validMerged, ...extraLocal]);

            // If local has extra participants that the server is missing, push all to server immediately!
            if (extraLocal.length > 0 && !isLocalUpdateRef.current) {
              isLocalUpdateRef.current = true;
              syncParticipantsToServer(combinedAll).finally(() => {
                isLocalUpdateRef.current = false;
              });
            }

            return combinedAll;
          });
        } else if (participants.length > 0 && !isLocalUpdateRef.current) {
          // If server is empty but client has participants, seed server!
          isLocalUpdateRef.current = true;
          syncParticipantsToServer(deduplicateParticipants(participants));
          isLocalUpdateRef.current = false;
        }
      } else {
        // Dev server might be compiling or offline
      }
    } catch {
      setIsOnline(false);
    } finally {
      setIsSyncing(false);
    }
  }, [participants, setParticipants]);

  // Ping active judge every 10 seconds if logged in
  useEffect(() => {
    if (!activeJudgeId) return;
    pingJudgeOnline(activeJudgeId);
    const interval = setInterval(() => {
      pingJudgeOnline(activeJudgeId);
    }, 10000);
    return () => clearInterval(interval);
  }, [activeJudgeId]);

  // Periodic background polling (every 2.5 seconds) for real-time mobile sync
  useEffect(() => {
    performSync();
    const pollInterval = setInterval(() => {
      performSync();
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [performSync]);

  return {
    isOnline,
    isSyncing,
    lastSyncedTime,
    activeJudges,
    serverCurrentSpeakerId,
    triggerSync: performSync
  };
}
