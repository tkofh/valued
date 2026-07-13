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

/**
 * Match a single literal keyword — a fixed identifier such as `auto` or
 * `none`.
 *
 * The keyword is carried in the type, so the result narrows to
 * `KeywordValue<'auto'>` rather than `KeywordValue<string>`.
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
export function keyword<const Value extends string>(
  value: Value,
): Parser<KeywordValue<Value>, Value> {
  return new KeywordParser(new Set([value])) as never
}

/**
 * Match any one of a fixed set of keywords — the `|` of several literal
 * identifiers.
 *
 * The result type is the union of the listed keywords, so it narrows to
 * exactly the values you passed. Use this for a closed keyword set;
 * {@link keyword} for a single literal.
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
export function keywords<const Values extends ReadonlyArray<string>>(
  values: Values,
): Parser<KeywordValue<Values[number]>, Values[number]> {
  return new KeywordParser(new Set(values)) as never
}
