import type { Parser, ParserValue } from '../parser'
import type { Token } from '../tokenizer'

class Optional<P extends Parser<unknown>>
  implements Parser<ParserValue<P> | null>
{
  readonly parser: P

  constructor(parser: P) {
    this.parser = parser
  }

  readonly isSatisfied = true

  feed(token: Token): boolean {
    return this.parser.feed(token)
  }

  flush(): ParserValue<P> | null {
    const value = this.parser.flush() as ParserValue<P>

    if (value !== undefined) {
      return value
    }

    return null
  }

  reset(): void {
    this.parser.reset()
  }
}

export function optional<P extends Parser<unknown>>(parser: P): Optional<P> {
  return new Optional(parser)
}
