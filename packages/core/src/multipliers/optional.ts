import type {
  AnyParser,
  InternalParser,
  Parser,
  ParserInput,
  ParserState,
  ParserValue,
} from '../parser'
import type { Token } from '../tokenizer'

export type OptionalValue<P extends AnyParser> = ParserValue<P> | null
export type OptionalInput<P extends AnyParser> = ParserInput<P> | ''

class Optional<const P extends AnyParser>
  implements InternalParser<ParserValue<P> | null>
{
  readonly parser: P

  constructor(parser: P) {
    this.parser = parser
  }

  satisfied(): boolean {
    return true
  }

  feed(token: Token): boolean {
    return this.parser.feed(token)
  }

  check(token: Token, state: ParserState): boolean {
    return this.parser.check(token, state)
  }

  read(): ParserValue<P> | null {
    const value = this.parser.read() as ParserValue<P>

    if (value !== undefined) {
      return value
    }

    return null
  }

  reset(): void {
    this.parser.reset()
  }

  toString(): string {
    return `${this.parser.toString()}?`
  }
}

export function optional<const P extends AnyParser>(
  parser: P,
): Parser<OptionalValue<P>, OptionalInput<P>> {
  return new Optional(parser) as never
}
