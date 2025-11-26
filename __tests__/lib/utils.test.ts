/**
 * Unit tests for lib/utils.ts
 * Tests general utility functions
 */

import { cn } from '@/lib/utils'

describe('utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional')).toBe('base conditional')
      expect(cn('base', false && 'conditional')).toBe('base')
    })

    it('should handle undefined and null', () => {
      expect(cn('base', undefined, null)).toBe('base')
    })

    it('should handle arrays', () => {
      expect(cn(['class1', 'class2'])).toBe('class1 class2')
    })

    it('should handle objects', () => {
      expect(cn({ class1: true, class2: false, class3: true })).toBe('class1 class3')
    })

    it('should merge Tailwind classes correctly', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
    })

    it('should handle empty inputs', () => {
      expect(cn()).toBe('')
      expect(cn('')).toBe('')
    })

    it('should handle complex combinations', () => {
      const result = cn(
        'base-class',
        true && 'conditional-class',
        { 'object-class': true },
        ['array-class']
      )
      expect(result).toContain('base-class')
      expect(result).toContain('conditional-class')
      expect(result).toContain('object-class')
      expect(result).toContain('array-class')
    })
  })
})