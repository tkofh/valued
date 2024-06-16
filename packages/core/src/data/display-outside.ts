import { oneOf } from '../combinators'
import { keyword } from './keyword'

export const displayOutside = oneOf([
  keyword('block'),
  keyword('inline'),
  keyword('run-in'),
])
