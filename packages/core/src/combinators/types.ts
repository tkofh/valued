export type FilterStrings<T extends ReadonlyArray<unknown>> = T extends [
  infer First,
  ...infer Rest,
]
  ? [...(First extends string ? [T] : []), ...FilterStrings<Rest>]
  : []
