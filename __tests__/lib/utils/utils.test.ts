/**
 * Unit tests for lib/utils.ts
 * Tests the cn() utility function for className merging
 */

import { cn } from '@/lib/utils'

describe('lib/utils', () => {
  describe('cn()', () => {
    it('should merge class names correctly', () => {
      const result = cn('foo', 'bar')
      expect(result).toContain('foo')
      expect(result).toContain('bar')
    })

    it('should handle conditional class names', () => {
      const result = cn('foo', false && 'bar', 'baz')
      expect(result).toContain('foo')
      expect(result).not.toContain('bar')
      expect(result).toContain('baz')
    })

    it('should merge Tailwind classes correctly (tw-merge)', () => {
      // tw-merge should prioritize later classes
      const result = cn('px-2', 'px-4')
      expect(result).toBe('px-4')
    })

    it('should handle conflicting Tailwind classes', () => {
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500')
    })

    it('should handle arrays of class names', () => {
      const result = cn(['foo', 'bar'], 'baz')
      expect(result).toContain('foo')
      expect(result).toContain('bar')
      expect(result).toContain('baz')
    })

    it('should handle objects with boolean values', () => {
      const result = cn({
        foo: true,
        bar: false,
        baz: true,
      })
      expect(result).toContain('foo')
      expect(result).not.toContain('bar')
      expect(result).toContain('baz')
    })

    it('should handle undefined and null values', () => {
      const result = cn('foo', undefined, null, 'bar')
      expect(result).toContain('foo')
      expect(result).toContain('bar')
    })

    it('should handle empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle complex nested conditions', () => {
      const isActive = true
      const isDisabled = false
      const result = cn(
        'base-class',
        isActive && 'active-class',
        isDisabled && 'disabled-class',
        { 'conditional-class': true }
      )
      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
      expect(result).not.toContain('disabled-class')
      expect(result).toContain('conditional-class')
    })

    it('should handle responsive Tailwind classes', () => {
      const result = cn('sm:px-2 md:px-4 lg:px-6')
      expect(result).toContain('sm:px-2')
      expect(result).toContain('md:px-4')
      expect(result).toContain('lg:px-6')
    })

    it('should deduplicate identical classes', () => {
      const result = cn('foo', 'foo', 'bar')
      const classes = result.split(' ')
      const fooCount = classes.filter(c => c === 'foo').length
      expect(fooCount).toBe(1)
    })
  })
})