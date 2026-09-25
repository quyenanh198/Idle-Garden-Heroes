import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  HEROES,
  PLOT_COSTS,
  UNITS,
  ACCESSORIES,
  ARTIFACTS,
  BIOMES,
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
  artifactCost,
  nextPlotCost,
  advanceCombat,
  sanitizeSave,
  troopCount,
  biomeForWave,
  tapHarvestReward,
  canActivateUltimate,
  activateUltimate,
  canBloomAnew,
  calculateGoldenSeeds,
  bloomAnew,
  DEFAULT_TACTICS,
  HERO_SKILLS,
  floorForWave,
  sanitizeTactics,
  executeTurn,
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

  it('calculates party maximum HP correctly with oak_badge and eternal_root artifact', () => {
    const state = {
      heroes: { sprout: 2 }, // 100 + 2*10 = 120
      legion: { scout: 5, guardian: 1 }, // scout: 5*4=20, guardian: 1*20=20 -> +40 = 160
      boosts: { vitality: 2 }, // 2*40 = +80 = 240
      artifacts: { eternal_root: 1 }, // +60 = 300
      equipped: 'oak_badge', // +30 = 330
    };
    assert.equal(partyMaxHp(state), 330);
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

  it('calculates artifact costs with level scaling', () => {
    const crystal = ARTIFACTS[0];
    assert.equal(artifactCost(crystal, 0), 1);
    assert.equal(artifactCost(crystal, 1), Math.ceil(1 * 1.85));
    assert.equal(artifactCost(crystal, 3), Math.ceil(1 * Math.pow(1.85, 3)));
  });

  it('calculates plot costs accurately', () => {
    assert.equal(nextPlotCost(0), 0);
    assert.equal(nextPlotCost(1), 30);
    assert.equal(nextPlotCost(5), 6200);
    assert.equal(nextPlotCost(6), Infinity);
  });

  it('calculates wave rewards with boss multiplier, sunstone, and clover artifact', () => {
    // Normal wave 1
    assert.equal(waveReward(1, null, null), 8);
    // Boss wave 5
    const regularWave5 = 8 * Math.pow(1.23, 4) * 2;
    assert.equal(waveReward(5, null, null), Math.ceil(regularWave5));
    // Wave 1 with Sunstone (+25%) and Clover (+20%)
    const state = { artifacts: { clover_fortune: 1 } };
    assert.equal(waveReward(1, 'sunstone', state), Math.ceil(8 * 1.25 * 1.2));
  });
});

describe('Game Engine - Active Tapping & Ultimate Skill (Phase 1 & 2)', () => {
  it('calculates tap harvest rewards correctly', () => {
    const sprout = HEROES[0];
    const reward = tapHarvestReward(sprout, 2, null);
    assert.ok(reward.amount >= 1);
    assert.equal(typeof reward.isCrit, 'boolean');
  });

  it('charges energy and activates Ultimate skill (Sunlight Burst)', () => {
    const state = {
      heroes: { sprout: 5 },
      legion: { scout: 0, archer: 0, guardian: 0 },
      boosts: { harvest: 0, power: 0, vitality: 0 },
      artifacts: { sunlight_crystal: 0, fertile_soil: 0, eternal_root: 0, golden_can: 1, clover_fortune: 0 },
      equipped: null,
      leaves: 0,
      totalHarvested: 0,
      battle: {
        wave: 1,
        enemyHp: 24,
        partyHp: 80,
        wins: 0,
        earned: 0,
        energy: 90,
        ultActiveUntil: 0,
      },
    };

    // Advance 5 seconds to charge energy over 100%
    advanceCombat(state, 5);
    assert.ok(state.battle.energy >= 100);
    assert.ok(canActivateUltimate(state));

    const basePower = combatPower(state, 1000);
    const result = activateUltimate(state, 1000);
    assert.ok(result);
    assert.equal(state.battle.energy, 0);
    assert.equal(state.battle.ultActiveUntil, 1000 + 8000);

    // Combat power should be doubled during Ult (2x)
    const ultPower = combatPower(state, 2000);
    assert.equal(ultPower, basePower * 2);

    // After 8 seconds, combat power returns to normal
    const normalPower = combatPower(state, 10000);
    assert.equal(normalPower, basePower);
  });
});

