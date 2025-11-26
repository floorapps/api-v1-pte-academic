/**
 * Unit tests for lib/pte/scoring-deterministic.ts
 * Tests deterministic scoring algorithms for PTE tasks
 */

// Mock server-only module
jest.mock('server-only', () => ({}))

import {
  scoreReadingMCQSingle,
  scoreReadingMCQMultiple,
  scoreReadingFillInBlanks,
  scoreReadingReorderParagraphs,
  scoreListeningWriteFromDictation,
  type MCQSinglePayload,
  type MCQMultiplePayload,
  type FillBlanksPayload,
  type ReorderParagraphsPayload,
  type WriteFromDictationPayload,
} from '@/lib/pte/scoring-deterministic'

describe('lib/pte/scoring-deterministic', () => {
  describe('scoreReadingMCQSingle()', () => {
    it('should return perfect score for correct answer', () => {
      const payload: MCQSinglePayload = {
        selectedOption: 'A',
        correctOption: 'A',
      }
      const result = scoreReadingMCQSingle(payload)
      expect(result.overall).toBe(90)
      expect(result.subscores.correctness).toBe(90)
      expect(result.rationale).toContain('matches')
    })

    it('should return zero score for incorrect answer', () => {
      const payload: MCQSinglePayload = {
        selectedOption: 'B',
        correctOption: 'A',
      }
      const result = scoreReadingMCQSingle(payload)
      expect(result.overall).toBe(0)
      expect(result.subscores.correctness).toBe(0)
      expect(result.rationale).toContain('does not match')
    })

    it('should be case insensitive', () => {
      const payload: MCQSinglePayload = {
        selectedOption: 'option a',
        correctOption: 'Option A',
      }
      const result = scoreReadingMCQSingle(payload)
      expect(result.overall).toBe(90)
    })

    it('should normalize whitespace', () => {
      const payload: MCQSinglePayload = {
        selectedOption: '  Option   A  ',
        correctOption: 'Option A',
      }
      const result = scoreReadingMCQSingle(payload)
      expect(result.overall).toBe(90)
    })

    it('should handle special characters', () => {
      const payload: MCQSinglePayload = {
        selectedOption: 'Option-A!',
        correctOption: 'Option A',
      }
      const result = scoreReadingMCQSingle(payload)
      expect(result.overall).toBe(90)
    })

    it('should have correct metadata', () => {
      const payload: MCQSinglePayload = {
        selectedOption: 'A',
        correctOption: 'A',
      }
      const result = scoreReadingMCQSingle(payload)
      expect(result.metadata?.provider).toBe('deterministic')
      expect(result.metadata?.task).toBe('READING_MCQ_SINGLE')
    })
  })

  describe('scoreReadingMCQMultiple()', () => {
    it('should return perfect score when all correct options selected', () => {
      const payload: MCQMultiplePayload = {
        selectedOptions: ['A', 'B', 'C'],
        correctOptions: ['A', 'B', 'C'],
      }
      const result = scoreReadingMCQMultiple(payload)
      expect(result.overall).toBe(90)
      expect(result.subscores.correctness).toBe(90)
    })

    it('should calculate partial credit correctly', () => {
      const payload: MCQMultiplePayload = {
        selectedOptions: ['A', 'B'], // 2 selected, both correct
        correctOptions: ['A', 'B', 'C'], // 3 correct total
      }
      const result = scoreReadingMCQMultiple(payload)
      // accuracy = (TP - FP) / |Correct| = (2 - 0) / 3 = 0.667
      expect(result.subscores.correctness).toBeCloseTo(60, 0)
    })

    it('should penalize false positives', () => {
      const payload: MCQMultiplePayload = {
        selectedOptions: ['A', 'B', 'D'], // D is wrong
        correctOptions: ['A', 'B', 'C'],
      }
      const result = scoreReadingMCQMultiple(payload)
      // accuracy = (2 - 1) / 3 = 1/3 = 0.333
      expect(result.subscores.correctness).toBeCloseTo(30, 0)
    })

    it('should return zero for more wrong than right', () => {
      const payload: MCQMultiplePayload = {
        selectedOptions: ['D', 'E', 'F'], // All wrong
        correctOptions: ['A', 'B', 'C'],
      }
      const result = scoreReadingMCQMultiple(payload)
      // accuracy = max(0, (0 - 3) / 3) = 0
      expect(result.overall).toBe(0)
    })

    it('should handle case with one correct option', () => {
      const payload: MCQMultiplePayload = {
        selectedOptions: ['A'],
        correctOptions: ['A'],
      }
      const result = scoreReadingMCQMultiple(payload)
      expect(result.overall).toBe(90)
    })

    it('should handle empty selections', () => {
      const payload: MCQMultiplePayload = {
        selectedOptions: [],
        correctOptions: ['A', 'B'],
      }
      const result = scoreReadingMCQMultiple(payload)
      // accuracy = (0 - 0) / 2 = 0
      expect(result.overall).toBe(0)
    })

    it('should be case insensitive', () => {
      const payload: MCQMultiplePayload = {
        selectedOptions: ['option a', 'OPTION B'],
        correctOptions: ['Option A', 'Option B'],
      }
      const result = scoreReadingMCQMultiple(payload)
      expect(result.overall).toBe(90)
    })

    it('should include metadata with TP/FP counts', () => {
      const payload: MCQMultiplePayload = {
        selectedOptions: ['A', 'B', 'D'],
        correctOptions: ['A', 'B', 'C'],
      }
      const result = scoreReadingMCQMultiple(payload)
      expect(result.metadata?.tp).toBe(2)
      expect(result.metadata?.fp).toBe(1)
      expect(result.metadata?.correctCount).toBe(3)
    })
  })

  describe('scoreReadingFillInBlanks()', () => {
    it('should score all correct blanks as perfect', () => {
      const payload: FillBlanksPayload = {
        answers: { '1': 'cat', '2': 'dog', '3': 'bird' },
        correct: { '1': 'cat', '2': 'dog', '3': 'bird' },
      }
      const result = scoreReadingFillInBlanks(payload)
      expect(result.overall).toBe(90)
      expect(result.rationale).toContain('3/3')
    })

    it('should calculate partial credit for some correct', () => {
      const payload: FillBlanksPayload = {
        answers: { '1': 'cat', '2': 'fish', '3': 'bird' },
        correct: { '1': 'cat', '2': 'dog', '3': 'bird' },
      }
      const result = scoreReadingFillInBlanks(payload)
      // 2 out of 3 correct = 0.667
      expect(result.subscores.correctness).toBeCloseTo(60, 0)
      expect(result.rationale).toContain('2/3')
    })

    it('should handle all incorrect answers', () => {
      const payload: FillBlanksPayload = {
        answers: { '1': 'wrong', '2': 'wrong', '3': 'wrong' },
        correct: { '1': 'cat', '2': 'dog', '3': 'bird' },
      }
      const result = scoreReadingFillInBlanks(payload)
      expect(result.overall).toBe(0)
      expect(result.rationale).toContain('0/3')
    })

    it('should handle missing answers', () => {
      const payload: FillBlanksPayload = {
        answers: { '1': 'cat' }, // Missing 2 and 3
        correct: { '1': 'cat', '2': 'dog', '3': 'bird' },
      }
      const result = scoreReadingFillInBlanks(payload)
      // 1 out of 3 correct
      expect(result.subscores.correctness).toBeCloseTo(30, 0)
    })

    it('should be case insensitive', () => {
      const payload: FillBlanksPayload = {
        answers: { '1': 'CAT', '2': 'Dog' },
        correct: { '1': 'cat', '2': 'dog' },
      }
      const result = scoreReadingFillInBlanks(payload)
      expect(result.overall).toBe(90)
    })

    it('should normalize whitespace', () => {
      const payload: FillBlanksPayload = {
        answers: { '1': '  cat  ', '2': 'dog   ' },
        correct: { '1': 'cat', '2': 'dog' },
      }
      const result = scoreReadingFillInBlanks(payload)
      expect(result.overall).toBe(90)
    })

    it('should include wrong answers in metadata', () => {
      const payload: FillBlanksPayload = {
        answers: { '1': 'cat', '2': 'fish' },
        correct: { '1': 'cat', '2': 'dog' },
      }
      const result = scoreReadingFillInBlanks(payload)
      expect(result.metadata?.wrong).toHaveLength(1)
      expect(result.metadata?.wrong[0].key).toBe('2')
      expect(result.metadata?.wrong[0].user).toBe('fish')
      expect(result.metadata?.wrong[0].expected).toBe('dog')
    })
  })

  describe('scoreReadingReorderParagraphs()', () => {
    it('should score perfect order as 100%', () => {
      const payload: ReorderParagraphsPayload = {
        userOrder: [1, 2, 3, 4],
        correctOrder: [1, 2, 3, 4],
      }
      const result = scoreReadingReorderParagraphs(payload)
      expect(result.overall).toBe(90)
    })

    it('should calculate pairwise accuracy', () => {
      const payload: ReorderParagraphsPayload = {
        userOrder: [1, 3, 2, 4], // 3 and 2 are swapped
        correctOrder: [1, 2, 3, 4],
      }
      const result = scoreReadingReorderParagraphs(payload)
      // 6 total pairs, pairs with 2-3 inverted
      // Correct pairs: (1,2), (1,3), (1,4), (3,4), (2,4) = 5/6
      // Should be around 75 (5/6 * 90)
      expect(result.subscores.correctness).toBeGreaterThan(65)
      expect(result.subscores.correctness).toBeLessThan(80)
    })

    it('should handle completely reversed order', () => {
      const payload: ReorderParagraphsPayload = {
        userOrder: [4, 3, 2, 1],
        correctOrder: [1, 2, 3, 4],
      }
      const result = scoreReadingReorderParagraphs(payload)
      // All pairs are inverted = 0/6
      expect(result.overall).toBe(0)
    })

    it('should handle single paragraph', () => {
      const payload: ReorderParagraphsPayload = {
        userOrder: [1],
        correctOrder: [1],
      }
      const result = scoreReadingReorderParagraphs(payload)
      expect(result.overall).toBe(90)
      expect(result.rationale).toContain('trivially correct')
    })

    it('should handle empty arrays', () => {
      const payload: ReorderParagraphsPayload = {
        userOrder: [],
        correctOrder: [],
      }
      const result = scoreReadingReorderParagraphs(payload)
      expect(result.overall).toBe(0)
    })

    it('should include pair counts in metadata', () => {
      const payload: ReorderParagraphsPayload = {
        userOrder: [1, 2, 3],
        correctOrder: [1, 2, 3],
      }
      const result = scoreReadingReorderParagraphs(payload)
      expect(result.metadata?.pairs).toBe(3) // C(3,2) = 3 pairs
      expect(result.metadata?.correctPairs).toBe(3)
    })
  })

  describe('scoreListeningWriteFromDictation()', () => {
    it('should score perfect transcription as 90', () => {
      const payload: WriteFromDictationPayload = {
        targetText: 'The quick brown fox',
        userText: 'The quick brown fox',
      }
      const result = scoreListeningWriteFromDictation(payload)
      expect(result.overall).toBe(90)
      expect(result.subscores.wer).toBe(90) // WER 0 => 90
    })

    it('should calculate WER for substitutions', () => {
      const payload: WriteFromDictationPayload = {
        targetText: 'The quick brown fox',
        userText: 'The slow brown fox',
      }
      const result = scoreListeningWriteFromDictation(payload)
      // WER = 1/4 = 0.25
      // Score should be around 67.5 (90 - 0.25*60 = 75)
      expect(result.subscores.wer).toBeGreaterThan(60)
      expect(result.subscores.wer).toBeLessThan(80)
    })

    it('should penalize insertions', () => {
      const payload: WriteFromDictationPayload = {
        targetText: 'The quick fox',
        userText: 'The very quick fox',
      }
      const result = scoreListeningWriteFromDictation(payload)
      // WER = 1/3 = 0.33
      expect(result.subscores.wer).toBeGreaterThan(50)
      expect(result.subscores.wer).toBeLessThan(70)
    })

    it('should penalize deletions', () => {
      const payload: WriteFromDictationPayload = {
        targetText: 'The quick brown fox',
        userText: 'The quick fox',
      }
      const result = scoreListeningWriteFromDictation(payload)
      // WER = 1/4 = 0.25
      expect(result.subscores.wer).toBeGreaterThan(60)
    })

    it('should handle empty user text', () => {
      const payload: WriteFromDictationPayload = {
        targetText: 'The quick brown fox',
        userText: '',
      }
      const result = scoreListeningWriteFromDictation(payload)
      // WER = 4/4 = 1.0, score should be 30
      expect(result.subscores.wer).toBe(30)
    })

    it('should handle empty target text', () => {
      const payload: WriteFromDictationPayload = {
        targetText: '',
        userText: 'Some text',
      }
      const result = scoreListeningWriteFromDictation(payload)
      // WER = infinity, but score should be floored at 0
      expect(result.overall).toBe(0)
    })

    it('should be case insensitive', () => {
      const payload: WriteFromDictationPayload = {
        targetText: 'The Quick Brown Fox',
        userText: 'the quick brown fox',
      }
      const result = scoreListeningWriteFromDictation(payload)
      expect(result.overall).toBe(90)
    })

    it('should normalize punctuation', () => {
      const payload: WriteFromDictationPayload = {
        targetText: 'Hello, world!',
        userText: 'Hello world',
      }
      const result = scoreListeningWriteFromDictation(payload)
      expect(result.overall).toBe(90)
    })

    it('should include WER and edit distance in metadata', () => {
      const payload: WriteFromDictationPayload = {
        targetText: 'The quick brown fox',
        userText: 'The slow brown fox',
      }
      const result = scoreListeningWriteFromDictation(payload)
      expect(result.metadata?.refLen).toBe(4)
      expect(result.metadata?.edits).toBe(1)
    })
  })

  describe('integration scenarios', () => {
    it('should handle mixed accuracy and performance scenarios', () => {
      // Simulate a realistic reading test with mixed results
      const mcqSingle = scoreReadingMCQSingle({
        selectedOption: 'A',
        correctOption: 'A',
      })
      
      const mcqMultiple = scoreReadingMCQMultiple({
        selectedOptions: ['A', 'B'],
        correctOptions: ['A', 'B', 'C'],
      })
      
      const fillBlanks = scoreReadingFillInBlanks({
        answers: { '1': 'cat', '2': 'dog' },
        correct: { '1': 'cat', '2': 'dog', '3': 'bird' },
      })

      expect(mcqSingle.overall).toBe(90)
      expect(mcqMultiple.overall).toBeGreaterThan(50)
      expect(fillBlanks.overall).toBeGreaterThan(50)
    })

    it('should maintain consistency across similar inputs', () => {
      const result1 = scoreReadingMCQSingle({
        selectedOption: 'A',
        correctOption: 'A',
      })
      
      const result2 = scoreReadingMCQSingle({
        selectedOption: 'a',
        correctOption: 'A',
      })
      
      expect(result1.overall).toBe(result2.overall)
    })
  })
})