export const instruments = ['kick', 'snare', 'hihat'];

export const originalPattern = Object.freeze({
  kick: Object.freeze([1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0]),
  snare: Object.freeze([0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]),
  hihat: Object.freeze([1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0])
});

export function clonePattern(pattern = originalPattern) {
  return Object.fromEntries(instruments.map((name) => [name, [...pattern[name]]]));
}

export function clampTempo(value) {
  const tempo = Number(value);
  if (!Number.isFinite(tempo)) return 96;
  return Math.min(160, Math.max(60, Math.round(tempo)));
}

export function toggleStep(pattern, instrument, step) {
  if (!instruments.includes(instrument) || step < 0 || step > 15) return clonePattern(pattern);
  const next = clonePattern(pattern);
  next[instrument][step] = next[instrument][step] ? 0 : 1;
  return next;
}

export function emphasize(pattern, arrangement) {
  const next = clonePattern(pattern);
  if (arrangement === 'half-time') {
    next.snare = next.snare.map((_, index) => (index === 8 ? 1 : 0));
  }
  if (arrangement === 'open-hat') {
    next.hihat = next.hihat.map((value, index) => (index % 4 === 2 ? 1 : value));
  }
  return next;
}

export function createExport(pattern, tempo, arrangement) {
  return {
    format: 'drumai-demo-arrangement/v1',
    tempo: clampTempo(tempo),
    timeSignature: '4/4',
    bars: 4,
    arrangement,
    pattern: clonePattern(pattern),
    provenance: 'Original deterministic browser-demo fixture'
  };
}
