import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fmt, fmtRate } from '../src/format.js';

describe('Number formatting', () => {
  it('keeps small numbers as whole numbers', () => {
    assert.equal(fmt(0), '0');
    assert.equal(fmt(9999.9), '9,999');
  });

  it('uses suffixes past a thousand', () => {
    assert.equal(fmt(12_345), '12.3K');
    assert.equal(fmt(2_500_000), '2.50M');
    assert.equal(fmt(7.1e9), '7.10B');
  });

  it('keeps going past billions instead of printing "4600.00B"', () => {
    assert.equal(fmt(4.6e12), '4.60T');
    assert.equal(fmt(2e14), '200.00T');
    assert.equal(fmt(3.3e15), '3.30Qa');
    assert.equal(fmt(1e33), '1.00Dc');
  });

  it('rolls over when rounding reaches the next suffix', () => {
    assert.equal(fmt(999_990), '1.00M');
    assert.equal(fmt(999_999_999), '1.00B');
  });

  it('falls back to scientific notation beyond the last suffix', () => {
    assert.equal(fmt(1e40), '1.00e40');
  });

  it('guards against invalid values', () => {
    assert.equal(fmt(NaN), '0');
    assert.equal(fmt(-5), '0');
    assert.equal(fmt(Infinity), '0');
  });

  it('shows one decimal for small rates', () => {
    assert.equal(fmtRate(1.25), '1.3');
    assert.equal(fmtRate(4), '4');
    assert.equal(fmtRate(15_000), '15.0K');
  });
});
