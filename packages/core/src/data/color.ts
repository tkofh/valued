import Color from 'colorjs.io'
import {
  type InternalParser,
  type Parser,
  type ParserState,
  currentState,
} from '../parser'
import { isRecordOrArray } from '../predicates'
import type { Token } from '../tokenizer'

const TypeBrand: unique symbol = Symbol('data/color')

class ColorValue {
  readonly [TypeBrand] = TypeBrand

  readonly value: Color

  constructor(value: string) {
    this.value = new Color(value)
  }
}

export function colorValue(value: string): ColorValue | false {
  try {
    return new ColorValue(value)
  } catch {
    return false
  }
}

export function isColorValue(value: unknown): value is ColorValue {
  return isRecordOrArray(value) && TypeBrand in value
}

class ColorParser implements InternalParser<ColorValue> {
  #value: ColorValue | null = null

  satisfied(state: ParserState): boolean {
    return state === currentState && this.#value !== null
  }

  feed(token: Token): boolean {
    if (token.type === 'literal') {
      const value = colorValue(token.value)

      if (value !== false) {
        this.#value = value
        return true
      }
    }

    return false
  }

  check(token: Token, state: ParserState): boolean {
    if (this.#value !== null && state === currentState) {
      return false
    }

    return token.type === 'literal' && colorValue(token.value) !== false
  }

  read(): ColorValue | undefined {
    if (this.#value === null) {
      return undefined
    }

    return this.#value
  }

  reset(): void {
    this.#value = null
  }

  toString(): string {
    return '<color>'
  }
}

export type { ColorValue, ColorParser }

export function color(): Parser<ColorValue, string> {
  return new ColorParser() as never
}
