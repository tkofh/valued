import { oneOf } from '../combinators'
import { keyword } from './keyword'

export const overflow = oneOf([
  keyword('visible'),
  keyword('hidden'),
  keyword('clip'),
  keyword('scroll'),
  keyword('auto'),
])
