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

// Keyed by ENEMIES[].tint.
export const ENEMY_IMAGES = {
  mushroom: 'grumpy-mushroom',
  bramble: 'thorny-bramble',
  slime: 'slime-sprig',
  wasp: 'wild-wasp',
  boss: 'shadow-stump',
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

// `perLevel` is the single source of truth for each artifact's effect; formulas and UI text both read it.
export const ARTIFACTS = [
  { id: 'sunlight_crystal', name: 'Sunlight Crystal', emoji: '💎', desc: '+15% legion damage per level.', baseCost: 1, color: 'amber', perLevel: 0.15, percent: true, label: 'Combat Power' },
  { id: 'fertile_soil', name: 'Fertile Soil', emoji: '🌱', desc: '+20% tap & Leaf Points harvest per level.', baseCost: 1, color: 'green', perLevel: 0.20, percent: true, label: 'Tap & LPS Harvest' },
  { id: 'eternal_root', name: 'Eternal Root', emoji: '🌳', desc: '+60 Party Max HP per level.', baseCost: 1, color: 'teal', perLevel: 60, percent: false, label: 'Party Max HP' },
  { id: 'golden_can', name: 'Golden Dew Bucket', emoji: '✨', desc: '+25% Sunlight energy charge rate per level.', baseCost: 2, color: 'yellow', perLevel: 0.25, percent: true, label: 'Ult Charge Rate' },
  { id: 'clover_fortune', name: 'Clover of Fortune', emoji: '🍀', desc: '+20% battle leaf rewards per level.', baseCost: 2, color: 'pink', perLevel: 0.20, percent: true, label: 'Wave Leaves' },
];
const ARTIFACT_BY_ID = Object.fromEntries(ARTIFACTS.map((art) => [art.id, art]));
const artifactValue = (state, id) => (state?.artifacts?.[id] || 0) * ARTIFACT_BY_ID[id].perLevel;

export function artifactBonusText(artifact, level = 0) {
  const total = Math.max(0, Math.floor(level) || 0) * artifact.perLevel;
  return artifact.percent ? `+${Math.round(total * 100)}% ${artifact.label}` : `+${Math.round(total)} ${artifact.label}`;
}

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

export const DEFAULT_TACTICS = {
  mode: 'auto', // 'auto' | 'manual'
  formation: {
    sprout: 'front',
    rose: 'back',
    oak: 'front',
    daisy: 'back',
    moss: 'front',
    sunflower: 'back',
  },
  attackOrder: ['sprout', 'rose', 'oak', 'daisy', 'moss', 'sunflower'],
  actions: {
    sprout: 'slash',
    rose: 'thorn_volley',
    oak: 'slam',
    daisy: 'heal',
    moss: 'quake',
    sunflower: 'solar_beam',
  },
};

export const HERO_SKILLS = {
  sprout: [
    { id: 'slash', name: 'Leaf Blade', icon: '🗡️', type: 'attack', multiplier: 1.4, desc: 'Sharp melee slash dealing 140% physical damage.' },
    { id: 'guard', name: 'Sprout Shield', icon: '🛡️', type: 'guard', reduction: 0.35, desc: 'Raises shield, absorbing 35% damage to front row this turn.' },
  ],
  rose: [
    { id: 'thorn_volley', name: 'Thorn Volley', icon: '🌹', type: 'attack', multiplier: 1.8, desc: 'Fires piercing thorn missiles dealing 180% magic damage.' },
    { id: 'curse', name: 'Briar Curse', icon: '🕸️', type: 'dot', multiplier: 0.75, desc: 'Ensnare enemy with poisonous briars dealing DoT damage.' },
  ],
  oak: [
    { id: 'slam', name: 'Branch Slam', icon: '🪵', type: 'attack', multiplier: 1.6, desc: 'Heavy crushing strike dealing 160% physical damage.' },
    { id: 'bastion', name: 'Iron Bark', icon: '🛡️', type: 'taunt', reduction: 0.50, desc: 'Taunts enemy and absorbs 50% damage to protect allies.' },
  ],
  daisy: [
    { id: 'dance', name: 'Petal Dance', icon: '🌸', type: 'attack', multiplier: 1.5, desc: 'Graceful spinning strikes dealing 150% damage.' },
    { id: 'heal', name: 'Healing Pollen', icon: '💚', type: 'heal', percent: 0.20, desc: 'Restores 20% max HP to the party.' },
  ],
  moss: [
    { id: 'quake', name: 'Earth Shatter', icon: '⛰️', type: 'attack', multiplier: 1.7, desc: 'Slams ground with seismic shock dealing 170% damage.' },
    { id: 'stone_skin', name: 'Stone Aegis', icon: '🛡️', type: 'buff', defense: 0.30, desc: 'Hardens bark and stone to shield all heroes by 30%.' },
  ],
  sunflower: [
    { id: 'solar_beam', name: 'Solar Ray', icon: '☀️', type: 'attack', multiplier: 2.0, desc: 'Channels brilliant sunlight for 200% piercing damage.' },
    { id: 'prayer', name: 'Morning Glow', icon: '✨', type: 'support', healPercent: 0.12, energyGain: 12, desc: 'Heals all allies by 12% and charges +12% Ult energy.' },
  ],
};

export function floorForWave(wave = 1) {
  const safeWave = Math.max(1, Math.min(MAX_WAVE, Math.floor(Number(wave)) || 1));
  const floor = Math.floor((safeWave - 1) / 5) + 1;
  const room = ((safeWave - 1) % 5) + 1;
  const isBossRoom = room === 5;
  return {
    floor,
    room,
    isBossRoom,
    label: `DEPTH B${floor}F · ROOM ${room}${isBossRoom ? ' (BOSS CHAMBER)' : ''}`,
  };
}

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
  seedShards: 0,
  frenzyTaps: 0,
  gardenBuff: { heroId: null, until: 0 },
  bloomCount: 0,
  // Wins across every Bloom Anew cycle; accessories unlock from this so prestige keeps them.
  lifetimeWins: 0,
  equipped: null,
  tactics: {
    mode: 'auto',
    formation: { ...DEFAULT_TACTICS.formation },
    attackOrder: [...DEFAULT_TACTICS.attackOrder],
    actions: { ...DEFAULT_TACTICS.actions },
  },
  settings: { motion: true, floatingText: true, sound: true, haptics: true, volume: 70 },
  lastSaved: Date.now(),
};

