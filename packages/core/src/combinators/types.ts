export type FilterNever<T extends ReadonlyArray<unknown>> = T extends [
  infer First,
  ...infer Rest,
]
  ? [...(First extends never ? [] : [First]), ...FilterNever<Rest>]
  : []
