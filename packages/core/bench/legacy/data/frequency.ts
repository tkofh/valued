import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension'
import type { InternalParser, Parser } from '../parser'
import { isRecordOrArray } from '../predicates'

const TypeBrand: unique symbol = Symbol('data/frequency')

const frequencyUnits = new Set(['Hz', 'kHz', 'hz', 'khz'] as const)
type FrequencyUnits = typeof frequencyUnits
type FrequencyUnit = ValuesOfSet<FrequencyUnits>

export type FrequencyInput = `${number}${FrequencyUnit}`

class FrequencyValue implements InternalDimensionValue<FrequencyUnit> {
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: FrequencyUnit

  constructor(value: number, unit: FrequencyUnit) {
    this.value = value
    this.unit = unit
  }

  toString(): string {
    return `${this.value}${this.unit}`
  }
}

export function frequencyValue(
  value: number,
  unit: FrequencyUnit,
): FrequencyValue {
  return new FrequencyValue(value, unit)
}

export function isFrequencyValue(value: unknown): value is FrequencyValue {
  return isRecordOrArray(value) && TypeBrand in value
}

interface FrequencyOptions extends InternalDimensionOptions {}

class FrequencyParser
  extends InternalDimensionParser<FrequencyUnits, FrequencyValue>
  implements InternalParser<FrequencyValue>
{
  constructor(options?: FrequencyOptions) {
    super('frequency', frequencyUnits, frequencyValue, options)
  }
}

export type { FrequencyParser, FrequencyValue }

export function frequency(
  options?: FrequencyOptions,
): Parser<FrequencyValue, FrequencyInput> {
  return new FrequencyParser(options) as never
}
