// import { FULL, NOT_SATISFIED, type Parser, type ParserState } from '../parser'
// import type { Token } from '../tokenizer'
// import { unorderedGroup } from './unofderedGroup'
//
// const TypeBrand: unique symbol = Symbol('combinator/allOf')
//
// type ExtractParserValues<T extends ReadonlyArray<unknown>> = {
//   [K in keyof T]: T[K] extends Parser<infer U> ? U | null : never
// }
//
// class AllOf<Parsers extends ReadonlyArray<Parser<unknown>>>
//   implements Parser<ExtractParserValues<Parsers>>
// {
//   readonly [TypeBrand] = TypeBrand
//
//   readonly domain!: ReadonlySet<string>
//   readonly parsers!: ReadonlySet<Parser<unknown>>
//
//   #finished: Set<Parsers[number]> = new Set()
//   #locked: Parsers[number] | null = null
//
//   get state(): ParserState {
//     if (this.#finished.size === this.parsers.size) {
//       return FULL
//     }
//
//     return NOT_SATISFIED
//   }
//
//   constructor(parsers: Parsers) {
//     if (parsers.length === 0) {
//       throw new TypeError('allOf() parser must have at least one parser')
//     }
//
//     const group = unorderedGroup(parsers, TypeBrand)
//     this.domain = group.domain
//     this.parsers = group.parsers
//   }
//
//   feed(token: Token): boolean {
//     if (this.#locked !== null) {
//       const tokenConsumed = this.#locked.feed(token)
//
//       if (tokenConsumed) {
//         if (this.#locked.state === FULL) {
//           this.#finished.add(this.#locked)
//           this.#locked = null
//         }
//
//         return true
//       }
//     }
//
//     for (const parser of this.parsers) {
//       if (this.#finished.has(parser)) {
//         continue
//       }
//
//       const tokenConsumed = parser.feed(token)
//
//       if (tokenConsumed) {
//         if (parser.state === FULL) {
//           this.#finished.add(parser)
//         } else {
//           this.#locked = parser
//         }
//
//         return true
//       }
//     }
//
//     return false
//   }
// }
