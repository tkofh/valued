import { juxtapose } from '../combinators/juxtapose.ts'
import { optional } from '../multipliers/optional.ts'
import type { InternalParser, Parser } from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'
import type { Token } from '../tokenizer.ts'
import { number, type NumberValue } from './number.ts'

export type { Juxtapose, juxtapose } from '../combinators/juxtapose.ts'

const TypeBrand: unique symbol = Symbol('data/ratio')

class RatioValue {
  readonly [TypeBrand] = TypeBrand

  readonly value: number
  readonly numerator: number
  readonly denominator: number
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

  widthToHeight(width: number): number {
    return width * this.value
  }

  heightToWidth(height: number): number {
    return height / this.value
  }

  toString(): string {
    return `${this.numerator}/${this.denominator}`
  }
}

export type { RatioValue }

export function ratioValue(value: number): RatioValue
export function ratioValue(numerator: number, denominator: number): RatioValue
export function ratioValue(a: number, b?: number): RatioValue {
  if (b === undefined) {
    return new RatioValue(a, 1)
  }
  return new RatioValue(a, b)
}

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

export function ratio(): Parser<
  RatioValue,
  `${number}` | `${number} / ${number}`
> {
  return new RatioParser() as never
}
