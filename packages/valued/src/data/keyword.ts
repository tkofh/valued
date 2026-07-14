import { map } from '../mappers/map.ts'
import type { InternalParser, Parser } from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'
import type { Token } from '../tokenizer.ts'

const TypeBrand: unique symbol = Symbol('data/keyword')

/**
 * The value a {@link keyword} or {@link keywords} parser yields: the matched
 * keyword, carried in `.value` and in the type.
 */
class KeywordValue<Value extends string> {
  readonly [TypeBrand] = TypeBrand

  /** The matched keyword. */
  readonly value: Value

  constructor(value: Value) {
    this.value = value
  }

  toString(): string {
    return this.value
  }
}

/** Construct a {@link KeywordValue} directly — the value a {@link keyword} parser yields. */
export function keywordValue<Value extends string>(
  value: Value,
): KeywordValue<Value> {
  return new KeywordValue(value)
}

/** Type guard for {@link KeywordValue}, as produced by a {@link keyword} or {@link keywords} parser. */
export function isKeywordValue<Value extends string>(
  value: unknown,
): value is KeywordValue<Value> {
  return isRecordOrArray(value) && TypeBrand in value
}

/** The parser type returned by {@link keyword} and {@link keywords}. */
class KeywordParser<Value extends string> implements InternalParser<
  KeywordValue<Value>
> {
  readonly keywords: ReadonlySet<Value>

  constructor(keywords: ReadonlySet<Value>) {
    this.keywords = keywords
  }

  init(): undefined {
    return undefined
  }

  feed(state: unknown, token: Token): unknown | null {
    if (state !== undefined) {
      return null
    }
    if (token.type !== 'literal') {
      return null
    }
    if (!this.keywords.has(token.value as Value)) {
      return null
    }
    return keywordValue(token.value as Value)
  }

  read(state: unknown): KeywordValue<Value> | undefined {
    return state as KeywordValue<Value> | undefined
  }

  toString(): string {
    return Array.from(this.keywords).join(' | ')
  }
}

export type { KeywordParser, KeywordValue }

type KeywordConstructor = {
  <const Value extends string>(value: Value): Parser<KeywordValue<Value>, Value>
  text<const Value extends string>(value: Value): Parser<Value, Value>
}

type KeywordsConstructor = {
  <const Values extends ReadonlyArray<string>>(
    values: Values,
  ): Parser<KeywordValue<Values[number]>, Values[number]>
  text<const Values extends ReadonlyArray<string>>(
    values: Values,
  ): Parser<Values[number], Values[number]>
}

/**
 * Match a single literal keyword — a fixed identifier such as `auto` or
 * `none`.
 *
 * The keyword is carried in the type, so the result narrows to
 * `KeywordValue<'auto'>` rather than `KeywordValue<string>`. For the bare
 * string in place of the wrapper, use {@link keyword.text}.
 *
 * @param value - the exact keyword to match
 * @returns a parser yielding a {@link KeywordValue} for `value`
 *
 * @example
 * ```ts
 * parse('auto', keyword('auto')) // KeywordValue<'auto'>
 * parse('none', keyword('auto')) // { valid: false }
 * ```
 */
const keyword = (<const Value extends string>(
  value: Value,
): Parser<KeywordValue<Value>, Value> =>
  new KeywordParser(new Set([value])) as never) as KeywordConstructor

/**
 * Match the keyword `value`, yielding the bare string in place of a
 * {@link KeywordValue} wrapper.
 *
 * A shortcut for `map(keyword(value), (v) => v.value)`: the grammar is
 * identical, but the parsed value is the keyword string itself, so it lands in
 * a string-typed result without a later unwrap. Reach for it when you want the
 * identifier rather than the value object — most often as an {@link allOf} or
 * {@link oneOf} branch whose {@link KeywordValue} you would otherwise unwrap.
 *
 * @param value - the exact keyword to match
 * @returns a parser yielding the matched keyword as a string
 *
 * @example
 * ```ts
 * parse('auto', keyword.text('auto')) // 'auto'
 * ```
 */
keyword.text = (<const Value extends string>(
  value: Value,
): Parser<Value, Value> =>
  map(keyword(value), (v) => v.value) as never) as KeywordConstructor['text']

/**
 * Match any one of a fixed set of keywords — the `|` of several literal
 * identifiers.
 *
 * The result type is the union of the listed keywords, so it narrows to
 * exactly the values you passed. Use this for a closed keyword set;
 * {@link keyword} for a single literal, or {@link keywords.text} for the bare
 * strings in place of {@link KeywordValue} wrappers.
 *
 * @param values - the keywords to accept
 * @returns a parser yielding a {@link KeywordValue} for the matched keyword
 *
 * @example
 * ```ts
 * const align = keywords(['start', 'center', 'end'])
 * parse('center', align) // KeywordValue<'start' | 'center' | 'end'>
 * parse('stretch', align) // { valid: false }
 * ```
 */
const keywords = (<const Values extends ReadonlyArray<string>>(
  values: Values,
): Parser<KeywordValue<Values[number]>, Values[number]> =>
  new KeywordParser(new Set(values)) as never) as KeywordsConstructor

/**
 * Match any one of `values`, yielding the bare string in place of a
 * {@link KeywordValue} wrapper — the string form of {@link keywords}.
 *
 * A shortcut for `map(keywords(values), (v) => v.value)`. The result narrows to
 * the union of the listed keywords, so a grammar assembled from `.text` parsers
 * yields plain strings — and, through {@link allOf} or {@link juxtapose},
 * tuples of strings — with no unwrapping.
 *
 * @param values - the keywords to accept
 * @returns a parser yielding the matched keyword as a string
 *
 * @example
 * ```ts
 * const axis = keywords.text(['start', 'center', 'end'])
 * parse('center', axis) // 'center', typed 'start' | 'center' | 'end'
 * ```
 */
keywords.text = (<const Values extends ReadonlyArray<string>>(
  values: Values,
): Parser<Values[number], Values[number]> =>
  map(keywords(values), (v) => v.value) as never) as KeywordsConstructor['text']

export { keyword, keywords }
