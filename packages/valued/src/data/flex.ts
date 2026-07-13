import {
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension.ts'
import type { InternalParser, Parser } from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'

const TypeBrand: unique symbol = Symbol('data/flex')

const flexUnits = new Set(['fr'] as const)
type FlexUnits = typeof flexUnits
type FlexUnit = ValuesOfSet<FlexUnits>

/** The accepted-input type of a {@link flex} parser: a number followed by `fr`. */
export type FlexInput = `${number}${FlexUnit}`

/** The value a {@link flex} parser yields: a numeric `.value` with `.unit` fixed to `'fr'`. */
class FlexValue implements InternalDimensionValue<FlexUnit> {
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: FlexUnit

  constructor(value: number, unit: FlexUnit) {
    this.value = value
    this.unit = unit
  }

  toString(): string {
    return `${this.value}${this.unit}`
  }
}

/** Construct a {@link FlexValue} directly — the value a {@link flex} parser yields. */
export function flexValue(value: number, unit: FlexUnit): FlexValue {
  return new FlexValue(value, unit)
}

/** Type guard for {@link FlexValue}, as produced by a {@link flex} parser. */
export function isFlexValue(value: unknown): value is FlexValue {
  return isRecordOrArray(value) && TypeBrand in value
}

/** The parser type returned by {@link flex}. */
class FlexParser
  extends InternalDimensionParser<FlexUnits, FlexValue>
  implements InternalParser<FlexValue>
{
  constructor() {
    super('flex', flexUnits, flexValue)
  }

  override toString(): string {
    return '<flex>'
  }
}

export type { FlexParser, FlexValue }

/**
 * Parse a CSS [`<flex>`](https://www.w3.org/TR/css-grid-1/#typedef-flex) — a
 * number followed by `fr`, the grid flexible-length unit.
 *
 * @returns a parser yielding a {@link FlexValue}
 *
 * @example
 * ```ts
 * parse('1fr', flex()) // FlexValue with .value === 1, .unit === 'fr'
 * ```
 */
export function flex(): Parser<FlexValue, FlexInput> {
  return new FlexParser() as never
}
