import {
  type InternalNumberInput,
  InternalNumberParser,
} from '../internal/number'
import type { InternalParser, Parser } from '../parser'
import { isRecordOrArray } from '../predicates'

const TypeBrand: unique symbol = Symbol('data/number')

export type NumberInput = InternalNumberInput

class NumberValue {
  readonly [TypeBrand] = TypeBrand

  readonly value: number

  constructor(value: number) {
    this.value = value
  }
}

export function numberValue(value: number): NumberValue {
  return new NumberValue(value)
}

export function isNumberValue(value: unknown): value is NumberValue {
  return isRecordOrArray(value) && TypeBrand in value
}

interface NumberOptions {
  min?: number | false | null | undefined
  max?: number | false | null | undefined
}

class NumberParser
  extends InternalNumberParser<NumberValue>
  implements InternalParser<NumberValue>
{
  constructor(options?: NumberOptions) {
    super(
      options?.min == null || options.min === false
        ? Number.NEGATIVE_INFINITY
        : options.min,
      options?.max == null || options.max === false
        ? Number.POSITIVE_INFINITY
        : options.max,
      numberValue,
    )
  }
}

export type { NumberValue, NumberParser }

export function number(
  options?: NumberOptions,
): Parser<NumberValue, NumberInput> {
  return new NumberParser(options) as never
}
