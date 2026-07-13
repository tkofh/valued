import { describe, expect, test } from 'vitest'
import { someOf } from '../src/combinators/someOf.ts'
import { keyword, keywordValue } from '../src/data/keyword.ts'
import { lengthValue } from '../src/data/length.ts'
import { valuedEqual } from '../src/equals.ts'
import { parse } from '../src/parse.ts'

describe('valuedEqual', () => {
  test('primitive identity', () => {
    expect(valuedEqual(1, 1)).toBe(true)
    expect(valuedEqual('a', 'a')).toBe(true)
    expect(valuedEqual(1, 2)).toBe(false)
    expect(valuedEqual('a', 'b')).toBe(false)
  })

  test('null and undefined', () => {
    expect(valuedEqual(null, null)).toBe(true)
    expect(valuedEqual(undefined, undefined)).toBe(true)
    expect(valuedEqual(null, undefined)).toBe(false)
    expect(valuedEqual(null, {})).toBe(false)
    expect(valuedEqual(undefined, {})).toBe(false)
  })

  test('NaN', () => {
    expect(valuedEqual(Number.NaN, Number.NaN)).toBe(true)
  })

  test('parsed leaf values with same toString are equal', () => {
    expect(valuedEqual(lengthValue(10, 'px'), lengthValue(10, 'px'))).toBe(true)
    expect(valuedEqual(keywordValue('top'), keywordValue('top'))).toBe(true)
  })

  test('parsed leaf values with different toString are not equal', () => {
    expect(valuedEqual(lengthValue(10, 'px'), lengthValue(11, 'px'))).toBe(
      false,
    )
    expect(valuedEqual(lengthValue(10, 'px'), lengthValue(10, 'rem'))).toBe(
      false,
    )
    expect(valuedEqual(keywordValue('top'), keywordValue('bottom'))).toBe(false)
  })

  test('arrays compare element-wise', () => {
    expect(
      valuedEqual(
        [keywordValue('left'), keywordValue('top')],
        [keywordValue('left'), keywordValue('top')],
      ),
    ).toBe(true)
    expect(
      valuedEqual(
        [keywordValue('left'), keywordValue('top')],
        [keywordValue('left'), keywordValue('bottom')],
      ),
    ).toBe(false)
    expect(valuedEqual([keywordValue('left')], [])).toBe(false)
  })

  test('array vs non-array', () => {
    expect(valuedEqual([], keywordValue('x'))).toBe(false)
    expect(valuedEqual(keywordValue('x'), [])).toBe(false)
  })

  test('nested arrays', () => {
    expect(
      valuedEqual(
        [[keywordValue('a'), keywordValue('b')], lengthValue(5, 'px')],
        [[keywordValue('a'), keywordValue('b')], lengthValue(5, 'px')],
      ),
    ).toBe(true)
    expect(
      valuedEqual(
        [[keywordValue('a'), keywordValue('b')], lengthValue(5, 'px')],
        [[keywordValue('a'), keywordValue('c')], lengthValue(5, 'px')],
      ),
    ).toBe(false)
  })

  test('someOf normalizes input order, so structurally equal across permutations', () => {
    const parser = someOf([keyword('x'), keyword('y')])
    const a = parse('x y', parser)
    const b = parse('y x', parser)
    expect(a.valid && b.valid).toBe(true)
    if (a.valid && b.valid) {
      expect(a.value === b.value).toBe(false)
      expect(valuedEqual(a.value, b.value)).toBe(true)
    }
  })
})