export const MIN_BLOOM_WAVE = 25;
export const MAX_WAVE = 150;
export const ULT_DURATION_MS = 8000;
export const LUSH_BLOOM_DURATION_MS = 15_000;
export const MAX_BOOST_LEVEL = 20;
export const MAX_ARTIFACT_LEVEL = 1000;

export function troopCount(state) {
  return UNITS.reduce((sum, unit) => sum + (state?.legion?.[unit.id] || 0), 0);
}

export function lifetimeWins(state) {
  return Math.max(state?.lifetimeWins || 0, state?.battle?.wins || 0);
}

export function isAccessoryUnlocked(state, item) {
  return !!item && lifetimeWins(state) >= item.unlockAt;
}

export function harvestMultiplier(state) {
  const boostMult = 1 + (state?.boosts?.harvest || 0) * 0.25;
  const artifactMult = 1 + artifactValue(state, 'fertile_soil');
  const charmMult = state?.equipped === 'leaf_charm' ? 1.1 : 1;
  return boostMult * artifactMult * charmMult;
}

export function lushBloomMultiplier(state, now = Date.now()) {
  return state?.gardenBuff?.until > now ? 1.5 : 1;
}

export function waterHero(state, heroId, now = Date.now()) {
  if (!state?.heroes?.[heroId] || !Number.isFinite(now)) return false;
  state.gardenBuff = { heroId, until: now + LUSH_BLOOM_DURATION_MS };
  return true;
}

