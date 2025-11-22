import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
    console.log('Starting media generation...');

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.error('GOOGLE_GENERATIVE_AI_API_KEY is missing');
        process.exit(1);
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('BLOB_READ_WRITE_TOKEN is missing (required for Vercel Blob)');
        process.exit(1);
    }

    // Process Retell Lecture
    await processSeedFile(
        path.join(process.cwd(), 'lib', 'db', 'seeds', 'speaking.retell_lecture.json'),
        'retell_lecture'
    );

    // Process Answer Short Question
    await processSeedFile(
        path.join(process.cwd(), 'lib', 'db', 'seeds', 'speaking.answer_short_question.json'),
        'answer_short_question'
    );

    console.log('Media generation complete!');
}

async function processSeedFile(filePath: string, type: string) {
    console.log(`Processing ${type} from ${filePath}...`);

    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const items = JSON.parse(content);
    let updated = false;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log(`Checking item ${i}: ${item.title}, promptMediaUrl: ${item.promptMediaUrl}, promptText: ${item.promptText ? 'Yes' : 'No'}`);

        if (!item.promptMediaUrl && item.promptText) {
            console.log(`Generating audio for: ${item.title}`);
            try {
                // Note: The Google Node SDK might not have a direct 'generateAudio' helper in the high-level client yet 
                // if it's very new, but we can try to use the REST API or check if the model supports it.
                // However, for simplicity and since we deleted the provider, let's assume we might need to use a standard TTS 
                // or if Gemini supports it directly. 
                // WAIT: Gemini 1.5 Pro doesn't natively output AUDIO bytes via the standard generateContent API easily 
                // without specific configuration or it might be text-to-text/image.
                // If the previous provider worked, it might have been using a specific endpoint or the user has a TTS setup.
                // Let's double check if we can use OpenAI TTS or Google TTS. 
                // The user specifically asked for "Google GenAI" for media. 
                // If Gemini doesn't support direct TTS output easily in this SDK version, we might need another approach.
                // BUT, the user said "generate media... using Google GenAI".
                // Let's assume for a moment we can use a standard TTS or if the user meant the previous provider's logic.
                // The previous provider had `generateAudio`. 
                // Let's look at what `GoogleGenAIProvider` did. I can't, I deleted it.
                // I will use a standard Google TTS call or OpenAI TTS if available, OR just use a placeholder for now 
                // if I can't verify Gemini TTS. 
                // Actually, let's use OpenAI TTS as a fallback if Gemini is hard, OR try to hit the Gemini API if I recall the syntax.
                // Better yet, let's use the `google-genai` package if it has it.
                // Checking `package.json`: "@google/genai": "^1.30.0".

                // Let's try to use a simple fetch to Google's text-to-speech API if we have the key, 
                // OR just use OpenAI's TTS since we likely have that key too and it's reliable for "generating media".
                // The user said "generate media... using Google GenAI". 
                // I will try to use the `google-genai` package. 

                // Re-reading the previous `generate-media.ts` content I saw:
                // `provider.generateAudio(item.promptText, { voice: 'en-US-Journey-D' })`
                // This looks like Google's "Journey" voices, which are part of their Cloud TTS or new GenAI speech.
                // I will try to implement a fetch to the Google Cloud TTS REST API using the API Key.
                // Endpoint: https://texttospeech.googleapis.com/v1/text:synthesize

                const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        input: { text: item.promptText },
                        voice: { languageCode: 'en-US', name: 'en-US-Journey-D' },
                        audioConfig: { audioEncoding: 'MP3' },
                    }),
                });

                if (!response.ok) {
                    const err = await response.text();
                    throw new Error(`Google TTS API failed: ${err}`);
                }

                const data = await response.json();
                const audioContent = data.audioContent; // Base64 string
                const buffer = Buffer.from(audioContent, 'base64');

                // Upload to Vercel Blob
                const filename = `${type}_${i + 1}_${Date.now()}.mp3`;
                const blob = await put(`assets/generated/audio/${filename}`, buffer, {
                    access: 'public',
                    token: process.env.BLOB_READ_WRITE_TOKEN,
                });

                item.promptMediaUrl = blob.url;
                updated = true;
                console.log(`Saved to ${item.promptMediaUrl}`);

                // Rate limit protection
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Failed to generate audio for ${item.title}:`, error);
            }
        }
    }

    if (updated) {
        fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
        console.log(`Updated ${filePath}`);
    } else {
        console.log(`No changes for ${filePath}`);
    }
}

main().catch(console.error);
