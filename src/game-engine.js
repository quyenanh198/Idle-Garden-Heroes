export const HEROES = [
  { id: 'sprout', name: 'Sprout Knight', role: 'The cheerful first defender', emoji: '🛡️', plant: '🌱', baseLps: 1, unlockCost: 0, upgradeBase: 12, color: 'green', plot: 0 },
  { id: 'rose', name: 'Rose Mage', role: 'Magic in full bloom', emoji: '🪄', plant: '🌹', baseLps: 4, unlockCost: 65, upgradeBase: 55, color: 'pink', plot: 1 },
  { id: 'oak', name: 'Oak Sentinel', role: 'A mighty woodland guardian', emoji: '🪓', plant: '🌳', baseLps: 12, unlockCost: 280, upgradeBase: 180, color: 'amber', plot: 2 },
  { id: 'daisy', name: 'Daisy Dancer', role: 'Every petal has a rhythm', emoji: '🎵', plant: '🌼', baseLps: 32, unlockCost: 980, upgradeBase: 560, color: 'yellow', plot: 3 },
  { id: 'moss', name: 'Moss Golem', role: 'Gentle giant of the glade', emoji: '💚', plant: '🪨', baseLps: 90, unlockCost: 3400, upgradeBase: 1800, color: 'teal', plot: 4 },
  { id: 'sunflower', name: 'Sunflower Sage', role: 'A little pocket of sunshine', emoji: '☀️', plant: '🌻', baseLps: 240, unlockCost: 11000, upgradeBase: 6200, color: 'orange', plot: 5 },
];

export const PLOT_COSTS = [0, 30, 150, 520, 1800, 6200];

export const HERO_IMAGES = {
  sprout: 'sprout-knight',
  rose: 'rose-mage',
  oak: 'oak-sentinel',
  daisy: 'daisy-dancer',
  moss: 'moss-golem',
  sunflower: 'sunflower-sage',
};

export const BOOSTS = [
  { id: 'harvest', name: 'Golden Watering Can', emoji: '🪣', desc: 'All heroes harvest 25% more leaves per level.', baseCost: 80, color: 'green' },
  { id: 'power', name: 'Training Grounds', emoji: '⚔️', desc: 'Your legion deals 20% more damage per level.', baseCost: 100, color: 'amber' },
  { id: 'vitality', name: 'Healing Spring', emoji: '💧', desc: 'Increase legion maximum health by 40 per level.', baseCost: 120, color: 'teal' },
];

export const UNITS = [
  { id: 'scout', name: 'Seedling Scout', emoji: '🌱', desc: 'A tiny but eager garden defender.', plot: 1, baseCost: 25, harvest: 0.5, power: 2, hp: 4 },
  { id: 'archer', name: 'Bloom Archer', emoji: '🌸', desc: 'Petal arrows from a safe distance.', plot: 2, baseCost: 120, harvest: 2, power: 8, hp: 3 },
  { id: 'guardian', name: 'Root Guardian', emoji: '🌳', desc: 'Sturdy roots hold the front line.', plot: 3, baseCost: 450, harvest: 5, power: 3, hp: 20 },
];

export const ACCESSORIES = [
  { id: 'leaf_charm', name: 'Leaf Charm', emoji: '🍀', desc: 'A lucky first find.', bonus: '+10% Leaf Points', unlockAt: 0 },
  { id: 'rose_brooch', name: 'Rose Brooch', emoji: '🌹', desc: 'A bloom from the battlefield.', bonus: '+15% legion damage', unlockAt: 3 },
  { id: 'oak_badge', name: 'Oak Badge', emoji: '🛡️', desc: 'The strength of old roots.', bonus: '+30 legion health', unlockAt: 8 },
  { id: 'sunstone', name: 'Sunstone', emoji: '☀️', desc: 'A warm reward for brave heroes.', bonus: '+25% battle rewards', unlockAt: 15 },
];

export const ARTIFACTS = [
  { id: 'sunlight_crystal', name: 'Sunlight Crystal', emoji: '💎', desc: '+15% legion damage per level.', baseCost: 1, color: 'amber' },
  { id: 'fertile_soil', name: 'Fertile Soil', emoji: '🌱', desc: '+20% Leaf Points generation per level.', baseCost: 1, color: 'green' },
  { id: 'eternal_root', name: 'Eternal Root', emoji: '🌳', desc: '+60 Party Max HP per level.', baseCost: 1, color: 'teal' },
  { id: 'golden_can', name: 'Golden Dew Bucket', emoji: '✨', desc: '+25% Sunlight energy charge rate.', baseCost: 2, color: 'yellow' },
  { id: 'clover_fortune', name: 'Clover of Fortune', emoji: '🍀', desc: '+20% battle leaf rewards per level.', baseCost: 2, color: 'pink' },
];

