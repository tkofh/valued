import type {
  AnyParser,
  InternalParser,
  Parser,
  ParserInput,
  ParserValue,
} from '../parser.ts'
import { isRecordOrArray } from '../predicates.ts'
import type { Token } from '../tokenizer.ts'

type Combinations<T extends ReadonlyArray<string>> = T extends [string]
  ? T[0]
  : T extends [string, string]
    ? `${T[0]} ${T[1]}` | `${T[1]} ${T[0]}`
    : T extends [string, string, string]
      ?
          | `${T[0]} ${T[1]} ${T[2]}`
          | `${T[0]} ${T[2]} ${T[1]}`
          | `${T[1]} ${T[2]} ${T[0]}`
          | `${T[1]} ${T[0]} ${T[2]}`
          | `${T[2]} ${T[0]} ${T[1]}`
          | `${T[2]} ${T[1]} ${T[0]}`
      : T extends [string, string, string, string]
        ?
            | `${T[0]} ${Combinations<[T[1], T[2], T[3]]>}`
            | `${T[1]} ${Combinations<[T[0], T[2], T[3]]>}`
            | `${T[2]} ${Combinations<[T[0], T[1], T[3]]>}`
            | `${T[3]} ${Combinations<[T[0], T[1], T[2]]>}`
        : T extends [string, string, string, string, string]
          ?
              | `${T[0]} ${Combinations<[T[1], T[2], T[3], T[4]]>}`
              | `${T[1]} ${Combinations<[T[0], T[2], T[3], T[4]]>}`
              | `${T[2]} ${Combinations<[T[0], T[1], T[3], T[4]]>}`
              | `${T[3]} ${Combinations<[T[0], T[1], T[2], T[4]]>}`
              | `${T[4]} ${Combinations<[T[0], T[1], T[2], T[3]]>}`
          : T extends []
            ? ''
            : string

type InternalAllOfInput<
  Parsers extends ReadonlyArray<AnyParser>,
  Inputs extends ReadonlyArray<string> = [],
> = Inputs['length'] extends Parsers['length']
  ? Combinations<Inputs>
  : InternalAllOfInput<
      Parsers,
      [...Inputs, ParserInput<Parsers[Inputs['length']]>]
    >

/**
 * The accepted-input type of an {@link allOf} parser: every ordering of the
 * parsers' inputs, space-separated.
 */
export type AllOfInput<T extends ReadonlyArray<AnyParser>> =
  InternalAllOfInput<T>

type InternalAllOfValue<
  Parsers extends ReadonlyArray<AnyParser>,
  Values extends ReadonlyArray<unknown> = [],
> = Values['length'] extends Parsers['length']
  ? Values
  : InternalAllOfValue<
      Parsers,
      [...Values, ParserValue<Parsers[Values['length']]>]
    >

/**
 * The value type of an {@link allOf} parser: a tuple of every parser's value,
 * in declaration order.
 */
export type AllOfValue<Parsers extends ReadonlyArray<AnyParser>> =
  InternalAllOfValue<Parsers>

const TypeBrand: unique symbol = Symbol('combinators/allOf')

function isAllOf(value: unknown): value is AllOf<ReadonlyArray<AnyParser>> {
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

type AllOfState = ReadonlyArray<Branch>

const PENDING: SubStatus = { kind: 'pending' }

class AllOf<
  const Parsers extends ReadonlyArray<AnyParser>,
> implements InternalParser<AllOfValue<Parsers>> {
  readonly [TypeBrand] = TypeBrand
  readonly parsers: ReadonlyArray<AnyParser>

  constructor(parsers: Parsers) {
    if (parsers.length === 0) {
      throw new TypeError('allOf() parser must have at least one parser')
    }

    const seen = new Set<AnyParser>()
    const storage: Array<AnyParser> = []

    for (const parser of parsers) {
      if (isAllOf(parser)) {
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

  init(): AllOfState {
    return [
      {
        active: -1,
        statuses: this.parsers.map(() => PENDING),
      },
    ]
  }

  feed(state: unknown, token: Token): unknown | null {
    const branches = state as AllOfState
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

  read(state: unknown): AllOfValue<Parsers> | undefined {
    const branches = state as AllOfState

    for (const branch of branches) {
      const result: Array<unknown> = []
      let valid = true

      for (let i = 0; i < this.parsers.length; i++) {
        const status = branch.statuses[i] as SubStatus
        const parser = this.parsers[i] as AnyParser
        if (status.kind === 'done') {
          result.push(status.value)
        } else if (status.kind === 'in-progress') {
          const v = parser.read(status.state)
          if (v === undefined) {
            valid = false
            break
          }
          result.push(v)
        } else {
          const v = parser.read(parser.init())
          if (v === undefined) {
            valid = false
            break
          }
          result.push(v)
        }
      }

      if (valid) {
        return result as AllOfValue<Parsers>
      }
    }

    return undefined
  }

  toString(): string {
    return this.parsers.map((parser) => parser.toString()).join(' && ')
  }
}

/** The parser type returned by {@link allOf}. */
export type { AllOf }

type AllOfConstructor = {
  <const Parsers extends ReadonlyArray<AnyParser>>(
    parsers: Parsers,
  ): Parser<AllOfValue<Parsers>, AllOfInput<Parsers>>
  withInput<Input extends string>(): <
    const Parsers extends ReadonlyArray<AnyParser>,
  >(
    parsers: Parsers,
  ) => Parser<AllOfValue<Parsers>, Input>
}

/**
 * Match every one of `parsers`, in any order — the `&&` combinator from the
 * Value Definition Syntax.
 *
 * Every parser must match. The input may present them in any order, but the
 * result tuple is always in the order `parsers` were declared. If any parser
 * has no match, the whole `allOf` fails.
 *
 * @param parsers - the parsers that must all match; must be non-empty
 * @returns a parser yielding a tuple of every parser's value, in declaration
 * order
 * @throws {TypeError} if `parsers` is empty
 *
 * @example
 * ```ts
 * // <color> && <length>
 * const colorAndLength = allOf([color(), length()])
 *
 * parse('red 12px', colorAndLength) // [ColorValue, LengthValue]
 * parse('12px red', colorAndLength) // [ColorValue, LengthValue] — same order out
 * ```
 */
const allOf = (<const Parsers extends ReadonlyArray<AnyParser>>(
  parsers: Parsers,
): Parser<AllOfValue<Parsers>, AllOfInput<Parsers>> =>
  new AllOf(parsers) as never) as AllOfConstructor

/**
 * Build an {@link allOf} parser whose accepted-input type is a fixed string
 * you supply, rather than the one inferred from the parsers. Runtime behavior
 * is identical; only the compile-time input type changes.
 */
allOf.withInput =
  <Input extends string>() =>
  <const Parsers extends ReadonlyArray<AnyParser>>(
    parsers: Parsers,
  ): Parser<AllOfValue<Parsers>, Input> =>
    new AllOf(parsers) as never

export { allOf }
