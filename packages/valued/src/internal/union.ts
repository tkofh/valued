// Type-level utilities for keeping the generated input types (template-literal
// unions of accepted strings) from exploding.
//
// A parser's input type enumerates every string it accepts. Repeating or
// combining parsers multiplies those unions together, and a wide union — the
// ~50-unit dimension inputs like `length()` — blows past TypeScript's union
// size limit (TS2590) after only a few multiplications.
//
// So each combining construct checks whether the exact enumeration stays within
// a size budget. When it does, the precise type is used and narrow keyword
// grammars keep their full autocomplete. When it would overflow, the construct
// falls back to a *sum* (which can't overflow) that still carries the useful
// single-value suggestions plus `string & {}` to accept anything else:
//   - repetition / juxtaposition -> the element's own input (`Loose`)
//   - allOf / someOf             -> every element's input (`LooseCombinatorInput`)

import type { AnyParser, ParserInput } from '../parser.ts'

type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

type LastOfUnion<U> =
  UnionToIntersection<U extends unknown ? () => U : never> extends () => infer R
    ? R
    : never

/**
 * `true` when union `U` has at most `Limit` members. Peels at most `Limit + 1`
 * members, so the cost is bounded by `Limit` regardless of how wide `U` is —
 * checking a 500-member union against a limit of 12 is as cheap as checking a
 * 13-member one.
 */
export type IsUnionAtMost<
  U,
  Limit extends number,
  Counter extends ReadonlyArray<unknown> = [],
> = [U] extends [never]
  ? true
  : Counter['length'] extends Limit
    ? false
    : IsUnionAtMost<Exclude<U, LastOfUnion<U>>, Limit, [...Counter, unknown]>

/**
 * Per-element width budget for a *product* of `Arity` input unions —
 * repetition (`p{n}`) or juxtaposition (`a b c`), whose size grows as
 * `width ** Arity`. Tightens as `Arity` rises so the product stays in the low
 * thousands. Arity 0/1 is effectively uncapped, so a lone element keeps its
 * full input type.
 */
export type ProductBudget<Arity extends number> = Arity extends 0 | 1
  ? 9999
  : Arity extends 2
    ? 64
    : Arity extends 3
      ? 16
      : Arity extends 4
        ? 9
        : Arity extends 5
          ? 6
          : Arity extends 6
            ? 4
            : 3

// Per-element width budget for the exact `allOf` / `someOf` orderings, whose
// size grows as Arity! * width ** Arity. Tighter than the product budget
// because of the factorial term. Arity 6+ always falls back — `Combinations`
// itself caps at 5.
type CombinatorBudget<Arity extends number> = Arity extends 0 | 1
  ? 9999
  : Arity extends 2
    ? 64
    : Arity extends 3
      ? 16
      : Arity extends 4
        ? 6
        : Arity extends 5
          ? 3
          : 0

/** Drops a bare-`string` input — it carries no suggestions and `string & {}` already covers it. */
type WithoutBareString<T> = string extends T ? never : T

/**
 * The loose fallback for a single element (repetition, or a juxtapose
 * position): its own input for autocomplete, plus `string & {}` to accept
 * anything else. A bare-`string` input contributes nothing but the open end.
 */
export type Loose<T> = WithoutBareString<T> | (string & {})

/**
 * `true` when every parser in `Parsers` has an input union of at most `Limit`
 * members — i.e. the exact ordering enumeration will stay bounded.
 */
export type AllInputsAtMost<
  Parsers extends ReadonlyArray<AnyParser>,
  Limit extends number,
> = Parsers extends readonly [
  infer Head extends AnyParser,
  ...infer Tail extends ReadonlyArray<AnyParser>,
]
  ? IsUnionAtMost<ParserInput<Head>, Limit> extends true
    ? AllInputsAtMost<Tail, Limit>
    : false
  : true

/**
 * `true` when the exact `allOf` / `someOf` orderings for `Parsers` fit within
 * the arity budget. When `false`, a combinator should use
 * {@link LooseCombinatorInput} instead of enumerating orderings.
 */
export type ExactCombinatorFits<Parsers extends ReadonlyArray<AnyParser>> =
  AllInputsAtMost<Parsers, CombinatorBudget<Parsers['length']>>

type LooseElementInputs<Parsers extends ReadonlyArray<AnyParser>> =
  Parsers extends readonly [
    infer Head extends AnyParser,
    ...infer Tail extends ReadonlyArray<AnyParser>,
  ]
    ? WithoutBareString<ParserInput<Head>> | LooseElementInputs<Tail>
    : never

/**
 * The loose input type for an `allOf` / `someOf` whose exact orderings would
 * overflow: the union of each parser's own input (so a single value still
 * autocompletes), with bare-`string` inputs dropped, plus `string & {}` to
 * accept a multi-value string in any order. A sum of the element widths, so it
 * can never overflow regardless of how wide or how many the parsers are.
 */
export type LooseCombinatorInput<Parsers extends ReadonlyArray<AnyParser>> =
  | LooseElementInputs<Parsers>
  | (string & {})
