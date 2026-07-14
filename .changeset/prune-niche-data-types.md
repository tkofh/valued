---
'valued': minor
---

Remove five niche keyword-set data types whose value didn't justify a public export: `valued/data/absolute-size`, `valued/data/relative-size`, `valued/data/overflow`, `valued/data/generic-family`, and `valued/data/blend-mode`.

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
