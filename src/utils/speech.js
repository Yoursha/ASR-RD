/**
 * Web Speech API wrapper for Text-To-Speech (TTS) and Automatic Speech Recognition (ASR)
 */

export class TTSPlayer {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.selectedVoice = null;
    this.rate = 0.9; // Normal pleasant speed for learning

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    const allVoices = this.synth.getVoices();
    // Filter Chinese voices (zh-CN, zh-TW, zh-HK)
    this.voices = allVoices.filter(v => v.lang.toLowerCase().includes('zh'));
    // Prioritize zh-CN
    this.selectedVoice = this.voices.find(v => v.lang.toLowerCase().includes('zh-cn')) || this.voices[0] || null;
  }

  speak(text, { onStart, onEnd, onError, rate = 0.9 } = {}) {
    if (!this.synth) {
      if (onError) onError('Speech Synthesis is not supported in this browser.');
      return;
    }

    this.synth.cancel(); // Stop any active playback

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = rate;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
      console.error('TTS Error:', err);
      if (onError) onError(err);
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export class ASRListener {
  constructor() {
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    this.isSupported = !!SpeechRecognition;
    this.recognition = SpeechRecognition ? new SpeechRecognition() : null;

    if (this.recognition) {
      this.recognition.lang = 'zh-CN';
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  startListening({ onResult, onEnd, onError }) {
    if (!this.recognition) {
      if (onError) onError('Speech Recognition (ASR) is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return false;
    }

    let finalTranscript = '';

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      const combined = finalTranscript + interimTranscript;
      if (onResult) {
        onResult({
          transcript: combined,
          isFinal: false
        });
      }
    };

    this.recognition.onend = () => {
      if (onEnd) {
        onEnd(finalTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('ASR Error:', event.error);
      let errorMessage = 'Speech recognition error occurred.';
      if (event.error === 'no-speech') {
        errorMessage = 'No speech detected. Please speak into your microphone.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'No microphone was found or microphone is busy.';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Microphone permission denied. Please allow microphone access.';
      }
      if (onError) onError(errorMessage);
    };

    try {
      this.recognition.start();
      return true;
    } catch (e) {
      console.error('Failed to start recognition:', e);
      if (onError) onError('Failed to start microphone listening.');
      return false;
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore if already stopped
      }
    }
  }
}
