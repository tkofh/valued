import {
  type AnyParser,
  type ParseResult,
  type ParserInput,
  type ParserValue,
  invalid,
  valid,
} from './parser'
import { tokenize } from './tokenizer'

export type { ParserInput, ParserValue, ParseResult, Parser } from './parser'

export function parse<P extends AnyParser>(
  value: ParserInput<P> | (string & {}),
  parser: P,
): ParseResult<ParserValue<P>> {
  try {
    for (const token of tokenize(value)) {
      if (!parser.feed(token)) {
        return invalid()
      }
    }

    const parsed = parser.read()

    if (parsed === undefined) {
      return invalid()
    }

    return valid(parsed as ParserValue<P>)
  } finally {
    parser.reset()
  }
}
