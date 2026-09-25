const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

export function fmt(n) {
  if (!Number.isFinite(n) || n < 0) return '0';
  if (n < 1e4) return Math.floor(n).toLocaleString('en-US');
  let tier = Math.floor(Math.log10(n) / 3);
  // 10K–999K keeps one decimal like before; larger tiers keep two.
  const digits = (t) => (t === 1 ? 1 : 2);
  // Rounding can push 999.995K up to "1000.00K"; roll over to the next suffix.
  if (Number((n / Math.pow(1000, tier)).toFixed(digits(tier))) >= 1000) tier += 1;
  if (tier >= SUFFIXES.length) return n.toExponential(2).replace('+', '');
  return `${(n / Math.pow(1000, tier)).toFixed(digits(tier))}${SUFFIXES[tier]}`;
}

export function fmtRate(n) {
  if (!Number.isFinite(n) || n < 0) return '0';
  return n < 10 ? Number(n.toFixed(1)).toString() : fmt(n);
}
