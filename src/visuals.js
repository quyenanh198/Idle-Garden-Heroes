import Phaser from 'phaser';
import { restPose, tapKeyframes } from './tap-pose.js';
import { playHeroAttack, playEnemyAttack, playHit } from './audio.js';
import { combatPower, enemyDamage, enemyForWave, HERO_IMAGES, ENEMY_IMAGES, UNITS } from './game-engine.js';
import { fmt } from './format.js';

const ASSET_BASE = `${import.meta.env.BASE_URL}assets/`;
const assetMap = (images) => Object.fromEntries(Object.entries(images).map(([id, file]) => [id, `${ASSET_BASE}${file}.webp`]));
const HERO_ASSETS = assetMap(HERO_IMAGES);
const HERO_ATTACK_ASSETS = Object.fromEntries(Object.entries(HERO_IMAGES).map(([id, file]) => [id, `${ASSET_BASE}${file}-attack.webp`]));
const ENEMY_ASSETS = assetMap(ENEMY_IMAGES);

function loadImages(scene, prefix, assets) {
  Object.entries(assets).forEach(([id, path]) => {
    if (!scene.textures.exists(`${prefix}-${id}`)) scene.load.image(`${prefix}-${id}`, path);
  });
}

// Short-lived effects (particles, damage text, flashes) are tracked so they can be
// destroyed at once when motion is turned off; otherwise frozen tweens leave them on screen.
function spawnFx(scene, obj, tween) {
  scene.fx.add(obj);
  scene.tweens.add({
    targets: obj,
    ...tween,
    onComplete: () => {
      scene.fx.delete(obj);
      obj.destroy();
      tween.onComplete?.();
    },
  });
  return obj;
}
function clearFx(scene) {
  scene.fx?.forEach(obj => { scene.tweens.killTweensOf(obj); obj.destroy(); });
  scene.fx?.clear();
}

const PALETTES = {
  sprout: { body: 0x6da75c, dark: 0x3e7545, light: 0xb7db78, accent: 0xe6c46b },
  rose: { body: 0xcf7898, dark: 0x945274, light: 0xf4b6c9, accent: 0xffd9a4 },
  oak: { body: 0x8d7354, dark: 0x605a40, light: 0xb5cd78, accent: 0xd9ae6b },
  daisy: { body: 0xe5b964, dark: 0xa88447, light: 0xffe9a5, accent: 0xfff9db },
  moss: { body: 0x74a990, dark: 0x477667, light: 0xb3d5ae, accent: 0xc8e9d2 },
  sunflower: { body: 0xdb9957, dark: 0x9a6c3f, light: 0xf9d46f, accent: 0xffed9c },
};

function ellipse(g, color, x, y, width, height, alpha = 1) {
  g.fillStyle(color, alpha);
  g.fillEllipse(x, y, width, height);
}
function circle(g, color, x, y, radius, alpha = 1) {
  g.fillStyle(color, alpha);
  g.fillCircle(x, y, radius);
}
function rounded(g, color, x, y, width, height, radius = 10, alpha = 1) {
  g.fillStyle(color, alpha);
  g.fillRoundedRect(x, y, width, height, radius);
}

