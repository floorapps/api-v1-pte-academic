/**
 * Tests for useToast hook
 */

import { renderHook, act } from '@testing-library/react'
import { useToast } from '../use-toast'

describe('useToast', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useToast())
    act(() => result.current.dismiss())
  })

  describe('Toast Creation', () => {
    it('creates a toast with title', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({ title: 'Test' })
      })
      
      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].title).toBe('Test')
    })

    it('creates toast with description', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({ title: 'Title', description: 'Description' })
      })
      
      expect(result.current.toasts[0].description).toBe('Description')
    })

    it('auto-generates unique IDs', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({ title: 'Toast 1' })
        result.current.toast({ title: 'Toast 2' })
      })
      
      const ids = result.current.toasts.map(t => t.id)
      expect(new Set(ids).size).toBe(2)
    })

    it('respects TOAST_LIMIT', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({ title: 'Toast 1' })
        result.current.toast({ title: 'Toast 2' })
      })
      
      // TOAST_LIMIT is 1 in the implementation
      expect(result.current.toasts.length).toBeLessThanOrEqual(1)
    })
  })

  describe('Toast Dismissal', () => {
    it('dismisses specific toast by ID', () => {
      const { result } = renderHook(() => useToast())
      
      let toastId: string
      act(() => {
        const t = result.current.toast({ title: 'Test' })
        toastId = t.id
      })
      
      act(() => {
        result.current.dismiss(toastId)
      })
      
      // Toast should be marked as closed (open: false)
      const toast = result.current.toasts.find(t => t.id === toastId)
      expect(toast?.open).toBe(false)
    })

    it('dismisses all toasts when no ID provided', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({ title: 'Test 1' })
      })
      
      act(() => {
        result.current.dismiss()
      })
      
      result.current.toasts.forEach(toast => {
        expect(toast.open).toBe(false)
      })
    })

    it('handles dismissing non-existent toast gracefully', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({ title: 'Existing' })
      })
      
      expect(() => {
        act(() => {
          result.current.dismiss('non-existent-id')
        })
      }).not.toThrow()
    })
  })

  describe('Toast Duration', () => {
    it('sets custom duration', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({ title: 'Test', duration: 5000 })
      })
      
      expect(result.current.toasts[0].duration).toBe(5000)
    })

    it('supports infinite duration', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({ title: 'Test', duration: Infinity })
      })
      
      expect(result.current.toasts[0].duration).toBe(Infinity)
    })
  })

  describe('Toast Variants', () => {
    it('creates default variant toast', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({ title: 'Test' })
      })
      
      expect(result.current.toasts[0]).toBeDefined()
    })

    it('creates destructive variant toast', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({ title: 'Error', variant: 'destructive' })
      })
      
      expect(result.current.toasts[0].variant).toBe('destructive')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty title', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({ title: '', description: 'Desc' })
      })
      
      expect(result.current.toasts).toHaveLength(1)
    })

    it('handles very long titles', () => {
      const { result } = renderHook(() => useToast())
      const longTitle = 'A'.repeat(1000)
      
      act(() => {
        result.current.toast({ title: longTitle })
      })
      
      expect(result.current.toasts[0].title).toBe(longTitle)
    })

    it('handles special characters', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({ title: '<script>alert("xss")</script>' })
      })
      
      expect(result.current.toasts).toHaveLength(1)
    })

    it('handles unicode', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({ title: '你好世界 🌍' })
      })
      
      expect(result.current.toasts[0].title).toBe('你好世界 🌍')
    })
  })

  describe('Memory Management', () => {
    it('cleans up on unmount', () => {
      const { result, unmount } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({ title: 'Test' })
      })
      
      expect(() => unmount()).not.toThrow()
    })
  })
})