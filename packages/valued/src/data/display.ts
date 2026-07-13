import { allOf } from '../combinators/allOf.ts'
import { optional } from '../multipliers/optional.ts'
import { keyword, keywords } from './keyword.ts'

/**
 * Parse a CSS
 * [`<display-box>`](https://www.w3.org/TR/css-display-3/#typedef-display-box)
 * keyword — `none` or `contents`.
 *
 * @returns a parser yielding the matched {@link KeywordValue}
 */
export const displayBox = () => keywords(['none', 'contents'])

/**
 * Parse a CSS
 * [`<display-inside>`](https://www.w3.org/TR/css-display-3/#typedef-display-inside)
 * keyword — the inner layout model: `flow`, `flow-root`, `table`, `flex`,
 * `grid`, or `ruby`.
 *
 * @returns a parser yielding the matched {@link KeywordValue}
 */
export const displayInside = () =>
  keywords(['flow', 'flow-root', 'table', 'flex', 'grid', 'ruby'])

/**
 * Parse a CSS
 * [`<display-internal>`](https://www.w3.org/TR/css-display-3/#typedef-display-internal)
 * keyword — an internal table or ruby layout role such as `table-row` or
 * `ruby-base`.
 *
 * @returns a parser yielding the matched {@link KeywordValue}
 */
export const displayInternal = () =>
  keywords([
    'table-row-group',
    'table-header-group',
    'table-footer-group',
    'table-row',
    'table-cell',
    'table-column-group',
    'table-column',
    'table-caption',
    'ruby-base',
    'ruby-text',
    'ruby-base-container',
    'ruby-text-container',
  ])

/**
 * Parse a CSS
 * [`<display-legacy>`](https://www.w3.org/TR/css-display-3/#typedef-display-legacy)
 * keyword — a legacy single-keyword form: `inline-block`, `inline-table`,
 * `inline-flex`, or `inline-grid`.
 *
 * @returns a parser yielding the matched {@link KeywordValue}
 */
export const displayLegacy = () =>
  keywords(['inline-block', 'inline-table', 'inline-flex', 'inline-grid'])

/**
 * Parse a CSS
 * [`<display-outside>`](https://www.w3.org/TR/css-display-3/#typedef-display-outside)
 * keyword — the outer role: `block`, `inline`, or `run-in`.
 *
 * @returns a parser yielding the matched {@link KeywordValue}
 */
export const displayOutside = () => keywords(['block', 'inline', 'run-in'])

/**
 * Parse the CSS
 * [`<display-listitem>`](https://www.w3.org/TR/css-display-3/#typedef-display-listitem)
 * form — `list-item` with an optional {@link displayOutside} keyword and an
 * optional `flow` / `flow-root`, in any order.
 *
 * Backed by {@link allOf}, so the result is a tuple: the outside keyword or
 * `null`, the flow keyword or `null`, then the `list-item` keyword.
 *
 * @returns a parser matching the `list-item` display form
 *
 * @example
 * ```ts
 * parse('list-item', displayListitem())        // [null, null, KeywordValue<'list-item'>]
 * parse('block flow list-item', displayListitem()) // three KeywordValues
 * ```
 */
export const displayListitem = () =>
  allOf([
    optional(displayOutside()),
    optional(keywords(['flow', 'flow-root'])),
    keyword('list-item'),
  ])
