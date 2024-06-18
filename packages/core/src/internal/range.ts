import type { Parser, ParserValue } from '../parser'
import type { Token } from '../tokenizer'

function isComma(token: Token): boolean {
  return token.type === 'literal' && token.value === ','
}

export class Range<P extends Parser<unknown>>
  implements Parser<ReadonlyArray<ParserValue<P>>>
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
    commaSeparated: boolean,
  ) {
    if (maxLength !== false && minLength > maxLength) {
      throw new TypeError('minLength must be less than or equal to maxLength')
    }

    if (commaSeparated && minLength === 0) {
      throw new TypeError(
        'minLength must be greater than 0 when commaSeparated is true',
      )
    }

    this.parser = parser
    this.minLength = minLength
    this.maxLength = maxLength
    this.commaSeparated = commaSeparated
  }

  satisfied(state: 'initial' | 'current' = 'current'): boolean {
    if (state === 'initial') {
      return this.minLength === 0
    }

    if (this.#hasConsumed && !this.parser.satisfied()) {
      return false
    }

    let satisfied = this.#value.length
    if (this.parser.satisfied()) {
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

    if (this.parser.satisfied()) {
      const wouldConsume = this.parser.check(token, 'initial')

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

  check(token: Token, state: 'initial' | 'current'): boolean {
    if (state === 'initial') {
      if (!this.#canConsumeInitially(token)) {
        return false
      }

      return this.parser.check(token, 'initial')
    }

    if (!this.#canConsumeCurrently(token)) {
      return false
    }

    const current = this.parser.check(token, 'current')
    if (current) {
      return true
    }

    const initial = this.parser.check(token, 'initial')

    return initial && this.parser.satisfied()
  }

  read(): ReadonlyArray<ParserValue<P>> | undefined {
    if (!this.parser.satisfied() && this.#hasConsumed) {
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

    return result
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
