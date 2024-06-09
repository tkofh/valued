import {
  FULL,
  NOT_SATISFIED,
  type Parser,
  type ParserState,
  SATISFIED,
} from '../parser'
import type { Token } from '../tokenizer'
import { unorderedGroup } from './unofderedGroup'

const TypeBrand: unique symbol = Symbol('combinator/someOf')

type ExtractParserValues<T extends ReadonlyArray<unknown>> = {
  [K in keyof T]: T[K] extends Parser<infer U> ? U | null : never
}

class SomeOf<Parsers extends ReadonlyArray<Parser<unknown>>>
  implements Parser<ExtractParserValues<Parsers>>
{
  readonly [TypeBrand] = TypeBrand
  readonly domain!: ReadonlySet<string>
  readonly parsers!: ReadonlySet<Parser<unknown>>

  #finished: Set<Parsers[number]> = new Set()
  #locked: Parsers[number] | null = null

  get state(): ParserState {
    if (this.#finished.size === this.parsers.size) {
      return FULL
    }

    if (this.#finished.size > 0) {
      return SATISFIED
    }

    if (this.#locked !== null) {
      return this.#locked.state
    }

    return NOT_SATISFIED
  }

  constructor(parsers: Parsers) {
    if (parsers.length === 0) {
      throw new TypeError('someOf() parser must have at least one parser')
    }

    const group = unorderedGroup(parsers, TypeBrand)
    this.domain = group.domain
    this.parsers = group.parsers
  }

  feed(token: Token): boolean {
    if (this.#locked !== null) {
      const tokenConsumed = this.#locked.feed(token)

      if (tokenConsumed) {
        if (this.#locked.state === FULL) {
          this.#finished.add(this.#locked)
          this.#locked = null
        }
      }

      return tokenConsumed
    }

    for (const parser of this.parsers) {
      if (this.#finished.has(parser)) {
        continue
      }

      const tokenConsumed = parser.feed(token)

      if (tokenConsumed) {
        if (parser.state === FULL) {
          this.#finished.add(parser)
        } else {
          this.#locked = parser
        }

        return true
      }
    }

    return false
  }

  flush(): ExtractParserValues<Parsers> | undefined {
    const result = [] as Array<unknown>

    if (this.#finished.size === 0) {
      return undefined
    }

    for (const parser of this.parsers) {
      if (this.#finished.has(parser)) {
        const value = parser.flush()

        result.push(value ?? null)
      } else {
        result.push(null)
      }
    }

    return result as ExtractParserValues<Parsers>
  }

  reset() {
    this.#finished.clear()
    this.#locked = null
    for (const parser of this.parsers) {
      parser.reset()
    }
  }

  toString(): string {
    return Array.from(this.parsers, (parser) => parser.toString()).join(' || ')
  }
}

export function someOf<const Parsers extends ReadonlyArray<Parser<unknown>>>(
  parsers: Parsers,
): SomeOf<Parsers> {
  return new SomeOf(parsers)
}