export function awardLuckyCritter(state, reward, now = Date.now()) {
  if (reward === 'harvest') {
    const amount = Math.ceil(lps(state, now) * 30);
    state.leaves += amount;
    state.totalHarvested += amount;
    return { reward, amount };
  }
  if (reward === 'frenzy') {
    state.frenzyTaps = 10;
    return { reward, amount: 10 };
  }
  if (reward === 'shard') {
    const total = (state.seedShards || 0) + 1;
    state.seedShards = total % 5;
    if (total >= 5) state.goldenSeeds = (state.goldenSeeds || 0) + 1;
    return { reward, amount: 1, seedCompleted: total >= 5 };
  }
  return null;
}

export function consumeFrenzyTap(state, amount) {
  if ((state?.frenzyTaps || 0) <= 0) return amount;
  state.frenzyTaps -= 1;
  return amount * 5;
}

export function powerMultiplier(state, now = Date.now()) {
  const boostMult = 1 + (state?.boosts?.power || 0) * 0.2;
  const artifactMult = 1 + artifactValue(state, 'sunlight_crystal');
  const broochMult = state?.equipped === 'rose_brooch' ? 1.15 : 1;
  const isUltActive = state?.battle?.ultActiveUntil && now < state.battle.ultActiveUntil;
  const ultMult = isUltActive ? 2.0 : 1.0;
  return boostMult * artifactMult * broochMult * ultMult;
}

// Per-hero rates including every multiplier, so UI numbers match the real totals.
export function heroLps(state, hero, now = Date.now()) {
  return (state?.heroes?.[hero.id] || 0) * hero.baseLps * harvestMultiplier(state) * lushBloomMultiplier(state, now);
}

export function heroPower(state, hero, now = Date.now()) {
  return (state?.heroes?.[hero.id] || 0) * hero.baseLps * 3 * powerMultiplier(state, now);
}

export function unitPower(state, unit, now = Date.now()) {
  return (state?.legion?.[unit.id] || 0) * unit.power * powerMultiplier(state, now);
}

export function lps(state, now = Date.now()) {
  if (!state) return 0;
  const heroesHarvest = HEROES.reduce((sum, hero) => sum + (state.heroes?.[hero.id] || 0) * hero.baseLps, 0);
  const unitsHarvest = UNITS.reduce((sum, unit) => sum + (state.legion?.[unit.id] || 0) * unit.harvest, 0);
  return (heroesHarvest + unitsHarvest) * harvestMultiplier(state) * lushBloomMultiplier(state, now);
}

export function combatPower(state, now = Date.now()) {
  if (!state) return 0;
  const heroesPower = HEROES.reduce((sum, hero) => sum + (state.heroes?.[hero.id] || 0) * hero.baseLps * 3, 0);
  const unitsPower = UNITS.reduce((sum, unit) => sum + (state.legion?.[unit.id] || 0) * unit.power, 0);
  return (heroesPower + unitsPower) * powerMultiplier(state, now);
}

export function partyMaxHp(state) {
  if (!state) return 100;
  const heroHp = Object.values(state.heroes || {}).reduce((sum, level) => sum + (Number.isFinite(level) ? level * 10 : 0), 0);
  const legionHp = UNITS.reduce((sum, unit) => sum + (state.legion?.[unit.id] || 0) * unit.hp, 0);
  const boostHp = (state.boosts?.vitality || 0) * 40;
  const artifactHp = artifactValue(state, 'eternal_root');
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
  const artifactMult = 1 + artifactValue(state, 'clover_fortune');
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
  const isCrit = Math.random() < 0.12;
  const amount = Math.ceil(base * harvestMultiplier(state) * (isCrit ? 3 : 1));
  return { amount, isCrit };
}

