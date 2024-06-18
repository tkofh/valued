import { InternalNumberParser } from '../internal/number'
import type { Parser } from '../parser'
import { isRecordOrArray } from '../predicates'
import type { Token } from '../tokenizer'

const TypeBrand: unique symbol = Symbol('data/integer')

class IntegerValue {
  readonly [TypeBrand] = TypeBrand

  readonly value: number

  constructor(value: number) {
    this.value = value
  }
}

export function integerValue(value: number): IntegerValue {
  return new IntegerValue(value)
}

export function isIntegerValue(value: unknown): value is IntegerValue {
  return isRecordOrArray(value) && TypeBrand in value
}

interface IntegerOptions {
  min?: number | false | null | undefined
  max?: number | false | null | undefined
}

class IntegerParser implements Parser<IntegerValue> {
  #value: IntegerValue | null = null
  #parser: InternalNumberParser

  constructor(options?: IntegerOptions) {
    this.#parser = new InternalNumberParser(
      options?.min ?? false,
      options?.max ?? false,
    )
  }

  satisfied(state: 'initial' | 'current' = 'current'): boolean {
    return state === 'current' && this.#value !== null
  }

  feed(token: Token): boolean {
    if (this.#value !== null) {
      return false
    }

    if (token.type !== 'literal') {
      return false
    }

    const value = this.#parser.parse(token.value)

    if (value !== false && Math.round(value) === value) {
      this.#value = integerValue(value)
      return true
    }

    return false
  }

  check(token: Token, state: 'current' | 'initial'): boolean {
    if (this.#value !== null && state === 'current') {
      return false
    }

    if (token.type !== 'literal') {
      return false
    }

    const value = this.#parser.parse(token.value)
    return value !== false && Math.round(value) === value
  }

  read(): IntegerValue | undefined {
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

export type { IntegerValue, IntegerParser }

export function integer(options?: IntegerOptions): IntegerParser {
  return new IntegerParser(options)
}
