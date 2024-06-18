import { oneOf } from '../combinators'
import { keyword } from './keyword'

export const relativeSize = oneOf([keyword('smaller'), keyword('larger')])
