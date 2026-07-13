import {
  type AnyParser,
  type InternalParser,
  type Parser,
  type ParserInput,
  type ParserValue,
} from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'
import type { Token } from '../tokenizer.ts'
import type { NarrowForPermutation } from '../internal/union.ts'

type Combinations<T extends ReadonlyArray<string>> = T extends []
  ? ''
  : T extends [string]
    ? T[0]
    : T extends [string, string]
      ? T[0] | T[1] | `${T[0]} ${T[1]}` | `${T[1]} ${T[0]}`
      : T extends [string, string, string]
        ?
            | T[0]
            | T[1]
            | T[2]
            | `${T[0]} ${T[1]}`
            | `${T[1]} ${T[0]}`
            | `${T[0]} ${T[2]}`
            | `${T[2]} ${T[0]}`
            | `${T[1]} ${T[2]}`
            | `${T[2]} ${T[1]}`
            | `${T[0]} ${T[1]} ${T[2]}`
            | `${T[0]} ${T[2]} ${T[1]}`
            | `${T[1]} ${T[0]} ${T[2]}`
            | `${T[1]} ${T[2]} ${T[0]}`
            | `${T[2]} ${T[0]} ${T[1]}`
            | `${T[2]} ${T[1]} ${T[0]}`
        : T extends [string, string, string, string]
          ?
              | Combinations<[T[0], T[1], T[2]]>
              | Combinations<[T[0], T[1], T[3]]>
              | Combinations<[T[0], T[2], T[3]]>
              | Combinations<[T[1], T[2], T[3]]>
              | `${T[0]} ${Combinations<[T[1], T[2], T[3]]>}`
              | `${T[1]} ${Combinations<[T[0], T[2], T[3]]>}`
              | `${T[2]} ${Combinations<[T[0], T[1], T[3]]>}`
              | `${T[3]} ${Combinations<[T[0], T[1], T[2]]>}`
          : T extends [string, string, string, string, string]
            ?
                | Combinations<[T[0], T[1], T[2], T[3]]>
                | Combinations<[T[0], T[1], T[2], T[4]]>
                | Combinations<[T[0], T[1], T[3], T[4]]>
                | Combinations<[T[0], T[2], T[3], T[4]]>
                | Combinations<[T[1], T[2], T[3], T[4]]>
                | `${T[0]} ${Combinations<[T[1], T[2], T[3], T[4]]>}`
                | `${T[1]} ${Combinations<[T[0], T[2], T[3], T[4]]>}`
                | `${T[2]} ${Combinations<[T[0], T[1], T[3], T[4]]>}`
                | `${T[3]} ${Combinations<[T[0], T[1], T[2], T[4]]>}`
                | `${T[4]} ${Combinations<[T[0], T[1], T[2], T[3]]>}`
            : string

type InternalSomeOfValue<
  Parsers extends ReadonlyArray<AnyParser>,
  Values extends ReadonlyArray<unknown> = [],
> = Values['length'] extends Parsers['length']
  ? Values
  : InternalSomeOfValue<
      Parsers,
      [...Values, ParserValue<Parsers[Values['length']]> | null]
    >

/**
 * The value type of a {@link someOf} parser: a tuple in declaration order with
 * one slot per parser — that parser's value, or `null` where it was omitted.
 */
export type SomeOfValue<Parsers extends ReadonlyArray<AnyParser>> =
  InternalSomeOfValue<Parsers>

// `Combinations` enumerates every ordering of every subset, so its size grows
// even faster than allOf's. Cap each parser's input width first: a wide
// dimension input collapses to `string` (which absorbs across the orderings)
// instead of multiplying out past TypeScript's union limit, while narrow
// keyword sets keep their exact orderings.
type InternalSomeOfInput<
  Parsers extends ReadonlyArray<AnyParser>,
  Inputs extends ReadonlyArray<string> = [],
> = Inputs['length'] extends Parsers['length']
  ? Combinations<Inputs>
  : InternalSomeOfInput<
      Parsers,
      [
        ...Inputs,
        NarrowForPermutation<
          ParserInput<Parsers[Inputs['length']]>,
          Parsers['length']
        >,
      ]
    >

/**
 * The accepted-input type of a {@link someOf} parser: every ordering of every
 * non-empty subset of the parsers' inputs, space-separated.
 */
export type SomeOfInput<Parsers extends ReadonlyArray<AnyParser>> =
  InternalSomeOfInput<Parsers, []>

const TypeBrand: unique symbol = Symbol('combinators/someOf')

function isSomeOf(value: unknown): value is SomeOf<ReadonlyArray<AnyParser>> {
  return isRecordOrArray(value) && TypeBrand in value
}

type SubStatus =
  | { kind: 'pending' }
  | { kind: 'in-progress'; state: unknown }
  | { kind: 'done'; value: unknown }

type Branch = {
  active: number
  statuses: ReadonlyArray<SubStatus>
}

type SomeOfState = ReadonlyArray<Branch>

const PENDING: SubStatus = { kind: 'pending' }

class SomeOf<
  const Parsers extends ReadonlyArray<AnyParser>,
