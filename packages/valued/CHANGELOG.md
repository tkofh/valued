# valued

## 0.5.0

### Minor Changes

- 1be8c61: Add `allOf.struct` and `someOf.struct`, object forms of the two order-independent combinators. Each takes an object mapping field names to parsers and yields an object with the same keys, each holding that field's value — `null` for an omitted `someOf.struct` field.

  Because the key and its parser are written together, there is no positional list of names to keep aligned with a result tuple, and — since these combinators match in any order — declaration order carries no meaning to lose.

  ```ts
  import { allOf, parse } from 'valued'
  import { keyword } from 'valued/data/keyword'
  import { length } from 'valued/data/length'

  const bg = allOf.struct({ attachment: keyword('fixed'), size: length() })

  const result = parse('fixed 10px', bg)
  if (result.valid) {
    result.value.attachment // KeywordValue<'fixed'>
    result.value.size // LengthValue
  }

  parse('10px fixed', bg) // the same object — order-independent
  ```

  The value type is exported as `AllOfStructValue` / `SomeOfStructValue`.

- 1931509: Reorganize the public entry points around a single grammar toolkit at the package root.

  `parse`, every combinator (`oneOf`, `juxtapose`, `allOf`, `someOf`), and every multiplier (`optional`, `oneOrMore`, `zeroOrMore`, `exactly`, `between`) — along with their `*Input` / `*Value` type helpers and the core `Parser` / `ParserInput` / `ParserValue` / `ParseResult` types — are now exported from `valued` itself. Building a parser no longer means one import per operator.

  ```ts
  import { parse, someOf, optional } from 'valued'
  import { length } from 'valued/data/length'
  ```

  **Breaking:** the `valued/combinators/*` and `valued/multipliers/*` subpaths are removed; import these from `valued` instead. Data types are unchanged — they stay on their granular `valued/data/*` subpaths so importing `length` never pulls in the `colorjs.io` dependency behind `color`. `valued/equals` and `valued/vue` are also unchanged.

  Declare package `sideEffects` so bundlers can tree-shake unused data types, while preserving `data/color`'s load-time color-space registration.

- 1be8c61: Add `keyword.text` and `keywords.text`, keyword parsers that yield the matched identifier as a bare string instead of a `KeywordValue` wrapper. They are shortcuts for `map(keyword(...), (v) => v.value)`, so the grammar is unchanged — only the parsed value is the string itself.

  This keeps a string-typed grammar string-typed end to end. Assembling a value from `.text` parsers produces plain strings, and tuples of strings through `allOf` / `juxtapose`, with no per-site unwrapping.

  ```ts
  import { allOf, map, oneOf, parse } from 'valued'
  import { keywords } from 'valued/data/keyword'

  const align = oneOf([
    map(keywords.text(['top', 'right', 'bottom', 'left', 'center']), (k) => {
      switch (k) {
        case 'center':
          return ['center', 'center'] as const
        case 'top':
        case 'bottom':
          return [k, 'center'] as const
        case 'left':
        case 'right':
          return ['center', k] as const
      }
    }),
    allOf([
      keywords.text(['top', 'center', 'bottom']),
      keywords.text(['left', 'right']),
    ]),
    allOf([
      keywords.text(['top', 'bottom']),
      keywords.text(['left', 'center', 'right']),
    ]),
  ])

  const result = parse('top left', align)
  if (result.valid) {
    const [y, x] = result.value // ['top', 'left'] — plain strings
  }
  ```

- 1be8c61: Add `map`, a value transformer exported from `valued`. It reshapes the value a parser yields while leaving the grammar it accepts unchanged, and infers the result type from the mapping function — so the runtime transform and its type stay a single source of truth.

  Unlike the combinators, `map` is not a Value Definition Syntax operator; it opens a new category of mappers alongside them. Its most common use is normalizing a value whose shape depends on which alternative matched. A position-style grammar yields a bare keyword for `center` but a tuple for `top left`; mapping both to a fixed `[vertical, horizontal]` pair lets a caller destructure the result unconditionally.

  ```ts
  import { allOf, map, oneOf, parse } from 'valued'
  import { isKeywordValue, keywords, keywordValue } from 'valued/data/keyword'

  const align = map(
    oneOf([
      keywords(['top', 'right', 'bottom', 'left', 'center']),
      allOf([
        keywords(['top', 'center', 'bottom']),
        keywords(['left', 'right']),
      ]),
      allOf([
        keywords(['top', 'bottom']),
        keywords(['left', 'center', 'right']),
      ]),
    ]),
    (value) => {
      if (!isKeywordValue(value)) return value
      const k = value.value
      if (k === 'left' || k === 'right')
        return [keywordValue('center'), keywordValue(k)]
      if (k === 'top' || k === 'bottom')
        return [keywordValue(k), keywordValue('center')]
      return [keywordValue('center'), keywordValue('center')]
    },
  )

  const result = parse('top', align)
  if (result.valid) {
    const [y, x] = result.value // always a [vertical, horizontal] pair
  }
  ```

  The mapping function must be pure — a mapped parser nested in a combinator has its value read repeatedly during a parse — and must not return `undefined`, which a parser uses to signal an incomplete match.

