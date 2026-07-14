import type {
  AnyParser,
  InternalParser,
  Parser,
  ParserInput,
  ParserValue,
} from '../parser.ts'
import type { Token } from '../tokenizer.ts'

class Mapped<V, W> implements InternalParser<W> {
  readonly parser: InternalParser<V>
  readonly fn: (value: V) => W

  constructor(parser: InternalParser<V>, fn: (value: V) => W) {
    this.parser = parser
    this.fn = fn
  }

  init(): unknown {
    return this.parser.init()
  }

  feed(state: unknown, token: Token): unknown | null {
    return this.parser.feed(state, token)
  }

  read(state: unknown): W | undefined {
    const value = this.parser.read(state)
    return value === undefined ? undefined : this.fn(value)
  }

  toString(): string {
    return this.parser.toString()
  }
}

/** The parser type returned by {@link map}. */
export type { Mapped }

/**
 * Transform the value a parser yields, leaving the grammar it accepts
 * unchanged — the functor `map` over parsers.
 *
 * Runs `parser`, hands its successful value to `fn`, and yields whatever `fn`
 * returns; {@link parse} reports that as the result. The accepted-input type is
 * untouched, so the mapped parser matches exactly the strings the original did
 * — only the shape of the parsed value changes. This is not a Value Definition
 * Syntax operator like {@link allOf} or {@link oneOf}: it reshapes output, it
 * does not describe grammar.
 *
 * Reach for it to normalize a value whose shape depends on which alternative
 * matched. A CSS position-style grammar yields a bare keyword for `center` but
 * a pair for `top left`; mapping both to a `[vertical, horizontal]` tuple lets
 * a caller destructure the result without first checking which form it got.
 *
 * `fn` carries two contracts. It must be **pure**: a mapped parser nested
 * inside a combinator has its value read repeatedly over the course of a parse,
 * so `fn` may run more than once per input. And it must **not return
 * `undefined`** — a parser reports `undefined` to mean "not a complete match
 * yet", so an `undefined` from `fn` is read as a parse failure rather than a
 * value.
 *
 * @param parser - the parser whose value to transform
 * @param fn - a pure mapping from `parser`'s value to the new value; annotate
 * its return type to fix the result's shape, and never return `undefined`
 * @returns a parser accepting the same input as `parser`, yielding `fn`'s result
 *
 * @example
 * ```ts
 * import { allOf, map, oneOf, parse } from 'valued'
 * import {
 *   isKeywordValue,
 *   type KeywordValue,
 *   keywords,
 *   keywordValue,
 * } from 'valued/data/keyword'
 *
 * type Vertical = KeywordValue<'top' | 'center' | 'bottom'>
 * type Horizontal = KeywordValue<'left' | 'center' | 'right'>
 *
 * // A single keyword, or a vertical + horizontal pair — but never `center
 * // center` — normalized so every match is a [vertical, horizontal] tuple.
 * const align = map(
 *   oneOf([
 *     keywords(['top', 'right', 'bottom', 'left', 'center']),
 *     allOf([keywords(['top', 'center', 'bottom']), keywords(['left', 'right'])]),
 *     allOf([keywords(['top', 'bottom']), keywords(['left', 'center', 'right'])]),
 *   ]),
 *   (value): [Vertical, Horizontal] => {
 *     if (!isKeywordValue(value)) {
 *       return value // already [vertical, horizontal]
 *     }
 *     const k = value.value
 *     if (k === 'left' || k === 'right') return [keywordValue('center'), keywordValue(k)]
 *     if (k === 'top' || k === 'bottom') return [keywordValue(k), keywordValue('center')]
 *     return [keywordValue('center'), keywordValue('center')]
 *   },
 * )
 *
 * const result = parse('top', align)
 * if (result.valid) {
 *   const [y, x] = result.value // KeywordValue<'top'>, KeywordValue<'center'>
 * }
 * ```
 */
export function map<P extends AnyParser, W>(
  parser: P,
  fn: (value: ParserValue<P>) => W,
): Parser<W, ParserInput<P>> {
  return new Mapped(parser as InternalParser<ParserValue<P>>, fn) as never
}
