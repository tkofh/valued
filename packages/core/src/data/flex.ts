import {
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension'
import type { InternalParser, Parser } from '../parser'
import { isRecordOrArray } from '../predicates'

const TypeBrand: unique symbol = Symbol('data/flex')

const flexUnits = new Set(['fr'] as const)
type FlexUnits = typeof flexUnits
type FlexUnit = ValuesOfSet<FlexUnits>

export type FlexInput = `${number}${FlexUnit}`

class FlexValue implements InternalDimensionValue<FlexUnit> {
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: FlexUnit

  constructor(value: number, unit: FlexUnit) {
    this.value = value
    this.unit = unit
  }
}

export function flexValue(value: number, unit: FlexUnit): FlexValue {
  return new FlexValue(value, unit)
}

export function isFlexValue(value: unknown): value is FlexValue {
  return isRecordOrArray(value) && TypeBrand in value
}

class FlexParser
  extends InternalDimensionParser<FlexUnits, FlexValue>
  implements InternalParser<FlexValue>
{
  constructor() {
    super('flex', flexUnits, flexValue)
  }

  override toString(): string {
    return '<flex>'
  }
}

export type { FlexParser, FlexValue }

export function flex(): Parser<FlexValue, FlexInput> {
  return new FlexParser() as never
}
