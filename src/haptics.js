const PATTERNS = {
  tap: 10,
  crit: [20, 30, 20],
  victory: [40, 60, 40, 80, 100],
  water: [14, 24, 14],
  reward: [20, 25, 35],
};

export function pulse(kind = 'tap', enabled = true) {
  if (!enabled || typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return false;
  return navigator.vibrate(PATTERNS[kind] || PATTERNS.tap);
}
