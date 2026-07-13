import type {
  AnyParser,
  InternalParser,
  Parser,
  ParserInput,
  ParserValue,
} from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'
import type { Token } from '../tokenizer.ts'

type JoinWithSpace<T extends ReadonlyArray<string>> = T extends readonly []
  ? ''
  : T extends readonly [string]
    ? T[0]
    : T extends readonly [string, string]
      ? `${T[0]} ${T[1]}`
      : T extends readonly [string, string, string]
        ? `${T[0]} ${T[1]} ${T[2]}`
        : T extends readonly [string, string, string, string]
          ? `${T[0]} ${T[1]} ${T[2]} ${T[3]}`
          : T extends readonly [string, string, string, string, string]
            ? `${T[0]} ${T[1]} ${T[2]} ${T[3]} ${T[4]}`
            : T extends readonly [
                  string,
                  string,
                  string,
                  string,
                  string,
                  string,
                ]
              ? `${T[0]} ${T[1]} ${T[2]} ${T[3]} ${T[4]} ${T[5]}`
              : T extends readonly [
                    string,
                    string,
                    string,
                    string,
                    string,
                    string,
                    string,
                  ]
                ? `${T[0]} ${T[1]} ${T[2]} ${T[3]} ${T[4]} ${T[5]} ${T[6]}`
                : T extends readonly [
                      string,
                      string,
                      string,
                      string,
                      string,
                      string,
                      string,
                      string,
                    ]
                  ? `${T[0]} ${T[1]} ${T[2]} ${T[3]} ${T[4]} ${T[5]} ${T[6]} ${T[7]}`
                  : string

type FilterNever<T extends ReadonlyArray<unknown>> = T extends [
  infer First,
  ...infer Rest,
]
  ? [First] extends [never]
    ? FilterNever<Rest>
    : [First, ...FilterNever<Rest>]
  : []

type JuxtaposeItemValue<Item extends AnyParser | string> =
  Item extends AnyParser ? ParserValue<Item> : never

export type InternalJuxtaposeValue<
  Parsers extends ReadonlyArray<AnyParser | string>,
  Values extends ReadonlyArray<unknown> = [],
> = Values['length'] extends Parsers['length']
  ? FilterNever<Values>
  : InternalJuxtaposeValue<
      Parsers,
      [...Values, JuxtaposeItemValue<Parsers[Values['length']]>]
    >

export type JuxtaposeValue<Parsers extends ReadonlyArray<AnyParser | string>> =
  InternalJuxtaposeValue<Parsers>

type JuxtaposeItemInput<P extends AnyParser | string> = P extends AnyParser
  ? ParserInput<P>
  : P extends string
    ? P
    : never

type InternalJuxtaposeInput<
  Parsers extends ReadonlyArray<AnyParser | string>,
  Inputs extends ReadonlyArray<string> = [],
> = Inputs['length'] extends Parsers['length']
  ? JoinWithSpace<Inputs>
  : InternalJuxtaposeInput<
      Parsers,
      [...Inputs, JuxtaposeItemInput<Parsers[Inputs['length']]>]
    >

export type JuxtaposeInput<Parsers extends ReadonlyArray<AnyParser | string>> =
  InternalJuxtaposeInput<Parsers>

const TypeBrand: unique symbol = Symbol('combinators/juxtapose')

function isJuxtapose(
  value: unknown,
): value is Juxtapose<ReadonlyArray<AnyParser | string>> {
  return isRecordOrArray(value) && TypeBrand in value
}

type JuxtaposeState = {
  index: number
  childStates: ReadonlyArray<unknown>
}

class Juxtapose<
  const Parsers extends ReadonlyArray<AnyParser | string>,
> implements InternalParser<JuxtaposeValue<Parsers>> {
  readonly [TypeBrand] = TypeBrand
  readonly structure: ReadonlyArray<AnyParser | string>

  constructor(structure: Parsers) {
    if (structure.length === 0) {
      throw new RangeError('juxtapose() parser must have at least one parser')
    }

    const storage: Array<AnyParser | string> = []

    for (const parser of structure) {
      if (isJuxtapose(parser)) {
        storage.push(...parser.structure)
      } else {
        storage.push(parser)
      }
    }

    this.structure = storage
  }

  init(): JuxtaposeState {
    return {
      index: 0,
      childStates: this.structure.map((el) =>
        typeof el === 'string' ? undefined : el.init(),
      ),
    }
  }

  feed(state: unknown, token: Token): unknown | null {
    return this.#feed(state as JuxtaposeState, token)
  }

  #feed(s: JuxtaposeState, token: Token): JuxtaposeState | null {
    if (s.index >= this.structure.length) {
      return null
    }

    const element = this.structure[s.index] as AnyParser | string

    if (typeof element === 'string') {
      if (token.type === 'literal' && token.value === element) {
        return { index: s.index + 1, childStates: s.childStates }
      }
      return null
    }

    const childState = s.childStates[s.index]
    const consumed = element.feed(childState, token)
    if (consumed !== null) {
      const next = [...s.childStates]
      next[s.index] = consumed
      return { index: s.index, childStates: next }
    }

    const value = element.read(childState)
    if (value === undefined) {
      return null
    }

    return this.#feed({ index: s.index + 1, childStates: s.childStates }, token)
  }

  read(state: unknown): JuxtaposeValue<Parsers> | undefined {
    const s = state as JuxtaposeState
    const result = [] as Array<unknown>

    for (let i = 0; i < this.structure.length; i++) {
      const el = this.structure[i] as AnyParser | string
      if (typeof el === 'string') {
        continue
      }
      const value = el.read(s.childStates[i])
      if (value === undefined) {
        return undefined
      }
      result.push(value)
    }

    return result as JuxtaposeValue<Parsers>
  }

  toString(): string {
    return Array.from(this.structure, (parser) => parser.toString()).join(' ')
  }
}

export type { Juxtapose }

type JuxtaposeConstructor = {
  <const Parsers extends ReadonlyArray<AnyParser | string>>(
    parsers: Parsers,
  ): Parser<JuxtaposeValue<Parsers>, JuxtaposeInput<Parsers>>
  withInput<Input extends string>(): <
    const Parsers extends ReadonlyArray<AnyParser | string>,
  >(
    parsers: Parsers,
  ) => Parser<JuxtaposeValue<Parsers>, Input>
}

const juxtapose: JuxtaposeConstructor = (<
  const Parsers extends ReadonlyArray<AnyParser | string>,
>(
  parsers: Parsers,
): Parser<JuxtaposeValue<Parsers>, JuxtaposeInput<Parsers>> =>
  new Juxtapose(parsers) as never) as JuxtaposeConstructor

juxtapose.withInput = (<Input extends string>() =>
  <const Parsers extends ReadonlyArray<AnyParser | string>>(
    parsers: Parsers,
  ): Parser<JuxtaposeValue<Parsers>, Input> =>
    new Juxtapose(parsers) as never) as JuxtaposeConstructor['withInput']

export { juxtapose }
