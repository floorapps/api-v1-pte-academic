import 'server-only'
import {
  type AIProvider,
  type HealthStatus,
  type ListeningInput,
  type ProviderRawScore,
  type ReadingInput,
  type SpeakingInput,
  type WritingInput,
  type DialogInput,
} from '@/lib/ai/providers/types'
import {
  clampTo90,
} from '@/lib/pte/scoring-normalize'
import {
  buildListeningExplanationPrompt,
  buildReadingExplanationPrompt,
  buildSpeakingPrompt,
  buildWritingPrompt,
  getDefaultWeights,
} from '@/lib/pte/scoring-rubrics'
import { generateObject, generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import mime from 'mime-types'

// Google GenAI for advanced audio processing
import { GoogleGenAI } from '@google/genai';

let genAIClient: GoogleGenAI | null = null;

function getGoogleGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
  }
  return genAIClient;
}

const MODEL_FAST = 'gemini-2.0-flash-exp'
const MODEL_QUALITY = 'gemini-2.0-pro-exp'
const MODEL_AUDIO = 'gemini-2.5-pro-preview-tts'
const MODEL_PRO = 'gemini-2.5-pro'

interface WavConversionOptions {
  numChannels: number;
  sampleRate: number;
  bitsPerSample: number;
}

function parseMimeType(mimeType: string): WavConversionOptions {
  const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
  const [_, format] = fileType.split('/');
  const options: Partial<WavConversionOptions> = {
    numChannels: 1,
    sampleRate: 16000,
    bitsPerSample: 16,
  };

  if (format && format.startsWith('L')) {
    const bits = parseInt(format.slice(1), 10);
    if (!isNaN(bits)) {
      options.bitsPerSample = bits;
    }
  }

  for (const param of params) {
    const [key, value] = param.split('=').map(s => s.trim());
    if (key === 'rate') {
      options.sampleRate = parseInt(value, 10);
    } else if (key === 'channels') {
      options.numChannels = parseInt(value, 10);
    }
  }

  return options as WavConversionOptions;
}

function createWavHeader(dataLength: number, options: WavConversionOptions): Buffer {
  const { numChannels, sampleRate, bitsPerSample } = options;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const buffer = Buffer.alloc(44);

  buffer.write('RIFF', 0); // ChunkID
  buffer.writeUInt32LE(36 + dataLength, 4); // ChunkSize
  buffer.write('WAVE', 8); // Format
  buffer.write('fmt ', 12); // Subchunk1ID
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22); // NumChannels
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(byteRate, 28); // ByteRate
  buffer.writeUInt16LE(blockAlign, 32); // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34); // BitsPerSample
  buffer.write('data', 36); // Subchunk2ID
  buffer.writeUInt32LE(dataLength, 40); // Subchunk2Size

  return buffer;
}

function convertToWav(rawData: string, mimeType: string): Buffer {
  const options = parseMimeType(mimeType);
  const buffer = Buffer.from(rawData, 'base64');
  const wavHeader = createWavHeader(buffer.length, options);
  return Buffer.concat([wavHeader, buffer]);
}

/**
 * Google GenAI Provider Implementation
 * Enhanced with audio generation and advanced transcription capabilities
 */
export class GoogleGenAIProvider implements AIProvider {
  name: 'google-genai' = 'google-genai'

  async health(): Promise<HealthStatus> {
    const client = getGoogleGenAI()
    if (!client) {
      return { status: 'unavailable', reason: 'GOOGLE_GENERATIVE_AI_API_KEY not set' }
    }
    // Lightweight health check - just verify client is configured
    try {
      // Check if we can access the client without making network calls
      if (client && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        return { status: 'available' }
      }
      return { status: 'unavailable', reason: 'Google GenAI client configuration incomplete' }
    } catch (e: any) {
      return { status: 'error', reason: e.message }
    }
  }

