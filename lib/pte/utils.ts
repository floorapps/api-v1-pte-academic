/**
 * PTE media utilities
 */

export type MediaKind = 'audio' | 'image' | 'unknown'

const AUDIO_EXTS = new Set([
  'mp3',
  'wav',
  'm4a',
  'aac',
  'webm',
  'ogg',
  'oga',
  'opus',
  'flac',
  'mp4',
  'm4b',
])

const IMAGE_EXTS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'avif',
  'bmp',
  'svg',
  'ico',
  'tiff',
  'tif',
])

export function extnameFromUrl(url: string): string | null {
  try {
    // First try to get extension from the part before query parameters
    const u = url.split('?')[0].split('#')[0]
    const last = u.split('/').pop() || ''
    const dot = last.lastIndexOf('.')
    if (dot !== -1) {
      return last.slice(dot + 1).toLowerCase()
    }
    
    // If no extension found before query params, check if this might be an external image URL
    // that doesn't follow standard file extension patterns but is still likely an image
    // For URLs like Unsplash or other image hosting services, we can infer from the domain
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()
      
      // Common image hosting domains that might not have file extensions
      if (hostname.includes('unsplash.com') || 
          hostname.includes('images.unsplash.com') ||
          hostname.includes('imgur.com') ||
          hostname.includes('cloudinary.com') ||
          hostname.includes('res.cloudinary.com')) {
        return 'jpg' // Default extension for these services
      }
      
      // Check if URL path suggests it's an image even without extension
      const path = urlObj.pathname.toLowerCase()
      if (path.includes('image') || path.includes('photo') || path.includes('picture')) {
        return 'jpg' // Likely an image
      }
    } catch {
      // If URL parsing fails, continue with original logic
    }
    
    return null
  } catch {
    return null
  }
}

export function mediaKindFromUrl(url: string): MediaKind {
  const ext = extnameFromUrl(url)
  if (!ext) return 'unknown'
  if (AUDIO_EXTS.has(ext)) return 'audio'
  if (IMAGE_EXTS.has(ext)) return 'image'
  return 'unknown'
}

export function isAudioUrl(url: string): boolean {
  return mediaKindFromUrl(url) === 'audio'
}

export function isImageUrl(url: string): boolean {
  return mediaKindFromUrl(url) === 'image'
}