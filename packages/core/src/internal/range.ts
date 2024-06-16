import type { Parser, ParserValue } from '../parser'
import type { Token } from '../tokenizer'

export class Range<P extends Parser<unknown>>
  implements Parser<ReadonlyArray<ParserValue<P>>>
{
  readonly parser: P
  readonly minLength: number
  readonly maxLength: number | false
  readonly commaSeparated: boolean

  #value: Array<ParserValue<P>> = []
  #consumed: Array<Token> = []
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

  get isSatisfied(): boolean {
    if (this.#consumed.length > 0 && !this.parser.isSatisfied) {
      return false
    }

    let satisfied = this.#value.length
    if (this.parser.isSatisfied) {
      satisfied++
    }

    return (
      satisfied >= this.minLength &&
      (this.maxLength === false || satisfied <= this.maxLength)
    )
  }

  feed(token: Token): boolean {
    if (this.#value.length === this.maxLength) {
      return false
    }

    if (
      this.commaSeparated &&
      (token.type === 'literal' && token.value === ',') ===
        this.#commaEncountered
    ) {
      return false
    }

    const consumed = this.parser.feed(token)

    if (consumed) {
      this.#consumed.push(token)

      return true
    }

    if (this.parser.isSatisfied) {
      const value = this.parser.flush()
      this.parser.reset()

      const resetConsumed = this.parser.feed(token)

      if (resetConsumed) {
        this.#consumed = [token]
        this.#value.push(value as ParserValue<P>)

        return true
      }

      for (const consumedToken of this.#consumed) {
        this.parser.feed(consumedToken)
      }
    }

    return false
  }

  flush(): ReadonlyArray<ParserValue<P>> | undefined {
    if (this.#consumed.length > 0 && !this.parser.isSatisfied) {
      return undefined
    }

    const result = [...this.#value]
    const tail = this.parser.flush() as ParserValue<P>
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
    this.#consumed = []
    this.#commaEncountered = true
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
