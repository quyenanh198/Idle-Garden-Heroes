import Phaser from 'phaser';
import { playHeroAttack, playEnemyAttack, playHit } from './audio.js';
import { combatPower, enemyDamage } from './game-engine.js';

const fmt = (n) => !Number.isFinite(n) || n < 0 ? '0' : n >= 1e9 ? `${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e4 ? `${(n / 1e3).toFixed(1)}K` : Math.floor(n).toLocaleString();

const HERO_ASSETS = {
  sprout: '/assets/sprout-knight.webp', rose: '/assets/rose-mage.webp', oak: '/assets/oak-sentinel.webp',
  daisy: '/assets/daisy-dancer.webp', moss: '/assets/moss-golem.webp', sunflower: '/assets/sunflower-sage.webp',
};
const ENEMY_ASSETS = {
  mushroom: '/assets/grumpy-mushroom.webp', bramble: '/assets/thorny-bramble.webp', slime: '/assets/slime-sprig.webp',
  wasp: '/assets/wild-wasp.webp', boss: '/assets/shadow-stump.webp',
};

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
    scene.tweens.add({ targets: sprite, y: y - 6 * scale, angle: hero.plot % 2 ? 2 : -2, duration: 1250 + hero.plot * 130, ease: 'Sine.easeInOut', yoyo: true, repeat: -1, delay: hero.plot * 150 });
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
  scene.tweens.add({ targets: group, y: y - 5 * scale, scaleX: scale * 1.025, scaleY: scale * 1.025, duration: 1300 + hero.plot * 130, ease: 'Sine.easeInOut', yoyo: true, repeat: -1, delay: hero.plot * 150 });
  return group;
}

function drawEnemy(scene, type, x, y) {
  const texture = `enemy-${type}`;
  if (scene.textures.exists(texture)) {
    const sprite = scene.add.image(x, y, texture);
    sprite.setScale((153 * (type === 'boss' ? 1.13 : 1)) / sprite.height);
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
  scene.tweens.add({ targets: group, y: y - 7, angle: 2, duration: 1450, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
  return group;
}

export function initVisuals({ heroes, getState, getScreen, getMotion }) {
  const gardenParent = document.querySelector('#garden-grid');
  const combatParent = document.querySelector('.battle-arena');
  let gardenScene;
  let combatScene;
  let combatGame;

  const positionIn = (element, parent) => {
    const a = element.getBoundingClientRect();
    const b = parent.getBoundingClientRect();
    return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2 };
  };

  class GardenScene extends Phaser.Scene {
    constructor() { super('garden'); }
    preload() { Object.entries(HERO_ASSETS).forEach(([id, path]) => this.load.image(`hero-${id}`, path)); }
    create() {
      gardenScene = this;
      this.characters = new Map();
      document.body.classList.add('phaser-garden-ready');
      this.sync();
      this.tweens.timeScale = getMotion() ? 1 : 0;
      this.time.timeScale = getMotion() ? 1 : 0;
      if (getScreen() !== 'garden') this.scene.pause();
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
      this.characters.forEach(character => {
        for (let i = 0; i < 3; i++) {
          const leaf = this.add.ellipse(character.x + Phaser.Math.Between(-18, 18), character.y - 8, 10, 6, 0x91c96c).setRotation(-0.6);
          this.tweens.add({ targets: leaf, x: leaf.x + Phaser.Math.Between(-23, 23), y: leaf.y - Phaser.Math.Between(35, 65), alpha: 0, angle: Phaser.Math.Between(-80, 80), duration: 850 + i * 100, onComplete: () => leaf.destroy() });
        }
      });
    }
    tapHero(heroId) {
      const sprite = this.characters.get(heroId);
      if (!sprite || !sprite.active) return;
      this.tweens.killTweensOf(sprite);
      const origX = sprite.x;
      const origY = sprite.y;
      this.tweens.add({
        targets: sprite,
        scaleX: sprite.scaleX * 1.25,
        scaleY: sprite.scaleY * 0.78,
        y: origY + 4,
        duration: 90,
        yoyo: true,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: sprite,
            scaleX: sprite.scaleX * 0.96,
            scaleY: sprite.scaleY * 1.12,
            y: origY - 6,
            duration: 110,
            yoyo: true,
            ease: 'Sine.easeInOut',
          });
        },
      });
      // Burst of colorful heart and leaf particles
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const dist = Phaser.Math.Between(30, 52);
        const particle = this.add.ellipse(origX, origY - 12, 8, 5, i % 2 ? 0x95d66b : 0xf7b3c2);
        this.tweens.add({
          targets: particle,
          x: origX + Math.cos(angle) * dist,
          y: origY - 22 + Math.sin(angle) * dist,
          alpha: 0,
          scale: 0.3,
          duration: 500,
          ease: 'Quad.easeOut',
          onComplete: () => particle.destroy(),
        });
      }
    }
  }

  class CombatScene extends Phaser.Scene {
    constructor() { super('combat'); }
    preload() {
      Object.entries(HERO_ASSETS).forEach(([id, path]) => this.load.image(`hero-${id}`, path));
      Object.entries(ENEMY_ASSETS).forEach(([id, path]) => this.load.image(`enemy-${id}`, path));
    }
    create() {
      combatScene = this;
      this.characters = [];
      document.body.classList.add('phaser-combat-ready');
      this.sync();
      this.time.addEvent({ delay: 850, loop: true, callback: () => this.attack() });
      this.time.addEvent({ delay: 1700, loop: true, callback: () => this.enemyAttack() });
      this.tweens.timeScale = getMotion() ? 1 : 0;
      this.time.timeScale = getMotion() ? 1 : 0;
    }
    sync() {
      if (getScreen() !== 'combat' || !combatParent.clientWidth) return;
      this.characters.forEach(character => { this.tweens.killTweensOf(character); character.destroy(); });
      this.characters = [];
      if (this.enemy) { this.tweens.killTweensOf(this.enemy); this.enemy.destroy(); }
      const state = getState();
      const owned = heroes.filter(hero => state.heroes[hero.id]);
      const legionBox = combatParent.querySelector('#battle-figures');
      const enemyBox = combatParent.querySelector('#enemy-figure');
      if (!legionBox || !enemyBox) return;
      const legion = positionIn(legionBox, combatParent);
      const enemy = positionIn(enemyBox, combatParent);
      owned.forEach((hero, i) => {
        const compact = combatParent.clientWidth < 550;
        const columns = owned.length <= 2 ? owned.length : 3;
        const row = Math.floor(i / columns);
        const countInRow = Math.min(columns, owned.length - row * columns);
        const column = i % columns;
        const spread = compact ? 43 : 65;
        const x = legion.x + (column - (countInRow - 1) / 2) * spread;
        const y = legion.y + (owned.length > 3 ? (row - 0.5) * (compact ? 42 : 49) : 0);
        const scale = owned.length > 3 ? (compact ? 0.5 : 0.68) : owned.length > 1 ? (compact ? 0.64 : 0.8) : 0.9;
        this.characters.push(drawHero(this, hero, x, y, scale));
      });
      const troops = [
        { id: 'scout', emoji: '🌱' }, { id: 'archer', emoji: '🌸' }, { id: 'guardian', emoji: '🌳' },
      ].filter(unit => state.legion?.[unit.id] > 0);
      troops.forEach((unit, i) => {
        const x = legion.x + (i - (troops.length - 1) / 2) * (combatParent.clientWidth < 550 ? 35 : 49);
        const y = legion.y + (owned.length > 3 ? 63 : 55);
        const sprite = this.add.container(x, y);
        const orb = this.add.circle(0, 0, 16, 0xf7fbea, 0.95).setStrokeStyle(2, 0xa9cf91);
        const symbol = this.add.text(0, -2, unit.emoji, { fontSize: '23px' }).setOrigin(.5);
        const count = this.add.text(12, 14, `×${state.legion[unit.id]}`, { fontFamily: 'Arial', fontSize: '10px', fontStyle: 'bold', color: '#315c39', backgroundColor: '#ffffff' }).setOrigin(.5);
        sprite.add([orb, symbol, count]);
        this.tweens.add({ targets: sprite, y: y - 4, duration: 1000 + i * 170, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
        this.characters.push(sprite);
      });
      const enemyType = ['mushroom', 'bramble', 'slime', 'wasp', 'boss'][(state.battle.wave - 1) % 5];
      this.enemy = drawEnemy(this, enemyType, enemy.x, enemy.y);
    }
    showDamage(text, isCrit = false, isParty = false) {
      if (getScreen() !== 'combat') return;
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

      this.tweens.add({
        targets: txt,
        y: txt.y - (isCrit ? 42 : 30),
        scaleX: isCrit ? 1.2 : 1.05,
        scaleY: isCrit ? 1.2 : 1.05,
        alpha: 0,
        duration: isCrit ? 800 : 650,
        ease: 'Cubic.easeOut',
        onComplete: () => txt.destroy(),
      });
    }
    attack() {
      if (getScreen() !== 'combat' || !this.enemy || !this.characters.length) return;
      const source = this.characters[Phaser.Math.Between(0, this.characters.length - 1)];
      if (!source || !Number.isFinite(source.x) || !Number.isFinite(source.y)) return;

      if (source.heroId) playHeroAttack(source.heroId);

      const colors = { sprout: 0x74c25a, rose: 0xf58da8, oak: 0xb58c5c, daisy: 0xffe277, moss: 0x77baa1, sunflower: 0xffce48 };
      const projColor = colors[source.heroId] || 0xf8d77a;

      const spark = this.add.ellipse(source.x + 15, source.y - 12, 16, 9, projColor).setRotation(-0.6);
      this.tweens.add({ targets: spark, x: this.enemy.x - 17, y: this.enemy.y - 6, rotation: 4, duration: 340, ease: 'Sine.easeIn', onComplete: () => {
        spark.destroy();
        playHit();

        const st = getState();
        const power = combatPower(st);
        const isCrit = Math.random() < 0.15;
        const dmg = Math.max(1, Math.round((power * 0.8) * (isCrit ? 2.0 : (0.9 + Math.random() * 0.2))));
        this.showDamage(fmt(dmg), isCrit, false);

        if (!this.enemy?.active) return;
        this.tweens.add({ targets: this.enemy, scaleX: this.enemy.scaleX * 1.12, scaleY: this.enemy.scaleY * 0.87, duration: 100, yoyo: true, ease: 'Sine.easeOut' });
        for (let i = 0; i < 5; i++) {
          const particle = this.add.circle(this.enemy.x, this.enemy.y - 8, Phaser.Math.Between(3, 6), i % 2 ? 0xf0c879 : projColor);
          this.tweens.add({ targets: particle, x: particle.x + Phaser.Math.Between(-42, 42), y: particle.y + Phaser.Math.Between(-35, 30), alpha: 0, duration: 430, onComplete: () => particle.destroy() });
        }
      } });
    }
    enemyAttack() {
      if (getScreen() !== 'combat' || !this.enemy || !this.characters.length) return;
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
      this.tweens.add({
        targets: spore,
        x: target.x + 15,
        y: target.y,
        duration: 320,
        ease: 'Sine.easeIn',
        onComplete: () => {
          spore.destroy();
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
      if (getScreen() !== 'combat') return;
      const width = combatParent.clientWidth || 800;
      const height = combatParent.clientHeight || 300;
      const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xfff9db, 0.6);
      this.tweens.add({ targets: flash, alpha: 0, duration: 550, onComplete: () => flash.destroy() });

      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const dist = Phaser.Math.Between(70, 200);
        const p = this.add.circle(width / 2, height / 2, Phaser.Math.Between(4, 9), i % 2 ? 0xffdf6d : 0xffffff);
        this.tweens.add({
          targets: p,
          x: width / 2 + Math.cos(angle) * dist,
          y: height / 2 + Math.sin(angle) * dist,
          alpha: 0,
          scale: 0.2,
          duration: 750,
          ease: 'Quad.easeOut',
          onComplete: () => p.destroy(),
        });
      }
    }
  }

  const gardenGame = new Phaser.Game({ type: Phaser.CANVAS, parent: gardenParent, width: gardenParent.clientWidth || 800, height: gardenParent.clientHeight || 250, transparent: true, scene: GardenScene, audio: { noAudio: true }, render: { antialias: true } });
  const ensureCombat = () => {
    if (combatGame) return;
    combatGame = new Phaser.Game({ type: Phaser.CANVAS, parent: combatParent, width: combatParent.clientWidth || 800, height: combatParent.clientHeight || 300, transparent: true, scene: CombatScene, audio: { noAudio: true }, render: { antialias: true } });
  };
  const resize = () => {
    if (getScreen() === 'garden' && gardenParent.clientWidth > 0) {
      gardenGame.scale.resize(gardenParent.clientWidth, gardenParent.clientHeight);
      gardenScene?.sync();
    }
    if (combatGame && getScreen() === 'combat' && combatParent.clientWidth > 0) {
      combatGame.scale.resize(combatParent.clientWidth, combatParent.clientHeight);
      combatScene?.sync();
    }
  };
  const observer = new ResizeObserver(() => requestAnimationFrame(resize));
  observer.observe(gardenParent);
  observer.observe(combatParent);

  const api = {
    syncGarden: () => requestAnimationFrame(() => gardenScene?.sync()),
    syncCombat: () => requestAnimationFrame(() => combatScene?.sync()),
    harvest: () => gardenScene?.harvest(),
    tapHero: (heroId) => gardenScene?.tapHero(heroId),
    showCombatDamage: (text, isCrit, isParty) => combatScene?.showDamage(text, isCrit, isParty),
    triggerUltimate: () => combatScene?.triggerUltimate(),
    setMotion: (enabled) => {
      [gardenScene, combatScene].filter(Boolean).forEach(scene => {
        scene.tweens.timeScale = enabled ? 1 : 0;
        scene.time.timeScale = enabled ? 1 : 0;
      });
    },
    show: (screen) => {
      if (screen === 'combat') {
        ensureCombat();
        gardenGame.scene.pause('garden');
        requestAnimationFrame(() => {
          const w = combatParent.clientWidth || 800;
          const h = combatParent.clientHeight || 300;
          combatGame.scale.resize(w, h);
          combatGame.scene.resume('combat');
          combatScene?.sync();
        });
      } else if (screen === 'garden') {
        if (combatGame) combatGame.scene.pause('combat');
        gardenGame.scene.resume('garden');
        requestAnimationFrame(() => {
          const w = gardenParent.clientWidth || 800;
          const h = gardenParent.clientHeight || 250;
          gardenGame.scale.resize(w, h);
          gardenScene?.sync();
        });
      } else {
        if (combatGame) combatGame.scene.pause('combat');
        gardenGame.scene.pause('garden');
      }
    },
  };
  if (getScreen() !== 'garden') requestAnimationFrame(() => api.show(getScreen()));
  return api;
}