export const BIOMES = [
  { id: 'glade', name: 'Whispering Glade', minWave: 1, maxWave: 25, emoji: '🌼', tint: 'glade', ambientColor: 0x91c96c, kicker: 'SUNLIT MEADOWS', desc: 'Gentle morning breezes and vibrant blooms.' },
  { id: 'thicket', name: 'Thorny Thicket', minWave: 26, maxWave: 50, emoji: '🌵', tint: 'thicket', ambientColor: 0xd4a359, kicker: 'PRICKLY WOODS', desc: 'Amber foliage tangled with stubborn roots.' },
  { id: 'swamp', name: 'Misty Swamp', minWave: 51, maxWave: 75, emoji: '🐸', tint: 'swamp', ambientColor: 0x68b39c, kicker: 'EMERALD WATERS', desc: 'Cool luminous mist and dancing fireflies.' },
  { id: 'redwood', name: 'Ancient Redwood', minWave: 76, maxWave: 100, emoji: '🌲', tint: 'redwood', ambientColor: 0x8a7251, kicker: 'GIANT CANOPY', desc: 'Colossal trunks sheltering ancient secrets.' },
  { id: 'twilight', name: 'Twilight Grove', minWave: 101, maxWave: 150, emoji: '🌙', tint: 'twilight', ambientColor: 0x9f83cf, kicker: 'STARRY GLADE', desc: 'Celestial moonlight and enchanted petals.' },
];

export const ENEMIES = [
  { name: 'Grumpy Mushroom', emoji: '🍄', type: 'Forest nuisance', tint: 'mushroom' },
  { name: 'Thorny Bramble', emoji: '🌵', type: 'Prickly troublemaker', tint: 'bramble' },
  { name: 'Slime Sprig', emoji: '🟢', type: 'Sticky little rascal', tint: 'slime' },
  { name: 'Wild Wasp', emoji: '🐝', type: 'Buzzing menace', tint: 'wasp' },
  { name: 'Shadow Stump', emoji: '🪵', type: 'Woodland boss', tint: 'boss' },
];

export const DEFAULT_STATE = {
  leaves: 0,
  totalHarvested: 0,
  plots: 1,
  heroes: { sprout: 1 },
  legion: { scout: 0, archer: 0, guardian: 0 },
  battle: { wave: 1, enemyHp: 24, partyHp: 110, wins: 0, earned: 0, energy: 0, ultActiveUntil: 0 },
  boosts: { harvest: 0, power: 0, vitality: 0 },
  artifacts: { sunlight_crystal: 0, fertile_soil: 0, eternal_root: 0, golden_can: 0, clover_fortune: 0 },
  goldenSeeds: 0,
  bloomCount: 0,
  equipped: null,
  settings: { motion: true, floatingText: true, sound: true },
  lastSaved: Date.now(),
};

export const MIN_BLOOM_WAVE = 25;

export function troopCount(state) {
  return UNITS.reduce((sum, unit) => sum + (state?.legion?.[unit.id] || 0), 0);
}

export function lps(state) {
  if (!state) return 0;
  const heroesHarvest = HEROES.reduce((sum, hero) => sum + (state.heroes?.[hero.id] || 0) * hero.baseLps, 0);
  const unitsHarvest = UNITS.reduce((sum, unit) => sum + (state.legion?.[unit.id] || 0) * unit.harvest, 0);
  const boostMult = 1 + (state.boosts?.harvest || 0) * 0.25;
  const artifactMult = 1 + (state.artifacts?.fertile_soil || 0) * 0.20;
  const charmMult = state.equipped === 'leaf_charm' ? 1.1 : 1;
  return (heroesHarvest + unitsHarvest) * boostMult * artifactMult * charmMult;
}

export function combatPower(state, now = Date.now()) {
  if (!state) return 0;
  const heroesPower = HEROES.reduce((sum, hero) => sum + (state.heroes?.[hero.id] || 0) * hero.baseLps * 3, 0);
  const unitsPower = UNITS.reduce((sum, unit) => sum + (state.legion?.[unit.id] || 0) * unit.power, 0);
  const boostMult = 1 + (state.boosts?.power || 0) * 0.2;
  const artifactMult = 1 + (state.artifacts?.sunlight_crystal || 0) * 0.15;
  const broochMult = state.equipped === 'rose_brooch' ? 1.15 : 1;
  const isUltActive = state.battle?.ultActiveUntil && now < state.battle.ultActiveUntil;
  const ultMult = isUltActive ? 2.0 : 1.0;
  return (heroesPower + unitsPower) * boostMult * artifactMult * broochMult * ultMult;
}

