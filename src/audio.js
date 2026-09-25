// Cozy synthesized Web Audio sound effects for Idle Garden Hero
// Zero external files, zero latency, zero bandwidth

let audioCtx = null;
let masterGain = null;
let soundEnabled = true;
let volume = 0.7;

function getContext() {
  if (!soundEnabled || volume <= 0) return null;
  if (!audioCtx) {
    // Browsers block audio before the first user gesture; wait for one instead of creating a suspended context.
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = volume;
      masterGain.connect(audioCtx.destination);
    }
  }
  if (audioCtx?.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Every sound routes through one master gain so the volume setting applies everywhere.
function output(ctx) {
  return masterGain || ctx.destination;
}

export function setSoundEnabled(enabled) {
  soundEnabled = !!enabled;
}

export function setVolume(level) {
  volume = Math.max(0, Math.min(1, Number(level) || 0));
  if (masterGain) masterGain.gain.value = volume;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function playTap() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(420, now);
  osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(gain);
  gain.connect(output(ctx));

  osc.start(now);
  osc.stop(now + 0.1);
}

export function playCritTap() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  [587.33, 880, 1174.66].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.04);
    gain.gain.setValueAtTime(0.2, now + i * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.15);
    osc.connect(gain);
    gain.connect(output(ctx));
    osc.start(now + i * 0.04);
    osc.stop(now + i * 0.04 + 0.16);
  });
}

export function playHarvest() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

  osc.connect(gain);
  gain.connect(output(ctx));

  osc.start(now);
  osc.stop(now + 0.14);
}

export function playHeroAttack(heroId) {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  if (heroId === 'rose') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(659, now);
    osc.frequency.exponentialRampToValueAtTime(987, now + 0.1);
  } else if (heroId === 'oak') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
  } else if (heroId === 'daisy') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523, now);
    osc.frequency.linearRampToValueAtTime(784, now + 0.09);
  } else if (heroId === 'moss') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.15);
  } else if (heroId === 'sunflower') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
  } else {
    // Sprout default
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.07);
  }

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(output(ctx));
  osc.start(now);
  osc.stop(now + 0.13);
}

export function playEnemyAttack() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain);
  gain.connect(output(ctx));
  osc.start(now);
  osc.stop(now + 0.16);
}

export function playHit() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(output(ctx));
  osc.start(now);
  osc.stop(now + 0.09);
}

export function playUpgrade() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + i * 0.055;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.2, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
    osc.connect(gain);
    gain.connect(output(ctx));
    osc.start(start);
    osc.stop(start + 0.19);
  });
}

export function playVictory() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + i * 0.07;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.22, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + (i === 3 ? 0.45 : 0.22));
    osc.connect(gain);
    gain.connect(output(ctx));
    osc.start(start);
    osc.stop(start + (i === 3 ? 0.46 : 0.23));
  });
}

export function playUlt() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Harmonious radiant sweep
  [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + i * 0.045;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, start + 0.25);
    gain.gain.setValueAtTime(0.25, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
    osc.connect(gain);
    gain.connect(output(ctx));
    osc.start(start);
    osc.stop(start + 0.42);
  });
}

export function playBloom() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  [330, 440, 554.37, 659.25, 880].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + i * 0.08;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.28, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
    osc.connect(gain);
    gain.connect(output(ctx));
    osc.start(start);
    osc.stop(start + 0.65);
  });
}
