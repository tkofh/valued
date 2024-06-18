import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
  type ValuesOfSet,
} from '../internal/dimension'
import type { Parser } from '../parser'
import { isRecordOrArray } from '../predicates'

const TypeBrand: unique symbol = Symbol('data/anglePercentage')

const anglePercentageUnits = new Set([
  'deg',
  'grad',
  'rad',
  'turn',
  '%',
] as const)
type AnglePercentageUnits = typeof anglePercentageUnits
type AnglePercentageUnit = ValuesOfSet<AnglePercentageUnits>

class AnglePercentageValue
  implements InternalDimensionValue<AnglePercentageUnit>
{
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: AnglePercentageUnit

  constructor(value: number, unit: AnglePercentageUnit) {
    this.value = value
    this.unit = unit
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
  implements Parser<AnglePercentageValue>
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
): AnglePercentageParser {
  return new AnglePercentageParser(options)
}
