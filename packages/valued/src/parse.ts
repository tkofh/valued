import {
  type AnyParser,
  invalid,
  type ParseResult,
  type ParserInput,
  type ParserValue,
  valid,
} from './parser.ts'
import { tokenize } from './tokenizer.ts'

export type { ParseResult, Parser, ParserInput, ParserValue } from './parser.ts'

/**
 * Parse a string against a `valued` parser, returning a typed, discriminated
 * result.
 *
 * The entry point of the library: build a parser from a data type, combinator,
 * or multiplier, then hand it and the input to `parse`. `value` comes first,
 * the parser second. Matching is whole-string — every token has to be
 * consumed, so trailing content that the parser does not accept fails rather
 * than being ignored.
 *
 * The result is a discriminated union: narrow on `valid` before reading
 * `value`. Failure carries no reason; when you need to know *why* a value was
 * rejected, parse its parts separately.
 *
 * `value` is typed as the parser's accepted input (a template-literal type,
 * for autocomplete) while still accepting any `string`, so a runtime value
 * whose contents aren't known at compile time is accepted without a cast.
 *
 * @param value - the string to parse; the whole string must match
 * @param parser - the parser to run it against
 * @returns `{ valid: true, value }` on a full match, `{ valid: false }`
 * otherwise
 *
 * @example
 * ```ts
 * import { parse } from 'valued'
 * import { length } from 'valued/data/length'
 *
 * const result = parse('12px', length())
 * if (result.valid) {
 *   result.value.value // 12
 *   result.value.unit // 'px'
 * }
 *
 * parse('12px solid', length()) // { valid: false } — trailing 'solid'
 * ```
 */
export function parse<P extends AnyParser>(
  value: ParserInput<P> | (string & {}),
  parser: P,
): ParseResult<ParserValue<P>> {
  let state = parser.init()
  for (const token of tokenize(value)) {
    const next = parser.feed(state, token)
    if (next === null) {
      return invalid()
    }
    state = next
  }
  const parsed = parser.read(state)
  if (parsed === undefined) {
    return invalid()
  }
  return valid(parsed as ParserValue<P>)
}
