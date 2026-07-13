import { bench, describe } from 'vitest'

import { allOf as newAllOf } from '../src/combinators/allOf.ts'
import { oneOf as newOneOf } from '../src/combinators/oneOf.ts'
import { someOf as newSomeOf } from '../src/combinators/someOf.ts'
import { color as newColor } from '../src/data/color.ts'
import { keyword as newKeyword } from '../src/data/keyword.ts'
import { length as newLength } from '../src/data/length.ts'
import { lineStyle as newLineStyle } from '../src/data/line-style.ts'
import { position as newPosition } from '../src/data/position.ts'
import { between as newBetween } from '../src/multipliers/between.ts'
import { oneOrMore as newOneOrMore } from '../src/multipliers/oneOrMore.ts'
import { parse as parseNew } from '../src/parse.ts'

import { allOf as oldAllOf } from './legacy/combinators/allOf.ts'
import { oneOf as oldOneOf } from './legacy/combinators/oneOf.ts'
import { someOf as oldSomeOf } from './legacy/combinators/someOf.ts'
import { color as oldColor } from './legacy/data/color.ts'
import { keyword as oldKeyword } from './legacy/data/keyword.ts'
import { length as oldLength } from './legacy/data/length.ts'
import { lineStyle as oldLineStyle } from './legacy/data/line-style.ts'
import { position as oldPosition } from './legacy/data/position.ts'
import { between as oldBetween } from './legacy/multipliers/between.ts'
import { oneOrMore as oldOneOrMore } from './legacy/multipliers/oneOrMore.ts'
import { parse as parseOld } from './legacy/parse.ts'

describe('length() — "12px"', () => {
  const n = newLength()
  const o = oldLength()
  bench('new', () => {
    parseNew('12px', n)
  })
  bench('old', () => {
    parseOld('12px', o)
  })
})

describe('color() — "red"', () => {
  const n = newColor()
  const o = oldColor()
  bench('new', () => {
    parseNew('red', n)
  })
  bench('old', () => {
    parseOld('red', o)
  })
})

describe('color() — "rgb(255 0 0 / 0.5)"', () => {
  const n = newColor()
  const o = oldColor()
  bench('new', () => {
    parseNew('rgb(255 0 0 / 0.5)', n)
  })
  bench('old', () => {
    parseOld('rgb(255 0 0 / 0.5)', o)
  })
})

describe('oneOf([auto, <length>]) — "auto"', () => {
  const n = newOneOf([newKeyword('auto'), newLength()])
  const o = oldOneOf([oldKeyword('auto'), oldLength()])
  bench('new', () => {
    parseNew('auto', n)
  })
  bench('old', () => {
    parseOld('auto', o)
  })
})

describe('oneOf([auto, <length>]) — "12px"', () => {
  const n = newOneOf([newKeyword('auto'), newLength()])
  const o = oldOneOf([oldKeyword('auto'), oldLength()])
  bench('new', () => {
    parseNew('12px', n)
  })
  bench('old', () => {
    parseOld('12px', o)
  })
})

describe('allOf([<color>, <length>]) — "red 12px"', () => {
  const n = newAllOf([newColor(), newLength()])
  const o = oldAllOf([oldColor(), oldLength()])
  bench('new', () => {
    parseNew('red 12px', n)
  })
  bench('old', () => {
    parseOld('red 12px', o)
  })
})

describe('allOf([<color>, <length>]) — "12px red"', () => {
  const n = newAllOf([newColor(), newLength()])
  const o = oldAllOf([oldColor(), oldLength()])
  bench('new', () => {
    parseNew('12px red', n)
  })
  bench('old', () => {
    parseOld('12px red', o)
  })
})

describe('border (<length> || <line-style> || <color>) — "1px solid red"', () => {
  const n = newSomeOf([newLength(), newLineStyle(), newColor()])
  const o = oldSomeOf([oldLength(), oldLineStyle(), oldColor()])
  bench('new', () => {
    parseNew('1px solid red', n)
  })
  bench('old', () => {
    parseOld('1px solid red', o)
  })
})

describe('border — "red"', () => {
  const n = newSomeOf([newLength(), newLineStyle(), newColor()])
  const o = oldSomeOf([oldLength(), oldLineStyle(), oldColor()])
  bench('new', () => {
    parseNew('red', n)
  })
  bench('old', () => {
    parseOld('red', o)
  })
})

describe('padding (<length>{1,4}) — "10px 20px 10px 20px"', () => {
  const n = newBetween(newLength(), { minLength: 1, maxLength: 4 })
  const o = oldBetween(oldLength(), { minLength: 1, maxLength: 4 })
  bench('new', () => {
    parseNew('10px 20px 10px 20px', n)
  })
  bench('old', () => {
    parseOld('10px 20px 10px 20px', o)
  })
})

describe('<length># — "10px, 20px, 30px"', () => {
  const n = newOneOrMore(newLength(), { commaSeparated: true })
  const o = oldOneOrMore(oldLength(), { commaSeparated: true })
  bench('new', () => {
    parseNew('10px, 20px, 30px', n)
  })
  bench('old', () => {
    parseOld('10px, 20px, 30px', o)
  })
})

describe('position() — "center"', () => {
  const n = newPosition()
  const o = oldPosition()
  bench('new', () => {
    parseNew('center', n)
  })
  bench('old', () => {
    parseOld('center', o)
  })
})

describe('position() — "left top"', () => {
  const n = newPosition()
  const o = oldPosition()
  bench('new', () => {
    parseNew('left top', n)
  })
  bench('old', () => {
    parseOld('left top', o)
  })
})

describe('position() — "left 10px top 20px"', () => {
  const n = newPosition()
  const o = oldPosition()
  bench('new', () => {
    parseNew('left 10px top 20px', n)
  })
  bench('old', () => {
    parseOld('left 10px top 20px', o)
  })
})
