import type { AnyParser, Parser, ParserInput } from '../parser'

type FilterElement<T, P> = T extends P ? [T] : []

type Filter<T extends ReadonlyArray<unknown>, P> = T extends [
  infer First,
  ...infer Rest,
]
  ? [...FilterElement<First, P>, ...Filter<Rest, P>]
  : []

export type FilterStrings<T extends ReadonlyArray<unknown>> = Filter<T, string>

export type ExtractParserValues<P extends ReadonlyArray<unknown>, T = never> = {
  [K in keyof P]: P[K] extends Parser<infer U, string> ? U | T : never
}

export type ExtractParserInputs<
  P extends ReadonlyArray<unknown>,
  C extends string = never,
> = {
  [K in keyof P]: P[K] extends AnyParser
    ? ParserInput<P[K]>
    : P[K] extends C
      ? P[K]
      : never
}
