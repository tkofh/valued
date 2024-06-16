import { Range } from '../internal/range'
import type { Parser } from '../parser'

class Exactly<P extends Parser<unknown>> extends Range<P> {
  constructor(parser: P, count: number) {
    super(parser, count, count, false)
  }
}

export function exactly<P extends Parser<unknown>>(
  parser: P,
  count: number,
): Exactly<P> {
  return new Exactly(parser, count)
}
