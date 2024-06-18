import { allOf, juxtapose, oneOf } from '../combinators'
import { keyword } from './keyword'
import { lengthPercentage } from './length-percentage'

export const position = oneOf([
  keyword('left'),
  keyword('center'),
  keyword('right'),
  keyword('top'),
  keyword('bottom'),
  lengthPercentage(),
  allOf([
    oneOf([keyword('left'), keyword('center'), keyword('right')]),
    oneOf([keyword('top'), keyword('center'), keyword('bottom')]),
  ]),
  juxtapose([
    oneOf([
      keyword('left'),
      keyword('center'),
      keyword('right'),
      lengthPercentage(),
    ]),
    oneOf([
      keyword('top'),
      keyword('center'),
      keyword('bottom'),
      lengthPercentage(),
    ]),
  ]),
  allOf([
    juxtapose([oneOf([keyword('left'), keyword('right')]), lengthPercentage()]),
    juxtapose([oneOf([keyword('top'), keyword('bottom')]), lengthPercentage()]),
  ]),
])
