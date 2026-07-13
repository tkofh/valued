import { keywords } from './keyword.ts'

/**
 * Parse a CSS
 * [`<relative-size>`](https://www.w3.org/TR/css-fonts-4/#valdef-font-size-relative-size)
 * keyword — `smaller` or `larger`.
 *
 * @returns a parser yielding the matched {@link KeywordValue}
 *
 * @example
 * ```ts
 * parse('smaller', relativeSize()) // KeywordValue<'smaller'>
 * ```
 */
export const relativeSize = () => keywords(['smaller', 'larger'])