  async scoreSpeaking(input: SpeakingInput): Promise<ProviderRawScore> {
    const client = getGoogleGenAI()
    if (!client) throw new Error('Google GenAI client not available')

    const prompt = buildSpeakingPrompt(input)
    const schema = z.object({
      content: z.number().min(0).max(90),
      pronunciation: z.number().min(0).max(90),
      fluency: z.number().min(0).max(90),
      overall: z.number().min(0).max(90),
      rationale: z.string(),
      suggestions: z.array(z.string()),
      transcript_accuracy: z.number().min(0).max(100).optional(),
      phonetic_analysis: z.string().optional(),
      prosody_score: z.number().min(0).max(100).optional(),
    })

    const result = await generateObject({
      model: google(MODEL_QUALITY),
      prompt,
      schema,
      temperature: 0.1,
      maxTokens: 1500,
    })

    const {
      content,
      pronunciation,
      fluency,
      overall,
      rationale,
      suggestions,
      transcript_accuracy,
      phonetic_analysis,
      prosody_score
    } = result.object

    return {
      overall: clampTo90(overall),
      subscores: {
        content: clampTo90(content),
        pronunciation: clampTo90(pronunciation),
        fluency: clampTo90(fluency),
        ...(transcript_accuracy && { transcript_accuracy }),
        ...(phonetic_analysis && { phonetic_analysis }),
        ...(prosody_score && { prosody_score }),
      },
      rationale,
      suggestions,
      meta: {
        provider: 'google-genai',
        model: MODEL_QUALITY,
        features: ['advanced_transcription', 'phonetic_analysis', 'prosody_scoring'],
      }
    }
  }

  async scoreWriting(input: WritingInput): Promise<ProviderRawScore> {
    const client = getGoogleGenAI()
    if (!client) throw new Error('Google GenAI client not available')

    const prompt = buildWritingPrompt(input)
    const schema = z.object({
      content: z.number().min(0).max(90),
      form: z.number().min(0).max(90),
      grammar: z.number().min(0).max(90),
      vocabulary: z.number().min(0).max(90),
      overall: z.number().min(0).max(90),
      rationale: z.string(),
      suggestions: z.array(z.string()),
      word_count: z.number().optional(),
      coherence_score: z.number().min(0).max(100).optional(),
      cohesion_score: z.number().min(0).max(100).optional(),
    })

    const result = await generateObject({
      model: google(MODEL_QUALITY),
      prompt,
      schema,
      temperature: 0.1,
      maxTokens: 1500,
    })

    const {
      content,
      form,
      grammar,
      vocabulary,
      overall,
      rationale,
      suggestions,
      word_count,
      coherence_score,
      cohesion_score
    } = result.object

    return {
      overall: clampTo90(overall),
      subscores: {
        content: clampTo90(content),
        form: clampTo90(form),
        grammar: clampTo90(grammar),
        vocabulary: clampTo90(vocabulary),
        ...(word_count && { word_count }),
        ...(coherence_score && { coherence_score }),
        ...(cohesion_score && { cohesion_score }),
      },
      rationale,
      suggestions,
      meta: {
        provider: 'google-genai',
        model: MODEL_QUALITY,
        features: ['advanced_coherence', 'cohesion_analysis'],
      }
    }
  }

  async scoreReading(input: ReadingInput): Promise<ProviderRawScore> {
    const client = getGoogleGenAI()
    if (!client) throw new Error('Google GenAI client not available')

    const prompt = buildReadingExplanationPrompt(input)
    const schema = z.object({
      explanation: z.string(),
      confidence: z.number().min(0).max(100),
      key_points: z.array(z.string()),
      reading_strategies: z.array(z.string()).optional(),
      comprehension_level: z.enum(['basic', 'intermediate', 'advanced']).optional(),
    })

    const result = await generateObject({
      model: google(MODEL_FAST),
      prompt,
      schema,
      temperature: 0.2,
      maxTokens: 800,
    })

    const { explanation, confidence, key_points, reading_strategies, comprehension_level } = result.object

    return {
      rationale: explanation,
      meta: {
        provider: 'google-genai',
        model: MODEL_FAST,
        confidence,
        key_points,
        ...(reading_strategies && { reading_strategies }),
        ...(comprehension_level && { comprehension_level }),
      }
    }
  }

