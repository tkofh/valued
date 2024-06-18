import { oneOf } from '../combinators'
import { keyword } from './keyword'

export const genericFamily = oneOf([
  keyword('serif'),
  keyword('sans-serif'),
  keyword('monospace'),
  keyword('cursive'),
  keyword('fantasy'),
  keyword('system-ui'),
  keyword('ui-serif'),
  keyword('ui-sans-serif'),
  keyword('ui-monospace'),
  keyword('ui-rounded'),
  keyword('emoji'),
  keyword('math'),
  keyword('fangsong'),
])