export function partyMaxHp(state) {
  if (!state) return 100;
  const heroHp = Object.values(state.heroes || {}).reduce((sum, level) => sum + (Number.isFinite(level) ? level * 10 : 0), 0);
  const legionHp = UNITS.reduce((sum, unit) => sum + (state.legion?.[unit.id] || 0) * unit.hp, 0);
  const boostHp = (state.boosts?.vitality || 0) * 40;
  const artifactHp = (state.artifacts?.eternal_root || 0) * 60;
  const badgeHp = state.equipped === 'oak_badge' ? 30 : 0;
  return 100 + heroHp + legionHp + boostHp + artifactHp + badgeHp;
}

export function enemyMaxHp(wave) {
  const safeWave = Math.max(1, Math.floor(wave) || 1);
  return Math.round(24 * Math.pow(1.27, safeWave - 1) * (safeWave % 5 === 0 ? 1.8 : 1));
}

export function enemyDamage(wave) {
  const safeWave = Math.max(1, Math.floor(wave) || 1);
  return 1.1 * Math.pow(1.18, safeWave - 1);
}

export function waveReward(wave, equipped = null, state = null) {
  const safeWave = Math.max(1, Math.floor(wave) || 1);
  const multiplier = equipped === 'sunstone' ? 1.25 : 1;
  const artifactMult = 1 + (state?.artifacts?.clover_fortune || 0) * 0.20;
  return Math.ceil(8 * Math.pow(1.23, safeWave - 1) * (safeWave % 5 === 0 ? 2 : 1) * multiplier * artifactMult);
}

export function upgradeCost(hero, currentLevel = 1) {
  const safeLevel = Math.max(1, Math.floor(currentLevel) || 1);
  return Math.ceil(hero.upgradeBase * Math.pow(1.32, safeLevel - 1));
}

export function unitCost(unit, currentCount = 0) {
  const safeCount = Math.max(0, Math.floor(currentCount) || 0);
  return Math.ceil(unit.baseCost * Math.pow(1.16, safeCount));
}

export function boostCost(boost, currentLevel = 0) {
  const safeLevel = Math.max(0, Math.floor(currentLevel) || 0);
  return Math.ceil(boost.baseCost * Math.pow(1.8, safeLevel));
}

export function artifactCost(artifact, currentLevel = 0) {
  const safeLevel = Math.max(0, Math.floor(currentLevel) || 0);
  return Math.ceil(artifact.baseCost * Math.pow(1.85, safeLevel));
}

export function nextPlotCost(plots) {
  return PLOT_COSTS[plots] ?? Infinity;
}

export function enemyForWave(wave) {
  const safeWave = Math.max(1, Math.floor(wave) || 1);
  return ENEMIES[(safeWave - 1) % ENEMIES.length];
}

export function biomeForWave(wave) {
  const safeWave = Math.max(1, Math.floor(wave) || 1);
  return BIOMES.find((b) => safeWave >= b.minWave && safeWave <= b.maxWave) || BIOMES[BIOMES.length - 1];
}

export function tapHarvestReward(hero, currentLevel = 1, state = null) {
  const level = Math.max(1, Math.floor(currentLevel) || 1);
  const base = Math.max(1, Math.round(hero.baseLps * level * 0.5));
  const boostMult = 1 + (state?.boosts?.harvest || 0) * 0.15;
  const artifactMult = 1 + (state?.artifacts?.fertile_soil || 0) * 0.20;
  const charmMult = state?.equipped === 'leaf_charm' ? 1.1 : 1;
  const isCrit = Math.random() < 0.12;
  const amount = Math.ceil(base * boostMult * artifactMult * charmMult * (isCrit ? 3 : 1));
  return { amount, isCrit };
}

export function canActivateUltimate(state) {
  return (state?.battle?.energy || 0) >= 100;
}

export function activateUltimate(state, now = Date.now()) {
  if (!canActivateUltimate(state)) return false;
  state.battle.energy = 0;
  state.battle.ultActiveUntil = now + 8000;
  const maxParty = partyMaxHp(state);
  const healAmount = Math.round(maxParty * 0.40);
  state.battle.partyHp = Math.min(maxParty, (state.battle.partyHp || 0) + healAmount);
  return { durationMs: 8000, healAmount };
}

