import { Range } from '../internal/range.ts'
import type { AnyParser, Parser, ParserInput, ParserValue } from '../parser.ts'

/** The value type of a {@link zeroOrMore} parser: an array of `P`'s values, possibly empty. */
export type ZeroOrMoreValue<P extends AnyParser> = ReadonlyArray<ParserValue<P>>

/**
 * The accepted-input type of a {@link zeroOrMore} parser: `P`'s input, widened
 * to any string because the repetition count is unbounded.
 */
export type ZeroOrMoreInput<P extends AnyParser> =
  | ParserInput<P>
  | (string & {})

class ZeroOrMore<P extends AnyParser> extends Range<P, false, 0, number> {
  constructor(parser: P) {
    super(parser, 0, false, false)
  }
}

/**
 * Match `parser` zero or more times — the `*` multiplier from the Value
 * Definition Syntax.
 *
 * Repetitions are whitespace-separated. An empty input succeeds with an empty
 * array, so a standalone `zeroOrMore` parser never fails on absence; it is most
 * useful as a repeatable slot inside a larger sequence.
 *
 * @param parser - the parser to repeat
 * @returns a parser yielding an array of `parser`'s values, possibly empty
 *
 * @example
 * ```ts
 * // <length>*
 * parse('1px 2px', zeroOrMore(length())) // [LengthValue, LengthValue]
 * parse('', zeroOrMore(length()))         // []
 * ```
 */
export function zeroOrMore<P extends AnyParser>(
  parser: P,
): Parser<ZeroOrMoreValue<P>, ZeroOrMoreInput<P>> {
  return new ZeroOrMore(parser) as never
}
