import type { Parser } from '../parser'
import type { Token } from '../tokenizer'

type ExtractParserValues<T extends ReadonlyArray<unknown>> = {
  [K in keyof T]: T[K] extends Parser<infer U> ? U : never
}

type FilterNever<T> = T extends never ? [] : [T]

type FilterNeverTuple<T extends ReadonlyArray<unknown>> = T extends [
  infer First,
  ...infer Rest,
]
  ? [...FilterNever<First>, ...FilterNeverTuple<Rest>]
  : []

type JuxtaposeValue<Parsers extends ReadonlyArray<Parser<unknown> | string>> =
  FilterNeverTuple<ExtractParserValues<Parsers>>

class Juxtapose<Parsers extends ReadonlyArray<Parser<unknown> | string>>
  implements Parser<JuxtaposeValue<Parsers>>
{
  readonly structure: ReadonlyArray<Parser<unknown> | string>

  #index = 0

  constructor(structure: Parsers) {
    if (structure.length === 0) {
      throw new TypeError('juxtapose() parser must have at least one parser')
    }

    const storage: Array<Parser<unknown> | string> = []

    for (const parser of structure) {
      if (parser instanceof Juxtapose) {
        storage.push(...parser.structure)
      } else {
        storage.push(parser)
      }
    }

    this.structure = storage
  }

  satisfied(state: 'initial' | 'current' = 'current'): boolean {
    const start = state === 'initial' ? 0 : this.#index
    for (let i = start; i < this.structure.length; i++) {
      const parser = this.structure[i]
      if (typeof parser === 'string') {
        return false
      }
      if (typeof parser === 'object' && !parser.satisfied(state)) {
        return false
      }
    }

    return true
  }

  feed(token: Token): boolean {
    return this.#feed(token)
  }

  check(token: Token, state: 'current' | 'initial' = 'current'): boolean {
    return this.#check(token, state)
  }

  read(): JuxtaposeValue<Parsers> | undefined {
    const result = [] as JuxtaposeValue<Parsers>

    for (const parser of this.structure) {
      if (typeof parser !== 'string') {
        const value = parser.read()

        if (value === undefined) {
          return undefined
        }

        result.push(value as never)
      }
    }

    return result
  }

  reset(): void {
    this.#index = 0

    for (const parser of this.structure) {
      if (typeof parser !== 'string') {
        parser.reset()
      }
    }
  }

  toString(): string {
    return Array.from(this.structure, (parser) => parser.toString()).join(' ')
  }

  #feed(token: Token): boolean {
    if (this.#index === this.structure.length) {
      return false
    }

    const element = this.structure[this.#index] as Parser<unknown> | string

    if (typeof element === 'string') {
      if (token.type === 'literal' && token.value === element) {
        this.#index += 1
        return true
      }
      return false
    }
    const consumed = element.feed(token)

    if (!consumed) {
      if (element.satisfied()) {
        this.#index += 1
        return this.#feed(token)
      }

      return false
    }

    return true
  }

  #check(token: Token, state: 'current' | 'initial'): boolean {
    if (this.#index === this.structure.length && state === 'current') {
      return false
    }

    for (const element of this.structure.slice(
      state === 'initial' ? 0 : this.#index,
    )) {
      if (typeof element === 'string') {
        return token.type === 'literal' && token.value === element
      }

      const consumed = element.check(token, state)

      if (consumed) {
        return true
      }
      if (!element.satisfied(state)) {
        return false
      }
    }

    return true
  }
}

export function juxtapose<
  const Parsers extends ReadonlyArray<Parser<unknown> | string>,
>(parsers: Parsers): Juxtapose<Parsers> {
  return new Juxtapose(parsers)
}
