import { FULL, NOT_SATISFIED, type Parser, type ParserState } from '../parser'
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

class Keyword<Value extends string> implements Parser<KeywordValue<Value>> {
  readonly keyword: string

  readonly domain: ReadonlySet<string>

  #value: KeywordValue<Value> | null = null

  get state(): ParserState {
    return this.#value === null ? NOT_SATISFIED : FULL
  }

  constructor(keyword: Value) {
    this.keyword = keyword

    this.domain = new Set([this.keyword])
  }

  feed(token: Token): boolean {
    if (token.type === 'literal' && token.value === this.keyword) {
      this.#value = keywordValue(token.value as Value)
      return true
    }

    return false
  }

  flush(): KeywordValue<Value> | undefined {
    if (this.#value === null) {
      return undefined
    }

    return this.#value
  }

  reset() {
    this.#value = null
  }

  toString(): string {
    return this.keyword
  }
}

export function keyword<Value extends string>(value: Value): Keyword<Value> {
  return new Keyword(value)
}
