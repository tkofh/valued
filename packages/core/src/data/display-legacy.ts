import { oneOf } from '../combinators'
import { keyword } from './keyword'

export const displayLegacy = oneOf([
  keyword('inline-block'),
  keyword('inline-table'),
  keyword('inline-flex'),
  keyword('inline-grid'),
])
