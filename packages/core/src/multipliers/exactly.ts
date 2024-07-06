import { Range } from '../internal/range'
import type { AnyParser } from '../parser'

class Exactly<P extends AnyParser, Count extends number> extends Range<
  P,
  false,
  Count,
  Count
> {
  constructor(parser: P, count: Count) {
    if (count < 1) {
      throw new TypeError('exactly() parser must have a count of at least 1')
    }
    super(parser, count, count, false)
  }
}

export function exactly<P extends AnyParser, const Count extends number>(
  parser: P,
  count: Count,
): Exactly<P, Count> {
  return new Exactly(parser, count)
}
