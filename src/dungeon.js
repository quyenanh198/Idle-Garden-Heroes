export const DUNGEON_SIZE = 8;
export const DUNGEON_ROWS = [
  '########',
  '#...#..#',
  '#.#...##',
  '#...#..#',
  '##.....#',
  '#..#.#.#',
  '#......#',
  '########',
];
export const LANDMARKS = { '3,1': 'chest', '5,2': 'trap', '6,4': 'stairs', '6,6': 'boss' };
export const FACING = ['N', 'E', 'S', 'W'];
const VECTORS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

export function isOpen(x, y) {
  return x >= 0 && y >= 0 && x < DUNGEON_SIZE && y < DUNGEON_SIZE && DUNGEON_ROWS[y][x] === '.';
}

export function newDungeon() {
  return { x: 1, y: 1, facing: 1, steps: 0, visited: ['1,1'] };
}

export function sanitizeDungeon(raw) {
  const fresh = newDungeon();
  if (!raw || !Number.isInteger(raw.x) || !Number.isInteger(raw.y) || !isOpen(raw.x, raw.y)) return fresh;
  const facing = Number.isInteger(raw.facing) ? ((raw.facing % 4) + 4) % 4 : 1;
  const visited = Array.isArray(raw.visited) ? raw.visited.filter(key => /^\d,\d$/.test(key) && isOpen(...key.split(',').map(Number))) : [];
  return {
    x: raw.x, y: raw.y, facing,
    steps: Number.isInteger(raw.steps) ? Math.max(0, Math.min(1_000_000, raw.steps)) : 0,
    visited: [...new Set([...visited, `${raw.x},${raw.y}`])],
  };
}

export function stepDungeon(dungeon, action) {
  const next = sanitizeDungeon(dungeon);
  if (action === 'left') next.facing = (next.facing + 3) % 4;
  else if (action === 'right') next.facing = (next.facing + 1) % 4;
  else if (action === 'forward' || action === 'back') {
    const [dx, dy] = VECTORS[(next.facing + (action === 'back' ? 2 : 0)) % 4];
    if (isOpen(next.x + dx, next.y + dy)) {
      next.x += dx;
      next.y += dy;
      next.steps += 1;
      next.visited.push(`${next.x},${next.y}`);
      next.visited = [...new Set(next.visited)];
    }
  }
  return next;
}

export function corridorDepth(dungeon) {
  const [dx, dy] = VECTORS[dungeon.facing];
  let depth = 0;
  for (let distance = 1; distance <= 4; distance++) {
    if (!isOpen(dungeon.x + dx * distance, dungeon.y + dy * distance)) break;
    depth++;
  }
  return depth;
}

export function renderDungeonMap(dungeon) {
  const current = `${dungeon.x},${dungeon.y}`;
  const seen = new Set(dungeon.visited);
  const arrows = ['↑', '→', '↓', '←'];
  return DUNGEON_ROWS.map((row, y) => [...row].map((cell, x) => {
    const key = `${x},${y}`;
    if (key === current) return `<span class="dungeon-tile player" aria-label="Party facing ${FACING[dungeon.facing]}">${arrows[dungeon.facing]}</span>`;
    const visible = seen.has(key) || [...seen].some(visited => {
      const [vx, vy] = visited.split(',').map(Number);
      return Math.abs(vx - x) + Math.abs(vy - y) === 1;
    });
    if (!visible) return '<span class="dungeon-tile fog" aria-label="Unexplored">?</span>';
    if (cell === '#') return '<span class="dungeon-tile wall" aria-label="Wall"></span>';
    const landmark = LANDMARKS[key];
    const icon = { chest: '🎁', trap: '⚠', stairs: '↧', boss: '♛' }[landmark] || '·';
    return `<span class="dungeon-tile floor" aria-label="${landmark || 'Floor'}">${icon}</span>`;
  }).join('')).join('');
}

