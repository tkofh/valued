import { Range, type RangeInput, type RangeValue } from '../internal/range'
import type { AnyParser, Parser } from '../parser'

export type ExactlyValue<
  P extends AnyParser,
  Count extends number,
> = RangeValue<P, Count, Count>

export type ExactlyInput<
  P extends AnyParser,
  Count extends number,
> = RangeInput<P, false, Count, Count>

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

export function exactly<const P extends AnyParser, const Count extends number>(
  parser: P,
  count: Count,
): Parser<ExactlyValue<P, Count>, ExactlyInput<P, Count>> {
  return new Exactly(parser, count) as never
}
