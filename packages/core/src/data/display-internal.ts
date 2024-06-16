import { oneOf } from '../combinators'
import { keyword } from './keyword'

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
