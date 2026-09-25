import './style.css';
import {
  HEROES,
  PLOT_COSTS,
  HERO_IMAGES,
  BOOSTS,
  UNITS,
  ACCESSORIES,
  ENEMIES,
  DEFAULT_STATE,
  BIOMES,
  ARTIFACTS,
  MIN_BLOOM_WAVE,
  MAX_BOOST_LEVEL,
  artifactBonusText,
  isAccessoryUnlocked,
  lifetimeWins,
  heroLps,
  heroPower,
  unitPower,
  harvestMultiplier,
  troopCount,
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
  artifactCost,
  enemyForWave,
  biomeForWave,
  tapHarvestReward,
  canActivateUltimate,
  activateUltimate,
  canBloomAnew,
  calculateGoldenSeeds,
  bloomAnew,
  advanceCombat,
  sanitizeSave,
} from './game-engine.js';

import { fmt, fmtRate } from './format.js';
import { connectCloud, createCloudSaver, pickNewer } from './cloud-save.js';
import {
  setSoundEnabled,
  setVolume,
  playTap,
  playCritTap,
  playUpgrade,
  playVictory,
  playUlt,
  playBloom,
} from './audio.js';

const ASSET_BASE = `${import.meta.env.BASE_URL}assets/`;
const heroPortrait = (hero) => `<img src="${ASSET_BASE}${HERO_IMAGES[hero.id]}.webp" alt="" loading="lazy" />`;
const BASE_SAVE_KEY = 'idle-garden-hero-v1';
const readStored = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
// Mở trong Chat thì tiến trình đi theo tài khoản: server giữ bản lưu, đổi máy vẫn chơi tiếp.
// Máy dùng chung thì mỗi người một ô localStorage riêng — người sau không kế thừa (rồi đẩy
// lên tài khoản mình) khu vườn của người trước.
const cloud = await connectCloud();
const SAVE_KEY = cloud ? `${BASE_SAVE_KEY}:${cloud.user.id}` : BASE_SAVE_KEY;
if (cloud?.save && pickNewer(readStored(SAVE_KEY), cloud.save) === 'cloud') {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(cloud.save)); } catch { /* storage unavailable */ }
}
const cloudSaver = cloud ? createCloudSaver({ userId: cloud.user.id, onConflict: (reason) => showNewerElsewhere(reason) }) : null;
// The newest tab claims this key; older tabs pause so two tabs never overwrite each other's save.
const OWNER_KEY = `${SAVE_KEY}-owner`;
const TAB_ID = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const SCREENS = ['home', 'garden', 'combat', 'bag', 'upgrades', 'settings'];
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

const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY));
    return sanitizeSave(raw);
  } catch {
    return sanitizeSave(null);
  }
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
let pausedByOtherTab = false;
let lastGardenCount = '';
const offlineSeconds = Math.min(8 * 60 * 60, Math.max(0, (Date.now() - state.lastSaved) / 1000));
const getLps = () => lps(state);
const getCombatPower = () => combatPower(state);
const getPartyMaxHp = () => partyMaxHp(state);
const getTroopCount = () => troopCount(state);

// Applies idle harvest + combat for time away; returns total leaves gained (harvest and battle rewards).
function catchUp(seconds) {
  const before = state.leaves;
  const harvested = getLps() * seconds;
  state.leaves += harvested;
  state.totalHarvested += harvested;
  advanceCombat(state, seconds);
  return state.leaves - before;
}

try { localStorage.setItem(OWNER_KEY, TAB_ID); } catch { /* storage unavailable */ }
let offlineGain = 0;
if (offlineSeconds > 5) {
  offlineGain = catchUp(offlineSeconds);
  state.lastSaved = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}
