import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Audio {
  private audioCtx: AudioContext | null = null;

  constructor() {}

  private initAudio(): void {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  playMenuSound(type: 'move' | 'confirm'): void {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      
      if (type === 'move') {
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(950, this.audioCtx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(150, this.audioCtx.currentTime + 0.04);
        gain1.gain.setValueAtTime(0.07, this.audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);
        
        osc1.connect(gain1);
        gain1.connect(this.audioCtx.destination);

        const osc2 = this.audioCtx.createOscillator();
        const gain2 = this.audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(640, this.audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(420, this.audioCtx.currentTime + 0.06);
        gain2.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.06);
        
        osc2.connect(gain2);
        gain2.connect(this.audioCtx.destination);
        
        osc1.start();
        osc2.start();
        osc1.stop(this.audioCtx.currentTime + 0.04);
        osc2.stop(this.audioCtx.currentTime + 0.06);
      } 
      else if (type === 'confirm') {
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, this.audioCtx.currentTime);
        osc1.frequency.setValueAtTime(880, this.audioCtx.currentTime + 0.05);
        gain1.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);
        
        osc1.connect(gain1);
        gain1.connect(this.audioCtx.destination);
        
        osc1.start();
        osc1.stop(this.audioCtx.currentTime + 0.25);
      }
    } catch (e) {
      console.log('Audio Context no inicializado:', e);
    }
  }
}
