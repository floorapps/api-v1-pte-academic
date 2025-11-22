#!/usr/bin/env node

/**
 * Comprehensive test for AI providers with AI SDK v5
 * Tests all providers: OpenAI, Gemini, Groq, Google GenAI
 */

const { GoogleGenAI } = require('@google/genai');
const { generateText, generateObject } = require('ai');
const { google } = require('@ai-sdk/google');
const { openai } = require('@ai-sdk/openai');
const { groq } = require('@ai-sdk/groq');
const { z } = require('zod');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const TEST_SAMPLE = {
  speaking: {
    transcript: "The rapid advancement of artificial intelligence has revolutionized various industries, from healthcare to finance. Machine learning algorithms can now process vast amounts of data and identify patterns that would be impossible for humans to detect manually.",
    question: "Describe how artificial intelligence is changing modern industries.",
    expectedDuration: 45
  },
  writing: {
    essay: "In recent years, artificial intelligence has emerged as a transformative force across multiple sectors. This essay will examine the profound impact of AI on modern industries and society at large.",
    question: "Discuss the impact of artificial intelligence on modern society.",
    wordCount: 150
  }
};

async function testGoogleGenAI() {
  console.log('🧠 Testing Google GenAI Provider...');

  try {
    const genAI = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    // Test basic generation
    console.log('  Testing basic text generation...');
    const response = await generateText({
      model: google('gemini-2.0-flash-exp'),
      prompt: 'What is the capital of France?',
    });
    console.log(`  ✓ Basic generation: ${response.text}`);

    // Test structured output
    console.log('  Testing structured output...');
    const { object } = await generateObject({
      model: google('gemini-2.5-pro'),
      providerOptions: {
        google: {
          structuredOutputs: true,
        },
      },
      schema: z.object({
        name: z.string(),
        age: z.number(),
        city: z.string(),
      }),
      prompt: 'Generate a sample person profile.',
    });
    console.log(`  ✓ Structured output: ${JSON.stringify(object)}`);

    // Test file search (if configured)
    if (process.env.GOOGLE_FILE_STORE) {
      console.log('  Testing file search...');
      const { text, sources } = await generateText({
        model: google('gemini-2.5-pro'),
        tools: {
          file_search: google.tools.fileSearch({
            fileSearchStoreNames: [process.env.GOOGLE_FILE_STORE],
            metadataFilter: 'category = "pte_official"',
            topK: 5,
          }),
        },
        prompt: "Summarize PTE speaking test format.",
      });
      console.log(`  ✓ File search: ${text}`);
    }

    // Test audio generation
    console.log('  Testing audio generation...');
    const audioResponse = await genAI.models.generateContentStream({
      model: 'gemini-2.5-pro-preview-tts',
      contents: [{
        role: 'user',
        parts: [{ text: 'Hello! This is a test of the Google GenAI audio generation capabilities.' }],
      }],
      config: {
        temperature: 0.3,
        responseModalities: ['audio'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'en-US-Neural2-D',
            },
          },
        },
      },
    });

    let audioGenerated = false;
    for await (const chunk of audioResponse) {
      if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        audioGenerated = true;
        break;
      }
    }
    console.log(`  ✓ Audio generation: ${audioGenerated ? 'Success' : 'Failed'}`);

    return true;
  } catch (error) {
    console.error(`  ✗ Google GenAI test failed: ${error.message}`);
    return false;
  }
}

async function testGroq() {
  console.log('⚡ Testing Groq Provider...');

  try {
    // Test basic generation
    console.log('  Testing basic text generation...');
    const response = await generateText({
      model: groq('llama-3.1-70b-versatile'),
      prompt: 'What is the speed of light?',
    });
    console.log(`  ✓ Basic generation: ${response.text.substring(0, 100)}...`);

    // Test structured output
    console.log('  Testing structured output...');
    const { object } = await generateObject({
      model: groq('llama-3.1-8b-instant'),
      schema: z.object({
        topic: z.string(),
        difficulty: z.enum(['easy', 'medium', 'hard']),
        keywords: z.array(z.string()),
      }),
      prompt: 'Generate a PTE speaking practice topic.',
    });
    console.log(`  ✓ Structured output: ${JSON.stringify(object)}`);

    return true;
  } catch (error) {
    console.error(`  ✗ Groq test failed: ${error.message}`);
    return false;
  }
}

