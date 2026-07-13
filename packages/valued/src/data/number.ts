import {
  type InternalNumberInput,
  InternalNumberParser,
} from '../internal/number.ts'
import type { InternalParser, Parser } from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'

const TypeBrand: unique symbol = Symbol('data/number')

/** The accepted-input type of a {@link number} parser: any numeric string. */
export type NumberInput = InternalNumberInput

/** The value a {@link number} parser yields: a raw number under `.value`. */
class NumberValue {
  readonly [TypeBrand] = TypeBrand

  /** The parsed number. */
  readonly value: number

  constructor(value: number) {
    this.value = value
  }

  toString(): string {
    return `${this.value}`
  }
}

/** Wrap a raw number as a {@link NumberValue} — the value a {@link number} parser yields. */
export function numberValue(value: number): NumberValue {
  return new NumberValue(value)
}

/** Type guard for {@link NumberValue}, as produced by a {@link number} parser. */
export function isNumberValue(value: unknown): value is NumberValue {
  return isRecordOrArray(value) && TypeBrand in value
}

interface NumberOptions {
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

/** The parser type returned by {@link number}. */
class NumberParser
  extends InternalNumberParser<NumberValue>
  implements InternalParser<NumberValue>
{
  constructor(options?: NumberOptions) {
    super(
      options?.min == null || options.min === false
        ? Number.NEGATIVE_INFINITY
        : options.min,
      options?.max == null || options.max === false
        ? Number.POSITIVE_INFINITY
        : options.max,
      numberValue,
    )
  }
}

export type { NumberParser, NumberValue }

/**
 * Parse a CSS [`<number>`](https://www.w3.org/TR/css-values-4/#numbers) — an
 * optionally-signed integer or decimal, with no unit.
 *
 * Pass `min` / `max` to constrain the accepted value; both bounds are
 * inclusive, and an out-of-range number fails to parse.
 *
 * @param options - optional inclusive `min` / `max` bounds
 * @returns a parser yielding a {@link NumberValue}
 *
 * @example
 * ```ts
 * parse('1.5', number()) // NumberValue with .value === 1.5
 *
 * const unitInterval = number({ min: 0, max: 1 })
 * parse('0.5', unitInterval) // NumberValue with .value === 0.5
 * parse('2', unitInterval)   // { valid: false } — above max
 * ```
 */
export function number(
  options?: NumberOptions,
): Parser<NumberValue, NumberInput> {
  return new NumberParser(options) as never
}
