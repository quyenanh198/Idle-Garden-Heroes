import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const assets = path.resolve('public/assets');
const sprites = [
  ['hero-sprout', 'sprout-knight'], ['hero-rose', 'rose-mage'],
  ['hero-oak', 'oak-sentinel'], ['hero-daisy', 'daisy-dancer'],
  ['hero-moss', 'moss-golem'], ['hero-sunflower', 'sunflower-sage'],
  ['hero-attack-sprout', 'sprout-knight-attack'], ['hero-attack-rose', 'rose-mage-attack'],
  ['hero-attack-oak', 'oak-sentinel-attack'], ['hero-attack-daisy', 'daisy-dancer-attack'],
  ['hero-attack-moss', 'moss-golem-attack'], ['hero-attack-sunflower', 'sunflower-sage-attack'],
  ['enemy-mushroom', 'grumpy-mushroom'], ['enemy-bramble', 'thorny-bramble'],
  ['enemy-slime', 'slime-sprig'], ['enemy-wasp', 'wild-wasp'], ['enemy-boss', 'shadow-stump'],
];
const cell = 256, columns = 5, rows = Math.ceil(sprites.length / columns);
const composite = [];
const frames = {};
for (const [index, [key, file]] of sprites.entries()) {
  const x = (index % columns) * cell;
  const y = Math.floor(index / columns) * cell;
  const input = await sharp(path.join(assets, `${file}.webp`)).resize(cell, cell, { fit: 'contain', background: '#00000000' }).webp({ quality: 82 }).toBuffer();
  composite.push({ input, left: x, top: y });
  frames[key] = { frame: { x, y, w: cell, h: cell }, rotated: false, trimmed: false, sourceSize: { w: cell, h: cell } };
}
const width = columns * cell, height = rows * cell;
await sharp({ create: { width, height, channels: 4, background: '#00000000' } })
  .composite(composite).webp({ quality: 82, effort: 5 })
  .toFile(path.join(assets, 'atlas-characters.webp'));
await fs.writeFile(path.join(assets, 'atlas-characters.json'), JSON.stringify({ frames, meta: { image: 'atlas-characters.webp', format: 'RGBA8888', size: { w: width, h: height }, scale: '1' } }, null, 2));
console.log(`Packed ${sprites.length} sprites into ${width}x${height} WebP atlas.`);
