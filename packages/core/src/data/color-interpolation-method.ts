import { juxtapose, oneOf } from '../combinators'
import { optional } from '../multipliers'
import { hueInterpolationMethod } from './hue-interpolation-method'
import { keyword } from './keyword'

const rectangularColorSpace = oneOf([
  keyword('srgb'),
  keyword('srgb-linear'),
  keyword('display-p3'),
  keyword('a98-rgb'),
  keyword('prophoto-rgb'),
  keyword('rec-2020'),
  keyword('lab'),
  keyword('oklab'),
  keyword('xyz'),
  keyword('xyz-d50'),
  keyword('xyz-d65'),
])

const polarColorSpace = oneOf([
  keyword('hsl'),
  keyword('hwb'),
  keyword('lch'),
  keyword('oklch'),
])

export const colorInterpolationMethod = juxtapose([
  'in',
  oneOf([
    rectangularColorSpace,
    juxtapose([polarColorSpace, optional(hueInterpolationMethod)]),
  ]),
])
