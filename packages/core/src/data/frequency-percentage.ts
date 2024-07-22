import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension'
import type { InternalParser, Parser } from '../parser'
import { isRecordOrArray } from '../predicates'

const TypeBrand: unique symbol = Symbol('data/frequencyPercentage')

const frequencyPercentageUnits = new Set([
  'Hz',
  'kHz',
  'hz',
  'khz',
  '%',
] as const)
type FrequencyPercentageUnits = typeof frequencyPercentageUnits
type FrequencyPercentageUnit = ValuesOfSet<FrequencyPercentageUnits>

export type FrequencyPercentageInput = `${number}${FrequencyPercentageUnit}`

class FrequencyPercentageValue
  implements InternalDimensionValue<FrequencyPercentageUnit>
{
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: FrequencyPercentageUnit

  constructor(value: number, unit: FrequencyPercentageUnit) {
    this.value = value
    this.unit = unit
  }

  toString(): string {
    return `${this.value}${this.unit}`
  }
}

export function frequencyPercentageValue(
  value: number,
  unit: FrequencyPercentageUnit,
): FrequencyPercentageValue {
  return new FrequencyPercentageValue(value, unit)
}

export function isFrequencyPercentageValue(
  value: unknown,
): value is FrequencyPercentageValue {
  return isRecordOrArray(value) && TypeBrand in value
}

interface FrequencyPercentageOptions extends InternalDimensionOptions {}

class FrequencyPercentageParser
  extends InternalDimensionParser<
    FrequencyPercentageUnits,
    FrequencyPercentageValue
  >
  implements InternalParser<FrequencyPercentageValue>
{
  constructor(options?: FrequencyPercentageOptions) {
    super(
      'frequencyPercentage',
      frequencyPercentageUnits,
      frequencyPercentageValue,
      options,
    )
  }
}
export type { FrequencyPercentageParser, FrequencyPercentageValue }

export function frequencyPercentage(
  options?: FrequencyPercentageOptions,
): Parser<FrequencyPercentageValue, FrequencyPercentageInput> {
  return new FrequencyPercentageParser(options) as never
}
