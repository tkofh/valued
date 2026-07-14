// Verifying the `map` doc example runs as written (src-relative imports).
import { allOf, map, oneOf, parse } from './index.ts'
import { keywords } from './data/keyword.ts'

type Vertical = 'top' | 'center' | 'bottom'
type Horizontal = 'left' | 'center' | 'right'

const align = oneOf([
  map(
    keywords.text(['top', 'right', 'bottom', 'left', 'center']),
    (value): [Vertical, Horizontal] => {
      switch (value) {
        case 'center':
          return [value, value]
        case 'top':
        case 'bottom':
          return [value, 'center']
        case 'left':
        case 'right':
          return ['center', value]
      }
    },
  ),
  allOf([keywords(['top', 'center', 'bottom']), keywords(['left', 'right'])]),
  allOf([keywords(['top', 'bottom']), keywords(['left', 'center', 'right'])]),
])

const result = parse('top', align)
if (result.valid) {
  const [y, x] = result.value
  console.log(y, x) // top center
}
