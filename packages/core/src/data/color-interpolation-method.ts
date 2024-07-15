import { juxtapose, oneOf } from '../combinators'
import { optional } from '../multipliers'
import { hueInterpolationMethod } from './hue-interpolation-method'
import { keywords } from './keyword'

const rectangularColorSpace = keywords([
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

const polarColorSpace = keywords(['hsl', 'hwb', 'lch', 'oklch'])

export const colorInterpolationMethod = juxtapose([
  'in',
  oneOf([
    rectangularColorSpace,
    juxtapose([polarColorSpace, optional(hueInterpolationMethod)]),
  ]),
])
