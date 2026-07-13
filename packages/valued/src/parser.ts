import type { Token } from './tokenizer.ts'

declare const ParserValueBrand: unique symbol
declare const ParserInputBrand: unique symbol

// The streaming protocol every parser implements. `parse()` drives it: `init`
// seeds the state, `feed` advances it one token at a time (returning `null` to
// reject the token), and `read` collapses a state into a parsed value or
// `undefined` if the tokens seen so far are not yet a complete match.
export interface InternalParser<V> {
  init(): unknown
  feed(state: unknown, token: Token): unknown | null
  read(state: unknown): V | undefined
  toString(): string
}

/**
 * A parser produced by a combinator, data-type, or multiplier factory, ready
 * to hand to {@link parse}.
 *
 * The two type parameters are phantom (carried at compile time only): `V` is
 * the value {@link parse} yields on success, and `I` is the set of input
 * strings the parser accepts, expressed as a template-literal type so an
 * editor can autocomplete keyword-heavy grammars. Recover them from a built
 * parser with {@link ParserValue} and {@link ParserInput}.
 */
export interface Parser<V, I extends string> extends InternalParser<V> {
  [ParserValueBrand]: V
  [ParserInputBrand]: I
}

export type AnyParser = Parser<unknown, string>

/**
 * The result of a {@link parse} call: a discriminated union on `valid`. Narrow
 * on `valid === true` before reading `value`; the failure case carries no
 * value and no error detail.
 *
 * @example
 * ```ts
 * const result: ParseResult<LengthValue<'px'>> = parse('12px', length())
 * if (result.valid) {
 *   result.value.value // 12
 * }
 * ```
 */
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

/**
 * The set of input strings a parser accepts, as a template-literal type.
 *
 * Use it to surface a parser's accepted input on your own public API without
 * restating the grammar by hand.
 *
 * @example
 * ```ts
 * const border = someOf([length(), lineStyle(), color()])
 * type BorderInput = ParserInput<typeof border>
 * ```
 */
export type ParserInput<T extends Parser<unknown, string>> =
  T[typeof ParserInputBrand]

/**
 * The value a parser yields on a successful {@link parse} — the `value` field
 * of its `{ valid: true }` result.
 *
 * @example
 * ```ts
 * const border = someOf([length(), lineStyle(), color()])
 * type BorderValue = ParserValue<typeof border>
 * // [LengthValue | null, LineStyleValue | null, ColorValue | null]
 * ```
 */
export type ParserValue<T extends Parser<unknown, string>> =
  T[typeof ParserValueBrand]
