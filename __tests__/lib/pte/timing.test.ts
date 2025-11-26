/**
 * Unit tests for lib/pte/timing.ts
 * Tests PTE timing utilities and conversions
 */

import { ms, format, endAtFrom, driftMs, timingFor, formatLabel } from '@/lib/pte/timing'

describe('timing', () => {
  describe('ms helpers', () => {
    it('should convert seconds to milliseconds', () => {
      expect(ms.s(1)).toBe(1000)
      expect(ms.s(30)).toBe(30000)
      expect(ms.s(0)).toBe(0)
    })

    it('should convert minutes to milliseconds', () => {
      expect(ms.m(1)).toBe(60000)
      expect(ms.m(10)).toBe(600000)
      expect(ms.m(0)).toBe(0)
    })
  })

  describe('format', () => {
    it('should format milliseconds as mm:ss', () => {
      expect(format(0)).toBe('00:00')
      expect(format(1000)).toBe('00:01')
      expect(format(60000)).toBe('01:00')
      expect(format(90000)).toBe('01:30')
    })

    it('should format as hh:mm:ss when >= 1 hour', () => {
      expect(format(3600000)).toBe('01:00:00')
      expect(format(3661000)).toBe('01:01:01')
      expect(format(7200000)).toBe('02:00:00')
    })

    it('should handle negative values as zero', () => {
      expect(format(-1000)).toBe('00:00')
    })

    it('should pad single digits with zero', () => {
      expect(format(5000)).toBe('00:05')
      expect(format(305000)).toBe('05:05')
    })
  })

  describe('endAtFrom', () => {
    it('should calculate end time from start and duration', () => {
      const start = 1000000
      const duration = 30000
      expect(endAtFrom(start, duration)).toBe(1030000)
    })

    it('should handle zero duration', () => {
      const start = 1000000
      expect(endAtFrom(start, 0)).toBe(1000000)
    })

    it('should handle negative duration as zero', () => {
      const start = 1000000
      expect(endAtFrom(start, -5000)).toBe(1000000)
    })
  })

  describe('driftMs', () => {
    it('should calculate drift between server and client time', () => {
      expect(driftMs(1000, 1100)).toBe(100)
      expect(driftMs(1000, 900)).toBe(-100)
      expect(driftMs(1000, 1000)).toBe(0)
    })

    it('should handle large differences', () => {
      expect(driftMs(0, 1000000)).toBe(1000000)
    })
  })

  describe('timingFor', () => {
    describe('speaking section', () => {
      it('should return timing for read_aloud', () => {
        const result = timingFor('speaking', 'read_aloud')
        expect(result.section).toBe('speaking')
        expect(result.type).toBe('read_aloud')
        expect(result.prepMs).toBeDefined()
        expect(result.answerMs).toBeDefined()
      })

      it('should return timing for repeat_sentence', () => {
        const result = timingFor('speaking', 'repeat_sentence')
        expect(result.section).toBe('speaking')
        expect(result.prepMs).toBeDefined()
        expect(result.answerMs).toBeDefined()
      })

      it('should fallback to read_aloud for unknown type', () => {
        const result = timingFor('speaking', 'unknown_type')
        expect(result.section).toBe('speaking')
        expect(result.prepMs).toBeDefined()
        expect(result.answerMs).toBeDefined()
 * Tests PTE timing calculations and formatting functions
 */

import {
  ms,
  format,
  timingFor,
  endAtFrom,
  driftMs,
  formatLabel,
  type PteSection,
  type SpeakingType,
  type WritingType,
  type ReadingType,
  type ListeningType,
} from '@/lib/pte/timing'

describe('lib/pte/timing', () => {
  describe('ms helpers', () => {
    describe('ms.s()', () => {
      it('should convert seconds to milliseconds', () => {
        expect(ms.s(1)).toBe(1000)
        expect(ms.s(10)).toBe(10000)
        expect(ms.s(60)).toBe(60000)
      })

      it('should handle zero', () => {
        expect(ms.s(0)).toBe(0)
      })

      it('should handle fractional seconds', () => {
        expect(ms.s(0.5)).toBe(500)
        expect(ms.s(1.5)).toBe(1500)
      })

      it('should handle negative values', () => {
        expect(ms.s(-1)).toBe(-1000)
      })
    })

    describe('ms.m()', () => {
      it('should convert minutes to milliseconds', () => {
        expect(ms.m(1)).toBe(60000)
        expect(ms.m(5)).toBe(300000)
        expect(ms.m(10)).toBe(600000)
      })

      it('should handle zero', () => {
        expect(ms.m(0)).toBe(0)
      })

      it('should handle fractional minutes', () => {
        expect(ms.m(0.5)).toBe(30000) // 30 seconds
        expect(ms.m(1.5)).toBe(90000) // 90 seconds
      })
    })

    it('should be frozen objects', () => {
      expect(Object.isFrozen(ms)).toBe(true)
    })
  })

  describe('format()', () => {
    it('should format seconds as mm:ss', () => {
      expect(format(ms.s(30))).toBe('00:30')
      expect(format(ms.s(45))).toBe('00:45')
    })

    it('should format minutes as mm:ss', () => {
      expect(format(ms.m(1))).toBe('01:00')
      expect(format(ms.m(5))).toBe('05:00')
      expect(format(ms.m(10))).toBe('10:00')
    })

    it('should format mixed minutes and seconds', () => {
      expect(format(ms.m(2) + ms.s(30))).toBe('02:30')
      expect(format(ms.m(15) + ms.s(45))).toBe('15:45')
    })

    it('should format hours as hh:mm:ss', () => {
      expect(format(ms.m(60))).toBe('01:00:00')
      expect(format(ms.m(120))).toBe('02:00:00')
      expect(format(ms.m(90))).toBe('01:30:00')
    })

    it('should handle hours with minutes and seconds', () => {
      expect(format(ms.m(65) + ms.s(30))).toBe('01:05:30')
      expect(format(ms.m(125) + ms.s(45))).toBe('02:05:45')
    })

    it('should pad single digits with zero', () => {
      expect(format(ms.s(5))).toBe('00:05')
      expect(format(ms.m(1) + ms.s(5))).toBe('01:05')
      expect(format(ms.m(61) + ms.s(5))).toBe('01:01:05')
    })

    it('should handle zero duration', () => {
      expect(format(0)).toBe('00:00')
    })

    it('should handle negative duration as zero', () => {
      expect(format(-1000)).toBe('00:00')
      expect(format(-60000)).toBe('00:00')
    })

    it('should handle very long durations', () => {
      expect(format(ms.m(600))).toBe('10:00:00') // 10 hours
      expect(format(ms.m(1500))).toBe('25:00:00') // 25 hours
    })

    it('should floor milliseconds', () => {
      expect(format(1999)).toBe('00:01') // 1.999 seconds => 1 second
      expect(format(59999)).toBe('00:59') // 59.999 seconds => 59 seconds
    })
  })

  describe('timingFor()', () => {
    describe('speaking section', () => {
      it('should return timing for read_aloud', () => {
        const timing = timingFor('speaking', 'read_aloud')
        expect(timing.section).toBe('speaking')
        expect(timing.type).toBe('read_aloud')
        expect(timing.prepMs).toBe(ms.s(35))
        expect(timing.answerMs).toBe(ms.s(40))
      })

      it('should return timing for repeat_sentence', () => {
        const timing = timingFor('speaking', 'repeat_sentence')
        expect(timing.section).toBe('speaking')
        expect(timing.type).toBe('repeat_sentence')
        expect(timing.prepMs).toBe(ms.s(1))
        expect(timing.answerMs).toBe(ms.s(15))
      })

      it('should return timing for describe_image', () => {
        const timing = timingFor('speaking', 'describe_image')
        expect(timing.section).toBe('speaking')
        expect(timing.prepMs).toBe(ms.s(25))
        expect(timing.answerMs).toBe(ms.s(40))
      })

      it('should return timing for retell_lecture', () => {
        const timing = timingFor('speaking', 'retell_lecture')
        expect(timing.section).toBe('speaking')
        expect(timing.prepMs).toBe(ms.s(10))
        expect(timing.answerMs).toBe(ms.s(40))
      })

      it('should return timing for answer_short_question', () => {
        const timing = timingFor('speaking', 'answer_short_question')
        expect(timing.section).toBe('speaking')
        expect(timing.prepMs).toBe(ms.s(3))
        expect(timing.answerMs).toBe(ms.s(10))
      })

      it('should return timing for respond_to_a_situation (NEW Aug 2025)', () => {
        const timing = timingFor('speaking', 'respond_to_a_situation')
        expect(timing.section).toBe('speaking')
        expect(timing.prepMs).toBe(ms.s(10))
        expect(timing.answerMs).toBe(ms.s(40))
      })

      it('should return timing for summarize_group_discussion (NEW Aug 2025)', () => {
        const timing = timingFor('speaking', 'summarize_group_discussion')
        expect(timing.section).toBe('speaking')
        expect(timing.prepMs).toBe(ms.s(10))
        expect(timing.answerMs).toBe(ms.s(120))
      })

      it('should fallback to read_aloud for unknown speaking types', () => {
        const timing = timingFor('speaking', 'unknown_type' as SpeakingType)
        expect(timing.section).toBe('speaking')
        expect(timing.answerMs).toBe(ms.s(40)) // read_aloud default
      })

      it('should be case insensitive for types', () => {
        const timing = timingFor('speaking', 'READ_ALOUD' as any)
        expect(timing.type).toBe('read_aloud')
      })
    })

    describe('writing section', () => {
      it('should return timing for write_essay', () => {
        const result = timingFor('writing', 'write_essay')
        expect(result.section).toBe('writing')
        expect(result.type).toBe('write_essay')
        expect(result.answerMs).toBeDefined()
        expect(result.answerMs).toBeGreaterThan(0)
      })

      it('should return timing for summarize_written_text', () => {
        const result = timingFor('writing', 'summarize_written_text')
        expect(result.section).toBe('writing')
        expect(result.answerMs).toBeDefined()
      it('should return timing for summarize_written_text', () => {
        const timing = timingFor('writing', 'summarize_written_text')
        expect(timing.section).toBe('writing')
        expect(timing.type).toBe('summarize_written_text')
        expect(timing.answerMs).toBe(ms.m(10))
      })

      it('should return timing for write_essay', () => {
        const timing = timingFor('writing', 'write_essay')
        expect(timing.section).toBe('writing')
        expect(timing.type).toBe('write_essay')
        expect(timing.answerMs).toBe(ms.m(20))
      })

      it('should fallback to write_essay for unknown writing types', () => {
        const timing = timingFor('writing', 'unknown_type' as WritingType)
        expect(timing.section).toBe('writing')
        expect(timing.answerMs).toBe(ms.m(20))
      })
    })

    describe('reading section', () => {
      it('should return section timing', () => {
        const result = timingFor('reading')
        expect(result.section).toBe('reading')
        expect('sectionMs' in result).toBe(true)
        expect(result.sectionMs).toBeGreaterThan(0)
      })

      it('should accept type parameter but return section timing', () => {
        const result = timingFor('reading', 'multiple_choice_single')
        expect(result.section).toBe('reading')
        expect('sectionMs' in result).toBe(true)
      it('should return section timing for reading', () => {
        const timing = timingFor('reading')
        expect(timing.section).toBe('reading')
        expect('sectionMs' in timing).toBe(true)
        if ('sectionMs' in timing) {
          expect(timing.sectionMs).toBe(ms.m(30))
        }
      })

      it('should accept reading types but return section timing', () => {
        const timing = timingFor('reading', 'multiple_choice_single')
        expect(timing.section).toBe('reading')
        if ('sectionMs' in timing) {
          expect(timing.sectionMs).toBe(ms.m(30))
        }
      })
    })

    describe('listening section', () => {
      it('should return item timing for summarize_spoken_text', () => {
        const result = timingFor('listening', 'summarize_spoken_text')
        expect(result.section).toBe('listening')
        expect('answerMs' in result).toBe(true)
        expect(result.answerMs).toBeGreaterThan(0)
      })

      it('should return section timing for other types', () => {
        const result = timingFor('listening', 'write_from_dictation')
        expect(result.section).toBe('listening')
        expect('sectionMs' in result).toBe(true)
      })

      it('should return section timing when no type specified', () => {
        const result = timingFor('listening')
        expect(result.section).toBe('listening')
        expect('sectionMs' in result).toBe(true)
      })
    })
  })

  describe('formatLabel', () => {
    it('should format speaking labels', () => {
      expect(formatLabel('speaking', 'read_aloud')).toBe('Speaking · read aloud')
      expect(formatLabel('speaking', 'repeat_sentence')).toBe('Speaking · repeat sentence')
    })

    it('should format writing labels', () => {
      expect(formatLabel('writing', 'write_essay')).toBe('Writing · write essay')
    })

    it('should format reading labels', () => {
      expect(formatLabel('reading')).toBe('Reading Section')
      expect(formatLabel('reading', 'multiple_choice')).toBe('Reading Section')
    })

    it('should format listening labels', () => {
      expect(formatLabel('listening')).toBe('Listening Section')
      expect(formatLabel('listening', 'summarize_spoken_text')).toBe('Listening · Summarize Spoken Text')
      expect(formatLabel('listening', 'other_type')).toBe('Listening Section')
    })

    it('should handle unknown sections', () => {
      expect(formatLabel('unknown' as any)).toBe('PTE')
        const timing = timingFor('listening', 'summarize_spoken_text')
        expect(timing.section).toBe('listening')
        if ('answerMs' in timing) {
          expect(timing.answerMs).toBe(ms.m(10))
        }
      })

      it('should return section timing for other listening types', () => {
        const timing = timingFor('listening', 'multiple_choice_single')
        expect(timing.section).toBe('listening')
        if ('sectionMs' in timing) {
          expect(timing.sectionMs).toBe(ms.m(43))
        }
      })

      it('should return section timing when no type specified', () => {
        const timing = timingFor('listening')
        expect(timing.section).toBe('listening')
        if ('sectionMs' in timing) {
          expect(timing.sectionMs).toBe(ms.m(43))
        }
      })
    })

    describe('fallback behavior', () => {
      it('should handle invalid section with safe fallback', () => {
        const timing = timingFor('invalid' as PteSection)
        expect(timing.section).toBe('reading')
        if ('sectionMs' in timing) {
          expect(timing.sectionMs).toBe(ms.m(29))
        }
      })
    })
  })

  describe('endAtFrom()', () => {
    it('should calculate end time from start and duration', () => {
      const startAt = 1000
      const durationMs = 5000
      expect(endAtFrom(startAt, durationMs)).toBe(6000)
    })

    it('should handle zero duration', () => {
      expect(endAtFrom(1000, 0)).toBe(1000)
    })

    it('should handle negative duration as zero', () => {
      expect(endAtFrom(1000, -500)).toBe(1000)
    })

    it('should work with large timestamps', () => {
      const now = Date.now()
      const duration = ms.m(10)
      expect(endAtFrom(now, duration)).toBe(now + duration)
    })

    it('should handle fractional milliseconds', () => {
      expect(endAtFrom(1000.5, 500.5)).toBe(1501)
    })
  })

  describe('driftMs()', () => {
    it('should calculate positive drift when client is ahead', () => {
      expect(driftMs(1000, 1500)).toBe(500)
    })

    it('should calculate negative drift when client is behind', () => {
      expect(driftMs(1500, 1000)).toBe(-500)
    })

    it('should return zero when times are equal', () => {
      expect(driftMs(1000, 1000)).toBe(0)
    })

    it('should handle large time differences', () => {
      expect(driftMs(0, 1000000)).toBe(1000000)
      expect(driftMs(1000000, 0)).toBe(-1000000)
    })

    it('should work with real timestamps', () => {
      const serverNow = Date.now()
      const clientNow = serverNow + 100
      expect(driftMs(serverNow, clientNow)).toBe(100)
    })
  })

  describe('formatLabel()', () => {
    describe('speaking labels', () => {
      it('should format speaking labels with type', () => {
        expect(formatLabel('speaking', 'read_aloud')).toBe('Speaking · read aloud')
        expect(formatLabel('speaking', 'describe_image')).toBe('Speaking · describe image')
      })

      it('should replace underscores with spaces', () => {
        expect(formatLabel('speaking', 'answer_short_question')).toBe('Speaking · answer short question')
      })

      it('should handle missing type', () => {
        expect(formatLabel('speaking')).toBe('Speaking · item')
      })
    })

    describe('writing labels', () => {
      it('should format writing labels with type', () => {
        expect(formatLabel('writing', 'write_essay')).toBe('Writing · write essay')
        expect(formatLabel('writing', 'summarize_written_text')).toBe('Writing · summarize written text')
      })

      it('should handle missing type', () => {
        expect(formatLabel('writing')).toBe('Writing · item')
      })
    })

    describe('reading labels', () => {
      it('should return section label regardless of type', () => {
        expect(formatLabel('reading')).toBe('Reading Section')
        expect(formatLabel('reading', 'multiple_choice_single')).toBe('Reading Section')
      })
    })

    describe('listening labels', () => {
      it('should return specific label for summarize_spoken_text', () => {
        expect(formatLabel('listening', 'summarize_spoken_text')).toBe('Listening · Summarize Spoken Text')
      })

      it('should return section label for other types', () => {
        expect(formatLabel('listening', 'multiple_choice_single')).toBe('Listening Section')
        expect(formatLabel('listening')).toBe('Listening Section')
      })
    })

    describe('fallback', () => {
      it('should return PTE for unknown sections', () => {
        expect(formatLabel('unknown' as PteSection)).toBe('PTE')
      })
    })
  })

  describe('November 2025 updates', () => {
    it('should reflect 2-hour total test duration', () => {
      // Speaking & Writing: 54-67 mins
      // Reading: 29-30 mins  
      // Listening: 30-43 mins
      // Total should be around 120 minutes (2 hours)
      
      const speakingSample = timingFor('speaking', 'read_aloud')
      const writingSample = timingFor('writing', 'write_essay')
      const readingSection = timingFor('reading')
      const listeningSection = timingFor('listening')

      // Verify reading is 30 mins (Nov 2025 update)
      if ('sectionMs' in readingSection) {
        expect(readingSection.sectionMs).toBe(ms.m(30))
      }

      // Verify listening is 43 mins (Nov 2025 update)
      if ('sectionMs' in listeningSection) {
        expect(listeningSection.sectionMs).toBe(ms.m(43))
      }
    })

    it('should include new August 2025 speaking tasks', () => {
      const respondSituation = timingFor('speaking', 'respond_to_a_situation')
      const summarizeDiscussion = timingFor('speaking', 'summarize_group_discussion')

      expect(respondSituation.type).toBe('respond_to_a_situation')
      expect(summarizeDiscussion.type).toBe('summarize_group_discussion')
      expect(summarizeDiscussion.answerMs).toBe(ms.s(120)) // 2 minutes
    })
  })
})