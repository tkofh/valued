import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension.ts'
import type { InternalParser, Parser } from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'

const TypeBrand: unique symbol = Symbol('data/frequencyPercentage')

const frequencyPercentageUnits = new Set([
  'Hz',
  'kHz',
  'hz',
  'khz',
  '%',
] as const)
type FrequencyPercentageUnits = typeof frequencyPercentageUnits
type FrequencyPercentageUnit = ValuesOfSet<FrequencyPercentageUnits>

/** The accepted-input type of a {@link frequencyPercentage} parser: a number followed by a frequency unit or `%`. */
export type FrequencyPercentageInput = `${number}${FrequencyPercentageUnit}`

/** The value a {@link frequencyPercentage} parser yields: a numeric `.value` with its `.unit`. */
class FrequencyPercentageValue implements InternalDimensionValue<FrequencyPercentageUnit> {
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: FrequencyPercentageUnit

  constructor(value: number, unit: FrequencyPercentageUnit) {
    this.value = value
    this.unit = unit
  }

  toString(): string {
    return `${this.value}${this.unit}`
  }
}

/** Construct a {@link FrequencyPercentageValue} directly — the value a {@link frequencyPercentage} parser yields. */
export function frequencyPercentageValue(
  value: number,
  unit: FrequencyPercentageUnit,
): FrequencyPercentageValue {
  return new FrequencyPercentageValue(value, unit)
}

/** Type guard for {@link FrequencyPercentageValue}, as produced by a {@link frequencyPercentage} parser. */
export function isFrequencyPercentageValue(
  value: unknown,
): value is FrequencyPercentageValue {
  return isRecordOrArray(value) && TypeBrand in value
}

interface FrequencyPercentageOptions extends InternalDimensionOptions {}

/** The parser type returned by {@link frequencyPercentage}. */
class FrequencyPercentageParser
  extends InternalDimensionParser<
    FrequencyPercentageUnits,
    FrequencyPercentageValue
  >
  implements InternalParser<FrequencyPercentageValue>
{
  constructor(options?: FrequencyPercentageOptions) {
    super(
      'frequencyPercentage',
      frequencyPercentageUnits,
      frequencyPercentageValue,
      options,
    )
  }
}

export type { FrequencyPercentageParser, FrequencyPercentageValue }

/**
 * Parse a CSS
 * [`<frequency-percentage>`](https://www.w3.org/TR/css-values-4/#typedef-frequency-percentage)
 * — a {@link frequency} or a {@link percentage}.
 *
 * Pass `minValue` / `maxValue` to constrain the numeric part (both inclusive).
 *
 * @param options - optional inclusive `minValue` / `maxValue` bounds
 * @returns a parser yielding a {@link FrequencyPercentageValue}
 *
 * @example
 * ```ts
 * parse('50%', frequencyPercentage())   // .value === 50, .unit === '%'
 * parse('440Hz', frequencyPercentage()) // .value === 440, .unit === 'Hz'
 * ```
 */
export function frequencyPercentage(
  options?: FrequencyPercentageOptions,
): Parser<FrequencyPercentageValue, FrequencyPercentageInput> {
  return new FrequencyPercentageParser(options) as never
}
