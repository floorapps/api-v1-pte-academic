"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  Mic, 
  Clock, 
  CheckCircle, 
  XCircle,
  Volume2,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BaseQuestionProps {
  question: {
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
  };
  onComplete: (result: QuestionResult) => void;
  showFeedback?: boolean;
}

interface QuestionResult {
  questionId: string;
  userAnswer: any;
  score?: number;
  feedback?: string;
  timeSpent: number;
}

// Audio Recording Component
function AudioRecorder({ 
  onRecordingComplete, 
  disabled = false 
}: { 
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        onRecordingComplete(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        variant={isRecording ? "destructive" : "default"}
        size="sm"
        className="flex items-center gap-2"
      >
        {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        {isRecording ? 'Stop' : 'Record'}
      </Button>
      
      {isRecording && (
        <div className="flex items-center gap-2 text-red-600">
          <div className="h-3 w-3 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
        </div>
      )}
    </div>
  );
}

// Multiple Choice Question
function MultipleChoiceQuestion({ question, onComplete, showFeedback = false }: BaseQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState(false);

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    onComplete({
      questionId: question.id,
      userAnswer: selectedAnswer,
      score: selectedAnswer === question.correctAnswer ? 1 : 0,
      timeSpent: 0
    });
    setIsAnswered(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="outline">Multiple Choice</Badge>
        {question.timeLimit && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            {question.timeLimit}s
          </div>
        )}
      </div>

      <div className="space-y-4">
        {question.text && <p className="text-lg">{question.text}</p>}
        
        {question.imageUrl && (
          <div className="flex justify-center">
            <img 
              src={question.imageUrl} 
              alt="Question" 
              className="max-w-md rounded-lg border"
            />
          </div>
        )}

        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <div
              key={index}
              onClick={() => !isAnswered && setSelectedAnswer(option)}
              className={cn(
                "p-4 border rounded-lg cursor-pointer transition-colors",
                selectedAnswer === option
                  ? "border-blue-500 bg-blue-50"
                  : "hover:bg-gray-50",
                isAnswered && option === question.correctAnswer && "border-green-500 bg-green-50",
                isAnswered && option === selectedAnswer && option !== question.correctAnswer && "border-red-500 bg-red-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                  selectedAnswer === option ? "border-blue-500 bg-blue-500" : "border-gray-300"
                )}>
                  {selectedAnswer === option && <CheckCircle className="h-3 w-3 text-white" />}
                </div>
                <span className="flex-1">{option}</span>
                {isAnswered && option === question.correctAnswer && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {isAnswered && option === selectedAnswer && option !== question.correctAnswer && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        {!isAnswered && (
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedAnswer}
            className="w-full"
          >
            Submit Answer
          </Button>
        )}
      </div>
    </div>
  );
}

// Speaking Question
function SpeakingQuestion({ question, onComplete, showFeedback = false }: BaseQuestionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
  };

  const handleSubmit = () => {
    if (!audioBlob) return;
    
    onComplete({
      questionId: question.id,
      userAnswer: audioBlob,
      score: undefined, // AI will score this
      timeSpent: 0
    });
    setIsAnswered(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="outline">Speaking</Badge>
        {question.timeLimit && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            {question.timeLimit}s
          </div>
        )}
        <Badge className="bg-yellow-500 text-yellow-900">AI Scoring</Badge>
      </div>

      <div className="space-y-4">
        {question.description && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <p>{question.description}</p>
          </div>
        )}

        {question.text && (
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Text to read:</h4>
            <p className="text-lg leading-relaxed">{question.text}</p>
          </div>
        )}

        {question.imageUrl && (
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Image to describe:
            </h4>
            <img 
              src={question.imageUrl} 
              alt="Describe this image" 
              className="max-w-lg mx-auto rounded-lg"
            />
          </div>
        )}

        <AudioRecorder 
          onRecordingComplete={handleRecordingComplete}
          disabled={isAnswered}
        />

        {audioBlob && !isAnswered && (
          <Button onClick={handleSubmit} className="w-full">
            Submit Response
          </Button>
        )}

        {isAnswered && (
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 font-medium">
              ✓ Response submitted successfully. AI feedback will be available shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Writing Question
function WritingQuestion({ question, onComplete, showFeedback = false }: BaseQuestionProps) {
  const [text, setText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [text]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    
    onComplete({
      questionId: question.id,
      userAnswer: text,
      score: undefined, // AI will score this
      timeSpent: 0
    });
    setIsAnswered(true);
  };

  const minWords = question.type === 'summarize' ? 50 : 200;
  const maxWords = question.type === 'summarize' ? 70 : 300;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="outline">Writing</Badge>
        {question.timeLimit && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            {question.timeLimit}s
          </div>
        )}
        <Badge className="bg-yellow-500 text-yellow-900">AI Scoring</Badge>
      </div>

      <div className="space-y-4">
        {question.description && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <p>{question.description}</p>
          </div>
        )}

        {question.text && (
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Text to summarize:</h4>
            <p className="text-base leading-relaxed">{question.text}</p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="font-semibold">Your response:</label>
            <span className={cn(
              "text-sm",
              wordCount < minWords ? "text-red-500" : 
              wordCount > maxWords ? "text-yellow-600" : "text-green-600"
            )}>
              {wordCount} words
              {question.type === 'summarize' && (
                <span className="text-gray-500"> (target: {minWords}-{maxWords})</span>
              )}
            </span>
          </div>
          
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your response here..."
            className="min-h-[200px]"
            disabled={isAnswered}
          />
        </div>

        {!isAnswered && text.trim() && (
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={wordCount < minWords}
          >
            Submit Response
          </Button>
        )}

        {isAnswered && (
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 font-medium">
              ✓ Response submitted successfully. AI feedback will be available shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Question Interface Component
export function QuestionInterface({ 
  question, 
  onComplete, 
  showFeedback = false 
}: BaseQuestionProps) {
  const renderQuestion = () => {
    const questionType = question.type.toLowerCase();
    
    if (questionType.includes('speaking') || questionType.includes('read_aloud') || 
        questionType.includes('repeat_sentence') || questionType.includes('describe_image') || 
        questionType.includes('retell_lecture') || questionType.includes('answer_short')) {
      return <SpeakingQuestion question={question} onComplete={onComplete} showFeedback={showFeedback} />;
    }
    
    if (questionType.includes('writing') || questionType.includes('summarize') || questionType.includes('essay')) {
      return <WritingQuestion question={question} onComplete={onComplete} showFeedback={showFeedback} />;
    }
    
    return <MultipleChoiceQuestion question={question} onComplete={onComplete} showFeedback={showFeedback} />;
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {question.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderQuestion()}
      </CardContent>
    </Card>
  );
}