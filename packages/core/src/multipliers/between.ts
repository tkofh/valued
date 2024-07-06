import { Range } from '../internal/range'
import type { AnyParser } from '../parser'

class Between<
  P extends AnyParser,
  Options extends BetweenOptions,
> extends Range<
  P,
  Options['commaSeparated'] extends boolean ? Options['commaSeparated'] : false,
  Options['minLength'],
  Options['maxLength']
> {}

interface BetweenOptions {
  minLength: number
  maxLength: number
  commaSeparated?: boolean
}

export function between<
  P extends AnyParser,
  const Options extends BetweenOptions,
>(parser: P, options: Options): Between<P, Options> {
  return new Between(
    parser,
    options.minLength,
    options.maxLength,
    (options.commaSeparated ?? false) as never,
  )
}
