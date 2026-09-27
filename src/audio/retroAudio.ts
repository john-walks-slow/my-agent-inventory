// Web Audio API Retro 8-bit Sound Effects Engine
// P5b-2：音色跟主题走——stardew=星露谷木质 / pokemon=GB 方波哔声 /
// jrpg=DQ 式圆润短音 / diablo=低沉浑厚。合成引擎不变，只换参数。

type OscType = 'sine' | 'square' | 'triangle' | 'sawtooth';

/** 单个振荡器音符：from→to 做指数滑音；steps 为同一振荡器上的分步定音（连奏） */
interface Tone {
  type: OscType;
  from: number;
  to?: number;
  steps?: ReadonlyArray<readonly [offsetSec: number, freq: number]>;
  /** 相对事件起点的延迟（秒） */
  at?: number;
  gain: number;
  dur: number;
}

/** 翻书噪声：bandpass 中心频率 from→to 线性扫频，模拟纸张沙沙 */
interface Noise {
  from: number;
  to: number;
  gain: number;
  dur: number;
}

interface SoundSpec {
  tones: readonly Tone[];
  noise?: Noise;
}

type SoundEvent = 'hover' | 'select' | 'tab' | 'coin' | 'pageTurn';
type TimbreProfile = Record<SoundEvent, SoundSpec>;

/* ---------------- 四主题音色参数 ---------------- */

// 星露谷：木质软击 + 清脆拾取（与 P4 版逐参数一致）
const stardew: TimbreProfile = {
  hover: { tones: [{ type: 'triangle', from: 320, to: 140, gain: 0.04, dur: 0.04 }] },
  select: { tones: [{ type: 'square', from: 440, to: 880, gain: 0.06, dur: 0.06 }] },
  tab: { tones: [{ type: 'sine', from: 587.33, steps: [[0, 587.33], [0.05, 880]], gain: 0.08, dur: 0.12 }] },
  coin: {
    tones: [
      { type: 'square', from: 987.77, gain: 0.05, dur: 0.08 },
      { type: 'square', from: 1318.51, at: 0.07, gain: 0.05, dur: 0.18 },
    ],
  },
  pageTurn: { tones: [], noise: { from: 1000, to: 300, gain: 0.08, dur: 0.08 } },
};

// 宝可梦：Game Boy 方波，明亮短促，金币=C6-E6-G6 上行琶音
const pokemon: TimbreProfile = {
  hover: { tones: [{ type: 'square', from: 1318, to: 1046, gain: 0.035, dur: 0.03 }] },
  select: { tones: [{ type: 'square', from: 523, to: 1046, gain: 0.05, dur: 0.05 }] },
  tab: { tones: [{ type: 'square', from: 784, steps: [[0, 784], [0.045, 1046]], gain: 0.05, dur: 0.09 }] },
  coin: {
    tones: [
      { type: 'square', from: 1046, gain: 0.05, dur: 0.06 },
      { type: 'square', from: 1318, at: 0.055, gain: 0.05, dur: 0.07 },
      { type: 'square', from: 1568, at: 0.11, gain: 0.05, dur: 0.12 },
    ],
  },
  pageTurn: { tones: [], noise: { from: 1600, to: 600, gain: 0.06, dur: 0.06 } },
};

// JRPG：三角波圆润短音，庄重的两连音，金币=清亮泛音
const jrpg: TimbreProfile = {
  hover: { tones: [{ type: 'triangle', from: 880, gain: 0.03, dur: 0.03 }] },
  select: { tones: [{ type: 'triangle', from: 659, to: 987, gain: 0.05, dur: 0.06 }] },
  tab: { tones: [{ type: 'triangle', from: 587, steps: [[0, 587], [0.05, 784]], gain: 0.06, dur: 0.11 }] },
  coin: {
    tones: [
      { type: 'sine', from: 1046, gain: 0.05, dur: 0.07 },
      { type: 'triangle', from: 1568, at: 0.065, gain: 0.05, dur: 0.16 },
    ],
  },
  pageTurn: { tones: [], noise: { from: 900, to: 280, gain: 0.07, dur: 0.09 } },
};

// Diablo：低频下沉的闷响，金币=下行双击（不祥的金币声）
const diablo: TimbreProfile = {
  hover: { tones: [{ type: 'square', from: 196, to: 147, gain: 0.04, dur: 0.05 }] },
  select: { tones: [{ type: 'square', from: 220, to: 110, gain: 0.055, dur: 0.09 }] },
  tab: { tones: [{ type: 'triangle', from: 196, steps: [[0, 196], [0.06, 261]], gain: 0.06, dur: 0.13 }] },
  coin: {
    tones: [
      { type: 'square', from: 392, gain: 0.05, dur: 0.07 },
      { type: 'square', from: 294, at: 0.065, gain: 0.05, dur: 0.15 },
    ],
  },
  pageTurn: { tones: [], noise: { from: 520, to: 160, gain: 0.075, dur: 0.11 } },
};

const TIMBRES: Record<string, TimbreProfile> = { stardew, pokemon, jrpg, diablo };

/* ---------------- 合成引擎 ---------------- */

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private profile: TimbreProfile = stardew;

  /** 主题切换时换音色参数；未知主题兜底星露谷 */
  setTheme(theme: string | undefined) {
    this.profile = TIMBRES[theme ?? 'stardew'] ?? stardew;
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(tone: Tone, t0: number) {
    if (!this.ctx) return;
    const t = t0 + (tone.at ?? 0);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = tone.type;
    osc.frequency.setValueAtTime(tone.from, t);
    if (tone.steps) {
      for (const [offset, freq] of tone.steps) {
        osc.frequency.setValueAtTime(freq, t + offset);
      }
    } else if (tone.to !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(tone.to, t + tone.dur);
    }

    gain.gain.setValueAtTime(tone.gain, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + tone.dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + tone.dur);
  }

  private playNoise(noise: Noise, t: number) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * noise.dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(noise.from, t);
    filter.frequency.linearRampToValueAtTime(noise.to, t + noise.dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(noise.gain, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + noise.dur);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noiseSource.start(t);
  }

  private play(event: SoundEvent) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const spec = this.profile[event];
      for (const tone of spec.tones) {
        this.playTone(tone, t);
      }
      if (spec.noise) {
        this.playNoise(spec.noise, t);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  playHover() { this.play('hover'); }
  playSelect() { this.play('select'); }
  playTab() { this.play('tab'); }
  playCoin() { this.play('coin'); }
  playPageTurn() { this.play('pageTurn'); }
}

export const retroAudio = new RetroAudioEngine();