async function testOpenAI() {
  console.log('🤖 Testing OpenAI Provider...');

  try {
    // Test basic generation
    console.log('  Testing basic text generation...');
    const response = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: 'Explain quantum computing in simple terms.',
    });
    console.log(`  ✓ Basic generation: ${response.text.substring(0, 100)}...`);

    return true;
  } catch (error) {
    console.error(`  ✗ OpenAI test failed: ${error.message}`);
    return false;
  }
}

async function testTranslationFeature() {
  console.log('🌍 Testing Translation with Feedback...');

  try {
    const genAI = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    let currentTranslation = '';
    let iterations = 0;
    const MAX_ITERATIONS = 3;

    const text = "The PTE Academic test assesses your English skills through real-life academic content.";
    const targetLanguage = "Spanish";

    // Initial translation
    const { text: translation } = await generateText({
      model: google('gemini-2.0-pro-exp'),
      system: 'You are an expert literary translator.',
      prompt: `Translate this text to ${targetLanguage}, preserving tone and cultural nuances: ${text}`,
    });
    currentTranslation = translation;

    // Evaluation-optimization loop
    while (iterations < MAX_ITERATIONS) {
      const { object: evaluation } = await generateObject({
        model: google('gemini-2.5-pro'),
        schema: z.object({
          qualityScore: z.number().min(1).max(10),
          preservesTone: z.boolean(),
          preservesNuance: z.boolean(),
          culturallyAccurate: z.boolean(),
          specificIssues: z.array(z.string()),
          improvementSuggestions: z.array(z.string()),
        }),
        system: 'You are an expert in evaluating literary translations.',
        prompt: `Evaluate this translation:\nOriginal: ${text}\nTranslation: ${currentTranslation}\n\nConsider:\n1. Overall quality\n2. Preservation of tone\n3. Preservation of nuance\n4. Cultural accuracy`,
      });

      console.log(`  Iteration ${iterations + 1}: Quality Score = ${evaluation.qualityScore}`);

      if (
        evaluation.qualityScore >= 8 &&
        evaluation.preservesTone &&
        evaluation.preservesNuance &&
        evaluation.culturallyAccurate
      ) {
        break;
      }

      const { text: improvedTranslation } = await generateText({
        model: google('gemini-2.5-pro'),
        system: 'You are an expert literary translator.',
        prompt: `Improve this translation based on the following feedback:\n${evaluation.specificIssues.join('\n')}\n${evaluation.improvementSuggestions.join('\n')}\n\nOriginal: ${text}\nCurrent Translation: ${currentTranslation}`,
      });
      currentTranslation = improvedTranslation;
      iterations++;
    }

    console.log(`  ✓ Translation completed in ${iterations + 1} iterations`);
    console.log(`  Final translation: ${currentTranslation}`);

    return true;
  } catch (error) {
    console.error(`  ✗ Translation test failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting AI Provider Tests...\n');

  const results = {
    googleGenAI: await testGoogleGenAI(),
    groq: await testGroq(),
    openai: await testOpenAI(),
    translation: await testTranslationFeature(),
  };

  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  Object.entries(results).forEach(([provider, success]) => {
    console.log(`${provider}: ${success ? '✅ PASS' : '❌ FAIL'}`);
  });

  const allPassed = Object.values(results).every(result => result);
  console.log(`\n${allPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed'}`);

  process.exit(allPassed ? 0 : 1);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testGoogleGenAI,
  testGroq,
  testOpenAI,
  testTranslationFeature,
  runAllTests,
};