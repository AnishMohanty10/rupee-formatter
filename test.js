const test = require('node:test');
const assert = require('node:assert/strict');
const formatINR = require('./index.js');
const { toWordsINR, parseINR } = formatINR;

test('small numbers', () => {
  assert.equal(formatINR(0), '0');
  assert.equal(formatINR(5), '5');
  assert.equal(formatINR(42), '42');
  assert.equal(formatINR(99), '99');
  assert.equal(formatINR(500), '500');
  assert.equal(formatINR(999), '999');
});

test('1,000 grouping threshold', () => {
  assert.equal(formatINR(1000), '1,000');
  assert.equal(formatINR(1500), '1,500');
  assert.equal(formatINR(9999), '9,999');
  assert.equal(formatINR(12345), '12,345');
  assert.equal(formatINR(99999), '99,999');
});

test('1,00,000 (1 Lakh) grouping threshold', () => {
  assert.equal(formatINR(100000), '1,00,000');
  assert.equal(formatINR(150000), '1,50,000');
  assert.equal(formatINR(1234567), '12,34,567');
  assert.equal(formatINR(9999999), '99,99,999');
});

test('1,00,00,000 (1 Crore) grouping threshold', () => {
  assert.equal(formatINR(10000000), '1,00,00,000');
  assert.equal(formatINR(15000000), '1,50,00,000');
  assert.equal(formatINR(123456789), '12,34,56,789');
  assert.equal(formatINR(1234567890), '1,23,45,67,890');
});

test('negative numbers', () => {
  assert.equal(formatINR(-1), '-1');
  assert.equal(formatINR(-1000), '-1,000');
  assert.equal(formatINR(-1234567), '-12,34,567');
  assert.equal(formatINR(-10000000), '-1,00,00,000');
  assert.equal(formatINR(-1234567, { currency: true }), '-₹12,34,567');
  assert.equal(formatINR(-0), '0');
  assert.equal(formatINR(-0, { currency: true }), '₹0');
});

test('decimals and precision', () => {
  assert.equal(formatINR(1234.5, { decimals: 1 }), '1,234.5');
  assert.equal(formatINR(1234.5, { decimals: 2 }), '1,234.50');
  assert.equal(formatINR(1234, { decimals: 2 }), '1,234.00');
  assert.equal(formatINR(0, { decimals: 2 }), '0.00');
  assert.equal(formatINR(1234567.89, { decimals: 2 }), '12,34,567.89');
});

test('rounding behavior', () => {
  assert.equal(formatINR(1234.5678, { decimals: 2 }), '1,234.57');
  assert.equal(formatINR(1234.564, { decimals: 2 }), '1,234.56');
  assert.equal(formatINR(1234.565, { decimals: 2 }), '1,234.57');
  assert.equal(formatINR(99.995, { decimals: 2 }), '100.00');
  assert.equal(formatINR(1234.5), '1,235'); // default decimals: 0
  assert.equal(formatINR(1234.4), '1,234');
});

test('currency formatting', () => {
  assert.equal(formatINR(0, { currency: true }), '₹0');
  assert.equal(formatINR(1234567, { currency: true }), '₹12,34,567');
  assert.equal(formatINR(1234567.5, { currency: true, decimals: 2 }), '₹12,34,567.50');
  assert.equal(formatINR(-1234567, { currency: true }), '-₹12,34,567');
  assert.equal(formatINR(-1234567.5, { currency: true, decimals: 2 }), '-₹12,34,567.50');
});

test('compact notation', () => {
  assert.equal(formatINR(1500, { compact: true }), '1.5 K');
  assert.equal(formatINR(150000, { compact: true }), '1.5 L');
  assert.equal(formatINR(15000000, { compact: true }), '1.5 Cr');
  assert.equal(formatINR(12500000, { compact: true }), '1.25 Cr');
  assert.equal(formatINR(1000, { compact: true }), '1 K');
  assert.equal(formatINR(500, { compact: true }), '500');
  assert.equal(formatINR(-15000000, { compact: true }), '-1.5 Cr');
  assert.equal(formatINR(-15000000, { compact: true, currency: true }), '-₹1.5 Cr');
  assert.equal(formatINR(15000000, { compact: true, currency: true }), '₹1.5 Cr');
  assert.equal(formatINR(1500, { compact: true, decimals: 2 }), '1.50 K');
  assert.equal(formatINR(1500, { compact: true, decimals: 0 }), '2 K');
});