export function paintCorridor(canvas, dungeon, tick = 0) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  const depth = corridorDepth(dungeon);
  const glow = .8 + Math.sin(tick / 190) * .08 + Math.sin(tick / 63) * .035;
  const background = ctx.createLinearGradient(0, 0, 0, h);
  background.addColorStop(0, '#14251e'); background.addColorStop(.57, '#344139'); background.addColorStop(1, '#1c271d');
  ctx.fillStyle = background; ctx.fillRect(0, 0, w, h);
  const quad = (points, fill, stroke = '#785e40') => {
    ctx.beginPath(); ctx.moveTo(...points[0]); points.slice(1).forEach(point => ctx.lineTo(...point)); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = stroke; ctx.stroke();
  };
  const line = (points, color = '#839074', width = 1.5) => {
    ctx.beginPath(); ctx.moveTo(...points[0]); points.slice(1).forEach(point => ctx.lineTo(...point));
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  };
  for (let layer = 0; layer <= Math.min(depth, 4); layer++) {
    const outer = layer === 0 ? 0 : 1 - 1 / (layer + .35);
    const inner = 1 - 1 / (layer + 1.35);
    const left = w * .5 * outer, right = w - left, top = h * .36 * outer, bottom = h - h * .28 * outer;
    const il = w * .5 * inner, ir = w - il, it = h * .36 * inner, ib = h - h * .28 * inner;
    quad([[left, top], [il, it], [il, ib], [left, bottom]], layer % 2 ? '#465342' : '#55634d');
    quad([[right, top], [ir, it], [ir, ib], [right, bottom]], layer % 2 ? '#354237' : '#415042');
    quad([[left, bottom], [il, ib], [ir, ib], [right, bottom]], '#5b5944');
    quad([[left, top], [il, it], [ir, it], [right, top]], '#28372f');
    for (let joint = 1; joint <= 3; joint++) {
      const part = joint / 4;
      line([[left, top + (bottom - top) * part], [il, it + (ib - it) * part]], '#69745a', 1.2);
      line([[ir, it + (ib - it) * part], [right, top + (bottom - top) * part]], '#596956', 1.2);
    }
    line([[(left + il) / 2, (top + it) / 2], [(left + il) / 2, (bottom + ib) / 2]], '#69745a', 1);
    line([[(right + ir) / 2, (top + it) / 2], [(right + ir) / 2, (bottom + ib) / 2]], '#596956', 1);
    line([[left, bottom], [w / 2, h * .62], [right, bottom]], '#a19266', 1.3);
    line([[left, top], [il, it], [ir, it], [right, top]], '#9e8a5b', 2.5);
  }
  const scale = 1 / (depth + 1.2);
  quad([[w * (.5 - scale / 2), h * (.5 - scale / 2)], [w * (.5 + scale / 2), h * (.5 - scale / 2)], [w * (.5 + scale / 2), h * (.5 + scale / 2)], [w * (.5 - scale / 2), h * (.5 + scale / 2)]], '#465243', '#a48759');
  for (let x = .15; x < 1; x += .175) line([[w * x, h], [w / 2 + (x - .5) * w * .1, h * .62]], '#b2a16e66', 1);
  const lantern = (x, y) => {
    const halo = ctx.createRadialGradient(x, y, 2, x, y, 42);
    halo.addColorStop(0, `rgba(255,217,128,${.5 * glow})`); halo.addColorStop(1, 'rgba(255,180,64,0)');
    ctx.fillStyle = halo; ctx.fillRect(x - 42, y - 42, 84, 84);
    ctx.fillStyle = '#ffd27d'; ctx.fillRect(x - 3, y - 11, 6, 16);
    ctx.fillStyle = '#6a5638'; ctx.fillRect(x - 8, y + 4, 16, 4);
  };
  lantern(w * .15, h * .47);
  lantern(w * .85, h * .47);
  const torch = ctx.createRadialGradient(w * .5, h * .38, 6, w * .5, h * .38, w * .58);
  torch.addColorStop(0, `rgba(255,190,92,${.31 * glow})`); torch.addColorStop(1, 'rgba(255,190,92,0)');
  ctx.fillStyle = torch; ctx.fillRect(0, 0, w, h);
}
