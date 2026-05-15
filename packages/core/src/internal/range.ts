import {
  type AnyParser,
  type InternalParser,
  type ParserInput,
  type ParserValue,
} from '../parser.ts'
import type { Token } from '../tokenizer.ts'

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

type RangeState = {
  values: ReadonlyArray<unknown>
  current: unknown
  hasConsumed: boolean
  commaEncountered: boolean
}

export class Range<
  P extends AnyParser,
  CommaSeparated extends boolean,
  Min extends number,
  Max extends number,
> implements InternalParser<RangeValue<P, Min, Max>> {
  readonly parser: P
  readonly minLength: number
  readonly maxLength: number | false
  readonly commaSeparated: boolean

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

  init(): RangeState {
    return {
      values: [],
      current: this.parser.init(),
      hasConsumed: false,
      commaEncountered: true,
    }
  }

  feed(state: unknown, token: Token): unknown | null {
    const s = state as RangeState

    if (s.values.length === this.maxLength) {
      return null
    }

    if (this.commaSeparated) {
      const tokenIsComma = isComma(token)

      if (tokenIsComma === s.commaEncountered) {
        return null
      }

      if (tokenIsComma) {
        const tail = this.parser.read(s.current)
        if (tail === undefined) {
          return null
        }
        return {
          values: [...s.values, tail],
          current: this.parser.init(),
          hasConsumed: false,
          commaEncountered: true,
        }
      }

      const consumed = this.parser.feed(s.current, token)
      if (consumed === null) {
        return null
      }
      return {
        values: s.values,
        current: consumed,
        hasConsumed: true,
        commaEncountered: false,
      }
    }

    const consumed = this.parser.feed(s.current, token)
    if (consumed !== null) {
      return {
        values: s.values,
        current: consumed,
        hasConsumed: true,
        commaEncountered: s.commaEncountered,
      }
    }

    const tail = this.parser.read(s.current)
    if (tail === undefined) {
      return null
    }

    const fresh = this.parser.feed(this.parser.init(), token)
    if (fresh === null) {
      return null
    }

    return {
      values: [...s.values, tail],
      current: fresh,
      hasConsumed: s.hasConsumed,
      commaEncountered: false,
    }
  }

  read(state: unknown): RangeValue<P, Min, Max> | undefined {
    const s = state as RangeState
    const tail = this.parser.read(s.current)

    if (
      this.commaSeparated &&
      s.commaEncountered &&
      s.values.length > 0 &&
      tail === undefined
    ) {
      return undefined
    }

    if (tail === undefined && s.hasConsumed) {
      return undefined
    }

    const result = [...s.values]
    if (tail !== undefined) {
      result.push(tail)
    }

    if (result.length < this.minLength) {
      return undefined
    }

    return result as RangeValue<P, Min, Max>
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
}
