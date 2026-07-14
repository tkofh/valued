---
'valued': patch
---

Fix `between` and `exactly` accepting one match beyond `maxLength` in the space-separated case, so `between(p, { minLength, maxLength })` and `exactly(p, n)` now reject inputs longer than their bound. The comma-separated path was already correct.

Fix `integer()` rejecting whole numbers with magnitude `2 ** 31` or greater; the range is now checked with `Number.isInteger` instead of a 32-bit truncation.

Keep generated input types from overflowing TypeScript's union limit. Repeating or combining a wide-input parser (`between(length(), { minLength: 1, maxLength: 4 })`, `juxtapose([length(), length(), length()])`, and similar) previously errored with `TS2590`. Narrow keyword grammars keep their exact input types; wider ones stay bounded by falling back to a form that still autocompletes a single value plus `string & {}` — `between` / `exactly` / `juxtapose` to the element's own input, `allOf` / `someOf` to the union of every element's input. Declaration output shrinks as a result.

Add JSDoc across the public API — `parse`, the combinators, multipliers, data types, and the `equals` / `vue` entry points — with verified examples and documented contracts.
