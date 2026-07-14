---
'valued': minor
---

Add `allOf.struct` and `someOf.struct`, object forms of the two order-independent combinators. Each takes an object mapping field names to parsers and yields an object with the same keys, each holding that field's value — `null` for an omitted `someOf.struct` field.

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
