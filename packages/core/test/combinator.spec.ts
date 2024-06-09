import { describe, expect, test } from 'vitest'
import { juxtapose } from '../src/combinator/juxtapose'
import { oneOf } from '../src/combinator/oneOf'
import { someOf } from '../src/combinator/someOf'
import { dimension, dimensionValue } from '../src/data/dimension'
import { keyword, keywordValue } from '../src/data/keyword'
import { parse } from '../src/parse'
import { invalid, valid } from '../src/parser'

describe('oneOf', () => {
  const cases = [
    [
      oneOf([keyword('foo'), keyword('bar')]),
      'foo',
      valid(keywordValue('foo')),
    ],
    [
      oneOf([keyword('foo'), dimension(['px'])]),
      '10px',
      valid(dimensionValue(10, 'px')),
    ],
    [oneOf([keyword('foo'), keyword('bar')]), 'baz', invalid()],
  ] as const

  for (const [parser, input, output] of cases) {
    test(`treats \`${input}\` as ${
      output.valid ? 'valid' : 'invalid'
    } for \`${parser.toString()}\``, () => {
      expect(parse(input, parser)).toEqual(output)
    })
  }

  test('throws an error when ambiguity is provided', () => {
    expect(() => oneOf([keyword('foo'), keyword('foo')])).toThrow()
  })

  test('throws an error when no parsers are provided', () => {
    expect(() => oneOf([])).toThrow()
  })
})

describe('someOf', () => {
  const cases = [
    [
      someOf([keyword('foo'), keyword('bar')]),
      'foo',
      valid([keywordValue('foo'), null]),
    ],
    [
      someOf([keyword('foo'), dimension(['px'])]),
      '10px',
      valid([null, dimensionValue(10, 'px')]),
    ],
    [someOf([keyword('foo'), keyword('bar')]), 'baz', invalid()],
    [
      someOf([keyword('foo'), keyword('bar')]),
      'foo bar',
      valid([keywordValue('foo'), keywordValue('bar')]),
    ],
    [someOf([keyword('foo'), keyword('bar')]), 'foo bar foo', invalid()],
  ] as const

  for (const [parser, input, output] of cases) {
    test(`treats \`${input}\` as ${
      output.valid ? 'valid' : 'invalid'
    } for \`${parser.toString()}\``, () => {
      expect(parse(input, parser)).toEqual(output)
    })
  }

  test('throws an error when no parsers are provided', () => {
    expect(() => someOf([])).toThrow()
  })

  test('throws an error when ambiguity is provided', () => {
    expect(() => someOf([keyword('foo'), keyword('foo')])).toThrow()
  })
})

describe('juxtapose', () => {
  const cases = [
    [
      juxtapose([keyword('foo'), keyword('bar')]),
      'foo bar',
      valid([keywordValue('foo'), keywordValue('bar')]),
    ],
    [
      juxtapose([keyword('foo'), dimension(['px'])]),
      'foo 10px',
      valid([keywordValue('foo'), dimensionValue(10, 'px')]),
    ],
    [juxtapose([keyword('foo'), dimension(['px'])]), 'foo', invalid()],
    [juxtapose([keyword('foo'), dimension(['px'])]), 'foo 10', invalid()],
    [juxtapose([keyword('foo'), keyword('bar')]), 'foo bar foo', invalid()],
    [juxtapose([keyword('foo'), keyword('bar')]), 'bar foo', invalid()],
  ] as const

  for (const [parser, input, output] of cases) {
    test(`treats \`${input}\` as ${
      output.valid ? 'valid' : 'invalid'
    } for \`${parser.toString()}\``, () => {
      expect(parse(input, parser)).toEqual(output)
    })
  }
})

