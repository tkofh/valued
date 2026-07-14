import { describe, expect, test } from 'vitest'
import { allOf } from '../src/combinators/allOf.ts'
import { oneOf } from '../src/combinators/oneOf.ts'
import {
  isKeywordValue,
  type KeywordValue,
  keyword,
  keywords,
  keywordValue,
} from '../src/data/keyword.ts'
import { map } from '../src/mappers/map.ts'
import { parse } from '../src/parse.ts'
import { invalid, valid } from '../src/parser.ts'

describe('map', () => {
  test('transforms a matched value', () => {
    const shout = map(keyword('foo'), (v) => v.value.toUpperCase())
    expect(parse('foo', shout)).toEqual(valid('FOO'))
  })

  test('leaves the accepted input unchanged', () => {
    const shout = map(keyword('foo'), (v) => v.value.toUpperCase())
    expect(parse('bar', shout)).toEqual(invalid())
    // whole-string matching still holds — trailing content fails
    expect(parse('foo bar', shout)).toEqual(invalid())
  })

  test('runs when nested inside a combinator, whose reads probe it repeatedly', () => {
    const parser = allOf([
      map(keyword('a'), (v) => v.value.toUpperCase()),
      keyword('b'),
    ])
    expect(parse('a b', parser)).toEqual(valid(['A', keywordValue('b')]))
    expect(parse('b a', parser)).toEqual(valid(['A', keywordValue('b')]))
  })

  describe('normalizing a position-style grammar to a fixed tuple', () => {
    type Vertical = KeywordValue<'top' | 'center' | 'bottom'>
    type Horizontal = KeywordValue<'left' | 'center' | 'right'>

    const align = map(
      oneOf([
        keywords(['top', 'right', 'bottom', 'left', 'center']),
        allOf([
          keywords(['top', 'center', 'bottom']),
          keywords(['left', 'right']),
        ]),
        allOf([
          keywords(['top', 'bottom']),
          keywords(['left', 'center', 'right']),
        ]),
      ]),
      (value): [Vertical, Horizontal] => {
        if (!isKeywordValue(value)) {
          return value
        }
        const k = value.value
        if (k === 'left' || k === 'right') {
          return [keywordValue('center'), keywordValue(k)]
        }
        if (k === 'top' || k === 'bottom') {
          return [keywordValue(k), keywordValue('center')]
        }
        return [keywordValue('center'), keywordValue('center')]
      },
    )

    const cases = [
      ['center', valid([keywordValue('center'), keywordValue('center')])],
      ['top', valid([keywordValue('top'), keywordValue('center')])],
      ['left', valid([keywordValue('center'), keywordValue('left')])],
      ['top left', valid([keywordValue('top'), keywordValue('left')])],
      ['left top', valid([keywordValue('top'), keywordValue('left')])],
      ['bottom right', valid([keywordValue('bottom'), keywordValue('right')])],
      ['center center', invalid()],
      ['diagonal', invalid()],
    ] as const

    for (const [input, output] of cases) {
      test(`treats \`${input}\` as ${output.valid ? 'valid' : 'invalid'}`, () => {
        const result = parse(input, align)
        expect(result).toEqual(output)
        if (result.valid) {
          // the payoff: unconditional destructure, every match the same shape
          const [y, x] = result.value
          expect(isKeywordValue(y) && isKeywordValue(x)).toBe(true)
        }
      })
    }
  })
})
