import { isRecordOrArray } from './predicates.ts'

/**
 * Structural equality for parsed `valued` values, available from the
 * `valued/equals` subpath.
 *
 * Compares the shapes {@link parse} produces: value objects (such as a
 * `LengthValue` or `KeywordValue`) by their `toString()`, arrays and tuples
 * element by element, and `null` slots by identity. Returns `true` when two
 * parse results represent the same value even though they are distinct object
 * instances.
 *
 * This is what {@link useValued} uses to preserve referential identity across
 * re-parses; reach for it when you memoize on a parsed value yourself.
 *
 * @param a - a parsed value
 * @param b - another parsed value
 * @returns whether `a` and `b` are structurally equal
 *
 * @example
 * ```ts
 * const a = parse('12px', length())
 * const b = parse('12px', length())
 * a.valid && b.valid && valuedEqual(a.value, b.value) // true
 * ```
 */
export function valuedEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true
  }
  if (a === null || b === null || a === undefined || b === undefined) {
    return false
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      return false
    }
    for (let i = 0; i < a.length; i++) {
      if (!valuedEqual(a[i], b[i])) {
        return false
      }
    }
    return true
  }
  if (Array.isArray(b)) {
    return false
  }
  if (isRecordOrArray(a) && isRecordOrArray(b)) {
    return String(a) === String(b)
  }
  return false
}
