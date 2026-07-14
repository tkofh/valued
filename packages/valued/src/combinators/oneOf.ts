import {
  type AnyParser,
  type InternalParser,
  type Parser,
  type ParserInput,
  type ParserValue,
} from '../parser.ts'
import type { Token } from '../tokenizer.ts'

/**
 * The accepted-input type of a {@link oneOf} parser: the union of each
 * alternative's input.
 */
export type OneOfInput<Parsers extends ReadonlyArray<AnyParser>> = ParserInput<
  Parsers[number]
>

/**
 * The value type of a {@link oneOf} parser: the union of each alternative's
 * value.
 */
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

    // Keep every alternative as given — no dedup. Alternatives are tried in
    // order and the first match wins, so a repeated instance is at worst a
    // redundant later branch; behavior never depends on operand identity.
    this.parsers = Array.from(parsers)
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

/** The parser type returned by {@link oneOf}. */
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

/**
 * Match exactly one of `parsers` — the `|` combinator from the Value
 * Definition Syntax.
 *
 * Alternatives are tried in list order, and the result is the value of the
 * first one to match, typed as the union of the alternatives' values. Order
 * therefore matters when two alternatives can accept the same input: list the
 * one you want to win first.
 *
 * @param parsers - the alternatives, in priority order; must be non-empty
 * @returns a parser yielding the matched alternative's value
 * @throws {TypeError} if `parsers` is empty
 *
 * @example
 * ```ts
 * // auto | <length>
 * const widthish = oneOf([keyword('auto'), length()])
 *
 * parse('auto', widthish) // { valid: true, value: KeywordValue<'auto'> }
 * parse('12px', widthish) // { valid: true, value: LengthValue<'px'> }
 * ```
 */
const oneOf: OneOfConstructor = (<
  const Parsers extends ReadonlyArray<AnyParser>,
>(
  parsers: Parsers,
): Parser<OneOfValue<Parsers>, OneOfInput<Parsers>> =>
  new OneOf(parsers) as never) as OneOfConstructor

/**
 * Build a {@link oneOf} parser whose accepted-input type is a fixed string you
 * supply, rather than the union inferred from the alternatives.
 *
 * An escape hatch for when the inferred input type is wider than you want to
 * expose, or expensive to compute. Runtime behavior is identical to
 * {@link oneOf}; only the compile-time input type changes.
 *
 * @example
 * ```ts
 * const widthish = oneOf.withInput<'auto' | `${number}px`>()([
 *   keyword('auto'),
 *   length.subset(['px']),
 * ])
 * ```
 */
oneOf.withInput = (<Input extends string>() =>
  <const Parsers extends ReadonlyArray<AnyParser>>(
    parsers: Parsers,
  ): Parser<OneOfValue<Parsers>, Input> =>
    new OneOf(parsers) as never) as OneOfConstructor['withInput']

export { oneOf }
