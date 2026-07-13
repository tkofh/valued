import { oneOf } from '../combinators/oneOf.ts'
import { number } from './number.ts'
import { percentage } from './percentage.ts'

/**
 * Parse a CSS
 * [`<alpha-value>`](https://www.w3.org/TR/css-color-4/#typedef-alpha-value) — a
 * {@link number} or a {@link percentage}.
 *
 * The result is whichever matched: a {@link PercentageValue} for a `%` input,
 * otherwise a {@link NumberValue}. Note that the range is not constrained to
 * `[0, 1]` / `[0%, 100%]`; clamp downstream if you need that.
 *
 * @returns a parser matching a number or a percentage
 *
 * @example
 * ```ts
 * parse('0.5', alphaValue()) // NumberValue with .value === 0.5
 * parse('50%', alphaValue())  // PercentageValue with .value === 50
 * ```
 */
export const alphaValue = () => oneOf([percentage(), number()])
