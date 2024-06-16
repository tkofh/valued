import type { Parser } from '../parser'
import { isRecordOrArray } from '../predicates'
import type { Token } from '../tokenizer'

const TypeBrand: unique symbol = Symbol('data/number')

class NumberValue {
  readonly [TypeBrand] = TypeBrand

  readonly value: number

  constructor(value: number) {
    this.value = value
  }
}

export function numberValue(value: number): NumberValue {
  return new NumberValue(value)
}

export function isNumberValue(value: unknown): value is NumberValue {
  return isRecordOrArray(value) && TypeBrand in value
}

class NumberParser implements Parser<NumberValue> {
  #value: NumberValue | null = null

  get isSatisfied(): boolean {
    return this.#value !== null
  }

  feed(token: Token): boolean {
    if (token.type === 'literal') {
      const value = Number.parseFloat(token.value)

      if (!Number.isNaN(value)) {
        this.#value = numberValue(value)
        return true
      }
    }
    return false
  }

  flush(): NumberValue | undefined {
    if (this.#value === null) {
      return undefined
    }

    return this.#value
  }

  reset(): void {
    this.#value = null
  }

  toString(): string {
    return '<number>'
  }
}

export type { NumberValue, NumberParser }

export function number(): NumberParser {
  return new NumberParser()
}