// Vườn đang chơi trên máy này mới hơn bản trên server (hoặc server chưa có gì — lần đầu
// mở trong Chat): đẩy lên luôn, không đợi thao tác đầu tiên.
if (cloud && pickNewer(state, cloud.save) !== 'cloud') cloudSaver.schedule(state);

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
      <section class="combat-intro"><div><div class="eyebrow">✦ &nbsp; THE GLADE NEEDS YOU</div><h1>Fight as <em>one team.</em></h1><p>Every hero and troop joins the same battle. Watch their attacks flow together.</p></div><div class="combat-wave-pill">⚔️ &nbsp; WAVE <strong id="wave-label">1</strong></div></section>
      <section class="battlefield" aria-label="Idle battle arena"><div class="battlefield-top"><span class="battlefield-kicker" id="battle-biome">🌲 &nbsp; WHISPERING WOODS</span><span class="battle-status" id="battle-status" role="status"><span></span> <b id="battle-status-text">AUTO BATTLE ACTIVE</b></span></div><div class="battle-squad-banner"><div><small>YOUR GARDEN TEAM</small><strong id="squad-banner-count">1 hero ready</strong></div><div class="squad-portraits" id="squad-portraits"></div><span class="team-attack-callout">✦ UNITED ATTACK</span></div><div class="battle-arena"><div class="battle-side legion-side"><div class="battle-side-label">HERO FORMATION</div><div class="battle-figures" id="battle-figures"></div><strong>Garden Team</strong><span id="legion-count"></span></div><div class="battle-center"><span class="battle-spark">✦</span><div class="battle-vs">VS</div><span class="battle-spark">✦</span></div><div class="battle-side enemy-side"><div class="battle-side-label" id="enemy-type"></div><div class="enemy-figure" id="enemy-figure"></div><strong id="enemy-name"></strong><span id="enemy-wave"></span></div></div><div class="battle-bars"><div class="battle-bar-block"><div class="bar-label"><span>💚 &nbsp; Legion health</span><strong id="party-hp-label"></strong></div><div class="health-track"><div class="health-fill party" id="party-hp-fill"></div></div></div><div class="battle-bar-block"><div class="bar-label"><span>❤️ &nbsp; Enemy health</span><strong id="enemy-hp-label"></strong></div><div class="health-track"><div class="health-fill enemy" id="enemy-hp-fill"></div></div></div></div><div class="ult-row"><button id="ult-btn" class="ult-button" disabled title="Unleash Sunlight Burst"><span class="ult-icon">☀️</span><span class="ult-text"><strong>SUNLIGHT BURST</strong><small id="ult-status">Charging (0%)</small></span><span class="ult-tag">2× DMG · HEAL 40%</span></button><div class="ult-progress"><div class="ult-fill" id="ult-fill"></div></div></div><div class="battlefield-bottom"><span>✨ &nbsp; Tap heroes in the garden to harvest bonus leaves! Unleash Sunlight Burst when charged.</span><span id="battle-reward"></span></div></section>
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
  if (resetting || pausedByOtherTab) return;
  state.lastSaved = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* Game remains playable without storage. */ }
  cloudSaver?.schedule(state);
}
// Máy khác vừa lưu bản mới hơn (hay gặp khi đồng hồ máy này chạy chậm): dừng lại như khi bị
// tab khác giành quyền, để không đè lên tiến trình mới đó.
function showNewerElsewhere(reason) {
  if (pausedByOtherTab) return;
  pausedByOtherTab = true;
  document.body.classList.add('paused-by-other-tab');
  const banner = document.createElement('div');
  banner.className = 'tab-paused-banner';
  banner.setAttribute('role', 'alert');
  banner.innerHTML = reason === 'account_changed'
    ? '<strong>You switched Chat accounts.</strong><span>This garden belongs to the previous account, so it stopped saving.</span><button type="button">Open my garden</button>'
    : '<strong>Your garden was saved more recently on another device.</strong><span>This screen is paused so it won\'t overwrite that progress.</span><button type="button">Load latest</button>';
  banner.querySelector('button').addEventListener('click', () => location.reload());
  app.append(banner);
}
function toast(message) {
  const el = document.querySelector('#toast');
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 3000);
}
function getUpgradeCost(hero) { return upgradeCost(hero, state.heroes[hero.id]); }
function getUnitCost(unit) { return unitCost(unit, state.legion[unit.id]); }
function getNextPlotCost() { return nextPlotCost(state.plots); }
function getBoostCost(boost) { return boostCost(boost, state.boosts[boost.id]); }
function applySettings() {
  document.body.classList.toggle('motion-off', !state.settings.motion);
  visuals?.setMotion(state.settings.motion);
  setSoundEnabled(state.settings.sound !== false);
  setVolume(state.settings.volume / 100);
}

