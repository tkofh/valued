import {
  type ParseResult,
  type Parser,
  type ParserValue,
  invalid,
  valid,
} from './parser'
import { tokenize } from './tokenizer'

export function parse<P extends Parser<unknown>>(
  value: string,
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
