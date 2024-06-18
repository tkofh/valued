import { InternalNumberParser } from '../internal/number'
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

interface NumberOptions {
  min?: number | false | null | undefined
  max?: number | false | null | undefined
}

class NumberParser implements Parser<NumberValue> {
  #value: NumberValue | null = null
  #parser: InternalNumberParser

  constructor(options?: NumberOptions) {
    this.#parser = new InternalNumberParser(
      options?.min ?? false,
      options?.max ?? false,
    )
  }

  satisfied(state: 'initial' | 'current' = 'current'): boolean {
    return state === 'current' && this.#value !== null
  }

  feed(token: Token): boolean {
    if (token.type === 'literal') {
      const value = this.#parser.parse(token.value)

      if (value !== false) {
        this.#value = numberValue(value)
        return true
      }
    }
    return false
  }

  check(token: Token): boolean {
    return token.type === 'literal' && this.#parser.parse(token.value) !== false
  }

  read(): NumberValue | undefined {
    if (this.#value === null) {
      return undefined
    }

    return this.#value
  }

  reset(): void {
    this.#value = null
  }

  toString(): string {
    return this.#parser.toString()
  }
}

export type { NumberValue, NumberParser }

export function number(options?: NumberOptions): NumberParser {
  return new NumberParser(options)
}
