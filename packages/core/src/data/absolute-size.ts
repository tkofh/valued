import { oneOf } from '../combinators/oneOf'
import { keyword } from './keyword'

export const absoluteSize = oneOf([
  keyword('xx-small'),
  keyword('x-small'),
  keyword('small'),
  keyword('medium'),
  keyword('large'),
  keyword('x-large'),
  keyword('xx-large'),
  keyword('xxx-large'),
])
