import {
  type AnyParser,
  type InternalParser,
  type Parser,
  type ParserInput,
  type ParserValue,
} from '../parser'
import { isRecordOrArray } from '../predicates'
import type { Token } from '../tokenizer'

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

export type SomeOfValue<Parsers extends ReadonlyArray<AnyParser>> =
  InternalSomeOfValue<Parsers>

type InternalSomeOfInput<
  Parsers extends ReadonlyArray<AnyParser>,
  Inputs extends ReadonlyArray<string> = [],
> = Inputs['length'] extends Parsers['length']
  ? Combinations<Inputs>
  : InternalSomeOfInput<
      Parsers,
      [...Inputs, ParserInput<Parsers[Inputs['length']]>]
    >

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

const someOf: SomeOfConstructor = (<
  const Parsers extends ReadonlyArray<AnyParser>,
>(
  parsers: Parsers,
): Parser<SomeOfValue<Parsers>, SomeOfInput<Parsers>> =>
  new SomeOf(parsers) as never) as SomeOfConstructor

someOf.withInput = (<Input extends string>() =>
  <const Parsers extends ReadonlyArray<AnyParser>>(
    parsers: Parsers,
  ): Parser<SomeOfValue<Parsers>, Input> =>
    new SomeOf(parsers) as never) as SomeOfConstructor['withInput']

export { someOf }
