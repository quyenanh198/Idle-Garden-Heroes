import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve('dist');
const packedSources = [
  'sprout-knight', 'rose-mage', 'oak-sentinel', 'daisy-dancer', 'moss-golem', 'sunflower-sage',
  'grumpy-mushroom', 'thorny-bramble', 'slime-sprig', 'wild-wasp', 'shadow-stump',
];
for (const name of packedSources) {
  await fs.rm(path.join(root, 'assets', `${name}.webp`), { force: true });
  await fs.rm(path.join(root, 'assets', `${name}-attack.webp`), { force: true });
}
const collect = async dir => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await collect(target));
    else if (entry.name !== 'sw.js') files.push(target);
  }
  return files;
};
const files = (await collect(root)).sort();
const hash = crypto.createHash('sha256');
const paths = [];
for (const file of files) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  hash.update(relative); hash.update(await fs.readFile(file));
  paths.push(`./${relative}`);
}
const source = await fs.readFile(path.join(root, 'sw.js'), 'utf8');
await fs.writeFile(path.join(root, 'sw.js'), source
  .replace('__CACHE_VERSION__', `idle-garden-hero-${hash.digest('hex').slice(0, 12)}`)
  .replace('__PRECACHE__', JSON.stringify(paths)));
console.log(`Precached ${paths.length} build files.`);
