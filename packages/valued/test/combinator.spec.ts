import { describe, expect, test } from 'vitest'
import { allOf } from '../src/combinators/allOf.ts'
import { juxtapose } from '../src/combinators/juxtapose.ts'
import { oneOf } from '../src/combinators/oneOf.ts'
import { someOf } from '../src/combinators/someOf.ts'
import { dimension, dimensionValue } from '../src/data/dimension.ts'
import { keyword, keywords, keywordValue } from '../src/data/keyword.ts'
import { optional } from '../src/multipliers/optional.ts'
import { parse } from '../src/parse.ts'
import { invalid, valid } from '../src/parser.ts'

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
    [
      someOf([
        juxtapose([keyword('foo'), optional(keyword('bar'))]),
        juxtapose([keyword('baz'), keyword('qux')]),
      ]),
      'foo baz qux',
      valid([
        [keywordValue('foo'), null],
        [keywordValue('baz'), keywordValue('qux')],
      ]),
    ],
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
})

describe('allOf', () => {
  const cases = [
    [
      allOf([keyword('foo'), keyword('bar')]),
      'foo bar',
      valid([keywordValue('foo'), keywordValue('bar')]),
    ],
    [
      allOf([keyword('foo'), keyword('bar')]),
      'bar foo',
      valid([keywordValue('foo'), keywordValue('bar')]),
    ],
    [allOf([keyword('foo'), keyword('bar')]), 'foo', invalid()],
    [allOf([keyword('foo'), keyword('bar')]), 'bar', invalid()],
    [allOf([keyword('foo'), keyword('bar')]), 'foo bar foo', invalid()],
    [
      allOf([dimension(['px']), keyword('bar')]),
      '10px bar',
      valid([dimensionValue(10, 'px'), keywordValue('bar')]),
    ],
  ] as const

  for (const [parser, input, output] of cases) {
    test(`treats \`${input}\` as ${
      output.valid ? 'valid' : 'invalid'
    } for \`${parser.toString()}\``, () => {
      expect(parse(input, parser)).toEqual(output)
    })
  }
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

  test('oneOf and allOf', () => {
    const parser = oneOf([
      allOf([keyword('foo'), keyword('bar')]),
      keyword('baz'),
    ])

    expect(parse('foo', parser)).toEqual(invalid())
    expect(parse('bar', parser)).toEqual(invalid())
    expect(parse('baz', parser)).toEqual(valid(keywordValue('baz')))
    expect(parse('foo bar', parser)).toEqual(
      valid([keywordValue('foo'), keywordValue('bar')]),
    )
    expect(parse('foo bar baz', parser)).toEqual(invalid())
  })

  test('allOf and oneOf', () => {
    const parser = allOf([
      oneOf([keyword('foo'), keyword('bar')]),
      keyword('baz'),
    ])

    expect(parse('foo baz', parser)).toEqual(
      valid([keywordValue('foo'), keywordValue('baz')]),
    )

    expect(parse('bar baz', parser)).toEqual(
      valid([keywordValue('bar'), keywordValue('baz')]),
    )

    expect(parse('baz foo', parser)).toEqual(
      valid([keywordValue('foo'), keywordValue('baz')]),
    )
    expect(parse('baz', parser)).toEqual(invalid())
    expect(parse('foo', parser)).toEqual(invalid())
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

  test('someOf and allOf', () => {
    const parser = someOf([
      allOf([keyword('foo'), keyword('bar')]),
      keyword('baz'),
    ])

    expect(parse('foo bar', parser)).toEqual(
      valid([[keywordValue('foo'), keywordValue('bar')], null]),
    )

    expect(parse('baz', parser)).toEqual(valid([null, keywordValue('baz')]))
  })

  test('allOf and someOf', () => {
    const parser = allOf([
      someOf([keyword('foo'), keyword('bar')]),
      keyword('baz'),
    ])

    expect(parse('foo baz', parser)).toEqual(
      valid([[keywordValue('foo'), null], keywordValue('baz')]),
    )

    expect(parse('bar baz', parser)).toEqual(
      valid([[null, keywordValue('bar')], keywordValue('baz')]),
    )

    expect(parse('baz foo', parser)).toEqual(
      valid([[keywordValue('foo'), null], keywordValue('baz')]),
    )
    expect(parse('baz', parser)).toEqual(invalid())
    expect(parse('foo', parser)).toEqual(invalid())
  })

  test('allOf and juxtapose', () => {
    const parser = allOf([
      juxtapose([keyword('foo'), keyword('bar')]),
      keyword('baz'),
    ])

    expect(parse('foo bar baz', parser)).toEqual(
      valid([[keywordValue('foo'), keywordValue('bar')], keywordValue('baz')]),
    )

    expect(parse('foo baz', parser)).toEqual(invalid())
    expect(parse('bar baz', parser)).toEqual(invalid())
    expect(parse('bar foo baz', parser)).toEqual(invalid())
  })

  test('juxtapose and allOf', () => {
    const parser = juxtapose([
      allOf([keyword('foo'), keyword('bar')]),
      keyword('baz'),
    ])

    expect(parse('foo bar baz', parser)).toEqual(
      valid([[keywordValue('foo'), keywordValue('bar')], keywordValue('baz')]),
    )

    expect(parse('foo baz', parser)).toEqual(invalid())
    expect(parse('bar baz', parser)).toEqual(invalid())
    expect(parse('bar foo baz', parser)).toEqual(
      valid([[keywordValue('foo'), keywordValue('bar')], keywordValue('baz')]),
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

  test('nested allOf', () => {
    const parser = allOf([
      allOf([keyword('foo'), keyword('bar')]),
      keyword('baz'),
    ])

    expect(parse('foo bar baz', parser)).toEqual(
      valid([keywordValue('foo'), keywordValue('bar'), keywordValue('baz')]),
    )
  })
})

describe('operand reuse (no identity dedup)', () => {
  test('allOf keeps a repeated instance as its own slot', () => {
    const k = keywords(['a', 'b'])
    expect(parse('a a', allOf([k, k]))).toEqual(
      valid([keywordValue('a'), keywordValue('a')]),
    )
  })

  test('someOf keeps a repeated instance as its own slot', () => {
    const k = keywords(['a', 'b'])
    expect(parse('a a', someOf([k, k]))).toEqual(
      valid([keywordValue('a'), keywordValue('a')]),
    )
  })

  test('juxtapose parses a shared instance independently per position', () => {
    const k = keywords(['a', 'b'])
    expect(parse('a b', juxtapose([k, k]))).toEqual(
      valid([keywordValue('a'), keywordValue('b')]),
    )
  })

  test('oneOf still matches with a repeated alternative', () => {
    const k = keyword('a')
    expect(parse('a', oneOf([k, k]))).toEqual(valid(keywordValue('a')))
  })
})

describe('allOf.struct', () => {
  const bg = allOf.struct({
    attachment: keyword('fixed'),
    size: dimension(['px']),
  })

  test('yields an object keyed by field, order-independent', () => {
    const expected = valid({
      attachment: keywordValue('fixed'),
      size: dimensionValue(10, 'px'),
    })
    expect(parse('fixed 10px', bg)).toEqual(expected)
    expect(parse('10px fixed', bg)).toEqual(expected)
  })

  test('fails when a field is missing', () => {
    expect(parse('fixed', bg)).toEqual(invalid())
  })

  test('a shared parser instance keys both fields independently', () => {
    const k = keywords(['a', 'b'])
    expect(parse('a a', allOf.struct({ first: k, second: k }))).toEqual(
      valid({ first: keywordValue('a'), second: keywordValue('a') }),
    )
  })
})

describe('someOf.struct', () => {
  const border = someOf.struct({
    style: keywords(['solid', 'dashed']),
    width: dimension(['px']),
  })

  test('omitted fields are null', () => {
    expect(parse('solid', border)).toEqual(
      valid({ style: keywordValue('solid'), width: null }),
    )
  })

  test('all fields present, in any order', () => {
    const expected = valid({
      style: keywordValue('solid'),
      width: dimensionValue(1, 'px'),
    })
    expect(parse('solid 1px', border)).toEqual(expected)
    expect(parse('1px solid', border)).toEqual(expected)
  })
})
