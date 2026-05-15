import type { Token } from './tokenizer.ts'

declare const ParserValueBrand: unique symbol
declare const ParserInputBrand: unique symbol

export interface InternalParser<V> {
  init(): unknown
  feed(state: unknown, token: Token): unknown | null
  read(state: unknown): V | undefined
  toString(): string
}

export interface Parser<V, I extends string> extends InternalParser<V> {
  [ParserValueBrand]: V
  [ParserInputBrand]: I
}

export type AnyParser = Parser<unknown, string>

export type ParseResult<T> =
  | {
      valid: false
    }
  | {
      valid: true
      value: T
    }

export function valid<T>(value: T): ParseResult<T> {
  return { valid: true, value }
}

const _invalid: ParseResult<never> = { valid: false }

export function invalid<T>(): ParseResult<T> {
  return _invalid
}

export type ParserInput<T extends Parser<unknown, string>> =
  T[typeof ParserInputBrand]

export type ParserValue<T extends Parser<unknown, string>> =
  T[typeof ParserValueBrand]
