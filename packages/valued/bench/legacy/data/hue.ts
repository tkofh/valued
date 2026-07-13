import { oneOf } from '../combinators/oneOf.ts'
import { angle } from './angle.ts'
import { number } from './number.ts'

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