describe('Game Engine - Prestige / Bloom Anew & Biomes (Phase 3)', () => {
  it('checks Bloom Anew requirement correctly', () => {
    const earlyState = { battle: { wave: 10, wins: 5 } };
    assert.equal(canBloomAnew(earlyState), false);

    const readyState = { battle: { wave: 30, wins: 30 }, totalHarvested: 100000 };
    assert.equal(canBloomAnew(readyState), true);
    const seeds = calculateGoldenSeeds(readyState);
    assert.ok(seeds >= 1);
  });

  it('executes Bloom Anew reset cleanly and retains artifacts and seeds', () => {
    const state = {
      leaves: 50000,
      totalHarvested: 200000,
      plots: 4,
      heroes: { sprout: 25, rose: 15 },
      legion: { scout: 10, archer: 5, guardian: 2 },
      boosts: { harvest: 5, power: 5, vitality: 5 },
      artifacts: { sunlight_crystal: 2, fertile_soil: 1 },
      goldenSeeds: 3,
      bloomCount: 1,
      equipped: 'leaf_charm',
      settings: { motion: true, floatingText: true, sound: true },
      battle: {
        wave: 45,
        enemyHp: 1000,
        partyHp: 200,
        wins: 44,
        earned: 15000,
        energy: 50,
        ultActiveUntil: 0,
      },
    };

    const seedsGained = bloomAnew(state);
    assert.ok(seedsGained > 0);
    assert.equal(state.goldenSeeds, 3 + seedsGained);
    assert.equal(state.bloomCount, 2);
    // Progression reset
    assert.equal(state.leaves, 0);
    assert.equal(state.plots, 1);
    assert.deepEqual(state.heroes, { sprout: 1 });
    assert.equal(state.battle.wave, 1);
    assert.equal(state.battle.wins, 0);
    // Artifacts & equipment retained
    assert.equal(state.artifacts.sunlight_crystal, 2);
    assert.equal(state.equipped, 'leaf_charm');
  });

  it('selects correct Biome based on current Wave', () => {
    assert.equal(biomeForWave(1).id, 'glade');
    assert.equal(biomeForWave(25).id, 'glade');
    assert.equal(biomeForWave(26).id, 'thicket');
    assert.equal(biomeForWave(50).id, 'thicket');
    assert.equal(biomeForWave(51).id, 'swamp');
    assert.equal(biomeForWave(76).id, 'redwood');
    assert.equal(biomeForWave(105).id, 'twilight');
    assert.equal(biomeForWave(150).id, 'twilight');
  });
});