test('string inputs', () => {
  assert.equal(formatINR('1234567'), '12,34,567');
  assert.equal(formatINR('  1234567  '), '12,34,567');
  assert.equal(formatINR('-1234567'), '-12,34,567');
  assert.equal(formatINR('1234.5678', { decimals: 2 }), '1,234.57');
  assert.equal(formatINR('.5', { decimals: 1 }), '0.5');
});

test('invalid inputs throw TypeError', () => {
  const invalidValues = [
    NaN,
    Infinity,
    -Infinity,
    null,
    undefined,
    true,
    false,
    '',
    '   ',
    'abc',
    '12a',
    '1.2.3',
    {},
    [],
    Symbol('sym')
  ];

  for (const val of invalidValues) {
    assert.throws(
      () => formatINR(val),
      TypeError,
      `Expected TypeError for value: ${String(val)}`
    );
  }

  assert.throws(() => formatINR(100, { decimals: -1 }), TypeError);
  assert.throws(() => formatINR(100, { decimals: '2' }), TypeError);
  assert.throws(() => formatINR(100, 'invalid'), TypeError);
});

test('toWordsINR', () => {
  assert.equal(toWordsINR(12500000), '1.25 Cr');
  assert.equal(toWordsINR(150000), '1.5 L');
  assert.equal(toWordsINR(1500), '1.5 K');
  assert.equal(toWordsINR(500), '500');
  assert.equal(toWordsINR(0), '0');
  assert.equal(toWordsINR(-12500000), '-1.25 Cr');
  assert.equal(toWordsINR('12500000'), '1.25 Cr');
  assert.throws(() => toWordsINR('invalid'), TypeError);
});

test('parseINR and round-trip', () => {
  assert.equal(parseINR('₹12,34,567.50'), 1234567.5);
  assert.equal(parseINR('-₹12,34,567.50'), -1234567.5);
  assert.equal(parseINR('12,34,567'), 1234567);
  assert.equal(parseINR('-12,34,567'), -1234567);
  assert.equal(parseINR(' ₹ 12,34,567.50 '), 1234567.5);
  assert.equal(parseINR('0'), 0);
  assert.equal(parseINR('₹0'), 0);

  // Compact parsing
  assert.equal(parseINR('1.5 Cr'), 15000000);
  assert.equal(parseINR('1.25 Cr'), 12500000);
  assert.equal(parseINR('-₹1.5 Cr'), -15000000);
  assert.equal(parseINR('1.5 L'), 150000);
  assert.equal(parseINR('1.5 K'), 1500);

  // Round-trip tests
  const testCases = [
    0,
    5,
    1000,
    100000,
    1234567,
    10000000,
    -1234567,
    -10000000
  ];

  for (const n of testCases) {
    const formatted = formatINR(n);
    assert.equal(parseINR(formatted), n, `Round-trip failed for ${n}`);
  }

  const decimalCases = [1234.5, 1234567.5, -9876543.25];
  for (const n of decimalCases) {
    const formatted = formatINR(n, { decimals: 2, currency: true });
    assert.equal(parseINR(formatted), n, `Round-trip failed for decimal ${n}`);
  }

  // Invalid inputs for parseINR
  assert.throws(() => parseINR(''), TypeError);
  assert.throws(() => parseINR('   '), TypeError);
  assert.throws(() => parseINR('abc'), TypeError);
  assert.throws(() => parseINR('₹abc'), TypeError);
  assert.throws(() => parseINR(null), TypeError);
  assert.throws(() => parseINR(undefined), TypeError);
  assert.throws(() => parseINR(NaN), TypeError);
  assert.throws(() => parseINR(Infinity), TypeError);
});

test('ESM module import interop', async () => {
  const esm = await import('./index.mjs');
  assert.equal(typeof esm.default, 'function');
  assert.equal(typeof esm.formatINR, 'function');
  assert.equal(typeof esm.toWordsINR, 'function');
  assert.equal(typeof esm.parseINR, 'function');
  assert.equal(esm.formatINR(1234567), '12,34,567');
  assert.equal(esm.default(1234567), '12,34,567');
  assert.equal(esm.toWordsINR(12500000), '1.25 Cr');
  assert.equal(esm.parseINR('₹12,34,567.50'), 1234567.5);
});
