import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension.ts'
import type { InternalParser, Parser } from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'

const TypeBrand: unique symbol = Symbol('data/anglePercentage')

const anglePercentageDenominators = new Map([
  ['deg', 360],
  ['grad', 400],
  ['rad', Math.PI * 2],
  ['turn', 1],
  ['%', 100],
] as const)

const anglePercentageUnits = new Set(anglePercentageDenominators.keys())

type AnglePercentageUnits = typeof anglePercentageUnits
type AnglePercentageUnit = ValuesOfSet<AnglePercentageUnits>

/** The accepted-input type of an {@link anglePercentage} parser: a number followed by an angle unit or `%`. */
export type AnglePercentageInput = `${number}${AnglePercentageUnit}`

/**
 * The value an {@link anglePercentage} parser yields: the raw `.value` and
 * `.unit`, plus a unit-independent `.normalized`.
 */
class AnglePercentageValue implements InternalDimensionValue<AnglePercentageUnit> {
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: AnglePercentageUnit

  /**
   * The value as a fraction of a full turn, independent of unit: `deg / 360`,
   * `grad / 400`, `rad / (2 * pi)`, `turn / 1`, or `% / 100`. `180deg` and
   * `50%` both normalize to `0.5`.
   */
  readonly normalized: number

  constructor(value: number, unit: AnglePercentageUnit) {
    this.value = value
    this.unit = unit

    const denominator = anglePercentageDenominators.get(unit)
    if (denominator === undefined) {
      throw new TypeError(`unknown angle unit ${unit}`)
    }

    this.normalized = value / denominator
  }

  toString(): string {
    return `${this.value}${this.unit}`
  }
}

/**
 * Construct an {@link AnglePercentageValue} directly — the value an
 * {@link anglePercentage} parser yields, with `.normalized` computed from `unit`.
 *
 * @throws {TypeError} if `unit` is not a known angle or percentage unit
 */
export function anglePercentageValue(
  value: number,
  unit: AnglePercentageUnit,
): AnglePercentageValue {
  return new AnglePercentageValue(value, unit)
}

/** Type guard for {@link AnglePercentageValue}, as produced by an {@link anglePercentage} parser. */
export function isAnglePercentageValue(
  value: unknown,
): value is AnglePercentageValue {
  return isRecordOrArray(value) && TypeBrand in value
}

interface AnglePercentageOptions extends InternalDimensionOptions {}

/** The parser type returned by {@link anglePercentage}. */
class AnglePercentageParser
  extends InternalDimensionParser<AnglePercentageUnits, AnglePercentageValue>
  implements InternalParser<AnglePercentageValue>
{
  constructor(options?: AnglePercentageOptions) {
    super(
      'angle-percentage',
      anglePercentageUnits,
      anglePercentageValue,
      options,
    )
  }
}

export type { AnglePercentageParser, AnglePercentageValue }

/**
 * Parse a CSS
 * [`<angle-percentage>`](https://www.w3.org/TR/css-values-4/#typedef-angle-percentage)
 * — an {@link angle} or a {@link percentage}.
 *
 * The result exposes `.normalized`, the value as a fraction of a turn (with
 * `%` mapped as `% / 100`), so angles and percentages compare on one scale.
 * Pass `minValue` / `maxValue` to constrain the numeric part (both inclusive).
 *
 * @param options - optional inclusive `minValue` / `maxValue` bounds
 * @returns a parser yielding an {@link AnglePercentageValue}
 *
 * @example
 * ```ts
 * parse('90deg', anglePercentage()) // .value === 90, .normalized === 0.25
 * parse('50%', anglePercentage())   // .value === 50, .normalized === 0.5
 * ```
 */
export function anglePercentage(
  options?: AnglePercentageOptions,
): Parser<AnglePercentageValue, AnglePercentageInput> {
  return new AnglePercentageParser(options) as never
}
