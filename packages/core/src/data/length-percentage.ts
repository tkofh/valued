import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension'
import type { Parser } from '../parser'
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
  implements
    Parser<
      LengthPercentageValue<ValuesOfSet<Units>>,
      LengthPercentageInput<ValuesOfSet<Units>>
    >
{
  constructor(units: Units, options?: LengthPercentageOptions) {
    super('lengthPercentage', units, lengthPercentageValue, options)
  }
}

export type { LengthPercentageParser, LengthPercentageValue }

type LengthPercentageConstructor = {
  <const Units extends ReadonlyArray<LengthPercentageUnit>>(
    options?: LengthPercentageOptions,
  ): LengthPercentageParser<ReadonlySet<Units[number]>>
  subset<const Units extends ReadonlyArray<LengthPercentageUnit>>(
    units: Units,
    options?: LengthPercentageOptions,
  ): LengthPercentageParser<ReadonlySet<Units[number]>>
}

const lengthPercentage = function lengthPercentage(
  options?: LengthPercentageOptions,
): LengthPercentageParser<LengthPercentageUnits> {
  return new LengthPercentageParser(lengthPercentageUnits, options)
} as LengthPercentageConstructor

lengthPercentage.subset = function lengthPercentageSubset<
  const Units extends ReadonlyArray<string>,
>(
  units: Units,
  options?: LengthPercentageOptions,
): LengthPercentageParser<ReadonlySet<Units[number] & LengthPercentageUnit>> {
  const intersection: Set<Units[number] & LengthPercentageUnit> = new Set()
  for (const unit of units) {
    if (lengthPercentageUnits.has(unit as LengthPercentageUnit)) {
      intersection.add(unit as LengthPercentageUnit)
    }
  }

  return new LengthPercentageParser(intersection, options)
} as LengthPercentageConstructor['subset']

export { lengthPercentage }
