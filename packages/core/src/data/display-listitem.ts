import { allOf, oneOf } from '../combinators'
import { optional } from '../multipliers'
import { displayOutside } from './display-outside'
import { keyword } from './keyword'

export const displayListitem = allOf([
  optional(displayOutside),
  optional(oneOf([keyword('flow'), keyword('flow-root')])),
  keyword('list-item'),
])
