interface MusicState {
  ctx: AudioContext | null;
  master: GainNode | null;
  playing: boolean;
  stopTimer: number | null;
  tickTimer: number | null;
}

const state: MusicState = {
  ctx: null,
  master: null,
  playing: false,
  stopTimer: null,
  tickTimer: null,
};

const notes = [
  "C4",
  "E4",
  "G4",
  "C5",
  "E4",
  "G4",
  "B4",
  "E5",
  "A3",
  "C4",
  "E4",
  "A4",
  "F3",
  "A3",
  "C4",
  "F4",
];

function noteHz(n: string) {
  const semitones: Record<string, number> = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
  const m = n.match(/([A-G])(\d)/);
  if (!m) return 440;
  const oct = parseInt(m[2], 10);
  const s = semitones[m[1]] + (oct - 4) * 12;
  return 440 * Math.pow(2, s / 12);
}

function init() {
  if (state.ctx) return;
  const Ctor =
    (window.AudioContext as typeof AudioContext | undefined) ??
    ((window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  if (!Ctor) return;
  state.ctx = new Ctor();
  state.master = state.ctx.createGain();
  state.master.gain.value = 0.07;
  state.master.connect(state.ctx.destination);
}

function beep(freq: number, dur: number, when: number) {
  if (!state.ctx || !state.master) return;
  const o = state.ctx.createOscillator();
  const g = state.ctx.createGain();
  o.type = "square";
  o.frequency.setValueAtTime(freq, when);
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(0.7, when + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, when + dur);
  o.connect(g);
  g.connect(state.master);
  o.start(when);
  o.stop(when + dur + 0.02);
}

export function playMusic() {
  init();
  if (!state.ctx || state.playing) return;
  state.playing = true;
  const bpm = 220;
  const beat = 60 / bpm;
  let i = 0;
  function tick() {
    if (!state.playing || !state.ctx) return;
    const t = state.ctx.currentTime;
    beep(noteHz(notes[i % notes.length]), beat * 0.9, t);
    if (i % 4 === 0) {
      const base = notes[(Math.floor(i / 4) * 4) % notes.length].replace(/\d/, (d) =>
        String(Math.max(2, Number(d) - 2)),
      );
      beep(noteHz(base), beat * 1.8, t);
    }
    i++;
    state.tickTimer = window.setTimeout(tick, beat * 1000);
  }
  tick();
  state.stopTimer = window.setTimeout(stopMusic, beat * notes.length * 4 * 1000);
}

export function stopMusic() {
  state.playing = false;
  if (state.tickTimer !== null) window.clearTimeout(state.tickTimer);
  if (state.stopTimer !== null) window.clearTimeout(state.stopTimer);
  state.tickTimer = null;
  state.stopTimer = null;
}

export function isMusicPlaying() {
  return state.playing;
}
