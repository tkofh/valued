import { juxtapose } from '../combinators/juxtapose.ts'
import { optional } from '../multipliers/optional.ts'
import type { InternalParser, Parser } from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'
import type { Token } from '../tokenizer.ts'
import { number, type NumberValue } from './number.ts'

export type { Juxtapose, juxtapose } from '../combinators/juxtapose.ts'

const TypeBrand: unique symbol = Symbol('data/ratio')

/**
 * The value a {@link ratio} parser yields: the parsed `.numerator` and
 * `.denominator`, their quotient as `.value`, and whether the ratio is
 * `.isDegenerate`.
 */
class RatioValue {
  readonly [TypeBrand] = TypeBrand

  /**
   * The ratio as a decimal, `numerator / denominator`. `0` when the numerator
   * is `0`, and `Infinity` when the denominator is `0` with a non-zero
   * numerator.
   */
  readonly value: number
  /** The parsed numerator. */
  readonly numerator: number
  /** The parsed denominator; `1` when the input was a bare number. */
  readonly denominator: number
  /**
   * `true` when either component is `0` — a degenerate ratio, which the CSS
   * definition treats as having no meaningful value.
   */
  readonly isDegenerate: boolean
  constructor(numerator: number, denominator: number) {
    this.value =
      numerator === 0
        ? 0
        : denominator === 0
          ? Number.POSITIVE_INFINITY
          : numerator / denominator
    this.numerator = numerator
    this.denominator = denominator
    this.isDegenerate = denominator === 0 || numerator === 0
  }

  /** Scale a width by this ratio: returns `width * value`. */
  widthToHeight(width: number): number {
    return width * this.value
  }

  /** Scale a height by this ratio: returns `height / value`. */
  heightToWidth(height: number): number {
    return height / this.value
  }

  toString(): string {
    return `${this.numerator}/${this.denominator}`
  }
}

export type { RatioValue }

/**
 * Construct a {@link RatioValue} directly — the value a {@link ratio} parser
 * yields.
 *
 * With one argument the ratio is `value / 1`; with two it is `numerator /
 * denominator`.
 */
export function ratioValue(value: number): RatioValue
export function ratioValue(numerator: number, denominator: number): RatioValue
export function ratioValue(a: number, b?: number): RatioValue {
  if (b === undefined) {
    return new RatioValue(a, 1)
  }
  return new RatioValue(a, b)
}

/** Type guard for {@link RatioValue}, as produced by a {@link ratio} parser. */
export function isRatioValue(value: unknown): value is RatioValue {
  return isRecordOrArray(value) && TypeBrand in value
}

function createRatioParser() {
  return juxtapose([
    number({ min: 0 }),
    optional(juxtapose(['/', number({ min: 0 })])),
  ])
}

class RatioParser implements InternalParser<RatioValue> {
  readonly [TypeBrand] = TypeBrand

  readonly #parser: InternalParser<[NumberValue, [NumberValue] | null]>

  constructor() {
    this.#parser = createRatioParser()
  }

  init(): unknown {
    return this.#parser.init()
  }

  feed(state: unknown, token: Token): unknown | null {
    return this.#parser.feed(state, token)
  }

  read(state: unknown): RatioValue | undefined {
    const result = this.#parser.read(state)
    if (result === undefined) {
      return undefined
    }

    const [numerator, denominator] = result
    let denominatorValue = 1
    if (denominator !== null) {
      denominatorValue = denominator[0].value
    }

    return ratioValue(numerator.value, denominatorValue)
  }

  toString(): string {
    return '<ratio>'
  }
}

export type { RatioParser }

/**
 * Parse a CSS [`<ratio>`](https://www.w3.org/TR/css-values-4/#ratios) —
 * `<number>` or `<number> / <number>`, such as `16 / 9`.
 *
 * A bare number is read as that number over `1`. Both components must be
 * non-negative. The result exposes the decimal `.value` alongside the parsed
 * `.numerator` and `.denominator`.
 *
 * @returns a parser yielding a {@link RatioValue}
 *
 * @example
 * ```ts
 * const r = parse('16 / 9', ratio())
 * if (r.valid) {
 *   r.value.value       // 1.777…
 *   r.value.numerator   // 16
 *   r.value.denominator // 9
 * }
 *
 * parse('16', ratio()) // RatioValue for 16 / 1
 * ```
 */
export function ratio(): Parser<
  RatioValue,
  `${number}` | `${number} / ${number}`
> {
  return new RatioParser() as never
}
