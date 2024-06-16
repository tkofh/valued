import { oneOf } from '../combinators/oneOf'
import { number } from './number'
import { percentage } from './percentage'

export const alphaValue = oneOf([percentage, number()])
