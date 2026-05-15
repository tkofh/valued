import {
  type ColorObject,
  ColorSpace,
  HSL,
  HSV,
  HWB,
  Lab,
  LCH,
  OKLab,
  OKLCH,
  P3,
  P3_Linear,
  parse,
  serialize,
  sRGB,
  sRGB_Linear,
  XYZ_D50,
  XYZ_D65,
} from 'colorjs.io/fn'
import type { InternalParser, Parser } from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'
import { stringify, type Token } from '../tokenizer.ts'

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

  toString(): string {
    return this.serialize('color')
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
  init(): undefined {
    return undefined
  }

  feed(state: unknown, token: Token): unknown | null {
    if (state !== undefined) {
      return null
    }
    if (token.type === 'literal') {
      const value = colorValue(token.value)
      if (value !== false) {
        return value
      }
    }
    if (token.type === 'function') {
      const value = colorValue(stringify(token))
      if (value !== false) {
        return value
      }
    }
    return null
  }

  read(state: unknown): ColorValue | undefined {
    return state as ColorValue | undefined
  }

  toString(): string {
    return '<color>'
  }
}

export type { ColorParser, ColorValue }

export function color(): Parser<ColorValue, string> {
  return new ColorParser() as never
}
