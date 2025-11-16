// Test script to validate image URL parsing and display logic (Updated version)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Updated URL parsing logic to match the fix
function extnameFromUrl(url) {
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

function mediaKindFromUrl(url) {
  const AUDIO_EXTS = new Set([
    'mp3', 'wav', 'm4a', 'aac', 'webm', 'ogg', 'oga', 'opus', 'flac', 'mp4', 'm4b',
  ])

  const IMAGE_EXTS = new Set([
    'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'svg', 'ico', 'tiff', 'tif',
  ])

  const ext = extnameFromUrl(url)
  if (!ext) return 'unknown'
  if (AUDIO_EXTS.has(ext)) return 'audio'
  if (IMAGE_EXTS.has(ext)) return 'image'
  return 'unknown'
}

// Test URLs from the seed data
const testUrls = [
  '/images/academic/academic.png', // Local path
  'https://images.unsplash.com/photo-1551281044-8d8e89b5ee76?w=1200&auto=format&fit=crop', // External URL with query params
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop', // Another external URL
  'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=1200&auto=format&fit=crop', // Another external URL
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop', // Another external URL
  'https://images.unsplash.com/photo-1556761175-129418cb2dfe?w=1200&auto=format&fit=crop', // Another external URL
]

console.log('Testing UPDATED URL parsing for describe_image questions:\n')

testUrls.forEach((url, index) => {
  const ext = extnameFromUrl(url)
  const kind = mediaKindFromUrl(url)
  console.log(`${index + 1}. URL: ${url}`)
  console.log(`   Extension: ${ext}`)
  console.log(`   Media Kind: ${kind}`)
  console.log(`   Will Display: ${kind === 'image' ? '✅ YES' : '❌ NO'}\n`)
})

// Check if local image exists
const localImagePath = path.join(__dirname, 'public', 'images', 'academic', 'academic.png')
const localImageExists = fs.existsSync(localImagePath)
console.log(`Local image exists: ${localImageExists ? '✅ YES' : '❌ NO'}`)
console.log(`Local image path: ${localImagePath}`)