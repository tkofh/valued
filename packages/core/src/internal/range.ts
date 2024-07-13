import {
  type AnyParser,
  type InternalParser,
  type ParserInput,
  type ParserState,
  type ParserValue,
  currentState,
  initialState,
} from '../parser'
import type { Token } from '../tokenizer'

function isComma(token: Token): boolean {
  return token.type === 'literal' && token.value === ','
}

type Repeat<T extends string, S extends string, N extends number> = N extends 0
  ? ''
  : N extends 1
    ? T
    : N extends 2
      ? `${T}${S}${T}`
      : N extends 3
        ? `${T}${S}${T}${S}${T}`
        : N extends 4
          ? `${T}${S}${T}${S}${T}${S}${T}`
          : N extends 5
            ? `${T}${S}${T}${S}${T}${S}${T}${S}${T}`
            : N extends 6
              ? `${T}${S}${T}${S}${T}${S}${T}${S}${T}${S}${T}`
              : N extends 7
                ? `${T}${S}${T}${S}${T}${S}${T}${S}${T}${S}${T}${S}${T}`
                : N extends 8
                  ? `${T}${S}${T}${S}${T}${S}${T}${S}${T}${S}${T}${S}${T}${S}${T}`
                  : string

type Integer = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

type NumberRange<Start extends Integer, End extends Integer> = [
  [
    0,
    0 | 1,
    0 | 1 | 2,
    0 | 1 | 2 | 3,
    0 | 1 | 2 | 3 | 4,
    0 | 1 | 2 | 3 | 4 | 5,
    0 | 1 | 2 | 3 | 4 | 5 | 6,
    0 | 1 | 2 | 3 | 4 | 5 | 6 | 7,
    0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
  ],
  [
    0 | 1,
    1,
    1 | 2,
    1 | 2 | 3,
    1 | 2 | 3 | 4,
    1 | 2 | 3 | 4 | 5,
    1 | 2 | 3 | 4 | 5 | 6,
    1 | 2 | 3 | 4 | 5 | 6 | 7,
    1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
  ],
  [
    0 | 1 | 2,
    1 | 2,
    2,
    2 | 3,
    2 | 3 | 4,
    2 | 3 | 4 | 5,
    2 | 3 | 4 | 5 | 6,
    2 | 3 | 4 | 5 | 6 | 7,
    2 | 3 | 4 | 5 | 6 | 7 | 8,
  ],
  [
    0 | 1 | 2 | 3,
    1 | 2 | 3,
    2 | 3,
    3,
    3 | 4,
    3 | 4 | 5,
    3 | 4 | 5 | 6,
    3 | 4 | 5 | 6 | 7,
    3 | 4 | 5 | 6 | 7 | 8,
  ],
  [
    0 | 1 | 2 | 3 | 4,
    1 | 2 | 3 | 4,
    2 | 3 | 4,
    3 | 4,
    4,
    4 | 5,
    4 | 5 | 6,
    4 | 5 | 6 | 7,
    4 | 5 | 6 | 7 | 8,
  ],
  [
    0 | 1 | 2 | 3 | 4 | 5,
    1 | 2 | 3 | 4 | 5,
    2 | 3 | 4 | 5,
    3 | 4 | 5,
    4 | 5,
    5,
    5 | 6,
    5 | 6 | 7,
    5 | 6 | 7 | 8,
  ],
  [
    0 | 1 | 2 | 3 | 4 | 5 | 6,
    1 | 2 | 3 | 4 | 5 | 6,
    2 | 3 | 4 | 5 | 6,
    3 | 4 | 5 | 6,
    4 | 5 | 6,
    5 | 6,
    6,
    6 | 7,
    6 | 7 | 8,
  ],
  [
    0 | 1 | 2 | 3 | 4 | 5 | 6 | 7,
    1 | 2 | 3 | 4 | 5 | 6 | 7,
    2 | 3 | 4 | 5 | 6 | 7,
    3 | 4 | 5 | 6 | 7,
    4 | 5 | 6 | 7,
    5 | 6 | 7,
    6 | 7,
    7,
    7 | 8,
  ],
  [
    0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
    1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
    2 | 3 | 4 | 5 | 6 | 7 | 8,
    3 | 4 | 5 | 6 | 7 | 8,
    4 | 5 | 6 | 7 | 8,
    5 | 6 | 7 | 8,
    6 | 7 | 8,
    7 | 8,
    8,
  ],
][Start][End]

