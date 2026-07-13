import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension.ts'
import type { InternalParser, Parser } from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'

const TypeBrand: unique symbol = Symbol('data/length')

const lengthUnits = new Set([
  'cap',
  'ch',
  'em',
  'ex',
  'ic',
  'lh',
  'rcap',
  'rch',
  'rem',
  'rex',
  'ric',
  'rlh',
  'vh',
  'svh',
  'lhv',
  'dvh',
  'vw',
  'svw',
  'lvw',
  'dvw',
  'vmin',
  'svmin',
  'lvmin',
  'dvmin',
  'vmax',
  'svmax',
  'lvmax',
  'dvmax',
  'vb',
  'svb',
  'lvb',
  'dvb',
  'vi',
  'svi',
  'lvi',
  'dvi',
  'cqw',
  'cqh',
  'cqi',
  'cqb',
  'cqmin',
  'cqmax',
  'px',
  'cm',
  'mm',
  'Q',
  'in',
  'pc',
  'pt',
] as const)
type LengthUnits = typeof lengthUnits
type LengthUnit = ValuesOfSet<LengthUnits>

/** The accepted-input type of a {@link length} parser: a number followed by one of `Unit`. */
export type LengthInput<Unit extends string> = `${number}${Unit}`

/**
 * The value a {@link length} parser yields: a numeric `.value` with a `.unit`
 * narrowed to the accepted length units.
 */
class LengthValue<
  Unit extends LengthUnit,
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

/** Construct a {@link LengthValue} directly — the value a {@link length} parser yields. */
export function lengthValue<Unit extends LengthUnit>(
  value: number,
  unit: Unit,
): LengthValue<Unit> {
  return new LengthValue(value, unit)
}

/** Type guard for {@link LengthValue}, as produced by a {@link length} parser. */
export function isLengthValue<Unit extends LengthUnit>(
  value: unknown,
): value is LengthValue<Unit> {
  return isRecordOrArray(value) && TypeBrand in value
}

interface LengthOptions extends InternalDimensionOptions {}

/** The parser type returned by {@link length} and {@link length.subset}. */
class LengthParser<Units extends ReadonlySet<LengthUnit>>
  extends InternalDimensionParser<Units, LengthValue<ValuesOfSet<Units>>>
  implements InternalParser<LengthValue<ValuesOfSet<Units>>>
{
  constructor(units: Units, options?: LengthOptions) {
    super('length', units, lengthValue, options)
  }
}

export type { LengthParser, LengthValue }

type LengthConstructor = {
  (
    options?: LengthOptions,
  ): Parser<LengthValue<LengthUnit>, LengthInput<LengthUnit>>
  subset<const Units extends ReadonlyArray<LengthUnit>>(
    units: Units,
    options?: LengthOptions,
  ): Parser<
    LengthValue<LengthUnit & Units[number]>,
    LengthInput<LengthUnit & Units[number]>
  >
}

/**
 * Parse a CSS [`<length>`](https://www.w3.org/TR/css-values-4/#lengths) — a
 * number followed by a length unit (`px`, `em`, `rem`, `vw`, `ch`, container
 * and viewport units, and the rest of the CSS length units).
 *
 * A unit is required: unitless input, including `0`, does not match. Pass
 * `minValue` / `maxValue` to constrain the numeric part (both inclusive). To
 * accept only some units, use {@link length.subset}.
 *
 * @param options - optional inclusive `minValue` / `maxValue` bounds
 * @returns a parser yielding a {@link LengthValue} over any length unit
 *
 * @example
 * ```ts
 * parse('12px', length()) // LengthValue with .value === 12, .unit === 'px'
 * parse('0', length())    // { valid: false } — a unit is required
 *
 * parse('-1px', length({ minValue: 0 })) // { valid: false }
 * ```
 */
const length = function length(
  options?: LengthOptions,
): Parser<LengthValue<LengthUnit>, LengthInput<LengthUnit>> {
  return new LengthParser(lengthUnits, options) as never
} as LengthConstructor

/**
 * Parse a `<length>` restricted to `units` — a {@link length} parser that
 * accepts only the listed units.
 *
 * Names that are not CSS length units are dropped from the set, so a parser
 * built from an all-unknown list matches nothing.
 *
 * @param units - the length units to accept
 * @param options - optional inclusive `minValue` / `maxValue` bounds
 * @returns a parser yielding a {@link LengthValue} over the listed units
 *
 * @example
 * ```ts
 * const pxOrRem = length.subset(['px', 'rem'])
 * parse('2rem', pxOrRem) // LengthValue with .unit === 'rem'
 * parse('2em', pxOrRem)  // { valid: false } — 'em' not in the subset
 * ```
 */
length.subset = function lengthSubset<
  const Units extends ReadonlyArray<string>,
>(
  units: Units,
  options?: LengthOptions,
): Parser<
  LengthValue<LengthUnit & Units[number]>,
  LengthInput<LengthUnit & Units[number]>
> {
  const intersection: Set<Units[number] & LengthUnit> = new Set()
  for (const unit of units) {
    if (lengthUnits.has(unit as LengthUnit)) {
      intersection.add(unit as LengthUnit)
    }
  }

  return new LengthParser(intersection, options) as never
} as LengthConstructor['subset']

export { length }
