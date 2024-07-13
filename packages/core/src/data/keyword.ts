import {
  type InternalParser,
  type Parser,
  type ParserState,
  currentState,
  initialState,
} from '../parser'
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
  implements InternalParser<KeywordValue<Value>>
{
  readonly keywords: ReadonlySet<Value>

  #value: KeywordValue<Value> | null = null

  constructor(keywords: ReadonlySet<Value>) {
    this.keywords = keywords
  }

  satisfied(state: ParserState): boolean {
    return state === currentState && this.#value !== null
  }

  feed(token: Token): boolean {
    if (
      token.type === 'literal' &&
      this.keywords.has(token.value as Value) &&
      this.#value === null
    ) {
      this.#value = keywordValue(token.value as Value)
      return true
    }
    return false
  }

  check(token: Token, state: ParserState): boolean {
    return (
      token.type === 'literal' &&
      this.keywords.has(token.value as Value) &&
      (state === initialState || this.#value === null)
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
    return Array.from(this.keywords).join(' | ')
  }
}

export type { KeywordParser, KeywordValue }

export function keyword<const Value extends string>(
  value: Value,
): Parser<KeywordValue<Value>, Value> {
  return new KeywordParser(new Set([value])) as never
}

export function keywords<const Values extends ReadonlyArray<string>>(
  values: Values,
): Parser<KeywordValue<Values[number]>, Values[number]> {
  return new KeywordParser(new Set(values)) as never
}
