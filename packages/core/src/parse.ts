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
