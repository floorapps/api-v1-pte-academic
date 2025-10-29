import { AIFeedbackData, QuestionType, TestSection } from './types';

// This is a mock AI feedback service
// In production, integrate with OpenAI or similar AI service

export async function generateAIFeedback(
  questionType: QuestionType,
  section: TestSection,
  userAnswer: string,
  correctAnswer?: string
): Promise<AIFeedbackData> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For writing tasks (essays, summaries)
  if (section === 'WRITING') {
    return generateWritingFeedback(userAnswer, questionType);
  }
  
  // For speaking tasks
  if (section === 'SPEAKING') {
    return generateSpeakingFeedback(userAnswer, questionType);
  }
  
  // For other sections (basic scoring)
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
export async function generateAIFeedbackWithOpenAI(
  prompt: string,
  apiKey: string
): Promise<AIFeedbackData> {
  // Example integration with OpenAI
  // Uncomment and configure when ready to use
  /*
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert PTE exam scorer. Provide detailed feedback on test responses.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  });
  
  const data = await response.json();
  const feedback = JSON.parse(data.choices[0].message.content);
  return feedback;
  */
  
  // Return mock feedback for now
  return generateBasicFeedback(prompt);
}
