import {
  type AnyParser,
  type InternalParser,
  type Parser,
  type ParserInput,
  type ParserValue,
} from '../parser.ts'
import type { Token } from '../tokenizer.ts'

export type OneOfInput<Parsers extends ReadonlyArray<AnyParser>> = ParserInput<
  Parsers[number]
>

export type OneOfValue<Parsers extends ReadonlyArray<AnyParser>> = ParserValue<
  Parsers[number]
>

type OneOfBranch = {
  index: number
  childState: unknown
}

type OneOfState = ReadonlyArray<OneOfBranch>

class OneOf<
  const Parsers extends ReadonlyArray<AnyParser>,
> implements InternalParser<ParserValue<Parsers[number]>> {
  readonly parsers: ReadonlyArray<AnyParser>

  constructor(parsers: Parsers) {
    if (parsers.length === 0) {
      throw new TypeError('oneOf() parser must have at least one parser')
    }

    this.parsers = Array.from(new Set(parsers))
  }

  init(): OneOfState {
    return this.parsers.map((p, index) => ({
      index,
      childState: p.init(),
    }))
  }

  feed(state: unknown, token: Token): unknown | null {
    const s = state as OneOfState
    const next: Array<OneOfBranch> = []
    for (const branch of s) {
      const child = (this.parsers[branch.index] as AnyParser).feed(
        branch.childState,
        token,
      )
      if (child !== null) {
        next.push({ index: branch.index, childState: child })
      }
    }
    return next.length === 0 ? null : next
  }

  read(state: unknown): ParserValue<Parsers[number]> | undefined {
    const s = state as OneOfState
    for (const branch of s) {
      const value = (this.parsers[branch.index] as AnyParser).read(
        branch.childState,
      )
      if (value !== undefined) {
        return value as ParserValue<Parsers[number]>
      }
    }
    return undefined
  }

  toString(): string {
    return this.parsers.map((parser) => parser.toString()).join(' | ')
  }
}

export type { OneOf }

type OneOfConstructor = {
  <const Parsers extends ReadonlyArray<AnyParser>>(
    parsers: Parsers,
  ): Parser<OneOfValue<Parsers>, OneOfInput<Parsers>>
  withInput<const Input extends string>(): <
    const Parsers extends ReadonlyArray<AnyParser>,
  >(
    parsers: Parsers,
  ) => Parser<OneOfValue<Parsers>, Input>
}

const oneOf: OneOfConstructor = (<
  const Parsers extends ReadonlyArray<AnyParser>,
>(
  parsers: Parsers,
): Parser<OneOfValue<Parsers>, OneOfInput<Parsers>> =>
  new OneOf(parsers) as never) as OneOfConstructor

oneOf.withInput = (<Input extends string>() =>
  <const Parsers extends ReadonlyArray<AnyParser>>(
    parsers: Parsers,
  ): Parser<OneOfValue<Parsers>, Input> =>
    new OneOf(parsers) as never) as OneOfConstructor['withInput']

export { oneOf }
