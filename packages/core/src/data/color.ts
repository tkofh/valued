import Color from 'colorjs.io'
import { FULL, NOT_SATISFIED, type Parser, type ParserState } from '../parser'
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

class ColorParser implements Parser<ColorValue> {
  readonly domain = new Set(['<color>'])

  #value: ColorValue | null = null

  get state(): ParserState {
    return this.#value === null ? NOT_SATISFIED : FULL
  }

  feed(token: Token): boolean {
    if (token.type !== 'literal') {
      return false
    }

    const value = colorValue(token.value)

    if (value === false) {
      return false
    }

    this.#value = value

    return true
  }

  flush(): ColorValue | undefined {
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

export function color(): ColorParser {
  return new ColorParser()
}
