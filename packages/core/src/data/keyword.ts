import {
  BaseParser,
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
  extends BaseParser<KeywordValue<Value>, Value>
  implements Parser<KeywordValue<Value>, Value>
{
  readonly keywords: ReadonlySet<Value>

  #value: KeywordValue<Value> | null = null

  constructor(keywords: ReadonlySet<Value>) {
    super()
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

  override toString(): string {
    return Array.from(this.keywords).join(' | ')
  }
}

export type { KeywordParser, KeywordValue }

export function keyword<const Value extends string>(
  value: Value,
): KeywordParser<Value> {
  return new KeywordParser(new Set([value]))
}

export function keywords<const Values extends ReadonlyArray<string>>(
  values: Values,
): KeywordParser<Values[number]> {
  return new KeywordParser(new Set(values))
}
