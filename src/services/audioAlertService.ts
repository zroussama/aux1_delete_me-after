/**
 * Audio Alert & Power Restoration Voice Chime Service
 * Multilingual support: Tunisian Darija (الضو رجع), French, and English
 */

import { AudioLanguage } from '../types';

class AudioAlertService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays a pleasant dual-tone power restoration chime using Web Audio API
   */
  public playRestorationChime(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const ctx = this.getAudioContext();
        const now = ctx.currentTime;

        // Tone 1: C5 (523.25 Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now);
        gain1.gain.setValueAtTime(0.15, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.6);

        // Tone 2: G5 (783.99 Hz) at +0.15s
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(783.99, now + 0.15);
        gain2.gain.setValueAtTime(0.2, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.85);

        // Tone 3: C6 (1046.50 Hz) major chord finish at +0.3s
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(1046.50, now + 0.3);
        gain3.gain.setValueAtTime(0.25, now + 0.3);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start(now + 0.3);
        osc3.stop(now + 1.2);

        setTimeout(() => {
          resolve();
        }, 800);
      } catch (err) {
        console.warn('Web Audio playback error:', err);
        resolve();
      }
    });
  }

  /**
   * Returns text string for restoration announcement based on language
   */
  public getRestorationText(language: AudioLanguage, delegationName?: string): { title: string; speech: string } {
    const nameStr = delegationName ? ` ${delegationName}` : '';

    switch (language) {
      case 'AR_TN':
        return {
          title: 'الضو رجع!',
          speech: `الضو رجع! الحمد لله، رجع التيار الكهربائي في منطقة ${nameStr || 'منطقتكم'}.`
        };
      case 'FR':
        return {
          title: 'Le courant est rétabli !',
          speech: `Le courant électrique est rétabli dans la zone ${nameStr || 'votre secteur'} !`
        };
      case 'EN':
      default:
        return {
          title: 'Power Restored!',
          speech: `Power has been restored to ${nameStr || 'your area'}!`
        };
    }
  }

  /**
   * Speaks the vocal alert in the selected language using SpeechSynthesis API
   */
  public speakRestorationAlert(language: AudioLanguage = 'AR_TN', delegationName?: string): void {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis API not supported in browser');
      return;
    }

    // First play chime sound
    this.playRestorationChime().then(() => {
      window.speechSynthesis.cancel(); // Stop ongoing speech

      const { speech } = this.getRestorationText(language, delegationName);
      const utterance = new SpeechSynthesisUtterance(speech);

      // Select voice based on language code
      const voices = window.speechSynthesis.getVoices();
      if (language === 'AR_TN') {
        utterance.lang = 'ar-TN';
        const arVoice = voices.find(v => v.lang.startsWith('ar'));
        if (arVoice) utterance.voice = arVoice;
        utterance.rate = 0.95;
      } else if (language === 'FR') {
        utterance.lang = 'fr-FR';
        const frVoice = voices.find(v => v.lang.startsWith('fr'));
        if (frVoice) utterance.voice = frVoice;
        utterance.rate = 1.0;
      } else {
        utterance.lang = 'en-US';
        const enVoice = voices.find(v => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
        utterance.rate = 1.0;
      }

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Requests browser notification permission and sends Web Push / Desktop Notification
   */
  public async sendPushNotification(title: string, body: string): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/pwa-192.png',
          badge: '/pwa-192.png'
        });
        return true;
      } catch (err) {
        console.warn('Notification construction failed:', err);
      }
    }
    return false;
  }
}

export const audioAlertService = new AudioAlertService();
