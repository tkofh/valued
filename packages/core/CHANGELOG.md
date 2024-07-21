# valued

## 0.4.4

### Patch Changes

- separate imports for all multipliers and combinators to help with type portability
- fix value type for `someOf` to include `null` as an option for each parser

## 0.4.3

### Patch Changes

- export juxtapose from ratio

## 0.4.2

### Patch Changes

- 28d2000: filter out `never` values from juxtapose value
- 28d2000: add dedicated ratio value

## 0.4.1

### Patch Changes

- fix juxtapose value type

## 0.4.0

### Minor Changes

- overhaul value and input types
- remove `parse()` method from `Parser` interface

## 0.3.2

### Patch Changes

- d2af0e0: improve types for combinators and improve type performance slightly for multipliers where the `Input` type could immediately be set to `string`

## 0.3.1

### Patch Changes

- c71d78e: export input, value and result types for parsers

## 0.3.0

### Minor Changes

- 2e45fba: added a `keywords` shortcut to improve authoring and performance of multiple keywords in a `oneOf()` combinator
- c980304: add `normalized` to `AngleValue` so that angle calculations can be avoided
- d870bc5: add `length.subset()` which takes an array of `LengthUnit`s (but does not need to be the complete list). this helps focus on using "sane" units for different scenarios in which `<length>` applies
- 79a934e: all parsers now have input types, for giving type information about which values are acceptable to the parser.

## 0.2.0

### Minor Changes

- f608f0a: fix a bunch of parser bugs related to combinators
- f608f0a: add more css data types, update exports

## 0.1.0

### Minor Changes

- implement basic data, combinator, and multiplier apis
