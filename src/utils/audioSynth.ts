/**
 * Web Audio API ambient audio synthesizer
 * Creates cozy background soundscapes (fireplace crackle, quiet rain, forest breeze)
 * 100% generated in real-time, no external MP3 dependencies required.
 */

import { AmbientSoundType } from '../types';

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentType: AmbientSoundType = 'fireplace';
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | AudioBufferSourceNode)[] = [];
  private volumeLevel = 0.3;

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setType(type: AmbientSoundType) {
    this.currentType = type;
    if (this.isPlaying) {
      this.start(type);
    }
  }

  public setVolume(val: number) {
    this.volumeLevel = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volumeLevel, this.ctx.currentTime);
    }
  }

  public toggle(type?: AmbientSoundType): boolean {
    if (type && type !== this.currentType) {
      this.currentType = type;
      this.start(type);
      return true;
    }

    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start(this.currentType);
      return true;
    }
  }

  public start(type: AmbientSoundType = this.currentType) {
    this.init();
    if (!this.ctx) return;

    this.stopNodes();
    this.currentType = type;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volumeLevel, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    if (type === 'fireplace') {
      this.buildFireplace(this.masterGain);
    } else if (type === 'rain') {
      this.buildQuietRain(this.masterGain);
    } else if (type === 'breeze') {
      this.buildForestBreeze(this.masterGain);
    }

    this.isPlaying = true;
  }

  private buildFireplace(destination: GainNode) {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 3; // 3 sec loop

    // 1. Crackle Buffer
    const crackleBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = crackleBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const r = Math.random();
      if (r > 0.998) {
        data[i] = (Math.random() * 2 - 1) * 0.85;
      } else if (r > 0.985) {
        data[i] = (Math.random() * 2 - 1) * 0.25;
      } else {
        data[i] = (Math.random() * 2 - 1) * 0.015;
      }
    }

    const crackleSource = this.ctx.createBufferSource();
    crackleSource.buffer = crackleBuffer;
    crackleSource.loop = true;

    const crackleFilter = this.ctx.createBiquadFilter();
    crackleFilter.type = 'lowpass';
    crackleFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);

    crackleSource.connect(crackleFilter);
    crackleFilter.connect(destination);
    crackleSource.start();

    // 2. Warm Hum
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const nData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      nData[i] = (Math.random() * 2 - 1) * 0.08;
    }

    const windSource = this.ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);

    windSource.connect(windFilter);
    windFilter.connect(destination);
    windSource.start();

    this.activeNodes.push(crackleSource, crackleFilter, windSource, windFilter);
  }

  private buildQuietRain(destination: GainNode) {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 4;

    // Rain noise buffer
    const rainBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = rainBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise algorithm
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;

      // Random gentle raindrop ticks
      if (Math.random() > 0.997) {
        data[i] += (Math.random() * 2 - 1) * 0.18;
      }
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(destination);
    rainSource.start();

    this.activeNodes.push(rainSource, rainFilter);
  }

  private buildForestBreeze(destination: GainNode) {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 5;

    const breezeBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = breezeBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.06;
    }

    const breezeSource = this.ctx.createBufferSource();
    breezeSource.buffer = breezeBuffer;
    breezeSource.loop = true;

    const breezeFilter = this.ctx.createBiquadFilter();
    breezeFilter.type = 'bandpass';
    breezeFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
    breezeFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    // LFO for swaying breeze oscillation
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime); // slow swell
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(breezeFilter.frequency);
    lfo.start();

    breezeSource.connect(breezeFilter);
    breezeFilter.connect(destination);
    breezeSource.start();

    this.activeNodes.push(breezeSource, breezeFilter, lfo, lfoGain);
  }

  private stopNodes() {
    this.activeNodes.forEach(node => {
      try {
        if ('stop' in node && typeof node.stop === 'function') {
          (node as AudioBufferSourceNode | OscillatorNode).stop();
        }
        node.disconnect();
      } catch {
        // ignore disconnect errors
      }
    });
    this.activeNodes = [];

    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.disconnect();
      } catch {
        // ignore
      }
    }
  }

  public stop() {
    this.stopNodes();
    this.isPlaying = false;
  }

  public getIsPlaying() {
    return this.isPlaying;
  }

  public getCurrentType() {
    return this.currentType;
  }
}

export const ambientAudio = new AmbientSoundEngine();
