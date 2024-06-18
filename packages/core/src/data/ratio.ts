import { juxtapose } from '../combinators'
import { optional } from '../multipliers'
import { number } from './number'

export const ratio = juxtapose([
  number({ min: 0 }),
  optional(juxtapose(['/', number({ min: 0 })])),
])