describe('combinations', () => {
  test('oneOf and juxtapose', () => {
    const parser = oneOf([
      juxtapose([keyword('foo'), keyword('bar')]),
      keyword('baz'),
    ])

    expect(parse('foo bar', parser)).toEqual(
      valid([keywordValue('foo'), keywordValue('bar')]),
    )

    expect(parse('baz', parser)).toEqual(valid(keywordValue('baz')))
  })

  test('juxtapose and oneOf', () => {
    const parser = juxtapose([
      oneOf([keyword('foo'), keyword('bar')]),
      keyword('baz'),
    ])

    expect(parse('foo baz', parser)).toEqual(
      valid([keywordValue('foo'), keywordValue('baz')]),
    )

    expect(parse('bar baz', parser)).toEqual(
      valid([keywordValue('bar'), keywordValue('baz')]),
    )

    expect(parse('baz foo', parser)).toEqual(invalid())
    expect(parse('baz', parser)).toEqual(invalid())
    expect(parse('foo', parser)).toEqual(invalid())
  })

  test('oneOf and someOf', () => {
    const parser = oneOf([
      someOf([keyword('foo'), keyword('bar')]),
      keyword('baz'),
    ])

    expect(parse('foo bar', parser)).toEqual(
      valid([keywordValue('foo'), keywordValue('bar')]),
    )

    expect(parse('baz', parser)).toEqual(valid(keywordValue('baz')))
  })

  test('someOf and oneOf', () => {
    const parser = someOf([
      oneOf([keyword('foo'), keyword('bar')]),
      keyword('baz'),
    ])

    expect(parse('foo', parser)).toEqual(valid([keywordValue('foo'), null]))
    expect(parse('bar', parser)).toEqual(valid([keywordValue('bar'), null]))
    expect(parse('baz', parser)).toEqual(valid([null, keywordValue('baz')]))
    expect(parse('foo bar', parser)).toEqual(invalid())
  })

  test('someOf and juxtapose', () => {
    const parser = someOf([
      juxtapose([keyword('foo'), keyword('bar')]),
      keyword('baz'),
    ])

    expect(parse('foo bar', parser)).toEqual(
      valid([[keywordValue('foo'), keywordValue('bar')], null]),
    )

    expect(parse('baz', parser)).toEqual(valid([null, keywordValue('baz')]))
  })

  test('juxtapose and someOf', () => {
    const parser = juxtapose([
      someOf([keyword('foo'), keyword('bar')]),
      keyword('baz'),
    ])

    expect(parse('foo bar baz', parser)).toEqual(
      valid([[keywordValue('foo'), keywordValue('bar')], keywordValue('baz')]),
    )

    expect(parse('foo bar', parser)).toEqual(invalid())

    expect(parse('foo baz', parser)).toEqual(
      valid([[keywordValue('foo'), null], keywordValue('baz')]),
    )
    expect(parse('bar baz', parser)).toEqual(
      valid([[null, keywordValue('bar')], keywordValue('baz')]),
    )
  })

  test('nested oneOf', () => {
    const parser = oneOf([
      oneOf([keyword('foo'), keyword('bar')]),
      keyword('baz'),
    ])

    expect(parse('foo', parser)).toEqual(valid(keywordValue('foo')))
    expect(parse('bar', parser)).toEqual(valid(keywordValue('bar')))
    expect(parse('baz', parser)).toEqual(valid(keywordValue('baz')))
  })

  test('nested someOf', () => {
    const parser = someOf([
      someOf([keyword('foo'), keyword('bar')]),
      keyword('baz'),
    ])

    expect(parse('foo bar', parser)).toEqual(
      valid([keywordValue('foo'), keywordValue('bar'), null]),
    )

    expect(parse('baz', parser)).toEqual(
      valid([null, null, keywordValue('baz')]),
    )
  })

  test('nested juxtapose', () => {
    const parser = juxtapose([
      juxtapose([keyword('foo'), keyword('bar')]),
      keyword('baz'),
    ])

    expect(parse('foo bar baz', parser)).toEqual(
      valid([keywordValue('foo'), keywordValue('bar'), keywordValue('baz')]),
    )
  })
})