function drawHero(scene, hero, x, y, scale = 1) {
  const texture = `hero-${hero.id}`;
  if (scene.textures.exists(texture)) {
    const sprite = scene.add.image(x, y, texture);
    sprite.heroId = hero.id;
    sprite.setScale((127 * scale) / sprite.height);
    sprite.restPose = { x, y, scaleX: sprite.scaleX, scaleY: sprite.scaleY, angle: 0 };
    sprite.startIdle = () => scene.tweens.add({ targets: sprite, y: y - 6 * scale, angle: hero.plot % 2 ? 2 : -2, duration: 1250 + hero.plot * 130, ease: 'Sine.easeInOut', yoyo: true, repeat: -1, delay: hero.plot * 150 });
    sprite.startIdle();
    return sprite;
  }
  const p = PALETTES[hero.id];
  const group = scene.add.container(x, y);
  group.heroId = hero.id;
  const g = scene.add.graphics();
  group.add(g);
  ellipse(g, 0x486b3b, 0, 43, 72, 13, 0.14);
  ellipse(g, p.light, 0, 7, 67, 79, 0.3);
  rounded(g, p.dark, -24, 20, 48, 23, 9);
  ellipse(g, p.body, 0, 17, 58, 57);
  ellipse(g, 0xf8d9b7, 0, -15, 43, 41);
  ellipse(g, 0xffffff, -8, -17, 6, 7);
  ellipse(g, 0xffffff, 8, -17, 6, 7);
  circle(g, 0x384b3c, -7, -16, 2);
  circle(g, 0x384b3c, 9, -16, 2);
  ellipse(g, 0xe68d8f, -17, -7, 8, 4, 0.65);
  ellipse(g, 0xe68d8f, 17, -7, 8, 4, 0.65);
  g.lineStyle(2, 0x936c64, 0.8);
  g.beginPath(); g.arc(1, -5, 5, 0.1, Math.PI - 0.1); g.strokePath();

  if (hero.id === 'sprout') {
    ellipse(g, p.light, -15, -41, 32, 17); ellipse(g, p.body, 14, -44, 36, 18);
    rounded(g, p.dark, -25, -29, 50, 10, 5);
    circle(g, p.accent, 29, 24, 14); circle(g, 0xf5e8b0, 29, 24, 10);
    g.lineStyle(3, p.dark); g.lineBetween(29, 16, 29, 31); g.lineBetween(22, 24, 36, 24);
  } else if (hero.id === 'rose') {
    for (let i = 0; i < 5; i++) {
      const angle = i * Math.PI * 2 / 5 - Math.PI / 2;
      ellipse(g, p.light, Math.cos(angle) * 18, -43 + Math.sin(angle) * 14, 24, 16);
    }
    circle(g, p.body, 0, -43, 14);
    g.lineStyle(4, p.dark); g.lineBetween(32, 38, 34, -37);
    circle(g, p.accent, 34, -41, 10);
  } else if (hero.id === 'oak') {
    rounded(g, p.dark, -23, -44, 46, 15, 7);
    ellipse(g, p.light, -12, -50, 28, 25); ellipse(g, p.body, 11, -51, 31, 24);
    g.lineStyle(5, p.dark); g.lineBetween(31, 38, 31, -31);
    ellipse(g, p.accent, 31, -32, 23, 16);
  } else if (hero.id === 'daisy') {
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4;
      ellipse(g, 0xfff8db, Math.cos(angle) * 19, -42 + Math.sin(angle) * 18, 21, 14);
    }
    circle(g, p.accent, 0, -42, 15);
    circle(g, 0xd7a054, 30, 3, 5);
    g.lineStyle(2, 0xd7a054); g.lineBetween(31, 5, 31, 23);
  } else if (hero.id === 'moss') {
    ellipse(g, p.light, -18, -42, 29, 20); ellipse(g, p.body, 15, -43, 32, 20);
    rounded(g, 0x8ba79a, -27, -31, 54, 13, 6);
    circle(g, 0xc1dfc2, 32, 21, 16);
    circle(g, 0xf0fff0, 32, 21, 7);
  } else {
    for (let i = 0; i < 10; i++) {
      const angle = i * Math.PI / 5;
      ellipse(g, p.light, Math.cos(angle) * 22, -43 + Math.sin(angle) * 20, 22, 13);
    }
    circle(g, p.dark, 0, -43, 17);
    circle(g, p.accent, 34, 17, 10);
  }
  group.setScale(scale);
  group.restPose = { x, y, scaleX: scale, scaleY: scale, angle: 0 };
  group.startIdle = () => scene.tweens.add({ targets: group, y: y - 5 * scale, scaleX: scale * 1.025, scaleY: scale * 1.025, duration: 1300 + hero.plot * 130, ease: 'Sine.easeInOut', yoyo: true, repeat: -1, delay: hero.plot * 150 });
  group.startIdle();
  return group;
}

function drawCombatHero(scene, hero, x, y, scale = 1) {
  const idleKey = `hero-${hero.id}`;
  const attackKey = `hero-attack-${hero.id}`;
  if (!scene.textures.exists(idleKey) || !scene.textures.exists(attackKey)) return drawHero(scene, hero, x, y, scale);
  const fighter = scene.add.container(x, y);
  fighter.heroId = hero.id;
  fighter.baseX = x;
  fighter.baseY = y;
  const shadow = scene.add.ellipse(0, 62 * scale, 86 * scale, 15 * scale, 0x345039, 0.18);
  const idleArt = scene.add.image(0, 0, idleKey).setScale((145 * scale) / scene.textures.get(idleKey).getSourceImage().height);
  const attackArt = scene.add.image(0, 0, attackKey).setScale((145 * scale) / scene.textures.get(attackKey).getSourceImage().height).setAlpha(0);
  fighter.add([shadow, idleArt, attackArt]);
  fighter.idleArt = idleArt;
  fighter.attackArt = attackArt;
  scene.tweens.add({ targets: fighter, y: y - 5 * scale, angle: hero.plot % 2 ? 1.4 : -1.4, duration: 1100 + hero.plot * 120, ease: 'Sine.easeInOut', yoyo: true, repeat: -1, delay: hero.plot * 110 });
  return fighter;
}