export function canActivateUltimate(state) {
  return (state?.battle?.energy || 0) >= 100;
}

export function activateUltimate(state, now = Date.now()) {
  if (!canActivateUltimate(state)) return false;
  state.battle.energy = 0;
  state.battle.ultActiveUntil = now + ULT_DURATION_MS;
  const maxParty = partyMaxHp(state);
  const healAmount = Math.round(maxParty * 0.40);
  state.battle.partyHp = Math.min(maxParty, (state.battle.partyHp || 0) + healAmount);
  return { durationMs: ULT_DURATION_MS, healAmount };
}

export function canBloomAnew(state) {
  if (!state?.battle) return false;
  return (state.battle.wave || 1) >= MIN_BLOOM_WAVE || (state.battle.wins || 0) >= MIN_BLOOM_WAVE;
}

export function calculateGoldenSeeds(state) {
  if (!state?.battle || !canBloomAnew(state)) return 0;
  // Clamp so a high win count with a low wave can't feed a negative base into Math.pow (NaN).
  const waveFactor = Math.floor(Math.pow(Math.max(0, (state.battle.wave || 1) - 20) / 7, 1.6));
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
  state.gardenBuff = { heroId: null, until: 0 };
  state.frenzyTaps = 0;

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
  const energyRate = 4.0 * (1 + artifactValue(state, 'golden_can'));
  battle.energy = Math.min(100, Math.max(0, battle.energy + energyRate * Math.min(remaining, 10)));

  // `stalled` tells the UI the legion cannot beat this wave without upgrades.
  battle.stalled = false;
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
      battle.stalled = true;
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
      state.lifetimeWins = (state.lifetimeWins || 0) + 1;
      battle.wave = Math.min(MAX_WAVE, (battle.wave || 1) + 1);
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
        battle.stalled = true;
        break;
      }
    }
  }
}

