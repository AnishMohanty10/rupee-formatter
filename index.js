'use strict';

/**
 * Expands scientific notation (e.g. 1e-7 or 1e21) into a standard decimal string.
 */
function scientificToDecimal(numOrStr) {
  const str = String(numOrStr);
  const [coefficient, exponentStr] = str.toLowerCase().split('e');
  if (!exponentStr) return str;
  const exp = parseInt(exponentStr, 10);
  let [intPart, decPart = ''] = coefficient.split('.');
  const isNeg = intPart.startsWith('-');
  if (isNeg) intPart = intPart.slice(1);

  if (exp > 0) {
    if (decPart.length <= exp) {
      intPart = intPart + decPart + '0'.repeat(exp - decPart.length);
      decPart = '';
    } else {
      intPart = intPart + decPart.slice(0, exp);
      decPart = decPart.slice(exp);
    }
  } else {
    const zeros = '0'.repeat(Math.abs(exp) - 1);
    decPart = zeros + intPart + decPart;
    intPart = '0';
  }
  return (isNeg ? '-' : '') + intPart + (decPart ? '.' + decPart : '');
}

/**
 * Adds 1 to an integer string representation without overflow or floating point issues.
 */
function addOne(intStr) {
  let carry = 1;
  const digits = intStr.split('');
  for (let i = digits.length - 1; i >= 0; i--) {
    const sum = Number(digits[i]) + carry;
    if (sum === 10) {
      digits[i] = '0';
      carry = 1;
    } else {
      digits[i] = String(sum);
      carry = 0;
      break;
    }
  }
  if (carry === 1) {
    digits.unshift('1');
  }
  return digits.join('');
}

/**
 * Rounds intPart and decPart to the specified number of decimals.
 */
function roundStringParts(intPart, decPart, decimals) {
  if (decimals === 0) {
    if (decPart.length > 0 && decPart[0] >= '5') {
      intPart = addOne(intPart);
    }
    return { intPart, decPart: '' };
  }

  if (decPart.length <= decimals) {
    return { intPart, decPart: decPart.padEnd(decimals, '0') };
  }

  const roundDigit = decPart[decimals];
  let targetDec = decPart.slice(0, decimals);
  if (roundDigit >= '5') {
    let carry = 1;
    const digits = targetDec.split('');
    for (let i = digits.length - 1; i >= 0; i--) {
      const sum = Number(digits[i]) + carry;
      if (sum === 10) {
        digits[i] = '0';
        carry = 1;
      } else {
        digits[i] = String(sum);
        carry = 0;
        break;
      }
    }
    if (carry === 1) {
      intPart = addOne(intPart);
      targetDec = '0'.repeat(decimals);
    } else {
      targetDec = digits.join('');
    }
  }
  return { intPart, decPart: targetDec };
}

/**
 * Formats an integer string according to the Indian numbering system.
 * Last 3 digits grouped, followed by groups of 2.
 */
function groupIndian(intStr) {
  if (intStr.length <= 3) return intStr;
  const lastThree = intStr.slice(-3);
  const otherDigits = intStr.slice(0, -3);
  const groupedOther = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return groupedOther + ',' + lastThree;
}

/**
 * Shifts the decimal point left by the given number of positions on a string representation.
 */
function shiftDecimalLeft(str, shift) {
  let [intPart, decPart = ''] = str.split('.');
  if (shift === 0) return { intPart, decPart };
  if (intPart.length <= shift) {
    decPart = '0'.repeat(shift - intPart.length) + intPart + decPart;
    intPart = '0';
  } else {
    decPart = intPart.slice(-shift) + decPart;
    intPart = intPart.slice(0, -shift);
  }
  return { intPart, decPart };
}

/**
 * Validates the value and returns normalized string.
 */
function normalizeInput(value) {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'boolean' ||
    typeof value === 'symbol' ||
    typeof value === 'object'
  ) {
    throw new TypeError('Invalid input: value must be a number or numeric string');
  }

  let str;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError('Invalid input: value must be a finite number');
    }
    str = String(value);
  } else if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '' || !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(trimmed)) {
      throw new TypeError('Invalid input: value must be a valid numeric string');
    }
    const num = Number(trimmed);
    if (!Number.isFinite(num)) {
      throw new TypeError('Invalid input: value must be a finite number');
    }
    str = trimmed;
  }

  if (/[eE]/.test(str)) {
    str = scientificToDecimal(str);
  }
  return str;
}

