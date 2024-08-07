import {
  type InternalDimensionOptions,
  InternalDimensionParser,
  type InternalDimensionValue,
} from '../internal/dimension'
import type { InternalParser, Parser } from '../parser'
import { isRecordOrArray } from '../predicates'

type ValuesOfSet<T extends ReadonlySet<unknown>> = T extends ReadonlySet<
  infer U
>
  ? U
  : never

export type DimensionInput<Unit extends string> = `${number}${Unit}`

const TypeBrand: unique symbol = Symbol('data/dimension')

class DimensionValue<Unit extends string>
  implements InternalDimensionValue<Unit>
{
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: Unit

  constructor(value: number, unit: Unit) {
    this.value = value
    this.unit = unit
  }

  toString(): string {
    return `${this.value}${this.unit}`
  }
}

export function dimensionValue<Unit extends string>(
  value: number,
  unit: Unit,
): DimensionValue<Unit> {
  return new DimensionValue(value, unit)
}

export function isDimensionValue<Unit extends string>(
  value: unknown,
): value is DimensionValue<Unit> {
  return isRecordOrArray(value) && TypeBrand in value
}

interface DimensionOptions extends InternalDimensionOptions {}

class DimensionParser<Units extends ReadonlySet<string>>
  extends InternalDimensionParser<Units, DimensionValue<ValuesOfSet<Units>>>
  implements InternalParser<DimensionValue<ValuesOfSet<Units>>>
{
  constructor(units: Units, options?: DimensionOptions) {
    super('dimension', units, dimensionValue, options)
  }
}

export type { DimensionParser, DimensionValue }

export function dimension<const Units extends ReadonlyArray<string>>(
  units: Units,
  options?: DimensionOptions,
): Parser<DimensionValue<Units[number]>, DimensionInput<Units[number]>> {
  return new DimensionParser(new Set(units), options) as never
}
