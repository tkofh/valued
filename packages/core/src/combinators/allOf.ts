import type { Parser } from '../parser'
import type { Token } from '../tokenizer'

type ExtractParserValues<T extends ReadonlyArray<unknown>> = {
  [K in keyof T]: T[K] extends Parser<infer U> ? U : never
}

class AllOf<Parsers extends ReadonlyArray<Parser<unknown>>>
  implements Parser<ExtractParserValues<Parsers>>
{
  readonly parsers!: ReadonlySet<Parser<unknown>>

  #candidates: Set<Parsers[number]> = new Set()
  #satisfied: Set<Parsers[number]> = new Set()

  constructor(parsers: Parsers) {
    if (parsers.length === 0) {
      throw new TypeError('allOf() parser must have at least one parser')
    }

    const storage = new Set<Parser<unknown>>()

    for (const parser of parsers) {
      if (parser instanceof AllOf) {
        for (const child of parser.parsers) {
          storage.add(child)
        }
      } else {
        storage.add(parser)
      }
    }

    this.parsers = storage
  }

  get isSatisfied(): boolean {
    for (const parser of this.parsers) {
      if (!parser.isSatisfied) {
        return false
      }
    }
    return true
  }

  feed(token: Token): boolean {
    let result: boolean
    if (this.#candidates.size > 0) {
      result = this.#feedCandidates(token)
    } else {
      result = this.#feedAll(token)
    }

    return result
  }

  flush(): ExtractParserValues<Parsers> | undefined {
    const result = [] as Array<unknown>

    for (const parser of this.parsers) {
      const value = parser.flush()

      if (value === undefined) {
        return undefined
      }

      result.push(value)
    }

    return result as ExtractParserValues<Parsers>
  }

  reset() {
    this.#satisfied.clear()
    this.#candidates.clear()

    for (const parser of this.parsers) {
      parser.reset()
    }
  }

  toString(): string {
    return Array.from(this.parsers, (parser) => parser.toString()).join(' && ')
  }

  #feedCandidates(token: Token): boolean {
    const rejected = new Set<Parser<unknown>>()
    for (const parser of this.#candidates) {
      if (!parser.feed(token)) {
        rejected.add(parser)
      }
    }

    if (rejected.size < this.#candidates.size) {
      for (const parser of this.#candidates) {
        if (rejected.has(parser)) {
          this.#candidates.delete(parser)
        }
      }

      return true
    }

    if (this.#feedAll(token)) {
      this.#markCandidateAsSatisfied()

      for (const parser of rejected) {
        this.#candidates.delete(parser)
        if (!parser.isSatisfied) {
          parser.reset()
        }
      }

      return true
    }

    return false
  }

  #markCandidateAsSatisfied() {
    for (const parser of this.#candidates) {
      if (parser.isSatisfied) {
        this.#satisfied.add(parser)
        this.#candidates.delete(parser)
      }
    }
  }

  #feedAll(token: Token): boolean {
    let consumed = false

    for (const parser of this.parsers) {
      if (this.#satisfied.has(parser)) {
        continue
      }

      if (parser.feed(token)) {
        this.#candidates.add(parser)
        consumed = true
      }
    }

    return consumed
  }
}

export function allOf<const Parsers extends ReadonlyArray<Parser<unknown>>>(
  parsers: Parsers,
): AllOf<Parsers> {
  return new AllOf(parsers)
}