const fmtNumber = (n) => !Number.isFinite(n) || n < 0 ? '0' : n >= 1e9 ? `${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e4 ? `${(n / 1e3).toFixed(1)}K` : Math.floor(n).toLocaleString();

export function sanitizeTactics(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      mode: 'auto',
      formation: { ...DEFAULT_TACTICS.formation },
      attackOrder: [...DEFAULT_TACTICS.attackOrder],
      actions: { ...DEFAULT_TACTICS.actions },
    };
  }

  const mode = raw.mode === 'manual' ? 'manual' : 'auto';

  const formation = {};
  HEROES.forEach((h) => {
    formation[h.id] = raw.formation?.[h.id] === 'front' || raw.formation?.[h.id] === 'back'
      ? raw.formation[h.id]
      : (DEFAULT_TACTICS.formation[h.id] || 'front');
  });

  const validHeroIds = HEROES.map((h) => h.id);
  const rawOrder = Array.isArray(raw.attackOrder)
    ? raw.attackOrder.filter((id) => validHeroIds.includes(id))
    : [];
  const missingHeroes = validHeroIds.filter((id) => !rawOrder.includes(id));
  const attackOrder = [...rawOrder, ...missingHeroes];

  const actions = {};
  HEROES.forEach((h) => {
    const available = HERO_SKILLS[h.id]?.map((s) => s.id) || [];
    actions[h.id] = available.includes(raw.actions?.[h.id])
      ? raw.actions[h.id]
      : (available[0] || 'attack');
  });

  return { mode, formation, attackOrder, actions };
}

export function executeTurn(state, manualActions = null, now = Date.now()) {
  if (!state?.battle) return null;
  const battle = state.battle;
  const tactics = state.tactics || DEFAULT_TACTICS;
  const logs = [];
  const maxParty = partyMaxHp(state);
  const wave = battle.wave || 1;
  const enemy = enemyForWave(wave);
  const isUltActive = (battle.ultActiveUntil || 0) > now;
  const ultMult = isUltActive ? 2 : 1;
  const broochMult = state?.equipped === 'rose_brooch' ? 1.15 : 1;
  const powerBonus = 1 + (state?.boosts?.power || 0) * 0.20 + artifactValue(state, 'sunlight_crystal');

  let guardReduction = 0;
  let totalDamageDealt = 0;

  // 1. Collect active heroes ordered by attackOrder
  const activeHeroes = HEROES.filter((h) => state.heroes?.[h.id]);
  const orderedHeroes = [...activeHeroes].sort((a, b) => {
    const idxA = tactics.attackOrder.indexOf(a.id);
    const idxB = tactics.attackOrder.indexOf(b.id);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  // 2. Each hero takes their action
  for (const hero of orderedHeroes) {
    if (battle.enemyHp <= 0) break;

    const actionId = manualActions?.[hero.id] || tactics.actions?.[hero.id] || HERO_SKILLS[hero.id]?.[0]?.id;
    const skills = HERO_SKILLS[hero.id] || [];
    const skill = skills.find((s) => s.id === actionId) || skills[0];
    const level = state.heroes[hero.id] || 1;
    const basePower = hero.baseLps * level * 3;

    if (skill.type === 'attack') {
      const isCrit = Math.random() < 0.15;
      const dmg = Math.max(1, Math.round(basePower * powerBonus * broochMult * ultMult * (skill.multiplier || 1.4) * (isCrit ? 1.8 : 1)));
      battle.enemyHp = Math.max(0, battle.enemyHp - dmg);
      totalDamageDealt += dmg;
      logs.push({
        type: 'hero',
        heroId: hero.id,
        isCrit,
        damage: dmg,
        text: `${hero.emoji} ${hero.name} uses [${skill.name}] for ${fmtNumber(dmg)} damage!${isCrit ? ' 💥 CRIT!' : ''}`,
      });
    } else if (skill.type === 'heal') {
      const healAmount = Math.max(1, Math.round(maxParty * (skill.percent || 0.20)));
      battle.partyHp = Math.min(maxParty, battle.partyHp + healAmount);
      logs.push({
        type: 'heal',
        heroId: hero.id,
        healAmount,
        text: `💚 ${hero.name} casts [${skill.name}], restoring +${fmtNumber(healAmount)} HP to the party!`,
      });
    } else if (skill.type === 'guard' || skill.type === 'taunt' || skill.type === 'buff') {
      guardReduction = Math.max(guardReduction, skill.reduction || skill.defense || 0.35);
      logs.push({
        type: 'guard',
        heroId: hero.id,
        text: `🛡️ ${hero.name} activates [${skill.name}], raising party defense!`,
      });
    } else if (skill.type === 'support') {
      const healAmount = Math.max(1, Math.round(maxParty * (skill.healPercent || 0.12)));
      battle.partyHp = Math.min(maxParty, battle.partyHp + healAmount);
      const eGain = skill.energyGain || 12;
      battle.energy = Math.min(100, (battle.energy || 0) + eGain);
      logs.push({
        type: 'support',
        heroId: hero.id,
        text: `☀️ ${hero.name} channels [${skill.name}], healing +${fmtNumber(healAmount)} HP and charging +${eGain}% Ult energy!`,
      });
    } else if (skill.type === 'dot') {
      const dmg = Math.max(1, Math.round(basePower * powerBonus * broochMult * ultMult * (skill.multiplier || 0.75)));
      battle.enemyHp = Math.max(0, battle.enemyHp - dmg);
      totalDamageDealt += dmg;
      logs.push({
        type: 'hero',
        heroId: hero.id,
        damage: dmg,
        text: `🌿 ${hero.name} ensnares with [${skill.name}] dealing ${fmtNumber(dmg)} poison damage!`,
      });
    }
  }

  // Troops attack
  const troopPower = troopCount(state) > 0 ? UNITS.reduce((sum, u) => sum + (state.legion?.[u.id] || 0) * u.power * 2, 0) : 0;
  if (troopPower > 0 && battle.enemyHp > 0) {
    const tDmg = Math.max(1, Math.round(troopPower * powerBonus * broochMult * ultMult));
    battle.enemyHp = Math.max(0, battle.enemyHp - tDmg);
    totalDamageDealt += tDmg;
    logs.push({
      type: 'troop',
      damage: tDmg,
      text: `🛡️ Garden Legion strikes for ${fmtNumber(tDmg)} damage!`,
    });
  }

  // Energy charge per turn (+3%)
  const energyRate = 3 * (1 + artifactValue(state, 'golden_can'));
  battle.energy = Math.min(100, Math.max(0, (battle.energy || 0) + energyRate));

  // Check if enemy defeated
  if (battle.enemyHp <= 0) {
    const reward = waveReward(battle.wave, state.equipped, state);
    state.leaves = Math.max(0, (state.leaves || 0) + reward);
    state.totalHarvested = Math.max(0, (state.totalHarvested || 0) + reward);
    battle.earned = Math.max(0, (battle.earned || 0) + reward);
    battle.wins = (battle.wins || 0) + 1;
    state.lifetimeWins = (state.lifetimeWins || 0) + 1;
    battle.wave = Math.min(MAX_WAVE, (battle.wave || 1) + 1);
    battle.enemyHp = enemyMaxHp(battle.wave);
    battle.partyHp = Math.min(maxParty, battle.partyHp + Math.round(maxParty * 0.25));
    battle.energy = Math.min(100, (battle.energy || 0) + 5);

    logs.push({
      type: 'victory',
      reward,
      text: `🏆 ${enemy.name} defeated! Found 🍃 +${fmtNumber(reward)} leaves. Advancing to Wave ${battle.wave}!`,
    });

    return {
      success: true,
      enemyDefeated: true,
      partyDefeated: false,
      logs,
      damageDealt: totalDamageDealt,
      damageTaken: 0,
    };
  }

  // 3. Enemy counter-attack
  const baseEnemyDmg = enemyDamage(wave);
  let finalIncoming = baseEnemyDmg;

  // Front row mitigation
  const frontHeroes = orderedHeroes.filter((h) => tactics.formation[h.id] === 'front');
  const backHeroes = orderedHeroes.filter((h) => tactics.formation[h.id] === 'back');

  let targetedRow = 'party';
  if (frontHeroes.length > 0) {
    targetedRow = 'front';
    if (guardReduction > 0) {
      finalIncoming = finalIncoming * (1 - guardReduction);
    }
  } else if (backHeroes.length > 0) {
    targetedRow = 'back';
  }

  const roundedIncoming = Math.max(1, Math.round(finalIncoming));
  battle.partyHp = Math.max(0, battle.partyHp - roundedIncoming);

  logs.push({
    type: 'enemy',
    targetedRow,
    damage: roundedIncoming,
    text: `⚠️ ${enemy.emoji} ${enemy.name} retaliates against the ${targetedRow} row for ${fmtNumber(roundedIncoming)} damage!${guardReduction > 0 ? ' (Guard active)' : ''}`,
  });

  // Check if party defeated
  let partyDefeated = false;
  if (battle.partyHp <= 0) {
    partyDefeated = true;
    battle.partyHp = maxParty;
    battle.enemyHp = enemyMaxHp(battle.wave);
    logs.push({
      type: 'defeat',
      text: `💀 The expedition fell! Restoring party vitality to full at the campsite...`,
    });
  }

  return {
    success: true,
    enemyDefeated: false,
    partyDefeated,
    logs,
    damageDealt: totalDamageDealt,
    damageTaken: roundedIncoming,
  };
}

export function sanitizeSave(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      ...DEFAULT_STATE,
      heroes: { ...DEFAULT_STATE.heroes },
      legion: { ...DEFAULT_STATE.legion },
      boosts: { ...DEFAULT_STATE.boosts },
      gardenBuff: { ...DEFAULT_STATE.gardenBuff },
      artifacts: { ...DEFAULT_STATE.artifacts },
      tactics: sanitizeTactics(null),
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

  const wave = Math.max(1, Math.min(MAX_WAVE, Math.floor(Number(raw.battle?.wave)) || 1));
  const maxEnemy = enemyMaxHp(wave);

  const boosts = Object.fromEntries(
    BOOSTS.map((boost) => [
      boost.id,
      Math.max(0, Math.min(MAX_BOOST_LEVEL, Math.floor(Number(raw.boosts?.[boost.id])) || 0)),
    ])
  );

  const artifacts = Object.fromEntries(
    ARTIFACTS.map((art) => [
      art.id,
      Math.max(0, Math.min(MAX_ARTIFACT_LEVEL, Math.floor(Number(raw.artifacts?.[art.id])) || 0)),
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
  // Older saves have no lifetimeWins; current-run wins are the best lower bound.
  const totalWins = Math.max(wins, Math.floor(Number(raw.lifetimeWins)) || 0);
  const equipped = ACCESSORIES.some((item) => item.id === raw.equipped && totalWins >= item.unlockAt)
    ? raw.equipped
    : null;
  const now = Date.now();
  const volumeVal = Number(raw.settings?.volume);

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
    seedShards: Number.isFinite(Number(raw.seedShards)) ? Math.max(0, Math.min(4, Math.floor(Number(raw.seedShards)))) : 0,
    frenzyTaps: Number.isFinite(Number(raw.frenzyTaps)) ? Math.max(0, Math.min(10, Math.floor(Number(raw.frenzyTaps)))) : 0,
    gardenBuff: {
      heroId: Object.hasOwn(heroes, raw.gardenBuff?.heroId) ? raw.gardenBuff.heroId : null,
      until: Object.hasOwn(heroes, raw.gardenBuff?.heroId) && Number.isFinite(Number(raw.gardenBuff?.until))
        ? Math.max(0, Math.min(now + LUSH_BLOOM_DURATION_MS, Number(raw.gardenBuff.until))) : 0,
    },
    bloomCount: Number.isFinite(Number(raw.bloomCount)) ? Math.max(0, Math.floor(Number(raw.bloomCount))) : 0,
    lifetimeWins: totalWins,
    equipped,
    tactics: sanitizeTactics(raw.tactics),
    settings: {
      motion: raw.settings?.motion !== false,
      floatingText: raw.settings?.floatingText !== false,
      sound: raw.settings?.sound !== false,
      haptics: raw.settings?.haptics !== false,
      volume: Number.isFinite(volumeVal) ? Math.max(0, Math.min(100, Math.round(volumeVal))) : DEFAULT_STATE.settings.volume,
    },
    battle: {
      wave,
      enemyHp: Number.isFinite(enemyHpVal) && enemyHpVal > 0 ? Math.min(maxEnemy, enemyHpVal) : maxEnemy,
      partyHp: Number.isFinite(partyHpVal) && partyHpVal > 0 ? Math.min(maxParty, partyHpVal) : maxParty,
      wins,
      earned: Number.isFinite(Number(raw.battle?.earned)) ? Math.max(0, Number(raw.battle?.earned)) : 0,
      energy: Number.isFinite(energyVal) ? Math.min(100, Math.max(0, energyVal)) : 0,
      // A burst can never have more than ULT_DURATION_MS left; blocks edited saves granting permanent 2×.
      ultActiveUntil: Number.isFinite(Number(raw.battle?.ultActiveUntil))
        ? Math.max(0, Math.min(now + ULT_DURATION_MS, Number(raw.battle.ultActiveUntil)))
        : 0,
    },
    lastSaved: Number.isFinite(Number(raw.lastSaved)) ? Math.min(now, Number(raw.lastSaved)) : now,
  };
}
