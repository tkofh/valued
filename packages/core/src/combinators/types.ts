import type { Parser } from '../parser'

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
  Parsers extends ReadonlyArray<unknown>,
  Constant extends string = never,
> = {
  [K in keyof Parsers]: Parsers[K] extends Parser<unknown, infer I>
    ? I
    : Parsers[K] extends Constant
      ? Parsers[K]
      : never
}
