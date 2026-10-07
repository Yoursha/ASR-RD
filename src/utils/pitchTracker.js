/**
 * Web Audio API real-time pitch detector using autocorrelation algorithm.
 * Tracks vocal pitch contour (F0 in Hz) during speech recording.
 */

export class PitchTracker {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.micStream = null;
    this.sourceNode = null;
    this.isTracking = false;
    this.pitchHistory = [];
    this.animationId = null;
    this.onPitchUpdate = null;
  }

  async startTracking(onPitchUpdate) {
    this.onPitchUpdate = onPitchUpdate;
    this.pitchHistory = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.micStream = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();

      this.sourceNode = this.audioCtx.createMediaStreamSource(stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;

      this.sourceNode.connect(this.analyser);
      this.isTracking = true;

      this.tick();
      return true;
    } catch (err) {
      console.warn('Pitch tracker audio context error:', err);
      return false;
    }
  }

  tick = () => {
    if (!this.isTracking || !this.analyser) return;

    const buffer = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(buffer);

    const pitch = autoCorrelate(buffer, this.audioCtx.sampleRate);
    const timestamp = Date.now();

    if (pitch > 0 && pitch < 600) { // Valid human vocal range
      this.pitchHistory.push({ time: timestamp, pitchHz: Math.round(pitch) });
      // Keep recent 150 points (~3-4 seconds)
      if (this.pitchHistory.length > 150) {
        this.pitchHistory.shift();
      }
      if (this.onPitchUpdate) {
        this.onPitchUpdate(this.pitchHistory, pitch);
      }
    } else {
      if (this.onPitchUpdate) {
        this.onPitchUpdate(this.pitchHistory, null);
      }
    }

    this.animationId = requestAnimationFrame(this.tick);
  };

  stopTracking() {
    this.isTracking = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    return this.pitchHistory;
  }
}

/**
 * Autocorrelation algorithm to estimate fundamental frequency (F0)
 */
function autoCorrelate(buf, sampleRate) {
  const SIZE = buf.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    const val = buf[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);

  // Noise floor threshold
  if (rms < 0.01) return -1;

  let r1 = 0, r2 = SIZE - 1, thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < thres) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < thres) {
      r2 = SIZE - i;
      break;
    }
  }

  buf = buf.slice(r1, r2);
  const newSize = buf.length;

  const c = new Array(newSize).fill(0);
  for (let i = 0; i < newSize; i++) {
    for (let j = 0; j < newSize - i; j++) {
      c[i] = c[i] + buf[j] * buf[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;

  let maxval = -1, maxpos = -1;
  for (let i = d; i < newSize; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  let T0 = maxpos;

  // Parabolic interpolation for better accuracy
  const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}
