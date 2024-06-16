import { oneOf } from '../combinators'
import { keyword } from './keyword'

export const displayInside = oneOf([
  keyword('flow'),
  keyword('flow-root'),
  keyword('table'),
  keyword('flex'),
  keyword('grid'),
  keyword('ruby'),
])
