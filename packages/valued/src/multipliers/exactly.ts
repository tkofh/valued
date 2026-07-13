import { Range, type RangeInput, type RangeValue } from '../internal/range.ts'
import type { AnyParser, Parser } from '../parser.ts'

/** The value type of an {@link exactly} parser: a tuple of exactly `Count` values. */
export type ExactlyValue<
  P extends AnyParser,
  Count extends number,
> = RangeValue<P, Count, Count>

/**
 * The accepted-input type of an {@link exactly} parser: `P`'s input repeated
 * `Count` times, space-separated.
 */
export type ExactlyInput<
  P extends AnyParser,
  Count extends number,
> = RangeInput<P, false, Count, Count>

class Exactly<P extends AnyParser, Count extends number> extends Range<
  P,
  false,
  Count,
  Count
> {
  constructor(parser: P, count: Count) {
    if (count < 1) {
      throw new TypeError('exactly() parser must have a count of at least 1')
    }
    super(parser, count, count, false)
  }
}

/**
 * Match `parser` exactly `count` times — the `{n}` multiplier from the Value
 * Definition Syntax.
 *
 * Repetitions are whitespace-separated. The result is a tuple of exactly
 * `count` values; any other number of repetitions in the input fails.
 *
 * @param parser - the parser to repeat
 * @param count - the exact number of repetitions; must be at least 1
 * @returns a parser yielding a tuple of `count` values
 * @throws {TypeError} if `count` is less than 1
 *
 * @example
 * ```ts
 * // <length>{2}
 * const pair = exactly(length(), 2)
 *
 * parse('10px 20px', pair)      // [LengthValue, LengthValue]
 * parse('10px', pair)           // { valid: false } — too few
 * parse('10px 20px 30px', pair) // { valid: false } — too many
 * ```
 */
export function exactly<const P extends AnyParser, const Count extends number>(
  parser: P,
  count: Count,
): Parser<ExactlyValue<P, Count>, ExactlyInput<P, Count>> {
  return new Exactly(parser, count) as never
}
