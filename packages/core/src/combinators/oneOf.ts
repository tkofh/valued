import {
  type AnyParser,
  BaseParser,
  type Parser,
  type ParserInput,
  type ParserState,
  type ParserValue,
  currentState,
} from '../parser'
import type { Token } from '../tokenizer'

export type OneOfInput<Parsers extends ReadonlyArray<AnyParser>> = ParserInput<
  Parsers[number]
>

class OneOf<
    Parsers extends ReadonlyArray<AnyParser>,
    Input extends string = OneOfInput<Parsers>,
  >
  extends BaseParser<ParserValue<Parsers[number]>, Input>
  implements Parser<ParserValue<Parsers[number]>, Input>
{
  readonly parsers: ReadonlySet<AnyParser>

  #candidates: Set<AnyParser> = new Set()

  constructor(parsers: Parsers) {
    super()
    if (parsers.length === 0) {
      throw new TypeError('oneOf() parser must have at least one parser')
    }

    this.parsers = new Set(parsers)
  }

  satisfied(state: ParserState): boolean {
    for (const parser of this.parsers) {
      if (parser.satisfied(state)) {
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

  check(token: Token, state: ParserState): boolean {
    if (this.#candidates.size > 0 && state === currentState) {
      return this.#checkCandidates(token)
    }

    return this.#checkAll(token, state)
  }

  read(): ParserValue<Parsers[number]> | undefined {
    return this.#readCandidates() ?? this.#readAll()
  }

  reset(): void {
    this.#candidates.clear()

    for (const parser of this.parsers) {
      parser.reset()
    }
  }

  override toString(): string {
    return Array.from(this.parsers, (parser) => parser.toString()).join(' | ')
  }

  #feedCandidates(token: Token): boolean {
    const consumed = new Set<AnyParser>()
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

  #checkCandidates(token: Token): boolean {
    for (const parser of this.#candidates) {
      if (parser.check(token, currentState)) {
        return true
      }
    }

    return false
  }

  #checkAll(token: Token, state: ParserState): boolean {
    for (const parser of this.parsers) {
      if (parser.check(token, state)) {
        return true
      }
    }

    return false
  }

  #readCandidates(): ParserValue<Parsers[number]> | undefined {
    if (this.#candidates.size === 0) {
      return undefined
    }

    let result: ParserValue<Parsers[number]> | undefined = undefined
    for (const parser of this.#candidates) {
      const value = parser.read() as ParserValue<Parsers[number]> | undefined

      if (
        value !== undefined &&
        (result === undefined || (Array.isArray(result) && result.length === 0))
      ) {
        result = value
      }
    }

    return result
  }

  #readAll(): ParserValue<Parsers[number]> | undefined {
    let result: ParserValue<Parsers[number]> | undefined = undefined
    for (const parser of this.parsers) {
      if (this.#candidates.has(parser)) {
        continue
      }

      const value = parser.read() as ParserValue<Parsers[number]> | undefined

      if (
        value !== undefined &&
        (result === undefined || (Array.isArray(result) && result.length === 0))
      ) {
        result = value
      }
    }

    return result
  }
}

export type { OneOf }

type OneOfConstructor = {
  <const Parsers extends ReadonlyArray<AnyParser>>(
    parsers: Parsers,
  ): OneOf<Parsers>
  withInput<const Input extends string>(): <
    const Parsers extends ReadonlyArray<AnyParser>,
  >(
    parsers: Parsers,
  ) => OneOf<Parsers, Input>
}

const oneOf: OneOfConstructor = function oneOf<
  const Parsers extends ReadonlyArray<AnyParser>,
>(parsers: Parsers): OneOf<Parsers> {
  return new OneOf(parsers)
} as OneOfConstructor

oneOf.withInput = (<Input extends string>() =>
  <const Parsers extends ReadonlyArray<AnyParser>>(
    parsers: Parsers,
  ): OneOf<Parsers, Input> =>
    new OneOf(parsers)) as OneOfConstructor['withInput']

export { oneOf }
