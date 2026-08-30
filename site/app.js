import { clampTempo, clonePattern, createExport, emphasize, instruments, originalPattern, toggleStep } from './model.mjs';

const state = {
  pattern: clonePattern(),
  tempo: 96,
  arrangement: 'original',
  playing: false,
  timer: null,
  audio: null,
  activeStep: -1
};

const grid = document.querySelector('#notation-grid');
const tempo = document.querySelector('#tempo');
const tempoOutput = document.querySelector('#tempo-output');
const playButton = document.querySelector('#play');
const stopButton = document.querySelector('#stop');
const loopInput = document.querySelector('#loop');
const metronomeInput = document.querySelector('#metronome');
const arrangement = document.querySelector('#arrangement');
const status = document.querySelector('#player-status');

function renderGrid() {
  grid.innerHTML = '';
  instruments.forEach((instrument) => {
    const row = document.createElement('div');
    row.className = 'notation-row';
    const label = document.createElement('span');
    label.className = 'instrument-label';
    label.textContent = instrument;
    row.append(label);
    state.pattern[instrument].forEach((enabled, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `step ${enabled ? 'is-on' : ''} ${state.activeStep === index ? 'is-active' : ''}`;
      button.dataset.instrument = instrument;
      button.dataset.step = String(index);
      button.setAttribute('aria-label', `${instrument}, beat ${index + 1}`);
      button.setAttribute('aria-pressed', String(Boolean(enabled)));
      button.innerHTML = `<span>${enabled ? notationSymbol(instrument) : '·'}</span>`;
      row.append(button);
    });
    grid.append(row);
  });
}

function notationSymbol(instrument) {
  if (instrument === 'kick') return '●';
  if (instrument === 'snare') return '◆';
  return '×';
}

function ensureAudio() {
  state.audio ||= new AudioContext();
  return state.audio;
}

function hit(instrument, at) {
  const ctx = ensureAudio();
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  if (instrument === 'kick') {
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(120, at);
    osc.frequency.exponentialRampToValueAtTime(45, at + 0.12);
    gain.gain.setValueAtTime(0.7, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + 0.2);
    osc.connect(gain); osc.start(at); osc.stop(at + 0.21);
    return;
  }
  const length = instrument === 'snare' ? 0.16 : 0.05;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = instrument === 'snare' ? 900 : 5000;
  gain.gain.setValueAtTime(instrument === 'snare' ? 0.34 : 0.16, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + length);
  source.buffer = buffer; source.connect(filter); filter.connect(gain); source.start(at);
}

function click(at) {
  const ctx = ensureAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 1200;
  gain.gain.setValueAtTime(0.08, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + 0.04);
  osc.connect(gain); gain.connect(ctx.destination); osc.start(at); osc.stop(at + 0.05);
}

function play() {
  stop();
  state.playing = true;
  playButton.setAttribute('aria-pressed', 'true');
  status.textContent = 'Playing the synthesized chart';
  const stepMs = (60_000 / state.tempo) / 4;
  let step = 0;
  const tick = () => {
    if (!state.playing) return;
    state.activeStep = step;
    const now = ensureAudio().currentTime;
    instruments.forEach((instrument) => {
      if (state.pattern[instrument][step]) hit(instrument, now);
    });
    if (metronomeInput.checked && step % 4 === 0) click(now);
    renderGrid();
    step += 1;
    if (step >= 16) {
      if (loopInput.checked) step = 0;
      else { stop(); return; }
    }
    state.timer = window.setTimeout(tick, stepMs);
  };
  tick();
}

function stop() {
  state.playing = false;
  playButton.setAttribute('aria-pressed', 'false');
  if (state.timer) window.clearTimeout(state.timer);
  state.timer = null;
  state.activeStep = -1;
  status.textContent = 'Ready — edit a step or press play';
  renderGrid();
}

grid.addEventListener('click', (event) => {
  const button = event.target.closest('.step');
  if (!button) return;
  state.pattern = toggleStep(state.pattern, button.dataset.instrument, Number(button.dataset.step));
  renderGrid();
});

tempo.addEventListener('input', () => {
  state.tempo = clampTempo(tempo.value);
  tempoOutput.value = `${state.tempo} BPM`;
  if (state.playing) play();
});

arrangement.addEventListener('change', () => {
  state.arrangement = arrangement.value;
  state.pattern = emphasize(originalPattern, state.arrangement);
  renderGrid();
});

playButton.addEventListener('click', play);
stopButton.addEventListener('click', stop);
document.querySelector('#reset').addEventListener('click', () => {
  stop();
  state.arrangement = 'original';
  arrangement.value = 'original';
  state.pattern = clonePattern();
  renderGrid();
});
document.querySelector('#export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(createExport(state.pattern, state.tempo, state.arrangement), null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'drumai-demo-arrangement.json';
  link.click();
  URL.revokeObjectURL(link.href);
  status.textContent = 'Arrangement exported locally';
});

renderGrid();
