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

type Combinations<T extends ReadonlyArray<string>> = T extends [string]
  ? T[0]
  : T extends [string, string]
    ? `${T[0]} ${T[1]}` | `${T[1]} ${T[0]}`
    : T extends [string, string, string]
      ?
          | `${T[0]} ${T[1]} ${T[2]}`
          | `${T[0]} ${T[2]} ${T[1]}`
          | `${T[1]} ${T[2]} ${T[0]}`
          | `${T[1]} ${T[0]} ${T[2]}`
          | `${T[2]} ${T[0]} ${T[1]}`
          | `${T[2]} ${T[1]} ${T[0]}`
      : T extends [string, string, string, string]
        ?
            | `${T[0]} ${Combinations<[T[1], T[2], T[3]]>}`
            | `${T[1]} ${Combinations<[T[0], T[2], T[3]]>}`
            | `${T[2]} ${Combinations<[T[0], T[1], T[3]]>}`
            | `${T[3]} ${Combinations<[T[0], T[1], T[2]]>}`
        : T extends [string, string, string, string, string]
          ?
              | `${T[0]} ${Combinations<[T[1], T[2], T[3], T[4]]>}`
              | `${T[1]} ${Combinations<[T[0], T[2], T[3], T[4]]>}`
              | `${T[2]} ${Combinations<[T[0], T[1], T[3], T[4]]>}`
              | `${T[3]} ${Combinations<[T[0], T[1], T[2], T[4]]>}`
              | `${T[4]} ${Combinations<[T[0], T[1], T[2], T[3]]>}`
          : T extends []
            ? ''
            : string

type InternalAllOfInput<
  Parsers extends ReadonlyArray<AnyParser>,
  Inputs extends ReadonlyArray<string> = [],
> = Inputs['length'] extends Parsers['length']
  ? Combinations<Inputs>
  : InternalAllOfInput<
      Parsers,
      [...Inputs, ParserInput<Parsers[Inputs['length']]>]
    >

export type AllOfInput<T extends ReadonlyArray<AnyParser>> =
  InternalAllOfInput<T>

type InternalAllOfValue<
  Parsers extends ReadonlyArray<AnyParser>,
  Values extends ReadonlyArray<unknown> = [],
> = Values['length'] extends Parsers['length']
  ? Values
  : InternalAllOfValue<
      Parsers,
      [...Values, ParserValue<Parsers[Values['length']]>]
    >

export type AllOfValue<Parsers extends ReadonlyArray<AnyParser>> =
  InternalAllOfValue<Parsers>

const TypeBrand: unique symbol = Symbol('combinators/allOf')

function isAllOf(value: unknown): value is AllOf<ReadonlyArray<AnyParser>> {
  return isRecordOrArray(value) && TypeBrand in value
}

class AllOf<const Parsers extends ReadonlyArray<AnyParser>>
  implements InternalParser<AllOfValue<Parsers>>
{
  readonly [TypeBrand] = TypeBrand
  readonly parsers!: ReadonlySet<AnyParser>

  #candidates: Set<Parsers[number]> = new Set()
  #satisfied: Set<Parsers[number]> = new Set()

  constructor(parsers: Parsers) {
    if (parsers.length === 0) {
      throw new TypeError('allOf() parser must have at least one parser')
    }

    const storage = new Set<AnyParser>()

    for (const parser of parsers) {
      if (isAllOf(parser)) {
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
    for (const parser of this.parsers) {
      if (!parser.satisfied(state)) {
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

  check(token: Token, state: ParserState): boolean {
    if (this.#candidates.size > 0 && state === currentState) {
      return this.#checkCandidates(token)
    }

    return this.#checkAll(token, state)
  }

  read(): AllOfValue<Parsers> | undefined {
    const result = [] as Array<unknown>

    for (const parser of this.parsers) {
      const value = parser.read()

      if (value === undefined) {
        return undefined
      }

      result.push(value)
    }

    return result as AllOfValue<Parsers>
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

export type { AllOf }

type AllOfConstructor = {
  <const Parsers extends ReadonlyArray<AnyParser>>(
    parsers: Parsers,
  ): Parser<AllOfValue<Parsers>, AllOfInput<Parsers>>
  withInput<Input extends string>(): <
    const Parsers extends ReadonlyArray<AnyParser>,
  >(
    parsers: Parsers,
  ) => Parser<AllOfValue<Parsers>, Input>
}

const allOf = (<const Parsers extends ReadonlyArray<AnyParser>>(
  parsers: Parsers,
): Parser<AllOfValue<Parsers>, AllOfInput<Parsers>> =>
  new AllOf(parsers) as never) as AllOfConstructor

allOf.withInput =
  <Input extends string>() =>
  <const Parsers extends ReadonlyArray<AnyParser>>(
    parsers: Parsers,
  ): Parser<AllOfValue<Parsers>, Input> =>
    new AllOf(parsers) as never

export { allOf }
