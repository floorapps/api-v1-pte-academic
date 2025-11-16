# Audio Files Guide for PTE Academic Questions

## Current Status

All November 2025 questions have been seeded with `promptMediaUrl: null`. This means:
- ✅ Questions work for text-based practice
- ✅ Users can read transcripts
- ❌ No actual audio playback available yet

## Adding Real Audio Files

### Option 1: Use Text-to-Speech (TTS) to Generate Audio

You can use AI TTS services to generate high-quality audio from the transcripts:

#### Recommended TTS Services:
1. **ElevenLabs** (Best quality, realistic voices)
   - Your project already has `@elevenlabs/client` installed
   - Use the professional voices for academic content
   - Cost: ~$0.30 per 1000 characters

2. **OpenAI TTS** (Good quality, cost-effective)
   - Use `tts-1` or `tts-1-hd` models
   - Voices: alloy, echo, fable, onyx, nova, shimmer
   - Cost: ~$15 per 1M characters

3. **Azure Speech Services** (Good for bulk generation)
   - Multiple neural voices available
   - Cost: ~$15 per 1M characters

#### Example Script to Generate Audio Files:

```typescript
// scripts/generate-audio-files.ts
import { ElevenLabsClient } from '@elevenlabs/client'
import fs from 'fs/promises'
import path from 'path'

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
})

const listeningQuestions = [
  {
    id: 'climate-policy',
    text: 'The transition to renewable energy requires coordinated policy frameworks...',
    voice: 'Rachel' // Professional female voice
  },
  // Add more questions
]

async function generateAudioFiles() {
  const outputDir = path.join(process.cwd(), 'asset', 'audio', 'nov2025')
  await fs.mkdir(outputDir, { recursive: true })

  for (const question of listeningQuestions) {
    const audioStream = await client.generate({
      voice: question.voice,
      text: question.text,
      model_id: 'eleven_turbo_v2'
    })

    const outputPath = path.join(outputDir, `${question.id}.mp3`)
    const writeStream = createWriteStream(outputPath)
    audioStream.pipe(writeStream)

    console.log(`Generated: ${outputPath}`)
  }
}

generateAudioFiles()
```

### Option 2: Record Professional Audio

If you want human-recorded audio:
1. Hire voice actors on platforms like Voices.com or Fiverr
2. Request academic/professional tone
3. Provide the transcripts from the seed files
4. Save files as MP3 (128kbps minimum)

### Option 3: Use Free TTS (Lower Quality)

For testing purposes, you can use free TTS services:
- Google Cloud Text-to-Speech (free tier: 1M chars/month)
- Microsoft Edge TTS (free, browser-based)
- AWS Polly (free tier: 5M chars/month)

## File Organization

### Directory Structure:
```
asset/
└── audio/
    ├── nov2025/              # November 2025 questions
    │   ├── climate-policy.mp3
    │   ├── ai-ethics.mp3
    │   ├── quantum-computing.mp3
    │   └── ...
    ├── lecture1.mp3          # Existing files
    ├── mcq1.mp3
    └── ...
```

### File Naming Convention:
- Use lowercase with hyphens: `climate-policy.mp3`
- Match the question topic/title
- Keep names descriptive but concise

## Updating Seed Files with Audio URLs

After generating audio files, update the seed files:

```json
{
  "title": "Listening Summarize Spoken Text — Climate Policy",
  "type": "summarize_spoken_text",
  "promptText": "Listen to the audio and write a summary in 50-70 words.",
  "promptMediaUrl": "/asset/audio/nov2025/climate-policy.mp3",  // ← Update this
  "transcript": "The transition to renewable energy...",
  "difficulty": "Hard",
  "tags": ["nov2025", "listening", "summarize_spoken_text", "climate", "policy"]
}
```

Then re-seed the database:
```bash
pnpm tsx lib/db/seed.ts --listening --reset
```

## Audio File Requirements

### Technical Specifications:
- **Format**: MP3 or M4A
- **Bitrate**: 128 kbps minimum (192 kbps recommended)
- **Sample Rate**: 44.1 kHz or 48 kHz
- **Channels**: Mono (saves space) or Stereo
- **Duration**: Match the PTE timing guidelines
  - Read Aloud: ~30-40 seconds
  - Repeat Sentence: ~3-9 seconds
  - Retell Lecture: ~30-90 seconds
  - Listening questions: ~30-90 seconds

### Content Guidelines:
- **Accent**: Neutral English (US, UK, or Australian)
- **Speed**: Natural speaking pace (~150-160 WPM)
- **Clarity**: Clear pronunciation, minimal background noise
- **Tone**: Academic and professional

## Question Types Requiring Audio

### Speaking:
- ✅ Read Aloud (no audio needed - text only)
- ✅ Repeat Sentence (NEEDS AUDIO)
- ✅ Describe Image (image needed, not audio)
- ✅ Retell Lecture (NEEDS AUDIO)
- ✅ Answer Short Question (NEEDS AUDIO)
- ✅ Summarize Group Discussion (NEEDS AUDIO)
- ✅ Respond to Situation (NEEDS AUDIO)

### Listening:
- ❌ Summarize Spoken Text (NEEDS AUDIO)
- ❌ Multiple Choice Single (NEEDS AUDIO)
- ❌ Multiple Choice Multiple (NEEDS AUDIO)
- ❌ Fill in Blanks (NEEDS AUDIO)
- ❌ Highlight Correct Summary (NEEDS AUDIO)
- ❌ Select Missing Word (NEEDS AUDIO)
- ❌ Highlight Incorrect Words (NEEDS AUDIO)
- ❌ Write from Dictation (NEEDS AUDIO)

## Cost Estimation

### Using ElevenLabs (Premium Quality):
- Average transcript length: ~100-200 words = ~500-1000 characters
- 50 audio files × 750 chars average = 37,500 characters
- Cost: ~$11.25 for all nov2025 listening questions

### Using OpenAI TTS:
- Same calculation: 37,500 characters
- Cost: ~$0.56 for all nov2025 listening questions

### Recommendation:
Use **OpenAI TTS** for bulk generation (cost-effective), or **ElevenLabs** for premium quality on select questions.

## Next Steps

1. Choose your audio generation method
2. Run generation script or hire voice actors
3. Save files to `asset/audio/nov2025/`
4. Update seed files with correct paths
5. Re-run seeding: `pnpm tsx lib/db/seed.ts --listening --reset`
6. Test audio playback in the application

## Alternative: Client-Side TTS

You could also implement browser-based TTS as a fallback:

```typescript
// For questions without audio files
if (!question.promptMediaUrl && question.transcript) {
  const utterance = new SpeechSynthesisUtterance(question.transcript)
  utterance.rate = 0.9 // Slightly slower than normal
  utterance.pitch = 1.0
  window.speechSynthesis.speak(utterance)
}
```

This provides instant audio without file generation, though quality is lower than pre-recorded audio.
