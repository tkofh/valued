import { juxtapose } from '../combinators/juxtapose'
import { keywords } from './keyword'

export const hueInterpolationMethod = juxtapose([
  keywords(['shorter', 'longer', 'increasing', 'decreasing']),
  'hue',
])
