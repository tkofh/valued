import type { InternalParser } from '../parser.ts'
import type { Token } from '../tokenizer.ts'
import { parseNumericInput, stringifyNumericParser } from './number.ts'

export type ValuesOfSet<T extends ReadonlySet<unknown>> =
  T extends ReadonlySet<infer U> ? U : never

export interface InternalDimensionValue<Unit extends string> {
  readonly value: number
  readonly unit: Unit
}

export type InternalDimensionInput<Units extends string> = `${number}${Units}`

export interface InternalDimensionOptions {
  minValue?: number | false | null | undefined
  maxValue?: number | false | null | undefined
}

export class InternalDimensionParser<
  Units extends ReadonlySet<string>,
  Value extends InternalDimensionValue<Unit>,
  Unit extends ValuesOfSet<Units> = ValuesOfSet<Units>,
> implements InternalParser<Value> {
  readonly units: ReadonlySet<string>

  readonly #createValue: (value: number, unit: Unit) => Value
  readonly #label: string
  readonly #min: number
  readonly #max: number

  constructor(
    label: string,
    units: Units,
    createValue: (value: number, unit: Unit) => Value,
    options?: InternalDimensionOptions,
  ) {
    this.units = new Set(units)
    this.#createValue = createValue

    this.#label = label

    this.#min =
      options?.minValue == null || options.minValue === false
        ? Number.NEGATIVE_INFINITY
        : options.minValue
    this.#max =
      options?.maxValue == null || options.maxValue === false
        ? Number.POSITIVE_INFINITY
        : options.maxValue
  }

  init(): undefined {
    return undefined
  }

  feed(state: unknown, token: Token): unknown | null {
    if (state !== undefined) {
      return null
    }
    if (token.type !== 'literal') {
      return null
    }
    for (const unit of this.units) {
      if (token.value.endsWith(unit)) {
        const value = parseNumericInput(
          token.value.slice(0, -unit.length),
          this.#min,
          this.#max,
        )

        if (value !== false) {
          return this.#createValue(value, unit as Unit)
        }
      }
    }
    return null
  }

  read(state: unknown): Value | undefined {
    return state as Value | undefined
  }

  toString(): string {
    return stringifyNumericParser(this.#label, this.#min, this.#max)
  }
}
