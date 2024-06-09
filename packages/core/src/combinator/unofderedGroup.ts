import type { Parser } from '../parser'

interface UnorderedGroup {
  parsers: ReadonlySet<Parser<unknown>>
  domain: ReadonlySet<string>
}

export function unorderedGroup(
  list: ReadonlyArray<Parser<unknown>>,
  brand: symbol,
): UnorderedGroup {
  const parsers = new Set<Parser<unknown>>()
  const domain = new Set<string>()

  for (const parser of unwrapParsers(list, brand)) {
    for (const value of parser.domain) {
      if (domain.has(value)) {
        throw new TypeError(`Ambiguity detected in domain: ${value}`)
      }
      domain.add(value)
    }
    parsers.add(parser)
  }

  return { parsers, domain }
}

export function* unwrapParsers(
  list: Iterable<Parser<unknown>>,
  brand: symbol,
): Generator<Parser<unknown>> {
  for (const parser of list) {
    if (brand in parser) {
      yield* unwrapParsers(
        (parser as Parser<unknown> & UnorderedGroup).parsers.values(),
        brand,
      )
    } else {
      yield parser
    }
  }
}