/**
 * Validates options object.
 */
function validateOptions(options) {
  if (options === undefined || options === null) return;
  if (typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Options must be an object');
  }
  if (options.decimals !== undefined) {
    if (
      typeof options.decimals !== 'number' ||
      !Number.isInteger(options.decimals) ||
      options.decimals < 0
    ) {
      throw new TypeError('options.decimals must be a non-negative integer');
    }
  }
}

/**
 * Formats numbers using the Indian numbering system (lakh/crore grouping).
 */
function formatINR(value, options = {}) {
  let str = normalizeInput(value);
  validateOptions(options);

  const currency = Boolean(options && options.currency);
  const compact = Boolean(options && options.compact);

  let isNegative = false;
  if (str.startsWith('-')) {
    isNegative = true;
    str = str.slice(1);
  } else if (str.startsWith('+')) {
    str = str.slice(1);
  }

  let [intPart, decPart = ''] = str.split('.');
  if (intPart === '') intPart = '0';
  intPart = intPart.replace(/^0+(?=\d)/, '');

  let suffix = '';
  if (compact) {
    let shift = 0;
    if (intPart.length >= 8) {
      shift = 7;
      suffix = ' Cr';
    } else if (intPart.length >= 6) {
      shift = 5;
      suffix = ' L';
    } else if (intPart.length >= 4) {
      shift = 3;
      suffix = ' K';
    }

    const shifted = shiftDecimalLeft(intPart + (decPart ? '.' + decPart : ''), shift);
    intPart = shifted.intPart;
    decPart = shifted.decPart;

    if (options && options.decimals !== undefined) {
      const rounded = roundStringParts(intPart, decPart, options.decimals);
      intPart = rounded.intPart;
      decPart = rounded.decPart;
    } else {
      const rounded = roundStringParts(intPart, decPart, 2);
      intPart = rounded.intPart;
      decPart = rounded.decPart.replace(/0+$/, '');
    }
  } else {
    const decimals = options && options.decimals !== undefined ? options.decimals : 0;
    const rounded = roundStringParts(intPart, decPart, decimals);
    intPart = rounded.intPart;
    decPart = rounded.decPart;
  }

  const isZero = intPart === '0' && (!decPart || /^0+$/.test(decPart));
  const finalNegative = isZero ? false : isNegative;
  const prefix = finalNegative ? (currency ? '-₹' : '-') : (currency ? '₹' : '');
  const groupedInt = groupIndian(intPart);
  const numStr = decPart ? groupedInt + '.' + decPart : groupedInt;

  return prefix + numStr + suffix;
}

/**
 * Converts a number to short-form Indian words (K, L, Cr).
 */
function toWordsINR(value) {
  return formatINR(value, { compact: true });
}

/**
 * Parses an INR formatted string or numeric value back into a JavaScript number.
 */
function parseINR(value) {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'boolean' ||
    typeof value === 'symbol' ||
    typeof value === 'object'
  ) {
    throw new TypeError('Invalid input: value must be a string or number');
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError('Invalid input: value must be a finite number');
    }
    return value;
  }
  if (typeof value !== 'string') {
    throw new TypeError('Invalid input: value must be a string');
  }

  let str = value.trim();
  if (str === '') {
    throw new TypeError('Invalid input: string cannot be empty');
  }

  let multiplier = 1;
  if (/(\s|^)(Cr|cr|CR)$/.test(str)) {
    multiplier = 10000000;
    str = str.replace(/(\s|^)(Cr|cr|CR)$/, '');
  } else if (/(\s|^)(L|l|Lakh|lakh)$/.test(str)) {
    multiplier = 100000;
    str = str.replace(/(\s|^)(L|l|Lakh|lakh)$/, '');
  } else if (/(\s|^)(K|k)$/.test(str)) {
    multiplier = 1000;
    str = str.replace(/(\s|^)(K|k)$/, '');
  }

  const cleaned = str.replace(/[₹,\s]/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '+' || cleaned === '.') {
    throw new TypeError('Invalid input: string does not contain a valid number');
  }

  const num = Number(cleaned);
  if (!Number.isFinite(num)) {
    throw new TypeError('Invalid input: failed to parse as a number');
  }

  return num * multiplier;
}

formatINR.formatINR = formatINR;
formatINR.toWordsINR = toWordsINR;
formatINR.parseINR = parseINR;
formatINR.default = formatINR;

module.exports = formatINR;
