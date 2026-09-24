import './style.css';

const HEROES = [
  { id: 'sprout', name: 'Sprout Knight', role: 'The cheerful first defender', emoji: '🛡️', plant: '🌱', baseLps: 1, unlockCost: 0, upgradeBase: 12, color: 'green', plot: 0 },
  { id: 'rose', name: 'Rose Mage', role: 'Magic in full bloom', emoji: '🪄', plant: '🌹', baseLps: 4, unlockCost: 65, upgradeBase: 55, color: 'pink', plot: 1 },
  { id: 'oak', name: 'Oak Sentinel', role: 'A mighty woodland guardian', emoji: '🪓', plant: '🌳', baseLps: 12, unlockCost: 280, upgradeBase: 180, color: 'amber', plot: 2 },
  { id: 'daisy', name: 'Daisy Dancer', role: 'Every petal has a rhythm', emoji: '🎵', plant: '🌼', baseLps: 32, unlockCost: 980, upgradeBase: 560, color: 'yellow', plot: 3 },
  { id: 'moss', name: 'Moss Golem', role: 'Gentle giant of the glade', emoji: '💚', plant: '🪨', baseLps: 90, unlockCost: 3400, upgradeBase: 1800, color: 'teal', plot: 4 },
  { id: 'sunflower', name: 'Sunflower Sage', role: 'A little pocket of sunshine', emoji: '☀️', plant: '🌻', baseLps: 240, unlockCost: 11000, upgradeBase: 6200, color: 'orange', plot: 5 },
];
const PLOT_COSTS = [0, 30, 150, 520, 1800, 6200];
const HERO_IMAGES = { sprout: 'sprout-knight', rose: 'rose-mage', oak: 'oak-sentinel', daisy: 'daisy-dancer', moss: 'moss-golem', sunflower: 'sunflower-sage' };
const heroPortrait = (hero) => `<img src="/assets/${HERO_IMAGES[hero.id]}.webp" alt="" loading="lazy" />`;
const SAVE_KEY = 'idle-garden-hero-v1';
const DEFAULT = { leaves: 0, totalHarvested: 0, plots: 1, heroes: { sprout: 1 }, legion: { scout: 0, archer: 0, guardian: 0 }, battle: { wave: 1, enemyHp: 24, partyHp: 110, wins: 0, earned: 0 }, boosts: { harvest: 0, power: 0, vitality: 0 }, equipped: null, settings: { motion: true, floatingText: true }, lastSaved: Date.now() };
const SCREENS = ['home', 'garden', 'combat', 'bag', 'upgrades', 'settings'];
const BOOSTS = [
  { id: 'harvest', name: 'Golden Watering Can', emoji: '🪣', desc: 'All heroes harvest 25% more leaves per level.', baseCost: 80, color: 'green' },
  { id: 'power', name: 'Training Grounds', emoji: '⚔️', desc: 'Your legion deals 20% more damage per level.', baseCost: 100, color: 'amber' },
  { id: 'vitality', name: 'Healing Spring', emoji: '💧', desc: 'Increase legion maximum health by 40 per level.', baseCost: 120, color: 'teal' },
];
const UNITS = [
  { id: 'scout', name: 'Seedling Scout', emoji: '🌱', desc: 'A tiny but eager garden defender.', plot: 1, baseCost: 25, harvest: .5, power: 2, hp: 4 },
  { id: 'archer', name: 'Bloom Archer', emoji: '🌸', desc: 'Petal arrows from a safe distance.', plot: 2, baseCost: 120, harvest: 2, power: 8, hp: 3 },
  { id: 'guardian', name: 'Root Guardian', emoji: '🌳', desc: 'Sturdy roots hold the front line.', plot: 3, baseCost: 450, harvest: 5, power: 3, hp: 20 },
];
const ACCESSORIES = [
  { id: 'leaf_charm', name: 'Leaf Charm', emoji: '🍀', desc: 'A lucky first find.', bonus: '+10% Leaf Points', unlockAt: 0 },
  { id: 'rose_brooch', name: 'Rose Brooch', emoji: '🌹', desc: 'A bloom from the battlefield.', bonus: '+15% legion damage', unlockAt: 3 },
  { id: 'oak_badge', name: 'Oak Badge', emoji: '🛡️', desc: 'The strength of old roots.', bonus: '+30 legion health', unlockAt: 8 },
  { id: 'sunstone', name: 'Sunstone', emoji: '☀️', desc: 'A warm reward for brave heroes.', bonus: '+25% battle rewards', unlockAt: 15 },
];
const ENEMIES = [
  { name: 'Grumpy Mushroom', emoji: '🍄', type: 'Forest nuisance', tint: 'mushroom' },
  { name: 'Thorny Bramble', emoji: '🌵', type: 'Prickly troublemaker', tint: 'bramble' },
  { name: 'Slime Sprig', emoji: '🟢', type: 'Sticky little rascal', tint: 'slime' },
  { name: 'Wild Wasp', emoji: '🐝', type: 'Buzzing menace', tint: 'wasp' },
  { name: 'Shadow Stump', emoji: '🪵', type: 'Woodland boss', tint: 'boss' },
];
const ICONS = {
  leaf: '<path d="M20 4C10 4 4 9 4 17a3 3 0 0 0 3 3c8 0 13-6 13-16Z"/><path d="M4 20c3-5 7-8 12-10"/>',
  spark: '<path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z"/><path d="m19 19 .5 1.5L21 21l-1.5.5L19 23l-.5-1.5L17 21l1.5-.5L19 19Z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v7a5 5 0 0 1-10 0V4ZM7 6H4v3a3 3 0 0 0 3 3m10-6h3v3a3 3 0 0 1-3 3"/>',
  chart: '<path d="M4 20V10m5 10V4m5 16v-7m5 7V8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
};
const icon = (name, size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
const fmt = (n) => n >= 1e9 ? `${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e4 ? `${(n / 1e3).toFixed(1)}K` : Math.floor(n).toLocaleString();
const fmtRate = (n) => n < 10 ? Number(n.toFixed(1)).toString() : fmt(n);

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!raw || typeof raw !== 'object') return { ...DEFAULT, heroes: { ...DEFAULT.heroes }, legion: { ...DEFAULT.legion }, boosts: { ...DEFAULT.boosts }, settings: { ...DEFAULT.settings }, battle: { ...DEFAULT.battle } };
    const plots = Math.max(1, Math.min(HEROES.length, Math.floor(Number(raw.plots) || 1)));
    const heroes = { sprout: Math.max(1, Math.floor(Number(raw.heroes?.sprout) || 1)) };
    HEROES.slice(1).forEach((hero) => {
      const level = Math.floor(Number(raw.heroes?.[hero.id]) || 0);
      if (hero.plot < plots && level > 0) heroes[hero.id] = Math.min(level, 100000);
    });
    const wave = Math.max(1, Math.min(150, Math.floor(Number(raw.battle?.wave) || 1)));
    const maxEnemy = enemyMaxHp(wave);
    const boosts = Object.fromEntries(BOOSTS.map(boost => [boost.id, Math.max(0, Math.min(100, Math.floor(Number(raw.boosts?.[boost.id]) || 0)))]));
    const legion = Object.fromEntries(UNITS.map(unit => [unit.id, unit.plot <= plots ? Math.max(0, Math.min(10000, Math.floor(Number(raw.legion?.[unit.id]) || 0))) : 0]));
    const equipped = ACCESSORIES.some(item => item.id === raw.equipped && (Number(raw.battle?.wins) || 0) >= item.unlockAt) ? raw.equipped : null;
    const maxParty = 100 + Object.values(heroes).reduce((sum, level) => sum + level * 10, 0) + UNITS.reduce((sum, unit) => sum + legion[unit.id] * unit.hp, 0) + boosts.vitality * 40 + (equipped === 'oak_badge' ? 30 : 0);
    return {
      leaves: Math.max(0, Number(raw.leaves) || 0),
      totalHarvested: Math.max(0, Number(raw.totalHarvested) || 0),
      plots,
      heroes,
      legion,
      boosts,
      equipped,
      settings: { motion: raw.settings?.motion !== false, floatingText: raw.settings?.floatingText !== false },
      battle: {
        wave,
        enemyHp: Math.max(0.01, Math.min(maxEnemy, Number(raw.battle?.enemyHp) || maxEnemy)),
        partyHp: Math.max(0.01, Math.min(maxParty, Number(raw.battle?.partyHp) || maxParty)),
        wins: Math.max(0, Math.floor(Number(raw.battle?.wins) || 0)),
        earned: Math.max(0, Number(raw.battle?.earned) || 0),
      },
      lastSaved: Math.min(Date.now(), Number(raw.lastSaved) || Date.now()),
    };
  } catch { return { ...DEFAULT, heroes: { ...DEFAULT.heroes }, legion: { ...DEFAULT.legion }, boosts: { ...DEFAULT.boosts }, settings: { ...DEFAULT.settings }, battle: { ...DEFAULT.battle } }; }
}

let state = load();
let visuals;
let activeScreen = 'home';
let activeTab = 'heroes';
let selectedHero = 'sprout';
let lastTick = Date.now();
let lastFloat = Date.now();
let toastTimer;
let resetting = false;
const offlineSeconds = Math.min(8 * 60 * 60, Math.max(0, (Date.now() - state.lastSaved) / 1000));
const troopCount = () => UNITS.reduce((sum, unit) => sum + state.legion[unit.id], 0);
const lps = () => (HEROES.reduce((sum, hero) => sum + (state.heroes[hero.id] || 0) * hero.baseLps, 0) + UNITS.reduce((sum, unit) => sum + state.legion[unit.id] * unit.harvest, 0)) * (1 + state.boosts.harvest * .25) * (state.equipped === 'leaf_charm' ? 1.1 : 1);
const combatPower = () => (HEROES.reduce((sum, hero) => sum + (state.heroes[hero.id] || 0) * hero.baseLps * 3, 0) + UNITS.reduce((sum, unit) => sum + state.legion[unit.id] * unit.power, 0)) * (1 + state.boosts.power * .2) * (state.equipped === 'rose_brooch' ? 1.15 : 1);
const partyMaxHp = () => 100 + Object.values(state.heroes).reduce((sum, level) => sum + level * 10, 0) + UNITS.reduce((sum, unit) => sum + state.legion[unit.id] * unit.hp, 0) + state.boosts.vitality * 40 + (state.equipped === 'oak_badge' ? 30 : 0);
function enemyMaxHp(wave) { return Math.round(24 * Math.pow(1.27, wave - 1) * (wave % 5 === 0 ? 1.8 : 1)); }
function enemyDamage(wave) { return 1.1 * Math.pow(1.18, wave - 1); }
function waveReward(wave) { return Math.ceil(8 * Math.pow(1.23, wave - 1) * (wave % 5 === 0 ? 2 : 1) * (state.equipped === 'sunstone' ? 1.25 : 1)); }
if (offlineSeconds > 5) {
  const earned = lps() * offlineSeconds;
  state.leaves += earned;
  state.totalHarvested += earned;
  advanceCombat(offlineSeconds);
}

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#home" data-screen="home" aria-label="Idle Garden Hero home"><span class="brand-icon">🌿</span><span>idle garden <strong>hero</strong><small>YOUR LITTLE CORNER OF GREEN</small></span></a>
      <div class="top-actions"><span class="saved-indicator"><span class="saved-dot"></span> Progress saved</span><span class="day-pill">☀️ &nbsp; A lovely day to grow</span><button class="top-settings" data-screen="settings" aria-label="Open settings">⚙️</button></div>
    </header>
    <nav class="screen-nav" aria-label="Game screens"><button class="screen-link active" data-screen="home" aria-current="page">🏡 <span>Home</span></button><button class="screen-link" data-screen="garden">🌿 <span>Garden</span></button><button class="screen-link" data-screen="combat">⚔️ <span>Combat</span></button><button class="screen-link" data-screen="bag">🎒 <span>Bag</span></button><button class="screen-link" data-screen="upgrades">✨ <span>Upgrades</span></button><button class="screen-link" data-screen="settings">⚙️ <span>Settings</span></button></nav>
    <main id="home-screen" class="screen-view active">
      <section class="home-intro"><div><span class="eyebrow">✦ &nbsp; YOUR LITTLE KINGDOM OF GREEN</span><h1>Welcome home, <em>gardener.</em></h1><p>Grow your legion, gather leaves, and keep the glade safe.</p></div><div class="home-wallet">🍃 <strong id="home-leaves">0</strong><small id="home-lps">+1 / sec</small></div></section>
      <section class="home-stage"><div class="home-stage-copy"><span class="stage-kicker">🌼 &nbsp; THE ADVENTURE CONTINUES</span><h2>A garden full of <em>heroes.</em></h2><p>Your friends are harvesting and defending the glade, even while you explore.</p><div class="home-stage-actions"><button class="home-primary" data-screen="garden">Enter the Garden ${icon('arrow', 18)}</button><button class="home-secondary" data-screen="combat">Watch Combat ⚔️</button></div></div><div class="home-party" id="home-party"></div><div class="home-stage-flower flower-one">✿</div><div class="home-stage-flower flower-two">✿</div></section>
      <section class="home-summary"><div><span>🌿</span><small>GARDEN HEROES</small><strong id="home-heroes">1 / 6</strong></div><div><span>🛡️</span><small>LEGION TROOPS</small><strong id="home-troops">0</strong></div><div><span>⚔️</span><small>CURRENT WAVE</small><strong id="home-wave">1</strong></div><div><span>🍃</span><small>LEAVES PER SECOND</small><strong id="home-rate">1</strong></div></section>
      <section class="destinations"><div class="destinations-title"><span class="section-kicker">CHOOSE YOUR NEXT STEP</span><h2>Where to today?</h2><p>Everything your garden needs is right here.</p></div><div class="destination-grid"><button class="destination-card garden-destination" data-screen="garden"><span class="destination-icon">🌿</span><span class="destination-copy"><strong>Garden</strong><small>Grow heroes and expand your legion</small></span>${icon('arrow', 20)}</button><button class="destination-card combat-destination" data-screen="combat"><span class="destination-icon">⚔️</span><span class="destination-copy"><strong>Combat</strong><small>Watch your legion defend the glade</small></span>${icon('arrow', 20)}</button><button class="destination-card bag-destination" data-screen="bag"><span class="destination-icon">🎒</span><span class="destination-copy"><strong>Accessories & Bag</strong><small>Equip treasures earned in battle</small></span>${icon('arrow', 20)}</button><button class="destination-card upgrades-destination" data-screen="upgrades"><span class="destination-icon">✨</span><span class="destination-copy"><strong>Upgrades</strong><small>Boost harvest, power, and health</small></span>${icon('arrow', 20)}</button><button class="destination-card settings-destination" data-screen="settings"><span class="destination-icon">⚙️</span><span class="destination-copy"><strong>Settings</strong><small>Make the game feel just right</small></span>${icon('arrow', 20)}</button></div></section>
    </main>
    <main id="garden-screen" class="screen-view" hidden>
      <section class="welcome-row">
        <div><div class="eyebrow">✦ &nbsp; WELCOME BACK, GARDENER</div><h1>Your garden is <em>growing!</em></h1><p>Good things take thyme. Your heroes are hard at work.</p></div>
        <div class="wallet-card"><div class="wallet-icon">${icon('leaf', 24)}</div><div><span class="wallet-label">LEAF POINTS</span><strong id="leaf-count">0</strong><span class="wallet-rate" id="lps-count">+1 per second</span></div><span class="wallet-decoration">✦</span></div>
      </section>
      <section class="garden-panel" aria-label="Garden grid">
        <div class="section-heading"><div><span class="section-kicker">THE HEART OF IT ALL</span><h2>🌿 &nbsp; Your Garden</h2><p>A cozy home for your hardworking heroes</p></div><div class="garden-count" id="garden-count"></div></div>
        <div class="garden-grid" id="garden-grid"></div>
        <div class="garden-bottom"><span>🌤️ &nbsp; A gentle breeze rustles through the leaves...</span><span id="garden-output"></span></div>
      </section>
      <section class="management-section" aria-label="Garden management">
        <div class="management-title"><div><span class="section-kicker">GROW SOMETHING GREAT</span><h2>Garden HQ</h2></div><span class="management-note">Make your little world bloom ✨</span></div>
        <div class="tabs" role="tablist" aria-label="Garden panels">
          <button class="tab active" role="tab" aria-selected="true" data-tab="heroes">${icon('spark', 18)} Heroes & upgrades</button>
          <button class="tab" role="tab" aria-selected="false" data-tab="legion">🛡️ Legion</button>
          <button class="tab" role="tab" aria-selected="false" data-tab="achievements">${icon('trophy', 18)} Achievements</button>
          <button class="tab" role="tab" aria-selected="false" data-tab="stats">${icon('chart', 18)} Garden stats</button>
        </div>
        <div class="tab-stage" id="tab-stage"><div class="tab-content" id="tab-content"></div></div>
      </section>
    </main>
    <main id="combat-screen" class="screen-view" hidden>
      <section class="combat-intro"><div><div class="eyebrow">✦ &nbsp; THE GLADE NEEDS YOU</div><h1>Defend the <em>garden.</em></h1><p>Your heroes fight automatically while you tend your little world.</p></div><div class="combat-wave-pill">⚔️ &nbsp; WAVE <strong id="wave-label">1</strong></div></section>
      <section class="battlefield" aria-label="Idle battle arena"><div class="battlefield-top"><span class="battlefield-kicker">🌲 &nbsp; WHISPERING WOODS</span><span class="battle-status"><span></span> AUTO BATTLE ACTIVE</span></div><div class="battle-arena"><div class="battle-side legion-side"><div class="battle-side-label">YOUR LEGION</div><div class="battle-figures" id="battle-figures"></div><strong>Garden Legion</strong><span id="legion-count"></span></div><div class="battle-center"><span class="battle-spark">✦</span><div class="battle-vs">VS</div><span class="battle-spark">✦</span></div><div class="battle-side enemy-side"><div class="battle-side-label" id="enemy-type"></div><div class="enemy-figure" id="enemy-figure"></div><strong id="enemy-name"></strong><span id="enemy-wave"></span></div></div><div class="battle-bars"><div class="battle-bar-block"><div class="bar-label"><span>💚 &nbsp; Legion health</span><strong id="party-hp-label"></strong></div><div class="health-track"><div class="health-fill party" id="party-hp-fill"></div></div></div><div class="battle-bar-block"><div class="bar-label"><span>❤️ &nbsp; Enemy health</span><strong id="enemy-hp-label"></strong></div><div class="health-track"><div class="health-fill enemy" id="enemy-hp-fill"></div></div></div></div><div class="battlefield-bottom"><span>✨ &nbsp; Heroes and troops attack on their own. Grow them in the garden for more power.</span><span id="battle-reward"></span></div></section>
      <section class="combat-dashboard"><div class="combat-heading"><div><span class="section-kicker">YOUR ADVENTURE SO FAR</span><h2>Battle camp</h2></div><button class="return-garden" data-screen="garden">Upgrade heroes ${icon('arrow', 17)}</button></div><div class="combat-stat-grid"><div class="combat-stat"><span class="combat-stat-icon">⚔️</span><small>LEGION POWER</small><strong id="combat-power"></strong><p>Damage per second</p></div><div class="combat-stat"><span class="combat-stat-icon">🏆</span><small>WAVES CLEARED</small><strong id="waves-cleared"></strong><p>One victory at a time</p></div><div class="combat-stat"><span class="combat-stat-icon">🍃</span><small>BATTLE LEAVES</small><strong id="battle-earned"></strong><p>Earned from victories</p></div></div><div class="combat-lower"><div class="legion-card"><div class="card-heading"><div><h3>Heroes on the front line</h3><p>Every recruited hero joins the fight</p></div><span class="tiny-badge" id="legion-badge"></span></div><div id="legion-roster"></div></div><div class="battle-tip"><span>🌼</span><div><strong>Stronger roots, stronger heroes.</strong><p>Hero levels boost both Leaf Point production and battle damage. Win waves to earn bonus leaves, then return to the garden to grow your legion.</p></div><button data-screen="garden">Visit your garden ${icon('arrow', 16)}</button></div></div></section>
    </main>
    <main id="bag-screen" class="screen-view utility-screen" hidden><section class="utility-intro"><div><span class="eyebrow">✦ &nbsp; TREASURES FROM THE GLADE</span><h1>Accessories <em>& Bag.</em></h1><p>Win combat waves to discover accessories, then equip one to help your team.</p></div><span class="utility-hero-icon">🎒</span></section><div id="bag-content"></div></main>
    <main id="upgrades-screen" class="screen-view utility-screen" hidden><section class="utility-intro"><div><span class="eyebrow">✦ &nbsp; GROW STRONGER TOGETHER</span><h1>Garden <em>Upgrades.</em></h1><p>Spend Leaf Points on lasting boosts for every hero in your legion.</p></div><span class="utility-hero-icon">✨</span></section><div id="upgrades-content"></div></main>
    <main id="settings-screen" class="screen-view utility-screen" hidden><section class="utility-intro"><div><span class="eyebrow">✦ &nbsp; MAKE IT YOURS</span><h1>Game <em>Settings.</em></h1><p>Choose how your garden looks and save your progress whenever you like.</p></div><span class="utility-hero-icon">⚙️</span></section><div id="settings-content"></div></main>
    <footer>Made with a little sunshine & a lot of leaves <span>✿</span></footer>
    <nav class="mobile-dock" aria-label="Quick navigation"><button class="dock-link active" data-screen="home" aria-label="Home">🏡<span>Home</span></button><button class="dock-link" data-screen="garden" aria-label="Garden">🌿<span>Garden</span></button><button class="dock-link" data-screen="combat" aria-label="Combat">⚔️<span>Combat</span></button><button class="dock-link" data-screen="bag" aria-label="Bag">🎒<span>Bag</span></button><button class="dock-link" data-screen="upgrades" aria-label="Upgrades">✨<span>Upgrades</span></button></nav>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  </div>`;

const grid = document.querySelector('#garden-grid');
const content = document.querySelector('#tab-content');
const stage = document.querySelector('#tab-stage');

function save() {
  if (resetting) return;
  state.lastSaved = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* Game remains playable without storage. */ }
}
function toast(message) {
  const el = document.querySelector('#toast');
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 3000);
}
function upgradeCost(hero) { return Math.ceil(hero.upgradeBase * Math.pow(1.32, (state.heroes[hero.id] || 1) - 1)); }
function unitCost(unit) { return Math.ceil(unit.baseCost * Math.pow(1.16, state.legion[unit.id])); }
function nextPlotCost() { return PLOT_COSTS[state.plots]; }
function boostCost(boost) { return Math.ceil(boost.baseCost * Math.pow(1.8, state.boosts[boost.id])); }
function applySettings() {
  document.body.classList.toggle('motion-off', !state.settings.motion);
  visuals?.setMotion(state.settings.motion);
}

