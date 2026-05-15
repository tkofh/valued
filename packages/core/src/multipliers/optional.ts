import type {
  AnyParser,
  InternalParser,
  Parser,
  ParserInput,
  ParserValue,
} from '../parser.ts'
import type { Token } from '../tokenizer.ts'

export type OptionalValue<P extends AnyParser> = ParserValue<P> | null
export type OptionalInput<P extends AnyParser> = ParserInput<P> | ''

class Optional<
  const P extends AnyParser,
> implements InternalParser<ParserValue<P> | null> {
  readonly parser: P

  constructor(parser: P) {
    this.parser = parser
  }

  init(): unknown {
    return this.parser.init()
  }

  feed(state: unknown, token: Token): unknown | null {
    return this.parser.feed(state, token)
  }

  read(state: unknown): ParserValue<P> | null {
    const value = this.parser.read(state) as ParserValue<P> | undefined
    if (value !== undefined) {
      return value
    }
    return null
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
