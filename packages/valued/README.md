# valued

`valued` parses strings as CSS values. You compose parsers from combinators named after the operators in the [W3C CSS Value Definition Syntax](https://www.w3.org/TR/css-values-4/#value-defs), so a parser reads close to how the spec writes the grammar.

```ts
// border: <line-width> || <line-style> || <color>
const border = someOf([length(), lineStyle(), color()])
```

A `parse()` call against that combinator is typed in two directions:

- The **output** is a typed structure, so you never walk a generic AST. Here that's `[LengthValue, LineStyleValue, ColorValue]`, with `null` for each part `someOf` lets you omit.
- The **input** is a template literal type, so your editor autocompletes keyword-heavy grammars from inside the `parse()` call.

## Install

```sh
npm install valued
```

## The basic shape

Build a parser and hand it to `parse()` with the input. The result is a discriminated union: `{ valid: false }` or `{ valid: true, value }`.

```ts
import { parse } from 'valued'
import { length } from 'valued/data/length'

const parser = length()
const result = parse('12px', parser)

if (result.valid) {
  result.value.value // 12
  result.value.unit // 'px'
}
```

## Combinators

Each combinator corresponds to an operator in the CSS grammar. Import them — along with the multipliers below and `parse` itself — from the package root:

```ts
import {
  parse,
  oneOf,
  juxtapose,
  allOf,
  someOf,
  optional,
  between,
} from 'valued'
```

### `oneOf` — `|`

Exactly one of the alternatives matches.

```ts
// auto | <length>
const widthish = oneOf([keyword('auto'), length()])

parse('auto', widthish) // KeywordValue<'auto'>
parse('12px', widthish) // LengthValue<'px'>
```

### `juxtapose` — sequence

Parsers match in order, separated by spaces.

```ts
// <length> <length>
const point = juxtapose([length(), length()])

parse('10px 20px', point) // [LengthValue, LengthValue]
```

A sequence can also include string literals. They participate in the input but drop out of the output:

```ts
// <length> / <length>
const ratio = juxtapose([length(), '/', length()])

parse('16px / 24px', ratio) // [LengthValue, LengthValue]
```

### `allOf` — `&&`

Every parser must match, in any order.

```ts
// <color> && <length>
const colorAndLength = allOf([color(), length()])

parse('red 12px', colorAndLength) // [ColorValue, LengthValue]
parse('12px red', colorAndLength) // [ColorValue, LengthValue]
```

### `someOf` — `||`

At least one parser must match, in any order. The others can be omitted.

```ts
// <line-width> || <line-style> || <color>
const border = someOf([length(), lineStyle(), color()])

parse('1px solid red', border) // [LengthValue, LineStyleValue, ColorValue]
parse('solid red', border) // [null, LineStyleValue, ColorValue]
parse('solid', border) // [null, LineStyleValue, null]
parse('red', border) // [null, null, ColorValue]
```

## Multipliers

Multipliers wrap a parser and let it match repeatedly.

```ts
optional(parser) // <parser>?
oneOrMore(parser) // <parser>+
zeroOrMore(parser) // <parser>*
exactly(parser, n) // <parser>{n}
between(parser, { minLength, maxLength }) // <parser>{n,m}
```

`oneOrMore` and `between` accept a `commaSeparated: true` option for the `#` variants from the spec.

```ts
// padding: <length>{1,4}
const padding = between(length(), { minLength: 1, maxLength: 4 })

parse('10px', padding) // [LengthValue]
parse('10px 20px 10px 20px', padding) // [LengthValue, LengthValue, LengthValue, LengthValue]
```

## Data types

Each data type lives at its own subpath, so you only pay for what you import — pulling in `length` never drags along the `colorjs.io` dependency that sits behind `color`.

### Building blocks

| Import                    | Spec                              |
| ------------------------- | --------------------------------- |
| `valued/data/keyword`     | `keyword(...)`, `keywords([...])` |
| `valued/data/number`      | `<number>`                        |
| `valued/data/integer`     | `<integer>`                       |
| `valued/data/percentage`  | `<percentage>`                    |
| `valued/data/alpha-value` | `<alpha-value>`                   |
| `valued/data/ratio`       | `<ratio>`                         |
| `valued/data/flex`        | `<flex>`                          |

### Dimensions

| Import                             | Spec                     |
| ---------------------------------- | ------------------------ |
| `valued/data/dimension`            | `<dimension>`            |
| `valued/data/length`               | `<length>`               |
| `valued/data/length-percentage`    | `<length-percentage>`    |
| `valued/data/angle`                | `<angle>`                |
| `valued/data/angle-percentage`     | `<angle-percentage>`     |
| `valued/data/frequency`            | `<frequency>`            |
| `valued/data/frequency-percentage` | `<frequency-percentage>` |

### Color

| Import                                   | Spec                           |
| ---------------------------------------- | ------------------------------ |
| `valued/data/color`                      | `<color>`                      |
| `valued/data/hue`                        | `<hue>`                        |
| `valued/data/hue-interpolation-method`   | `<hue-interpolation-method>`   |
| `valued/data/color-interpolation-method` | `<color-interpolation-method>` |

### Keyword sets

Prebuilt `keywords([...])` for specific properties. Reach for one, or roll your own with `keywords([...])` from `valued/data/keyword`.

| Import                       | Spec               |
| ---------------------------- | ------------------ |
| `valued/data/absolute-size`  | `<absolute-size>`  |
| `valued/data/relative-size`  | `<relative-size>`  |
| `valued/data/generic-family` | `<generic-family>` |
| `valued/data/blend-mode`     | `<blend-mode>`     |
| `valued/data/line-style`     | `<line-style>`     |
| `valued/data/display`        | `<display>`        |
| `valued/data/overflow`       | `<overflow>`       |

### Composite grammars

| Import                 | Spec         |
| ---------------------- | ------------ |
| `valued/data/position` | `<position>` |

Numeric data types accept `min` / `max` (or `minValue` / `maxValue` for dimensions) to constrain the accepted range. `length` and `lengthPercentage` expose a `.subset([...])` helper for restricting the accepted units.

```ts
length({ minValue: 0 }) // non-negative
length.subset(['px', 'rem']) // px or rem only
number({ min: 0, max: 1 }) // 0..1
keywords(['start', 'end', 'center']) // a fixed set
```

## Result and types

```ts
type ParseResult<T> = { valid: false } | { valid: true; value: T }
```

`parse()` accepts a parser of any input/output type and returns its `ParseResult`. The type helpers `ParserInput<P>` and `ParserValue<P>` extract a parser's input and output types if you want to expose them on a public API.

```ts
import type { ParserInput, ParserValue } from 'valued'

type BorderInput = ParserInput<typeof border>
type BorderValue = ParserValue<typeof border>
```

## License

MIT
