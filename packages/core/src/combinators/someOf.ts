import type { Parser } from '../parser'
import type { Token } from '../tokenizer'

type ExtractParserValues<T extends ReadonlyArray<unknown>> = {
  [K in keyof T]: T[K] extends Parser<infer U> ? U | null : never
}

function stringifyParsers(parsers: ReadonlySet<Parser<unknown>>) {
  return Array.from(parsers, (parser) => parser.toString())
}

class SomeOf<Parsers extends ReadonlyArray<Parser<unknown>>>
  implements Parser<ExtractParserValues<Parsers>>
{
  readonly parsers: ReadonlySet<Parser<unknown>>

  #candidates: Set<Parsers[number]> = new Set()
  #satisfied: Set<Parsers[number]> = new Set()

  constructor(parsers: Parsers) {
    if (parsers.length === 0) {
      throw new TypeError('someOf() parser must have at least one parser')
    }

    const storage = new Set<Parser<unknown>>()

    for (const parser of parsers) {
      if (parser instanceof SomeOf) {
        for (const child of parser.parsers) {
          storage.add(child)
        }
      } else {
        storage.add(parser)
      }
    }

    this.parsers = storage
  }

  satisfied(state: 'initial' | 'current' = 'current'): boolean {
    if (this.#satisfied.size > 0 && state === 'current') {
      return true
    }

    for (const parser of this.#candidates) {
      if (parser.satisfied(state)) {
        return true
      }
    }

    return false
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

  check(token: Token, state: 'current' | 'initial'): boolean {
    if (this.#candidates.size > 0 && state === 'current') {
      return this.#checkCandidates(token)
    }

    return this.#checkAll(token, state)
  }

  read(): ExtractParserValues<Parsers> | undefined {
    const result = [] as Array<unknown>

    let isSatisfied = false

    for (const parser of this.parsers) {
      if (parser.satisfied()) {
        isSatisfied = true
        const value = parser.read()

        result.push(value === undefined ? null : value)
      } else {
        result.push(null)
      }
    }

    if (!isSatisfied) {
      return undefined
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
    return Array.from(this.parsers, (parser) => parser.toString()).join(' || ')
  }

  #feedCandidates(token: Token): boolean {
    const { rejected, satisfied } = this.#applyToken(token, 'feed')

    if (rejected.size < this.#candidates.size) {
      for (const parser of this.#candidates) {
        if (rejected.has(parser)) {
          this.#candidates.delete(parser)
          parser.reset()
        }
      }

      return true
    }

    if (satisfied.size === 0) {
      return false
    }

    const result = this.#getHotswapCandidates(token, satisfied)

    if (result === false) {
      return false
    }

    const { satisfiedCandidate, initialCandidates } = result

    this.#applyHotswap(token, satisfiedCandidate, initialCandidates)
    return true
  }

  #applyToken(token: Token, operation: 'feed' | 'check') {
    const rejected = new Set<Parser<unknown>>()
    const satisfied = new Set<Parser<unknown>>()
    for (const parser of this.#candidates) {
      let result: boolean
      if (operation === 'feed') {
        result = parser.feed(token)
      } else {
        result = parser.check(token, 'current')
      }

      if (result === false) {
        if (parser.satisfied()) {
          satisfied.add(parser)
        }

        rejected.add(parser)
      }
    }

    return { rejected, satisfied }
  }

  #getHotswapCandidates(token: Token, satisfied: Set<Parser<unknown>>) {
    const initialCandidates = this.#findInitialCandidates(token)

    let satisfiedCandidate: Parser<unknown> | null = null
    for (const parser of satisfied) {
      if (initialCandidates.has(parser) && initialCandidates.size > 1) {
        initialCandidates.delete(parser)
        satisfiedCandidate = parser
        break
      }

      if (!initialCandidates.has(parser)) {
        satisfiedCandidate = parser
        break
      }
    }

    if (satisfiedCandidate === null || initialCandidates.size === 0) {
      return false
    }

    return { satisfiedCandidate, initialCandidates }
  }

  #applyHotswap(
    token: Token,
    satisfiedCandidate: Parser<unknown>,
    initialCandidates: Set<Parser<unknown>>,
  ) {
    this.#satisfied.add(satisfiedCandidate)

    for (const parser of this.parsers) {
      if (this.#candidates.has(parser) && parser !== satisfiedCandidate) {
        parser.reset()
      }
      if (initialCandidates.has(parser)) {
        parser.feed(token)
      }
    }
    this.#candidates = initialCandidates
  }

  #findInitialCandidates(token: Token): Set<Parser<unknown>> {
    const candidates = new Set<Parser<unknown>>()
    for (const parser of this.parsers) {
      if (parser.check(token, 'initial') && !this.#satisfied.has(parser)) {
        candidates.add(parser)
      }
    }

    return candidates
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

  #checkCandidates(token: Token): boolean {
    const { rejected, satisfied } = this.#applyToken(token, 'check')

    if (rejected.size < this.#candidates.size) {
      return true
    }

    if (satisfied.size === 0) {
      return false
    }

    return this.#getHotswapCandidates(token, satisfied) !== false
  }

  #checkAll(token: Token, state: 'current' | 'initial'): boolean {
    for (const parser of this.parsers) {
      if (this.#satisfied.has(parser) && state === 'current') {
        continue
      }

      if (parser.check(token, state)) {
        return true
      }
    }

    return false
  }
}

export function someOf<const Parsers extends ReadonlyArray<Parser<unknown>>>(
  parsers: Parsers,
): SomeOf<Parsers> {
  return new SomeOf(parsers)
}
