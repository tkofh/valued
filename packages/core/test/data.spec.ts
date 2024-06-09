import { describe, expect, test } from 'vitest'
import { color, colorValue } from '../src/data/color'
import { dimension, dimensionValue } from '../src/data/dimension'
import { keyword, keywordValue } from '../src/data/keyword'
import { parse } from '../src/parse'
import { invalid, valid } from '../src/parser'

describe('dimension', () => {
  const cases = [
    [['px'], '10px', valid(dimensionValue(10, 'px'))],
    [['%'], '5%', valid(dimensionValue(5, '%'))],
    [['rem'], '-3rem', valid(dimensionValue(-3, 'rem'))],
    [['px'], '10 px', invalid()],
    [['px'], '10', invalid()],
    [['px'], '10foo', invalid()],
    [['px'], 'foo', invalid()],
  ] as const

  for (const [units, input, value] of cases) {
    const parser = dimension(units)
    test(`treats \`${input}\` as ${value.valid ? 'valid' : 'invalid'}`, () => {
      expect(parse(input, parser)).toEqual(value)
    })
  }
})

describe('keyword', () => {
  const cases = [
    ['foo', 'foo', valid(keywordValue('foo'))],
    ['foo', 'bar', invalid()],
  ] as const

  for (const [word, input, value] of cases) {
    const parser = keyword(word)
    test(`treats \`${input}\` as ${value.valid ? 'valid' : 'invalid'}`, () => {
      expect(parse(input, parser)).toEqual(value)
    })
  }
})

describe('color', () => {
  const cases = [
    ['#000', valid(colorValue('#000'))],
    ['#0000', valid(colorValue('#0000'))],
    ['#000000', valid(colorValue('#000000'))],
    ['#00000000', valid(colorValue('#00000000'))],
    ['#00000', invalid()],
  ] as const

  for (const [input, value] of cases) {
    const parser = color()
    test(`treats \`${input}\` as ${value.valid ? 'valid' : 'invalid'}`, () => {
      expect(parse(input, parser)).toEqual(value)
    })
  }
})
