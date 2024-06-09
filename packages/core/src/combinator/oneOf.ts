import {
  FULL,
  NOT_SATISFIED,
  type Parser,
  type ParserState,
  type ParserValue,
  SATISFIED,
} from '../parser'
import type { Token } from '../tokenizer'
import { unorderedGroup } from './unofderedGroup'

const TypeBrand: unique symbol = Symbol('combinator/oneOf')

class OneOf<Parsers extends ReadonlyArray<Parser<unknown>>>
  implements Parser<ParserValue<Parsers[number]>>
{
  readonly [TypeBrand] = TypeBrand
  readonly domain: ReadonlySet<string>
  readonly parsers: ReadonlySet<Parser<unknown>>

  #candidates: Set<Parser<unknown>> = new Set()

  get state(): ParserState {
    if (this.#candidates.size === 0) {
      return NOT_SATISFIED
    }

    let satisfied = false
    for (const parser of this.#candidates) {
      // If all parsers are full, the oneOf parser is full
      if (parser.state === FULL && this.#candidates.size === 1) {
        return FULL
      }

      if (parser.state === SATISFIED) {
        satisfied = true
      }
    }

    return satisfied ? SATISFIED : NOT_SATISFIED
  }

  constructor(parsers: Parsers) {
    if (parsers.length === 0) {
      throw new TypeError('oneOf() parser must have at least one parser')
    }

    const group = unorderedGroup(parsers, TypeBrand)
    this.domain = group.domain
    this.parsers = group.parsers
  }

  feed(token: Token): boolean {
    if (this.#candidates.size > 0) {
      return this.#feedCandidates(token)
    }
    return this.#feedAll(token)
  }

  flush(): ParserValue<Parsers[number]> | undefined {
    for (const parser of this.#candidates) {
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
    let result = false
    for (const parser of this.#candidates) {
      const consumed = parser.feed(token)

      result ||= consumed

      if (!consumed) {
        this.#candidates.delete(parser)
      }
    }

    return result
  }

  #feedAll(token: Token): boolean {
    let result = false
    for (const parser of this.parsers) {
      const consumed = parser.feed(token)

      result ||= consumed

      if (consumed) {
        this.#candidates.add(parser)
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
