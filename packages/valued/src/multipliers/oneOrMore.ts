import { Range } from '../internal/range.ts'
import type { AnyParser, Parser, ParserInput, ParserValue } from '../parser.ts'

/**
 * The accepted-input type of a {@link oneOrMore} parser: `P`'s input, widened
 * to any string because the repetition count is unbounded.
 */
export type OneOrMoreInput<P extends AnyParser> = ParserInput<P> | (string & {})

/** The value type of a {@link oneOrMore} parser: a non-empty array of `P`'s values. */
export type OneOrMoreValue<P extends AnyParser> = ReadonlyArray<
  ParserValue<P>
> & { 0: ParserValue<P> }

class OneOrMore<P extends AnyParser, C extends boolean> extends Range<
  P,
  C,
  1,
  number
> {
  constructor(parser: P, commaSeparated: C) {
    super(parser, 1, false, commaSeparated)
  }
}

interface OneOrMoreOptions {
  /**
   * Require a comma between repetitions — the `#` variant from the spec.
   *
   * @default false
   */
  commaSeparated?: boolean
}

/**
 * Match `parser` one or more times — the `+` multiplier from the Value
 * Definition Syntax, or `#` when `commaSeparated` is set.
 *
 * Repetitions are whitespace-separated by default. Pass
 * `{ commaSeparated: true }` for the comma-separated `#` variant, where a
 * comma is required between repetitions and a leading or trailing comma fails.
 * The result is a non-empty array of `parser`'s values.
 *
 * @param parser - the parser to repeat
 * @param options - `commaSeparated` selects the `#` variant
 * @returns a parser yielding a non-empty array of `parser`'s values
 *
 * @example
 * ```ts
 * // <length>+
 * parse('1px 2px', oneOrMore(length())) // [LengthValue, LengthValue]
 *
 * // <length>#
 * const list = oneOrMore(length(), { commaSeparated: true })
 * parse('1px, 2px', list) // [LengthValue, LengthValue]
 * parse('1px 2px', list)  // { valid: false } — comma required
 * ```
 */
export function oneOrMore<
  P extends AnyParser,
  const Options extends OneOrMoreOptions,
>(parser: P, options?: Options): Parser<OneOrMoreValue<P>, OneOrMoreInput<P>> {
  return new OneOrMore(parser, options?.commaSeparated ?? false) as never
}
