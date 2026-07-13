---
'valued': patch
---

Fix `between` and `exactly` accepting one match beyond `maxLength` in the space-separated case, so `between(p, { minLength, maxLength })` and `exactly(p, n)` now reject inputs longer than their bound. The comma-separated path was already correct.

Fix `integer()` rejecting whole numbers with magnitude `2 ** 31` or greater; the range is now checked with `Number.isInteger` instead of a 32-bit truncation.

Add JSDoc across the public API — `parse`, the combinators, multipliers, data types, and the `equals` / `vue` entry points — with verified examples and documented contracts.
