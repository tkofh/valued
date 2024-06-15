import type { Parser, ParserValue } from '../parser'
import type { Token } from '../tokenizer'

class OneOf<Parsers extends ReadonlyArray<Parser<unknown>>>
  implements Parser<ParserValue<Parsers[number]>>
{
  readonly parsers: ReadonlySet<Parser<unknown>>

  #candidates: Set<Parser<unknown>> = new Set()

  constructor(parsers: Parsers) {
    if (parsers.length === 0) {
      throw new TypeError('oneOf() parser must have at least one parser')
    }

    this.parsers = new Set(parsers)
  }

  get isSatisfied(): boolean {
    for (const parser of this.parsers) {
      if (parser.isSatisfied) {
        return true
      }
    }

    return false
  }

  feed(token: Token): boolean {
    if (this.#candidates.size > 0) {
      return this.#feedCandidates(token)
    }
    return this.#feedAll(token)
  }

  flush(): ParserValue<Parsers[number]> | undefined {
    for (const parser of this.parsers) {
      const value = parser.flush()
      if (value !== undefined) {
        return value as ParserValue<Parsers[number]>
      }
    }

    return undefined
  }

  reset(): void {
    this.#candidates.clear()

    for (const parser of this.parsers) {
      parser.reset()
    }
  }

  toString(): string {
    return Array.from(this.parsers, (parser) => parser.toString()).join(' | ')
  }

  #feedCandidates(token: Token): boolean {
    const consumed = new Set<Parser<unknown>>()
    for (const parser of this.#candidates) {
      if (parser.feed(token)) {
        consumed.add(parser)
      }
    }

    if (consumed.size === 0) {
      return false
    }

    for (const parser of this.#candidates) {
      if (!consumed.has(parser)) {
        this.#candidates.delete(parser)
      }
    }

    return true
  }

  #feedAll(token: Token): boolean {
    let result = false

    for (const parser of this.parsers) {
      const consumed = parser.feed(token)

      if (consumed) {
        this.#candidates.add(parser)
        result = true
      }
    }

    return result
  }
}

export function oneOf<const Parsers extends ReadonlyArray<Parser<unknown>>>(
  parsers: Parsers,
): OneOf<Parsers> {
  return new OneOf(parsers)
}
