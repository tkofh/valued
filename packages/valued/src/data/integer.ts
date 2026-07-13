import { InternalNumberParser } from '../internal/number.ts'
import type { InternalParser, Parser } from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'

const TypeBrand: unique symbol = Symbol('data/integer')

/**
 * The accepted-input type of an {@link integer} parser. The type cannot
 * distinguish integers from decimals, so it is any numeric string; a
 * fractional value is rejected at parse time.
 */
export type IntegerInput = `${number}`

/** The value an {@link integer} parser yields: a whole number under `.value`. */
class IntegerValue {
  readonly [TypeBrand] = TypeBrand

  /** The parsed integer. */
  readonly value: number

  constructor(value: number) {
    this.value = value
  }

  toString(): string {
    return `${this.value}`
  }
}

/** Wrap a raw number as an {@link IntegerValue} — the value an {@link integer} parser yields. */
export function integerValue(value: number): IntegerValue {
  return new IntegerValue(value)
}

/** Type guard for {@link IntegerValue}, as produced by an {@link integer} parser. */
export function isIntegerValue(value: unknown): value is IntegerValue {
  return isRecordOrArray(value) && TypeBrand in value
}

interface IntegerOptions {
  /**
   * Reject values below this bound (inclusive). `false`, `null`, or omitted
   * leaves the lower end unbounded.
   *
   * @default undefined
   */
  min?: number | false | null | undefined
  /**
   * Reject values above this bound (inclusive). `false`, `null`, or omitted
   * leaves the upper end unbounded.
   *
   * @default undefined
   */
  max?: number | false | null | undefined
}

/** The parser type returned by {@link integer}. */
class IntegerParser
  extends InternalNumberParser<IntegerValue>
  implements InternalParser<IntegerValue>
{
  constructor(options?: IntegerOptions) {
    super(
      options?.min == null || options.min === false
        ? Number.NEGATIVE_INFINITY
        : options.min,
      options?.max == null || options.max === false
        ? Number.POSITIVE_INFINITY
        : options.max,
      integerValue,
    )
  }

  protected override checkNumberValue(value: number): boolean {
    // Number.isInteger, not `~~value === value`: the bitwise form coerces to a
    // 32-bit int, so it rejects whole numbers with magnitude >= 2 ** 31.
    return Number.isInteger(value)
  }
}

export type { IntegerParser, IntegerValue }

/**
 * Parse a CSS [`<integer>`](https://www.w3.org/TR/css-values-4/#integers) — an
 * optionally-signed whole number, with no unit.
 *
 * A value with a fractional part fails to parse. Pass `min` / `max` to
 * constrain the accepted value; both bounds are inclusive.
 *
 * @param options - optional inclusive `min` / `max` bounds
 * @returns a parser yielding an {@link IntegerValue}
 *
 * @example
 * ```ts
 * parse('42', integer())  // IntegerValue with .value === 42
 * parse('1.5', integer()) // { valid: false } — not a whole number
 * ```
 */
export function integer(
  options?: IntegerOptions,
): Parser<IntegerValue, IntegerInput> {
  return new IntegerParser(options) as never
}
