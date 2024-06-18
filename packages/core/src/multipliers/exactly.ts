import { Range } from '../internal/range'
import type { Parser } from '../parser'

class Exactly<P extends Parser<unknown>> extends Range<P> {
  constructor(parser: P, count: number) {
    if (count < 1) {
      throw new TypeError('exactly() parser must have a count of at least 1')
    }
    super(parser, count, count, false)
  }
}

export function exactly<P extends Parser<unknown>>(
  parser: P,
  count: number,
): Exactly<P> {
  return new Exactly(parser, count)
}
