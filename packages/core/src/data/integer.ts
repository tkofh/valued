import { InternalNumberParser } from '../internal/number'
import type { InternalParser, Parser } from '../parser'
import { isRecordOrArray } from '../predicates'

const TypeBrand: unique symbol = Symbol('data/integer')

export type IntegerInput = `${number}`

class IntegerValue {
  readonly [TypeBrand] = TypeBrand

  readonly value: number

  constructor(value: number) {
    this.value = value
  }

  toString(): string {
    return `${this.value}`
  }
}

export function integerValue(value: number): IntegerValue {
  return new IntegerValue(value)
}

export function isIntegerValue(value: unknown): value is IntegerValue {
  return isRecordOrArray(value) && TypeBrand in value
}

interface IntegerOptions {
  min?: number | false | null | undefined
  max?: number | false | null | undefined
}

class IntegerParser
  extends InternalNumberParser<IntegerValue>
  implements InternalParser<IntegerValue>
{
  constructor(options?: IntegerOptions) {
    super(
      options?.min == null || options.min === false
        ? Number.NEGATIVE_INFINITY
        : options.min,
      options?.max == null || options.max === false
        ? Number.POSITIVE_INFINITY
        : options.max,
      integerValue,
    )
  }

  protected override checkNumberValue(value: number): boolean {
    return ~~value === value
  }
}

export type { IntegerValue, IntegerParser }

export function integer(
  options?: IntegerOptions,
): Parser<IntegerValue, IntegerInput> {
  return new IntegerParser(options) as never
}
