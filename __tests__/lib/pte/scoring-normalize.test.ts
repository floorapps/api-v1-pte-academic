/**
 * Unit tests for lib/pte/scoring-normalize.ts
 * Tests scoring normalization, scaling, and utility functions
 */

import {
  clampTo90,
  scaleTo90,
  accuracyTo90,
  werTo90,
  weightedOverall,
  normalizeSubscores,
  toTestSection,
  RUBRIC_KEYS,
} from '@/lib/pte/scoring-normalize'
import { TestSection } from '@/lib/pte/types'

describe('lib/pte/scoring-normalize', () => {
  describe('clampTo90()', () => {
    it('should clamp values to 0-90 range', () => {
      expect(clampTo90(50)).toBe(50)
      expect(clampTo90(0)).toBe(0)
      expect(clampTo90(90)).toBe(90)
    })

    it('should clamp negative values to 0', () => {
      expect(clampTo90(-10)).toBe(0)
      expect(clampTo90(-100)).toBe(0)
    })

    it('should clamp values above 90', () => {
      expect(clampTo90(100)).toBe(90)
      expect(clampTo90(150)).toBe(90)
    })

    it('should round values', () => {
      expect(clampTo90(45.4)).toBe(45)
      expect(clampTo90(45.5)).toBe(46)
      expect(clampTo90(45.9)).toBe(46)
    })

    it('should handle infinity as 0', () => {
      expect(clampTo90(Infinity)).toBe(0)
      expect(clampTo90(-Infinity)).toBe(0)
    })

    it('should handle NaN as 0', () => {
      expect(clampTo90(NaN)).toBe(0)
    })
  })

  describe('scaleTo90()', () => {
    it('should scale values from arbitrary range to 0-90', () => {
      expect(scaleTo90(50, 0, 100)).toBe(45) // 50% of 90
      expect(scaleTo90(0, 0, 100)).toBe(0)
      expect(scaleTo90(100, 0, 100)).toBe(90)
    })

    it('should handle min value', () => {
      expect(scaleTo90(25, 25, 75)).toBe(0)
    })

    it('should handle max value', () => {
      expect(scaleTo90(75, 25, 75)).toBe(90)
    })

    it('should handle midpoint', () => {
      expect(scaleTo90(50, 0, 100)).toBe(45)
      expect(scaleTo90(50, 25, 75)).toBe(45)
    })

    it('should handle negative ranges', () => {
      expect(scaleTo90(-50, -100, 0)).toBe(45)
      expect(scaleTo90(0, -100, 0)).toBe(90)
    })

    it('should clamp values outside range', () => {
      expect(scaleTo90(150, 0, 100)).toBe(90)
      expect(scaleTo90(-50, 0, 100)).toBe(0)
    })

    it('should handle equal min/max by clamping', () => {
      expect(scaleTo90(50, 50, 50)).toBe(50)
    })

    it('should handle non-finite values', () => {
      expect(scaleTo90(NaN, 0, 100)).toBe(0)
      expect(scaleTo90(Infinity, 0, 100)).toBe(0)
    })

    it('should handle decimal ranges', () => {
      expect(scaleTo90(0.5, 0, 1)).toBe(45)
      expect(scaleTo90(0.75, 0, 1)).toBe(68)
    })
  })

  describe('accuracyTo90()', () => {
    describe('fraction mode (0-1)', () => {
      it('should convert accuracy to 0-90 scale', () => {
        expect(accuracyTo90(1.0)).toBe(90)
        expect(accuracyTo90(0.5)).toBe(45)
        expect(accuracyTo90(0.0)).toBe(0)
      })

      it('should handle decimal accuracies', () => {
        expect(accuracyTo90(0.75)).toBe(68)
        expect(accuracyTo90(0.25)).toBe(23)
      })

      it('should clamp values above 1.0', () => {
        expect(accuracyTo90(1.5)).toBe(90)
        expect(accuracyTo90(2.0)).toBe(90)
      })

      it('should handle negative accuracy as 0', () => {
        expect(accuracyTo90(-0.5)).toBe(0)
      })
    })

    describe('percentage mode (0-100)', () => {
      it('should convert percentages to 0-90 scale', () => {
        expect(accuracyTo90(100, true)).toBe(90)
        expect(accuracyTo90(50, true)).toBe(45)
        expect(accuracyTo90(0, true)).toBe(0)
      })

      it('should handle decimal percentages', () => {
        expect(accuracyTo90(75, true)).toBe(68)
        expect(accuracyTo90(25, true)).toBe(23)
      })

      it('should clamp percentages above 100', () => {
        expect(accuracyTo90(150, true)).toBe(90)
      })
    })
  })

  describe('werTo90()', () => {
    it('should convert WER 0.0 (perfect) to 90', () => {
      expect(werTo90(0.0)).toBe(90)
    })

    it('should convert WER 0.5 to approximately 60', () => {
      expect(werTo90(0.5)).toBe(60)
    })

    it('should convert WER 1.0 to approximately 30', () => {
      expect(werTo90(1.0)).toBe(30)
    })

    it('should handle WER values above 1.0 with additional penalty', () => {
      const score15 = werTo90(1.5)
      const score20 = werTo90(2.0)
      expect(score15).toBeLessThan(30)
      expect(score20).toBeLessThan(score15)
    })

    it('should handle negative WER as 0 WER (perfect score)', () => {
      expect(werTo90(-0.5)).toBe(90)
    })

    it('should handle non-finite WER', () => {
      expect(werTo90(NaN)).toBe(0)
      expect(werTo90(Infinity)).toBe(0)
    })

    it('should be monotonically decreasing', () => {
      // Higher WER should yield lower scores
      expect(werTo90(0.0)).toBeGreaterThan(werTo90(0.25))
      expect(werTo90(0.25)).toBeGreaterThan(werTo90(0.5))
      expect(werTo90(0.5)).toBeGreaterThan(werTo90(0.75))
      expect(werTo90(0.75)).toBeGreaterThan(werTo90(1.0))
    })

    it('should handle very small WER values', () => {
      expect(werTo90(0.01)).toBeGreaterThan(85)
      expect(werTo90(0.05)).toBeGreaterThan(80)
    })

    it('should floor score at 0 for extreme WER', () => {
      expect(werTo90(10)).toBe(0)
      expect(werTo90(100)).toBe(0)
    })
  })

  describe('weightedOverall()', () => {
    it('should calculate weighted average', () => {
      const subscores = { a: 90, b: 60, c: 30 }
      const weights = { a: 0.5, b: 0.3, c: 0.2 }
      // (90*0.5 + 60*0.3 + 30*0.2) = 45 + 18 + 6 = 69
      expect(weightedOverall(subscores, weights)).toBe(69)
    })

    it('should use equal weights when no weights provided', () => {
      const subscores = { a: 90, b: 60, c: 30 }
      // (90 + 60 + 30) / 3 = 60
      expect(weightedOverall(subscores)).toBe(60)
    })

    it('should handle single subscore', () => {
      expect(weightedOverall({ a: 75 })).toBe(75)
    })

    it('should return 0 for empty subscores', () => {
      expect(weightedOverall({})).toBe(0)
    })

    it('should ignore negative weights', () => {
      const subscores = { a: 90, b: 60 }
      const weights = { a: 0.5, b: -0.5 }
      // Only 'a' should count: 90 * 0.5 / 0.5 = 90
      expect(weightedOverall(subscores, weights)).toBe(90)
    })

    it('should handle zero sum weights by falling back to equal weights', () => {
      const subscores = { a: 90, b: 60 }
      const weights = { a: 0, b: 0 }
      // Falls back to (90 + 60) / 2 = 75
      expect(weightedOverall(subscores, weights)).toBe(75)
    })

    it('should handle missing weights for some keys', () => {
      const subscores = { a: 90, b: 60, c: 30 }
      const weights = { a: 0.5, b: 0.5 } // c is missing
      // c gets 0 weight: (90*0.5 + 60*0.5 + 30*0) / 1.0 = 75
      expect(weightedOverall(subscores, weights)).toBe(75)
    })

    it('should clamp result to 0-90', () => {
      const subscores = { a: 90, b: 90, c: 90 }
      expect(weightedOverall(subscores)).toBe(90)
    })

    it('should handle undefined subscores', () => {
      const subscores = { a: 90, b: undefined as any, c: 60 }
      // Should treat undefined as 0
      expect(weightedOverall(subscores)).toBe(50) // (90 + 0 + 60) / 3
    })
  })

  describe('normalizeSubscores()', () => {
    it('should normalize subscores in 0-90 range', () => {
      const raw = { a: 45, b: 60, c: 90 }
      const result = normalizeSubscores(raw)
      expect(result).toEqual({ a: 45, b: 60, c: 90 })
    })

    it('should scale subscores from 0-100 to 0-90', () => {
      const raw = { a: 50, b: 100 }
      const result = normalizeSubscores(raw)
      expect(result).toEqual({ a: 45, b: 90 })
    })

    it('should use custom scalers when provided', () => {
      const raw = { a: 5, b: 10 }
      const scalers = {
        a: { min: 0, max: 10 },
        b: { min: 0, max: 20 },
      }
      const result = normalizeSubscores(raw, scalers)
      expect(result.a).toBe(45) // 5/10 * 90 = 45
      expect(result.b).toBe(45) // 10/20 * 90 = 45
    })

    it('should ignore undefined values', () => {
      const raw = { a: 50, b: undefined, c: 70 }
      const result = normalizeSubscores(raw)
      expect(result).toEqual({ a: 45, c: 63 })
    })

    it('should ignore non-number values', () => {
      const raw = { a: 50, b: 'invalid' as any, c: 70 }
      const result = normalizeSubscores(raw)
      expect(result).toEqual({ a: 45, c: 63 })
    })

    it('should handle empty object', () => {
      const result = normalizeSubscores({})
      expect(result).toEqual({})
    })

    it('should apply different scalers to different dimensions', () => {
      const raw = { content: 80, fluency: 4 }
      const scalers = {
        content: { min: 0, max: 100 },
        fluency: { min: 1, max: 5 },
      }
      const result = normalizeSubscores(raw, scalers)
      expect(result.content).toBe(72) // 80/100 * 90
      expect(result.fluency).toBe(68) // (4-1)/(5-1) * 90 = 67.5 => 68
    })
  })

  describe('toTestSection()', () => {
    it('should convert "speaking" to SPEAKING', () => {
      expect(toTestSection('speaking')).toBe(TestSection.SPEAKING)
      expect(toTestSection('SPEAKING')).toBe(TestSection.SPEAKING)
      expect(toTestSection('speak')).toBe(TestSection.SPEAKING)
    })

    it('should convert "writing" to WRITING', () => {
      expect(toTestSection('writing')).toBe(TestSection.WRITING)
      expect(toTestSection('WRITING')).toBe(TestSection.WRITING)
      expect(toTestSection('writ')).toBe(TestSection.WRITING)
    })

    it('should convert "reading" to READING', () => {
      expect(toTestSection('reading')).toBe(TestSection.READING)
      expect(toTestSection('READING')).toBe(TestSection.READING)
      expect(toTestSection('read')).toBe(TestSection.READING)
    })

    it('should convert "listening" to LISTENING', () => {
      expect(toTestSection('listening')).toBe(TestSection.LISTENING)
      expect(toTestSection('LISTENING')).toBe(TestSection.LISTENING)
      expect(toTestSection('listen')).toBe(TestSection.LISTENING)
    })

    it('should be case insensitive', () => {
      expect(toTestSection('SpEaKiNg')).toBe(TestSection.SPEAKING)
      expect(toTestSection('wRiTiNg')).toBe(TestSection.WRITING)
    })

    it('should fallback to READING for unknown sections', () => {
      expect(toTestSection('unknown')).toBe(TestSection.READING)
      expect(toTestSection('invalid')).toBe(TestSection.READING)
      expect(toTestSection('')).toBe(TestSection.READING)
    })
  })

  describe('RUBRIC_KEYS constant', () => {
    it('should have speaking rubric keys', () => {
      expect(RUBRIC_KEYS.speaking).toEqual([
        'content',
        'pronunciation',
        'fluency',
        'grammar',
        'vocabulary',
      ])
    })

    it('should have writing rubric keys', () => {
      expect(RUBRIC_KEYS.writing).toEqual([
        'content',
        'structure',
        'coherence',
        'grammar',
        'vocabulary',
        'spelling',
      ])
    })

    it('should have reading rubric keys', () => {
      expect(RUBRIC_KEYS.reading).toEqual(['correctness'])
    })

    it('should have listening rubric keys', () => {
      expect(RUBRIC_KEYS.listening).toEqual(['correctness', 'wer'])
    })
  })

  describe('PTE scoring scale (0-90)', () => {
    it('should use 0-90 scale consistently', () => {
      // PTE Academic uses 0-90 scale, not 0-100
      expect(clampTo90(90)).toBe(90)
      expect(clampTo90(91)).toBe(90)
      
      // Verify conversion functions maintain this
      expect(accuracyTo90(1.0)).toBe(90)
      expect(werTo90(0.0)).toBe(90)
    })

    it('should handle boundary scores correctly', () => {
      // Test boundary values
      expect(accuracyTo90(1.0)).toBe(90) // Perfect
      expect(accuracyTo90(0.0)).toBe(0)  // Zero
      expect(werTo90(0.0)).toBe(90)      // Perfect (no errors)
      expect(werTo90(1.0)).toBe(30)      // High error rate
    })
  })
})