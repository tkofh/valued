import type { Parser, ParserValue } from '../parser'
import type { Token } from '../tokenizer'

class Optional<P extends Parser<unknown>>
  implements Parser<ParserValue<P> | null>
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

  check(token: Token, state: 'current' | 'initial'): boolean {
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

export function optional<P extends Parser<unknown>>(parser: P): Optional<P> {
  return new Optional(parser)
}
