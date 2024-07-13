import { Range } from '../internal/range'
import type { AnyParser, Parser, ParserInput, ParserValue } from '../parser'

export type OneOrMoreInput<P extends AnyParser> = ParserInput<P> | (string & {})
export type OneOrMoreValue<P extends AnyParser> = ReadonlyArray<
  ParserValue<P>
> & { [0]: ParserValue<P> }

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
  commaSeparated?: boolean
}

export function oneOrMore<
  P extends AnyParser,
  const Options extends OneOrMoreOptions,
>(parser: P, options?: Options): Parser<OneOrMoreValue<P>, OneOrMoreInput<P>> {
  return new OneOrMore(parser, options?.commaSeparated ?? false) as never
}
