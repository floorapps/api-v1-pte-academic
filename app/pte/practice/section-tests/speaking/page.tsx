"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Mic,
  RotateCcw,
  Volume2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initialCategories } from "@/lib/pte/data";

// Define types for our speaking questions
type SpeakingQuestion = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  example?: string;
  tips?: string[];
  duration: number; // in seconds
  category: string;
  audioUrl?: string;
  imageUrl?: string;
};

type SpeakingTab = {
  id: string;
  title: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  question_count?: number;
  questions: SpeakingQuestion[];
};

interface SpeakingPracticePageProps {
  params: Promise<{
    category: string;
  }>;
}

export default function SpeakingPracticePage(props: SpeakingPracticePageProps) {
  const params = use(props.params);
  const { category } = params;
  const [activeTab, setActiveTab] = useState(category || "read-aloud");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [speakingData, setSpeakingData] = useState<SpeakingTab[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch and transform the speaking data from initialCategories
  useEffect(() => {
    const fetchSpeakingData = () => {
      // Get all speaking categories (where parent is 1 - the speaking parent)
      const speakingCategories = initialCategories.filter(
        (cat) => cat.parent === 1
      );

      // Transform to the format expected by our component
      const transformedData: SpeakingTab[] = speakingCategories.map((cat) => ({
        id: cat.code,
        title: cat.title,
        shortName: cat.short_name || cat.code.toUpperCase(),
        description: cat.description,
        icon: cat.icon,
        color: cat.color || "#6366f1", // Default blue color if none provided
        question_count: cat.question_count,
        questions: [], // For now, we'll use placeholder questions
      }));

      // For now, create some placeholder questions for each category
      const dataWithQuestions = transformedData.map((tab) => ({
        ...tab,
        questions: Array.from({ length: tab.question_count || 5 }, (_, i) => ({
          id: `${tab.id}-${i + 1}`,
          title: `${tab.title} Practice Question ${i + 1}`,
          description: tab.description,
          instructions: `Instructions for ${tab.title}. This is question ${
            i + 1
          } in the ${tab.title} category.`,
          example: `This is a sample ${tab.title} example`,
          tips: ["Sample tip 1", "Sample tip 2"],
          duration: tab.id.includes("read-aloud")
            ? 40
            : tab.id.includes("repeat-sentence")
            ? 15
            : tab.id.includes("describe-image")
            ? 65
            : tab.id.includes("retell-lecture")
            ? 50
            : tab.id.includes("answer-short-question")
            ? 10
            : 40,
          category: tab.id,
        })),
      }));

      setSpeakingData(dataWithQuestions);
      setLoading(false);
    };

    fetchSpeakingData();
  }, []);

  // Get the current tab data
  const currentTab = speakingData.find((tab) => tab.id === activeTab);
  const currentQuestion = currentTab?.questions[currentQuestionIndex];

  // Handle starting the question
  const startQuestion = () => {
    setTimerActive(true);

    // Start timer based on question duration
    let timeLeft = currentQuestion?.duration || 40;
    setTimer(timeLeft);

    const timerInterval = setInterval(() => {
      timeLeft -= 1;
      setTimer(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        setTimerActive(false);
      }
    }, 1000);
  };

  // Handle recording
  const toggleRecording = () => {
    if (!recording) {
      startQuestion(); // Start the timer when recording starts
    }
    setRecording(!recording);
  };

  // Handle audio playback
  const playAudio = () => {
    setAudioPlaying(true);
    // Simulate audio playback
    setTimeout(() => {
      setAudioPlaying(false);
    }, 2000);
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (
      currentQuestion &&
      currentQuestionIndex < currentTab!.questions.length - 1
    ) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Reset timer when question changes
  useEffect(() => {
    if (currentQuestion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset timer value on question change
      setTimer(currentQuestion.duration);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset active flag on question change
      setTimerActive(false);
    }
  }, [currentQuestionIndex, currentQuestion]);

  if (loading || !currentTab || !currentQuestion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/pte/academic/practice">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Practice
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">PTE Speaking Practice</h1>
        </div>

        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">
              Loading speaking practice...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/pte/academic/practice">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Practice
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">PTE Speaking Practice</h1>
            <p className="text-muted-foreground">
              Practice your speaking skills for the PTE Academic test
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {speakingData.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <Image
                  src={tab.icon}
                  alt={tab.title}
                  width={32}
                  height={32}
                  className="mb-1"
                />
                <div
                  className="absolute -bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 transform rounded-full text-xs"
                  style={{ backgroundColor: tab.color }}
                />
              </div>
              <span className="text-xs">{tab.shortName}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {speakingData.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {/* Question Bank */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span>Questions</span>
                      <span className="text-muted-foreground text-sm">
                        ({tab.questions.length})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[600px] space-y-2 overflow-y-auto pr-2">
                      {tab.questions.map((question, index) => (
                        <div
                          key={question.id}
                          className={`cursor-pointer rounded p-3 transition-colors ${
                            index === currentQuestionIndex
                              ? "bg-primary/10 border-primary border"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => setCurrentQuestionIndex(index)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium">
                              {index + 1}
                            </span>
                            <span className="truncate text-sm">
                              {question.title}
                            </span>
                          </div>
                          <div className="text-muted-foreground mt-1 ml-8 text-xs">
                            {question.description.substring(0, 40)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Question Content */}
              <div className="space-y-4 lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image
                        src={tab.icon}
                        alt={tab.title}
                        width={32}
                        height={32}
                        className="rounded bg-gray-100 p-1"
                      />
                      <span>{currentQuestion.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-2 font-medium">Instructions:</h3>
                        <div className="rounded-md bg-blue-50 p-4 text-sm">
                          <p>{currentQuestion.instructions}</p>
                        </div>
                      </div>

                      {currentQuestion.description && (
                        <div>
                          <h3 className="mb-2 font-medium">
                            Task Description:
                          </h3>
                          <p className="text-muted-foreground">
                            {currentQuestion.description}
                          </p>
                        </div>
                      )}

                      {/* Content based on question type */}
                      {tab.id === "s_read_aloud" && (
                        <div className="bg-muted rounded-md p-4 text-lg leading-relaxed">
                          {currentQuestion.example ||
                            "Please read the text aloud as naturally as possible."}
                        </div>
                      )}

                      {tab.id === "s_describe_image" && (
                        <div className="flex flex-col items-center">
                          <div className="flex h-64 w-full items-center justify-center rounded-xl border-2 border-dashed bg-gray-200">
                            <span className="text-gray-500">
                              Question Image
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-4 text-center">
                            {currentQuestion.example ||
                              "Describe the image in detail."}
                          </p>
                        </div>
                      )}

                      {(tab.id === "s_repeat_sentence" ||
                        tab.id === "s_retell_lecture" ||
                        tab.id === "s_short_question" ||
                        tab.id === "s_respond_situation_academic") && (
                        <div className="flex flex-col items-center space-y-4">
                          <div className="flex h-32 w-full items-center justify-center rounded-xl border-2 border-dashed bg-gray-200">
                            <span className="text-gray-500">Audio Content</span>
                          </div>
                          <p className="text-muted-foreground text-center">
                            {currentQuestion.example}
                          </p>
                        </div>
                      )}

                      {currentQuestion.tips &&
                        currentQuestion.tips.length > 0 && (
                          <div>
                            <h3 className="mb-2 font-medium">Tips:</h3>
                            <ul className="list-inside list-disc space-y-1">
                              {currentQuestion.tips.map((tip, index) => (
                                <li
                                  key={index}
                                  className="text-muted-foreground"
                                >
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      <div className="pt-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Time Remaining
                          </span>
                          <span className="text-sm">{timer}s</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="bg-primary h-full transition-all duration-1000"
                            style={{
                              width: `${
                                (timer / currentQuestion.duration) * 100
                              }%`,
                              backgroundColor: tab.color,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={playAudio}
                          disabled={audioPlaying}
                        >
                          <Volume2 className="mr-2 h-4 w-4" />
                          {audioPlaying ? "Playing..." : "Listen"}
                        </Button>

                        <Button
                          onClick={toggleRecording}
                          variant={recording ? "destructive" : "default"}
                        >
                          <Mic
                            className={`mr-2 h-4 w-4 ${
                              recording ? "animate-pulse" : ""
                            }`}
                          />
                          {recording ? "Stop Recording" : "Start Recording"}
                        </Button>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button
                          onClick={prevQuestion}
                          variant="outline"
                          disabled={currentQuestionIndex === 0}
                        >
                          Previous
                        </Button>

                        <div className="flex gap-2">
                          <Button variant="outline">Save Answer</Button>
                          <Button>Submit Answer</Button>
                        </div>

                        <Button
                          onClick={nextQuestion}
                          variant="outline"
                          disabled={
                            currentQuestionIndex === tab.questions.length - 1
                          }
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Feedback Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>AI Feedback</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-primary text-3xl font-bold">
                          7.5
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Overall Score
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-500">
                          8.0
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Fluency
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-500">
                          7.0
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Pronunciation
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="mb-2 font-medium">Feedback Summary:</h4>
                      <p className="text-muted-foreground text-sm">
                        Good pronunciation with clear articulation. Work on
                        maintaining a natural rhythm and reducing hesitations.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
