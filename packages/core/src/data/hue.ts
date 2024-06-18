import { oneOf } from '../combinators'
import { angle } from './angle'
import { number } from './number'

interface HueOptions {
  min?: number | false | null | undefined
  max?: number | false | null | undefined
}

export function hue(options?: HueOptions) {
  return oneOf([
    number(options),
    angle({ minValue: options?.min, maxValue: options?.max }),
  ])
}
