import { Range, type RangeInput, type RangeValue } from '../internal/range'
import type { AnyParser, Parser } from '../parser'

export type BetweenValue<
  P extends AnyParser,
  Options extends BetweenOptions,
> = RangeValue<P, Options['minLength'], Options['maxLength']>

export type BetweenInput<
  P extends AnyParser,
  Options extends BetweenOptions,
> = RangeInput<
  P,
  Options['commaSeparated'] extends boolean ? Options['commaSeparated'] : false,
  Options['minLength'],
  Options['maxLength']
>

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
>(
  parser: P,
  options: Options,
): Parser<BetweenValue<P, Options>, BetweenInput<P, Options>> {
  return new Between(
    parser,
    options.minLength,
    options.maxLength,
    (options.commaSeparated ?? false) as never,
  ) as never
}
