import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension.ts'
import type { InternalParser, Parser } from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'

const TypeBrand: unique symbol = Symbol('data/frequency')

const frequencyUnits = new Set(['Hz', 'kHz', 'hz', 'khz'] as const)
type FrequencyUnits = typeof frequencyUnits
type FrequencyUnit = ValuesOfSet<FrequencyUnits>

/** The accepted-input type of a {@link frequency} parser: a number followed by a frequency unit. */
export type FrequencyInput = `${number}${FrequencyUnit}`

/** The value a {@link frequency} parser yields: a numeric `.value` with its frequency `.unit`. */
class FrequencyValue implements InternalDimensionValue<FrequencyUnit> {
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: FrequencyUnit

  constructor(value: number, unit: FrequencyUnit) {
    this.value = value
    this.unit = unit
  }

  toString(): string {
    return `${this.value}${this.unit}`
  }
}

/** Construct a {@link FrequencyValue} directly — the value a {@link frequency} parser yields. */
export function frequencyValue(
  value: number,
  unit: FrequencyUnit,
): FrequencyValue {
  return new FrequencyValue(value, unit)
}

/** Type guard for {@link FrequencyValue}, as produced by a {@link frequency} parser. */
export function isFrequencyValue(value: unknown): value is FrequencyValue {
  return isRecordOrArray(value) && TypeBrand in value
}

interface FrequencyOptions extends InternalDimensionOptions {}

/** The parser type returned by {@link frequency}. */
class FrequencyParser
  extends InternalDimensionParser<FrequencyUnits, FrequencyValue>
  implements InternalParser<FrequencyValue>
{
  constructor(options?: FrequencyOptions) {
    super('frequency', frequencyUnits, frequencyValue, options)
  }
}

export type { FrequencyParser, FrequencyValue }

/**
 * Parse a CSS
 * [`<frequency>`](https://www.w3.org/TR/css-values-4/#frequency) — a number
 * followed by `Hz` or `kHz`.
 *
 * The lowercase spellings `hz` and `khz` are accepted too. Pass `minValue` /
 * `maxValue` to constrain the numeric part (both inclusive).
 *
 * @param options - optional inclusive `minValue` / `maxValue` bounds
 * @returns a parser yielding a {@link FrequencyValue}
 *
 * @example
 * ```ts
 * parse('44.1kHz', frequency()) // .value === 44.1, .unit === 'kHz'
 * ```
 */
export function frequency(
  options?: FrequencyOptions,
): Parser<FrequencyValue, FrequencyInput> {
  return new FrequencyParser(options) as never
}
