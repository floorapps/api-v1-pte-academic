import { AIFeedbackData, QuestionType, TestSection } from './types';

export async function generateAIFeedback(
  questionType: QuestionType,
  section: TestSection,
  userAnswer: string,
  correctAnswer?: string
): Promise<AIFeedbackData> {
  // Check if OpenAI API key is available
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key') {
    try {
      // Use OpenAI for real AI feedback
      return await generateAIFeedbackWithOpenAI(questionType, section, userAnswer, correctAnswer);
    } catch (error) {
      console.error('OpenAI API error, falling back to mock feedback:', error);
    }
  }

  // Fallback to mock feedback
  if (section === 'WRITING') {
    return generateWritingFeedback(userAnswer, questionType);
  }

  if (section === 'SPEAKING') {
    return generateSpeakingFeedback(userAnswer, questionType);
  }

  return generateBasicFeedback(userAnswer, correctAnswer);
}

function generateWritingFeedback(userAnswer: string, questionType: QuestionType): AIFeedbackData {
  const wordCount = userAnswer.split(/\s+/).length;
  const sentenceCount = userAnswer.split(/[.!?]+/).filter(s => s.trim()).length;
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  
  // Mock scoring based on basic metrics
  const contentScore = Math.min(90, 60 + (wordCount / 10));
  const grammarScore = 75 + Math.random() * 15;
  const vocabularyScore = 70 + Math.random() * 20;
  const spellingScore = 80 + Math.random() * 15;
  
  const overallScore = Math.round(
    (contentScore + grammarScore + vocabularyScore + spellingScore) / 4
  );
  
  return {
    overallScore,
    content: {
      score: Math.round(contentScore),
      feedback: wordCount < 50 
        ? 'Your response is too short. Aim for more detailed content.'
        : wordCount > 300
        ? 'Good length! Your response covers the topic well.'
        : 'Adequate length. Consider adding more supporting details.',
    },
    grammar: {
      score: Math.round(grammarScore),
      feedback: grammarScore > 80
        ? 'Excellent grammar usage with minimal errors.'
        : 'Some grammatical errors detected. Review sentence structures.',
    },
    vocabulary: {
      score: Math.round(vocabularyScore),
      feedback: vocabularyScore > 80
        ? 'Rich vocabulary with appropriate word choices.'
        : 'Consider using more varied vocabulary to enhance your writing.',
    },
    spelling: {
      score: Math.round(spellingScore),
      feedback: spellingScore > 85
        ? 'Excellent spelling accuracy.'
        : 'A few spelling errors detected. Proofread carefully.',
    },
    suggestions: [
      'Use more transition words to improve flow',
      'Vary your sentence structures for better readability',
      'Include specific examples to support your arguments',
    ],
    strengths: [
      'Clear main idea',
      avgWordsPerSentence > 15 ? 'Good sentence complexity' : 'Concise writing style',
    ],
    areasForImprovement: [
      'Paragraph organization',
      'Use of advanced vocabulary',
      'Argument development',
    ],
  };
}

function generateSpeakingFeedback(userAnswer: string, questionType: QuestionType): AIFeedbackData {
  // Mock speaking feedback
  // In production, this would analyze audio recordings
  
  const pronunciationScore = 70 + Math.random() * 25;
  const fluencyScore = 65 + Math.random() * 30;
  const contentScore = 70 + Math.random() * 25;
  
  const overallScore = Math.round(
    (pronunciationScore + fluencyScore + contentScore) / 3
  );
  
  return {
    overallScore,
    pronunciation: {
      score: Math.round(pronunciationScore),
      feedback: pronunciationScore > 85
        ? 'Excellent pronunciation with clear enunciation.'
        : 'Work on pronunciation of specific sounds. Practice with native speakers.',
    },
    fluency: {
      score: Math.round(fluencyScore),
      feedback: fluencyScore > 80
        ? 'Smooth delivery with natural pauses.'
        : 'Try to reduce hesitations. Practice speaking on various topics.',
    },
    content: {
      score: Math.round(contentScore),
      feedback: contentScore > 80
        ? 'Comprehensive response covering all points.'
        : 'Include more relevant details in your response.',
    },
    suggestions: [
      'Practice speaking for 2-3 minutes on random topics',
      'Record yourself and listen for areas to improve',
      'Focus on stress and intonation patterns',
    ],
    strengths: [
      'Clear voice projection',
      'Appropriate response length',
    ],
    areasForImprovement: [
      'Pronunciation consistency',
      'Natural flow and rhythm',
      'Vocabulary range',
    ],
  };
}

function generateBasicFeedback(userAnswer: string, correctAnswer?: string): AIFeedbackData {
  const isCorrect = correctAnswer 
    ? userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
    : false;
  
  const overallScore = isCorrect ? 100 : 0;
  
  return {
    overallScore,
    suggestions: isCorrect
      ? ['Keep up the good work!']
      : ['Review the question carefully', 'Practice similar question types'],
    strengths: isCorrect
      ? ['Correct answer selected']
      : [],
    areasForImprovement: isCorrect
      ? []
      : ['Question comprehension', 'Answer selection strategy'],
  };
}

// Function to integrate with OpenAI (for production use)
// Note: Requires 'openai' package to be installed: pnpm add openai
export async function generateAIFeedbackWithOpenAI(
  questionType: QuestionType,
  section: TestSection,
  userAnswer: string,
  correctAnswer?: string
): Promise<AIFeedbackData> {
  // Dynamic import to avoid build errors when package is not installed
  // @ts-ignore - OpenAI package may not be installed in development
  const { default: OpenAI } = await import('openai');

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const systemPrompt = `You are an expert PTE Academic exam scorer. Analyze the student's response and provide detailed, constructive feedback in JSON format.

For ${section} section, specifically ${questionType} questions, evaluate the response based on PTE scoring criteria.

Return a JSON object with this exact structure:
{
  "overallScore": number (0-90),
  "pronunciation": { "score": number, "feedback": "string" } (only for SPEAKING),
  "fluency": { "score": number, "feedback": "string" } (only for SPEAKING),
  "content": { "score": number, "feedback": "string" } (for SPEAKING and WRITING),
  "grammar": { "score": number, "feedback": "string" } (only for WRITING),
  "vocabulary": { "score": number, "feedback": "string" } (only for WRITING),
  "spelling": { "score": number, "feedback": "string" } (only for WRITING),
  "suggestions": ["string array of improvement suggestions"],
  "strengths": ["string array of strengths"],
  "areasForImprovement": ["string array of areas to improve"]
}

Be specific, constructive, and follow PTE Academic scoring guidelines.`;

  const userPrompt = `Question Type: ${questionType}
Section: ${section}
${correctAnswer ? `Correct Answer: ${correctAnswer}` : ''}
Student's Answer: ${userAnswer}

Please provide detailed feedback following PTE scoring criteria.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  try {
    const feedback = JSON.parse(content.trim());
    return feedback as AIFeedbackData;
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', content);
    throw new Error('Invalid JSON response from OpenAI');
  }
}
