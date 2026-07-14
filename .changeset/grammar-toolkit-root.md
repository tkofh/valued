---
'valued': minor
---

Reorganize the public entry points around a single grammar toolkit at the package root.

`parse`, every combinator (`oneOf`, `juxtapose`, `allOf`, `someOf`), and every multiplier (`optional`, `oneOrMore`, `zeroOrMore`, `exactly`, `between`) — along with their `*Input` / `*Value` type helpers and the core `Parser` / `ParserInput` / `ParserValue` / `ParseResult` types — are now exported from `valued` itself. Building a parser no longer means one import per operator.

```ts
import { parse, someOf, optional } from 'valued'
import { length } from 'valued/data/length'
```

**Breaking:** the `valued/combinators/*` and `valued/multipliers/*` subpaths are removed; import these from `valued` instead. Data types are unchanged — they stay on their granular `valued/data/*` subpaths so importing `length` never pulls in the `colorjs.io` dependency behind `color`. `valued/equals` and `valued/vue` are also unchanged.

Declare package `sideEffects` so bundlers can tree-shake unused data types, while preserving `data/color`'s load-time color-space registration.
