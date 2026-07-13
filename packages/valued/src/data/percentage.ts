import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension.ts'
import type { InternalParser, Parser } from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'

const TypeBrand: unique symbol = Symbol('data/percentage')

const percentageUnits = new Set(['%'] as const)
type PercentageUnits = typeof percentageUnits
type PercentageUnit = ValuesOfSet<PercentageUnits>

/** The accepted-input type of a {@link percentage} parser: a number followed by `%`. */
export type PercentageInput = `${number}${PercentageUnit}`

/** The value a {@link percentage} parser yields: a numeric `.value` with `.unit` fixed to `'%'`. */
class PercentageValue implements InternalDimensionValue<PercentageUnit> {
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: PercentageUnit

  constructor(value: number) {
    this.value = value
    this.unit = '%'
  }

  toString(): string {
    return `${this.value}${this.unit}`
  }
}

/** Construct a {@link PercentageValue} directly — the value a {@link percentage} parser yields. */
export function percentageValue(value: number): PercentageValue {
  return new PercentageValue(value)
}

/** Type guard for {@link PercentageValue}, as produced by a {@link percentage} parser. */
export function isPercentageValue(value: unknown): value is PercentageValue {
  return isRecordOrArray(value) && TypeBrand in value
}

interface PercentageOptions extends InternalDimensionOptions {}

/** The parser type returned by {@link percentage}. */
class PercentageParser
  extends InternalDimensionParser<PercentageUnits, PercentageValue>
  implements InternalParser<PercentageValue>
{
  constructor(options?: PercentageOptions) {
    super('percentage', percentageUnits, percentageValue, options)
  }
}

export type { PercentageParser, PercentageValue }

/**
 * Parse a CSS
 * [`<percentage>`](https://www.w3.org/TR/css-values-4/#percentages) — a number
 * followed by `%`.
 *
 * Pass `minValue` / `maxValue` to constrain the numeric part; both bounds are
 * inclusive.
 *
 * @param options - optional inclusive `minValue` / `maxValue` bounds
 * @returns a parser yielding a {@link PercentageValue}
 *
 * @example
 * ```ts
 * parse('50%', percentage()) // PercentageValue with .value === 50, .unit === '%'
 * ```
 */
export function percentage(
  options?: PercentageOptions,
): Parser<PercentageValue, PercentageInput> {
  return new PercentageParser(options) as never
}
