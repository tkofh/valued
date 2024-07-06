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

export type LengthPercentageInput = `${number}${LengthPercentageUnit}`

class LengthPercentageValue
  implements InternalDimensionValue<LengthPercentageUnit>
{
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: LengthPercentageUnit

  constructor(value: number, unit: LengthPercentageUnit) {
    this.value = value
    this.unit = unit
  }
}

export function lengthPercentageValue(
  value: number,
  unit: LengthPercentageUnit,
): LengthPercentageValue {
  return new LengthPercentageValue(value, unit)
}

export function isLengthPercentageValue(
  value: unknown,
): value is LengthPercentageValue {
  return isRecordOrArray(value) && TypeBrand in value
}

interface LengthPercentageOptions extends InternalDimensionOptions {}

class LengthPercentageParser
  extends InternalDimensionParser<LengthPercentageUnits, LengthPercentageValue>
  implements Parser<LengthPercentageValue, LengthPercentageInput>
{
  constructor(options?: LengthPercentageOptions) {
    super(
      'lengthPercentage',
      lengthPercentageUnits,
      lengthPercentageValue,
      options,
    )
  }
}

export type { LengthPercentageParser, LengthPercentageValue }

export function lengthPercentage(
  options?: LengthPercentageOptions,
): LengthPercentageParser {
  return new LengthPercentageParser(options)
}
