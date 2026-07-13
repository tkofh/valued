// Type-level utilities for keeping the generated input types (template-literal
// unions of accepted strings) from exploding.
//
// A parser's input type enumerates every string it accepts. Repeating or
// combining parsers multiplies those unions together, and a wide union — the
// ~50-unit dimension inputs like `length()` — blows past TypeScript's union
// size limit (TS2590) after only a few multiplications. `string` absorbs in
// template concatenation (`${string} ${x}` is just `string`), so collapsing a
// too-wide element to `string` before it participates keeps the combined type
// finite while narrow keyword unions stay exact.

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
 * `T` when it is a union of at most `Limit` members, otherwise `string`. Used
 * to cap an element's input type before it is repeated or combined.
 */
export type NarrowOrString<T, Limit extends number> =
  IsUnionAtMost<T, Limit> extends true ? T : string

/**
 * Cap `T` for use in a *product* of `Arity` input unions — repetition
 * (`p{n}`) or juxtaposition (`a b c`), whose size grows as
 * `width ** Arity`. The width budget tightens as `Arity` rises so the product
 * stays in the low thousands; a wider element collapses to `string`. Arity 0/1
 * is left effectively uncapped, so a lone parser keeps its full input type.
 */
export type NarrowForProduct<T, Arity extends number> = NarrowOrString<
  T,
  Arity extends 0 | 1
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
>

/**
 * Cap `T` for use in a *permutation* of `Arity` input unions — the `allOf` /
 * `someOf` orderings, whose size grows as `Arity! * width ** Arity`. Tighter
 * than {@link NarrowForProduct} because of the factorial term.
 */
export type NarrowForPermutation<T, Arity extends number> = NarrowOrString<
  T,
  Arity extends 0 | 1
    ? 9999
    : Arity extends 2
      ? 64
      : Arity extends 3
        ? 16
        : Arity extends 4
          ? 6
          : 3
>