  async scoreListening(input: ListeningInput): Promise<ProviderRawScore> {
    const client = getGoogleGenAI()
    if (!client) throw new Error('Google GenAI client not available')

    const prompt = buildListeningExplanationPrompt(input)
    const schema = z.object({
      explanation: z.string(),
      confidence: z.number().min(0).max(100),
      key_points: z.array(z.string()),
      listening_strategies: z.array(z.string()).optional(),
      audio_quality_assessment: z.string().optional(),
    })

    const result = await generateObject({
      model: google(MODEL_FAST),
      prompt,
      schema,
      temperature: 0.2,
      maxTokens: 800,
    })

    const { explanation, confidence, key_points, listening_strategies, audio_quality_assessment } = result.object

    return {
      rationale: explanation,
      meta: {
        provider: 'google-genai',
        model: MODEL_FAST,
        confidence,
        key_points,
        ...(listening_strategies && { listening_strategies }),
        ...(audio_quality_assessment && { audio_quality_assessment }),
      },
    }
  }

  // Advanced audio generation for test samples with multi-speaker support
  async generateAudio(text: string, options?: {
    voice?: string;
    speed?: number;
    pitch?: number;
    multiSpeaker?: boolean;
    speakers?: Array<{
      speaker: string;
      voiceName: string;
    }>;
  }): Promise<Buffer> {
    const client = getGoogleGenAI()
    if (!client) throw new Error('Google GenAI client not available')

    try {
      const config = {
        temperature: 0.3,
        responseModalities: ['audio'] as const,
        speechConfig: options?.multiSpeaker ? {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: options.speakers?.map(speaker => ({
              speaker: speaker.speaker,
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: speaker.voiceName,
                }
              }
            })) || [
                { speaker: 'Speaker 1', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                { speaker: 'Speaker 2', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
              ],
          }
        } : {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: options?.voice || 'en-US-Neural2-D',
            }
          }
        },
      };

      const response = await client.models.generateContentStream({
        model: MODEL_AUDIO,
        contents: [{
          role: 'user',
          parts: [{ text }],
        }],
        config,
      });

      let audioBuffer: Buffer | null = null;

      for await (const chunk of response) {
        if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
          continue;
        }

        if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          let fileExtension = mime.extension(inlineData.mimeType || '');
          let buffer = Buffer.from(inlineData.data || '', 'base64');

          if (!fileExtension || fileExtension !== 'wav') {
            buffer = convertToWav(inlineData.data || '', inlineData.mimeType || '');
          }

          audioBuffer = buffer;
          break;
        }
      }

      if (!audioBuffer) {
        throw new Error('No audio data in response');
      }

      return audioBuffer;
    } catch (error) {
      throw new Error(`Audio generation failed: ${error}`);
    }
  }

  // File search functionality for PTE content analysis
  async searchFiles(query: string, fileStoreNames?: string[], metadataFilter?: string): Promise<any> {
    const client = getGoogleGenAI()
    if (!client) throw new Error('Google GenAI client not available')

    try {
      const { text, sources } = await generateText({
        model: google(MODEL_PRO),
        tools: {
          file_search: google.tools.fileSearch({
            fileSearchStoreNames: fileStoreNames || [
              'projects/pte-assistant/locations/us/fileSearchStores/pte-content',
            ],
            metadataFilter: metadataFilter || 'category = "pte_official"',
            topK: 8,
          }),
        },
        prompt: query,
      });

      return { text, sources };
    } catch (error) {
      throw new Error(`File search failed: ${error}`);
    }
  }

  // Advanced structured output with flexible schemas
  async generateStructuredData<T>(schema: z.ZodSchema<T>, prompt: string, options?: {
    structuredOutputs?: boolean;
    temperature?: number;
  }): Promise<T> {
    const client = getGoogleGenAI()
    if (!client) throw new Error('Google GenAI client not available')

    try {
      const { object } = await generateObject({
        model: google(MODEL_PRO),
        providerOptions: {
          google: {
            structuredOutputs: options?.structuredOutputs !== false,
          },
        },
        schema,
        prompt,
        temperature: options?.temperature || 0.1,
      });

      return object as T;
    } catch (error) {
      throw new Error(`Structured data generation failed: ${error}`);
    }
  }

  // Translation with iterative feedback loop
  async translateWithFeedback(text: string, targetLanguage: string): Promise<{
    finalTranslation: string;
    iterationsRequired: number;
  }> {
    const client = getGoogleGenAI()
    if (!client) throw new Error('Google GenAI client not available')

    let currentTranslation = '';
    let iterations = 0;
    const MAX_ITERATIONS = 3;

    // Initial translation
    const { text: translation } = await generateText({
      model: google(MODEL_QUALITY),
      system: 'You are an expert literary translator.',
      prompt: `Translate this text to ${targetLanguage}, preserving tone and cultural nuances: ${text}`,
    });
    currentTranslation = translation;

    // Evaluation-optimization loop
    while (iterations < MAX_ITERATIONS) {
      // Evaluate current translation
      const { object: evaluation } = await generateObject({
        model: google(MODEL_PRO),
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

      // Check if quality meets threshold
      if (
        evaluation.qualityScore >= 8 &&
        evaluation.preservesTone &&
        evaluation.preservesNuance &&
        evaluation.culturallyAccurate
      ) {
        break;
      }

      // Generate improved translation based on feedback
      const { text: improvedTranslation } = await generateText({
        model: google(MODEL_PRO),
        system: 'You are an expert literary translator.',
        prompt: `Improve this translation based on the following feedback:\n${evaluation.specificIssues.join('\n')}\n${evaluation.improvementSuggestions.join('\n')}\n\nOriginal: ${text}\nCurrent Translation: ${currentTranslation}`,
      });
      currentTranslation = improvedTranslation;
      iterations++;
    }

    return {
      finalTranslation: currentTranslation,
      iterationsRequired: iterations,
    };
  }

  async scoreDialog(input: DialogInput): Promise<ProviderRawScore> {
    const client = getGoogleGenAI()
    if (!client) throw new Error('Google GenAI client not available')

    const prompt = `
      You are an expert PTE Academic examiner. Evaluate the following response to a "Respond to a Situation" question.
      
      Situation: "${input.situation}"
      User Response: "${input.transcript}"
      
      Score the response on:
      1. Appropriateness (0-90): Is the tone and register appropriate for the situation?
      2. Politeness (0-90): Is the language polite and respectful?
      3. Relevance (0-90): Does the response directly address the situation and provide a solution/response?
      
      Provide an overall score (0-90) based on these factors.
      Also provide a rationale and suggestions for improvement.
    `

    const schema = z.object({
      appropriateness: z.number().min(0).max(90),
      politeness: z.number().min(0).max(90),
      relevance: z.number().min(0).max(90),
      overall: z.number().min(0).max(90),
      rationale: z.string(),
      suggestions: z.array(z.string()),
    })

    const result = await generateObject({
      model: google(MODEL_QUALITY),
      prompt,
      schema,
      temperature: 0.1,
      maxTokens: 1000,
    })

    const { appropriateness, politeness, relevance, overall, rationale, suggestions } = result.object

    return {
      overall: clampTo90(overall),
      subscores: {
        content: clampTo90(relevance), // Map relevance to content
        pronunciation: clampTo90(appropriateness), // Map appropriateness to pronunciation (proxy)
        fluency: clampTo90(politeness), // Map politeness to fluency (proxy)
        appropriateness: clampTo90(appropriateness),
        politeness: clampTo90(politeness),
        relevance: clampTo90(relevance),
      },
      rationale,
      suggestions,
      meta: {
        provider: 'google-genai',
        model: MODEL_QUALITY,
        features: ['dialog_evaluation'],
      }
    }
  }
}