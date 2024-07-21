import {
  type ColorObject,
  ColorSpace,
  HSL,
  HSV,
  HWB,
  LCH,
  Lab,
  OKLCH,
  OKLab,
  P3,
  P3_Linear,
  XYZ_D50,
  XYZ_D65,
  parse,
  sRGB,
  sRGB_Linear,
  serialize,
} from 'colorjs.io/fn'
import {
  type InternalParser,
  type Parser,
  type ParserState,
  currentState,
} from '../parser'
import { isRecordOrArray } from '../predicates'
import { type Token, stringify } from '../tokenizer'

ColorSpace.register(XYZ_D65)
ColorSpace.register(sRGB_Linear)
ColorSpace.register(sRGB)
ColorSpace.register(HSL)
ColorSpace.register(HSV)
ColorSpace.register(HWB)
ColorSpace.register(OKLab)
ColorSpace.register(OKLCH)
ColorSpace.register(P3_Linear)
ColorSpace.register(P3)
ColorSpace.register(XYZ_D50)
ColorSpace.register(Lab)
ColorSpace.register(LCH)

const TypeBrand: unique symbol = Symbol('data/color')

class ColorValue {
  readonly [TypeBrand] = TypeBrand

  readonly value: ColorObject

  constructor(value: string) {
    this.value = parse(value)
  }

  serialize(format: string): string {
    return serialize(this.value, { format })
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

    if (token.type === 'function') {
      const value = colorValue(stringify(token))

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
