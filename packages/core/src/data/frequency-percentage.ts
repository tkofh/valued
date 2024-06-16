import { oneOf } from '../combinators'
import { dimension } from './dimension'
import { percentage } from './percentage'

export const frequencyPercentage = oneOf([dimension(['Hz', 'kHz']), percentage])
