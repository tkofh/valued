import { type Parser, type ParserState, currentState } from '../parser'
import { BaseParser } from '../parser'
import type { Token } from '../tokenizer'
import { parseNumericInput, stringifyNumericParser } from './number'

export type ValuesOfSet<T extends ReadonlySet<unknown>> = T extends ReadonlySet<
  infer U
>
  ? U
  : never

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
  >
  extends BaseParser<Value, InternalDimensionInput<Unit>>
  implements Parser<Value, InternalDimensionInput<Unit>>
{
  readonly units: ReadonlySet<string>

  #value: Value | null = null
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
    super()
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

  satisfied(state: ParserState): boolean {
    return state === currentState && this.#value !== null
  }

  feed(token: Token): boolean {
    if (this.#value !== null) {
      return false
    }

    if (token.type === 'literal') {
      for (const unit of this.units) {
        if (token.value.endsWith(unit)) {
          const value = parseNumericInput(
            token.value.slice(0, -unit.length),
            this.#min,
            this.#max,
          )

          if (value !== false) {
            this.#value = this.#createValue(value, unit as Unit)
            return true
          }
        }
      }
    }
    return false
  }

  check(token: Token, state: ParserState): boolean {
    if (this.#value !== null && state === currentState) {
      return false
    }

    if (token.type === 'literal') {
      for (const unit of this.units) {
        if (token.value.endsWith(unit)) {
          const value = parseNumericInput(
            token.value.slice(0, -unit.length),
            this.#min,
            this.#max,
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

  override toString(): string {
    return stringifyNumericParser(this.#label, this.#min, this.#max)
  }
}
