'use client'

import {
  useEffect,
  useState,
  useOptimistic,
  useTransition,
} from "react";
import { Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

// PTE score to CEFR level mapping
const getCEFRLevel = (score: number): string => {
  if (score < 35) return 'A1'
  if (score < 42) return 'A2'
  if (score < 50) return 'B1'
  if (score < 58) return 'B2'
  if (score < 70) return 'C1'
  return 'C2'
}

interface TargetScoreWidgetProps {
  onUpdate?: (score: number) => void
}

export function TargetScoreWidget({ onUpdate }: TargetScoreWidgetProps) {
  const [targetScore, setTargetScore] = useState<number>(70)
  const [displayTargetScore, addOptimisticTargetScore] = useOptimistic<number, number>(
    targetScore,
    (state, newScore) => newScore
  );
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('70')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchTargetScore()
  }, [])

  const fetchTargetScore = async () => {
    try {
      const response = await fetch('/api/user/target-score')
      const data = await response.json()
      if (data.targetScore) {
        setTargetScore(data.targetScore)
        setEditValue(String(data.targetScore))
      }
    } catch (error) {
      console.error('Error fetching target score:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = () => {
    const score = parseInt(editValue);
    setError("");

    if (isNaN(score) || score < 30 || score > 90) {
      setError("Score must be between 30 and 90");
      return;
    }

    startTransition(async () => {
      const oldTargetScore = targetScore;
      addOptimisticTargetScore(score);
      try {
        const response = await fetch("/api/user/target-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetScore: score }),
        });

        if (!response.ok) {
          throw new Error("Failed to save");
        }

        setTargetScore(score);
        setIsEditing(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        onUpdate?.(score);
      } catch (error) {
        addOptimisticTargetScore(oldTargetScore);
        setError("Failed to save target score");
      }
    });
  };

  const cefrLevel = getCEFRLevel(displayTargetScore);

  return (
    <Card className="transition-shadow duration-200 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <CardTitle>Target Score</CardTitle>
          </div>
          {success && (
            <Badge variant="default" className="bg-green-600">
              Saved
            </Badge>
          )}
        </div>
        <CardDescription>Set your PTE target score (30-90)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="h-32 animate-pulse rounded bg-gray-100" />
        ) : isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="target-score-input">Target Score</Label>
              <Input
                id="target-score-input"
                type="number"
                min="30"
                max="90"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="mt-1"
                aria-label="Enter target score"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-slider">Or use slider</Label>
              <Slider
                id="target-slider"
                min={30}
                max={90}
                step={1}
                value={[parseInt(editValue) || 30]}
                onValueChange={(val) => setEditValue(String(val[0]))}
                className="w-full"
                aria-label="Target score slider"
              />
              <div className="text-center text-sm text-gray-500">
                {editValue}
              </div>
            </div>

            {error && (
              <div
                className="rounded bg-red-50 p-2 text-sm text-red-600"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isPending}
                className="flex-1"
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setEditValue(String(targetScore));
                  setError("");
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <div className="mb-2 flex items-end justify-between">
                <span className="text-sm text-gray-600">Current Target</span>
                <Badge variant="secondary">{cefrLevel}</Badge>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                  style={{
                    width: `${((displayTargetScore - 30) / 60) * 100}%`,
                  }}
                  role="progressbar"
                  aria-valuenow={displayTargetScore}
                  aria-valuemin={30}
                  aria-valuemax={90}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>30</span>
                <span className="font-semibold text-blue-600">
                  {displayTargetScore}
                </span>
                <span>90</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <div className="font-semibold text-gray-900">30-42</div>
                <div className="text-xs text-gray-500">A1-A2</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">50-58</div>
                <div className="text-xs text-gray-500">B1-B2</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">70-90</div>
                <div className="text-xs text-gray-500">C1-C2</div>
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="w-full"
            >
              Edit Target
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
