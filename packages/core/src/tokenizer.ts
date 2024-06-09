export type LiteralToken = { type: 'literal'; value: string }
export type ParentheticalToken = {
  type: 'parenthetical'
  tokens: ReadonlyArray<Token>
}
export type FunctionToken = {
  type: 'function'
  name: string
  args: ReadonlyArray<Token>
}
export type Token = LiteralToken | ParentheticalToken | FunctionToken

const whitespace = new Set([' ', '\t', '\n', '\r'])
const separators = new Set(['(', ')', ',', '/'])

function* inputToChunks(input: string): IterableIterator<string> {
  let start = 0

  let cursor = 0
  let previousType: 'literal' | 'space' | 'separator' | undefined = undefined
  for (const char of input) {
    const currentType = whitespace.has(char)
      ? 'space'
      : separators.has(char)
        ? 'separator'
        : 'literal'

    if (currentType !== previousType && cursor > start) {
      yield input.slice(start, cursor)
      start = cursor
    }

    previousType = currentType
    cursor++
  }

  if (cursor > start) {
    yield input.slice(start, cursor)
  }
}

function* chunksToAst(
  tokens: IterableIterator<string>,
): IterableIterator<Token> {
  let outgoing: LiteralToken | undefined
  while (true) {
    const { value: token, done } = tokens.next()

    if (done || token === ')') {
      break
    }

    if (token === '(') {
      if (outgoing) {
        yield {
          type: 'function',
          name: outgoing.value,
          args: Array.from(chunksToAst(tokens)),
        }
        outgoing = undefined
      } else {
        yield { type: 'parenthetical', tokens: Array.from(chunksToAst(tokens)) }
      }
    } else if (!whitespace.has(token)) {
      if (outgoing) {
        yield outgoing
      }
      outgoing = {
        type: 'literal',
        value: token,
      }
    }
  }

  if (outgoing) {
    yield outgoing
  }
}

export function tokenize(input: string): IterableIterator<Token> {
  const chunks = inputToChunks(input)
  return chunksToAst(chunks)
}
