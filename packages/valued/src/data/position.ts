import { allOf } from '../combinators/allOf.ts'
import { juxtapose } from '../combinators/juxtapose.ts'
import { oneOf } from '../combinators/oneOf.ts'
import { keywords } from './keyword.ts'
import { lengthPercentage } from './length-percentage.ts'

/**
 * Parse a CSS [`<position>`](https://www.w3.org/TR/css-values-4/#position) — a
 * place within a box, as used by properties like `background-position`.
 *
 * Accepts a single keyword (`top`, `right`, `bottom`, `left`, `center`), a
 * {@link lengthPercentage}, a two-axis pair of keywords and/or
 * length-percentages, or the four-token keyword-with-offset form such as
 * `left 10px top 20%`. The result mirrors whichever form matched — a single
 * value for the keyword and length-percentage forms, a tuple for the
 * two-axis forms.
 *
 * @returns a parser matching a CSS position
 *
 * @example
 * ```ts
 * parse('center', position())  // KeywordValue<'center'>
 * parse('left top', position()) // [KeywordValue<'left'>, KeywordValue<'top'>]
 * parse('50% 50%', position())  // [LengthPercentageValue, LengthPercentageValue]
 * ```
 */
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
