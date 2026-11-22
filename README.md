# format-inr

Zero-dependency number formatter for the Indian numbering system (lakh/crore grouping).

## Installation

```bash
npm install format-inr
```

## Quick Start

### ESM
```js
import formatINR, { toWordsINR, parseINR } from 'format-inr';
```

### CommonJS
```js
const formatINR = require('format-inr');
const { toWordsINR, parseINR } = formatINR;
```

## Usage Examples

### 1. Basic Formatting (`formatINR`)

Groups numbers into the Indian numbering format (last three digits grouped, then groups of two):

```js
formatINR(1234567);
// => "12,34,567"

formatINR(10000000);
// => "1,00,00,000"

// Numeric strings are also supported
formatINR("1234567");
// => "12,34,567"
```

### 2. Handling Negative Numbers

```js
formatINR(-1234567);
// => "-12,34,567"

formatINR(-1234567, { currency: true });
// => "-₹12,34,567"
```

### 3. Decimals & Rounding (`decimals`)

Control decimal precision with accurate string-based rounding:

```js
// Default is 0 decimals (rounds to nearest integer)
formatINR(1234.5);
// => "1,235"

// Custom decimal places
formatINR(1234.5678, { decimals: 2 });
// => "1,234.57"

formatINR(1234.5, { decimals: 2 });
// => "1,234.50"
```

### 4. Currency Prefix (`currency`)

Adds the Indian Rupee (`₹`) symbol:

```js
formatINR(1234567, { currency: true });
// => "₹12,34,567"

formatINR(-1234567.5, { currency: true, decimals: 2 });
// => "-₹12,34,567.50"
```

### 5. Compact Notation (`compact`)

Formats large numbers into short Indian units (`K`, `L`, `Cr`):

```js
formatINR(1500, { compact: true });
// => "1.5 K"

formatINR(150000, { compact: true });
// => "1.5 L"

formatINR(15000000, { compact: true });
// => "1.5 Cr"

formatINR(12500000, { compact: true });
// => "1.25 Cr"

// Combine compact notation with currency symbol
formatINR(15000000, { compact: true, currency: true });
// => "₹1.5 Cr"

formatINR(-15000000, { compact: true, currency: true });
// => "-₹1.5 Cr"
```

### 6. Short-Form Word Representation (`toWordsINR`)

Convenience function for short-form representation:

```js
toWordsINR(12500000);
// => "1.25 Cr"

toWordsINR(150000);
// => "1.5 L"

toWordsINR(1500);
// => "1.5 K"
```

### 7. Parsing INR Strings (`parseINR`)

Extracts numeric values by stripping currency symbols (`₹`), commas, and whitespace, with support for compact abbreviations:

```js
parseINR("₹12,34,567.50");
// => 1234567.5

parseINR("-₹12,34,567");
// => -1234567

parseINR("1.5 Cr");
// => 15000000

parseINR("1.25 Cr");
// => 12500000
```

## API Reference

| Function / Option | Type | Default | Description |
|---|---|---|---|
| `formatINR(value, options?)` | `(value: number \| string, options?: FormatINROptions) => string` | - | Primary formatter with Indian number grouping. |
| `options.decimals` | `number` | `0` | Decimal places to round and format to (in standard mode). |
| `options.currency` | `boolean` | `false` | When `true`, prepends `₹` (or `-₹` for negative values). |
| `options.compact` | `boolean` | `false` | When `true`, formats numbers using `K`, `L`, and `Cr`. |
| `toWordsINR(value)` | `(value: number \| string) => string` | - | Returns short-form Indian scale notation (`K`, `L`, `Cr`). |
| `parseINR(value)` | `(value: string \| number) => number` | - | Parses formatted INR strings into numeric values. |

## License

MIT
