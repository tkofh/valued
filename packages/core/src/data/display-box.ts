import { oneOf } from '../combinators'
import { keyword } from './keyword'

export const displayBox = oneOf([keyword('none'), keyword('contents')])
