import type { Parser } from '../parser'
import { isRecordOrArray } from '../predicates'
import type { Token } from '../tokenizer'

const TypeBrand: unique symbol = Symbol('data/keyword')

class KeywordValue<Value extends string> {
  readonly [TypeBrand] = TypeBrand

  readonly value: Value

  constructor(value: Value) {
    this.value = value
  }
}

export function keywordValue<Value extends string>(
  value: Value,
): KeywordValue<Value> {
  return new KeywordValue(value)
}

export function isKeywordValue<Value extends string>(
  value: unknown,
): value is KeywordValue<Value> {
  return isRecordOrArray(value) && TypeBrand in value
}

class KeywordParser<Value extends string>
  implements Parser<KeywordValue<Value>>
{
  readonly keyword: string

  #value: KeywordValue<Value> | null = null

  constructor(keyword: Value) {
    this.keyword = keyword
  }

  satisfied(state: 'initial' | 'current' = 'current'): boolean {
    return state === 'current' && this.#value !== null
  }

  feed(token: Token): boolean {
    if (
      token.type === 'literal' &&
      token.value === this.keyword &&
      this.#value === null
    ) {
      this.#value = keywordValue(token.value as Value)
      return true
    }
    return false
  }

  check(token: Token, state: 'initial' | 'current'): boolean {
    return (
      token.type === 'literal' &&
      token.value === this.keyword &&
      (state === 'initial' || this.#value === null)
    )
  }

  read(): KeywordValue<Value> | undefined {
    if (this.#value === null) {
      return undefined
    }

    return this.#value
  }

  reset(): void {
    this.#value = null
  }

  toString(): string {
    return this.keyword
  }
}

export type { KeywordParser, KeywordValue }

export function keyword<Value extends string>(
  value: Value,
): KeywordParser<Value> {
  return new KeywordParser(value)
}