function playCombatPose(scene, fighter) {
  if (!fighter?.active || !fighter.attackArt || fighter.striking) return;
  fighter.striking = true;
  scene.tweens.add({ targets: fighter.idleArt, alpha: 0, duration: 75, yoyo: true, hold: 170 });
  scene.tweens.add({ targets: fighter.attackArt, alpha: 1, duration: 75, yoyo: true, hold: 170 });
  scene.tweens.add({ targets: fighter, x: fighter.baseX + 20, scaleX: 1.08, scaleY: 0.95, duration: 125, ease: 'Quad.easeOut', yoyo: true, hold: 45, onComplete: () => { fighter.striking = false; } });
}

function drawEnemy(scene, type, x, y) {
  const texture = `enemy-${type}`;
  if (scene.textures.exists(texture)) {
    const sprite = scene.add.image(x, y, texture);
    sprite.setScale((153 * (type === 'boss' ? 1.13 : 1)) / sprite.height);
    sprite.restPose = { x, y, scaleX: sprite.scaleX, scaleY: sprite.scaleY, angle: 0 };
    scene.tweens.add({ targets: sprite, y: y - 7, angle: 2, duration: 1450, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
    return sprite;
  }
  const group = scene.add.container(x, y);
  const g = scene.add.graphics();
  group.add(g);
  ellipse(g, 0x6e6b51, 0, 58, 100, 16, 0.16);
  if (type === 'mushroom') {
    rounded(g, 0xe9bfa2, -26, -8, 52, 61, 19);
    ellipse(g, 0xf5d2b8, 0, 18, 49, 57);
    ellipse(g, 0xc96875, 0, -25, 102, 68);
    ellipse(g, 0xe58d92, 0, -31, 89, 52);
    circle(g, 0xffe5de, -27, -38, 10); circle(g, 0xffe5de, 16, -50, 14); circle(g, 0xffe5de, 32, -24, 7);
  } else if (type === 'bramble') {
    ellipse(g, 0x6f9e68, 0, 4, 90, 100);
    ellipse(g, 0x9cbe76, -16, -14, 45, 64);
    g.fillStyle(0x6d9c62); g.fillTriangle(-37, -18, -55, -31, -40, -3); g.fillTriangle(34, 8, 51, -3, 38, 23);
    g.fillTriangle(-12, -39, -5, -61, 3, -40);
  } else if (type === 'slime') {
    ellipse(g, 0x7fbe8d, 0, 14, 102, 84);
    ellipse(g, 0xabe0a8, -13, -9, 68, 48);
    ellipse(g, 0xd5f3cb, -22, -24, 20, 10, 0.6);
  } else if (type === 'wasp') {
    ellipse(g, 0xe6e9d5, -26, -28, 51, 37, 0.9); ellipse(g, 0xe6e9d5, 25, -28, 51, 37, 0.9);
    ellipse(g, 0xe9b956, 0, 8, 78, 88);
    rounded(g, 0x665d42, -35, -2, 70, 12, 4); rounded(g, 0x665d42, -29, 26, 58, 10, 4);
    g.fillStyle(0x665d42); g.fillTriangle(-12, 49, 12, 49, 0, 64);
  } else {
    rounded(g, 0x8d7965, -42, -48, 84, 105, 22);
    ellipse(g, 0x6f6556, 0, -45, 92, 29);
    ellipse(g, 0xa3ba78, -25, -50, 46, 25); ellipse(g, 0x8faf77, 25, -54, 46, 24);
    g.lineStyle(4, 0x6f6556); g.lineBetween(-23, -18, -23, 43); g.lineBetween(26, -18, 26, 43);
  }
  ellipse(g, 0xffffff, -16, 1, 12, 15); ellipse(g, 0xffffff, 16, 1, 12, 15);
  circle(g, 0x394638, -15, 3, 4); circle(g, 0x394638, 17, 3, 4);
  g.lineStyle(2, 0x734e4e); g.lineBetween(-5, 23, 5, 23);
  group.restPose = { x, y, scaleX: group.scaleX, scaleY: group.scaleY, angle: 0 };
  scene.tweens.add({ targets: group, y: y - 7, angle: 2, duration: 1450, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
  return group;
}

export function initVisuals({ heroes, getState, getScreen, getMotion }) {
  const gardenParent = document.querySelector('#garden-grid');
  const combatParent = document.querySelector('.battle-arena');
  const parents = { garden: gardenParent, combat: combatParent };
  const fallbackSize = { garden: [800, 250], combat: [800, 300] };
  const scenes = {};
  const requested = new Set(['garden']);
  const canAnimate = () => getMotion();
  const isStalled = () => !!getState()?.battle?.stalled;

  const positionIn = (element, parent) => {
    const a = element.getBoundingClientRect();
    const b = parent.getBoundingClientRect();
    return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2 };
  };

  class GardenScene extends Phaser.Scene {
    constructor() { super({ key: 'garden', active: true }); }
    preload() { loadImages(this, 'hero', HERO_ASSETS); }
    create() {
      scenes.garden = this;
      this.characters = new Map();
      this.fx = new Set();
      document.body.classList.add('phaser-garden-ready');
      this.tweens.timeScale = getMotion() ? 1 : 0;
      this.time.timeScale = getMotion() ? 1 : 0;
      if (getScreen() !== 'garden') this.scene.sleep();
      else this.sync();
    }
    sync() {
      if (getScreen() !== 'garden' || !gardenParent.clientWidth) return;
      this.characters.forEach(character => { this.tweens.killTweensOf(character); character.destroy(); });
      this.characters.clear();
      heroes.forEach(hero => {
        if (!getState().heroes[hero.id]) return;
        const art = gardenParent.querySelector(`[data-select="${hero.id}"] .hero-art`);
        if (!art || !art.clientWidth) return;
        const { x, y } = positionIn(art, gardenParent);
        const sprite = drawHero(this, hero, x, y + 4, Math.min(0.83, art.clientWidth / 120));
        this.characters.set(hero.id, sprite);
      });
    }
    harvest() {
      if (!canAnimate()) return;
      this.characters.forEach(character => {
        for (let i = 0; i < 3; i++) {
          const leaf = this.add.ellipse(character.x + Phaser.Math.Between(-18, 18), character.y - 8, 10, 6, 0x91c96c).setRotation(-0.6);
          spawnFx(this, leaf, { x: leaf.x + Phaser.Math.Between(-23, 23), y: leaf.y - Phaser.Math.Between(35, 65), alpha: 0, angle: Phaser.Math.Between(-80, 80), duration: 850 + i * 100 });
        }
      });
    }
    tapHero(heroId) {
      if (!canAnimate()) return;
      const sprite = this.characters.get(heroId);
      if (!sprite || !sprite.active) return;
      const rest = restPose(sprite);
      this.tweens.killTweensOf(sprite);
      // killTweensOf dừng tween ngay tại chỗ: đưa về dáng đứng yên trước khi nhún tiếp,
      // không thì cú chạm này lấy dáng đang bẹp của cú trước làm gốc (xem tap-pose.js).
      sprite.setPosition(rest.x, rest.y);
      sprite.setScale(rest.scaleX, rest.scaleY);
      sprite.setAngle(rest.angle);
      const origX = rest.x;
      const origY = rest.y;
      const { squash, stretch } = tapKeyframes(rest);
      this.tweens.add({
        targets: sprite,
        ...squash,
        duration: 90,
        yoyo: true,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: sprite,
            ...stretch,
            duration: 110,
            yoyo: true,
            ease: 'Sine.easeInOut',
            // killTweensOf ở trên cũng giết luôn nhịp thở lúc đứng yên — bật lại sau khi nhún xong.
            onComplete: () => sprite.startIdle?.(),
          });
        },
      });
      // Burst of colorful heart and leaf particles
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const dist = Phaser.Math.Between(30, 52);
        const particle = this.add.ellipse(origX, origY - 12, 8, 5, i % 2 ? 0x95d66b : 0xf7b3c2);
        spawnFx(this, particle, {
          x: origX + Math.cos(angle) * dist,
          y: origY - 22 + Math.sin(angle) * dist,
          alpha: 0,
          scale: 0.3,
          duration: 500,
          ease: 'Quad.easeOut',
        });
      }
    }
  }

  class CombatScene extends Phaser.Scene {
    constructor() { super({ key: 'combat', active: false }); }
    preload() {
      loadImages(this, 'hero', HERO_ASSETS);
      loadImages(this, 'hero-attack', HERO_ATTACK_ASSETS);
      loadImages(this, 'enemy', ENEMY_ASSETS);
    }
    create() {
      scenes.combat = this;
      this.characters = [];
      this.fx = new Set();
      document.body.classList.add('phaser-combat-ready');
      this.sync();
      this.time.addEvent({ delay: 850, loop: true, callback: () => this.attack() });
      this.time.addEvent({ delay: 1700, loop: true, callback: () => this.enemyAttack() });
      this.tweens.timeScale = getMotion() ? 1 : 0;
      this.time.timeScale = getMotion() ? 1 : 0;
    }
    sync() {
      if (getScreen() !== 'combat' || !combatParent.clientWidth) return;
      this.characters.forEach(character => { this.tweens.killTweensOf([character, character.idleArt, character.attackArt].filter(Boolean)); character.destroy(); });
      this.characters = [];
      if (this.enemy) { this.tweens.killTweensOf(this.enemy); this.enemy.destroy(); }
      const state = getState();
      const owned = heroes.filter(hero => state.heroes[hero.id]);
      const legionBox = combatParent.querySelector('#battle-figures');
      const enemyBox = combatParent.querySelector('#enemy-figure');
      if (!legionBox || !enemyBox) return;
      const legion = positionIn(legionBox, combatParent);
      const enemy = positionIn(enemyBox, combatParent);
      const compact = combatParent.clientWidth < 650;
      const formationWidth = legionBox.clientWidth;
      const formationHeight = legionBox.clientHeight;
      const columns = Math.min(owned.length, 3);
      owned.forEach((hero, i) => {
        const row = Math.floor(i / columns);
        const countInRow = Math.min(columns, owned.length - row * columns);
        const column = i % columns;
        const x = legion.x + (column - (countInRow - 1) / 2) * Math.min(compact ? 68 : 112, formationWidth / Math.max(1, columns));
        const y = legion.y + (owned.length > 3 ? (row - 0.5) * Math.min(78, formationHeight * 0.34) : 0);
        const scale = owned.length > 3 ? (compact ? 0.64 : 0.86) : owned.length > 1 ? (compact ? 0.75 : 1.05) : (compact ? 0.96 : 1.24);
        this.characters.push(drawCombatHero(this, hero, x, y, scale));
      });
      const troops = UNITS.filter(unit => state.legion?.[unit.id] > 0);
      troops.forEach((unit, i) => {
        const x = legion.x + (i - (troops.length - 1) / 2) * (compact ? 40 : 58);
        const y = legion.y + formationHeight * 0.39;
        const sprite = this.add.container(x, y);
        const orb = this.add.circle(0, 0, 16, 0xf7fbea, 0.95).setStrokeStyle(2, 0xa9cf91);
        const symbol = this.add.text(0, -2, unit.emoji, { fontSize: '23px' }).setOrigin(.5);
        const count = this.add.text(12, 14, `×${fmt(state.legion[unit.id])}`, { fontFamily: 'Arial', fontSize: '10px', fontStyle: 'bold', color: '#315c39', backgroundColor: '#ffffff' }).setOrigin(.5);
        sprite.add([orb, symbol, count]);
        this.tweens.add({ targets: sprite, y: y - 4, duration: 1000 + i * 170, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
        this.characters.push(sprite);
      });
      this.enemy = drawEnemy(this, enemyForWave(state.battle.wave).tint, enemy.x, enemy.y);
    }
    showDamage(text, isCrit = false, isParty = false) {
      if (getScreen() !== 'combat' || !canAnimate()) return;
      if (isCrit && !isParty) {
        this.cameras.main.shake(85, 0.0025);
        this.cameras.main.flash(70, 255, 229, 142);
        if (!this.hitStopTimer) {
          this.tweens.timeScale = 0.08;
          this.time.timeScale = 0.08;
          this.hitStopTimer = window.setTimeout(() => {
            this.hitStopTimer = null;
            if (canAnimate()) { this.tweens.timeScale = 1; this.time.timeScale = 1; }
          }, 65);
        }
      }
      const targetX = isParty ? (this.characters[0]?.x || 160) : (this.enemy?.x || 500);
      const targetY = isParty ? (this.characters[0]?.y || 140) - 25 : (this.enemy?.y || 135) - 40;
      const color = isParty ? '#f57474' : (isCrit ? '#ffde59' : '#ffffff');
      const stroke = isParty ? '#661f1f' : '#2d4b26';
      const txt = this.add.text(targetX + Phaser.Math.Between(-18, 18), targetY + Phaser.Math.Between(-10, 10), text, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: isCrit ? '20px' : '14px',
        fontStyle: 'bold',
        color,
        stroke,
        strokeThickness: 3,
      }).setOrigin(0.5);

      spawnFx(this, txt, {
        y: txt.y - (isCrit ? 42 : 30),
        scaleX: isCrit ? 1.2 : 1.05,
        scaleY: isCrit ? 1.2 : 1.05,
        alpha: 0,
        duration: isCrit ? 800 : 650,
        ease: 'Cubic.easeOut',
      });
    }
    attack() {
      if (getScreen() !== 'combat' || !canAnimate() || isStalled() || !this.enemy || !this.characters.length) return;
      const fighters = this.characters.filter(character => character.active && Number.isFinite(character.x) && Number.isFinite(character.y));
      if (!fighters.length) return;
      const lead = fighters.find(character => character.heroId);
      if (lead) playHeroAttack(lead.heroId);
      const colors = { sprout: 0x74c25a, rose: 0xf58da8, oak: 0xb58c5c, daisy: 0xffe277, moss: 0x77baa1, sunflower: 0xffce48 };
      const visible = fighters.slice(0, 9);
      visible.forEach((source, index) => {
        this.time.delayedCall(index * 65, () => {
          if (!source.active || !this.enemy?.active || getScreen() !== 'combat' || isStalled()) return;
          playCombatPose(this, source);
          const projColor = colors[source.heroId] || 0xf8d77a;
          const spark = this.add.ellipse(source.x + 15, source.y - 12, 16, 9, projColor).setRotation(-0.6);
          spawnFx(this, spark, { x: this.enemy.x - 17 + Phaser.Math.Between(-12, 12), y: this.enemy.y - 6 + Phaser.Math.Between(-15, 15), rotation: 4, duration: 280 + index * 15, ease: 'Sine.easeIn', onComplete: () => {
            if (!this.enemy?.active || getScreen() !== 'combat') return;
            if (index === visible.length - 1) {
              playHit();
              const isCrit = Math.random() < 0.15;
              const dmg = Math.max(1, Math.round(combatPower(getState()) * 0.8 * (isCrit ? 2 : 1)));
              this.showDamage(fmt(dmg), isCrit, false);
            }
            const target = this.enemy;
            const rest = restPose(target);
            this.tweens.add({ targets: target, scaleX: rest.scaleX * 1.05, scaleY: rest.scaleY * 0.96, duration: 80, yoyo: true,
              onComplete: () => { if (target.active) target.setScale(rest.scaleX, rest.scaleY); } });
            for (let i = 0; i < 3; i++) {
              const particle = this.add.circle(this.enemy.x, this.enemy.y - 8, Phaser.Math.Between(2, 5), i % 2 ? 0xf0c879 : projColor);
              spawnFx(this, particle, { x: particle.x + Phaser.Math.Between(-30, 30), y: particle.y + Phaser.Math.Between(-26, 24), alpha: 0, duration: 360 });
            }
          } });
        });
      });
    }
    enemyAttack() {
      if (getScreen() !== 'combat' || !canAnimate() || isStalled() || !this.enemy || !this.characters.length) return;
      playEnemyAttack();
      const origX = this.enemy.x;
      this.tweens.add({
        targets: this.enemy,
        x: origX - 25,
        angle: -4,
        duration: 110,
        yoyo: true,
        ease: 'Quad.easeInOut',
      });
      const target = this.characters[Phaser.Math.Between(0, this.characters.length - 1)];
      if (!target) return;
      const spore = this.add.circle(this.enemy.x - 20, this.enemy.y, 7, 0x8a554a);
      spawnFx(this, spore, {
        x: target.x + 15,
        y: target.y,
        duration: 320,
        ease: 'Sine.easeIn',
        onComplete: () => {
          playHit();
          const wave = getState()?.battle?.wave || 1;
          const dmg = Math.max(1, Math.round(enemyDamage(wave)));
          this.showDamage(fmt(dmg), false, true);

          if (!target.active) return;
          this.tweens.add({ targets: target, x: target.x - 5, duration: 80, yoyo: true });
        },
      });
    }
    triggerUltimate() {
      if (getScreen() !== 'combat' || !canAnimate()) return;
      const width = combatParent.clientWidth || 800;
      const height = combatParent.clientHeight || 300;
      const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xfff9db, 0.6);
      spawnFx(this, flash, { alpha: 0, duration: 550 });

      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const dist = Phaser.Math.Between(70, 200);
        const p = this.add.circle(width / 2, height / 2, Phaser.Math.Between(4, 9), i % 2 ? 0xffdf6d : 0xffffff);
        spawnFx(this, p, {
          x: width / 2 + Math.cos(angle) * dist,
          y: height / 2 + Math.sin(angle) * dist,
          alpha: 0,
          scale: 0.2,
          duration: 750,
          ease: 'Quad.easeOut',
        });
      }
    }
  }

  // One Phaser game drives both screens; its canvas moves to whichever screen is visible.
  const [initialWidth, initialHeight] = fallbackSize.garden;
  const game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent: gardenParent,
    width: gardenParent.clientWidth || initialWidth,
    height: gardenParent.clientHeight || initialHeight,
    transparent: true,
    scene: [GardenScene, CombatScene],
    audio: { noAudio: true },
    banner: false,
    render: { antialias: true },
  });

  // Re-attach the canvas if a render replaced the parent's innerHTML, then fit it to the parent.
  const attachTo = (screen) => {
    const parent = parents[screen];
    if (!parent || !game.canvas) return false;
    if (game.canvas.parentElement !== parent) parent.appendChild(game.canvas);
    const [w, h] = fallbackSize[screen];
    game.scale.resize(parent.clientWidth || w, parent.clientHeight || h);
    return true;
  };

  const sleepScene = (key) => {
    if (game.scene.isActive(key) || game.scene.isPaused(key)) game.scene.sleep(key);
  };

  const show = (screen) => {
    if (!game.isBooted) { game.events.once('ready', () => show(getScreen())); return; }
    if (!parents[screen]) { sleepScene('garden'); sleepScene('combat'); return; }
    sleepScene(screen === 'garden' ? 'combat' : 'garden');
    requestAnimationFrame(() => {
      if (getScreen() !== screen) return;
      attachTo(screen);
      if (!requested.has(screen)) {
        requested.add(screen);
        game.scene.start(screen);
        return;
      }
      if (game.scene.isSleeping(screen)) game.scene.wake(screen);
      scenes[screen]?.sync();
    });
  };

  const resize = () => {
    const screen = getScreen();
    if (!parents[screen] || !parents[screen].clientWidth) return;
    if (attachTo(screen)) scenes[screen]?.sync();
  };
  const observer = new ResizeObserver(() => requestAnimationFrame(resize));
  observer.observe(gardenParent);
  observer.observe(combatParent);

  const syncScreen = (screen) => requestAnimationFrame(() => {
    if (getScreen() !== screen) return;
    attachTo(screen);
    scenes[screen]?.sync();
  });

  const api = {
    syncGarden: () => syncScreen('garden'),
    syncCombat: () => syncScreen('combat'),
    harvest: () => scenes.garden?.harvest(),
    tapHero: (heroId) => scenes.garden?.tapHero(heroId),
    showCombatDamage: (text, isCrit, isParty) => scenes.combat?.showDamage(text, isCrit, isParty),
    triggerUltimate: () => scenes.combat?.triggerUltimate(),
    setMotion: (enabled) => {
      Object.values(scenes).forEach(scene => {
        scene.tweens.timeScale = enabled ? 1 : 0;
        scene.time.timeScale = enabled ? 1 : 0;
        if (!enabled) clearFx(scene);
      });
      // Redraw so sprites caught mid-squash return to their resting pose.
      if (!enabled && scenes[getScreen()]) scenes[getScreen()].sync();
    },
    show,
  };
  if (getScreen() !== 'garden') requestAnimationFrame(() => show(getScreen()));
  return api;
}
