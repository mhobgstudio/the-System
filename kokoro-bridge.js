import { KokoroTTS } from 'kokoro-js';

let tts = null;
let loadPromise = null;
let loadingNotified = false;

async function getTTS() {
  if (tts) return tts;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    if (!loadingNotified) {
      loadingNotified = true;
      const el = document.getElementById('quote-text');
      if (el) el.textContent = '⏳ Loading voice model...';
    }
    tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
      dtype: 'q8',
      device: 'wasm',
    });
    return tts;
  })();
  return loadPromise;
}

function createReverb(ctx, sampleRate, duration, decay) {
  const len = sampleRate * duration;
  const impulse = ctx.createBuffer(2, len, sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * decay));
    }
  }
  return impulse;
}

window.speakWithKokoro = async function speakWithKokoro(text) {
  if (!text) return false;
  try {
    const model = await getTTS();
    const audio = await model.generate(text, { voice: 'am_michael' });

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const raw = audio.data || audio.audio;
    const sr = audio.sampling_rate || audio.sample_rate;

    const buffer = ctx.createBuffer(1, raw.length, sr);
    buffer.getChannelData(0).set(raw);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = 0.75;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;

    const convolver = ctx.createConvolver();
    convolver.buffer = createReverb(ctx, sr, 0.4, 0.12);

    source.connect(filter);
    filter.connect(convolver);
    convolver.connect(ctx.destination);
    source.start();
    return true;
  } catch (e) {
    console.warn('Kokoro TTS failed:', e);
    return false;
  }
};