function renderNumbers() {
  const currentLps = getLps();
  document.querySelector('#leaf-count').textContent = fmt(state.leaves);
  document.querySelector('#lps-count').textContent = `+${fmtRate(currentLps)} per second`;
  document.querySelector('#garden-output').textContent = `🍃 ${fmtRate(currentLps)} leaves / sec`;
  const gardenCount = `${state.plots} / ${HEROES.length} plots open`;
  if (gardenCount !== lastGardenCount) {
    lastGardenCount = gardenCount;
    document.querySelector('#garden-count').innerHTML = `${icon('grid', 16)} ${gardenCount}`;
  }
  renderHomeNumbers();
}
function renderHomeNumbers() {
  const currentLps = getLps();
  document.querySelector('#home-leaves').textContent = fmt(state.leaves);
  document.querySelector('#home-lps').textContent = `+${fmtRate(currentLps)} / sec`;
  document.querySelector('#home-heroes').textContent = `${Object.keys(state.heroes).length} / ${HEROES.length}`;
  document.querySelector('#home-troops').textContent = fmt(getTroopCount());
  document.querySelector('#home-wave').textContent = state.battle.wave;
  document.querySelector('#home-rate').textContent = fmtRate(currentLps);
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
    return `<button class="plot hero-plot ${hero.color} ${selectedHero === hero.id ? 'selected' : ''}" data-select="${hero.id}" style="--delay:${i * .15}s"><span class="plot-number">PLOT 0${i + 1}</span><span class="hero-level">LVL ${state.heroes[hero.id]}</span><span class="hero-art"><span class="hero-halo"></span><span class="hero-plant">${hero.plant}</span><span class="hero-emoji">${hero.emoji}</span></span><span class="hero-name">${hero.name}</span><span class="hero-output">${icon('leaf', 14)} ${fmtRate(heroLps(state, hero))} / sec</span></button>`;
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
      return `<button class="hero-list-item ${selectedHero === hero.id ? 'active' : ''}" data-select="${hero.id}"><span class="list-avatar ${hero.color}">${heroPortrait(hero)}</span><span class="list-copy"><strong>${hero.name}</strong><small>${owned ? `Level ${state.heroes[hero.id]} · ${fmtRate(heroLps(state, hero))} / sec` : open ? 'Ready to recruit' : 'Unlock the plot first'}</small></span><span class="list-status">${owned ? icon('check', 18) : open ? icon('arrow', 18) : icon('lock', 16)}</span></button>`;
    }).join('')}</div></div>
    <div class="detail-stack"><div class="hero-detail-card ${selected.color}"><span class="detail-tag">${selectedOwned ? 'YOUR GARDEN HERO' : selectedOpen ? 'READY TO RECRUIT' : 'FUTURE GARDEN HERO'}</span><div class="detail-main"><span class="detail-avatar">${heroPortrait(selected)}</span><div><h3>${selected.name}</h3><p>${selected.role}</p><span class="detail-rate">${icon('leaf', 16)} ${fmtRate(selected.baseLps * harvestMultiplier(state))} leaves / sec / level</span></div></div><div class="detail-divider"></div>${selectedOwned ? `<div class="upgrade-row"><div><span class="upgrade-label">CURRENT LEVEL</span><strong>${state.heroes[selected.id]} <span>→ ${state.heroes[selected.id] + 1}</span></strong></div><div><span class="upgrade-label">NEXT HARVEST</span><strong>+${fmtRate((state.heroes[selected.id] + 1) * selected.baseLps * harvestMultiplier(state))} <span>/ sec</span></strong></div></div><button class="primary-button" data-upgrade="${selected.id}" ${state.leaves < getUpgradeCost(selected) ? 'disabled' : ''}>${icon('spark', 18)} Upgrade hero <span>${icon('leaf', 16)} ${fmt(getUpgradeCost(selected))}</span></button>` : `<div class="recruit-copy">${selectedOpen ? 'Add this hero to your garden and start harvesting together.' : 'Open this garden plot to make room for a new hero.'}</div><button class="primary-button" data-recruit="${selected.id}" ${!selectedOpen || state.leaves < selected.unlockCost ? 'disabled' : ''}>${selectedOpen ? `${icon('plus', 18)} Recruit hero <span>${icon('leaf', 16)} ${fmt(selected.unlockCost)}</span>` : `${icon('lock', 18)} Plot locked`}</button>`}</div>
    <div class="plot-upgrade-card"><span class="plot-upgrade-icon">🌷</span><div><strong>Make room to bloom</strong><small>${state.plots < HEROES.length ? `Open plot ${state.plots + 1} to welcome another hero.` : 'Every plot is open. Your garden is full!'}</small></div><button data-plot ${state.plots >= HEROES.length || state.leaves < getNextPlotCost() ? 'disabled' : ''}>${state.plots >= HEROES.length ? 'All open' : `${icon('leaf', 15)} ${fmt(getNextPlotCost())} ${icon('arrow', 15)}`}</button></div></div>
  </div>`;
}
function renderLegion() {
  content.innerHTML = `<div class="legion-intro-card"><div><span class="section-kicker">GROW YOUR GARDEN ARMY</span><h3>Small friends, big courage.</h3><p>Recruit troops to harvest leaves and fight beside your heroes.</p></div><span>🛡️ ${fmt(getTroopCount())} troops</span></div><div class="unit-grid">${UNITS.map(unit => {
    const unlocked = state.plots >= unit.plot;
    return `<article class="unit-card ${unlocked ? '' : 'unit-locked'}"><div class="unit-top"><span class="unit-avatar">${unit.emoji}</span><span class="unit-count">${fmt(state.legion[unit.id])} RECRUITED</span></div><h3>${unit.name}</h3><p>${unit.desc}</p><div class="unit-stats"><span>🍃 +${fmtRate(unit.harvest * harvestMultiplier(state))} / sec</span><span>⚔️ +${fmtRate(unit.power)} power</span><span>💚 +${unit.hp} HP</span></div><button class="primary-button" data-recruit-unit="${unit.id}" ${!unlocked || state.leaves < getUnitCost(unit) ? 'disabled' : ''}>${unlocked ? `Recruit one <span>🍃 ${fmt(getUnitCost(unit))}</span>` : `Open plot ${unit.plot} to unlock`}</button></article>`;
  }).join('')}</div>`;
  content.querySelector('.legion-intro-card > span').textContent = `🛡️ ${fmt(getTroopCount())} troop${getTroopCount() === 1 ? '' : 's'}`;
}
const ACHIEVEMENTS = [
  { icon: '🌱', name: 'First sprout', desc: 'Begin your garden adventure', done: () => true },
  { icon: '🍃', name: 'A handful of leaves', desc: 'Harvest 100 Leaf Points total', done: () => state.totalHarvested >= 100 },
  { icon: '🌹', name: 'Growing together', desc: 'Recruit your second hero', done: () => Object.keys(state.heroes).length >= 2 },
  { icon: '🌷', name: 'Room to bloom', desc: 'Open 3 garden plots', done: () => state.plots >= 3 },
  { icon: '🌳', name: 'A thriving garden', desc: 'Reach 100 leaves per second', done: () => getLps() >= 100 },
  { icon: '☀️', name: 'Full bloom', desc: 'Open all 6 garden plots', done: () => state.plots === HEROES.length },
];
function renderAchievements() {
  const done = ACHIEVEMENTS.filter(a => a.done()).length;
  content.innerHTML = `<div class="subpage-head"><div><h3>Little milestones, big smiles</h3><p>Every leaf is a step toward something lovely.</p></div><span class="achievement-progress">🏆 ${done} / ${ACHIEVEMENTS.length} complete</span></div><div class="achievement-grid">${ACHIEVEMENTS.map(a => `<div class="achievement-card ${a.done() ? 'complete' : ''}"><span class="achievement-icon">${a.icon}</span><div><strong>${a.name}</strong><small>${a.desc}</small></div><span class="achievement-check">${a.done() ? icon('check', 18) : icon('lock', 16)}</span></div>`).join('')}</div>`;
}
function renderStats() {
  content.innerHTML = `<div class="subpage-head"><div><h3>Your garden at a glance</h3><p>Look how far your little world has come.</p></div><span class="achievement-progress">🌿 Always growing</span></div><div class="stats-grid"><div class="stat-card"><span>🍃</span><small>TOTAL LEAVES HARVESTED</small><strong>${fmt(state.totalHarvested)}</strong><p>All those little harvests add up.</p></div><div class="stat-card"><span>⚡</span><small>CURRENT PRODUCTION</small><strong>${fmtRate(getLps())} <em>/ sec</em></strong><p>Your heroes are hard at work.</p></div><div class="stat-card"><span>🦸</span><small>GARDEN HEROES</small><strong>${Object.keys(state.heroes).length} <em>/ ${HEROES.length}</em></strong><p>Friends make the garden brighter.</p></div><div class="stat-card"><span>🌷</span><small>OPEN GARDEN PLOTS</small><strong>${state.plots} <em>/ ${HEROES.length}</em></strong><p>Plenty of room to grow.</p></div></div>`;
}
function renderPanel() {
  if (activeTab === 'heroes') renderHeroes();
  else if (activeTab === 'legion') renderLegion();
  else if (activeTab === 'achievements') renderAchievements();
  else renderStats();
}
function renderCombat() {
  const battle = state.battle;
  const enemy = enemyForWave(battle.wave);
  const biome = biomeForWave(battle.wave);
  const owned = HEROES.filter(hero => state.heroes[hero.id]);
  const biomeEl = document.querySelector('#battle-biome');
  if (biomeEl) {
    biomeEl.innerHTML = `${biome.emoji} &nbsp; ${biome.name.toUpperCase()} <span class="biome-desc">${biome.desc}</span>`;
  }
  document.querySelector('#battle-figures').innerHTML = owned.map(hero => `<span class="battle-hero ${hero.color}" title="${hero.name}">${heroPortrait(hero)}</span>`).join('');
  document.querySelector('#squad-banner-count').textContent = `${owned.length} hero${owned.length === 1 ? '' : 'es'} · ${fmt(getTroopCount())} troops ready`;
  document.querySelector('#squad-portraits').innerHTML = owned.map(hero => `<span title="${hero.name}">${heroPortrait(hero)}</span>`).join('');
  document.querySelector('#legion-count').textContent = `${owned.length} hero${owned.length === 1 ? '' : 'es'} · ${fmt(getTroopCount())} troop${getTroopCount() === 1 ? '' : 's'}`;
  document.querySelector('#enemy-type').textContent = enemy.type.toUpperCase();
  document.querySelector('#enemy-figure').innerHTML = enemy.emoji;
  document.querySelector('#enemy-figure').className = `enemy-figure ${enemy.tint}`;
  document.querySelector('#enemy-name').textContent = enemy.name;
  document.querySelector('#enemy-wave').textContent = battle.wave % 5 === 0 ? 'BOSS WAVE' : `Wave ${battle.wave} enemy`;
  document.querySelector('#legion-badge').textContent = `${owned.length + getTroopCount()} ACTIVE`;
  document.querySelector('#legion-roster').innerHTML = owned.map(hero => `<div class="roster-row"><span class="list-avatar ${hero.color}">${heroPortrait(hero)}</span><div><strong>${hero.name}</strong><small>Level ${state.heroes[hero.id]} · ${fmtRate(heroPower(state, hero))} damage / sec</small></div><span class="roster-ready">● FIGHTING</span></div>`).join('') + UNITS.filter(unit => state.legion[unit.id] > 0).map(unit => `<div class="roster-row"><span class="list-avatar unit-avatar">${unit.emoji}</span><div><strong>${unit.name} × ${fmt(state.legion[unit.id])}</strong><small>${fmtRate(unitPower(state, unit))} damage / sec</small></div><span class="roster-ready">● FIGHTING</span></div>`).join('');
  renderBattleNumbers();
  if (activeScreen === 'combat') visuals?.syncCombat();
}
function renderBattleNumbers() {
  const battle = state.battle;
  const maxEnemy = enemyMaxHp(battle.wave);
  const maxParty = getPartyMaxHp();
  document.querySelector('#wave-label').textContent = battle.wave;
  document.querySelector('#party-hp-label').textContent = `${fmt(battle.partyHp)} / ${fmt(maxParty)}`;
  document.querySelector('#enemy-hp-label').textContent = `${fmt(battle.enemyHp)} / ${fmt(maxEnemy)}`;
  document.querySelector('#party-hp-fill').style.width = `${Math.max(0, Math.min(100, (battle.partyHp / maxParty) * 100))}%`;
  document.querySelector('#enemy-hp-fill').style.width = `${Math.max(0, Math.min(100, (battle.enemyHp / maxEnemy) * 100))}%`;
  document.querySelector('#battle-reward').textContent = `🍃 +${fmt(waveReward(battle.wave, state.equipped, state))} on victory`;
  document.querySelector('#combat-power').textContent = fmtRate(getCombatPower());
  document.querySelector('#waves-cleared').textContent = fmt(battle.wins);
  document.querySelector('#battle-earned').textContent = fmt(battle.earned);
  const stalled = !!battle.stalled;
  document.querySelector('#battle-status').classList.toggle('stalled', stalled);
  document.querySelector('#battle-status-text').textContent = stalled ? 'LEGION TOO WEAK · UPGRADE TO ADVANCE' : 'AUTO BATTLE ACTIVE';

  const ultBtn = document.querySelector('#ult-btn');
  const ultFill = document.querySelector('#ult-fill');
  const ultStatus = document.querySelector('#ult-status');
  if (ultBtn && ultFill) {
    const energy = Math.min(100, Math.max(0, battle.energy || 0));
    ultFill.style.width = `${energy}%`;
    const isUltActive = (battle.ultActiveUntil || 0) > Date.now();
    if (isUltActive) {
      const secLeft = Math.ceil((battle.ultActiveUntil - Date.now()) / 1000);
      ultBtn.classList.add('active');
      ultBtn.disabled = true;
      if (ultStatus) ultStatus.textContent = `BURST ACTIVE (${secLeft}s)`;
    } else {
      ultBtn.classList.remove('active');
      const canUlt = canActivateUltimate(state);
      ultBtn.disabled = !canUlt;
      if (ultStatus) ultStatus.textContent = canUlt ? 'READY TO UNLEASH!' : `Charging (${Math.floor(energy)}%)`;
    }
  }
}
function renderBag() {
  const earned = ACCESSORIES.filter(item => isAccessoryUnlocked(state, item)).length;
  const equipped = ACCESSORIES.find(item => item.id === state.equipped);
  document.querySelector('#bag-content').innerHTML = `<div class="utility-summary"><span class="summary-art">${equipped?.emoji || '🎒'}</span><div><span class="section-kicker">EQUIPPED ACCESSORY</span><h2>${equipped?.name || 'Nothing equipped yet'}</h2><p>${equipped ? equipped.bonus : 'Choose a treasure below to give your legion a boost.'}</p></div><span class="summary-count">${earned} / ${ACCESSORIES.length} found</span></div><div class="utility-section-title"><div><h2>Your collection</h2><p>Battle victories reveal new treasures.</p></div><span>🏆 ${fmt(lifetimeWins(state))} lifetime waves cleared</span></div><div class="accessory-grid">${ACCESSORIES.map(item => {
    const unlocked = isAccessoryUnlocked(state, item);
    const selected = state.equipped === item.id;
    return `<article class="accessory-card ${unlocked ? '' : 'accessory-locked'} ${selected ? 'equipped' : ''}"><span class="accessory-art">${unlocked ? item.emoji : '🔒'}</span><div class="accessory-copy"><span class="accessory-status">${selected ? 'EQUIPPED' : unlocked ? 'FOUND' : `UNLOCK AT ${item.unlockAt} WINS`}</span><h3>${item.name}</h3><p>${item.desc}</p><strong>${item.bonus}</strong></div><button data-equip="${item.id}" ${unlocked ? '' : 'disabled'}>${selected ? 'Unequip' : unlocked ? 'Equip' : 'Locked'}</button></article>`;
  }).join('')}</div>`;
}

let bloomConfirming = false;
function renderUpgrades() {
  const seeds = state.goldenSeeds || 0;
  const canBloom = canBloomAnew(state);
  const seedsPreview = calculateGoldenSeeds(state);

  document.querySelector('#upgrades-content').innerHTML = `
    <div class="upgrades-currency-bar">
      <div class="currency-badge">🍃 <strong id="upgrade-leaves">${fmt(state.leaves)}</strong> <small>Leaves</small></div>
      <div class="currency-badge seeds">🌟 <strong id="upgrade-seeds">${fmt(seeds)}</strong> <small>Golden Seeds</small></div>
    </div>

    <!-- Bloom Anew Prestige Banner -->
    <div class="bloom-card ${canBloom ? '' : 'locked'}">
      <div class="bloom-header">
        <div class="bloom-header-copy">
          <span class="section-kicker">PRESTIGE · TRANSCEND THE GLADE</span>
          <h3>🌸 Bloom Anew</h3>
          <p>${canBloom ? 'Your garden has flourished beyond Wave 25! Transcend now to harvest cosmic Golden Seeds and unlock permanent ancient artifacts that empower your future cycles.' : `Reach Wave 25 to unlock Bloom Anew. Current: Wave ${state.battle.wave} / ${MIN_BLOOM_WAVE}. Keep defending the glade!`}</p>
        </div>
        <div class="bloom-reward-badge">
          <small>CLAIMABLE</small>
          <strong>+${seedsPreview} 🌟</strong>
          <small>SEEDS</small>
        </div>
      </div>
      <div class="bloom-action-row">
        <span class="bloom-note">${canBloom ? '⚠️ Resets heroes, plots, and waves in exchange for permanent Golden Seeds. Artifacts & Bag treasures are kept!' : `Unlocks automatically at Wave ${MIN_BLOOM_WAVE}.`}</span>
        ${canBloom ? (bloomConfirming ? `
          <div class="bloom-confirm-box">
            <button class="bloom-btn" data-bloom-confirm>Yes, Bloom Anew (+${seedsPreview} Seeds)</button>
            <button class="bloom-btn" data-bloom-cancel>Cancel</button>
          </div>
        ` : `
          <button class="bloom-btn" data-bloom-start>🌸 Bloom Anew (+${seedsPreview} Seeds)</button>
        `) : ''}
      </div>
    </div>

    <!-- Ancient Artifacts Section -->
    <div class="utility-section-title">
      <div>
        <h2>🌟 Ancient Artifacts</h2>
        <p>Cosmic relics purchased with Golden Seeds from Bloom Anew. Effects are permanent across all resets.</p>
      </div>
      <span>${Object.values(state.artifacts || {}).reduce((a, b) => a + b, 0)} total levels</span>
    </div>
    <div class="relics-grid">
      ${ARTIFACTS.map(art => {
        const level = state.artifacts[art.id] || 0;
        const cost = artifactCost(art, level);
        const canAfford = (state.goldenSeeds || 0) >= cost;
        const bonusText = artifactBonusText(art, level);
        return `
          <article class="relic-card">
            <div class="relic-top">
              <span class="relic-icon">${art.emoji}</span>
              <span class="relic-level">LVL ${level}</span>
            </div>
            <h3>${art.name}</h3>
            <p>${art.desc}</p>
            <div class="relic-bonus">
              <span>CURRENT BONUS</span>
              <strong>${bonusText}</strong>
            </div>
            <button class="relic-btn" data-artifact="${art.id}" ${canAfford ? '' : 'disabled'}>
              Upgrade <span>🌟 ${fmt(cost)}</span>
            </button>
          </article>
        `;
      }).join('')}
    </div>

    <!-- Leaf Boosts Section -->
    <div class="utility-section-title" style="margin-top: 36px">
      <div>
        <h2>🌿 Permanent Leaf Boosts</h2>
        <p>Spend Leaf Points to improve base garden harvest, damage, and health.</p>
      </div>
    </div>
    <div class="boost-grid">
      ${BOOSTS.map(boost => {
        const level = state.boosts[boost.id];
        const maxed = level >= MAX_BOOST_LEVEL;
        const value = boost.id === 'vitality' ? `+${level * 40} HP` : `+${Math.round(level * (boost.id === 'harvest' ? 25 : 20))}%`;
        return `
          <article class="boost-card ${boost.color}">
            <span class="boost-art">${boost.emoji}</span>
            <span class="boost-level">LVL ${level} / ${MAX_BOOST_LEVEL}</span>
            <h3>${boost.name}</h3>
            <p>${boost.desc}</p>
            <div class="boost-effect">
              <span>CURRENT BONUS</span>
              <strong>${value}</strong>
            </div>
            <button class="primary-button" data-boost="${boost.id}" ${maxed || state.leaves < getBoostCost(boost) ? 'disabled' : ''}>
              ${maxed ? 'Max level' : `Upgrade <span>🍃 ${fmt(getBoostCost(boost))}</span>`}
            </button>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

let resetPending = false;
function renderSettings() {
  document.querySelector('#settings-content').innerHTML = `
    <div class="settings-grid">
      <section class="settings-card">
        <span class="section-kicker">APPEARANCE & AUDIO</span>
        <h2>Display & audio</h2>
        <p>Set the pace and ambiance that feels comfortable for you.</p>
        <div class="setting-row">
          <div><strong>Character animations</strong><small>Gentle movement and battle effects</small></div>
          <button class="toggle ${state.settings.motion ? 'on' : ''}" role="switch" aria-checked="${state.settings.motion}" data-setting="motion" aria-label="Character animations"><span></span></button>
        </div>
        <div class="setting-row">
          <div><strong>Floating harvest text</strong><small>Show Leaf Points and tap crits above heroes</small></div>
          <button class="toggle ${state.settings.floatingText ? 'on' : ''}" role="switch" aria-checked="${state.settings.floatingText}" data-setting="floatingText" aria-label="Floating harvest text"><span></span></button>
        </div>
        <div class="setting-row">
          <div><strong>Sound effects</strong><small>Cozy synth melodies for harvests, attacks, and victories</small></div>
          <button class="toggle ${state.settings.sound ? 'on' : ''}" role="switch" aria-checked="${state.settings.sound}" data-setting="sound" aria-label="Sound effects"><span></span></button>
        </div>
        <div class="setting-row">
          <div><strong>Volume</strong><small id="volume-label">${state.settings.volume}%</small></div>
          <input class="volume-slider" type="range" min="0" max="100" step="5" value="${state.settings.volume}" data-volume aria-label="Sound volume" ${state.settings.sound ? '' : 'disabled'} />
        </div>
      </section>
      <section class="settings-card">
        <span class="section-kicker">PROGRESS</span>
        <h2>Your save</h2>
        <p>${cloud ? 'Your garden saves automatically to your Chat account, so it follows you to any device.' : 'Your garden saves automatically in this browser.'}</p>
        <div class="save-info">${icon('check', 19)} ${cloud ? `Saved to ${escapeHtml(cloud.user.name)}'s account` : 'Local save is active'}</div>
        <button class="settings-action" data-save>Save progress now ${icon('arrow', 16)}</button>
        <div class="settings-divider"></div>
        <h3>Start a new garden</h3>
        <p>This clears your local progress and begins again with Sprout Knight.</p>
        ${resetPending ? `<div class="reset-confirm"><button data-reset-confirm>Yes, reset everything</button><button data-reset-cancel>Cancel</button></div>` : `<button class="reset-button" data-reset>Reset progress</button>`}
      </section>
    </div>
  `;
}
function showScreen(name, updateHistory = true) {
  if (!SCREENS.includes(name)) name = 'home';
  if (name === activeScreen) return;
  activeScreen = name;
  if (updateHistory) history.pushState(null, '', name === 'home' ? location.pathname + location.search : `#${name}`);
  document.querySelectorAll('.screen-link,.dock-link').forEach(button => { const current = button.dataset.screen === name; button.classList.toggle('active', current); if (current) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current'); });
  SCREENS.forEach(screen => { document.querySelector(`#${screen}-screen`).hidden = screen !== name; });
  renderScreen(name);
  visuals?.show(name);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
// Renders only the given screen; hidden screens re-render when shown.
function renderScreen(name) {
  if (name === 'home') renderHome();
  if (name === 'garden') { renderGrid(); renderPanel(); }
  if (name === 'combat') renderCombat();
  if (name === 'bag') renderBag();
  if (name === 'upgrades') renderUpgrades();
  if (name === 'settings') renderSettings();
}
function refresh() { renderNumbers(); renderScreen(activeScreen); }
function renderAll() { renderNumbers(); renderGrid(); renderPanel(); renderCombat(); renderHome(); renderBag(); renderUpgrades(); renderSettings(); }

function floatingHarvest() {
  if (activeScreen !== 'garden' || !state.settings.motion || !state.settings.floatingText) return;
  visuals?.harvest();
  HEROES.forEach(hero => {
    const level = state.heroes[hero.id];
    if (!level) return;
    const plot = grid.querySelector(`[data-select="${hero.id}"]`);
    if (!plot) return;
    const span = document.createElement('span');
    span.className = 'floating-harvest';
    span.textContent = `+${fmtRate(heroLps(state, hero) * 2)} 🍃`;
    span.style.left = `${42 + Math.random() * 18}%`;
    plot.append(span);
    const cleanup = () => span.remove();
    span.addEventListener('animationend', cleanup, { once: true });
    setTimeout(cleanup, 1500);
  });
}

app.addEventListener('click', (event) => {
  const screen = event.target.closest('[data-screen]');
  if (screen) { event.preventDefault(); showScreen(screen.dataset.screen); return; }

  // Ultimate Skill
  if (event.target.closest('#ult-btn')) {
    if (canActivateUltimate(state)) {
      activateUltimate(state);
      playUlt();
      visuals?.triggerUltimate();
      renderBattleNumbers();
      toast('☀️ Sunlight Burst unleashed! Healed party 40% & 2× Combat Power for 8s!');
    }
    return;
  }

  // Prestige: Bloom Anew
  if (event.target.closest('[data-bloom-start]')) {
    bloomConfirming = true;
    renderUpgrades();
    return;
  }
  if (event.target.closest('[data-bloom-cancel]')) {
    bloomConfirming = false;
    renderUpgrades();
    return;
  }
  if (event.target.closest('[data-bloom-confirm]')) {
    bloomConfirming = false;
    if (canBloomAnew(state)) {
      const seeds = bloomAnew(state);
      playBloom();
      save();
      refresh();
      toast(`🌸 Bloomed Anew! You earned ${seeds} Golden Seeds!`);
    }
    return;
  }

  // Ancient Relics Upgrade
  const artBtn = event.target.closest('[data-artifact]');
  if (artBtn) {
    const artId = artBtn.dataset.artifact;
    const art = ARTIFACTS.find(a => a.id === artId);
    if (art) {
      const level = state.artifacts[artId] || 0;
      const cost = artifactCost(art, level);
      if ((state.goldenSeeds || 0) >= cost) {
        state.goldenSeeds -= cost;
        state.artifacts[artId] = level + 1;
        playUpgrade();
        save();
        refresh();
        toast(`${art.name} upgraded to Level ${state.artifacts[artId]}!`);
      }
    }
    return;
  }

  const equip = event.target.closest('[data-equip]');
  if (equip) {
    const item = ACCESSORIES.find(entry => entry.id === equip.dataset.equip);
    if (!isAccessoryUnlocked(state, item)) return;
    state.equipped = state.equipped === item.id ? null : item.id;
    state.battle.partyHp = Math.min(state.battle.partyHp, getPartyMaxHp());
    save(); refresh(); toast(state.equipped ? `${item.name} equipped!` : `${item.name} put away.`);
    return;
  }
  const recruitUnit = event.target.closest('[data-recruit-unit]');
  if (recruitUnit) {
    const unit = UNITS.find(entry => entry.id === recruitUnit.dataset.recruitUnit);
    if (!unit || state.plots < unit.plot || state.leaves < getUnitCost(unit)) return;
    state.leaves -= getUnitCost(unit);
    state.legion[unit.id]++;
    state.battle.partyHp += unit.hp;
    playUpgrade();
    save(); refresh(); toast(`${unit.name} joined your legion!`);
    return;
  }
  const boostButton = event.target.closest('[data-boost]');
  if (boostButton) {
    const boost = BOOSTS.find(entry => entry.id === boostButton.dataset.boost);
    if (!boost || state.boosts[boost.id] >= MAX_BOOST_LEVEL || state.leaves < getBoostCost(boost)) return;
    state.leaves -= getBoostCost(boost);
    state.boosts[boost.id]++;
    if (boost.id === 'vitality') state.battle.partyHp += 40;
    playUpgrade();
    save(); refresh(); toast(`${boost.name} reached level ${state.boosts[boost.id]}!`);
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
  if (event.target.closest('[data-reset-confirm]')) {
    resetting = true;
    localStorage.removeItem(SAVE_KEY);
    const restart = () => { location.href = location.pathname + location.search; };
    // Bản lưu trên server mới hơn ô trống thì lần mở sau sẽ lấy lại vườn cũ — ghi đè nó bằng
    // một vườn mới tinh (đóng dấu thời gian bây giờ) trước khi tải lại.
    if (cloudSaver) {
      cloudSaver.schedule({ ...sanitizeSave(null), lastSaved: Date.now() });
      Promise.resolve(cloudSaver.flush(true)).finally(restart);
    } else restart();
    return;
  }
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
    const heroId = select.dataset.select;
    const selectionChanged = selectedHero !== heroId;
    selectedHero = heroId;

    // Active tap harvest if tapping on an unlocked hero plot
    const hero = HEROES.find(h => h.id === heroId);
    if (hero && state.heroes[heroId] && select.classList.contains('hero-plot')) {
      const { amount, isCrit } = tapHarvestReward(hero, state.heroes[heroId], state);
      state.leaves += amount;
      state.totalHarvested += amount;
      renderNumbers();
      visuals?.tapHero(heroId);
      if (isCrit) playCritTap();
      else playTap();

      if (state.settings.floatingText) {
        const span = document.createElement('span');
        span.className = `floating-harvest ${isCrit ? 'crit-tap' : ''}`;
        span.textContent = `+${fmt(amount)} 🍃${isCrit ? ' 💥 CRIT!' : ''}`;
        span.style.left = `${30 + Math.random() * 30}%`;
        select.append(span);
        const cleanup = () => span.remove();
        span.addEventListener('animationend', cleanup, { once: true });
        setTimeout(cleanup, 1200);
      }
    }

    const tabChanged = activeTab !== 'heroes';
    if (tabChanged) {
      activeTab = 'heroes';
      document.querySelectorAll('.tab').forEach(button => { const on = button.dataset.tab === 'heroes'; button.classList.toggle('active', on); button.setAttribute('aria-selected', String(on)); });
    }
    // Patch the grid in place: rebuilding it would drop the floating text and restart the Phaser sprites mid-tap.
    grid.querySelectorAll('.hero-plot').forEach(plot => plot.classList.toggle('selected', plot.dataset.select === heroId));
    if (selectionChanged || tabChanged) renderPanel();
    return;
  }
  const upgrade = event.target.closest('[data-upgrade]');
  if (upgrade) {
    const hero = HEROES.find(h => h.id === upgrade.dataset.upgrade);
    const cost = getUpgradeCost(hero);
    if (state.leaves < cost) return;
    state.leaves -= cost; state.heroes[hero.id]++; state.battle.partyHp += 10;
    playUpgrade();
    save(); refresh(); toast(`${hero.name} reached level ${state.heroes[hero.id]}!`);
    return;
  }
  const recruit = event.target.closest('[data-recruit]');
  if (recruit) {
    const hero = HEROES.find(h => h.id === recruit.dataset.recruit);
    if (hero.plot >= state.plots || state.heroes[hero.id] || state.leaves < hero.unlockCost) return;
    state.leaves -= hero.unlockCost; state.heroes[hero.id] = 1; state.battle.partyHp += 10;
    playUpgrade();
    save(); refresh(); toast(`${hero.name} joined your garden!`);
    return;
  }
  if (event.target.closest('[data-plot]')) {
    if (state.plots >= HEROES.length || state.leaves < getNextPlotCost()) return;
    state.leaves -= getNextPlotCost(); state.plots++;
    playUpgrade();
    save(); refresh(); toast(`Plot ${state.plots} is ready to grow!`);
  }
});

function tick() {
  if (document.hidden || pausedByOtherTab) return;
  const now = Date.now();
  const dt = Math.min(1, Math.max(0, (now - lastTick) / 1000));
  lastTick = now;
  const gained = getLps() * dt;
  state.leaves += gained;
  state.totalHarvested += gained;
  const waveBefore = state.battle.wave;
  advanceCombat(state, dt);
  renderNumbers();
  if (state.battle.wave !== waveBefore) {
    playVictory();
    if (activeScreen === 'upgrades') renderUpgrades();
  }
  if (activeScreen === 'combat') {
    renderBattleNumbers();
    if (state.battle.wave !== waveBefore) renderCombat();
  } else if (state.battle.wave !== waveBefore && activeScreen === 'bag') {
    renderBag();
  }
  const balance = document.querySelector('#upgrade-leaves');
  if (balance && activeScreen === 'upgrades') balance.textContent = fmt(state.leaves);
  const seedsBalance = document.querySelector('#upgrade-seeds');
  if (seedsBalance && activeScreen === 'upgrades') seedsBalance.textContent = fmt(state.goldenSeeds || 0);

  if (activeScreen === 'upgrades') {
    document.querySelectorAll('[data-boost]').forEach(button => {
      const boost = BOOSTS.find(entry => entry.id === button.dataset.boost);
      button.disabled = state.boosts[boost.id] >= MAX_BOOST_LEVEL || state.leaves < getBoostCost(boost);
    });
    document.querySelectorAll('[data-artifact]').forEach(button => {
      const art = ARTIFACTS.find(entry => entry.id === button.dataset.artifact);
      if (art) {
        const level = state.artifacts[art.id] || 0;
        button.disabled = (state.goldenSeeds || 0) < artifactCost(art, level);
      }
    });
  }
  if (activeScreen === 'garden') {
    if (activeTab === 'heroes') {
      content.querySelectorAll('[data-upgrade]').forEach(button => {
        const hero = HEROES.find(h => h.id === button.dataset.upgrade);
        button.disabled = state.leaves < getUpgradeCost(hero);
      });
      content.querySelectorAll('[data-recruit]').forEach(button => {
        const hero = HEROES.find(h => h.id === button.dataset.recruit);
        button.disabled = hero.plot >= state.plots || state.leaves < hero.unlockCost;
      });
      const plotButton = content.querySelector('[data-plot]');
      if (plotButton) plotButton.disabled = state.plots >= HEROES.length || state.leaves < getNextPlotCost();
    }
    if (activeTab === 'legion') {
      content.querySelectorAll('[data-recruit-unit]').forEach(button => {
        const unit = UNITS.find(entry => entry.id === button.dataset.recruitUnit);
        button.disabled = state.plots < unit.plot || state.leaves < getUnitCost(unit);
      });
    }
    if (now - lastFloat >= 2000) { floatingHarvest(); lastFloat = now; }
  }
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
if (offlineSeconds > 5) toast(`Welcome back! Your heroes gathered ${fmt(offlineGain)} leaves while you were away.`);
setInterval(tick, 100);
setInterval(save, 5000);
document.addEventListener('visibilitychange', () => {
  if (pausedByOtherTab) return;
  if (document.hidden) {
    save();
    cloudSaver?.flush(true);
  } else {
    const now = Date.now();
    const elapsed = Math.min(8 * 60 * 60, Math.max(0, (now - lastTick) / 1000));
    lastTick = now;
    if (elapsed > 0) {
      const gained = catchUp(elapsed);
      save();
      refresh();
      if (elapsed > 5) toast(`Your heroes gathered ${fmt(gained)} leaves while you were away.`);
    }
  }
});
window.addEventListener('pagehide', () => { save(); cloudSaver?.flush(true); });
app.addEventListener('input', (event) => {
  const slider = event.target.closest('[data-volume]');
  if (!slider) return;
  state.settings.volume = Math.max(0, Math.min(100, Number(slider.value) || 0));
  document.querySelector('#volume-label').textContent = `${state.settings.volume}%`;
  applySettings();
});
app.addEventListener('change', (event) => {
  if (!event.target.closest('[data-volume]')) return;
  save();
  playTap();
});
// Another tab took ownership of the save: stop ticking and saving here so it can't overwrite that tab's progress.
window.addEventListener('storage', (event) => {
  if (event.key !== OWNER_KEY || !event.newValue || event.newValue === TAB_ID || pausedByOtherTab) return;
  pausedByOtherTab = true;
  document.body.classList.add('paused-by-other-tab');
  const banner = document.createElement('div');
  banner.className = 'tab-paused-banner';
  banner.setAttribute('role', 'alert');
  banner.innerHTML = '<strong>Your garden is open in another tab.</strong><span>This tab is paused so it won\'t overwrite your progress.</span><button type="button">Play here instead</button>';
  banner.querySelector('button').addEventListener('click', () => location.reload());
  app.append(banner);
});
// Offline support + installability. Dev server skips it so hot reload isn't served stale files.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => { /* offline support is optional */ });
  });
}
