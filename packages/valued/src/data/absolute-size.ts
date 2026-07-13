import { oneOf } from '../combinators/oneOf.ts'
import { keyword } from './keyword.ts'

/**
 * Parse a CSS
 * [`<absolute-size>`](https://www.w3.org/TR/css-fonts-4/#valdef-font-size-absolute-size)
 * keyword — one of `xx-small`, `x-small`, `small`, `medium`, `large`,
 * `x-large`, `xx-large`, `xxx-large`.
 *
 * @returns a parser yielding the matched {@link KeywordValue}
 *
 * @example
 * ```ts
 * parse('large', absoluteSize()) // KeywordValue<'large'>
 * ```
 */
export const absoluteSize = () =>
  oneOf([
    keyword('xx-small'),
    keyword('x-small'),
    keyword('small'),
    keyword('medium'),
    keyword('large'),
    keyword('x-large'),
    keyword('xx-large'),
    keyword('xxx-large'),
  ])
