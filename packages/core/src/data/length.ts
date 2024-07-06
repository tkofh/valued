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

export type LengthInput = `${number}${LengthUnit}`

class LengthValue implements InternalDimensionValue<LengthUnit> {
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: LengthUnit

  constructor(value: number, unit: LengthUnit) {
    this.value = value
    this.unit = unit
  }
}

export function lengthValue(value: number, unit: LengthUnit): LengthValue {
  return new LengthValue(value, unit)
}

export function isLengthValue(value: unknown): value is LengthValue {
  return isRecordOrArray(value) && TypeBrand in value
}

interface LengthOptions extends InternalDimensionOptions {}

class LengthParser
  extends InternalDimensionParser<LengthUnits, LengthValue>
  implements Parser<LengthValue, LengthInput>
{
  constructor(options?: LengthOptions) {
    super('length', lengthUnits, lengthValue, options)
  }
}

export type { LengthParser, LengthValue }

export function length(options?: LengthOptions): LengthParser {
  return new LengthParser(options)
}
