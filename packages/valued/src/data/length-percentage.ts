import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension.ts'
import type { InternalParser, Parser } from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'

const TypeBrand: unique symbol = Symbol('data/lengthPercentage')

const lengthPercentageUnits = new Set([
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
  '%',
] as const)
type LengthPercentageUnits = typeof lengthPercentageUnits
type LengthPercentageUnit = ValuesOfSet<LengthPercentageUnits>

/** The accepted-input type of a {@link lengthPercentage} parser: a number followed by one of `Unit`. */
export type LengthPercentageInput<Unit extends LengthPercentageUnit> =
  `${number}${Unit}`

/**
 * The value a {@link lengthPercentage} parser yields: a numeric `.value` with a
 * `.unit` that is `'%'` or one of the length units.
 */
class LengthPercentageValue<
  Unit extends LengthPercentageUnit,
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

/** Construct a {@link LengthPercentageValue} directly — the value a {@link lengthPercentage} parser yields. */
export function lengthPercentageValue<Unit extends LengthPercentageUnit>(
  value: number,
  unit: Unit,
): LengthPercentageValue<Unit> {
  return new LengthPercentageValue(value, unit)
}

/** Type guard for {@link LengthPercentageValue}, as produced by a {@link lengthPercentage} parser. */
export function isLengthPercentageValue<Unit extends LengthPercentageUnit>(
  value: unknown,
): value is LengthPercentageValue<Unit> {
  return isRecordOrArray(value) && TypeBrand in value
}

interface LengthPercentageOptions extends InternalDimensionOptions {}

/** The parser type returned by {@link lengthPercentage} and {@link lengthPercentage.subset}. */
class LengthPercentageParser<Units extends ReadonlySet<LengthPercentageUnit>>
  extends InternalDimensionParser<
    Units,
    LengthPercentageValue<ValuesOfSet<Units>>
  >
  implements InternalParser<LengthPercentageValue<ValuesOfSet<Units>>>
{
  constructor(units: Units, options?: LengthPercentageOptions) {
    super('lengthPercentage', units, lengthPercentageValue, options)
  }
}

export type { LengthPercentageParser, LengthPercentageValue }

type LengthPercentageConstructor = {
  (
    options?: LengthPercentageOptions,
  ): Parser<
    LengthPercentageValue<LengthPercentageUnit>,
    LengthPercentageInput<LengthPercentageUnit>
  >
  subset<const Units extends ReadonlyArray<LengthPercentageUnit>>(
    units: Units,
    options?: LengthPercentageOptions,
  ): Parser<
    LengthPercentageValue<Units[number]>,
    LengthPercentageInput<Units[number]>
  >
}

/**
 * Parse a CSS
 * [`<length-percentage>`](https://www.w3.org/TR/css-values-4/#typedef-length-percentage)
 * — a {@link length} or a {@link percentage}, i.e. a number followed by a
 * length unit or by `%`.
 *
 * A unit is required: unitless input, including `0`, does not match. Pass
 * `minValue` / `maxValue` to constrain the numeric part (both inclusive). To
 * accept only some units, use {@link lengthPercentage.subset}.
 *
 * @param options - optional inclusive `minValue` / `maxValue` bounds
 * @returns a parser yielding a {@link LengthPercentageValue}
 *
 * @example
 * ```ts
 * parse('50%', lengthPercentage())  // .value === 50, .unit === '%'
 * parse('10px', lengthPercentage()) // .value === 10, .unit === 'px'
 * ```
 */
const lengthPercentage = ((
  options?: LengthPercentageOptions,
): Parser<
  LengthPercentageValue<LengthPercentageUnit>,
  LengthPercentageInput<LengthPercentageUnit>
> =>
  new LengthPercentageParser(
    lengthPercentageUnits,
    options,
  ) as never) as LengthPercentageConstructor

/**
 * Parse a `<length-percentage>` restricted to `units` — a
 * {@link lengthPercentage} parser that accepts only the listed units (`'%'`
 * included or not, as you choose).
 *
 * Names that are not length-or-percentage units are dropped from the set, so a
 * parser built from an all-unknown list matches nothing.
 *
 * @param units - the units to accept
 * @param options - optional inclusive `minValue` / `maxValue` bounds
 * @returns a parser yielding a {@link LengthPercentageValue} over the listed units
 *
 * @example
 * ```ts
 * const pxOrPercent = lengthPercentage.subset(['px', '%'])
 * parse('2px', pxOrPercent) // .unit === 'px'
 * parse('2em', pxOrPercent) // { valid: false } — 'em' not in the subset
 * ```
 */
lengthPercentage.subset = (<const Units extends ReadonlyArray<string>>(
  units: Units,
  options?: LengthPercentageOptions,
): Parser<
  LengthPercentageValue<LengthPercentageUnit & Units[number]>,
  LengthPercentageInput<LengthPercentageUnit & Units[number]>
> => {
  const intersection: Set<Units[number] & LengthPercentageUnit> = new Set()
  for (const unit of units) {
    if (lengthPercentageUnits.has(unit as LengthPercentageUnit)) {
      intersection.add(unit as LengthPercentageUnit)
    }
  }

  return new LengthPercentageParser(intersection, options) as never
}) as LengthPercentageConstructor['subset']

export { lengthPercentage }
