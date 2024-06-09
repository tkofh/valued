import {
  FULL,
  NOT_SATISFIED,
  type Parser,
  type ParserState,
  SATISFIED,
} from '../parser'
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

const TypeBrand: unique symbol = Symbol('combinator/juxtapose')

function* unwrapStructure(
  structure: Iterable<Parser<unknown> | string>,
): Generator<Parser<unknown> | string> {
  for (const element of structure) {
    if (typeof element === 'string') {
      yield element
    } else if (TypeBrand in element) {
      yield* unwrapStructure((element as unknown as Juxtapose<[]>).structure)
    } else {
      yield element
    }
  }
}

class Juxtapose<Parsers extends ReadonlyArray<Parser<unknown> | string>>
  implements Parser<JuxtaposeValue<Parsers>>
{
  readonly [TypeBrand] = TypeBrand
  readonly structure: ReadonlyArray<Parser<unknown> | string>
  readonly domain: ReadonlySet<string>

  #index = 0

  get state(): ParserState {
    if (this.#index === this.structure.length) {
      return FULL
    }
    return NOT_SATISFIED
  }

  constructor(structure: Parsers) {
    if (structure.length === 0) {
      throw new TypeError('juxtapose() parser must have at least one parser')
    }

    this.structure = Array.from(unwrapStructure(structure))

    const first = this.structure[0] as Parser<unknown> | string
    if (typeof first === 'string') {
      this.domain = new Set([first])
    } else {
      this.domain = first.domain
    }
  }

  // need to somehow retry token when last parser skipped but was satisfied
  // satisfaction might need to become a flag as well, instead of relying on only finished
  feed(token: Token): boolean {
    const element = this.structure[this.#index] as Parser<unknown> | string

    if (typeof element === 'string') {
      if (token.type === 'literal' && token.value === element) {
        this.#index += 1
        return true
      }
      return false
    }
    const consumed = element.feed(token)
    if (consumed) {
      if (element.state === FULL) {
        this.#index += 1
      }

      return consumed
    }

    if (element.state === SATISFIED) {
      this.#index += 1

      return this.feed(token)
    }

    return false
  }

  flush(): JuxtaposeValue<Parsers> | undefined {
    const result = [] as JuxtaposeValue<Parsers>

    for (const parser of this.structure) {
      if (typeof parser !== 'string') {
        const value = parser.flush()

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
}

export function juxtapose<
  const Parsers extends ReadonlyArray<Parser<unknown> | string>,
>(parsers: Parsers): Juxtapose<Parsers> {
  return new Juxtapose(parsers)
}
