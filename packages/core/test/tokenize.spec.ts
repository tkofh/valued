import { describe, expect, test } from 'vitest'
import { tokenize } from '../src/tokenizer'

describe('basic parsing', () => {
  test('tokenizes a literal', () => {
    expect(Array.from(tokenize('foo'))).toEqual([
      { type: 'literal', value: 'foo' },
    ])
  })

  test('tokenizes a parenthetical', () => {
    expect(Array.from(tokenize('(foo bar)'))).toEqual([
      {
        type: 'parenthetical',
        tokens: [
          { type: 'literal', value: 'foo' },
          { type: 'literal', value: 'bar' },
        ],
      },
    ])
  })

  test('tokenizes a function', () => {
    expect(Array.from(tokenize('foo(bar baz)'))).toEqual([
      {
        type: 'function',
        name: 'foo',
        args: [
          { type: 'literal', value: 'bar' },
          { type: 'literal', value: 'baz' },
        ],
      },
    ])
  })
})

describe('error recovery', () => {
  test('ignores missing closing parenthesis', () => {
    expect(Array.from(tokenize('(foo bar'))).toEqual([
      {
        type: 'parenthetical',
        tokens: [
          { type: 'literal', value: 'foo' },
          { type: 'literal', value: 'bar' },
        ],
      },
    ])
  })
})
