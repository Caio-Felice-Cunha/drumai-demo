import test from 'node:test';
import assert from 'node:assert/strict';
import { clampTempo, clonePattern, createExport, originalPattern, toggleStep } from '../site/model.mjs';

test('tempo is clamped to the safe UI range', () => {
  assert.equal(clampTempo(20), 60);
  assert.equal(clampTempo(200), 160);
  assert.equal(clampTempo('112'), 112);
  assert.equal(clampTempo('bad'), 96);
});

test('editing is immutable and deterministic', () => {
  const original = clonePattern();
  const edited = toggleStep(original, 'kick', 1);
  assert.equal(original.kick[1], 0);
  assert.equal(edited.kick[1], 1);
  assert.deepEqual(original, clonePattern(originalPattern));
});

test('export exposes only the demo contract', () => {
  const exported = createExport(clonePattern(), 99.6, 'original');
  assert.equal(exported.format, 'drumai-demo-arrangement/v1');
  assert.equal(exported.tempo, 100);
  assert.equal(exported.bars, 4);
  assert.equal(JSON.stringify(exported).includes('http'), false);
});
