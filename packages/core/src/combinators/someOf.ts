import {
  type AnyParser,
  type InternalParser,
  type Parser,
  type ParserInput,
  type ParserState,
  type ParserValue,
  currentState,
  initialState,
} from '../parser'
import { isRecordOrArray } from '../predicates'
import type { Token } from '../tokenizer'

type Combinations<T extends ReadonlyArray<string>> = T extends []
  ? ''
  : T extends [string]
    ? T[0]
    : T extends [string, string]
      ? T[0] | T[1] | `${T[0]} ${T[1]}` | `${T[1]} ${T[0]}`
      : T extends [string, string, string]
        ?
            | T[0]
            | T[1]
            | T[2]
            | `${T[0]} ${T[1]}`
            | `${T[1]} ${T[0]}`
            | `${T[0]} ${T[2]}`
            | `${T[2]} ${T[0]}`
            | `${T[1]} ${T[2]}`
            | `${T[2]} ${T[1]}`
            | `${T[0]} ${T[1]} ${T[2]}`
            | `${T[0]} ${T[2]} ${T[1]}`
            | `${T[1]} ${T[0]} ${T[2]}`
            | `${T[1]} ${T[2]} ${T[0]}`
            | `${T[2]} ${T[0]} ${T[1]}`
            | `${T[2]} ${T[1]} ${T[0]}`
        : T extends [string, string, string, string]
          ?
              | Combinations<[T[0], T[1], T[2]]>
              | Combinations<[T[0], T[1], T[3]]>
              | Combinations<[T[0], T[2], T[3]]>
              | Combinations<[T[1], T[2], T[3]]>
              | `${T[0]} ${Combinations<[T[1], T[2], T[3]]>}`
              | `${T[1]} ${Combinations<[T[0], T[2], T[3]]>}`
              | `${T[2]} ${Combinations<[T[0], T[1], T[3]]>}`
              | `${T[3]} ${Combinations<[T[0], T[1], T[2]]>}`
          : T extends [string, string, string, string, string]
            ?
                | Combinations<[T[0], T[1], T[2], T[3]]>
                | Combinations<[T[0], T[1], T[2], T[4]]>
                | Combinations<[T[0], T[1], T[3], T[4]]>
                | Combinations<[T[0], T[2], T[3], T[4]]>
                | Combinations<[T[1], T[2], T[3], T[4]]>
                | `${T[0]} ${Combinations<[T[1], T[2], T[3], T[4]]>}`
                | `${T[1]} ${Combinations<[T[0], T[2], T[3], T[4]]>}`
                | `${T[2]} ${Combinations<[T[0], T[1], T[3], T[4]]>}`
                | `${T[3]} ${Combinations<[T[0], T[1], T[2], T[4]]>}`
                | `${T[4]} ${Combinations<[T[0], T[1], T[2], T[3]]>}`
            : string

type InternalSomeOfValue<
  Parsers extends ReadonlyArray<AnyParser>,
  Values extends ReadonlyArray<unknown> = [],
> = Values['length'] extends Parsers['length']
  ? Values
  : InternalSomeOfValue<
      Parsers,
      [...Values, ParserValue<Parsers[Values['length']]>]
    >

export type SomeOfValue<Parsers extends ReadonlyArray<AnyParser>> =
  InternalSomeOfValue<Parsers>

type InternalSomeOfInput<
  Parsers extends ReadonlyArray<AnyParser>,
  Inputs extends ReadonlyArray<string> = [],
> = Inputs['length'] extends Parsers['length']
  ? Combinations<Inputs>
  : InternalSomeOfInput<
      Parsers,
      [...Inputs, ParserInput<Parsers[Inputs['length']]>]
    >

export type SomeOfInput<Parsers extends ReadonlyArray<AnyParser>> =
  InternalSomeOfInput<Parsers, []>

const TypeBrand: unique symbol = Symbol('combinators/someOf')

