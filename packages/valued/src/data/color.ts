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

// Register the color spaces colorjs.io needs to parse and serialize the CSS
// color functions this data type accepts.
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

/**
 * The value a {@link color} parser yields: a parsed color wrapping a
 * `colorjs.io` color object.
 */
class ColorValue {
  readonly [TypeBrand] = TypeBrand

  /** The parsed color, as a `colorjs.io` color object. */
  readonly value: ColorObject

  constructor(value: string) {
    this.value = parse(value)
  }

  /**
   * Serialize the color to a string, passing `format` through to `colorjs.io`.
   * `'hex'` and `'rgb'` produce those forms for sRGB colors; `'color'` (the
   * default used by `toString`) emits `color(space …)` in the color's own
   * space. A format that doesn't apply to the color's space falls back to that
   * space's notation.
   */
  serialize(format: string): string {
    return serialize(this.value, { format })
  }

  toString(): string {
    return this.serialize('color')
  }
}

/**
 * Parse `value` into a {@link ColorValue}, or return `false` when it is not a
 * color `colorjs.io` can parse.
 *
 * The `false`-on-failure form is what the {@link color} parser uses internally;
 * reach for it directly when you want to validate a color string without
 * building a parser.
 */
export function colorValue(value: string): ColorValue | false {
  try {
    return new ColorValue(value)
  } catch {
    return false
  }
}

/** Type guard for {@link ColorValue}, as produced by a {@link color} parser. */
export function isColorValue(value: unknown): value is ColorValue {
  return isRecordOrArray(value) && TypeBrand in value
}

/** The parser type returned by {@link color}. */
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

/**
 * Parse a CSS [`<color>`](https://www.w3.org/TR/css-color-4/) — any color the
 * CSS Color specification accepts.
 *
 * Parsing is delegated to `colorjs.io`, so named colors, hex, and the
 * functional forms (`rgb()`, `hsl()`, `oklch()`, `color()`, and the rest) all
 * match. The accepted input is plain `string` because the set of valid colors
 * can't be expressed as a template-literal type. The result wraps a
 * `colorjs.io` color object, which you can re-serialize.
 *
 * @returns a parser yielding a {@link ColorValue}
 *
 * @example
 * ```ts
 * const result = parse('red', color())
 * if (result.valid) {
 *   result.value.serialize('hex') // '#f00'
 * }
 *
 * parse('oklch(70% 0.1 200)', color()) // also valid
 * ```
 */
export function color(): Parser<ColorValue, string> {
  return new ColorParser() as never
}
