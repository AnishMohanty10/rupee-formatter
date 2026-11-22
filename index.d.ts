export interface FormatINROptions {
  /**
   * Number of decimal places to format/round to.
   * Defaults to 0 in standard mode.
   * In compact mode, defaults to up to 2 decimal places with trailing zeros stripped.
   */
  decimals?: number;

  /**
   * Whether to add the Indian Rupee currency symbol ('₹') as prefix.
   * Negatives format as '-₹' (e.g. '-₹12,34,567').
   * @default false
   */
  currency?: boolean;

  /**
   * Whether to format numbers using compact short scale notation:
   * K (Thousand / 10^3), L (Lakh / 10^5), Cr (Crore / 10^7).
   * @default false
   */
  compact?: boolean;
}

/**
 * Formats numbers or numeric strings using the Indian numbering system (lakh/crore grouping).
 *
 * @param value Number or numeric string to format.
 * @param options Formatting options.
 * @returns Formatted Indian numbering string.
 * @throws {TypeError} If value is NaN, Infinity, or non-numeric.
 */
export function formatINR(value: number | string, options?: FormatINROptions): string;

/**
 * Converts a number or numeric string to short-form Indian notation (K, L, Cr).
 * E.g., 12500000 -> "1.25 Cr"
 *
 * @param value Number or numeric string.
 * @returns Short form compact string.
 * @throws {TypeError} If value is NaN, Infinity, or non-numeric.
 */
export function toWordsINR(value: number | string): string;

/**
 * Parses an INR formatted string (e.g., "₹12,34,567.50" or "1.5 Cr") back into a number,
 * stripping currency symbols ('₹'), commas, spaces, and handling compact suffixes.
 *
 * @param value Formatted INR string or number.
 * @returns Parsed JavaScript number.
 * @throws {TypeError} If value cannot be parsed to a finite number.
 */
export function parseINR(value: string | number): number;

export default formatINR;
