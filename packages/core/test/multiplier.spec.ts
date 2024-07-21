import { describe, expect, test } from 'vitest'
import { allOf } from '../src/combinators/allOf'
import { juxtapose } from '../src/combinators/juxtapose'
import { oneOf } from '../src/combinators/oneOf'
import { someOf } from '../src/combinators/someOf'
import { color, colorValue } from '../src/data/color'
import { keyword, keywordValue, keywords } from '../src/data/keyword'
import {
  lengthPercentage,
  lengthPercentageValue,
} from '../src/data/length-percentage'
import { number, numberValue } from '../src/data/number'
import { oneOrMore } from '../src/multipliers/oneOrMore'
import { optional } from '../src/multipliers/optional'
import { zeroOrMore } from '../src/multipliers/zeroOrMore'
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

describe('zeroOrMore', () => {
  test('treats empty string as valid for zeroOrMore keyword', () => {
    const parser = zeroOrMore(keyword('foo'))
    expect(parse('', parser)).toEqual(valid([]))
  })

  test('treats `foo` as valid for `foo*`', () => {
    const parser = zeroOrMore(keyword('foo'))
    expect(parse('foo', parser)).toEqual(valid([keywordValue('foo')]))
  })

  test('treats `foo foo` as valid for `foo*`', () => {
    const parser = zeroOrMore(keyword('foo'))
    expect(parse('foo foo', parser)).toEqual(
      valid([keywordValue('foo'), keywordValue('foo')]),
    )
  })

  test('treats `foo bar` as invalid for `foo*`', () => {
    const parser = zeroOrMore(keyword('foo'))
    expect(parse('foo bar', parser)).toEqual(invalid())
  })

  describe('within juxtapose', () => {
    const parser = juxtapose([zeroOrMore(keyword('foo')), keyword('bar')])

    test('treats `bar` as valid for `foo* bar`', () => {
      expect(parse('bar', parser)).toEqual(valid([[], keywordValue('bar')]))
    })

    test('treats `foo bar` as valid for `foo* bar`', () => {
      expect(parse('foo bar', parser)).toEqual(
        valid([[keywordValue('foo')], keywordValue('bar')]),
      )
    })

    test('treats `foo foo bar` as valid for `foo* bar`', () => {
      expect(parse('foo foo bar', parser)).toEqual(
        valid([
          [keywordValue('foo'), keywordValue('foo')],
          keywordValue('bar'),
        ]),
      )
    })

    test('treats `foo bar baz` as invalid for `foo* bar`', () => {
      expect(parse('foo bar baz', parser)).toEqual(invalid())
    })
  })

  describe('within oneOf', () => {
    const parser = oneOf([zeroOrMore(keyword('foo')), keyword('bar')])

    test('treats `bar` as valid for `foo* | bar`', () => {
      expect(parse('bar', parser)).toEqual(valid(keywordValue('bar')))
    })

    test('treats `foo` as valid for `foo* | bar`', () => {
      expect(parse('foo', parser)).toEqual(valid([keywordValue('foo')]))
    })

    test('treats `foo foo` as valid for `foo* | bar`', () => {
      expect(parse('foo foo', parser)).toEqual(
        valid([keywordValue('foo'), keywordValue('foo')]),
      )
    })

    test('treats empty string as valid for `foo* | bar`', () => {
      expect(parse('', parser)).toEqual(valid([]))
    })

    test('treats `foo bar` as invalid for `foo* | bar`', () => {
      expect(parse('foo bar', parser)).toEqual(invalid())
    })
  })

  describe('within someOf', () => {
    const parser = someOf([zeroOrMore(keyword('foo')), keyword('bar')])

    test('treats `bar` as valid for `foo* || bar`', () => {
      expect(parse('bar', parser)).toEqual(valid([[], keywordValue('bar')]))
    })

    test('treats `foo` as valid for `foo* || bar`', () => {
      expect(parse('foo', parser)).toEqual(valid([[keywordValue('foo')], null]))
    })

    test('treats `foo foo` as valid for `foo* || bar`', () => {
      expect(parse('foo foo', parser)).toEqual(
        valid([[keywordValue('foo'), keywordValue('foo')], null]),
      )
    })

    test('treats `foo foo bar` as valid for `foo* || bar`', () => {
      expect(parse('foo foo bar', parser)).toEqual(
        valid([
          [keywordValue('foo'), keywordValue('foo')],
          keywordValue('bar'),
        ]),
      )
    })
  })

  describe('within allOf', () => {
    const parser = allOf([zeroOrMore(keyword('foo')), keyword('bar')])

    test('treats `bar` as valid for `foo* && bar`', () => {
      expect(parse('bar', parser)).toEqual(valid([[], keywordValue('bar')]))
    })

    test('treats `foo` as invalid for `foo* && bar`', () => {
      expect(parse('foo', parser)).toEqual(invalid())
    })

    test('treats `foo bar` as valid for `foo* && bar`', () => {
      expect(parse('foo bar', parser)).toEqual(
        valid([[keywordValue('foo')], keywordValue('bar')]),
      )
    })

    test('treats `foo foo bar` as valid for `foo* && bar`', () => {
      expect(parse('foo foo bar', parser)).toEqual(
        valid([
          [keywordValue('foo'), keywordValue('foo')],
          keywordValue('bar'),
        ]),
      )
    })
  })

  describe('with juxtapose', () => {
    const parser = zeroOrMore(juxtapose([keyword('foo'), keyword('bar')]))

    test('treats empty string as valid for `[foo bar]*`', () => {
      expect(parse('', parser)).toEqual(valid([]))
    })

    test('treats `foo bar` as valid for `[foo bar]*`', () => {
      expect(parse('foo bar', parser)).toEqual(
        valid([[keywordValue('foo'), keywordValue('bar')]]),
      )
    })

    test('treats `foo bar foo bar` as valid for `[foo bar]*`', () => {
      expect(parse('foo bar foo bar', parser)).toEqual(
        valid([
          [keywordValue('foo'), keywordValue('bar')],
          [keywordValue('foo'), keywordValue('bar')],
        ]),
      )
    })

    test('treats `foo bar baz` as invalid for `[foo bar]*`', () => {
      expect(parse('foo bar baz', parser)).toEqual(invalid())
    })
  })

  describe('with oneOf', () => {
    const parser = zeroOrMore(oneOf([keyword('foo'), keyword('bar')]))

    test('treats empty string as valid for `[foo | bar]*`', () => {
      expect(parse('', parser)).toEqual(valid([]))
    })

    test('treats `foo` as valid for `[foo | bar]*`', () => {
      expect(parse('foo', parser)).toEqual(valid([keywordValue('foo')]))
    })

    test('treats `bar` as valid for `[foo | bar]*`', () => {
      expect(parse('bar', parser)).toEqual(valid([keywordValue('bar')]))
    })

    test('treats `foo bar` as valid for `[foo | bar]*`', () => {
      expect(parse('foo bar', parser)).toEqual(
        valid([keywordValue('foo'), keywordValue('bar')]),
      )
    })
  })

  describe('with someOf', () => {
    const parser = zeroOrMore(someOf([keyword('foo'), keyword('bar')]))

    test('treats empty string as valid for `[foo || bar]*`', () => {
      expect(parse('', parser)).toEqual(valid([]))
    })

    test('treats `foo` as valid for `[foo || bar]*`', () => {
      expect(parse('foo', parser)).toEqual(valid([[keywordValue('foo'), null]]))
    })

    test('treats `bar` as valid for `[foo || bar]*`', () => {
      expect(parse('bar', parser)).toEqual(valid([[null, keywordValue('bar')]]))
    })

    test('treats `foo bar` as valid for `[foo || bar]*`', () => {
      expect(parse('foo bar', parser)).toEqual(
        valid([[keywordValue('foo'), keywordValue('bar')]]),
      )
    })

    test('treats `foo bar foo` as valid for `[foo || bar]*`', () => {
      expect(parse('foo bar foo', parser)).toEqual(
        valid([
          [keywordValue('foo'), keywordValue('bar')],
          [keywordValue('foo'), null],
        ]),
      )
    })

    test('treats `foo bar foo foo bar` as valid for `[foo || bar]*`', () => {
      expect(parse('foo bar foo foo bar', parser)).toEqual(
        valid([
          [keywordValue('foo'), keywordValue('bar')],
          [keywordValue('foo'), null],
          [keywordValue('foo'), keywordValue('bar')],
        ]),
      )
    })

    test('treats `foo bar baz` as invalid for `[foo || bar]*`', () => {
      expect(parse('foo bar baz', parser)).toEqual(invalid())
    })
  })

  describe('with allOf', () => {
    const parser = zeroOrMore(allOf([keyword('foo'), keyword('bar')]))

    test('treats empty string as valid for `[foo && bar]*`', () => {
      expect(parse('', parser)).toEqual(valid([]))
    })

    test('treats `foo` as invalid for `[foo && bar]*`', () => {
      expect(parse('foo', parser)).toEqual(invalid())
    })

    test('treats `foo bar` as valid for `[foo && bar]*`', () => {
      expect(parse('foo bar', parser)).toEqual(
        valid([[keywordValue('foo'), keywordValue('bar')]]),
      )
    })

    test('treats `foo foo bar` as invalid for `[foo && bar]*`', () => {
      expect(parse('foo foo bar', parser)).toEqual(invalid())
    })
  })
})

