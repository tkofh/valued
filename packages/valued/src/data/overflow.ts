import { keywords } from './keyword.ts'

/**
 * Parse a CSS
 * [`overflow`](https://www.w3.org/TR/css-overflow-3/#propdef-overflow) keyword
 * — one of `visible`, `hidden`, `clip`, `scroll`, `auto`.
 *
 * @returns a parser yielding the matched {@link KeywordValue}
 *
 * @example
 * ```ts
 * parse('scroll', overflow()) // KeywordValue<'scroll'>
 * ```
 */
export const overflow = () =>
  keywords(['visible', 'hidden', 'clip', 'scroll', 'auto'])
