import { oneOf } from '../combinators/oneOf.ts'
import { angle } from './angle.ts'
import { number } from './number.ts'

interface HueOptions {
  /**
   * Reject values below this bound (inclusive). Applies to the number and to
   * the angle's numeric part.
   *
   * @default undefined
   */
  min?: number | false | null | undefined
  /**
   * Reject values above this bound (inclusive). Applies to the number and to
   * the angle's numeric part.
   *
   * @default undefined
   */
  max?: number | false | null | undefined
}

/**
 * Parse a CSS [`<hue>`](https://www.w3.org/TR/css-color-4/#typedef-hue) — a
 * {@link number} or an {@link angle}.
 *
 * A bare number is interpreted as degrees. The result is whichever matched: an
 * {@link AngleValue} for a unit-bearing input, otherwise a {@link NumberValue}.
 * Pass `min` / `max` to constrain the value on both branches.
 *
 * @param options - optional inclusive `min` / `max` bounds
 * @returns a parser matching a number or an angle
 *
 * @example
 * ```ts
 * parse('90', hue())      // NumberValue with .value === 90
 * parse('0.5turn', hue()) // AngleValue with .normalized === 0.5
 * ```
 */
export function hue(options?: HueOptions) {
  return oneOf([
    number(options),
    angle({ minValue: options?.min, maxValue: options?.max }),
  ])
}
