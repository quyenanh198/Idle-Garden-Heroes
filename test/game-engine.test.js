import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  HEROES,
  PLOT_COSTS,
  UNITS,
  ACCESSORIES,
  DEFAULT_STATE,
  lps,
  combatPower,
  partyMaxHp,
  enemyMaxHp,
  enemyDamage,
  waveReward,
  upgradeCost,
  unitCost,
  boostCost,
  nextPlotCost,
  advanceCombat,
  sanitizeSave,
  troopCount,
} from '../src/game-engine.js';

describe('Game Engine - Math & Formulas', () => {
  it('calculates initial LPS correctly', () => {
    const state = sanitizeSave(null);
    assert.equal(state.heroes.sprout, 1);
    // Sprout baseLps is 1, no boosts, no charms
    assert.equal(lps(state), 1);
  });

  it('calculates LPS with multiple heroes, legion, boosts, and leaf_charm', () => {
    const state = {
      heroes: { sprout: 2, rose: 1 }, // sprout: 2*1 = 2, rose: 1*4 = 4 -> base = 6
      legion: { scout: 4, archer: 0, guardian: 0 }, // scout: 4*0.5 = 2 -> total = 8
      boosts: { harvest: 2, power: 0, vitality: 0 }, // 1 + 2*0.25 = 1.5 -> 8 * 1.5 = 12
      equipped: 'leaf_charm', // +10% -> 12 * 1.1 = 13.2
    };
    assert.equal(Math.round(lps(state) * 10) / 10, 13.2);
  });

  it('calculates combat power correctly with rose_brooch', () => {
    const state = {
      heroes: { sprout: 1 }, // sprout baseLps*3 = 3
      legion: { scout: 2 }, // scout power: 2*2 = 4 -> total base = 7
      boosts: { harvest: 0, power: 1, vitality: 0 }, // 1 + 1*0.2 = 1.2 -> 7 * 1.2 = 8.4
      equipped: 'rose_brooch', // +15% -> 8.4 * 1.15 = 9.66
    };
    assert.equal(Math.round(combatPower(state) * 100) / 100, 9.66);
  });

  it('calculates party maximum HP correctly with oak_badge', () => {
    const state = {
      heroes: { sprout: 2 }, // 100 + 2*10 = 120
      legion: { scout: 5, guardian: 1 }, // scout: 5*4=20, guardian: 1*20=20 -> +40 = 160
      boosts: { vitality: 2 }, // 2*40 = +80 = 240
      equipped: 'oak_badge', // +30 = 270
    };
    assert.equal(partyMaxHp(state), 270);
  });

  it('calculates upgrade costs with exponential scaling', () => {
    const sprout = HEROES[0];
    assert.equal(upgradeCost(sprout, 1), 12);
    assert.equal(upgradeCost(sprout, 2), Math.ceil(12 * 1.32));
    assert.equal(upgradeCost(sprout, 5), Math.ceil(12 * Math.pow(1.32, 4)));

    const scout = UNITS[0];
    assert.equal(unitCost(scout, 0), 25);
    assert.equal(unitCost(scout, 3), Math.ceil(25 * Math.pow(1.16, 3)));
  });

  it('calculates plot costs accurately', () => {
    assert.equal(nextPlotCost(0), 0);
    assert.equal(nextPlotCost(1), 30);
    assert.equal(nextPlotCost(5), 6200);
    assert.equal(nextPlotCost(6), Infinity);
  });

  it('calculates wave rewards with boss multiplier and sunstone', () => {
    // Normal wave 1
    assert.equal(waveReward(1, null), 8);
    // Boss wave 5
    const regularWave5 = 8 * Math.pow(1.23, 4) * 2;
    assert.equal(waveReward(5, null), Math.ceil(regularWave5));
    // Wave 1 with Sunstone (+25%)
    assert.equal(waveReward(1, 'sunstone'), 10);
  });
});

