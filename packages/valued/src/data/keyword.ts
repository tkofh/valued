import type { InternalParser, Parser } from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'
import type { Token } from '../tokenizer.ts'

const TypeBrand: unique symbol = Symbol('data/keyword')

class KeywordValue<Value extends string> {
  readonly [TypeBrand] = TypeBrand

  readonly value: Value

  constructor(value: Value) {
    this.value = value
  }

  toString(): string {
    return this.value
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

class KeywordParser<Value extends string> implements InternalParser<
  KeywordValue<Value>
> {
  readonly keywords: ReadonlySet<Value>

  constructor(keywords: ReadonlySet<Value>) {
    this.keywords = keywords
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
    if (!this.keywords.has(token.value as Value)) {
      return null
    }
    return keywordValue(token.value as Value)
  }

  read(state: unknown): KeywordValue<Value> | undefined {
    return state as KeywordValue<Value> | undefined
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
