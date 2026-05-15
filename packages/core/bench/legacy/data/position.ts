import { allOf } from '../combinators/allOf.ts'
import { juxtapose } from '../combinators/juxtapose.ts'
import { oneOf } from '../combinators/oneOf.ts'
import { keywords } from './keyword.ts'
import { lengthPercentage } from './length-percentage.ts'

export const position = () =>
  oneOf([
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