export type RangeInput<
  P extends AnyParser,
  C extends boolean,
  Min extends number,
  Max extends number,
> = Min extends Integer
  ? Max extends Integer
    ? Repeat<ParserInput<P>, C extends true ? ', ' : ' ', NumberRange<Min, Max>>
    : string
  : string

type Tuple<
  N extends number,
  T,
  R extends ReadonlyArray<T> = [],
> = R['length'] extends N ? R : Tuple<N, T, [...R, T]>

export type RangeValue<
  P extends AnyParser,
  Min extends number,
  Max extends number,
> = Min extends Integer
  ? Max extends Integer
    ? {
        [K in NumberRange<Min, Max>]: Tuple<K, ParserValue<P>>
      }[NumberRange<Min, Max>]
    : string
  : string

export class Range<
  P extends AnyParser,
  CommaSeparated extends boolean,
  Min extends number,
  Max extends number,
> implements InternalParser<RangeValue<P, Min, Max>>
{
  readonly parser: P
  readonly minLength: number
  readonly maxLength: number | false
  readonly commaSeparated: boolean

  #value: Array<ParserValue<P>> = []
  #hasConsumed = false
  #commaEncountered = true

  constructor(
    parser: P,
    minLength: number,
    maxLength: number | false,
    commaSeparated: CommaSeparated,
  ) {
    if (maxLength !== false && minLength > maxLength) {
      throw new RangeError('minLength must be less than or equal to maxLength')
    }

    if (commaSeparated && minLength === 0) {
      throw new RangeError(
        'minLength must be greater than 0 when commaSeparated is true',
      )
    }

    this.parser = parser
    this.minLength = minLength
    this.maxLength = maxLength
    this.commaSeparated = commaSeparated
  }

  satisfied(state: ParserState): boolean {
    if (state === initialState) {
      return this.minLength === 0
    }

    if (this.#hasConsumed && !this.parser.satisfied(currentState)) {
      return false
    }

    let satisfied = this.#value.length
    if (this.parser.satisfied(currentState)) {
      satisfied++
    }

    return (
      satisfied >= this.minLength &&
      (this.maxLength === false || satisfied <= this.maxLength)
    )
  }

  feed(token: Token): boolean {
    if (!this.#canConsumeCurrently(token)) {
      return false
    }

    const consumed = this.parser.feed(token)

    if (consumed) {
      this.#hasConsumed = true
      return true
    }

    if (this.parser.satisfied(currentState)) {
      const wouldConsume = this.parser.check(token, initialState)

      if (wouldConsume) {
        this.#value.push(this.parser.read() as ParserValue<P>)
        this.parser.reset()
        this.parser.feed(token)
        this.#commaEncountered = false

        return true
      }
    }

    return false
  }

  check(token: Token, state: ParserState): boolean {
    if (state === initialState) {
      if (!this.#canConsumeInitially(token)) {
        return false
      }

      return this.parser.check(token, initialState)
    }

    if (!this.#canConsumeCurrently(token)) {
      return false
    }

    const current = this.parser.check(token, currentState)
    if (current) {
      return true
    }

    const initial = this.parser.check(token, initialState)

    return initial && this.parser.satisfied(currentState)
  }

  read(): RangeValue<P, Min, Max> | undefined {
    if (!this.parser.satisfied(currentState) && this.#hasConsumed) {
      return undefined
    }

    const result = [...this.#value]
    const tail = this.parser.read() as ParserValue<P>
    if (tail !== undefined) {
      result.push(tail)
    }

    if (result.length < this.minLength) {
      return undefined
    }

    return result as RangeValue<P, Min, Max>
  }

  reset(): void {
    this.parser.reset()
    this.#value = []
    this.#commaEncountered = true
    this.#hasConsumed = false
  }

  toString(): string {
    let modifier =
      this.maxLength !== false
        ? this.minLength === this.maxLength
          ? `{${this.minLength}}`
          : `{${this.minLength},${this.maxLength}}`
        : this.minLength === 0
          ? '*'
          : '+'
    if (this.commaSeparated) {
      modifier = `#${modifier}`
    }
    return `${this.parser.toString()}${modifier}`
  }

  #canConsumeCurrently(token: Token): boolean {
    if (this.#value.length === this.maxLength) {
      return false
    }

    return !(this.commaSeparated && isComma(token) === this.#commaEncountered)
  }

  #canConsumeInitially(token: Token): boolean {
    return !(
      this.commaSeparated &&
      token.type === 'literal' &&
      token.value === ','
    )
  }
}
