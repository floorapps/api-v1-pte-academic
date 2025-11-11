"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { QuestionInterface } from './question-interface';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Trophy,
  Target,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  type: string;
  title: string;
  description: string;
  timeLimit?: number;
  audioUrl?: string;
  imageUrl?: string;
  text?: string;
  options?: string[];
  correctAnswer?: string | string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface SessionResult {
  questionId: string;
  userAnswer: any;
  score?: number;
  feedback?: string;
  timeSpent: number;
  completedAt: Date;
}

interface PracticeSessionProps {
  questionType: string;
  questionCount?: number;
  timeLimit?: number; // in minutes
  onSessionComplete: (results: SessionResult[]) => void;
}

export function PracticeSession({ 
  questionType, 
  questionCount = 10, 
  timeLimit,
  onSessionComplete 
}: PracticeSessionProps) {
  const [session, setSession] = useState({
    isActive: false,
    isPaused: false,
    currentQuestionIndex: 0,
    results: [] as SessionResult[],
    startTime: null as Date | null,
    elapsedTime: 0,
    questions: [] as Question[]
  });

  const [sessionTime, setSessionTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (session.isActive && !session.isPaused) {
      interval = setInterval(() => {
        setSessionTime(prev => {
          const newTime = prev + 1;
          
          // Check if session time limit is reached
          if (timeLimit && newTime >= timeLimit * 60) {
            handleSessionComplete();
            return newTime;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [session.isActive, session.isPaused, timeLimit]);

  // Generate sample questions based on type
  useEffect(() => {
    const questions = generateQuestions(questionType, questionCount);
    setSession(prev => ({ ...prev, questions }));
  }, [questionType, questionCount]);

  const generateQuestions = (type: string, count: number): Question[] => {
    const questions: Question[] = [];
    
    for (let i = 0; i < count; i++) {
      const baseQuestion: Question = {
        id: `${type}-${i + 1}`,
        type,
        title: `${type.replace('_', ' ').toUpperCase()} Question ${i + 1}`,
        description: getQuestionDescription(type),
        timeLimit: getTimeLimit(type),
        difficulty: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as any
      };

      // Add type-specific content
      switch (type.toLowerCase()) {
        case 's_read_aloud':
        case 'read_aloud':
          baseQuestion.text = generateReadAloudText();
          break;
        case 's_repeat_sentence':
        case 'repeat_sentence':
          baseQuestion.text = generateRepeatSentence();
          baseQuestion.audioUrl = '/audio/sample-sentence.mp3';
          break;
        case 's_describe_image':
        case 'describe_image':
          baseQuestion.imageUrl = '/images/sample-image.jpg';
          baseQuestion.text = 'Describe the image in detail.';
          break;
        case 's_retell_lecture':
        case 'retell_lecture':
          baseQuestion.audioUrl = '/audio/sample-lecture.mp3';
          baseQuestion.text = 'Listen to the lecture and retell the main points.';
          break;
        case 's_short_question':
        case 'answer_short_question':
          baseQuestion.audioUrl = '/audio/sample-question.mp3';
          baseQuestion.text = 'What is the capital of Australia?';
          break;
        case 'w_summarize_text':
        case 'summarize_text':
          baseQuestion.text = generateLongText();
          break;
        case 'w_essay':
        case 'essay':
          baseQuestion.text = 'Technology has transformed the way we work and communicate. Write an essay discussing both the benefits and challenges of this transformation.';
          break;
        default:
          // Multiple choice questions
          baseQuestion.text = generateMCQText();
          baseQuestion.options = generateMCQOptions();
          baseQuestion.correctAnswer = baseQuestion.options[0];
      }
      
      questions.push(baseQuestion);
    }
    
    return questions;
  };

  const getQuestionDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      's_read_aloud': 'Read the following text aloud as naturally as possible.',
      's_repeat_sentence': 'Listen to the sentence and repeat it exactly as you hear it.',
      's_describe_image': 'Look at the image and describe it in detail.',
      's_retell_lecture': 'Listen to the lecture and summarize the main points.',
      's_short_question': 'Listen to the question and provide a brief answer.',
      'w_summarize_text': 'Read the passage and summarize it in one sentence.',
      'w_essay': 'Write an essay on the given topic.',
      'r_mcq_single': 'Choose the single best answer.',
      'r_mcq_multiple': 'Choose all that apply.',
      'r_fib': 'Fill in the blanks with the correct words.'
    };
    
    return descriptions[type] || 'Answer the following question.';
  };

  const getTimeLimit = (type: string): number => {
    const limits: Record<string, number> = {
      's_read_aloud': 40,
      's_repeat_sentence': 15,
      's_describe_image': 40,
      's_retell_lecture': 40,
      's_short_question': 10,
      'w_summarize_text': 10 * 60,
      'w_essay': 20 * 60,
      'r_mcq_single': 90,
      'r_mcq_multiple': 90,
      'r_fib': 120
    };
    
    return limits[type] || 60;
  };

  // Sample content generators (in real app, these would come from a database)
  const generateReadAloudText = () => 
    "The rapid advancement of technology has fundamentally transformed the way we communicate, work, and interact with one another. While these changes have brought numerous benefits, they have also presented new challenges that society continues to navigate.";

  const generateRepeatSentence = () => 
    "Climate change represents one of the most significant challenges facing humanity in the 21st century.";

  const generateLongText = () => 
    "The emergence of artificial intelligence has revolutionized various industries, from healthcare to finance, creating new opportunities while also raising concerns about job displacement. As AI systems become more sophisticated, they are able to perform complex tasks that were once thought to be exclusively human domains. However, this technological advancement also requires careful consideration of ethical implications and the need for responsible development practices.";

  const generateMCQText = () => 
    "What is the main purpose of the passage?";

  const generateMCQOptions = () => [
    "To describe the impact of artificial intelligence",
    "To argue for stricter AI regulations", 
    "To explain how AI works technically",
    "To predict the future of technology"
  ];

  const startSession = () => {
    setSession(prev => ({
      ...prev,
      isActive: true,
      startTime: new Date()
    }));
  };

  const pauseSession = () => {
    setSession(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleQuestionComplete = (result: any) => {
    const newResult: SessionResult = {
      ...result,
      completedAt: new Date()
    };

    setSession(prev => ({
      ...prev,
      results: [...prev.results, newResult],
      currentQuestionIndex: prev.currentQuestionIndex + 1
    }));

    // Check if session is complete
    if (session.currentQuestionIndex + 1 >= session.questions.length) {
      handleSessionComplete();
    }
  };

  const handleSessionComplete = () => {
    setSession(prev => ({ ...prev, isActive: false }));
    setIsCompleted(true);
    onSessionComplete(session.results);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getScore = (): number => {
    if (session.results.length === 0) return 0;
    const totalScore = session.results.reduce((sum, result) => sum + (result.score || 0), 0);
    return Math.round((totalScore / session.results.length) * 100);
  };

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const progress = session.questions.length > 0 
    ? (session.currentQuestionIndex / session.questions.length) * 100 
    : 0;

  if (isCompleted) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Session Complete!</CardTitle>
          <p className="text-gray-600">Great job on completing your practice session.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{session.results.length}</div>
              <div className="text-sm text-gray-600">Questions Completed</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{getScore()}%</div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatTime(sessionTime)}</div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Summary
            </h3>
            <div className="space-y-2">
              {session.results.map((result, index) => (
                <div key={result.questionId} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Question {index + 1}</span>
                  <div className="flex items-center gap-2">
                    {result.score !== undefined ? (
                      <Badge className={cn(
                        result.score === 1 ? "bg-green-500" : "bg-red-500"
                      )}>
                        {result.score === 1 ? "Correct" : "Incorrect"}
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500 text-yellow-900">Pending Review</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            Start New Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!session.isActive) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <BookOpen className="h-6 w-6" />
            Practice Session: {questionType.replace('_', ' ').toUpperCase()}
          </CardTitle>
          <p className="text-gray-600">Get ready to practice your PTE Academic skills</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{questionCount}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{timeLimit || 'No limit'}</div>
              <div className="text-sm text-gray-600">{timeLimit ? 'Minutes' : 'Unlimited'}</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">AI</div>
              <div className="text-sm text-gray-600">Powered</div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800">Before you start:</h4>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Use headphones for audio questions</li>
                  <li>• Find a quiet environment for speaking questions</li>
                  <li>• Have a microphone ready for recording</li>
                </ul>
              </div>
            </div>
          </div>

          <Button onClick={startSession} className="w-full" size="lg">
            <Play className="h-5 w-5 mr-2" />
            Start Practice Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Question {session.currentQuestionIndex + 1} of {session.questions.length}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                {formatTime(sessionTime)}
                {timeLimit && (
                  <span className="text-gray-400">/ {timeLimit * 60}</span>
                )}
              </div>
            </div>
            <Button
              onClick={pauseSession}
              variant="outline"
              size="sm"
            >
              {session.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </div>
          <Progress value={progress} className="mt-3" />
        </CardContent>
      </Card>

      {/* Current Question */}
      {currentQuestion && !session.isPaused && (
        <QuestionInterface
          question={currentQuestion}
          onComplete={handleQuestionComplete}
        />
      )}

      {/* Pause Overlay */}
      {session.isPaused && (
        <Card>
          <CardContent className="p-8 text-center">
            <Pause className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Session Paused</h3>
            <p className="text-gray-600 mb-4">Take a break when you're ready to continue</p>
            <Button onClick={pauseSession}>
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}