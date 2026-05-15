import { juxtapose } from '../combinators/juxtapose.ts'
import { keywords } from './keyword.ts'

export const hueInterpolationMethod = () =>
  juxtapose([
    keywords(['shorter', 'longer', 'increasing', 'decreasing']),
    'hue',
  ])
