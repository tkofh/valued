import { Range } from '../internal/range'
import type { AnyParser, Parser, ParserInput, ParserValue } from '../parser'

export type ZeroOrMoreValue<P extends AnyParser> = ReadonlyArray<ParserValue<P>>
export type ZeroOrMoreInput<P extends AnyParser> =
  | ParserInput<P>
  | (string & {})

class ZeroOrMore<P extends AnyParser> extends Range<P, false, 0, number> {
  constructor(parser: P) {
    super(parser, 0, false, false)
  }
}

export function zeroOrMore<P extends AnyParser>(
  parser: P,
): Parser<ZeroOrMoreValue<P>, ZeroOrMoreInput<P>> {
  return new ZeroOrMore(parser) as never
}
