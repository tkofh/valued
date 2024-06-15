import { describe, expect, test } from 'vitest'
import { allOf, juxtapose, oneOf, someOf } from '../src/combinators'
import { keyword, keywordValue } from '../src/data/keyword'
import { optional } from '../src/multipliers/optional'
import { parse } from '../src/parse'
import { invalid, valid } from '../src/parser'

describe('optional', () => {
  test('treats empty string as valid for optional keyword', () => {
    const parser = optional(keyword('foo'))
    expect(parse('', parser)).toEqual(valid(null))
  })

  test('treats `foo` as valid for `foo?`', () => {
    const parser = optional(keyword('foo'))
    expect(parse('foo', parser)).toEqual(valid(keywordValue('foo')))
  })

  test('treats `foo bar` as valid for `foo?`', () => {
    const parser = optional(keyword('foo'))
    expect(parse('foo bar', parser)).toEqual(invalid())
  })

  describe('within juxtapose', () => {
    const parser = juxtapose([keyword('foo'), optional(keyword('bar'))])

    test('treats `foo` as valid for `foo bar?`', () => {
      expect(parse('foo', parser)).toEqual(valid([keywordValue('foo'), null]))
    })

    test('treats `foo bar` as valid for `foo bar?`', () => {
      expect(parse('foo bar', parser)).toEqual(
        valid([keywordValue('foo'), keywordValue('bar')]),
      )
    })

    test('treats `foo bar baz` as invalid for `foo bar?`', () => {
      expect(parse('foo bar baz', parser)).toEqual(invalid())
    })
  })

  describe('within oneOf', () => {
    const parser = oneOf([keyword('foo'), optional(keyword('bar'))])

    test('treats `foo` as valid for `foo | bar?`', () => {
      expect(parse('foo', parser)).toEqual(valid(keywordValue('foo')))
    })

    test('treats empty string as valid for foo | bar?', () => {
      expect(parse('', parser)).toEqual(valid(null))
    })

    test('treats `foo bar` as invalid for `foo | bar?`', () => {
      expect(parse('foo bar', parser)).toEqual(invalid())
    })
  })

  describe('within someOf', () => {
    const parser = someOf([keyword('foo'), optional(keyword('bar'))])

    test('treats `foo` as valid for `foo || bar?`', () => {
      expect(parse('foo', parser)).toEqual(valid([keywordValue('foo'), null]))
    })

    test('treats `bar` as valid for `foo || bar?`', () => {
      expect(parse('bar', parser)).toEqual(valid([null, keywordValue('bar')]))
    })

    test('treats empty string as valid for `foo || bar?`', () => {
      expect(parse('', parser)).toEqual(valid([null, null]))
    })

    test('treats `foo bar` as valid for `foo || bar?`', () => {
      expect(parse('foo bar', parser)).toEqual(
        valid([keywordValue('foo'), keywordValue('bar')]),
      )
    })

    test('treats `foo bar baz` as invalid for `foo || bar?`', () => {
      expect(parse('foo bar baz', parser)).toEqual(invalid())
    })
  })

  describe('within allOf', () => {
    const parser = allOf([keyword('foo'), optional(keyword('bar'))])

    test('treats `foo` as valid for `foo && bar?`', () => {
      expect(parse('foo', parser)).toEqual(valid([keywordValue('foo'), null]))
    })

    test('treats `bar` as invalid for `foo && bar?`', () => {
      expect(parse('bar', parser)).toEqual(invalid())
    })

    test('treats `foo bar` as valid for `foo && bar?`', () => {
      expect(parse('foo bar', parser)).toEqual(
        valid([keywordValue('foo'), keywordValue('bar')]),
      )
    })
  })

  describe('with juxtapose', () => {
    const parser = optional(juxtapose([keyword('foo'), keyword('bar')]))

    test('treats empty string as valid for `[foo bar]?`', () => {
      expect(parse('', parser)).toEqual(valid(null))
    })

    test('treats `foo` as valid for `[foo bar]?`', () => {
      expect(parse('foo', parser)).toEqual(valid(null))
    })

    test('treats `foo bar` as valid for `[foo bar]?`', () => {
      expect(parse('foo bar', parser)).toEqual(
        valid([keywordValue('foo'), keywordValue('bar')]),
      )
    })

    test('treats `foo bar baz` as invalid for `[foo bar]?`', () => {
      expect(parse('foo bar baz', parser)).toEqual(invalid())
    })
  })

  describe('with oneOf', () => {
    const parser = optional(oneOf([keyword('foo'), keyword('bar')]))

    test('treats empty string as valid for `foo | bar?`', () => {
      expect(parse('', parser)).toEqual(valid(null))
    })

    test('treats `foo` as valid for `foo | bar?`', () => {
      expect(parse('foo', parser)).toEqual(valid(keywordValue('foo')))
    })

    test('treats `bar` as valid for `foo | bar?`', () => {
      expect(parse('bar', parser)).toEqual(valid(keywordValue('bar')))
    })

    test('treats `baz` as invalid for `foo | bar?`', () => {
      expect(parse('baz', parser)).toEqual(invalid())
    })
  })

  describe('with someOf', () => {
    const parser = optional(someOf([keyword('foo'), keyword('bar')]))

    test('treats empty string as valid for `foo || bar?`', () => {
      expect(parse('', parser)).toEqual(valid(null))
    })

    test('treats `foo` as valid for `foo || bar?`', () => {
      expect(parse('foo', parser)).toEqual(valid([keywordValue('foo'), null]))
    })

    test('treats `bar` as valid for `foo || bar?`', () => {
      expect(parse('bar', parser)).toEqual(valid([null, keywordValue('bar')]))
    })

    test('treats `baz` as invalid for `foo || bar?`', () => {
      expect(parse('baz', parser)).toEqual(invalid())
    })
  })

  describe('with allOf', () => {
    const parser = optional(allOf([keyword('foo'), keyword('bar')]))

    test('treats empty string as valid for `foo && bar?`', () => {
      expect(parse('', parser)).toEqual(valid(null))
    })

    test('treats `foo` as valid for `foo && bar?`', () => {
      expect(parse('foo', parser)).toEqual(valid(null))
    })

    test('treats `bar` as valid for `foo && bar?`', () => {
      expect(parse('bar', parser)).toEqual(valid(null))
    })

    test('treats `foo bar` as valid for `foo && bar?`', () => {
      expect(parse('foo bar', parser)).toEqual(
        valid([keywordValue('foo'), keywordValue('bar')]),
      )
    })

    test('treats `foo bar baz` as invalid for `foo && bar?`', () => {
      expect(parse('foo bar baz', parser)).toEqual(invalid())
    })
  })
})