describe('Game Engine - Combat Simulation & Progression', () => {
  it('advances combat and clears a wave when party is strong', () => {
    const state = {
      heroes: { sprout: 10 }, // combatPower = 10 * 1 * 3 = 30
      legion: { scout: 0, archer: 0, guardian: 0 },
      boosts: { harvest: 0, power: 0, vitality: 0 },
      equipped: null,
      leaves: 0,
      totalHarvested: 0,
      battle: {
        wave: 1,
        enemyHp: 24, // 24 HP at wave 1
        partyHp: 200,
        wins: 0,
        earned: 0,
      },
    };

    // 30 DPS vs 24 HP takes ~0.8s
    advanceCombat(state, 1.0);

    assert.equal(state.battle.wave, 2);
    assert.equal(state.battle.wins, 1);
    assert.ok(state.leaves > 0);
    assert.ok(state.battle.earned > 0);
  });

  it('handles combat stalemate cleanly without spinning 10,000 steps', () => {
    const state = {
      heroes: { sprout: 1 }, // power = 3
      legion: { scout: 0, archer: 0, guardian: 0 },
      boosts: { harvest: 0, power: 0, vitality: 0 },
      equipped: null,
      leaves: 0,
      totalHarvested: 0,
      battle: {
        wave: 40, // Enemy has thousands of HP and high damage
        enemyHp: enemyMaxHp(40),
        partyHp: 110,
        wins: 0,
        earned: 0,
      },
    };

    const start = performance.now();
    // Simulate 8 hours of offline progress while stuck on wave 40
    advanceCombat(state, 8 * 3600);
    const duration = performance.now() - start;

    // Stalemate detection should exit almost instantly (< 50ms)
    assert.ok(duration < 100, `Combat simulation took too long: ${duration}ms`);
    assert.equal(state.battle.wave, 40);
    assert.equal(state.battle.wins, 0);
    assert.equal(state.battle.partyHp, partyMaxHp(state));
  });

  it('respects wave 150 cap', () => {
    const state = {
      heroes: { sprout: 100000 }, // High level
      legion: { scout: 0, archer: 0, guardian: 0 },
      boosts: { harvest: 0, power: 20, vitality: 20 },
      equipped: null,
      leaves: 0,
      totalHarvested: 0,
      battle: {
        wave: 150,
        enemyHp: 1, // 1 HP left on wave 150
        partyHp: 1e15, // High HP to survive wave 150 damage
        wins: 150,
        earned: 50000,
      },
    };

    advanceCombat(state, 1.0);
    assert.equal(state.battle.wave, 150); // Capped at 150
    assert.equal(state.battle.wins, 151); // But wins still increment
  });

  it('resilient against NaN or negative inputs in advanceCombat', () => {
    const state = {
      heroes: { sprout: 1 },
      legion: { scout: 0, archer: 0, guardian: 0 },
      boosts: { harvest: 0, power: 0, vitality: 0 },
      equipped: null,
      leaves: 10,
      totalHarvested: 10,
      battle: {
        wave: 1,
        enemyHp: NaN,
        partyHp: -50,
        wins: 0,
        earned: 0,
      },
    };

    assert.doesNotThrow(() => {
      advanceCombat(state, NaN);
      advanceCombat(state, -10);
      advanceCombat(state, 1.0);
    });

    assert.ok(Number.isFinite(state.battle.partyHp));
    assert.ok(Number.isFinite(state.battle.enemyHp));
    assert.ok(Number.isFinite(state.leaves));
  });
});

describe('Game Engine - Save Sanitization & Corruption Resistance', () => {
  it('returns valid default state for null or invalid JSON objects', () => {
    const state1 = sanitizeSave(null);
    assert.equal(state1.plots, 1);
    assert.equal(state1.heroes.sprout, 1);

    const state2 = sanitizeSave('not-an-object');
    assert.equal(state2.plots, 1);
    assert.equal(state2.heroes.sprout, 1);
  });

  it('cleanses NaN, Infinity, negative values, and out-of-range fields', () => {
    const corrupt = {
      leaves: NaN,
      totalHarvested: -500,
      plots: 99, // Should clamp to 6
      heroes: {
        sprout: -5, // Should clamp to 1
        rose: Infinity, // Should clamp to safe level
      },
      battle: {
        wave: 999, // Should clamp to 150
        enemyHp: 'not a number',
        partyHp: -10,
        wins: NaN,
      },
      boosts: {
        harvest: 100, // Max level is 20
      },
      equipped: 'sunstone', // Only unlocked at 15 wins; with 0 wins it should be unequipped
    };

    const clean = sanitizeSave(corrupt);

    assert.equal(clean.leaves, 0);
    assert.equal(clean.totalHarvested, 0);
    assert.equal(clean.plots, 6);
    assert.equal(clean.heroes.sprout, 1);
    assert.ok(clean.heroes.rose <= 100000);
    assert.equal(clean.battle.wave, 150);
    assert.ok(clean.battle.enemyHp > 0);
    assert.ok(clean.battle.partyHp > 0);
    assert.equal(clean.battle.wins, 0);
    assert.equal(clean.boosts.harvest, 20);
    assert.equal(clean.equipped, null); // Locked accessory filtered out
  });
});
