import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension'
import type { Parser } from '../parser'
import { isRecordOrArray } from '../predicates'

const TypeBrand: unique symbol = Symbol('data/percentage')

const percentageUnits = new Set(['%'] as const)
type PercentageUnits = typeof percentageUnits
type PercentageUnit = ValuesOfSet<PercentageUnits>

class PercentageValue implements InternalDimensionValue<PercentageUnit> {
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: PercentageUnit

  constructor(value: number) {
    this.value = value
    this.unit = '%'
  }
}

export function percentageValue(value: number): PercentageValue {
  return new PercentageValue(value)
}

export function isPercentageValue(value: unknown): value is PercentageValue {
  return isRecordOrArray(value) && TypeBrand in value
}

interface PercentageOptions extends InternalDimensionOptions {}

class PercentageParser
  extends InternalDimensionParser<PercentageUnits, PercentageValue>
  implements Parser<PercentageValue>
{
  constructor(options?: PercentageOptions) {
    super('percentage', percentageUnits, percentageValue, options)
  }
}

export type { PercentageParser, PercentageValue }

export function percentage(options?: PercentageOptions): PercentageParser {
  return new PercentageParser(options)
}
