import { keywords } from './keyword.ts'

/**
 * Parse a CSS [`<line-style>`](https://www.w3.org/TR/css-backgrounds-3/#typedef-line-style)
 * keyword — a border/outline style such as `none`, `solid`, `dashed`,
 * `dotted`, `double`, or `groove`.
 *
 * @returns a parser yielding the matched {@link KeywordValue}
 *
 * @example
 * ```ts
 * parse('solid', lineStyle()) // KeywordValue<'solid'>
 * ```
 */
export const lineStyle = () =>
  keywords([
    'none',
    'hidden',
    'dotted',
    'dashed',
    'solid',
    'double',
    'groove',
    'ridge',
    'inset',
    'outset',
  ])
