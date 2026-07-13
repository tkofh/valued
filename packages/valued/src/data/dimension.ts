import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
} from '../internal/dimension.ts'
import type { InternalParser, Parser } from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'

type ValuesOfSet<T extends ReadonlySet<unknown>> =
  T extends ReadonlySet<infer U> ? U : never

/** The accepted-input type of a {@link dimension} parser: a number followed by one of `Unit`. */
export type DimensionInput<Unit extends string> = `${number}${Unit}`

const TypeBrand: unique symbol = Symbol('data/dimension')

/** The value a {@link dimension} parser yields: a numeric `.value` with the matched `.unit`. */
class DimensionValue<
  Unit extends string,
> implements InternalDimensionValue<Unit> {
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: Unit

  constructor(value: number, unit: Unit) {
    this.value = value
    this.unit = unit
  }

  toString(): string {
    return `${this.value}${this.unit}`
  }
}

/** Construct a {@link DimensionValue} directly — the value a {@link dimension} parser yields. */
export function dimensionValue<Unit extends string>(
  value: number,
  unit: Unit,
): DimensionValue<Unit> {
  return new DimensionValue(value, unit)
}

/** Type guard for {@link DimensionValue}, as produced by a {@link dimension} parser. */
export function isDimensionValue<Unit extends string>(
  value: unknown,
): value is DimensionValue<Unit> {
  return isRecordOrArray(value) && TypeBrand in value
}

interface DimensionOptions extends InternalDimensionOptions {}

/** The parser type returned by {@link dimension}. */
class DimensionParser<Units extends ReadonlySet<string>>
  extends InternalDimensionParser<Units, DimensionValue<ValuesOfSet<Units>>>
  implements InternalParser<DimensionValue<ValuesOfSet<Units>>>
{
  constructor(units: Units, options?: DimensionOptions) {
    super('dimension', units, dimensionValue, options)
  }
}

export type { DimensionParser, DimensionValue }

/**
 * Parse a generic dimension — a number followed by one of `units` — for a unit
 * set the named data types don't already cover.
 *
 * The input's unit must be exactly one of `units`. Pass `minValue` /
 * `maxValue` to constrain the numeric part (both inclusive).
 *
 * @param units - the units to accept
 * @param options - optional inclusive `minValue` / `maxValue` bounds
 * @returns a parser yielding a {@link DimensionValue} over the listed units
 *
 * @example
 * ```ts
 * const time = dimension(['s', 'ms'])
 * parse('200ms', time) // DimensionValue with .value === 200, .unit === 'ms'
 * parse('200', time)   // { valid: false } — a unit is required
 * ```
 */
export function dimension<const Units extends ReadonlyArray<string>>(
  units: Units,
  options?: DimensionOptions,
): Parser<DimensionValue<Units[number]>, DimensionInput<Units[number]>> {
  return new DimensionParser(new Set(units), options) as never
}
