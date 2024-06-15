import type { Token } from './tokenizer'

// export type ParserShapeMeta =
//   | { finite: false }
//   | { finite: true; length: number }
//
// export type ParserShape = IterableIterator<ReadonlySet<string>> &
//   ParserShapeMeta

export interface Parser<T> {
  readonly isSatisfied: boolean
  // readonly isFull: boolean

  // shape(): ParserShape
  feed(token: Token): boolean
  flush(): T | undefined
  reset(): void
  toString(): string
}

export type ParserValue<T> = T extends Parser<infer U> ? U : never

export type ParseResult<T> =
  | {
      valid: false
    }
  | {
      valid: true
      value: T
    }
export function valid<T>(value: T): ParseResult<T> {
  return { valid: true, value }
}

const _invalid: ParseResult<never> = { valid: false }
export function invalid<T>(): ParseResult<T> {
  return _invalid
}

// const validStatus = 1
// const fullStatus = 2
// const consumedStatus = 4
//
// export const status = {
//   none: 0,
//   valid: validStatus,
//   full: fullStatus,
//   consumed: consumedStatus,
//   all: validStatus | fullStatus | consumedStatus,
// } as const
//
// function* walkParserShapes(
//   shapes: ReadonlySet<ParserShape>,
// ): IterableIterator<ReadonlySet<string>> {
//   const values = new Set<string>()
//   while (true) {
//     values.clear()
//
//     for (const shape of shapes) {
//       const shapeValues = shape.next().value as ReadonlySet<string>
//       for (const value of shapeValues) {
//         values.add(value)
//       }
//     }
//
//     yield values
//   }
// }
//
// export function mergeParserShapes(
//   parsers: ReadonlyArray<Parser<unknown>>,
//   lengthMode: 'sum' | 'max' = 'sum',
// ): ParserShape {
//   let length = 0
//   let finite = true
//
//   const shapes = new Set<ParserShape>()
//
//   for (const parser of parsers) {
//     const shape = parser.shape()
//     shapes.add(shape)
//
//     if (!shape.finite) {
//       finite = false
//     } else if (finite) {
//       length =
//         lengthMode === 'max'
//           ? Math.max(length, shape.length)
//           : length + shape.length
//     }
//   }
//
//   return Object.assign(
//     walkParserShapes(shapes),
//     (finite ? { finite: true, length } : { finite: false }) as ParserShapeMeta,
//   )
// }
