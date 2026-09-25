import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_STATE, lps, waterHero, awardLuckyCritter, consumeFrenzyTap, sanitizeSave } from '../src/game-engine.js';

const fresh = () => structuredClone(DEFAULT_STATE);

test('watering an owned hero boosts production for fifteen seconds and survives save loading', () => {
  const state = fresh();
  const now = Date.now();
  assert.equal(waterHero(state, 'rose', now), false);
  assert.equal(waterHero(state, 'sprout', now), true);
  assert.equal(lps(state, now + 14_999), 1.5);
  assert.equal(lps(state, now + 15_000), 1);
  const saved = sanitizeSave(state);
  assert.equal(saved.gardenBuff.heroId, 'sprout');
  assert.ok(saved.gardenBuff.until <= Date.now() + 15_000);
});

test('lucky rewards grant harvest, ten boosted taps, or one seed per five shards', () => {
  const state = fresh();
  assert.equal(awardLuckyCritter(state, 'harvest', 100).amount, 30);
  assert.equal(state.leaves, 30);
  awardLuckyCritter(state, 'frenzy');
  assert.equal(consumeFrenzyTap(state, 2), 10);
  assert.equal(state.frenzyTaps, 9);
  for (let i = 0; i < 5; i++) awardLuckyCritter(state, 'shard');
  assert.equal(state.seedShards, 0);
  assert.equal(state.goldenSeeds, 1);
  const saved = sanitizeSave(state);
  assert.equal(saved.frenzyTaps, 9);
  assert.equal(saved.goldenSeeds, 1);
});
