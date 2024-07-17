import { allOf } from '../combinators/allOf'
import { juxtapose } from '../combinators/juxtapose'
import { oneOf } from '../combinators/oneOf'
import { keywords } from './keyword'
import { lengthPercentage } from './length-percentage'

export const position = oneOf([
  keywords(['top', 'right', 'bottom', 'left', 'center']),
  lengthPercentage(),
  allOf([
    keywords(['left', 'center', 'right']),
    keywords(['top', 'center', 'bottom']),
  ]),
  juxtapose([
    oneOf([keywords(['left', 'center', 'right']), lengthPercentage()]),
    oneOf([keywords(['top', 'center', 'bottom']), lengthPercentage()]),
  ]),
  allOf([
    juxtapose([keywords(['left', 'right']), lengthPercentage()]),
    juxtapose([keywords(['top', 'bottom']), lengthPercentage()]),
  ]),
])