function renderNumbers() {
  document.querySelector('#leaf-count').textContent = fmt(state.leaves);
  document.querySelector('#lps-count').textContent = `+${fmtRate(lps())} per second`;
  document.querySelector('#garden-output').textContent = `🍃 ${fmtRate(lps())} leaves / sec`;
  document.querySelector('#garden-count').innerHTML = `${icon('grid', 16)} ${state.plots} / ${HEROES.length} plots open`;
  renderHomeNumbers();
}
function renderHomeNumbers() {
  document.querySelector('#home-leaves').textContent = fmt(state.leaves);
  document.querySelector('#home-lps').textContent = `+${fmtRate(lps())} / sec`;
  document.querySelector('#home-heroes').textContent = `${Object.keys(state.heroes).length} / ${HEROES.length}`;
  document.querySelector('#home-troops').textContent = fmt(troopCount());
  document.querySelector('#home-wave').textContent = state.battle.wave;
  document.querySelector('#home-rate').textContent = fmtRate(lps());
}
function renderHome() {
  const owned = HEROES.filter(hero => state.heroes[hero.id]).slice(0, 3);
  document.querySelector('#home-party').innerHTML = owned.map((hero, index) => `<div class="home-character character-${index}">${heroPortrait(hero)}<span>Lv. ${state.heroes[hero.id]}</span></div>`).join('');
  renderHomeNumbers();
}
function renderGrid() {
  grid.innerHTML = HEROES.map((hero, i) => {
    const open = i < state.plots;
    const unlocked = !!state.heroes[hero.id];
    if (!open) return `<div class="plot locked-plot" style="--delay:${i * .15}s"><span class="plot-number">PLOT 0${i + 1}</span><div class="locked-center"><span class="lock-orb">${icon('lock', 25)}</span><strong>Sleeping soil</strong><small>Waiting to bloom</small></div><span class="plot-bottom-label">🔒 &nbsp; Locked plot</span></div>`;
    if (!unlocked) return `<button class="plot empty-plot" data-select="${hero.id}" style="--delay:${i * .15}s"><span class="plot-number">PLOT 0${i + 1}</span><div class="empty-center"><span class="empty-orb">${icon('plus', 27)}</span><strong>Room to grow</strong><small>Recruit ${hero.name}</small></div><span class="plot-bottom-label">A new friend awaits</span></button>`;
    return `<button class="plot hero-plot ${hero.color} ${selectedHero === hero.id ? 'selected' : ''}" data-select="${hero.id}" style="--delay:${i * .15}s"><span class="plot-number">PLOT 0${i + 1}</span><span class="hero-level">LVL ${state.heroes[hero.id]}</span><span class="hero-art"><span class="hero-halo"></span><span class="hero-plant">${hero.plant}</span><span class="hero-emoji">${hero.emoji}</span></span><span class="hero-name">${hero.name}</span><span class="hero-output">${icon('leaf', 14)} ${fmtRate(state.heroes[hero.id] * hero.baseLps)} / sec</span></button>`;
  }).join('');
  visuals?.syncGarden();
}
function renderHeroes() {
  const selected = HEROES.find(h => h.id === selectedHero) || HEROES[0];
  const selectedOpen = selected.plot < state.plots;
  const selectedOwned = !!state.heroes[selected.id];
  content.innerHTML = `<div class="heroes-layout">
    <div class="hero-list-card"><div class="card-heading"><div><h3>Garden heroes</h3><p>Pick a hero to help them grow</p></div><span class="tiny-badge">${Object.keys(state.heroes).length} / ${HEROES.length} FOUND</span></div><div class="hero-list">${HEROES.map(hero => {
      const owned = !!state.heroes[hero.id]; const open = hero.plot < state.plots;
      return `<button class="hero-list-item ${selectedHero === hero.id ? 'active' : ''}" data-select="${hero.id}"><span class="list-avatar ${hero.color}">${heroPortrait(hero)}</span><span class="list-copy"><strong>${hero.name}</strong><small>${owned ? `Level ${state.heroes[hero.id]} · ${fmtRate(state.heroes[hero.id] * hero.baseLps)} / sec` : open ? 'Ready to recruit' : 'Unlock the plot first'}</small></span><span class="list-status">${owned ? icon('check', 18) : open ? icon('arrow', 18) : icon('lock', 16)}</span></button>`;
    }).join('')}</div></div>
    <div class="detail-stack"><div class="hero-detail-card ${selected.color}"><span class="detail-tag">${selectedOwned ? 'YOUR GARDEN HERO' : selectedOpen ? 'READY TO RECRUIT' : 'FUTURE GARDEN HERO'}</span><div class="detail-main"><span class="detail-avatar">${heroPortrait(selected)}</span><div><h3>${selected.name}</h3><p>${selected.role}</p><span class="detail-rate">${icon('leaf', 16)} ${fmtRate(selected.baseLps)} leaves / sec / level</span></div></div><div class="detail-divider"></div>${selectedOwned ? `<div class="upgrade-row"><div><span class="upgrade-label">CURRENT LEVEL</span><strong>${state.heroes[selected.id]} <span>→ ${state.heroes[selected.id] + 1}</span></strong></div><div><span class="upgrade-label">NEXT HARVEST</span><strong>+${fmtRate((state.heroes[selected.id] + 1) * selected.baseLps)} <span>/ sec</span></strong></div></div><button class="primary-button" data-upgrade="${selected.id}" ${state.leaves < upgradeCost(selected) ? 'disabled' : ''}>${icon('spark', 18)} Upgrade hero <span>${icon('leaf', 16)} ${fmt(upgradeCost(selected))}</span></button>` : `<div class="recruit-copy">${selectedOpen ? 'Add this hero to your garden and start harvesting together.' : 'Open this garden plot to make room for a new hero.'}</div><button class="primary-button" data-recruit="${selected.id}" ${!selectedOpen || state.leaves < selected.unlockCost ? 'disabled' : ''}>${selectedOpen ? `${icon('plus', 18)} Recruit hero <span>${icon('leaf', 16)} ${fmt(selected.unlockCost)}</span>` : `${icon('lock', 18)} Plot locked`}</button>`}</div>
    <div class="plot-upgrade-card"><span class="plot-upgrade-icon">🌷</span><div><strong>Make room to bloom</strong><small>${state.plots < HEROES.length ? `Open plot ${state.plots + 1} to welcome another hero.` : 'Every plot is open. Your garden is full!'}</small></div><button data-plot ${state.plots >= HEROES.length || state.leaves < nextPlotCost() ? 'disabled' : ''}>${state.plots >= HEROES.length ? 'All open' : `${icon('leaf', 15)} ${fmt(nextPlotCost())} ${icon('arrow', 15)}`}</button></div></div>
  </div>`;
}
function renderLegion() {
  content.innerHTML = `<div class="legion-intro-card"><div><span class="section-kicker">GROW YOUR GARDEN ARMY</span><h3>Small friends, big courage.</h3><p>Recruit troops to harvest leaves and fight beside your heroes.</p></div><span>🛡️ ${fmt(troopCount())} troops</span></div><div class="unit-grid">${UNITS.map(unit => {
    const unlocked = state.plots >= unit.plot;
    return `<article class="unit-card ${unlocked ? '' : 'unit-locked'}"><div class="unit-top"><span class="unit-avatar">${unit.emoji}</span><span class="unit-count">${fmt(state.legion[unit.id])} RECRUITED</span></div><h3>${unit.name}</h3><p>${unit.desc}</p><div class="unit-stats"><span>🍃 +${fmtRate(unit.harvest)} / sec</span><span>⚔️ +${fmtRate(unit.power)} power</span><span>💚 +${unit.hp} HP</span></div><button class="primary-button" data-recruit-unit="${unit.id}" ${!unlocked || state.leaves < unitCost(unit) ? 'disabled' : ''}>${unlocked ? `Recruit one <span>🍃 ${fmt(unitCost(unit))}</span>` : `Open plot ${unit.plot} to unlock`}</button></article>`;
  }).join('')}</div>`;
  content.querySelector('.legion-intro-card > span').textContent = `🛡️ ${fmt(troopCount())} troop${troopCount() === 1 ? '' : 's'}`;
}
const ACHIEVEMENTS = [
  { icon: '🌱', name: 'First sprout', desc: 'Begin your garden adventure', done: () => true },
  { icon: '🍃', name: 'A handful of leaves', desc: 'Harvest 100 Leaf Points total', done: () => state.totalHarvested >= 100 },
  { icon: '🌹', name: 'Growing together', desc: 'Recruit your second hero', done: () => Object.keys(state.heroes).length >= 2 },
  { icon: '🌷', name: 'Room to bloom', desc: 'Open 3 garden plots', done: () => state.plots >= 3 },
  { icon: '🌳', name: 'A thriving garden', desc: 'Reach 100 leaves per second', done: () => lps() >= 100 },
  { icon: '☀️', name: 'Full bloom', desc: 'Open all 6 garden plots', done: () => state.plots === HEROES.length },
];
function renderAchievements() {
  const done = ACHIEVEMENTS.filter(a => a.done()).length;
  content.innerHTML = `<div class="subpage-head"><div><h3>Little milestones, big smiles</h3><p>Every leaf is a step toward something lovely.</p></div><span class="achievement-progress">🏆 ${done} / ${ACHIEVEMENTS.length} complete</span></div><div class="achievement-grid">${ACHIEVEMENTS.map(a => `<div class="achievement-card ${a.done() ? 'complete' : ''}"><span class="achievement-icon">${a.icon}</span><div><strong>${a.name}</strong><small>${a.desc}</small></div><span class="achievement-check">${a.done() ? icon('check', 18) : icon('lock', 16)}</span></div>`).join('')}</div>`;
}
function renderStats() {
  content.innerHTML = `<div class="subpage-head"><div><h3>Your garden at a glance</h3><p>Look how far your little world has come.</p></div><span class="achievement-progress">🌿 Always growing</span></div><div class="stats-grid"><div class="stat-card"><span>🍃</span><small>TOTAL LEAVES HARVESTED</small><strong>${fmt(state.totalHarvested)}</strong><p>All those little harvests add up.</p></div><div class="stat-card"><span>⚡</span><small>CURRENT PRODUCTION</small><strong>${fmtRate(lps())} <em>/ sec</em></strong><p>Your heroes are hard at work.</p></div><div class="stat-card"><span>🦸</span><small>GARDEN HEROES</small><strong>${Object.keys(state.heroes).length} <em>/ ${HEROES.length}</em></strong><p>Friends make the garden brighter.</p></div><div class="stat-card"><span>🌷</span><small>OPEN GARDEN PLOTS</small><strong>${state.plots} <em>/ ${HEROES.length}</em></strong><p>Plenty of room to grow.</p></div></div>`;
}
function renderPanel() {
  if (activeTab === 'heroes') renderHeroes();
  else if (activeTab === 'legion') renderLegion();
  else if (activeTab === 'achievements') renderAchievements();
  else renderStats();
}
function enemyForWave(wave) { return ENEMIES[(wave - 1) % ENEMIES.length]; }
function advanceCombat(seconds) {
  let remaining = Math.min(8 * 60 * 60, Math.max(0, seconds));
  let steps = 0;
  while (remaining > 0.0001 && steps++ < 10000) {
    const battle = state.battle;
    const power = Math.max(0.1, combatPower());
    const incoming = enemyDamage(battle.wave);
    const untilWin = battle.enemyHp / power;
    const untilLoss = battle.partyHp / incoming;
    const elapsed = Math.min(remaining, untilWin, untilLoss);
    battle.enemyHp = Math.max(0, battle.enemyHp - power * elapsed);
    battle.partyHp = Math.max(0, battle.partyHp - incoming * elapsed);
    remaining -= elapsed;
    if (battle.enemyHp <= 0.001) {
      const reward = waveReward(battle.wave);
      state.leaves += reward;
      state.totalHarvested += reward;
      battle.earned += reward;
      battle.wins++;
      battle.wave = Math.min(150, battle.wave + 1);
      battle.enemyHp = enemyMaxHp(battle.wave);
      battle.partyHp = Math.min(partyMaxHp(), battle.partyHp + partyMaxHp() * 0.25);
    } else if (battle.partyHp <= 0.001) {
      battle.partyHp = partyMaxHp();
      battle.enemyHp = enemyMaxHp(battle.wave);
    }
  }
}
function renderCombat() {
  const battle = state.battle;
  const enemy = enemyForWave(battle.wave);
  const owned = HEROES.filter(hero => state.heroes[hero.id]);
  document.querySelector('#battle-figures').innerHTML = owned.map(hero => `<span class="battle-hero ${hero.color}" title="${hero.name}">${hero.plant}<small>${hero.emoji}</small></span>`).join('');
  document.querySelector('#legion-count').textContent = `${owned.length} hero${owned.length === 1 ? '' : 'es'} · ${fmt(troopCount())} troop${troopCount() === 1 ? '' : 's'}`;
  document.querySelector('#enemy-type').textContent = enemy.type.toUpperCase();
  document.querySelector('#enemy-figure').innerHTML = enemy.emoji;
  document.querySelector('#enemy-figure').className = `enemy-figure ${enemy.tint}`;
  document.querySelector('#enemy-name').textContent = enemy.name;
  document.querySelector('#enemy-wave').textContent = battle.wave % 5 === 0 ? 'BOSS WAVE' : `Wave ${battle.wave} enemy`;
  document.querySelector('#legion-badge').textContent = `${owned.length + troopCount()} ACTIVE`;
  document.querySelector('#legion-roster').innerHTML = owned.map(hero => `<div class="roster-row"><span class="list-avatar ${hero.color}">${heroPortrait(hero)}</span><div><strong>${hero.name}</strong><small>Level ${state.heroes[hero.id]} · ${fmtRate(state.heroes[hero.id] * hero.baseLps * 3)} damage / sec</small></div><span class="roster-ready">● FIGHTING</span></div>`).join('') + UNITS.filter(unit => state.legion[unit.id] > 0).map(unit => `<div class="roster-row"><span class="list-avatar unit-avatar">${unit.emoji}</span><div><strong>${unit.name} × ${fmt(state.legion[unit.id])}</strong><small>${fmtRate(unit.power * state.legion[unit.id])} damage / sec</small></div><span class="roster-ready">● FIGHTING</span></div>`).join('');
  renderBattleNumbers();
  visuals?.syncCombat();
}
function renderBattleNumbers() {
  const battle = state.battle;
  const maxEnemy = enemyMaxHp(battle.wave);
  document.querySelector('#wave-label').textContent = battle.wave;
  document.querySelector('#party-hp-label').textContent = `${fmt(battle.partyHp)} / ${fmt(partyMaxHp())}`;
  document.querySelector('#enemy-hp-label').textContent = `${fmt(battle.enemyHp)} / ${fmt(maxEnemy)}`;
  document.querySelector('#party-hp-fill').style.width = `${Math.max(0, Math.min(100, battle.partyHp / partyMaxHp() * 100))}%`;
  document.querySelector('#enemy-hp-fill').style.width = `${Math.max(0, Math.min(100, battle.enemyHp / maxEnemy * 100))}%`;
  document.querySelector('#battle-reward').textContent = `🍃 +${fmt(waveReward(battle.wave))} on victory`;
  document.querySelector('#combat-power').textContent = fmtRate(combatPower());
  document.querySelector('#waves-cleared').textContent = fmt(battle.wins);
  document.querySelector('#battle-earned').textContent = fmt(battle.earned);
}
function renderBag() {
  const earned = ACCESSORIES.filter(item => state.battle.wins >= item.unlockAt).length;
  const equipped = ACCESSORIES.find(item => item.id === state.equipped);
  document.querySelector('#bag-content').innerHTML = `<div class="utility-summary"><span class="summary-art">${equipped?.emoji || '🎒'}</span><div><span class="section-kicker">EQUIPPED ACCESSORY</span><h2>${equipped?.name || 'Nothing equipped yet'}</h2><p>${equipped ? equipped.bonus : 'Choose a treasure below to give your legion a boost.'}</p></div><span class="summary-count">${earned} / ${ACCESSORIES.length} found</span></div><div class="utility-section-title"><div><h2>Your collection</h2><p>Battle victories reveal new treasures.</p></div><span>🏆 ${fmt(state.battle.wins)} waves cleared</span></div><div class="accessory-grid">${ACCESSORIES.map(item => {
    const unlocked = state.battle.wins >= item.unlockAt;
    const selected = state.equipped === item.id;
    return `<article class="accessory-card ${unlocked ? '' : 'accessory-locked'} ${selected ? 'equipped' : ''}"><span class="accessory-art">${unlocked ? item.emoji : '🔒'}</span><div class="accessory-copy"><span class="accessory-status">${selected ? 'EQUIPPED' : unlocked ? 'FOUND' : `UNLOCK AT ${item.unlockAt} WINS`}</span><h3>${item.name}</h3><p>${item.desc}</p><strong>${item.bonus}</strong></div><button data-equip="${item.id}" ${unlocked ? '' : 'disabled'}>${selected ? 'Unequip' : unlocked ? 'Equip' : 'Locked'}</button></article>`;
  }).join('')}</div>`;
}
function renderUpgrades() {
  document.querySelector('#upgrades-content').innerHTML = `<div class="utility-summary"><span class="summary-art">🍃</span><div><span class="section-kicker">AVAILABLE TO SPEND</span><h2><span id="upgrade-leaves">${fmt(state.leaves)}</span> Leaf Points</h2><p>Each upgrade helps every hero, even future recruits.</p></div><button class="summary-link" data-screen="garden">Grow heroes ${icon('arrow', 16)}</button></div><div class="utility-section-title"><div><h2>Permanent boosts</h2><p>Build a stronger garden one step at a time.</p></div></div><div class="boost-grid">${BOOSTS.map(boost => {
    const level = state.boosts[boost.id];
    const maxed = level >= 20;
    const value = boost.id === 'vitality' ? `+${level * 40} HP` : `+${Math.round(level * (boost.id === 'harvest' ? 25 : 20))}%`;
    return `<article class="boost-card ${boost.color}"><span class="boost-art">${boost.emoji}</span><span class="boost-level">LVL ${level} / 20</span><h3>${boost.name}</h3><p>${boost.desc}</p><div class="boost-effect"><span>CURRENT BONUS</span><strong>${value}</strong></div><button class="primary-button" data-boost="${boost.id}" ${maxed || state.leaves < boostCost(boost) ? 'disabled' : ''}>${maxed ? 'Max level' : `Upgrade <span>🍃 ${fmt(boostCost(boost))}</span>`}</button></article>`;
  }).join('')}</div>`;
}
let resetPending = false;
function renderSettings() {
  document.querySelector('#settings-content').innerHTML = `<div class="settings-grid"><section class="settings-card"><span class="section-kicker">APPEARANCE</span><h2>Display & motion</h2><p>Set the pace that feels comfortable for you.</p><div class="setting-row"><div><strong>Character animations</strong><small>Gentle movement and battle effects</small></div><button class="toggle ${state.settings.motion ? 'on' : ''}" role="switch" aria-checked="${state.settings.motion}" data-setting="motion" aria-label="Character animations"><span></span></button></div><div class="setting-row"><div><strong>Floating harvest text</strong><small>Show Leaf Points above garden heroes</small></div><button class="toggle ${state.settings.floatingText ? 'on' : ''}" role="switch" aria-checked="${state.settings.floatingText}" data-setting="floatingText" aria-label="Floating harvest text"><span></span></button></div></section><section class="settings-card"><span class="section-kicker">PROGRESS</span><h2>Your save</h2><p>Your garden saves automatically in this browser.</p><div class="save-info">${icon('check', 19)} Local save is active</div><button class="settings-action" data-save>Save progress now ${icon('arrow', 16)}</button><div class="settings-divider"></div><h3>Start a new garden</h3><p>This clears your local progress and begins again with Sprout Knight.</p>${resetPending ? `<div class="reset-confirm"><button data-reset-confirm>Yes, reset everything</button><button data-reset-cancel>Cancel</button></div>` : `<button class="reset-button" data-reset>Reset progress</button>`}</section></div>`;
}
function showScreen(name, updateHistory = true) {
  if (!SCREENS.includes(name)) name = 'home';
  if (name === activeScreen) return;
  activeScreen = name;
  if (updateHistory) history.pushState(null, '', name === 'home' ? location.pathname + location.search : `#${name}`);
  document.querySelectorAll('.screen-link,.dock-link').forEach(button => { const current = button.dataset.screen === name; button.classList.toggle('active', current); if (current) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current'); });
  SCREENS.forEach(screen => { document.querySelector(`#${screen}-screen`).hidden = screen !== name; });
  if (name === 'home') renderHome();
  if (name === 'combat') renderCombat();
  if (name === 'bag') renderBag();
  if (name === 'upgrades') renderUpgrades();
  if (name === 'settings') renderSettings();
  visuals?.show(name);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function renderAll() { renderNumbers(); renderGrid(); renderPanel(); renderCombat(); renderHome(); renderBag(); renderUpgrades(); renderSettings(); }

function floatingHarvest() {
  if (!state.settings.motion || !state.settings.floatingText) return;
  visuals?.harvest();
  HEROES.forEach(hero => {
    const level = state.heroes[hero.id];
    if (!level) return;
    const plot = grid.querySelector(`[data-select="${hero.id}"]`);
    if (!plot) return;
    const span = document.createElement('span');
    span.className = 'floating-harvest';
    span.textContent = `+${fmtRate(level * hero.baseLps * 2)} 🍃`;
    span.style.left = `${42 + Math.random() * 18}%`;
    plot.append(span);
    span.addEventListener('animationend', () => span.remove(), { once: true });
  });
}

app.addEventListener('click', (event) => {
  const screen = event.target.closest('[data-screen]');
  if (screen) { event.preventDefault(); showScreen(screen.dataset.screen); return; }
  const equip = event.target.closest('[data-equip]');
  if (equip) {
    const item = ACCESSORIES.find(entry => entry.id === equip.dataset.equip);
    if (!item || state.battle.wins < item.unlockAt) return;
    state.equipped = state.equipped === item.id ? null : item.id;
    state.battle.partyHp = Math.min(state.battle.partyHp, partyMaxHp());
    save(); renderAll(); toast(state.equipped ? `${item.name} equipped!` : `${item.name} put away.`);
    return;
  }
  const recruitUnit = event.target.closest('[data-recruit-unit]');
  if (recruitUnit) {
    const unit = UNITS.find(entry => entry.id === recruitUnit.dataset.recruitUnit);
    if (!unit || state.plots < unit.plot || state.leaves < unitCost(unit)) return;
    state.leaves -= unitCost(unit);
    state.legion[unit.id]++;
    state.battle.partyHp += unit.hp;
    save(); renderAll(); toast(`${unit.name} joined your legion!`);
    return;
  }
  const boostButton = event.target.closest('[data-boost]');
  if (boostButton) {
    const boost = BOOSTS.find(entry => entry.id === boostButton.dataset.boost);
    if (!boost || state.boosts[boost.id] >= 20 || state.leaves < boostCost(boost)) return;
    state.leaves -= boostCost(boost);
    state.boosts[boost.id]++;
    if (boost.id === 'vitality') state.battle.partyHp += 40;
    save(); renderAll(); toast(`${boost.name} reached level ${state.boosts[boost.id]}!`);
    return;
  }
  const setting = event.target.closest('[data-setting]');
  if (setting) {
    const key = setting.dataset.setting;
    if (!Object.hasOwn(state.settings, key)) return;
    state.settings[key] = !state.settings[key];
    save(); applySettings(); renderSettings();
    return;
  }
  if (event.target.closest('[data-save]')) { save(); toast('Garden progress saved.'); return; }
  if (event.target.closest('[data-reset]')) { resetPending = true; renderSettings(); return; }
  if (event.target.closest('[data-reset-cancel]')) { resetPending = false; renderSettings(); return; }
  if (event.target.closest('[data-reset-confirm]')) { resetting = true; localStorage.removeItem(SAVE_KEY); location.href = location.pathname + location.search; return; }
  const tab = event.target.closest('[data-tab]');
  if (tab && tab.dataset.tab !== activeTab) {
    activeTab = tab.dataset.tab;
    document.querySelectorAll('.tab').forEach(button => { button.classList.toggle('active', button === tab); button.setAttribute('aria-selected', button === tab ? 'true' : 'false'); });
    stage.classList.add('leaving');
    setTimeout(() => { renderPanel(); stage.classList.remove('leaving'); stage.classList.add('entering'); requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.remove('entering'))); }, 170);
    return;
  }
  const select = event.target.closest('[data-select]');
  if (select) {
    selectedHero = select.dataset.select;
    if (activeTab !== 'heroes') {
      activeTab = 'heroes';
      document.querySelectorAll('.tab').forEach(button => { const on = button.dataset.tab === 'heroes'; button.classList.toggle('active', on); button.setAttribute('aria-selected', String(on)); });
    }
    renderGrid(); renderPanel();
    return;
  }
  const upgrade = event.target.closest('[data-upgrade]');
  if (upgrade) {
    const hero = HEROES.find(h => h.id === upgrade.dataset.upgrade);
    const cost = upgradeCost(hero);
    if (state.leaves < cost) return;
    state.leaves -= cost; state.heroes[hero.id]++; state.battle.partyHp += 10; save(); renderAll(); toast(`${hero.name} reached level ${state.heroes[hero.id]}!`);
    return;
  }
  const recruit = event.target.closest('[data-recruit]');
  if (recruit) {
    const hero = HEROES.find(h => h.id === recruit.dataset.recruit);
    if (hero.plot >= state.plots || state.heroes[hero.id] || state.leaves < hero.unlockCost) return;
    state.leaves -= hero.unlockCost; state.heroes[hero.id] = 1; state.battle.partyHp += 10; save(); renderAll(); toast(`${hero.name} joined your garden!`);
    return;
  }
  if (event.target.closest('[data-plot]')) {
    if (state.plots >= HEROES.length || state.leaves < nextPlotCost()) return;
    state.leaves -= nextPlotCost(); state.plots++; save(); renderAll(); toast(`Plot ${state.plots} is ready to grow!`);
  }
});

function tick() {
  if (document.hidden) return;
  const now = Date.now();
  const dt = Math.min(1, Math.max(0, (now - lastTick) / 1000));
  lastTick = now;
  const gained = lps() * dt;
  state.leaves += gained;
  state.totalHarvested += gained;
  const waveBefore = state.battle.wave;
  advanceCombat(dt);
  renderNumbers();
  renderBattleNumbers();
  if (state.battle.wave !== waveBefore) { renderCombat(); if (activeScreen === 'bag') renderBag(); }
  const balance = document.querySelector('#upgrade-leaves');
  if (balance) balance.textContent = fmt(state.leaves);
  if (activeScreen === 'upgrades') document.querySelectorAll('[data-boost]').forEach(button => { const boost = BOOSTS.find(entry => entry.id === button.dataset.boost); button.disabled = state.boosts[boost.id] >= 20 || state.leaves < boostCost(boost); });
  if (activeTab === 'heroes') {
    content.querySelectorAll('[data-upgrade]').forEach(button => { const hero = HEROES.find(h => h.id === button.dataset.upgrade); button.disabled = state.leaves < upgradeCost(hero); });
    content.querySelectorAll('[data-recruit]').forEach(button => { const hero = HEROES.find(h => h.id === button.dataset.recruit); button.disabled = hero.plot >= state.plots || state.leaves < hero.unlockCost; });
    const plotButton = content.querySelector('[data-plot]');
    if (plotButton) plotButton.disabled = state.plots >= HEROES.length || state.leaves < nextPlotCost();
  }
  if (activeTab === 'legion') content.querySelectorAll('[data-recruit-unit]').forEach(button => { const unit = UNITS.find(entry => entry.id === button.dataset.recruitUnit); button.disabled = state.plots < unit.plot || state.leaves < unitCost(unit); });
  if (now - lastFloat >= 2000) { floatingHarvest(); lastFloat = now; }
}

renderAll();
applySettings();
const initialScreen = location.hash.slice(1);
if (SCREENS.includes(initialScreen) && initialScreen !== 'home') showScreen(initialScreen, false);
window.addEventListener('popstate', () => showScreen(location.hash.slice(1) || 'home', false));
import('./visuals.js').then(({ initVisuals }) => {
  visuals = initVisuals({ heroes: HEROES, getState: () => state, getScreen: () => activeScreen, getMotion: () => state.settings.motion });
  applySettings();
}).catch(error => console.warn('Animated scenes could not load; static characters remain available.', error));
if (offlineSeconds > 5) toast(`Welcome back! Your heroes gathered ${fmt(lps() * offlineSeconds)} leaves while you were away.`);
setInterval(tick, 100);
setInterval(save, 5000);
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); else { const now = Date.now(); const elapsed = Math.min(8 * 60 * 60, (now - lastTick) / 1000); const gained = lps() * elapsed; state.leaves += gained; state.totalHarvested += gained; advanceCombat(elapsed); lastTick = now; renderAll(); if (elapsed > 5) toast(`Your heroes gathered ${fmt(gained)} leaves while you were away.`); } });
window.addEventListener('pagehide', save);