describe('Game Engine - Combat Simulation & Progression', () => {
  it('advances combat and clears a wave when party is strong', () => {
    const state = {
      heroes: { sprout: 10 }, // combatPower = 10 * 1 * 3 = 30
      legion: { scout: 0, archer: 0, guardian: 0 },
      boosts: { harvest: 0, power: 0, vitality: 0 },
      artifacts: {},
      equipped: null,
      leaves: 0,
      totalHarvested: 0,
      battle: {
        wave: 1,
        enemyHp: 24, // 24 HP at wave 1
        partyHp: 200,
        wins: 0,
        earned: 0,
        energy: 0,
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
      artifacts: {},
      equipped: null,
      leaves: 0,
      totalHarvested: 0,
      battle: {
        wave: 40, // Enemy has thousands of HP and high damage
        enemyHp: enemyMaxHp(40),
        partyHp: 110,
        wins: 0,
        earned: 0,
        energy: 0,
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
      artifacts: {},
      equipped: null,
      leaves: 0,
      totalHarvested: 0,
      battle: {
        wave: 150,
        enemyHp: 1, // 1 HP left on wave 150
        partyHp: 1e15, // High HP to survive wave 150 damage
        wins: 150,
        earned: 50000,
        energy: 0,
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
      artifacts: {},
      equipped: null,
      leaves: 10,
      totalHarvested: 10,
      battle: {
        wave: 1,
        enemyHp: NaN,
        partyHp: -50,
        wins: 0,
        earned: 0,
        energy: NaN,
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
    assert.equal(state1.goldenSeeds, 0);

    const state2 = sanitizeSave('not-an-object');
    assert.equal(state2.plots, 1);
    assert.equal(state2.heroes.sprout, 1);
    assert.equal(state2.goldenSeeds, 0);
  });

  it('cleanses NaN, Infinity, negative values, and preserves artifacts and seeds', () => {
    const corrupt = {
      leaves: NaN,
      totalHarvested: -500,
      plots: 99, // Should clamp to 6
      goldenSeeds: NaN,
      bloomCount: -2,
      heroes: {
        sprout: -5, // Should clamp to 1
        rose: Infinity, // Should clamp to safe level
      },
      battle: {
        wave: 999, // Should clamp to 150
        enemyHp: 'not a number',
        partyHp: -10,
        wins: NaN,
        energy: 150, // Should clamp to 100
      },
      boosts: {
        harvest: 100, // Max level is 20
      },
      artifacts: {
        sunlight_crystal: 5,
        invalid_artifact: 999,
      },
      equipped: 'sunstone', // Only unlocked at 15 wins; with 0 wins it should be unequipped
    };

    const clean = sanitizeSave(corrupt);

    assert.equal(clean.leaves, 0);
    assert.equal(clean.totalHarvested, 0);
    assert.equal(clean.plots, 6);
    assert.equal(clean.goldenSeeds, 0);
    assert.equal(clean.bloomCount, 0);
    assert.equal(clean.heroes.sprout, 1);
    assert.ok(clean.heroes.rose <= 100000);
    assert.equal(clean.battle.wave, 150);
    assert.ok(clean.battle.enemyHp > 0);
    assert.ok(clean.battle.partyHp > 0);
    assert.equal(clean.battle.wins, 0);
    assert.equal(clean.battle.energy, 100);
    assert.equal(clean.boosts.harvest, 20);
    assert.equal(clean.artifacts.sunlight_crystal, 5);
    assert.equal(clean.artifacts.invalid_artifact, undefined);
    assert.equal(clean.equipped, null); // Locked accessory filtered out
    assert.equal(clean.tactics.mode, 'auto');
    assert.equal(clean.tactics.formation.sprout, 'front');
  });
});

describe('Game Engine - Wizardry Turn-Based Tactics & Dungeon Crawler', () => {
  it('calculates dungeon depth and boss chambers accurately', () => {
    const f1 = floorForWave(1);
    assert.equal(f1.floor, 1);
    assert.equal(f1.room, 1);
    assert.equal(f1.isBossRoom, false);
    assert.equal(f1.label, 'DEPTH B1F · ROOM 1');

    const f5 = floorForWave(5);
    assert.equal(f5.floor, 1);
    assert.equal(f5.room, 5);
    assert.equal(f5.isBossRoom, true);
    assert.ok(f5.label.includes('BOSS CHAMBER'));

    const f23 = floorForWave(23);
    assert.equal(f23.floor, 5);
    assert.equal(f23.room, 3);
  });

  it('sanitizes and preserves formation, attack order, and action presets', () => {
    const custom = {
      mode: 'manual',
      formation: { sprout: 'back', rose: 'front' },
      attackOrder: ['rose', 'sprout'],
      actions: { sprout: 'guard', rose: 'curse' },
    };
    const clean = sanitizeTactics(custom);
    assert.equal(clean.mode, 'manual');
    assert.equal(clean.formation.sprout, 'back');
    assert.equal(clean.formation.rose, 'front');
    assert.equal(clean.actions.sprout, 'guard');
    assert.equal(clean.actions.rose, 'curse');
    // Sprout and rose are first in attack order
    assert.equal(clean.attackOrder[0], 'rose');
    assert.equal(clean.attackOrder[1], 'sprout');
  });

  it('executes a tactical combat turn with hero attack and enemy retaliations', () => {
    const state = sanitizeSave(null);
    state.heroes = { sprout: 5, rose: 3 };
    state.battle = {
      wave: 2,
      enemyHp: 200,
      partyHp: 150,
      wins: 1,
      earned: 10,
      energy: 20,
      ultActiveUntil: 0,
    };
    state.tactics = {
      mode: 'auto',
      formation: { sprout: 'front', rose: 'back', oak: 'front', daisy: 'back', moss: 'front', sunflower: 'back' },
      attackOrder: ['rose', 'sprout'],
      actions: { sprout: 'slash', rose: 'thorn_volley' },
    };

    const res = executeTurn(state);
    assert.ok(res.success);
    assert.ok(res.damageDealt > 0);
    assert.ok(res.damageTaken > 0);
    assert.ok(res.logs.length >= 2);
    // Rose acts before Sprout as configured in attackOrder
    assert.ok(res.logs[0].text.includes('Rose Mage'));
    assert.ok(res.logs[1].text.includes('Sprout Knight'));
  });

  it('applies front-row guard damage reduction during turn execution', () => {
    const stateUnguarded = sanitizeSave(null);
    stateUnguarded.heroes = { sprout: 5 };
    stateUnguarded.battle = { wave: 10, enemyHp: 1000, partyHp: 300 };
    stateUnguarded.tactics.actions.sprout = 'slash';
    const resUnguarded = executeTurn(stateUnguarded);

    const stateGuarded = sanitizeSave(null);
    stateGuarded.heroes = { sprout: 5 };
    stateGuarded.battle = { wave: 10, enemyHp: 1000, partyHp: 300 };
    stateGuarded.tactics.actions.sprout = 'guard';
    const resGuarded = executeTurn(stateGuarded);

    // Guarding reduces incoming damage by 35%
    assert.ok(resGuarded.damageTaken < resUnguarded.damageTaken);
  });

  it('applies healing skills to restore party vitality during turn', () => {
    const state = sanitizeSave(null);
    state.heroes = { daisy: 5 };
    state.battle = { wave: 2, enemyHp: 500, partyHp: 30 }; // party is damaged
    state.tactics.actions.daisy = 'heal';

    const maxHp = partyMaxHp(state);
    const res = executeTurn(state);
    assert.ok(res.logs.some(l => l.type === 'heal'));
    assert.ok(state.battle.partyHp > 30);
  });
});
