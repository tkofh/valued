import { type InternalParser, type ParserState, currentState } from '../parser'
import type { Token } from '../tokenizer'

const infinity = '∞'

export function parseNumericInput(
  input: string,
  min: number,
  max: number,
): number | false {
  const value = Number(input)

  if (Number.isNaN(value)) {
    return false
  }

  if (value < min || value > max) {
    return false
  }

  return value
}

export function stringifyNumericParser(
  label: string,
  min: number,
  max: number,
): string {
  if (min === Number.NEGATIVE_INFINITY && max === Number.POSITIVE_INFINITY) {
    return `<${label}>`
  }

  return `<${label} [${min === Number.NEGATIVE_INFINITY ? `-${infinity}` : String(min)}, ${max === Number.POSITIVE_INFINITY ? infinity : String(max)}]>`
}

export type InternalNumberInput = `${number}`

export class InternalNumberParser<Value> implements InternalParser<Value> {
  readonly #min: number
  readonly #max: number
  readonly #createValue: (value: number) => Value

  #value: Value | null = null

  constructor(min: number, max: number, createValue: (value: number) => Value) {
    this.#min = min
    this.#max = max
    this.#createValue = createValue
  }

  satisfied(state: ParserState): boolean {
    return state === currentState && this.#value !== null
  }

  feed(token: Token): boolean {
    if (token.type === 'literal') {
      const value = parseNumericInput(token.value, this.#min, this.#max)

      if (value !== false && this.checkNumberValue(value)) {
        this.#value = this.#createValue(value)
        return true
      }
    }
    return false
  }

  check(token: Token, state: ParserState): boolean {
    if (token.type !== 'literal') {
      return false
    }

    if (this.#value !== null && state === currentState) {
      return false
    }
    const value = parseNumericInput(token.value, this.#min, this.#max)

    if (value === false) {
      return false
    }

    return this.checkNumberValue(value)
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

  toString(label = 'number') {
    return stringifyNumericParser(label, this.#min, this.#max)
  }

  protected checkNumberValue(_number: number): boolean {
    return true
  }
}
