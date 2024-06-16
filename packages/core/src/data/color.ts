import Color from 'colorjs.io'
import type { Parser } from '../parser'
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
  #value: ColorValue | null = null

  get isSatisfied(): boolean {
    return this.#value !== null
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
