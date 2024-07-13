import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension'
import type { InternalParser, Parser } from '../parser'
import { isRecordOrArray } from '../predicates'

const TypeBrand: unique symbol = Symbol('data/anglePercentage')

const anglePercentageDenominators = new Map([
  ['deg', 360],
  ['grad', 400],
  ['rad', Math.PI * 2],
  ['turn', 1],
  ['%', 100],
] as const)

const anglePercentageUnits = new Set(anglePercentageDenominators.keys())

type AnglePercentageUnits = typeof anglePercentageUnits
type AnglePercentageUnit = ValuesOfSet<AnglePercentageUnits>

export type AnglePercentageInput = `${number}${AnglePercentageUnit}`

class AnglePercentageValue
  implements InternalDimensionValue<AnglePercentageUnit>
{
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: AnglePercentageUnit

  readonly normalized: number

  constructor(value: number, unit: AnglePercentageUnit) {
    this.value = value
    this.unit = unit

    const denominator = anglePercentageDenominators.get(unit)
    if (denominator === undefined) {
      throw new TypeError(`unknown angle unit ${unit}`)
    }

    this.normalized = value / denominator
  }
}

export function anglePercentageValue(
  value: number,
  unit: AnglePercentageUnit,
): AnglePercentageValue {
  return new AnglePercentageValue(value, unit)
}

export function isAnglePercentageValue(
  value: unknown,
): value is AnglePercentageValue {
  return isRecordOrArray(value) && TypeBrand in value
}

interface AnglePercentageOptions extends InternalDimensionOptions {}

class AnglePercentageParser
  extends InternalDimensionParser<AnglePercentageUnits, AnglePercentageValue>
  implements InternalParser<AnglePercentageValue>
{
  constructor(options?: AnglePercentageOptions) {
    super(
      'angle-percentage',
      anglePercentageUnits,
      anglePercentageValue,
      options,
    )
  }
}

export type { AnglePercentageParser, AnglePercentageValue }

export function anglePercentage(
  options?: AnglePercentageOptions,
): Parser<AnglePercentageValue, AnglePercentageInput> {
  return new AnglePercentageParser(options) as never
}
