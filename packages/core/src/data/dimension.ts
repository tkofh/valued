import type { Parser } from '../parser'
import { isRecordOrArray } from '../predicates'
import type { Token } from '../tokenizer'

type ValuesOfSet<T extends ReadonlySet<unknown>> = T extends ReadonlySet<
  infer U
>
  ? U
  : never

const TypeBrand: unique symbol = Symbol('data/dimension')

class DimensionValue<Unit extends string> {
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly unit: Unit

  constructor(value: number, unit: Unit) {
    this.value = value
    this.unit = unit
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

class Dimension<Units extends ReadonlySet<string>>
  implements Parser<DimensionValue<ValuesOfSet<Units>>>
{
  readonly units: ReadonlySet<string>

  #value: DimensionValue<ValuesOfSet<Units>> | null = null

  constructor(units: Units) {
    this.units = new Set(units)
  }

  get isSatisfied(): boolean {
    return this.#value !== null
  }

  feed(token: Token): boolean {
    if (token.type === 'literal') {
      for (const unit of this.units) {
        if (token.value.endsWith(unit)) {
          const value = Number.parseFloat(token.value.slice(0, -unit.length))

          if (!Number.isNaN(value)) {
            this.#value = dimensionValue(value, unit as ValuesOfSet<Units>)
            return true
          }
        }
      }
    }
    return false
  }

  flush(): DimensionValue<ValuesOfSet<Units>> | undefined {
    if (this.#value === null) {
      return undefined
    }

    return this.#value
  }

  reset(): void {
    this.#value = null
  }

  toString(): string {
    return '<dimension>'
  }
}

export function dimension<const Units extends ReadonlyArray<string>>(
  units: Units,
): Dimension<ReadonlySet<Units[number]>> {
  return new Dimension(new Set(units))
}
