import { InternalNumberParser } from '../internal/number'
import type { Parser } from '../parser'
import { isRecordOrArray } from '../predicates'

const TypeBrand: unique symbol = Symbol('data/integer')

export type IntegerInput = `${number}`

class IntegerValue {
  readonly [TypeBrand] = TypeBrand

  readonly value: number

  constructor(value: number) {
    this.value = value
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
  extends InternalNumberParser<IntegerValue, IntegerInput>
  implements Parser<IntegerValue, IntegerInput>
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

export function integer(options?: IntegerOptions): IntegerParser {
  return new IntegerParser(options)
}
