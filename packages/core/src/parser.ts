import type { Token } from './tokenizer'

export interface Parser<T> {
  satisfied(state?: 'initial' | 'current'): boolean
  feed(token: Token): boolean
  check(token: Token, state?: 'initial' | 'current'): boolean
  read(): T | undefined
  reset(): void
  toString(): string
}

export type ParserValue<T> = T extends Parser<infer U> ? U : never

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
