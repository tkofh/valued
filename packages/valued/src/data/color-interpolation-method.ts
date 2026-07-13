import { juxtapose } from '../combinators/juxtapose.ts'
import { oneOf } from '../combinators/oneOf.ts'
import { optional } from '../multipliers/optional.ts'
import { hueInterpolationMethod } from './hue-interpolation-method.ts'
import { keywords } from './keyword.ts'

const rectangularColorSpace = () =>
  keywords([
    'srgb',
    'srgb-linear',
    'display-p3',
    'a98-rgb',
    'prophoto-rgb',
    'rec-2020',
    'lab',
    'oklab',
    'xyz',
    'xyz-d50',
    'xyz-d65',
  ])

const polarColorSpace = () => keywords(['hsl', 'hwb', 'lch', 'oklch'])

/**
 * Parse a CSS
 * [`<color-interpolation-method>`](https://www.w3.org/TR/css-color-4/#typedef-color-interpolation-method)
 * — the literal `in` followed by a color space.
 *
 * Rectangular color spaces (`srgb`, `oklab`, `xyz`, …) stand alone; polar
 * spaces (`hsl`, `hwb`, `lch`, `oklch`) may be followed by an optional
 * {@link hueInterpolationMethod}. The leading `in` is required in the input but
 * drops out of the result.
 *
 * @returns a parser matching a color interpolation method
 *
 * @example
 * ```ts
 * parse('in oklch', colorInterpolationMethod())
 * parse('in hsl longer hue', colorInterpolationMethod())
 * ```
 */
export const colorInterpolationMethod = () =>
  juxtapose([
    'in',
    oneOf([
      rectangularColorSpace(),
      juxtapose([polarColorSpace(), optional(hueInterpolationMethod())]),
    ]),
  ])
