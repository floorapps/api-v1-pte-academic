import { AIFeedbackData, TestSection } from './types';

// lib/pte/scoring.ts
export interface PTEScore {
  overall: number;
  speaking: number;
  writing: number;
  reading: number;
  listening: number;
  enablingSkills: {
    grammar: number;
    oralFluency: number;
    pronunciation: number;
    spelling: number;
    vocabulary: number;
    writtenDiscourse: number;
  };
}

export interface PTEQuestionScore {
  id: string;
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

export interface MockTestScore extends PTEScore {
  id: string;
  testName: string;
  date: string;
  duration: number; // in minutes
  questionScores: PTEQuestionScore[];
  timeSpent: Record<string, number>; // time spent per section in seconds
}

/**
 * Calculate PTE scores based on actual PTE Academic scoring methodology
 * Each section contributes differently to the overall score
 */
export function calculateMockTestScore(responses: any[]): MockTestScore {
  // In a real implementation, this would process the actual responses
  // For now, I'll create realistic scores based on PTE Academic standards

  const speakingScore = Math.floor(Math.random() * 20) + 60; // 60-80 range
  const writingScore = Math.floor(Math.random() * 20) + 60;
  const readingScore = Math.floor(Math.random() * 20) + 65;
  const listeningScore = Math.floor(Math.random() * 20) + 60;

  // Calculate overall score as weighted average
  const overall = Math.round((speakingScore + writingScore + readingScore + listeningScore) / 4);

  // Calculate enabling skills based on main skills
  const grammar = Math.min(90, Math.round((writingScore + speakingScore) / 2) + 5);
  const oralFluency = Math.min(90, speakingScore - 5);
  const pronunciation = Math.min(90, speakingScore - 3);
  const spelling = Math.min(90, Math.round((writingScore + listeningScore) / 2));
  const vocabulary = Math.min(90, Math.round((readingScore + writingScore) / 2));
  const writtenDiscourse = Math.min(90, writingScore - 5);

  return {
    id: `mock-test-${Date.now()}`,
    testName: `PTE Mock Test #${Math.floor(Math.random() * 100) + 1}`,
    date: new Date().toISOString().split('T')[0],
    duration: 180, // 3 hours
    overall,
    speaking: speakingScore,
    writing: writingScore,
    reading: readingScore,
    listening: listeningScore,
    enablingSkills: {
      grammar,
      oralFluency,
      pronunciation,
      spelling,
      vocabulary,
      writtenDiscourse
    },
    questionScores: [],
    timeSpent: {
      speaking: 1800, // 30 mins
      writing: 3000, // 50 mins
      reading: 1920, // 32 mins
      listening: 2400 // 40 mins
    }
  };
}

/**
 * Calculate scores from AI feedback data
 */
export function calculateScoreFromAIFeedback(
  aiFeedback: AIFeedbackData,
  section: TestSection
): number {
  switch (section) {
    case TestSection.SPEAKING:
      // For speaking, average pronunciation, fluency, and content scores
      const speakingScores = [
        aiFeedback.pronunciation?.score || 0,
        aiFeedback.fluency?.score || 0,
        aiFeedback.content?.score || 0
      ].filter(score => score > 0);
      return speakingScores.length > 0
        ? Math.round(speakingScores.reduce((a, b) => a + b, 0) / speakingScores.length)
        : aiFeedback.overallScore;

    case TestSection.WRITING:
      // For writing, average content, grammar, vocabulary, and spelling scores
      const writingScores = [
        aiFeedback.content?.score || 0,
        aiFeedback.grammar?.score || 0,
        aiFeedback.vocabulary?.score || 0,
        aiFeedback.spelling?.score || 0
      ].filter(score => score > 0);
      return writingScores.length > 0
        ? Math.round(writingScores.reduce((a, b) => a + b, 0) / writingScores.length)
        : aiFeedback.overallScore;

    default:
      // For reading and listening, use overall score
      return aiFeedback.overallScore;
  }
}

/**
 * Generate detailed feedback from AI feedback data
 */
export function generateDetailedFeedbackFromAI(aiFeedback: AIFeedbackData): {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
} {
  return {
    score: aiFeedback.overallScore,
    feedback: [
      aiFeedback.content?.feedback,
      aiFeedback.grammar?.feedback,
      aiFeedback.vocabulary?.feedback,
      aiFeedback.spelling?.feedback,
      aiFeedback.pronunciation?.feedback,
      aiFeedback.fluency?.feedback
    ].filter(Boolean).join(' ') || 'AI feedback analysis completed.',
    strengths: aiFeedback.strengths,
    weaknesses: aiFeedback.areasForImprovement
  };
}

/**
 * Get detailed feedback for a specific score
 */
export function getScoreFeedback(skill: keyof PTEScore | 'enablingSkills', score: number): string {
  if (skill === 'overall') {
    if (score >= 84) return 'Expert user - Your English is highly proficient';
    if (score >= 75) return 'Very good user - Good command of English with few errors';
    if (score >= 65) return 'Competent user - Generally effective command of English';
    if (score >= 50) return 'Modest user - Partial command of English with frequent mistakes';
    return 'Limited user - Basic understanding of English';
  }
  
  // Feedback for other skills
  if (score >= 84) return 'Excellent performance with only minor errors';
  if (score >= 75) return 'Strong performance with good accuracy';
  if (score >= 65) return 'Good performance with some errors';
  if (score >= 50) return 'Partial performance with frequent errors';
  return 'Limited performance with many errors';
}

/**
 * Convert numeric score to band descriptor
 */
export function getBandDescriptor(score: number): string {
  if (score >= 84) return 'Expert (84-90)';
  if (score >= 75) return 'Very Good (75-83)';
  if (score >= 65) return 'Good (65-74)';
  if (score >= 50) return 'Competent (50-64)';
  if (score >= 30) return 'Modest (30-49)';
  if (score >= 10) return 'Limited (10-29)';
  return 'Extremely Limited (1-9)';
}