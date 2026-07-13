import { juxtapose } from '../combinators/juxtapose.ts'
import { keywords } from './keyword.ts'

/**
 * Parse a CSS
 * [`<hue-interpolation-method>`](https://www.w3.org/TR/css-color-4/#typedef-hue-interpolation-method)
 * — one of `shorter`, `longer`, `increasing`, `decreasing`, followed by the
 * literal `hue`.
 *
 * The `hue` literal is required in the input but drops out of the result, which
 * is a one-element tuple holding the matched keyword.
 *
 * @returns a parser matching a hue interpolation method
 *
 * @example
 * ```ts
 * parse('shorter hue', hueInterpolationMethod()) // [KeywordValue<'shorter'>]
 * ```
 */
export const hueInterpolationMethod = () =>
  juxtapose([
    keywords(['shorter', 'longer', 'increasing', 'decreasing']),
    'hue',
  ])
