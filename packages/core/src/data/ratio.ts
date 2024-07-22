import { juxtapose } from '../combinators/juxtapose'
import { optional } from '../multipliers/optional'
import type { InternalParser, Parser, ParserState } from '../parser'
import { isRecordOrArray } from '../predicates'
import type { Token } from '../tokenizer'
import { type NumberValue, number } from './number'

export type { juxtapose, Juxtapose } from '../combinators/juxtapose'

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

  #parser: InternalParser<[NumberValue, [NumberValue] | null]>

  constructor() {
    this.#parser = createRatioParser()
  }

  satisfied(state: ParserState): boolean {
    return this.#parser.satisfied(state)
  }

  feed(token: Token): boolean {
    return this.#parser.feed(token)
  }

  check(token: Token, state: ParserState): boolean {
    return this.#parser.check(token, state)
  }

  read(): RatioValue | undefined {
    const result = this.#parser.read()

    if (result === undefined) {
      return undefined
    }

    const [numerator, denominator] = result

    const numeratorValue = numerator.value
    let denominatorValue = 1

    if (denominator !== null) {
      denominatorValue = denominator[0].value
    }

    return ratioValue(numeratorValue, denominatorValue)
  }

  reset(): void {
    this.#parser.reset()
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
