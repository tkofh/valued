import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension'
import type { Parser } from '../parser'
import { isRecordOrArray } from '../predicates'

const TypeBrand: unique symbol = Symbol('data/angle')

const angleUnits = new Set(['deg', 'grad', 'rad', 'turn'] as const)
type AngleUnits = typeof angleUnits
type AngleUnit = ValuesOfSet<AngleUnits>

class AngleValue implements InternalDimensionValue<AngleUnit> {
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: AngleUnit

  constructor(value: number, unit: AngleUnit) {
    this.value = value
    this.unit = unit
  }
}

export function angleValue(value: number, unit: AngleUnit): AngleValue {
  return new AngleValue(value, unit)
}

export function isAngleValue(value: unknown): value is AngleValue {
  return isRecordOrArray(value) && TypeBrand in value
}

interface AngleOptions extends InternalDimensionOptions {}

class AngleParser
  extends InternalDimensionParser<AngleUnits, AngleValue>
  implements Parser<AngleValue>
{
  constructor(options?: AngleOptions) {
    super('angle', angleUnits, angleValue, options)
  }
}

export type { AngleParser, AngleValue }

export function angle(options?: AngleOptions): AngleParser {
  return new AngleParser(options)
}
