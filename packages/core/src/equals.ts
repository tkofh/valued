import { isRecordOrArray } from './predicates.ts'

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
