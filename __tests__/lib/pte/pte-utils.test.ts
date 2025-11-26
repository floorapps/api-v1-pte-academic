/**
 * Unit tests for lib/pte/utils.ts
 * Tests pure utility functions for PTE-specific operations
 */

import { countWords, mediaKindFromUrl } from '@/lib/pte/utils'

describe('lib/pte/utils', () => {
  describe('countWords()', () => {
    it('should count words in a simple sentence', () => {
      expect(countWords('Hello world')).toBe(2)
      expect(countWords('The quick brown fox')).toBe(4)
    })

    it('should handle single word', () => {
      expect(countWords('Hello')).toBe(1)
    })

    it('should handle empty string', () => {
      expect(countWords('')).toBe(1) // split on empty returns ['']
    })

    it('should handle strings with only spaces', () => {
      expect(countWords('   ')).toBe(1)
    })

    it('should handle multiple spaces between words', () => {
      expect(countWords('Hello    world')).toBe(2)
    })

    it('should handle leading and trailing spaces', () => {
      expect(countWords('  Hello world  ')).toBe(2)
    })

    it('should handle newlines and tabs', () => {
      expect(countWords('Hello\nworld\tfoo')).toBe(3)
    })

    it('should handle mixed whitespace', () => {
      expect(countWords('  Hello  \n  world  \t  foo  ')).toBe(3)
    })

    it('should handle punctuation (counts as part of words)', () => {
      expect(countWords('Hello, world!')).toBe(2)
    })

    it('should handle numbers', () => {
      expect(countWords('There are 123 items')).toBe(4)
    })

    it('should handle hyphenated words', () => {
      expect(countWords('twenty-first century')).toBe(2)
    })

    it('should handle contractions', () => {
      expect(countWords("don't can't won't")).toBe(3)
    })

    it('should handle long text', () => {
      const longText = 'The '.repeat(100) + 'end'
      expect(countWords(longText)).toBe(101)
    })
  })

  describe('mediaKindFromUrl()', () => {
    describe('audio files', () => {
      it('should recognize .m4a files', () => {
        expect(mediaKindFromUrl('audio.m4a')).toBe('audio')
        expect(mediaKindFromUrl('/path/to/audio.m4a')).toBe('audio')
        expect(mediaKindFromUrl('https://example.com/audio.m4a')).toBe('audio')
      })

      it('should recognize .mp3 files', () => {
        expect(mediaKindFromUrl('song.mp3')).toBe('audio')
        expect(mediaKindFromUrl('/media/song.mp3')).toBe('audio')
      })

      it('should recognize .wav files', () => {
        expect(mediaKindFromUrl('recording.wav')).toBe('audio')
      })

      it('should recognize .ogg files', () => {
        expect(mediaKindFromUrl('sound.ogg')).toBe('audio')
      })
    })

    describe('video files', () => {
      it('should recognize .mp4 files', () => {
        expect(mediaKindFromUrl('video.mp4')).toBe('video')
        expect(mediaKindFromUrl('/videos/clip.mp4')).toBe('video')
      })

      it('should recognize .webm files', () => {
        expect(mediaKindFromUrl('recording.webm')).toBe('video')
      })

      it('should recognize .mov files', () => {
        expect(mediaKindFromUrl('movie.mov')).toBe('video')
      })
    })

    describe('image files', () => {
      it('should recognize .jpg files', () => {
        expect(mediaKindFromUrl('photo.jpg')).toBe('image')
      })

      it('should recognize .jpeg files', () => {
        expect(mediaKindFromUrl('photo.jpeg')).toBe('image')
      })

      it('should recognize .png files', () => {
        expect(mediaKindFromUrl('screenshot.png')).toBe('image')
      })

      it('should recognize .gif files', () => {
        expect(mediaKindFromUrl('animation.gif')).toBe('image')
      })

      it('should recognize .svg files', () => {
        expect(mediaKindFromUrl('icon.svg')).toBe('image')
      })

      it('should recognize .webp files', () => {
        expect(mediaKindFromUrl('modern.webp')).toBe('image')
      })
    })

    describe('edge cases', () => {
      it('should return unknown for empty string', () => {
        expect(mediaKindFromUrl('')).toBe('unknown')
      })

      it('should return unknown for undefined URL', () => {
        expect(mediaKindFromUrl(undefined as any)).toBe('unknown')
      })

      it('should return unknown for null URL', () => {
        expect(mediaKindFromUrl(null as any)).toBe('unknown')
      })

      it('should return unknown for unrecognized extensions', () => {
        expect(mediaKindFromUrl('document.pdf')).toBe('unknown')
        expect(mediaKindFromUrl('data.json')).toBe('unknown')
        expect(mediaKindFromUrl('style.css')).toBe('unknown')
      })

      it('should return unknown for files with no extension', () => {
        expect(mediaKindFromUrl('noextension')).toBe('unknown')
        expect(mediaKindFromUrl('/path/to/file')).toBe('unknown')
      })

      it('should be case sensitive', () => {
        expect(mediaKindFromUrl('AUDIO.MP3')).toBe('unknown') // uppercase not matched
        expect(mediaKindFromUrl('audio.MP3')).toBe('unknown')
      })

      it('should handle URLs with query parameters', () => {
        expect(mediaKindFromUrl('audio.mp3?v=123')).toBe('unknown') // regex requires end of string
      })

      it('should handle URLs with fragments', () => {
        expect(mediaKindFromUrl('video.mp4#t=10')).toBe('unknown')
      })

      it('should handle double extensions', () => {
        expect(mediaKindFromUrl('file.tar.mp3')).toBe('audio')
      })
    })

    describe('full URLs', () => {
      it('should work with HTTP URLs', () => {
        expect(mediaKindFromUrl('http://example.com/audio.mp3')).toBe('audio')
      })

      it('should work with HTTPS URLs', () => {
        expect(mediaKindFromUrl('https://cdn.example.com/video.mp4')).toBe('video')
      })

      it('should work with data URLs (returns unknown)', () => {
        expect(mediaKindFromUrl('data:audio/mp3;base64,ABC123')).toBe('unknown')
      })

      it('should work with blob URLs (returns unknown)', () => {
        expect(mediaKindFromUrl('blob:https://example.com/123-456')).toBe('unknown')
      })
    })
  })
})