---
'valued': patch
---

Stop `allOf`, `someOf`, and `oneOf` from deduplicating operands by instance identity. Each operand is now kept as its own slot, matching `juxtapose`.

Parsers are stateless — all parse state is threaded externally — so the same parser instance is safe to reuse anywhere in a tree. The identity dedup broke that for sibling operands: `allOf([k, k])` collapsed to a single slot (and typically failed to parse), while `allOf([fresh, fresh])` with an identical grammar succeeded, so behavior depended on whether an instance was reused rather than on the grammar. Reusing a shared parser now behaves the same as constructing an equivalent one inline. Nested `allOf` / `someOf` are still flattened into their parent, as before.