describe('oneOrMore', () => {
  test('treats empty string as invalid for oneOrMore keyword', () => {
    const parser = oneOrMore(keyword('foo'))
    expect(parse('', parser)).toEqual(invalid())
  })

  test('treats `foo` as valid for `foo+`', () => {
    const parser = oneOrMore(keyword('foo'))
    expect(parse('foo', parser)).toEqual(valid([keywordValue('foo')]))
  })

  test('treats `foo foo` as valid for `foo+`', () => {
    const parser = oneOrMore(keyword('foo'))
    expect(parse('foo foo', parser)).toEqual(
      valid([keywordValue('foo'), keywordValue('foo')]),
    )
  })

  test('treats `foo bar` as invalid for `foo+`', () => {
    const parser = oneOrMore(keyword('foo'))
    expect(parse('foo bar', parser)).toEqual(invalid())
  })

  describe('within juxtapose', () => {
    const parser = juxtapose([oneOrMore(keyword('foo')), keyword('bar')])

    test('treats `bar` as invalid for `foo+ bar`', () => {
      expect(parse('bar', parser)).toEqual(invalid())
    })

    test('treats `foo bar` as valid for `foo+ bar`', () => {
      expect(parse('foo bar', parser)).toEqual(
        valid([[keywordValue('foo')], keywordValue('bar')]),
      )
    })

    test('treats `foo foo bar` as valid for `foo+ bar`', () => {
      expect(parse('foo foo bar', parser)).toEqual(
        valid([
          [keywordValue('foo'), keywordValue('foo')],
          keywordValue('bar'),
        ]),
      )
    })

    test('treats `foo bar baz` as invalid for `foo+ bar`', () => {
      expect(parse('foo bar baz', parser)).toEqual(invalid())
    })
  })

  describe('within juxtapose with optional peer', () => {
    const parser = juxtapose([
      oneOrMore(keyword('foo')),
      optional(keyword('bar')),
    ])

    test('treats `bar` as invalid for `foo+ bar?`', () => {
      expect(parse('bar', parser)).toEqual(invalid())
    })

    test('treats `foo bar` as valid for `foo+ bar?`', () => {
      expect(parse('foo bar', parser)).toEqual(
        valid([[keywordValue('foo')], keywordValue('bar')]),
      )
    })

    test('treats `foo foo bar` as valid for `foo+ bar?`', () => {
      expect(parse('foo foo bar', parser)).toEqual(
        valid([
          [keywordValue('foo'), keywordValue('foo')],
          keywordValue('bar'),
        ]),
      )
    })

    test('treats `foo foo foo` as valid for `foo+ bar?`', () => {
      expect(parse('foo foo foo', parser)).toEqual(
        valid([
          [keywordValue('foo'), keywordValue('foo'), keywordValue('foo')],
          null,
        ]),
      )
    })
  })

  test('very weird case', () => {
    const parser = someOf([
      color(),
      lengthPercentage(),
      juxtapose([
        'join',
        keywords(['arcs', 'bevel', 'miter', 'miter-clip', 'round']),
        optional(number({ min: 1 })),
      ]),
      juxtapose(['cap', keywords(['butt', 'round', 'square'])]),
      oneOf([
        keyword('solid'),
        juxtapose([
          'dashed',
          oneOrMore(number()),
          optional(juxtapose(['offset', number()])),
        ]),
      ]),
    ])

    expect(parse('10px black dashed 10 10', parser)).toEqual(
      valid([
        colorValue('black'),
        lengthPercentageValue(10, 'px'),
        null,
        null,
        [[numberValue(10), numberValue(10)], null],
      ]),
    )
  })

  describe('within oneOf', () => {
    const parser = oneOf([oneOrMore(keyword('foo')), keyword('bar')])

    test('treats `bar` as valid for `foo+ | bar`', () => {
      expect(parse('bar', parser)).toEqual(valid(keywordValue('bar')))
    })

    test('treats `foo` as valid for `foo+ | bar`', () => {
      expect(parse('foo', parser)).toEqual(valid([keywordValue('foo')]))
    })

    test('treats `foo foo` as valid for `foo+ | bar`', () => {
      expect(parse('foo foo', parser)).toEqual(
        valid([keywordValue('foo'), keywordValue('foo')]),
      )
    })

    test('treats `foo bar` as invalid for `foo+ | bar`', () => {
      expect(parse('foo bar', parser)).toEqual(invalid())
    })
  })

  describe('within someOf', () => {
    const parser = someOf([oneOrMore(keyword('foo')), keyword('bar')])

    test('treats `bar` as valid for `foo+ || bar`', () => {
      expect(parse('bar', parser)).toEqual(valid([null, keywordValue('bar')]))
    })

    test('treats `foo` as valid for `foo+ || bar`', () => {
      expect(parse('foo', parser)).toEqual(valid([[keywordValue('foo')], null]))
    })

    test('treats `foo foo` as valid for `foo+ || bar`', () => {
      expect(parse('foo foo', parser)).toEqual(
        valid([[keywordValue('foo'), keywordValue('foo')], null]),
      )
    })

    test('treats `foo foo bar` as valid for `foo+ || bar`', () => {
      expect(parse('foo foo bar', parser)).toEqual(
        valid([
          [keywordValue('foo'), keywordValue('foo')],
          keywordValue('bar'),
        ]),
      )
    })
  })

  describe('within allOf', () => {
    const parser = allOf([oneOrMore(keyword('foo')), keyword('bar')])

    test('treats `bar` as invalid for `foo+ && bar`', () => {
      expect(parse('bar', parser)).toEqual(invalid())
    })

    test('treats `foo` as invalid for `foo+ && bar`', () => {
      expect(parse('foo', parser)).toEqual(invalid())
    })

    test('treats `foo bar` as valid for `foo+ && bar`', () => {
      expect(parse('foo bar', parser)).toEqual(
        valid([[keywordValue('foo')], keywordValue('bar')]),
      )
    })

    test('treats `foo foo bar` as valid for `foo+ && bar`', () => {
      expect(parse('foo foo bar', parser)).toEqual(
        valid([
          [keywordValue('foo'), keywordValue('foo')],
          keywordValue('bar'),
        ]),
      )
    })
  })

  describe('with juxtapose', () => {
    const parser = oneOrMore(juxtapose([keyword('foo'), keyword('bar')]))

    test('treats `foo bar` as valid for `[foo bar]+`', () => {
      expect(parse('foo bar', parser)).toEqual(
        valid([[keywordValue('foo'), keywordValue('bar')]]),
      )
    })

    test('treats `foo bar foo bar` as valid for `[foo bar]+`', () => {
      expect(parse('foo bar foo bar', parser)).toEqual(
        valid([
          [keywordValue('foo'), keywordValue('bar')],
          [keywordValue('foo'), keywordValue('bar')],
        ]),
      )
    })

    test('treats `foo bar baz` as invalid for `[foo bar]+`', () => {
      expect(parse('foo bar baz', parser)).toEqual(invalid())
    })
  })

  describe('with oneOf', () => {
    const parser = oneOrMore(oneOf([keyword('foo'), keyword('bar')]))

    test('treats `foo` as valid for `[foo | bar]+`', () => {
      expect(parse('foo', parser)).toEqual(valid([keywordValue('foo')]))
    })

    test('treats `bar` as valid for `[foo | bar]+`', () => {
      expect(parse('bar', parser)).toEqual(valid([keywordValue('bar')]))
    })

    test('treats `foo bar` as valid for `[foo | bar]+`', () => {
      expect(parse('foo bar', parser)).toEqual(
        valid([keywordValue('foo'), keywordValue('bar')]),
      )
    })

    test('treats `foo bar bar` as valid for `[foo | bar]+`', () => {
      expect(parse('foo bar  bar', parser)).toEqual(
        valid([keywordValue('foo'), keywordValue('bar'), keywordValue('bar')]),
      )
    })
  })

  describe('with someOf', () => {
    const parser = oneOrMore(someOf([keyword('foo'), keyword('bar')]))

    test('treats `foo` as valid for `[foo || bar]+`', () => {
      expect(parse('foo', parser)).toEqual(valid([[keywordValue('foo'), null]]))
    })

    test('treats `bar` as valid for `[foo || bar]+`', () => {
      expect(parse('bar', parser)).toEqual(valid([[null, keywordValue('bar')]]))
    })

    test('treats `foo bar` as valid for `[foo || bar]+`', () => {
      expect(parse('foo bar', parser)).toEqual(
        valid([[keywordValue('foo'), keywordValue('bar')]]),
      )
    })

    test('treats `foo bar bar` as valid for `[foo || bar]+`', () => {
      expect(parse('foo bar bar', parser)).toEqual(
        valid([
          [keywordValue('foo'), keywordValue('bar')],
          [null, keywordValue('bar')],
        ]),
      )
    })

    test('treats `foo bar foo` as valid for `[foo || bar]+`', () => {
      expect(parse('foo bar foo', parser)).toEqual(
        valid([
          [keywordValue('foo'), keywordValue('bar')],
          [keywordValue('foo'), null],
        ]),
      )
    })

    test('treats `foo bar baz` as invalid for `[foo || bar]+`', () => {
      expect(parse('foo bar baz', parser)).toEqual(invalid())
    })
  })

  describe('with allOf', () => {
    const parser = oneOrMore(allOf([keyword('foo'), keyword('bar')]))

    test('treats `foo bar` as valid for `[foo && bar]+`', () => {
      expect(parse('foo bar', parser)).toEqual(
        valid([[keywordValue('foo'), keywordValue('bar')]]),
      )
    })

    test('treats `bar foo foo bar` as valid for `[foo && bar]+`', () => {
      expect(parse('bar foo foo bar', parser)).toEqual(
        valid([
          [keywordValue('foo'), keywordValue('bar')],
          [keywordValue('foo'), keywordValue('bar')],
        ]),
      )
    })

    test('treats `foo bar foo` as invalid for `[foo && bar]+`', () => {
      expect(parse('foo bar foo', parser)).toEqual(invalid())
    })
  })
})
