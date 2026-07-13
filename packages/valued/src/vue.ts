import { type ComputedRef, type MaybeRefOrGetter, computed, toValue } from 'vue'
import { valuedEqual } from './equals.ts'
import { parse } from './parse.ts'
import type { AnyParser, ParserInput, ParserValue } from './parser.ts'

/** Options for {@link useValued}. */
export interface UseValuedOptions<P extends AnyParser> {
  /**
   * A fallback input, parsed once up front and returned whenever `source`
   * fails to parse (unless `holdOnError` is holding a value). Must itself parse
   * against the parser, or {@link useValued} throws.
   */
  defaultValue?: ParserInput<P>
  /**
   * When `source` fails to parse, keep the last successful value instead of
   * falling back to `defaultValue`.
   *
   * @default false
   */
  holdOnError?: boolean
}

/**
 * A Vue composable that reactively parses a source string against a `valued`
 * parser, available from the `valued/vue` subpath.
 *
 * Returns a `ComputedRef` that re-parses whenever `source` changes. On a
 * successful parse it yields the parsed value, and preserves referential
 * identity across structurally-equal results (via {@link valuedEqual}) so
 * downstream watchers don't fire when the value hasn't really changed. On a
 * failed parse it yields the parsed `defaultValue`, or `null` — unless
 * `holdOnError` keeps the last successful value.
 *
 * `vue` is an optional peer dependency; import this only where Vue is present.
 *
 * @param source - a string, ref, or getter to parse
 * @param parser - the parser to run against it
 * @param options - fallback and error-handling behavior
 * @returns a computed parsed value, or `null`
 * @throws {Error} if `defaultValue` is given but does not parse against `parser`
 *
 * @example
 * ```ts
 * const width = useValued(() => props.width, length(), { defaultValue: '0px' })
 * // width.value is a LengthValue — the parsed '0px' whenever props.width is invalid
 * ```
 */
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
