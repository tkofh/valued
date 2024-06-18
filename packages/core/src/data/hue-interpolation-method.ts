import { juxtapose } from '../combinators/juxtapose'
import { oneOf } from '../combinators/oneOf'
import { keyword } from './keyword'

export const hueInterpolationMethod = juxtapose([
  oneOf([
    keyword('shorter'),
    keyword('longer'),
    keyword('increasing'),
    keyword('decreasing'),
  ]),
  'hue',
])
