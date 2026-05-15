import { oneOf } from '../combinators/oneOf.ts'
import { number } from './number.ts'
import { percentage } from './percentage.ts'

export const alphaValue = () => oneOf([percentage(), number()])
