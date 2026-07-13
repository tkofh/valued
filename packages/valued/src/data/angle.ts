import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension.ts'
import type { InternalParser, Parser } from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'

const TypeBrand: unique symbol = Symbol('data/angle')

const angleDenominators = new Map([
  ['deg', 360],
  ['grad', 400],
  ['rad', Math.PI * 2],
  ['turn', 1],
] as const)

const angleUnits = new Set(angleDenominators.keys())
type AngleUnits = typeof angleUnits

/** The angle units an {@link angle} parser accepts: `'deg' | 'grad' | 'rad' | 'turn'`. */
export type AngleUnit = ValuesOfSet<AngleUnits>

/** The accepted-input type of an {@link angle} parser: a number followed by an angle unit. */
export type AngleInput = `${number}${AngleUnit}`

/**
 * The value an {@link angle} parser yields: the raw `.value` and `.unit`, plus
 * a unit-independent `.normalized`.
 */
class AngleValue implements InternalDimensionValue<AngleUnit> {
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: AngleUnit

  /**
   * The angle as a fraction of a full turn, independent of unit: `deg / 360`,
   * `grad / 400`, `rad / (2 * pi)`, or `turn / 1`. `180deg`, `200grad`, and
   * `0.5turn` all normalize to `0.5`.
   */
  readonly normalized: number

  constructor(value: number, unit: AngleUnit) {
    this.value = value
    this.unit = unit

    const denominator = angleDenominators.get(unit)
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
 * Construct an {@link AngleValue} directly — the value an {@link angle} parser
 * yields, with `.normalized` computed from `unit`.
 *
 * @throws {TypeError} if `unit` is not a known angle unit
 */
export function angleValue(value: number, unit: AngleUnit): AngleValue {
  return new AngleValue(value, unit)
}

/** Type guard for {@link AngleValue}, as produced by an {@link angle} parser. */
export function isAngleValue(value: unknown): value is AngleValue {
  return isRecordOrArray(value) && TypeBrand in value
}

interface AngleOptions extends InternalDimensionOptions {}

/** The parser type returned by {@link angle}. */
class AngleParser
  extends InternalDimensionParser<AngleUnits, AngleValue>
  implements InternalParser<AngleValue>
{
  constructor(options?: AngleOptions) {
    super('angle', angleUnits, angleValue, options)
  }
}

export type { AngleParser, AngleValue }

/**
 * Parse a CSS [`<angle>`](https://www.w3.org/TR/css-values-4/#angles) — a
 * number followed by `deg`, `grad`, `rad`, or `turn`.
 *
 * The result exposes `.normalized`, the angle as a fraction of a turn, so you
 * can compare or convert angles without switching on the unit. Pass `minValue`
 * / `maxValue` to constrain the numeric part (both inclusive).
 *
 * @param options - optional inclusive `minValue` / `maxValue` bounds
 * @returns a parser yielding an {@link AngleValue}
 *
 * @example
 * ```ts
 * const result = parse('180deg', angle())
 * if (result.valid) {
 *   result.value.value      // 180
 *   result.value.unit       // 'deg'
 *   result.value.normalized // 0.5 — half a turn
 * }
 * ```
 */
export function angle(options?: AngleOptions): Parser<AngleValue, AngleInput> {
  return new AngleParser(options) as never
}
