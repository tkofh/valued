---
'valued': minor
---

Add `map`, a value transformer exported from `valued`. It reshapes the value a parser yields while leaving the grammar it accepts unchanged, and infers the result type from the mapping function — so the runtime transform and its type stay a single source of truth.

Unlike the combinators, `map` is not a Value Definition Syntax operator; it opens a new category of mappers alongside them. Its most common use is normalizing a value whose shape depends on which alternative matched. A position-style grammar yields a bare keyword for `center` but a tuple for `top left`; mapping both to a fixed `[vertical, horizontal]` pair lets a caller destructure the result unconditionally.

```ts
import { allOf, map, oneOf, parse } from 'valued'
import { isKeywordValue, keywords, keywordValue } from 'valued/data/keyword'

const align = map(
  oneOf([
    keywords(['top', 'right', 'bottom', 'left', 'center']),
    allOf([keywords(['top', 'center', 'bottom']), keywords(['left', 'right'])]),
    allOf([keywords(['top', 'bottom']), keywords(['left', 'center', 'right'])]),
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
