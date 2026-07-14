---
'valued': minor
---

Add `keyword.text` and `keywords.text`, keyword parsers that yield the matched identifier as a bare string instead of a `KeywordValue` wrapper. They are shortcuts for `map(keyword(...), (v) => v.value)`, so the grammar is unchanged — only the parsed value is the string itself.

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
