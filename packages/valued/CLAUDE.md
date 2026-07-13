# valued

`valued` parses strings as CSS values. Parsers are composed from combinators
named after the operators in the [W3C CSS Value Definition
Syntax](https://www.w3.org/TR/css-values-4/#value-defs).

## Documentation

The declared reader for doc comments in this package. Calibrate every doc
comment to this profile rather than to your own familiarity with the code.

**Audience.** A consumer of the published `valued` npm package, concentrated
in UI component and design-system development — the audience the library is
advertised to. They reach for `valued` to parse and validate CSS values inside
a component library or design system: checking a style prop, normalizing a
design token, narrowing an accepted value set. They meet each export one
symbol at a time, through a hover tooltip or an autocomplete popup at a subpath
import (`valued`, `valued/data/length`, `valued/combinators/someOf`, …), not by
reading the module around it.

**Expertise.**

- _Proficient in TypeScript,_ including generics and template-literal types —
  the public API exposes `ParserInput<P>` / `ParserValue<P>` and infers
  accepted input as template literals. Don't gloss TypeScript.
- _Familiar with CSS and the [Value Definition
  Syntax](https://www.w3.org/TR/css-values-4/#value-defs), not expert in it._
  They know what a production like `<length-percentage>` denotes and roughly
  what `|`, `||`, `&&`, juxtaposition, `?`, `+`, `*`, `{n,m}`, and `#` mean,
  but have not memorized the spec. Name the operator or production a factory
  corresponds to, gloss it in a few words where that meaning is load-bearing,
  and link the spec for the rest — don't reproduce the grammar, and don't
  assume mastery of its edge cases.
- _Not the audience for parser internals._ The streaming protocol (`init` /
  `feed` / `read`, the token stream, branch state) is irrelevant to this
  reader. Keep it out of consumer-facing docs entirely; it lives in inline
  comments in the internal modules, for maintainers.

**Delivery.** Doc comments render in editor hovers and on generated docs
pages, extracted from the module. The first sentence must identify the symbol
on its own (teleport test). Prefer a verified `@example` — this is a
compositional library and a call is often clearer than a paragraph.

### Conventions

- **Tags.** JSDoc: `@param`, `@returns`, `@throws`, `@example`, `{@link}` for
  cross-references. No `@since` — this repo does not use it; never introduce
  it. Versioning is tracked with Changesets, not doc tags.
- **Examples are verified by execution.** `tsx` runs TypeScript directly
  against `src`; a scratch script that imports from `./src/...` and calls
  `parse()` settles behavior and checks every example before it ships. A probe
  that pins a contract no test covers should be promoted into `test/`.
- **Published surface.** Every file under `src` is reachable through the
  `exports` map in `package.json`, so its exports — factory functions, value
  constructors (`lengthValue`), type guards (`isLengthValue`), and the
  `*Value` / `*Parser` / `*Input` types — are all public hover surfaces. A
  doc-comment change to any of them ships to consumers: record substantive
  changes with a Changeset like any other public change.
- **Data-type module shape.** Most `data/*` modules export a parser factory
  (`length()`), a value constructor (`lengthValue()`), a type guard
  (`isLengthValue()`), and the value/parser/input types. The factory carries
  the module's primary doc (what CSS production it parses, options, an
  example); companion exports get shorter blocks stating what each is for.
- **Actual behavior over intended contract.** When execution shows the code
  doing something other than the types or the name promise, the doc describes
  what the code does today and the gap is flagged for a fix — never paper over
  it.
