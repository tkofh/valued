import { Range } from '../internal/range'
import type { Parser } from '../parser'

class OneOrMore<P extends Parser<unknown>> extends Range<P> {
  constructor(parser: P, commaSeparated: boolean) {
    super(parser, 1, false, commaSeparated)
  }
}

interface OneOrMoreOptions {
  commaSeparated?: boolean
}

export function oneOrMore<P extends Parser<unknown>>(
  parser: P,
  options?: OneOrMoreOptions,
): OneOrMore<P> {
  return new OneOrMore(parser, options?.commaSeparated ?? false)
}
