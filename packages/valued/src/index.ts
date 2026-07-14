// The root entry point of `valued`: the `parse` driver plus the full grammar
// toolkit — every combinator and multiplier — so a parser can be assembled
// from a single `valued` import. Data types stay on their own
// `valued/data/*` subpaths (some, like `color`, pull heavier dependencies)
// and are imported from there.

export { parse } from './parse.ts'
export type { ParseResult, Parser, ParserInput, ParserValue } from './parser.ts'

// Combinators — the CSS Value Definition Syntax operators.
export { allOf } from './combinators/allOf.ts'
export type {
  AllOfInput,
  AllOfStructValue,
  AllOfValue,
} from './combinators/allOf.ts'
export { juxtapose } from './combinators/juxtapose.ts'
export type { JuxtaposeInput, JuxtaposeValue } from './combinators/juxtapose.ts'
export { oneOf } from './combinators/oneOf.ts'
export type { OneOfInput, OneOfValue } from './combinators/oneOf.ts'
export { someOf } from './combinators/someOf.ts'
export type {
  SomeOfInput,
  SomeOfStructValue,
  SomeOfValue,
} from './combinators/someOf.ts'

// Multipliers — optionality and repetition.
export { optional } from './multipliers/optional.ts'
export type { OptionalInput, OptionalValue } from './multipliers/optional.ts'
export { oneOrMore } from './multipliers/oneOrMore.ts'
export type { OneOrMoreInput, OneOrMoreValue } from './multipliers/oneOrMore.ts'
export { zeroOrMore } from './multipliers/zeroOrMore.ts'
export type {
  ZeroOrMoreInput,
  ZeroOrMoreValue,
} from './multipliers/zeroOrMore.ts'
export { exactly } from './multipliers/exactly.ts'
export type { ExactlyInput, ExactlyValue } from './multipliers/exactly.ts'
export { between } from './multipliers/between.ts'
export type { BetweenInput, BetweenValue } from './multipliers/between.ts'

// Mappers — value transformers, not Value Definition Syntax operators: they
// reshape a parser's output while leaving the grammar it accepts unchanged.
export { map } from './mappers/map.ts'
