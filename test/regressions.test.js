import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  HEROES,
  ACCESSORIES,
  ARTIFACTS,
  ULT_DURATION_MS,
  artifactBonusText,
  partyMaxHp,
  waveReward,
  tapHarvestReward,
  lps,
  heroLps,
  harvestMultiplier,
  isAccessoryUnlocked,
  calculateGoldenSeeds,
  bloomAnew,
  advanceCombat,
  sanitizeSave,
} from '../src/game-engine.js';

const fresh = () => sanitizeSave(null);

describe('Audit regressions', () => {
  it('keeps accessories unlocked after Bloom Anew', () => {
    const state = fresh();
    state.battle.wave = 30;
    state.battle.wins = 29;
    state.lifetimeWins = 29;
    state.equipped = 'sunstone';
    bloomAnew(state);
    assert.equal(state.battle.wins, 0);
    const sunstone = ACCESSORIES.find(item => item.id === 'sunstone');
    assert.ok(isAccessoryUnlocked(state, sunstone));

    // Survives a save/load round trip too.
    const reloaded = sanitizeSave(JSON.parse(JSON.stringify(state)));
    assert.equal(reloaded.equipped, 'sunstone');
    assert.equal(reloaded.lifetimeWins, 29);
  });

  it('counts lifetime wins during combat', () => {
    const state = fresh();
    state.heroes.sprout = 500;
    advanceCombat(state, 30);
    assert.ok(state.battle.wins > 0);
    assert.equal(state.lifetimeWins, state.battle.wins);
  });

  it('migrates old saves without lifetimeWins from current wins', () => {
    const clean = sanitizeSave({ battle: { wave: 10, wins: 9 }, equipped: 'rose_brooch' });
    assert.equal(clean.lifetimeWins, 9);
    assert.equal(clean.equipped, 'rose_brooch');
  });

  it('artifact bonus text matches the numbers the engine actually applies', () => {
    const root = ARTIFACTS.find(art => art.id === 'eternal_root');
    const clover = ARTIFACTS.find(art => art.id === 'clover_fortune');
    assert.equal(artifactBonusText(root, 2), '+120 Party Max HP');
    assert.equal(artifactBonusText(clover, 3), '+60% Wave Leaves');

    const base = fresh();
    const boosted = fresh();
    boosted.artifacts.eternal_root = 2;
    boosted.artifacts.clover_fortune = 3;
    assert.equal(partyMaxHp(boosted) - partyMaxHp(base), 120);
    assert.equal(waveReward(1, null, boosted), Math.ceil(8 * 1.6));
  });

  it('tap harvest uses the same 25% boost as passive harvest', () => {
    const state = fresh();
    state.boosts.harvest = 4; // +100%
    const sprout = HEROES[0];
    const originalRandom = Math.random;
    Math.random = () => 0.99; // no crit
    try {
      const { amount } = tapHarvestReward(sprout, 10, state);
      assert.equal(amount, Math.ceil(5 * 2));
    } finally {
      Math.random = originalRandom;
    }
  });

  it('per-hero rates include multipliers and sum to total LPS', () => {
    const state = fresh();
    state.boosts.harvest = 2;
    state.artifacts.fertile_soil = 1;
    state.equipped = 'leaf_charm';
    state.heroes.sprout = 7;
    const perHero = HEROES.reduce((sum, hero) => sum + heroLps(state, hero), 0);
    assert.ok(Math.abs(perHero - lps(state)) < 1e-9);
    assert.ok(harvestMultiplier(state) > 1.9);
  });

  it('flags a stalemate so the UI can explain it', () => {
    const state = fresh();
    state.battle.wave = 40;
    state.battle.enemyHp = 1e12;
    advanceCombat(state, 1);
    assert.equal(state.battle.stalled, true);

    state.heroes.sprout = 1e5;
    state.battle.wave = 1;
    state.battle.enemyHp = 24;
    advanceCombat(state, 1);
    assert.equal(state.battle.stalled, false);
  });

  it('never returns NaN golden seeds for high wins at a low wave', () => {
    const seeds = calculateGoldenSeeds({ battle: { wave: 5, wins: 60 }, totalHarvested: 0 });
    assert.ok(Number.isFinite(seeds));
    assert.ok(seeds >= 1);
  });

  it('clamps a far-future ultimate timestamp from an edited save', () => {
    const before = Date.now();
    const clean = sanitizeSave({ battle: { ultActiveUntil: before + 1e12 } });
    assert.ok(clean.battle.ultActiveUntil <= Date.now() + ULT_DURATION_MS);
  });

  it('keeps artifact levels beyond the old cap of 25', () => {
    const clean = sanitizeSave({ artifacts: { sunlight_crystal: 40 } });
    assert.equal(clean.artifacts.sunlight_crystal, 40);
  });

  it('sanitizes the volume setting', () => {
    assert.equal(sanitizeSave({ settings: { volume: 250 } }).settings.volume, 100);
    assert.equal(sanitizeSave({ settings: { volume: 'loud' } }).settings.volume, 70);
    assert.equal(sanitizeSave({}).settings.volume, 70);
  });
});
