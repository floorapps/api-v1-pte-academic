import { config } from 'dotenv';

import { resolve } from 'path';

// Load env vars
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

async function testScoring() {
    // Dynamic import to ensure env vars are loaded first
    const { env } = await import('../lib/env');
    const { scoreReadAloud } = await import('../lib/ai/scoring');

    console.log('Testing AI Scoring...');
    console.log('API Key present:', !!env.GOOGLE_GENERATIVE_AI_API_KEY);

    const promptText = "The quick brown fox jumps over the lazy dog.";
    const transcript = "The quick brown fox jumps over the lazy dog.";
    const durationMs = 5000; // 5 seconds

    try {
        const result = await scoreReadAloud(promptText, transcript, durationMs);
        console.log('Scoring Result:', JSON.stringify(result, null, 2));

        if (result.overall_score >= 10 && result.overall_score <= 90) {
            console.log('✅ Score is within valid range.');
        } else {
            console.error('❌ Score is out of range.');
        }
    } catch (error) {
        console.error('❌ Scoring failed:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            // @ts-ignore
            if (error.cause) console.error('Error cause:', error.cause);
        }
    }
}

testScoring();
