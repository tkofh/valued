import { type ComputedRef, type MaybeRefOrGetter, computed, toValue } from 'vue'
import { valuedEqual } from './equals.ts'
import { parse } from './parse.ts'
import type { AnyParser, ParserInput, ParserValue } from './parser.ts'

export interface UseValuedOptions<P extends AnyParser> {
  defaultValue?: ParserInput<P>
  holdOnError?: boolean
}

export function useValued<P extends AnyParser>(
  source: MaybeRefOrGetter<ParserInput<P> | (string & {})>,
  parser: P,
  options: UseValuedOptions<P> = {},
): ComputedRef<ParserValue<P> | null> {
  let fallback: ParserValue<P> | null = null
  if (options.defaultValue !== undefined) {
    const seed = parse(options.defaultValue, parser)
    if (!seed.valid) {
      throw new Error(
        `useValued: defaultValue ${JSON.stringify(
          options.defaultValue,
        )} did not parse against ${parser.toString()}`,
      )
    }
    fallback = seed.value as ParserValue<P>
  }

  const holdOnError = options.holdOnError ?? false

  return computed((prev) => {
    const result = parse(toValue(source), parser)
    if (result.valid) {
      const next = result.value as ParserValue<P>
      return prev !== undefined && valuedEqual(next, prev) ? prev : next
    }
    if (holdOnError && prev !== undefined) {
      return prev
    }
    return fallback
  })
}
