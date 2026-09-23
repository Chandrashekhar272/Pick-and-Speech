/**
 * Web Audio API based sound synthesizer for school bells, chimes, and ticks.
 * Works entirely offline without external audio files.
 * Includes automatic audio unlocking on first user interaction.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.unlockAudio();
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('click', unlock, { once: true });
      window.addEventListener('touchstart', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    }
  }

  public unlockAudio(): void {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        this.isUnlocked = true;
      }).catch(() => {});
    } else if (ctx) {
      this.isUnlocked = true;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Realistic brass school bell (Warning bell - Single Ding)
   * Loud, resonant, authentic school warning gong
   */
  public playWarningBell() {
    if (!this.soundEnabled) return;
    this.unlockAudio();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Harmonics for a rich brass school bell
    const harmonics = [
      { freq: 880, gain: 0.55, decay: 2.8 },
      { freq: 1760, gain: 0.35, decay: 2.2 },
      { freq: 2640, gain: 0.20, decay: 1.6 },
      { freq: 3520, gain: 0.12, decay: 1.0 },
      { freq: 528, gain: 0.30, decay: 3.0 } // lower undertone
    ];

    harmonics.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gainNode.gain.setValueAtTime(gain, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + decay + 0.1);
    });
  }

  /**
   * Final Bell (5 Times Ding Ding Ding Ding Ding!)
   * Five loud, decisive brass bell strikes marking the complete end of speech time.
   */
  public playFinalBell() {
    if (!this.soundEnabled) return;
    this.unlockAudio();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    // 5 consecutive resonant brass bell rings
    const ringDelays = [0, 0.55, 1.1, 1.65, 2.2];
    ringDelays.forEach(delay => {
      this.playBellStrike(delay);
    });
  }

  private playBellStrike(delaySec: number) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime + delaySec;
    const harmonics = [
      { freq: 1046.5, gain: 0.65, decay: 2.4 }, // High C
      { freq: 2093.0, gain: 0.40, decay: 1.8 },
      { freq: 3135.9, gain: 0.22, decay: 1.2 },
      { freq: 659.25, gain: 0.35, decay: 2.8 }  // E5 undertone
    ];

    harmonics.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gainNode.gain.setValueAtTime(gain, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + decay + 0.1);
    });
  }

  /**
   * Chit pick celebration fanfare
   */
  public playChitReveal() {
    if (!this.soundEnabled) return;
    this.unlockAudio();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const noteTime = now + (i * 0.09);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.28, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.48);
    });
  }

  /**
   * Countdown tick
   */
  public playTick() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1300, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }
}

export const sound = new SoundEngine();
