import { Range } from '../internal/range'
import type { AnyParser } from '../parser'

class ZeroOrMore<P extends AnyParser> extends Range<P, false, 0, number> {
  constructor(parser: P) {
    super(parser, 0, false, false)
  }
}

export function zeroOrMore<P extends AnyParser>(parser: P): ZeroOrMore<P> {
  return new ZeroOrMore(parser)
}