export function canBloomAnew(state) {
  if (!state?.battle) return false;
  return (state.battle.wave || 1) >= MIN_BLOOM_WAVE || (state.battle.wins || 0) >= MIN_BLOOM_WAVE;
}

export function calculateGoldenSeeds(state) {
  if (!state?.battle || !canBloomAnew(state)) return 0;
  const waveFactor = Math.floor(Math.pow((state.battle.wave - 20) / 7, 1.6));
  const winsFactor = Math.floor((state.battle.wins || 0) / 20);
  const harvestedFactor = Math.max(0, Math.floor(Math.log10(Math.max(10, state.totalHarvested || 0)) - 3));
  return Math.max(1, waveFactor + winsFactor + harvestedFactor);
}

export function bloomAnew(state) {
  if (!canBloomAnew(state)) return 0;
  const seedsGained = calculateGoldenSeeds(state);
  state.goldenSeeds = (state.goldenSeeds || 0) + seedsGained;
  state.bloomCount = (state.bloomCount || 0) + 1;
  state.leaves = 0;
  state.plots = 1;
  state.heroes = { sprout: 1 };
  state.legion = { scout: 0, archer: 0, guardian: 0 };
  state.boosts = { harvest: 0, power: 0, vitality: 0 };

  const newMaxHp = partyMaxHp(state);
  state.battle = {
    wave: 1,
    enemyHp: enemyMaxHp(1),
    partyHp: newMaxHp,
    wins: 0,
    earned: 0,
    energy: 0,
    ultActiveUntil: 0,
  };
  return seedsGained;
}

export function advanceCombat(state, seconds, now = Date.now()) {
  if (!state?.battle) return;
  let remaining = Math.min(8 * 60 * 60, Math.max(0, Number(seconds) || 0));
  if (remaining <= 0) return;

  const maxHp = partyMaxHp(state);
  const battle = state.battle;

  // Sanitize HP and energy
  if (!Number.isFinite(battle.partyHp) || battle.partyHp <= 0) battle.partyHp = maxHp;
  if (!Number.isFinite(battle.enemyHp) || battle.enemyHp <= 0) battle.enemyHp = enemyMaxHp(battle.wave);
  if (!Number.isFinite(battle.energy)) battle.energy = 0;

  // Energy charge over time: base 4% per second, boosted by golden_can artifact
  const energyRate = 4.0 * (1 + (state.artifacts?.golden_can || 0) * 0.25);
  battle.energy = Math.min(100, Math.max(0, battle.energy + energyRate * Math.min(remaining, 10)));

  let steps = 0;
  while (remaining > 0.0001 && steps++ < 10000) {
    const power = Math.max(0.1, combatPower(state, now));
    const incoming = Math.max(0.01, enemyDamage(battle.wave));
    const untilWin = battle.enemyHp / power;
    const untilLoss = battle.partyHp / incoming;

    // Stalemate detection: If party is at full HP and cannot out-damage enemy before defeat,
    // further iterations without hero upgrades will only loop indefinitely in defeat.
    if (battle.partyHp >= maxHp - 0.001 && untilLoss <= untilWin) {
      battle.partyHp = maxHp;
      battle.enemyHp = enemyMaxHp(battle.wave);
      break;
    }

    const elapsed = Math.min(remaining, untilWin, untilLoss);
    if (!Number.isFinite(elapsed) || elapsed <= 0) break;

    battle.enemyHp = Math.max(0, battle.enemyHp - power * elapsed);
    battle.partyHp = Math.max(0, battle.partyHp - incoming * elapsed);
    remaining -= elapsed;

    if (battle.enemyHp <= 0.001) {
      const reward = waveReward(battle.wave, state.equipped, state);
      state.leaves = Math.max(0, (state.leaves || 0) + reward);
      state.totalHarvested = Math.max(0, (state.totalHarvested || 0) + reward);
      battle.earned = Math.max(0, (battle.earned || 0) + reward);
      battle.wins = (battle.wins || 0) + 1;
      battle.wave = Math.min(150, (battle.wave || 1) + 1);
      battle.enemyHp = enemyMaxHp(battle.wave);
      const partyCap = partyMaxHp(state);
      battle.partyHp = Math.min(partyCap, battle.partyHp + partyCap * 0.25);
      // Extra burst energy on wave clear
      battle.energy = Math.min(100, (battle.energy || 0) + 5);
    } else if (battle.partyHp <= 0.001) {
      const partyCap = partyMaxHp(state);
      battle.partyHp = partyCap;
      battle.enemyHp = enemyMaxHp(battle.wave);

      // Check if stalemate on fresh restart
      const freshLoss = partyCap / incoming;
      const freshWin = battle.enemyHp / power;
      if (freshLoss <= freshWin) {
        break;
      }
    }
  }
}