function isSomeOf(value: unknown): value is SomeOf<ReadonlyArray<AnyParser>> {
  return isRecordOrArray(value) && TypeBrand in value
}

class SomeOf<const Parsers extends ReadonlyArray<AnyParser>>
  implements InternalParser<SomeOfValue<Parsers>>
{
  readonly [TypeBrand] = TypeBrand
  readonly parsers: ReadonlySet<AnyParser>

  #candidates: Set<Parsers[number]> = new Set()
  #satisfied: Set<Parsers[number]> = new Set()

  constructor(parsers: Parsers) {
    if (parsers.length === 0) {
      throw new RangeError('someOf() parser must have at least one parser')
    }

    const storage = new Set<AnyParser>()

    for (const parser of parsers) {
      if (isSomeOf(parser)) {
        for (const child of parser.parsers) {
          storage.add(child)
        }
      } else {
        storage.add(parser)
      }
    }

    this.parsers = storage
  }

  satisfied(state: ParserState): boolean {
    if (this.#satisfied.size > 0 && state === currentState) {
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

  check(token: Token, state: ParserState): boolean {
    if (this.#candidates.size > 0 && state === currentState) {
      return this.#checkCandidates(token)
    }

    return this.#checkAll(token, state)
  }

  read(): SomeOfValue<Parsers> | undefined {
    const result = [] as Array<unknown>

    let isSatisfied = false

    for (const parser of this.parsers) {
      if (parser.satisfied(currentState)) {
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

    return result as SomeOfValue<Parsers>
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
    const rejected = new Set<AnyParser>()
    const satisfied = new Set<AnyParser>()
    for (const parser of this.#candidates) {
      let result: boolean
      if (operation === 'feed') {
        result = parser.feed(token)
      } else {
        result = parser.check(token, currentState)
      }

      if (result === false) {
        if (parser.satisfied(currentState)) {
          satisfied.add(parser)
        }

        rejected.add(parser)
      }
    }

    return { rejected, satisfied }
  }

  #getHotswapCandidates(token: Token, satisfied: Set<AnyParser>) {
    const initialCandidates = this.#findInitialCandidates(token)

    let satisfiedCandidate: AnyParser | null = null
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
    satisfiedCandidate: AnyParser,
    initialCandidates: Set<AnyParser>,
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

  #findInitialCandidates(token: Token): Set<AnyParser> {
    const candidates = new Set<AnyParser>()
    for (const parser of this.parsers) {
      if (parser.check(token, initialState) && !this.#satisfied.has(parser)) {
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

  #checkAll(token: Token, state: ParserState): boolean {
    for (const parser of this.parsers) {
      if (this.#satisfied.has(parser) && state === currentState) {
        continue
      }

      if (parser.check(token, state)) {
        return true
      }
    }

    return false
  }
}

export type { SomeOf }

type SomeOfConstructor = {
  <const Parsers extends ReadonlyArray<AnyParser>>(
    parsers: Parsers,
  ): Parser<SomeOfValue<Parsers>, SomeOfInput<Parsers>>
  withInput<Input extends string>(): <
    const Parsers extends ReadonlyArray<AnyParser>,
  >(
    parsers: Parsers,
  ) => Parser<SomeOfValue<Parsers>, Input>
}

const someOf: SomeOfConstructor = (<
  const Parsers extends ReadonlyArray<AnyParser>,
>(
  parsers: Parsers,
): Parser<SomeOfValue<Parsers>, SomeOfInput<Parsers>> =>
  new SomeOf(parsers) as never) as SomeOfConstructor

someOf.withInput = (<Input extends string>() =>
  <const Parsers extends ReadonlyArray<AnyParser>>(
    parsers: Parsers,
  ): Parser<SomeOfValue<Parsers>, Input> =>
    new SomeOf(parsers) as never) as SomeOfConstructor['withInput']

export { someOf }
