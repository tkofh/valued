import { type Token, tokenize } from './tokenizer'

export const initialState = 0
export const currentState = 1

export type ParserState = 0 | 1

export interface Parser<V, I extends string> {
  satisfied(state: ParserState): boolean
  feed(token: Token): boolean
  check(token: Token, state: ParserState): boolean
  read(): V | undefined
  reset(): void
  toString(): string
  parse(input: I): ParseResult<V>
}

export type AnyParser = Parser<unknown, string>

export type ParserInput<T> = T extends Parser<unknown, infer I> ? I : never

export type ParserValue<T> = T extends Parser<infer V, string> ? V : never

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

export abstract class BaseParser<V, I extends string>
  implements Pick<Parser<V, I>, 'feed' | 'reset' | 'read'>
{
  parse(input: I): ParseResult<V> {
    try {
      for (const token of tokenize(input)) {
        if (!this.feed(token)) {
          return invalid()
        }
      }

      const parsed = this.read()

      if (parsed === undefined) {
        return invalid()
      }

      return valid(parsed as V)
    } finally {
      this.reset()
    }
  }

  abstract read(): V | undefined
  abstract feed(token: Token): boolean
  abstract reset(): void
}
