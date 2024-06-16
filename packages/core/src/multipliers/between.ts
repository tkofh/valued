import { Range } from '../internal/range'
import type { Parser } from '../parser'

class Between<P extends Parser<unknown>> extends Range<P> {}

interface BetweenOptions {
  minLength: number
  maxLength: number
  commaSeparated?: boolean
}

export function between<P extends Parser<unknown>>(
  parser: P,
  options: BetweenOptions,
): Between<P> {
  return new Between(
    parser,
    options.minLength,
    options.maxLength,
    options.commaSeparated ?? false,
  )
}
