// PTE Test Types and Enums

export enum TestType {
  ACADEMIC = 'ACADEMIC',
  CORE = 'CORE',
}

export enum TestSection {
  READING = 'READING',
  WRITING = 'WRITING',
  LISTENING = 'LISTENING',
  SPEAKING = 'SPEAKING',
}

export enum QuestionType {
  // Speaking
  READ_ALOUD = 'Read Aloud',
  REPEAT_SENTENCE = 'Repeat Sentence',
  DESCRIBE_IMAGE = 'Describe Image',
  RE_TELL_LECTURE = 'Re-tell Lecture',
  ANSWER_SHORT_QUESTION = 'Answer Short Question',
  
  // Writing
  SUMMARIZE_WRITTEN_TEXT = 'Summarize Written Text',
  WRITE_ESSAY = 'Write Essay',
  
  // Reading
  READING_WRITING_BLANKS = 'Reading & Writing: Fill in the Blanks',
  MULTIPLE_CHOICE_SINGLE = 'Multiple Choice, Choose Single Answer',
  MULTIPLE_CHOICE_MULTIPLE = 'Multiple Choice, Choose Multiple Answers',
  REORDER_PARAGRAPHS = 'Re-order Paragraphs',
  READING_BLANKS = 'Reading: Fill in the Blanks',
  
  // Listening
  SUMMARIZE_SPOKEN_TEXT = 'Summarize Spoken Text',
  LISTENING_MULTIPLE_CHOICE_MULTIPLE = 'Listening: Multiple Choice, Choose Multiple Answers',
  LISTENING_BLANKS = 'Fill in the Blanks',
  HIGHLIGHT_CORRECT_SUMMARY = 'Highlight Correct Summary',
  LISTENING_MULTIPLE_CHOICE_SINGLE = 'Listening: Multiple Choice, Choose Single Answer',
  SELECT_MISSING_WORD = 'Select Missing Word',
  HIGHLIGHT_INCORRECT_WORDS = 'Highlight Incorrect Words',
  WRITE_FROM_DICTATION = 'Write from Dictation',
}

export enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
}

export interface QuestionData {
  options?: string[];
  audioUrl?: string;
  imageUrl?: string;
  paragraphs?: string[];
  wordBank?: string[];
  transcript?: string;
  timeLimit?: number; // in seconds
}

export interface AnswerData {
  selectedOption?: string;
  selectedOptions?: string[];
  textAnswer?: string;
  audioRecordingUrl?: string;
  orderedParagraphs?: string[];
  filledBlanks?: { [key: string]: string };
}

export interface AIFeedbackData {
  overallScore: number;
  pronunciation?: {
    score: number;
    feedback: string;
  };
  fluency?: {
    score: number;
    feedback: string;
  };
  grammar?: {
    score: number;
    feedback: string;
  };
  vocabulary?: {
    score: number;
    feedback: string;
  };
  content?: {
    score: number;
    feedback: string;
  };
  spelling?: {
    score: number;
    feedback: string;
  };
  suggestions: string[];
  strengths: string[];
  areasForImprovement: string[];
}

export interface TestAttemptWithDetails {
  id: string;
  testId: string;
  testTitle: string;
  testType: TestType;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
  totalScore?: number;
  readingScore?: number;
  writingScore?: number;
  listeningScore?: number;
  speakingScore?: number;
  answers?: TestAnswerWithFeedback[];
}

export interface TestAnswerWithFeedback {
  id: string;
  questionId: string;
  question: string;
  section: TestSection;
  questionType: QuestionType;
  userAnswer: AnswerData;
  isCorrect?: boolean;
  pointsEarned?: number;
  aiFeedback?: AIFeedbackData;
  submittedAt: Date;
}

export interface UserProgress {
  totalTestsTaken: number;
  averageScore: number;
  sectionScores: {
    reading: number;
    writing: number;
    listening: number;
    speaking: number;
  };
  recentAttempts: TestAttemptWithDetails[];
}
