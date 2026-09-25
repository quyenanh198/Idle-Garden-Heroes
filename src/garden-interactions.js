export function nextCritterDelay(random = Math.random) {
  return 60_000 + Math.floor(random() * 60_001);
}

export function initGardenInteractions({ panel, grid, getState, getScreen, getMotion, onWater, onCritter }) {
  const toolbar = document.createElement('div');
  toolbar.className = 'garden-tools';
  toolbar.innerHTML = '<button type="button" class="watering-can" id="watering-can" draggable="true" aria-pressed="false"><span aria-hidden="true">🪣</span><strong>Water a hero</strong><small>Drag or tap, then choose a plot</small></button><div class="garden-event-status" id="garden-event-status" role="status"></div>';
  panel.querySelector('.section-heading').after(toolbar);
  const can = toolbar.querySelector('#watering-can');
  const status = toolbar.querySelector('#garden-event-status');
  let armed = false;
  let dragging = false;
  let pointerStart = null;
  let skipClick = false;
  let critter = null;
  let nextCritterAt = Date.now() + nextCritterDelay();

  const arm = enabled => {
    armed = enabled;
    can.classList.toggle('armed', armed);
    can.setAttribute('aria-pressed', String(armed));
    grid.classList.toggle('watering-mode', armed);
  };
  const plotAt = (x, y) => document.elementFromPoint(x, y)?.closest('.hero-plot');
  const clearHover = () => grid.querySelectorAll('.water-target').forEach(plot => plot.classList.remove('water-target'));

  can.addEventListener('click', () => {
    if (skipClick) { skipClick = false; return; }
    arm(!armed);
  });
  can.addEventListener('dragstart', event => { event.dataTransfer.setData('text/plain', 'garden-water'); arm(true); });
  can.addEventListener('dragend', () => { clearHover(); arm(false); });
  grid.addEventListener('dragover', event => {
    const plot = event.target.closest('.hero-plot');
    if (!plot || !armed) return;
    event.preventDefault();
    clearHover();
    plot.classList.add('water-target');
  });
  grid.addEventListener('drop', event => {
    const plot = event.target.closest('.hero-plot');
    if (!plot || event.dataTransfer.getData('text/plain') !== 'garden-water') return;
    event.preventDefault();
    onWater(plot.dataset.select);
    arm(false);
    clearHover();
  });
  can.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse') return;
    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
    can.setPointerCapture(event.pointerId);
  });
  can.addEventListener('pointermove', event => {
    if (!pointerStart || event.pointerId !== pointerStart.id) return;
    if (!dragging && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 8) { dragging = true; arm(true); }
    if (dragging) { clearHover(); plotAt(event.clientX, event.clientY)?.classList.add('water-target'); }
  });
  const endPointer = event => {
    if (!pointerStart || event.pointerId !== pointerStart.id) return;
    if (dragging) {
      const plot = plotAt(event.clientX, event.clientY);
      if (plot) onWater(plot.dataset.select);
      arm(false);
      clearHover();
      skipClick = true;
    }
    pointerStart = null;
    dragging = false;
  };
  can.addEventListener('pointerup', endPointer);
  can.addEventListener('pointercancel', endPointer);

  const spawnCritter = () => {
    if (critter || getScreen() !== 'garden') return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lucky-critter';
    button.setAttribute('aria-label', 'Catch the golden butterfly for a surprise reward');
    button.textContent = '🦋';
    panel.append(button);
    critter = button;
    const cleanup = () => { button.remove(); if (critter === button) critter = null; };
    button.addEventListener('click', () => { onCritter(); cleanup(); }, { once: true });
    if (getMotion()) {
      const width = panel.clientWidth;
      const animation = button.animate([
        { transform: 'translate(-50px, 0) rotate(-16deg)' },
        { transform: `translate(${width * .25}px, -46px) rotate(10deg)` },
        { transform: `translate(${width * .55}px, 18px) rotate(-9deg)` },
        { transform: `translate(${width + 50}px, -60px) rotate(12deg)` },
      ], { duration: 14_000, easing: 'ease-in-out', fill: 'forwards' });
      animation.onfinish = cleanup;
    } else setTimeout(cleanup, 14_000);
  };
  const timer = setInterval(() => {
    const state = getState();
    const remaining = Math.max(0, Math.ceil(((state.gardenBuff?.until || 0) - Date.now()) / 1000));
    status.textContent = remaining > 0
      ? `🌿 Lush Bloom ${remaining}s · +50% leaves · faster attacks`
      : state.frenzyTaps > 0 ? `✨ Frenzy: ${state.frenzyTaps} boosted taps left` : `✨ ${state.seedShards || 0}/5 Golden Seed shards`;
    grid.querySelectorAll('.hero-plot').forEach(plot => plot.classList.toggle('lush-plot', remaining > 0 && plot.dataset.select === state.gardenBuff.heroId));
    if (Date.now() >= nextCritterAt) { spawnCritter(); nextCritterAt = Date.now() + nextCritterDelay(); }
  }, 500);
  return {
    consumeWater(heroId) {
      if (!armed) return false;
      arm(false);
      return !!onWater(heroId);
    },
    spawnCritter,
    destroy() { clearInterval(timer); critter?.remove(); toolbar.remove(); },
  };
}
