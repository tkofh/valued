import { keywords } from './keyword.ts'

/**
 * Parse a CSS [`<blend-mode>`](https://www.w3.org/TR/compositing-1/#typedef-blend-mode)
 * keyword — `normal`, `multiply`, `screen`, `overlay`, and the rest of the
 * separable and non-separable blend modes.
 *
 * @returns a parser yielding the matched {@link KeywordValue}
 *
 * @example
 * ```ts
 * parse('multiply', blendMode()) // KeywordValue<'multiply'>
 * ```
 */
export const blendMode = () =>
  keywords([
    'normal',
    'multiply',
    'screen',
    'overlay',
    'darken',
    'lighten',
    'color-dodge',
    'color-burn',
    'hard-light',
    'soft-light',
    'difference',
    'exclusion',
    'hue',
    'saturation',
    'color',
    'luminosity',
  ])
