import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension'
import type { Parser } from '../parser'
import { isRecordOrArray } from '../predicates'

const TypeBrand: unique symbol = Symbol('data/angle')

const angleDenominators = new Map([
  ['deg', 360],
  ['grad', 400],
  ['rad', Math.PI * 2],
  ['turn', 1],
] as const)

const angleUnits = new Set(angleDenominators.keys())
type AngleUnits = typeof angleUnits
export type AngleUnit = ValuesOfSet<AngleUnits>

export type AngleInput = `${number}${AngleUnit}`

class AngleValue implements InternalDimensionValue<AngleUnit> {
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: AngleUnit

  readonly normalized: number

  constructor(value: number, unit: AngleUnit) {
    this.value = value
    this.unit = unit

    const denominator = angleDenominators.get(unit)
    if (denominator === undefined) {
      throw new TypeError(`unknown angle unit ${unit}`)
    }

    this.normalized = value / denominator
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
  implements Parser<AngleValue, AngleInput>
{
  constructor(options?: AngleOptions) {
    super('angle', angleUnits, angleValue, options)
  }
}

export type { AngleParser, AngleValue }

export function angle(options?: AngleOptions): AngleParser {
  return new AngleParser(options)
}
