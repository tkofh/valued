import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension'
import type { Parser } from '../parser'
import { isRecordOrArray } from '../predicates'

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

export type LengthInput<Unit extends string> = `${number}${Unit}`

class LengthValue<Unit extends LengthUnit>
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

export function lengthValue<Unit extends LengthUnit>(
  value: number,
  unit: Unit,
): LengthValue<Unit> {
  return new LengthValue(value, unit)
}

export function isLengthValue<Unit extends LengthUnit>(
  value: unknown,
): value is LengthValue<Unit> {
  return isRecordOrArray(value) && TypeBrand in value
}

interface LengthOptions extends InternalDimensionOptions {}

class LengthParser<Units extends ReadonlySet<LengthUnit>>
  extends InternalDimensionParser<Units, LengthValue<ValuesOfSet<Units>>>
  implements
    Parser<LengthValue<ValuesOfSet<Units>>, LengthInput<ValuesOfSet<Units>>>
{
  constructor(units: Units, options?: LengthOptions) {
    super('length', units, lengthValue, options)
  }
}

export type { LengthParser, LengthValue }

type LengthConstructor = {
  <const Units extends ReadonlyArray<LengthUnit>>(
    options?: LengthOptions,
  ): LengthParser<ReadonlySet<Units[number]>>
  subset<const Units extends ReadonlyArray<LengthUnit>>(
    units: Units,
    options?: LengthOptions,
  ): LengthParser<ReadonlySet<Units[number]>>
}

const length = function length(
  options?: LengthOptions,
): LengthParser<LengthUnits> {
  return new LengthParser(lengthUnits, options)
} as LengthConstructor

length.subset = function lengthSubset<
  const Units extends ReadonlyArray<string>,
>(
  units: Units,
  options?: LengthOptions,
): LengthParser<ReadonlySet<Units[number] & LengthUnit>> {
  const intersection: Set<Units[number] & LengthUnit> = new Set()
  for (const unit of units) {
    if (lengthUnits.has(unit as LengthUnit)) {
      intersection.add(unit as LengthUnit)
    }
  }

  return new LengthParser(intersection, options)
} as LengthConstructor['subset']

export { length }
