// PTE Content Question Types & Score Information Table V4
// Based on APEUni Score Breakdown (Effective from 25.08.07)

export interface QuestionTypeScoreInfo {
  sequence: number;
  questionType: string;
  abbreviation: string;
  numbers: string; // e.g., "6-7", "10-12"
  timeForAnswering: string; // e.g., "Preparation: 35s or 40s, Answer: 40s"
  speaking?: number; // Percentage contribution to Speaking
  writing?: number; // Percentage contribution to Writing
  reading?: number; // Percentage contribution to Reading
  listening?: number; // Percentage contribution to Listening
  section: 'Speaking & Writing' | 'Reading' | 'Listening';
  duration?: string; // Section duration like "76-84 mins"
}

export const pteScoreBreakdown: QuestionTypeScoreInfo[] = [
  // I. Speaking & Writing (76-84 mins)
  {
    sequence: 1,
    questionType: 'Read Aloud',
    abbreviation: 'RA',
    numbers: '6-7',
    timeForAnswering: 'Preparation: 35s or 40s, Answer: 40s',
    speaking: 14,
    section: 'Speaking & Writing',
  },
  {
    sequence: 2,
    questionType: 'Repeat Sentence',
    abbreviation: 'RS',
    numbers: '10-12',
    timeForAnswering: 'No preparation, Answer: 15s',
    speaking: 20,
    listening: 19,
    section: 'Speaking & Writing',
  },
  {
    sequence: 3,
    questionType: 'Describe Image',
    abbreviation: 'DI',
    numbers: '5-6',
    timeForAnswering: 'Preparation: 25s, Answer: 40s',
    speaking: 34,
    section: 'Speaking & Writing',
  },
  {
    sequence: 4,
    questionType: 'Re-tell Lecture',
    abbreviation: 'RL',
    numbers: '2-3',
    timeForAnswering: 'Preparation: 10s, Answer: 40s',
    speaking: 11,
    listening: 10,
    section: 'Speaking & Writing',
  },
  {
    sequence: 5,
    questionType: 'Answer Short Question',
    abbreviation: 'ASQ',
    numbers: '5-6',
    timeForAnswering: 'No preparation, Answer: 10s',
    speaking: 5,
    listening: 5,
    section: 'Speaking & Writing',
  },
  {
    sequence: 6,
    questionType: 'Summarize Spoken Text',
    abbreviation: 'SGD',
    numbers: '2-3',
    timeForAnswering: 'Preparation: 10s, Answer: 2 min',
    speaking: 13,
    listening: 15,
    section: 'Speaking & Writing',
  },
  {
    sequence: 7,
    questionType: 'Summarize Written Text',
    abbreviation: 'RTS',
    numbers: '2-3',
    timeForAnswering: 'Preparation: 10s, Answer: 40s',
    speaking: 8,
    section: 'Speaking & Writing',
  },
  {
    sequence: 8,
    questionType: 'Reading & Writing: Fill in the Blanks',
    abbreviation: 'SWT',
    numbers: '2',
    timeForAnswering: '10 mins per question (timed individually)',
    writing: 25.5,
    reading: 19,
    section: 'Speaking & Writing',
  },
  {
    sequence: 9,
    questionType: 'Write Essay',
    abbreviation: 'WE',
    numbers: '1',
    timeForAnswering: '20 mins per question (timed individually)',
    writing: 25.5,
    section: 'Speaking & Writing',
  },
  
  // II. Reading (23-30 mins)
  {
    sequence: 10,
    questionType: 'Fill in the Blanks - Drop Down',
    abbreviation: 'FIB_Drop Down',
    numbers: '5-6',
    timeForAnswering: 'Recommended response time: ≤ 2 mins',
    reading: 28,
    section: 'Reading',
  },
  {
    sequence: 11,
    questionType: 'Multiple Choice, Multiple Answer - Reading',
    abbreviation: 'MCM_R',
    numbers: '2-3',
    timeForAnswering: 'Recommended response time: ≤ 1-1.5 mins',
    reading: 6,
    section: 'Reading',
  },
  {
    sequence: 12,
    questionType: 'Re-order Paragraphs',
    abbreviation: 'RO',
    numbers: '2-3',
    timeForAnswering: 'Recommended response time: ≤ 1.5-2 mins',
    reading: 8,
    section: 'Reading',
  },
  {
    sequence: 13,
    questionType: 'Fill in the Blanks - Drag and Drop',
    abbreviation: 'FIB_Drag',
    numbers: '4-5',
    timeForAnswering: 'Recommended response time: ≤ 2 mins',
    reading: 18,
    section: 'Reading',
  },
  {
    sequence: 14,
    questionType: 'Multiple Choice, Single Answer - Reading',
    abbreviation: 'MCS_R',
    numbers: '2-3',
    timeForAnswering: 'Recommended response time: ≤ 1-1.5 mins',
    reading: 2,
    section: 'Reading',
  },
  
  // III. Listening (31-39 mins)
  {
    sequence: 15,
    questionType: 'Summarize Spoken Text',
    abbreviation: 'SST',
    numbers: '1',
    timeForAnswering: 'Each question: 10 minutes (timed individually)',
    writing: 23.5,
    listening: 10,
    section: 'Listening',
  },
  {
    sequence: 16,
    questionType: 'Multiple Choice, Multiple Answer - Listening',
    abbreviation: 'MCM_L',
    numbers: '2-3',
    timeForAnswering: 'Recommended response time: ≤ 1-1.5 mins',
    listening: 4,
    section: 'Listening',
  },
  {
    sequence: 17,
    questionType: 'Fill in the Blanks - Listening',
    abbreviation: 'FIB_L',
    numbers: '2-3',
    timeForAnswering: 'Recommended response time: ≤ 2 mins',
    listening: 9,
    section: 'Listening',
  },
  {
    sequence: 18,
    questionType: 'Highlight Correct Summary',
    abbreviation: 'HCS',
    numbers: '2-3',
    timeForAnswering: 'Recommended response time: ≤ 1-1.5 mins',
    reading: 3,
    listening: 1,
    section: 'Listening',
  },
  {
    sequence: 19,
    questionType: 'Multiple Choice, Single Answer - Listening',
    abbreviation: 'MCS_L',
    numbers: '2-3',
    timeForAnswering: 'Recommended response time: ≤ 1-1.5 mins',
    listening: 1,
    section: 'Listening',
  },
  {
    sequence: 20,
    questionType: 'Select Missing Word',
    abbreviation: 'SMW',
    numbers: '1-2',
    timeForAnswering: 'Recommended response time: ≤ 1-1.5 mins',
    listening: 1,
    section: 'Listening',
  },
  {
    sequence: 21,
    questionType: 'Highlight Incorrect Words',
    abbreviation: 'HIW',
    numbers: '2-3',
    timeForAnswering: 'Recommended response time: ≤ 2 minutes',
    reading: 16,
    listening: 11,
    section: 'Listening',
  },
  {
    sequence: 22,
    questionType: 'Write From Dictation',
    abbreviation: 'WFD',
    numbers: '3-4',
    timeForAnswering: '2 minutes per question',
    writing: 25.5,
    listening: 14,
    section: 'Listening',
  },
];

// Section summaries
export const sectionSummaries = {
  'Speaking & Writing': {
    duration: '76-84 mins',
    questionCount: 9,
    totalQuestions: '30-35',
  },
  'Reading': {
    duration: '23-30 mins',
    questionCount: 5,
    totalQuestions: '15-20',
  },
  'Listening': {
    duration: '31-39 mins',
    questionCount: 8,
    totalQuestions: '13-19',
  },
};

// Helper functions
export function getQuestionTypeBySequence(sequence: number): QuestionTypeScoreInfo | undefined {
  return pteScoreBreakdown.find(q => q.sequence === sequence);
}

export function getQuestionsBySection(section: QuestionTypeScoreInfo['section']): QuestionTypeScoreInfo[] {
  return pteScoreBreakdown.filter(q => q.section === section);
}

export function getTotalScoreContribution(skill: 'speaking' | 'writing' | 'reading' | 'listening'): number {
  return pteScoreBreakdown.reduce((total, question) => {
    return total + (question[skill] || 0);
  }, 0);
}

