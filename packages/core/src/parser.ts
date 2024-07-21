import type { Token } from './tokenizer'

export const initialState = 0
export const currentState = 1

export type ParserState = 0 | 1

declare const ParserValueBrand: unique symbol
declare const ParserInputBrand: unique symbol

export interface InternalParser<V> {
  satisfied(state: ParserState): boolean
  feed(token: Token): boolean
  check(token: Token, state: ParserState): boolean
  read(): V | undefined
  reset(): void
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
// T extends Parser<unknown, infer I> ? I : never

export type ParserValue<T extends Parser<unknown, string>> =
  T[typeof ParserValueBrand]
// T extends Parser<infer V, unknown> ? V : never
