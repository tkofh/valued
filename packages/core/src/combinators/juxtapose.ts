import {
  type AnyParser,
  type InternalParser,
  type Parser,
  type ParserInput,
  type ParserState,
  currentState,
  initialState,
} from '../parser'
import { isRecordOrArray } from '../predicates'
import type { Token } from '../tokenizer'
import type { FilterStrings } from './types'

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

type Extract<Parsers extends ReadonlyArray<AnyParser | string>> = {
  [K in keyof Parsers]: Parsers[K] extends Parser<unknown, infer I>
    ? I
    : Parsers[K] extends string
      ? Parsers[K]
      : never
}

export type JuxtaposeValue<Parsers extends ReadonlyArray<AnyParser | string>> =
  FilterStrings<Extract<Parsers>>

type JuxtaposeItemInput<Parser extends AnyParser | string> =
  Parser extends AnyParser
    ? ParserInput<Parser>
    : Parser extends string
      ? Parser
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

class Juxtapose<const Parsers extends ReadonlyArray<AnyParser | string>>
  implements InternalParser<JuxtaposeValue<Parsers>>
{
  readonly [TypeBrand] = TypeBrand
  readonly structure: ReadonlyArray<AnyParser | string>

  #index = 0

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

  satisfied(state: ParserState): boolean {
    const start = state === initialState ? 0 : this.#index
    for (let i = start; i < this.structure.length; i++) {
      const parser = this.structure[i]
      if (typeof parser === 'string') {
        return false
      }
      if (typeof parser === 'object' && !parser.satisfied(state)) {
        return false
      }
    }

    return true
  }

  feed(token: Token): boolean {
    return this.#feed(token)
  }

  check(token: Token, state: ParserState): boolean {
    return this.#check(token, state)
  }

  read(): JuxtaposeValue<Parsers> | undefined {
    const result = [] as JuxtaposeValue<Parsers>

    for (const parser of this.structure) {
      if (typeof parser !== 'string') {
        const value = parser.read()

        if (value === undefined) {
          return undefined
        }

        result.push(value as never)
      }
    }

    return result
  }

  reset(): void {
    this.#index = 0

    for (const parser of this.structure) {
      if (typeof parser !== 'string') {
        parser.reset()
      }
    }
  }

  toString(): string {
    return Array.from(this.structure, (parser) => parser.toString()).join(' ')
  }

  #feed(token: Token): boolean {
    if (this.#index === this.structure.length) {
      return false
    }

    const element = this.structure[this.#index] as AnyParser | string

    if (typeof element === 'string') {
      if (token.type === 'literal' && token.value === element) {
        this.#index += 1
        return true
      }
      return false
    }
    const consumed = element.feed(token)

    if (!consumed) {
      if (element.satisfied(currentState)) {
        this.#index += 1
        return this.#feed(token)
      }

      return false
    }

    return true
  }

  #check(token: Token, state: ParserState): boolean {
    if (this.#index === this.structure.length && state === currentState) {
      return false
    }

    for (const element of this.structure.slice(
      state === initialState ? 0 : this.#index,
    )) {
      if (typeof element === 'string') {
        return token.type === 'literal' && token.value === element
      }

      const consumed = element.check(token, state)

      if (consumed) {
        return true
      }
      if (!element.satisfied(state)) {
        return false
      }
    }

    return true
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
