import { oneOf } from '../combinators'
import { keyword } from './keyword'

export const lineStyle = oneOf([
  keyword('none'),
  keyword('hidden'),
  keyword('dotted'),
  keyword('dashed'),
  keyword('solid'),
  keyword('double'),
  keyword('groove'),
  keyword('ridge'),
  keyword('inset'),
  keyword('outset'),
])
