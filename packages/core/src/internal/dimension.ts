import type { Parser } from '../parser'
import type { Token } from '../tokenizer'
import { InternalNumberParser } from './number'

export type ValuesOfSet<T extends ReadonlySet<unknown>> = T extends ReadonlySet<
  infer U
>
  ? U
  : never

export interface InternalDimensionValue<Unit extends string> {
  readonly value: number
  readonly unit: Unit
}

export interface InternalDimensionOptions {
  minValue?: number | false | null | undefined
  maxValue?: number | false | null | undefined
}

export class InternalDimensionParser<
  Units extends ReadonlySet<string>,
  Value extends InternalDimensionValue<ValuesOfSet<Units>>,
> implements Parser<InternalDimensionValue<ValuesOfSet<Units>>>
{
  readonly units: ReadonlySet<string>

  #value: Value | null = null
  readonly #createValue: (value: number, unit: ValuesOfSet<Units>) => Value
  readonly #numberParser: InternalNumberParser
  readonly #label: string

  constructor(
    label: string,
    units: Units,
    createValue: (value: number, unit: ValuesOfSet<Units>) => Value,
    options?: InternalDimensionOptions,
  ) {
    this.units = new Set(units)
    this.#createValue = createValue
    this.#numberParser = new InternalNumberParser(
      options?.minValue ?? false,
      options?.maxValue ?? false,
    )
    this.#label = label
  }

  satisfied(state: 'initial' | 'current' = 'current'): boolean {
    return state === 'current' && this.#value !== null
  }

  feed(token: Token): boolean {
    if (this.#value !== null) {
      return false
    }

    if (token.type === 'literal') {
      for (const unit of this.units) {
        if (token.value.endsWith(unit)) {
          const value = this.#numberParser.parse(
            token.value.slice(0, -unit.length),
          )

          if (value !== false) {
            this.#value = this.#createValue(value, unit as ValuesOfSet<Units>)
            return true
          }
        }
      }
    }
    return false
  }

  check(token: Token, state: 'initial' | 'current'): boolean {
    if (this.#value !== null && state === 'current') {
      return false
    }

    if (token.type === 'literal') {
      for (const unit of this.units) {
        if (token.value.endsWith(unit)) {
          const value = this.#numberParser.parse(
            token.value.slice(0, -unit.length),
          )

          return value !== false
        }
      }
    }

    return false
  }

  read(): Value | undefined {
    if (this.#value === null) {
      return undefined
    }

    return this.#value
  }

  reset(): void {
    this.#value = null
  }

  toString(): string {
    return this.#numberParser.toString(this.#label)
  }
}
