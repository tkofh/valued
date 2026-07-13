import type {
  AnyParser,
  InternalParser,
  Parser,
  ParserInput,
  ParserValue,
} from '../parser.ts'
import type { Token } from '../tokenizer.ts'

/** The value type of an {@link optional} parser: `P`'s value, or `null` when absent. */
export type OptionalValue<P extends AnyParser> = ParserValue<P> | null

/** The accepted-input type of an {@link optional} parser: `P`'s input, or the empty string. */
export type OptionalInput<P extends AnyParser> = ParserInput<P> | ''

class Optional<
  const P extends AnyParser,
> implements InternalParser<ParserValue<P> | null> {
  readonly parser: P

  constructor(parser: P) {
    this.parser = parser
  }

  init(): unknown {
    return this.parser.init()
  }

  feed(state: unknown, token: Token): unknown | null {
    return this.parser.feed(state, token)
  }

  read(state: unknown): ParserValue<P> | null {
    const value = this.parser.read(state) as ParserValue<P> | undefined
    if (value !== undefined) {
      return value
    }
    return null
  }

  toString(): string {
    return `${this.parser.toString()}?`
  }
}

/**
 * Match `parser` or nothing — the `?` multiplier from the Value Definition
 * Syntax.
 *
 * When `parser` matches, its value is returned; when it is absent — an empty
 * input, or a slot skipped inside a larger sequence — the result is `null`
 * rather than a failure. Most useful as an optional slot within a
 * {@link juxtapose} sequence.
 *
 * @param parser - the parser to make optional
 * @returns a parser yielding `parser`'s value, or `null` when absent
 *
 * @example
 * ```ts
 * parse('12px', optional(length())) // { valid: true, value: LengthValue }
 * parse('', optional(length()))     // { valid: true, value: null }
 * ```
 */
export function optional<const P extends AnyParser>(
  parser: P,
): Parser<OptionalValue<P>, OptionalInput<P>> {
  return new Optional(parser) as never
}
