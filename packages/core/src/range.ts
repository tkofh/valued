// import { isRecordOrArray } from './predicates'
//
// const TypeBrand: unique symbol = Symbol('range')
//
// export interface Range {
//   [TypeBrand]: typeof TypeBrand
//   readonly min: number
//   readonly minInclusive: boolean
//   readonly max: number
//   readonly maxInclusive: boolean
//
//   toString(): string
// }
//
// const RangeProto: Omit<Range, 'min' | 'minInclusive' | 'max' | 'maxInclusive'> =
//   {
//     [TypeBrand]: TypeBrand,
//
//     toString(this: Range) {
//       return `${this.minInclusive ? '[' : '('}${this.min}, ${this.max}${
//         this.maxInclusive ? ']' : ')'
//       }`
//     },
//   }
//
// export function range(min: number, max: number): Range
// export function range(
//   min: number,
//   minInclusive: boolean,
//   max: number,
//   maxInclusive: boolean,
// ): Range
// export function range(
//   a: number,
//   b: number | boolean,
//   c?: number,
//   d?: boolean,
// ): Range {
//   const range: Range = Object.create(RangeProto)
//   if (typeof b === 'number') {
//     Object.assign(range, {
//       min: Math.min(a, b),
//       minInclusive: true,
//       max: Math.max(a, b),
//       maxInclusive: true,
//     })
//   } else {
//     Object.assign(range, {
//       min: Math.min(a, c),
//       minInclusive: b,
//       max: Math.max(a, c as number),
//       maxInclusive: d as boolean,
//     })
//   }
//
//   return range
// }
//
// export function isRange(value: unknown): value is Range {
//   return isRecordOrArray(value) && TypeBrand in value
// }
//
// export function includes(range: Range, value: number): boolean {
//   if (range.minInclusive) {
//     if (value < range.min) {
//       return false
//     }
//   } else if (value <= range.min) {
//     return false
//   }
//
//   if (range.maxInclusive) {
//     if (value > range.max) {
//       return false
//     }
//   } else if (value >= range.max) {
//     return false
//   }
//
//   return true
// }
//
// export function add(a: Range, b: Range): Range {
//   return range(
//     a.min + b.min,
//     a.minInclusive && b.minInclusive,
//     a.max + b.max,
//     a.maxInclusive && b.maxInclusive,
//   )
// }
//
// export function size(range: Range): number {
//   return range.max - range.min
// }
//
// export function offset(range: Range): number {
//   return Math.min(Math.abs(range.min), Math.abs(range.max))
// }
//
// export function max(a: Range, b: Range): Range {
//   const sizeA = size(a)
//   const sizeB = size(b)
//
//   if (sizeA < sizeB) {
//     return b
//   }
//   if (sizeB > sizeA) {
//     return a
//   }
//
//   if (a.minInclusive && !b.minInclusive) {
//     return a
//   }
//   if (b.minInclusive && !a.minInclusive) {
//     return b
//   }
//
//   if (a.maxInclusive && !b.maxInclusive) {
//     return a
//   }
//   if (b.maxInclusive && !a.maxInclusive) {
//     return b
//   }
//
//   return a
// }
//
// export const unit = range(1, 1)
// export const zero = range(0, 0)
