import type { InternalParser } from '../parser.ts'
import type { Token } from '../tokenizer.ts'

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

  constructor(min: number, max: number, createValue: (value: number) => Value) {
    this.#min = min
    this.#max = max
    this.#createValue = createValue
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
    const value = parseNumericInput(token.value, this.#min, this.#max)
    if (value === false) {
      return null
    }
    if (!this.checkNumberValue(value)) {
      return null
    }
    return this.#createValue(value)
  }

  read(state: unknown): Value | undefined {
    return state as Value | undefined
  }

  toString(label = 'number'): string {
    return stringifyNumericParser(label, this.#min, this.#max)
  }

  protected checkNumberValue(_number: number): boolean {
    return true
  }
}
