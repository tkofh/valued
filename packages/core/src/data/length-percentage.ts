import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension'
import type { InternalParser, Parser } from '../parser'
import { isRecordOrArray } from '../predicates'

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

export type LengthPercentageInput<Unit extends LengthPercentageUnit> =
  `${number}${Unit}`

class LengthPercentageValue<Unit extends LengthPercentageUnit>
  implements InternalDimensionValue<Unit>
{
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

export function lengthPercentageValue<Unit extends LengthPercentageUnit>(
  value: number,
  unit: Unit,
): LengthPercentageValue<Unit> {
  return new LengthPercentageValue(value, unit)
}

export function isLengthPercentageValue<Unit extends LengthPercentageUnit>(
  value: unknown,
): value is LengthPercentageValue<Unit> {
  return isRecordOrArray(value) && TypeBrand in value
}

interface LengthPercentageOptions extends InternalDimensionOptions {}

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