> implements InternalParser<SomeOfValue<Parsers>> {
  readonly [TypeBrand] = TypeBrand
  readonly parsers: ReadonlyArray<AnyParser>

  constructor(parsers: Parsers) {
    if (parsers.length === 0) {
      throw new RangeError('someOf() parser must have at least one parser')
    }

    const seen = new Set<AnyParser>()
    const storage: Array<AnyParser> = []

    for (const parser of parsers) {
      if (isSomeOf(parser)) {
        for (const child of parser.parsers) {
          if (!seen.has(child)) {
            seen.add(child)
            storage.push(child)
          }
        }
      } else if (!seen.has(parser)) {
        seen.add(parser)
        storage.push(parser)
      }
    }

    this.parsers = storage
  }

  init(): SomeOfState {
    return [
      {
        active: -1,
        statuses: this.parsers.map(() => PENDING),
      },
    ]
  }

  feed(state: unknown, token: Token): unknown | null {
    const branches = state as SomeOfState
    const next: Array<Branch> = []

    for (const branch of branches) {
      if (branch.active !== -1) {
        const status = branch.statuses[branch.active] as {
          kind: 'in-progress'
          state: unknown
        }
        const consumed = (this.parsers[branch.active] as AnyParser).feed(
          status.state,
          token,
        )
        if (consumed !== null) {
          const newStatuses = [...branch.statuses]
          newStatuses[branch.active] = { kind: 'in-progress', state: consumed }
          next.push({ active: branch.active, statuses: newStatuses })
        }
      }

      let canTransition = false
      let activeValue: unknown = undefined

      if (branch.active === -1) {
        canTransition = true
      } else {
        const status = branch.statuses[branch.active] as {
          kind: 'in-progress'
          state: unknown
        }
        const v = (this.parsers[branch.active] as AnyParser).read(status.state)
        if (v !== undefined) {
          canTransition = true
          activeValue = v
        }
      }

      if (canTransition) {
        for (let j = 0; j < this.parsers.length; j++) {
          if (j === branch.active) {
            continue
          }
          if (branch.statuses[j]?.kind !== 'pending') {
            continue
          }
          const parser = this.parsers[j] as AnyParser
          const fresh = parser.feed(parser.init(), token)
          if (fresh === null) {
            continue
          }
          const newStatuses = [...branch.statuses]
          if (branch.active !== -1) {
            newStatuses[branch.active] = { kind: 'done', value: activeValue }
          }
          newStatuses[j] = { kind: 'in-progress', state: fresh }
          next.push({ active: j, statuses: newStatuses })
        }
      }
    }

    return next.length === 0 ? null : next
  }

  read(state: unknown): SomeOfValue<Parsers> | undefined {
    const branches = state as SomeOfState

    for (const branch of branches) {
      const result: Array<unknown> = []
      let anyComplete = false
      let valid = true

      for (let i = 0; i < this.parsers.length; i++) {
        const status = branch.statuses[i] as SubStatus
        const parser = this.parsers[i] as AnyParser
        if (status.kind === 'done') {
          result.push(status.value)
          anyComplete = true
        } else if (status.kind === 'in-progress') {
          const v = parser.read(status.state)
          if (v !== undefined) {
            result.push(v)
            anyComplete = true
          } else {
            valid = false
            break
          }
        } else {
          const v = parser.read(parser.init())
          if (v !== undefined) {
            result.push(v)
            anyComplete = true
          } else {
            result.push(null)
          }
        }
      }

      if (valid && anyComplete) {
        return result as SomeOfValue<Parsers>
      }
    }

    return undefined
  }

  toString(): string {
    return this.parsers.map((parser) => parser.toString()).join(' || ')
  }
}

/** The parser type returned by {@link someOf}. */
export type { SomeOf }

type SomeOfConstructor = {
  <const Parsers extends ReadonlyArray<AnyParser>>(
    parsers: Parsers,
  ): Parser<SomeOfValue<Parsers>, SomeOfInput<Parsers>>
  withInput<Input extends string>(): <
    const Parsers extends ReadonlyArray<AnyParser>,
  >(
    parsers: Parsers,
  ) => Parser<SomeOfValue<Parsers>, Input>
}

/**
 * Match at least one of `parsers`, in any order — the `||` combinator from the
 * Value Definition Syntax.
 *
 * Any non-empty subset of the parsers may match, in any order, but at least
 * one must. The result is always a tuple in declaration order with one slot
 * per parser: that parser's value where it matched, or `null` where it was
 * omitted.
 *
 * @param parsers - the parsers, at least one of which must match; must be
 * non-empty
 * @returns a parser yielding a tuple of each parser's value or `null`, in
 * declaration order
 * @throws {RangeError} if `parsers` is empty
 *
 * @example
 * ```ts
 * // <line-width> || <line-style> || <color>
 * const border = someOf([length(), lineStyle(), color()])
 *
 * parse('1px solid red', border) // [LengthValue, LineStyleValue, ColorValue]
 * parse('solid red', border)     // [null, LineStyleValue, ColorValue]
 * parse('red', border)           // [null, null, ColorValue]
 * ```
 */
const someOf: SomeOfConstructor = (<
  const Parsers extends ReadonlyArray<AnyParser>,
>(
  parsers: Parsers,
): Parser<SomeOfValue<Parsers>, SomeOfInput<Parsers>> =>
  new SomeOf(parsers) as never) as SomeOfConstructor

/**
 * Build a {@link someOf} parser whose accepted-input type is a fixed string
 * you supply, rather than the one inferred from the parsers. Runtime behavior
 * is identical; only the compile-time input type changes.
 */
someOf.withInput = (<Input extends string>() =>
  <const Parsers extends ReadonlyArray<AnyParser>>(
    parsers: Parsers,
  ): Parser<SomeOfValue<Parsers>, Input> =>
    new SomeOf(parsers) as never) as SomeOfConstructor['withInput']

export { someOf }
