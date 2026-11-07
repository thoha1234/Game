/**
 * Synthesizer Sound Engine for Preschool Flappy Vokal
 * Pure Web Audio API - zero external audio files, 100% reliable offline.
 * Provides cheerful, non-verbal action sounds suitable for preschoolers.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmPlaying: boolean = false;
  private bgmTimeoutId: number | null = null;

  constructor() {
    // AudioContext will be initialized on user gesture
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public unlockAudio() {
    this.initCtx();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Wing flap sound: soft cheerful whoosh / peep
   */
  public playFlap() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Correct vowel match sound: bright harmonic major arpeggio fanfare!
   */
  public playCorrectMatch() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // C5, E5, G5, C6 (523Hz, 659Hz, 783Hz, 1046Hz)
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = now + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.22, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.38);
    });

    // Add extra high sparkle
    const sparkleOsc = this.ctx.createOscillator();
    const sparkleGain = this.ctx.createGain();
    sparkleOsc.type = 'sine';
    sparkleOsc.frequency.setValueAtTime(1318.51, now + 0.28); // E6
    sparkleGain.gain.setValueAtTime(0.15, now + 0.28);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    sparkleOsc.connect(sparkleGain);
    sparkleGain.connect(this.ctx.destination);
    sparkleOsc.start(now + 0.28);
    sparkleOsc.stop(now + 0.58);
  }

  /**
   * Comical cartoon mistake sound ("womp-womp" / "uh-oh" boop)
   * Distinctive feedback when picking the wrong vowel without being harsh.
   */
  public playWrongMatch() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // First note: descending cartoon "uh" (350Hz -> 280Hz)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(360, now);
    osc1.frequency.linearRampToValueAtTime(260, now + 0.16);

    gain1.gain.setValueAtTime(0.24, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.2);

    // Second note: lower comical "oh / womp" (220Hz -> 160Hz) with slight vibrato
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    const t2 = now + 0.18;
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(240, t2);
    osc2.frequency.exponentialRampToValueAtTime(150, t2 + 0.3);

    gain2.gain.setValueAtTime(0.22, t2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.38);

    // Soft lowpass filter to keep it cartoonish and warm (not buzzy)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t2);
    filter.frequency.exponentialRampToValueAtTime(350, t2 + 0.35);

    osc2.connect(filter);
    filter.connect(gain2);
    gain2.connect(this.ctx.destination);

    osc2.start(t2);
    osc2.stop(t2 + 0.4);
  }

  /**
   * Star collection chime
   */
  public playStarPickup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.18); // A6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  /**
   * Gentle bounce sound (soft cartoon boing) for trampoline grass bounce
   */
  public playSoftBounce() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(260, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.22);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Victory / Round complete fanfare
   */
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 392.00, d: 0.12 },
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.18 },
      { f: 1046.50, d: 0.6 }
    ];

    let t = now;
    notes.forEach((item) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + item.d + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + item.d + 0.15);
      t += item.d;
    });
  }

  /**
   * Cheerful, lively procedural nursery background melody (looping BGM)
   * Polyphonic marimba + warm bass harmony designed for preschool enjoyment.
   */
  public startBGM() {
    if (this.isMuted || this.bgmPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    this.bgmPlaying = true;
    this.scheduleBgmLoop();
  }

  private scheduleBgmLoop() {
    if (!this.bgmPlaying || this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;

    // Upbeat happy preschool melody sequence
    const notes = [
      // Bar 1: C - E - G - E
      { melody: 523.25, bass: 261.63, time: 0.0, dur: 0.28 },
      { melody: 659.25, bass: 0,      time: 0.35, dur: 0.25 },
      { melody: 783.99, bass: 392.00, time: 0.7, dur: 0.28 },
      { melody: 659.25, bass: 0,      time: 1.05, dur: 0.25 },

      // Bar 2: A - G - E - D
      { melody: 880.00, bass: 440.00, time: 1.4, dur: 0.32 },
      { melody: 783.99, bass: 0,      time: 1.8, dur: 0.35 },
      { melody: 659.25, bass: 329.63, time: 2.2, dur: 0.28 },
      { melody: 587.33, bass: 293.66, time: 2.6, dur: 0.35 },

      // Bar 3: C - D - E - G
      { melody: 523.25, bass: 261.63, time: 3.0, dur: 0.28 },
      { melody: 587.33, bass: 0,      time: 3.35, dur: 0.25 },
      { melody: 659.25, bass: 329.63, time: 3.7, dur: 0.28 },
      { melody: 783.99, bass: 0,      time: 4.05, dur: 0.25 },

      // Bar 4: G - A - G - C(high)
      { melody: 783.99, bass: 392.00, time: 4.4, dur: 0.28 },
      { melody: 880.00, bass: 440.00, time: 4.75, dur: 0.28 },
      { melody: 783.99, bass: 392.00, time: 5.1, dur: 0.35 },
      { melody: 1046.50, bass: 523.25, time: 5.5, dur: 0.65 },
    ];

    notes.forEach((n) => {
      if (!this.ctx) return;
      const t = now + n.time;

      // Melody note (Marimba-like sine wave)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.melody, t);

      gain.gain.setValueAtTime(0.045, t);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + n.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + n.dur + 0.05);

      // Bass note (gentle warmth)
      if (n.bass > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(n.bass / 2, t);

        bassGain.gain.setValueAtTime(0.035, t);
        bassGain.gain.exponentialRampToValueAtTime(0.0005, t + n.dur * 1.2);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(t);
        bassOsc.stop(t + n.dur * 1.2 + 0.05);
      }
    });

    const loopDurationMs = 6200;
    this.bgmTimeoutId = window.setTimeout(() => {
      if (this.bgmPlaying) {
        this.scheduleBgmLoop();
      }
    }, loopDurationMs);
  }

  public stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimeoutId) {
      window.clearTimeout(this.bgmTimeoutId);
      this.bgmTimeoutId = null;
    }
  }
}

export const soundFX = new SoundEngine();
