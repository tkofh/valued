import { keywords } from './keyword.ts'

/**
 * Parse a CSS
 * [`<generic-family>`](https://www.w3.org/TR/css-fonts-4/#generic-family-value)
 * keyword — a generic font family such as `serif`, `sans-serif`, `monospace`,
 * `system-ui`, or `emoji`.
 *
 * @returns a parser yielding the matched {@link KeywordValue}
 *
 * @example
 * ```ts
 * parse('sans-serif', genericFamily()) // KeywordValue<'sans-serif'>
 * ```
 */
export const genericFamily = () =>
  keywords([
    'serif',
    'sans-serif',
    'monospace',
    'cursive',
    'fantasy',
    'system-ui',
    'ui-serif',
    'ui-sans-serif',
    'ui-monospace',
    'ui-rounded',
    'emoji',
    'math',
    'fangsong',
  ])
