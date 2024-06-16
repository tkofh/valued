import { oneOf } from '../combinators'
import { keyword } from './keyword'

export const blendMode = oneOf([
  keyword('normal'),
  keyword('multiply'),
  keyword('screen'),
  keyword('overlay'),
  keyword('darken'),
  keyword('lighten'),
  keyword('color-dodge'),
  keyword('color-burn'),
  keyword('hard-light'),
  keyword('soft-light'),
  keyword('difference'),
  keyword('exclusion'),
  keyword('hue'),
  keyword('saturation'),
  keyword('color'),
  keyword('luminosity'),
])
