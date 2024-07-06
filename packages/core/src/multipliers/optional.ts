import {
  type AnyParser,
  BaseParser,
  type Parser,
  type ParserInput,
  type ParserState,
  type ParserValue,
} from '../parser'
import type { Token } from '../tokenizer'

class Optional<P extends AnyParser, Input extends string = ParserInput<P> | ''>
  extends BaseParser<ParserValue<P> | null, Input>
  implements Parser<ParserValue<P> | null, Input>
{
  readonly parser: P

  constructor(parser: P) {
    super()
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

  override toString(): string {
    return `${this.parser.toString()}?`
  }
}

export function optional<P extends AnyParser>(parser: P): Optional<P> {
  return new Optional(parser)
}
