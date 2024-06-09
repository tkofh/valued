export function isRecordOrArray(input: unknown): input is object {
  return typeof input === 'object' && input !== null
}
export function hasProperty<P extends PropertyKey>(
  input: unknown,
  property: P,
): input is Record<P, unknown> {
  return isRecordOrArray(input) && property in input
}
