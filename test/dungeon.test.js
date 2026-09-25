import test from 'node:test';
import assert from 'node:assert/strict';
import { newDungeon, stepDungeon, sanitizeDungeon, corridorDepth, renderDungeonMap } from '../src/dungeon.js';
import { DEFAULT_STATE, sanitizeSave, deflectSpore, executeTurn } from '../src/game-engine.js';

test('dungeon movement respects walls, turns, and keeps explored tiles after save', () => {
  const start = newDungeon();
  const east = stepDungeon(start, 'forward');
  const chest = stepDungeon(east, 'forward');
  const blocked = stepDungeon(chest, 'forward');
  assert.deepEqual([start.x, east.x, chest.x, blocked.x], [1, 2, 3, 3]);
  assert.equal(chest.steps, 2);
  assert.equal(corridorDepth(start), 2);
  assert.equal(chest.visited.length, 3);
  const saved = sanitizeSave({ ...DEFAULT_STATE, dungeon: chest });
  assert.deepEqual(saved.dungeon, chest);
  assert.match(renderDungeonMap(stepDungeon(saved.dungeon, 'back')), /aria-label="chest"/);
  assert.match(renderDungeonMap(start), /aria-label="Unexplored"/);
  assert.deepEqual(sanitizeDungeon({ x: -4, y: 99 }), start);
});

test('spore deflection returns damage and prevents exactly one enemy counterattack', () => {
  const state = sanitizeSave(DEFAULT_STATE);
  state.battle.enemyHp = 1000;
  const beforeHp = state.battle.partyHp;
  assert.ok(deflectSpore(state) > 0);
  assert.equal(deflectSpore(state), 0);
  const first = executeTurn(state);
  assert.equal(first.damageTaken, 0);
  assert.equal(state.battle.partyHp, beforeHp);
  const second = executeTurn(state);
  assert.ok(second.damageTaken > 0);
});
