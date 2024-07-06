import { Range } from '../internal/range'
import type { AnyParser } from '../parser'

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
>(
  parser: P,
  options?: Options,
): OneOrMore<
  P,
  Options['commaSeparated'] extends boolean ? Options['commaSeparated'] : false
> {
  return new OneOrMore(parser, options?.commaSeparated ?? false)
}
