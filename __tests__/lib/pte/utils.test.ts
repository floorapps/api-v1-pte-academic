/**
 * Unit tests for lib/pte/utils.ts
 * Tests PTE utility functions
 */

import { countWords, mediaKindFromUrl } from '@/lib/pte/utils'

describe('pte/utils', () => {
  describe('countWords', () => {
    it('should count words in a simple sentence', () => {
      expect(countWords('Hello world')).toBe(2)
      expect(countWords('The quick brown fox')).toBe(4)
    })

    it('should handle single word', () => {
      expect(countWords('Hello')).toBe(1)
    })

    it('should handle empty string', () => {
      expect(countWords('')).toBe(1)
    })

    it('should handle multiple spaces', () => {
      expect(countWords('Hello    world')).toBe(2)
      expect(countWords('  Hello  world  ')).toBe(2)
    })

    it('should trim whitespace', () => {
      expect(countWords('  Hello world  ')).toBe(2)
    })

    it('should handle newlines and tabs', () => {
      expect(countWords('Hello\nworld')).toBe(2)
      expect(countWords('Hello\tworld')).toBe(2)
      expect(countWords('Hello\n\nworld')).toBe(2)
    })

    it('should count punctuation as part of words', () => {
      expect(countWords('Hello, world!')).toBe(2)
      expect(countWords("don't can't won't")).toBe(3)
    })
  })

  describe('mediaKindFromUrl', () => {
    describe('audio files', () => {
      it('should detect m4a files', () => {
        expect(mediaKindFromUrl('audio.m4a')).toBe('audio')
        expect(mediaKindFromUrl('/path/to/audio.m4a')).toBe('audio')
      })

      it('should detect mp3 files', () => {
        expect(mediaKindFromUrl('song.mp3')).toBe('audio')
      })

      it('should detect wav files', () => {
        expect(mediaKindFromUrl('recording.wav')).toBe('audio')
      })

      it('should detect ogg files', () => {
        expect(mediaKindFromUrl('audio.ogg')).toBe('audio')
      })
    })

    describe('video files', () => {
      it('should detect mp4 files', () => {
        expect(mediaKindFromUrl('video.mp4')).toBe('video')
      })

      it('should detect webm files', () => {
        expect(mediaKindFromUrl('video.webm')).toBe('video')
      })

      it('should detect mov files', () => {
        expect(mediaKindFromUrl('video.mov')).toBe('video')
      })
    })

    describe('image files', () => {
      it('should detect jpeg files', () => {
        expect(mediaKindFromUrl('image.jpeg')).toBe('image')
        expect(mediaKindFromUrl('image.jpg')).toBe('image')
      })

      it('should detect png files', () => {
        expect(mediaKindFromUrl('image.png')).toBe('image')
      })

      it('should detect gif files', () => {
        expect(mediaKindFromUrl('image.gif')).toBe('image')
      })

      it('should detect svg files', () => {
        expect(mediaKindFromUrl('icon.svg')).toBe('image')
      })

      it('should detect webp files', () => {
        expect(mediaKindFromUrl('image.webp')).toBe('image')
      })
    })

    describe('unknown files', () => {
      it('should return unknown for unrecognized extensions', () => {
        expect(mediaKindFromUrl('file.txt')).toBe('unknown')
        expect(mediaKindFromUrl('document.pdf')).toBe('unknown')
      })

      it('should return unknown for no extension', () => {
        expect(mediaKindFromUrl('filename')).toBe('unknown')
      })

      it('should return unknown for empty string', () => {
        expect(mediaKindFromUrl('')).toBe('unknown')
      })
    })

    describe('case insensitivity', () => {
      it('should be case insensitive', () => {
        expect(mediaKindFromUrl('AUDIO.MP3')).toBe('audio')
        expect(mediaKindFromUrl('VIDEO.MP4')).toBe('video')
        expect(mediaKindFromUrl('IMAGE.PNG')).toBe('image')
      })
    })

    describe('full URLs', () => {
      it('should handle full URLs', () => {
        expect(mediaKindFromUrl('https://example.com/audio.mp3')).toBe('audio')
        expect(mediaKindFromUrl('http://cdn.example.com/video.mp4')).toBe('video')
        expect(mediaKindFromUrl('https://images.example.com/photo.jpg')).toBe('image')
      })

      it('should handle URLs with query parameters', () => {
        expect(mediaKindFromUrl('https://example.com/audio.mp3?v=1')).toBe('audio')
        expect(mediaKindFromUrl('https://example.com/video.mp4?autoplay=1')).toBe('video')
      })
    })
  })
})