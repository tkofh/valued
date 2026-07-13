import { Range, type RangeInput, type RangeValue } from '../internal/range.ts'
import type { AnyParser, Parser } from '../parser.ts'

/**
 * The value type of a {@link between} parser: a tuple of `P`'s values whose
 * length is between the given bounds, inclusive.
 */
export type BetweenValue<
  P extends AnyParser,
  Options extends BetweenOptions,
> = RangeValue<P, Options['minLength'], Options['maxLength']>

/**
 * The accepted-input type of a {@link between} parser: `P`'s input repeated
 * between the given bounds, joined by spaces (or by commas when
 * `commaSeparated` is set).
 */
export type BetweenInput<
  P extends AnyParser,
  Options extends BetweenOptions,
> = RangeInput<
  P,
  Options['commaSeparated'] extends boolean ? Options['commaSeparated'] : false,
  Options['minLength'],
  Options['maxLength']
>

class Between<
  P extends AnyParser,
  Options extends BetweenOptions,
> extends Range<
  P,
  Options['commaSeparated'] extends boolean ? Options['commaSeparated'] : false,
  Options['minLength'],
  Options['maxLength']
> {}

interface BetweenOptions {
  /** The fewest repetitions that match (inclusive). */
  minLength: number
  /** The most repetitions that match (inclusive). */
  maxLength: number
  /**
   * Require a comma between repetitions — the `#{min,max}` variant from the
   * spec. Incompatible with `minLength: 0`.
   *
   * @default false
   */
  commaSeparated?: boolean
}

/**
 * Match `parser` between `minLength` and `maxLength` times, both inclusive —
 * the `{min,max}` multiplier from the Value Definition Syntax, or `#{min,max}`
 * when `commaSeparated` is set.
 *
 * Repetitions are whitespace-separated by default; `commaSeparated: true`
 * selects the comma-separated variant, requiring a comma between repetitions.
 * The result is a tuple of `parser`'s values whose length falls in
 * `[minLength, maxLength]`; an input with fewer or more fails.
 *
 * @param parser - the parser to repeat
 * @param options - the count bounds and repetition style
 * @returns a parser yielding a tuple of between `minLength` and `maxLength`
 * values
 * @throws {RangeError} if `minLength` is greater than `maxLength`, or if
 * `commaSeparated` is set together with a `minLength` of 0
 *
 * @example
 * ```ts
 * // padding: <length>{1,4}
 * const padding = between(length(), { minLength: 1, maxLength: 4 })
 *
 * parse('10px', padding)                // [LengthValue]
 * parse('10px 20px 10px 20px', padding) // four LengthValues
 * parse('1px 2px 3px 4px 5px', padding) // { valid: false } — over maxLength
 * ```
 */
export function between<
  P extends AnyParser,
  const Options extends BetweenOptions,
>(
  parser: P,
  options: Options,
): Parser<BetweenValue<P, Options>, BetweenInput<P, Options>> {
  return new Between(
    parser,
    options.minLength,
    options.maxLength,
    (options.commaSeparated ?? false) as never,
  ) as never
}
