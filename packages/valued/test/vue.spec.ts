import { describe, expect, test, vi } from 'vitest'
import { effect, ref } from 'vue'
import { someOf } from '../src/combinators/someOf.ts'
import { keyword } from '../src/data/keyword.ts'
import { length } from '../src/data/length.ts'
import { useValued } from '../src/vue.ts'

describe('useValued', () => {
  test('returns parsed value for valid input', () => {
    const source = ref('10px')
    const result = useValued(source, length())
    expect(result.value?.toString()).toBe('10px')
  })

  test('returns null for invalid input by default', () => {
    const source = ref('not-a-length')
    const result = useValued(source, length())
    expect(result.value).toBeNull()
  })

  test('reacts to source changes', () => {
    const source = ref('10px')
    const result = useValued(source, length())
    expect(result.value?.toString()).toBe('10px')
    source.value = '5rem'
    expect(result.value?.toString()).toBe('5rem')
  })

  test('accepts a getter source', () => {
    const source = ref('1px')
    const result = useValued(() => source.value, length())
    expect(result.value?.toString()).toBe('1px')
    source.value = '2px'
    expect(result.value?.toString()).toBe('2px')
  })

  test('preserves referential identity across structurally equal parses', () => {
    const parser = someOf([keyword('x'), keyword('y')])
    const source = ref<'x y' | 'y x'>('x y')
    const result = useValued(source, parser)
    const first = result.value
    source.value = 'y x'
    const second = result.value
    expect(first).not.toBeNull()
    expect(second).toBe(first)
  })

  test('does not trigger effects when reordering input that parses to equal value', () => {
    const parser = someOf([keyword('x'), keyword('y')])
    const source = ref<'x y' | 'y x'>('x y')
    const result = useValued(source, parser)

    const spy = vi.fn()
    effect(() => {
      spy(result.value)
    })
    expect(spy).toHaveBeenCalledTimes(1)

    source.value = 'y x'
    expect(spy).toHaveBeenCalledTimes(1)
  })

  test('triggers effects when parsed value actually changes', () => {
    const source = ref('10px')
    const result = useValued(source, length())

    const spy = vi.fn()
    effect(() => {
      spy(result.value?.toString())
    })
    expect(spy).toHaveBeenCalledTimes(1)

    source.value = '20px'
    expect(spy).toHaveBeenCalledTimes(2)
  })

  test('defaultValue is used as fallback when input is invalid', () => {
    const source = ref('garbage')
    const result = useValued(source, length(), { defaultValue: '1rem' })
    expect(result.value?.toString()).toBe('1rem')
  })

  test('defaultValue is ignored once a valid value is produced and parse is valid', () => {
    const source = ref('garbage')
    const result = useValued(source, length(), { defaultValue: '1rem' })
    expect(result.value?.toString()).toBe('1rem')
    source.value = '10px'
    expect(result.value?.toString()).toBe('10px')
  })

  test('throws when defaultValue cannot be parsed', () => {
    expect(() =>
      useValued(ref('whatever'), length(), {
        defaultValue: 'not-a-length' as never,
      }),
    ).toThrow(/defaultValue/)
  })

  test('holdOnError retains last valid value across failures', () => {
    const source = ref<string>('10px')
    const result = useValued(source, length(), { holdOnError: true })
    expect(result.value?.toString()).toBe('10px')
    source.value = 'garbage'
    expect(result.value?.toString()).toBe('10px')
    source.value = 'still-garbage'
    expect(result.value?.toString()).toBe('10px')
    source.value = '20rem'
    expect(result.value?.toString()).toBe('20rem')
    source.value = 'oops'
    expect(result.value?.toString()).toBe('20rem')
  })

  test('holdOnError without any prior success returns null', () => {
    const source = ref('garbage')
    const result = useValued(source, length(), { holdOnError: true })
    expect(result.value).toBeNull()
  })

  test('holdOnError + defaultValue uses default until first success, then holds', () => {
    const source = ref<string>('garbage')
    const result = useValued(source, length(), {
      defaultValue: '1rem',
      holdOnError: true,
    })
    expect(result.value?.toString()).toBe('1rem')
    source.value = '10px'
    expect(result.value?.toString()).toBe('10px')
    source.value = 'garbage'
    expect(result.value?.toString()).toBe('10px')
  })

  test('without holdOnError, parse failure snaps back to defaultValue', () => {
    const source = ref<string>('10px')
    const result = useValued(source, length(), { defaultValue: '1rem' })
    expect(result.value?.toString()).toBe('10px')
    source.value = 'garbage'
    expect(result.value?.toString()).toBe('1rem')
  })

  test('parsed values type-check as the parser value type', () => {
    const source = ref('10px')
    const result = useValued(source, length())
    if (result.value !== null) {
      const v = result.value
      void v
    }
  })
})
