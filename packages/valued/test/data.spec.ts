import { describe, expect, test } from 'vitest'
import { allOf } from '../src/combinators/allOf.ts'
import { angle, angleValue } from '../src/data/angle.ts'
import { color, colorValue } from '../src/data/color.ts'
import { dimension, dimensionValue } from '../src/data/dimension.ts'
import { keyword, keywords, keywordValue } from '../src/data/keyword.ts'
import { length, lengthValue } from '../src/data/length.ts'
import { lengthPercentageValue } from '../src/data/length-percentage.ts'
import { integer, integerValue } from '../src/data/integer.ts'
import { number, numberValue } from '../src/data/number.ts'
import { position } from '../src/data/position.ts'
import { parse } from '../src/parse.ts'
import { invalid, valid } from '../src/parser.ts'

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

describe('integer', () => {
  const cases = [
    ['10', valid(integerValue(10))],
    ['-10', valid(integerValue(-10))],
    ['0', valid(integerValue(0))],
    ['1.5', invalid()],
    ['foo', invalid()],
    // whole numbers beyond the 32-bit range must still parse
    ['2147483647', valid(integerValue(2147483647))],
    ['2147483648', valid(integerValue(2147483648))],
    ['3000000000', valid(integerValue(3000000000))],
  ] as const

  for (const [input, value] of cases) {
    const parser = integer()
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

describe('keyword.text', () => {
  const cases = [
    ['auto', 'auto', valid('auto')],
    ['auto', 'none', invalid()],
  ] as const

  for (const [word, input, value] of cases) {
    const parser = keyword.text(word)
    test(`treats \`${input}\` as ${value.valid ? 'valid' : 'invalid'}`, () => {
      expect(parse(input, parser)).toEqual(value)
    })
  }
})

describe('keywords.text', () => {
  const parser = keywords.text(['start', 'center', 'end'])
  const cases = [
    ['start', valid('start')],
    ['center', valid('center')],
    ['stretch', invalid()],
  ] as const

  for (const [input, value] of cases) {
    test(`treats \`${input}\` as ${value.valid ? 'valid' : 'invalid'}`, () => {
      expect(parse(input, parser)).toEqual(value)
    })
  }

  test('composes into a string tuple through allOf, no unwrapping', () => {
    const pair = allOf([
      keywords.text(['top', 'center', 'bottom']),
      keywords.text(['left', 'right']),
    ])
    expect(parse('top left', pair)).toEqual(valid(['top', 'left']))
    expect(parse('left top', pair)).toEqual(valid(['top', 'left']))
  })
})

describe('color', () => {
  const cases = [
    ['#000', valid(colorValue('#000'))],
    ['#0000', valid(colorValue('#0000'))],
    ['#000000', valid(colorValue('#000000'))],
    ['#00000000', valid(colorValue('#00000000'))],
    [
      'rgb(255 0 0 / 44.137931034482754%)',
      valid(colorValue('rgb(255 0 0 / 44.137931034482754%)')),
    ],
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
      expect(parse(input, position())).toEqual(valid(output))
    })
  }
})

describe('angle', () => {
  const validCases = [
    ['45deg', angleValue(45, 'deg')],
    ['45deg', angleValue(45, 'deg')],
    ['45grad', angleValue(45, 'grad')],
    ['45rad', angleValue(45, 'rad')],
    ['45turn', angleValue(45, 'turn')],
  ] as const

  for (const [input, output] of validCases) {
    test(`treats \`${input}\` as valid`, () => {
      expect(parse(input, angle())).toEqual(valid(output))
    })
  }

  test('throws an error when an unknown unit is provided', () => {
    // @ts-expect-error
    expect(() => angleValue(45, 'foo')).toThrow()
  })

  test('normalizes values correctly', () => {
    expect(angleValue(90, 'deg').normalized).toBeCloseTo(
      angleValue(Math.PI / 2, 'rad').normalized,
    )

    expect(angleValue(Math.PI / 2, 'rad').normalized).toBeCloseTo(
      angleValue(100, 'grad').normalized,
    )

    expect(angleValue(100, 'grad').normalized).toBeCloseTo(
      angleValue(0.25, 'turn').normalized,
    )

    expect(angleValue(0.25, 'turn').normalized).toBeCloseTo(
      angleValue(90, 'deg').normalized,
    )
  })
})

describe('length', () => {
  const validCases = [
    ['10px', lengthValue(10, 'px')],
    ['10rem', lengthValue(10, 'rem')],
    ['10em', lengthValue(10, 'em')],
    ['10ex', lengthValue(10, 'ex')],
    ['10ic', lengthValue(10, 'ic')],
    ['10lh', lengthValue(10, 'lh')],
    ['10rcap', lengthValue(10, 'rcap')],
    ['10rch', lengthValue(10, 'rch')],
    ['10rem', lengthValue(10, 'rem')],
    ['10rex', lengthValue(10, 'rex')],
    ['10ric', lengthValue(10, 'ric')],
    ['10rlh', lengthValue(10, 'rlh')],
    ['10vh', lengthValue(10, 'vh')],
    ['10svh', lengthValue(10, 'svh')],
    ['10lhv', lengthValue(10, 'lhv')],
    ['10dvh', lengthValue(10, 'dvh')],
    ['10vw', lengthValue(10, 'vw')],
    ['10svw', lengthValue(10, 'svw')],
    ['10lvw', lengthValue(10, 'lvw')],
    ['10dvw', lengthValue(10, 'dvw')],
    ['10vmin', lengthValue(10, 'vmin')],
    ['10svmin', lengthValue(10, 'svmin')],
    ['10lvmin', lengthValue(10, 'lvmin')],
    ['10dvmin', lengthValue(10, 'dvmin')],
    ['10vmax', lengthValue(10, 'vmax')],
    ['10svmax', lengthValue(10, 'svmax')],
    ['10lvmax', lengthValue(10, 'lvmax')],
    ['10dvmax', lengthValue(10, 'dvmax')],
    ['10vb', lengthValue(10, 'vb')],
    ['10svb', lengthValue(10, 'svb')],
    ['10lvb', lengthValue(10, 'lvb')],
    ['10dvb', lengthValue(10, 'dvb')],
    ['10vi', lengthValue(10, 'vi')],
    ['10svi', lengthValue(10, 'svi')],
    ['10lvi', lengthValue(10, 'lvi')],
    ['10dvi', lengthValue(10, 'dvi')],
    ['10cqw', lengthValue(10, 'cqw')],
    ['10cqh', lengthValue(10, 'cqh')],
    ['10cqi', lengthValue(10, 'cqi')],
    ['10cqb', lengthValue(10, 'cqb')],
    ['10cqmin', lengthValue(10, 'cqmin')],
    ['10cqmax', lengthValue(10, 'cqmax')],
    ['10px', lengthValue(10, 'px')],
    ['10cm', lengthValue(10, 'cm')],
    ['10mm', lengthValue(10, 'mm')],
    ['10Q', lengthValue(10, 'Q')],
    ['10in', lengthValue(10, 'in')],
    ['10pc', lengthValue(10, 'pc')],
    ['10pt', lengthValue(10, 'pt')],
  ] as const

  for (const [input, output] of validCases) {
    const parser = length()
    test(`treats \`${input}\` as valid`, () => {
      expect(parse(input, parser)).toEqual(valid(output))
    })
  }
})

describe('length.subset', () => {
  const validCases = [
    ['10px', lengthValue(10, 'px')],
    ['10rem', lengthValue(10, 'rem')],
  ] as const

  const parser = length.subset(['px', 'rem'])

  for (const [input, output] of validCases) {
    test(`treats \`${input}\` as valid`, () => {
      expect(parse(input, parser)).toEqual(valid(output))
    })
  }

  const invalidCases = ['10em', '10ex'] as const

  for (const input of invalidCases) {
    test(`treats \`${input}\` as invalid`, () => {
      expect(parse(input, parser)).toEqual(invalid())
    })
  }
})
