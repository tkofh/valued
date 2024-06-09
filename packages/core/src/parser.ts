import type { Token } from './tokenizer'

export const NOT_SATISFIED = 0
export const SATISFIED = 1
export const FULL = 2

export type ParserState = 0 | 1 | 2

export interface Parser<T> {
  readonly domain: ReadonlySet<string>
  readonly state: ParserState
  feed(token: Token): boolean
  flush(): T | undefined
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