export function sanitizeSave(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      ...DEFAULT_STATE,
      heroes: { ...DEFAULT_STATE.heroes },
      legion: { ...DEFAULT_STATE.legion },
      boosts: { ...DEFAULT_STATE.boosts },
      artifacts: { ...DEFAULT_STATE.artifacts },
      settings: { ...DEFAULT_STATE.settings },
      battle: { ...DEFAULT_STATE.battle },
      lastSaved: Date.now(),
    };
  }

  const plots = Math.max(1, Math.min(HEROES.length, Math.floor(Number(raw.plots)) || 1));
  const heroes = { sprout: Math.max(1, Math.floor(Number(raw.heroes?.sprout)) || 1) };
  HEROES.slice(1).forEach((hero) => {
    const level = Math.floor(Number(raw.heroes?.[hero.id])) || 0;
    if (hero.plot < plots && level > 0) {
      heroes[hero.id] = Math.min(Math.max(1, level), 100000);
    }
  });

  const wave = Math.max(1, Math.min(150, Math.floor(Number(raw.battle?.wave)) || 1));
  const maxEnemy = enemyMaxHp(wave);

  const boosts = Object.fromEntries(
    BOOSTS.map((boost) => [
      boost.id,
      Math.max(0, Math.min(20, Math.floor(Number(raw.boosts?.[boost.id])) || 0)),
    ])
  );

  const artifacts = Object.fromEntries(
    ARTIFACTS.map((art) => [
      art.id,
      Math.max(0, Math.min(25, Math.floor(Number(raw.artifacts?.[art.id])) || 0)),
    ])
  );

  const legion = Object.fromEntries(
    UNITS.map((unit) => [
      unit.id,
      unit.plot <= plots
        ? Math.max(0, Math.min(10000, Math.floor(Number(raw.legion?.[unit.id])) || 0))
        : 0,
    ])
  );

  const wins = Math.max(0, Math.floor(Number(raw.battle?.wins)) || 0);
  const equipped = ACCESSORIES.some((item) => item.id === raw.equipped && wins >= item.unlockAt)
    ? raw.equipped
    : null;

  const tempState = { heroes, legion, boosts, artifacts, equipped };
  const maxParty = partyMaxHp(tempState);

  const partyHpVal = Number(raw.battle?.partyHp);
  const enemyHpVal = Number(raw.battle?.enemyHp);
  const energyVal = Number(raw.battle?.energy);

  return {
    leaves: Number.isFinite(Number(raw.leaves)) ? Math.max(0, Number(raw.leaves)) : 0,
    totalHarvested: Number.isFinite(Number(raw.totalHarvested)) ? Math.max(0, Number(raw.totalHarvested)) : 0,
    plots,
    heroes,
    legion,
    boosts,
    artifacts,
    goldenSeeds: Number.isFinite(Number(raw.goldenSeeds)) ? Math.max(0, Math.floor(Number(raw.goldenSeeds))) : 0,
    bloomCount: Number.isFinite(Number(raw.bloomCount)) ? Math.max(0, Math.floor(Number(raw.bloomCount))) : 0,
    equipped,
    settings: {
      motion: raw.settings?.motion !== false,
      floatingText: raw.settings?.floatingText !== false,
      sound: raw.settings?.sound !== false,
    },
    battle: {
      wave,
      enemyHp: Number.isFinite(enemyHpVal) && enemyHpVal > 0 ? Math.min(maxEnemy, enemyHpVal) : maxEnemy,
      partyHp: Number.isFinite(partyHpVal) && partyHpVal > 0 ? Math.min(maxParty, partyHpVal) : maxParty,
      wins,
      earned: Number.isFinite(Number(raw.battle?.earned)) ? Math.max(0, Number(raw.battle?.earned)) : 0,
      energy: Number.isFinite(energyVal) ? Math.min(100, Math.max(0, energyVal)) : 0,
      ultActiveUntil: Number.isFinite(Number(raw.battle?.ultActiveUntil)) ? Number(raw.battle.ultActiveUntil) : 0,
    },
    lastSaved: Number.isFinite(Number(raw.lastSaved)) ? Math.min(Date.now(), Number(raw.lastSaved)) : Date.now(),
  };
}
