"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Word {
  word: string
  start?: number
  end?: number
  confidence?: number
  isCorrect?: boolean
}

interface TranscriptViewerProps extends React.HTMLAttributes<HTMLDivElement> {
  transcript?: string
  words?: Word[]
  referenceText?: string
  showTimestamps?: boolean
  showConfidence?: boolean
  highlightErrors?: boolean
}

const TranscriptViewer = React.forwardRef<HTMLDivElement, TranscriptViewerProps>(
  (
    {
      className,
      transcript,
      words,
      referenceText,
      showTimestamps = false,
      showConfidence = false,
      highlightErrors = true,
      ...props
    },
    ref
  ) => {
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const getConfidenceColor = (confidence?: number) => {
      if (!confidence) return "text-muted-foreground"
      if (confidence > 0.8) return "text-green-600"
      if (confidence > 0.6) return "text-yellow-600"
      return "text-red-600"
    }

    const getWordStyle = (word: Word) => {
      if (highlightErrors && word.isCorrect === false) {
        return "bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-300 px-1 rounded"
      }
      if (highlightErrors && word.isCorrect === true) {
        return "bg-green-100 text-green-900 dark:bg-green-900/20 dark:text-green-300 px-1 rounded"
      }
      return ""
    }

    return (
      <Card ref={ref} className={cn("w-full", className)} {...props}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Transcript</CardTitle>
            {showConfidence && words && (
              <Badge variant="outline" className="text-xs">
                Avg. Confidence:{" "}
                {Math.round(
                  (words.reduce((sum, w) => sum + (w.confidence || 0), 0) /
                    words.length) *
                    100
                )}
                %
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {referenceText && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1 text-muted-foreground">
                Reference Text:
              </p>
              <p className="text-sm">{referenceText}</p>
            </div>
          )}

          <div className="space-y-2">
            {words && words.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 items-baseline">
                {words.map((word, index) => (
                  <span key={index} className="inline-flex flex-col gap-0.5">
                    <span
                      className={cn(
                        "text-base",
                        getWordStyle(word),
                        showConfidence && getConfidenceColor(word.confidence)
                      )}
                      title={
                        showConfidence
                          ? `Confidence: ${Math.round((word.confidence || 0) * 100)}%`
                          : undefined
                      }
                    >
                      {word.word}
                    </span>
                    {showTimestamps && word.start !== undefined && (
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(word.start)}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            ) : transcript ? (
              <p className="text-base leading-relaxed">{transcript}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No transcript available
              </p>
            )}
          </div>

          {highlightErrors && words && words.length > 0 && (
            <div className="mt-4 pt-4 border-t flex gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/20"></div>
                <span className="text-muted-foreground">Correct</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/20"></div>
                <span className="text-muted-foreground">Incorrect</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)

TranscriptViewer.displayName = "TranscriptViewer"

export { TranscriptViewer, type Word }
