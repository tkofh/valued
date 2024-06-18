import { describe, expect, test } from 'vitest'
import { color, colorValue } from '../src/data/color'
import { dimension, dimensionValue } from '../src/data/dimension'
import { keyword, keywordValue } from '../src/data/keyword'
import { lengthPercentageValue } from '../src/data/length-percentage'
import { number, numberValue } from '../src/data/number'
import { position } from '../src/data/position'
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

  test('treats `-10px` as invalid for <dimension [0, ∞]>', () => {
    const parser = dimension(['px'], { minValue: 0 })
    expect(parse('-10px', parser)).toEqual(invalid())
  })
})

describe('number', () => {
  const cases = [
    ['10', valid(numberValue(10))],
    ['-10', valid(numberValue(-10))],
    ['0', valid(numberValue(0))],
    ['10.5', valid(numberValue(10.5))],
    ['-10.5', valid(numberValue(-10.5))],
    ['0.5', valid(numberValue(0.5))],
    ['foo', invalid()],
  ] as const

  for (const [input, value] of cases) {
    const parser = number()
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

describe('position', () => {
  const validCases = [
    // top | right | bottom | left | center | <length-percentage>
    ['top', keywordValue('top')],
    ['right', keywordValue('right')],
    ['bottom', keywordValue('bottom')],
    ['left', keywordValue('left')],
    ['center', keywordValue('center')],
    ['10px', lengthPercentageValue(10, 'px')],
    ['10%', lengthPercentageValue(10, '%')],

    // left | center | right && top | center | bottom
    ['left top', [keywordValue('left'), keywordValue('top')]],
    ['top left', [keywordValue('left'), keywordValue('top')]],
    ['left center', [keywordValue('left'), keywordValue('center')]],
    ['center left', [keywordValue('left'), keywordValue('center')]],
    ['left bottom', [keywordValue('left'), keywordValue('bottom')]],
    ['bottom left', [keywordValue('left'), keywordValue('bottom')]],
    ['center top', [keywordValue('center'), keywordValue('top')]],
    ['top center', [keywordValue('center'), keywordValue('top')]],
    ['center center', [keywordValue('center'), keywordValue('center')]],
    ['center bottom', [keywordValue('center'), keywordValue('bottom')]],
    ['bottom center', [keywordValue('center'), keywordValue('bottom')]],
    ['right top', [keywordValue('right'), keywordValue('top')]],
    ['top right', [keywordValue('right'), keywordValue('top')]],
    ['center right', [keywordValue('right'), keywordValue('center')]],
    ['right bottom', [keywordValue('right'), keywordValue('bottom')]],
    ['bottom right', [keywordValue('right'), keywordValue('bottom')]],

    // left | center | right | <length-percentage> top | center | bottom | <length-percentage>
    ['left 10%', [keywordValue('left'), lengthPercentageValue(10, '%')]],
    ['center 10%', [keywordValue('center'), lengthPercentageValue(10, '%')]],
    ['right 10%', [keywordValue('right'), lengthPercentageValue(10, '%')]],
    ['10% top', [lengthPercentageValue(10, '%'), keywordValue('top')]],
    ['10% center', [lengthPercentageValue(10, '%'), keywordValue('center')]],
    ['10% bottom', [lengthPercentageValue(10, '%'), keywordValue('bottom')]],

    // [left | right <length-percentage>] && [top | bottom <length-percentage>]
    [
      'left 10px top 10px',
      [
        [keywordValue('left'), lengthPercentageValue(10, 'px')],
        [keywordValue('top'), lengthPercentageValue(10, 'px')],
      ],
    ],
    [
      'top 10px left 10px',
      [
        [keywordValue('left'), lengthPercentageValue(10, 'px')],
        [keywordValue('top'), lengthPercentageValue(10, 'px')],
      ],
    ],
    [
      'left 10px bottom 10px',
      [
        [keywordValue('left'), lengthPercentageValue(10, 'px')],
        [keywordValue('bottom'), lengthPercentageValue(10, 'px')],
      ],
    ],
    [
      'bottom 10px left 10px',
      [
        [keywordValue('left'), lengthPercentageValue(10, 'px')],
        [keywordValue('bottom'), lengthPercentageValue(10, 'px')],
      ],
    ],
    [
      'right 10px top 10px',
      [
        [keywordValue('right'), lengthPercentageValue(10, 'px')],
        [keywordValue('top'), lengthPercentageValue(10, 'px')],
      ],
    ],
    [
      'top 10px right 10px',
      [
        [keywordValue('right'), lengthPercentageValue(10, 'px')],
        [keywordValue('top'), lengthPercentageValue(10, 'px')],
      ],
    ],
    [
      'right 10px bottom 10px',
      [
        [keywordValue('right'), lengthPercentageValue(10, 'px')],
        [keywordValue('bottom'), lengthPercentageValue(10, 'px')],
      ],
    ],
    [
      'bottom 10px right 10px',
      [
        [keywordValue('right'), lengthPercentageValue(10, 'px')],
        [keywordValue('bottom'), lengthPercentageValue(10, 'px')],
      ],
    ],
  ] as const

  for (const [input, output] of validCases) {
    test(`treats \`${input}\` as valid`, () => {
      expect(parse(input, position)).toEqual(valid(output))
    })
  }
})
