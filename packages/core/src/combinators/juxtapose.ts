import {
  type AnyParser,
  BaseParser,
  type Parser,
  type ParserState,
  currentState,
  initialState,
} from '../parser'
import type { Token } from '../tokenizer'
import type {
  ExtractParserInputs,
  ExtractParserValues,
  FilterStrings,
} from './types'

type JuxtaposeValue<Parsers extends ReadonlyArray<AnyParser | string>> =
  FilterStrings<ExtractParserValues<Parsers>>

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

type JuxtaposeInput<Parsers extends ReadonlyArray<AnyParser | string>> =
  JoinWithSpace<ExtractParserInputs<Parsers, string>>

class Juxtapose<
    Parsers extends ReadonlyArray<AnyParser | string>,
    Input extends string = JuxtaposeInput<Parsers>,
  >
  extends BaseParser<JuxtaposeValue<Parsers>, Input>
  implements Parser<JuxtaposeValue<Parsers>, Input>
{
  readonly structure: ReadonlyArray<AnyParser | string>

  #index = 0

  constructor(structure: Parsers) {
    super()
    if (structure.length === 0) {
      throw new RangeError('juxtapose() parser must have at least one parser')
    }

    const storage: Array<AnyParser | string> = []

    for (const parser of structure) {
      if (parser instanceof Juxtapose) {
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

  override toString(): string {
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
  ): Juxtapose<Parsers>
  withInput<Input extends string>(): <
    const Parsers extends ReadonlyArray<AnyParser | string>,
  >(
    parsers: Parsers,
  ) => Juxtapose<Parsers, Input>
}

const juxtapose: JuxtaposeConstructor = function juxtapose<
  const Parsers extends ReadonlyArray<AnyParser | string>,
>(parsers: Parsers): Juxtapose<Parsers> {
  return new Juxtapose(parsers)
} as JuxtaposeConstructor

juxtapose.withInput = (<Input extends string>() =>
  <const Parsers extends ReadonlyArray<AnyParser | string>>(
    parsers: Parsers,
  ): Juxtapose<Parsers, Input> =>
    new Juxtapose(parsers)) as JuxtaposeConstructor['withInput']

export { juxtapose }
