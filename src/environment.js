const BIOME_FILES = {
  glade: 'garden-glade.webp',
  thicket: 'biome-thicket.webp',
  swamp: 'biome-swamp.webp',
  redwood: 'biome-redwood.webp',
  twilight: 'biome-twilight.webp',
};

export function timeOfDay(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 6 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

export function weatherFor(date = new Date()) {
  return Math.floor(date.getTime() / (15 * 60_000)) % 4 === 0 ? 'rain' : 'sunbeams';
}

export function createEnvironment(element, { biome = 'glade', getMotion = () => true } = {}) {
  if (!element) return null;
  const assetUrl = file => new URL(`${import.meta.env.BASE_URL}assets/${file}`, document.baseURI).href;
  const layers = document.createElement('div');
  layers.className = 'environment-layers';
  layers.setAttribute('aria-hidden', 'true');
  layers.innerHTML = '<div class="environment-sky"></div><div class="environment-mid"></div><div class="environment-front"></div><div class="environment-weather"></div><div class="environment-light"></div>';
  element.prepend(layers);
  element.style.setProperty('--env-foreground', `url("${assetUrl('foreground-foliage.svg')}")`);

  const setBiome = id => {
    const safe = BIOME_FILES[id] ? id : 'glade';
    element.dataset.biome = safe;
    element.style.setProperty('--env-image', `url("${assetUrl(BIOME_FILES[safe])}")`);
  };
  const updateWeather = (date = new Date()) => {
    element.dataset.daypart = timeOfDay(date);
    element.dataset.weather = weatherFor(date);
  };
  const onPointerMove = event => {
    if (!getMotion()) return;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    element.style.setProperty('--env-x', `${x * 26}px`);
    element.style.setProperty('--env-y', `${y * 15}px`);
    element.style.setProperty('--env-mid-x', `${x * -13}px`);
    element.style.setProperty('--env-mid-y', `${y * -5}px`);
    element.style.setProperty('--env-far-x', `${x * -5}px`);
    element.style.setProperty('--env-far-y', `${y * -3}px`);
  };
  const onPointerLeave = () => {
    for (const key of ['--env-x', '--env-y', '--env-mid-x', '--env-mid-y', '--env-far-x', '--env-far-y']) element.style.setProperty(key, '0px');
  };
  element.addEventListener('pointermove', onPointerMove, { passive: true });
  element.addEventListener('pointerleave', onPointerLeave);
  const timer = setInterval(updateWeather, 60_000);
  setBiome(biome);
  updateWeather();
  return { setBiome, updateWeather, destroy() { clearInterval(timer); element.removeEventListener('pointermove', onPointerMove); element.removeEventListener('pointerleave', onPointerLeave); layers.remove(); } };
}
