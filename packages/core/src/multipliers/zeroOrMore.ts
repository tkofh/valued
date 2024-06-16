import { Range } from '../internal/range'
import type { Parser } from '../parser'

class ZeroOrMore<P extends Parser<unknown>> extends Range<P> {
  constructor(parser: P) {
    super(parser, 0, false, false)
  }
}

export function zeroOrMore<P extends Parser<unknown>>(
  parser: P,
): ZeroOrMore<P> {
  return new ZeroOrMore(parser)
}