- 1931509: Remove five niche keyword-set data types whose value didn't justify a public export: `valued/data/absolute-size`, `valued/data/relative-size`, `valued/data/overflow`, `valued/data/generic-family`, and `valued/data/blend-mode`.

  Each was a single `keywords([...])` call you can inline directly. If you relied on one, rebuild it with `keywords([...])` from `valued/data/keyword` — for example:

  ```ts
  import { keywords } from 'valued/data/keyword'

  const blendMode = () =>
    keywords([
      'normal',
      'multiply',
      'screen',
      'overlay',
      'darken',
      'lighten' /* … */,
    ])
  ```

  The fixed keyword lists for each are in the CSS spec (`<blend-mode>`, `<generic-family>`, etc.). Composed grammars (`color-interpolation-method`, `hue-interpolation-method`, `display`, `position`) and every numeric/dimension/color primitive are unchanged.

### Patch Changes

- 1be8c61: Stop `allOf`, `someOf`, and `oneOf` from deduplicating operands by instance identity. Each operand is now kept as its own slot, matching `juxtapose`.

  Parsers are stateless — all parse state is threaded externally — so the same parser instance is safe to reuse anywhere in a tree. The identity dedup broke that for sibling operands: `allOf([k, k])` collapsed to a single slot (and typically failed to parse), while `allOf([fresh, fresh])` with an identical grammar succeeded, so behavior depended on whether an instance was reused rather than on the grammar. Reusing a shared parser now behaves the same as constructing an equivalent one inline. Nested `allOf` / `someOf` are still flattened into their parent, as before.

- 422de8f: Fix `between` and `exactly` accepting one match beyond `maxLength` in the space-separated case, so `between(p, { minLength, maxLength })` and `exactly(p, n)` now reject inputs longer than their bound. The comma-separated path was already correct.

  Fix `integer()` rejecting whole numbers with magnitude `2 ** 31` or greater; the range is now checked with `Number.isInteger` instead of a 32-bit truncation.

  Keep generated input types from overflowing TypeScript's union limit. Repeating or combining a wide-input parser (`between(length(), { minLength: 1, maxLength: 4 })`, `juxtapose([length(), length(), length()])`, and similar) previously errored with `TS2590`. Narrow keyword grammars keep their exact input types; wider ones stay bounded by falling back to a form that still autocompletes a single value plus `string & {}` — `between` / `exactly` / `juxtapose` to the element's own input, `allOf` / `someOf` to the union of every element's input. Declaration output shrinks as a result.

  Add JSDoc across the public API — `parse`, the combinators, multipliers, data types, and the `equals` / `vue` entry points — with verified examples and documented contracts.

## 0.4.9

### Patch Changes

- 5029cbd: Move releases to the Changesets GitHub Action with npm trusted publishing (no functional changes)

## 0.4.8

### Patch Changes

- b06d427: add `useValued` Vue composable at `valued/vue`. preserves referential identity across structurally equal parses, supports `defaultValue` and `holdOnError` for failure handling. `vue` is declared as an optional peer dependency
- b06d427: add `valuedEqual` for structural equality of parsed values, available at `valued/equals`
- f60ea22: add toString() for all data types

## 0.4.7

### Patch Changes

- 489bf01: convert all data types to functions

## 0.4.6

### Patch Changes

- f5d3298: fix number parsing in lists

## 0.4.5

### Patch Changes

- 820316c: fix parsing bug for colors

## 0.4.4

### Patch Changes

- separate imports for all multipliers and combinators to help with type portability
- fix value type for `someOf` to include `null` as an option for each parser

## 0.4.3

### Patch Changes

- export juxtapose from ratio

## 0.4.2

### Patch Changes

- 28d2000: filter out `never` values from juxtapose value
- 28d2000: add dedicated ratio value

## 0.4.1

### Patch Changes

- fix juxtapose value type

## 0.4.0

### Minor Changes

- overhaul value and input types
- remove `parse()` method from `Parser` interface

## 0.3.2

### Patch Changes

- d2af0e0: improve types for combinators and improve type performance slightly for multipliers where the `Input` type could immediately be set to `string`

## 0.3.1

### Patch Changes

- c71d78e: export input, value and result types for parsers

## 0.3.0

### Minor Changes

- 2e45fba: added a `keywords` shortcut to improve authoring and performance of multiple keywords in a `oneOf()` combinator
- c980304: add `normalized` to `AngleValue` so that angle calculations can be avoided
- d870bc5: add `length.subset()` which takes an array of `LengthUnit`s (but does not need to be the complete list). this helps focus on using "sane" units for different scenarios in which `<length>` applies
- 79a934e: all parsers now have input types, for giving type information about which values are acceptable to the parser.

## 0.2.0

### Minor Changes

- f608f0a: fix a bunch of parser bugs related to combinators
- f608f0a: add more css data types, update exports

## 0.1.0

### Minor Changes

- implement basic data, combinator, and multiplier apis
