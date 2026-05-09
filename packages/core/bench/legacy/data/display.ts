import { allOf } from '../combinators/allOf'
import { optional } from '../multipliers/optional'
import { keyword, keywords } from './keyword'

export const displayBox = () => keywords(['none', 'contents'])

export const displayInside = () =>
  keywords(['flow', 'flow-root', 'table', 'flex', 'grid', 'ruby'])

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

export const displayLegacy = () =>
  keywords(['inline-block', 'inline-table', 'inline-flex', 'inline-grid'])

export const displayOutside = () => keywords(['block', 'inline', 'run-in'])

export const displayListitem = () =>
  allOf([
    optional(displayOutside()),
    optional(keywords(['flow', 'flow-root'])),
    keyword('list-item'),
  ])
