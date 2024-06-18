import { allOf, oneOf } from '../combinators'
import { optional } from '../multipliers/optional'
import { keyword } from './keyword'

export const displayBox = oneOf([keyword('none'), keyword('contents')])

export const displayInside = oneOf([
  keyword('flow'),
  keyword('flow-root'),
  keyword('table'),
  keyword('flex'),
  keyword('grid'),
  keyword('ruby'),
])

export const displayInternal = oneOf([
  keyword('table-row-group'),
  keyword('table-header-group'),
  keyword('table-footer-group'),
  keyword('table-row'),
  keyword('table-cell'),
  keyword('table-column-group'),
  keyword('table-column'),
  keyword('table-caption'),
  keyword('ruby-base'),
  keyword('ruby-text'),
  keyword('ruby-base-container'),
  keyword('ruby-text-container'),
])

export const displayLegacy = oneOf([
  keyword('inline-block'),
  keyword('inline-table'),
  keyword('inline-flex'),
  keyword('inline-grid'),
])

export const displayOutside = oneOf([
  keyword('block'),
  keyword('inline'),
  keyword('run-in'),
])

export const displayListitem = allOf([
  optional(displayOutside),
  optional(oneOf([keyword('flow'), keyword('flow-root')])),
  keyword('list-item'),
])
