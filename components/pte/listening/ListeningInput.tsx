'use client'

import React from 'react'
import type { ListeningQuestionType } from '@/app/api/listening/schemas'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  questionType: ListeningQuestionType
  question: any
  value: any
  onChange: (value: any) => void
}

export default function ListeningInput({
  questionType,
  question,
  value,
  onChange,
}: Props) {
  const options = question?.options || []

  switch (questionType) {
    case 'summarize_spoken_text':
      return (
        <div className="space-y-3">
          <h3 className="font-medium">
            Write a summary of the lecture (50-70 words):
          </h3>
          <Textarea
            placeholder="Type your summary here..."
            value={value?.textAnswer || ''}
            onChange={(e) => onChange({ textAnswer: e.target.value })}
            rows={6}
            className="resize-none"
          />
          <p className="text-muted-foreground text-xs">
            Word count:{' '}
            {
              (value?.textAnswer || '').trim().split(/\s+/).filter(Boolean)
                .length
            }
          </p>
        </div>
      )

    case 'write_from_dictation':
      return (
        <div className="space-y-3">
          <h3 className="font-medium">Type the sentence you heard:</h3>
          <Textarea
            placeholder="Type what you heard..."
            value={value?.textAnswer || ''}
            onChange={(e) => onChange({ textAnswer: e.target.value })}
            rows={3}
            className="resize-none"
          />
        </div>
      )

    case 'multiple_choice_single':
      return (
        <div className="space-y-3">
          <h3 className="font-medium">Select the best answer:</h3>
          <RadioGroup
            value={value?.selectedOption || ''}
            onValueChange={(selectedOption) => onChange({ selectedOption })}
          >
            {options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )

    case 'multiple_choice_multiple':
      const selectedOptions = value?.selectedOptions || []
      return (
        <div className="space-y-3">
          <h3 className="font-medium">Select all correct answers:</h3>
          {options.map((option: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`option-${index}`}
                checked={selectedOptions.includes(option)}
                onChange={(e) => {
                  const checked = e.target.checked
                  let newSelected = [...selectedOptions]
                  if (checked) {
                    newSelected.push(option)
                  } else {
                    newSelected = newSelected.filter(
                      (s: string) => s !== option
                    )
                  }
                  onChange({ selectedOptions: newSelected })
                }}
              />
              <Label
                htmlFor={`option-${index}`}
                className="flex-1 cursor-pointer"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      )

    case 'fill_in_blanks':
      const answers = value?.answers || {}
      // Parse blanks from prompt text - look for [blank] placeholders
      const promptParts = question?.promptText?.split(/(\[blank\])/i) || []
      let blankCounter = 0

      return (
        <div className="space-y-3">
          <h3 className="font-medium">Fill in the missing words:</h3>
          <div className="space-y-2 rounded-md border bg-gray-50 p-3">
            {promptParts.map((part: string, index: number) => {
              if (part.toLowerCase() === '[blank]') {
                blankCounter++
                const blankIndex = blankCounter
                return (
                  <Input
                    key={index}
                    type="text"
                    placeholder={`Blank ${blankIndex}`}
                    value={answers[blankIndex] || ''}
                    onChange={(e) => {
                      const newAnswers = {
                        ...answers,
                        [blankIndex]: e.target.value,
                      }
                      onChange({ answers: newAnswers })
                    }}
                    className="mx-1 inline-block w-32"
                  />
                )
              }
              return <span key={index}>{part}</span>
            })}
          </div>
        </div>
      )

    case 'highlight_correct_summary':
      return (
        <div className="space-y-3">
          <h3 className="font-medium">
            Select the summary that best matches the recording:
          </h3>
          <RadioGroup
            value={value?.selectedOption || ''}
            onValueChange={(selectedOption) => onChange({ selectedOption })}
          >
            {options.map((option: string, index: number) => (
              <div
                key={index}
                className="flex items-start space-x-2 rounded-md border p-3"
              >
                <RadioGroupItem
                  value={option}
                  id={`summary-${index}`}
                  className="mt-1"
                />
                <Label
                  htmlFor={`summary-${index}`}
                  className="flex-1 cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )

    case 'select_missing_word':
      return (
        <div className="space-y-3">
          <h3 className="font-medium">
            Select the word or group of words that best completes the sentence:
          </h3>
          <RadioGroup
            value={value?.selectedOption || ''}
            onValueChange={(selectedOption) => onChange({ selectedOption })}
          >
            {options.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`word-${index}`} />
                <Label
                  htmlFor={`word-${index}`}
                  className="flex-1 cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )

    case 'highlight_incorrect_words':
      const transcript = question?.promptText || question?.transcript || ''
      const words = transcript.split(/\s+/).filter(Boolean)
      const selectedIndices = value?.indices || []

      return (
        <div className="space-y-3">
          <h3 className="font-medium">
            Click on the words that differ from what you heard:
          </h3>
          <div className="rounded-md border bg-gray-50 p-4">
            <div className="flex flex-wrap gap-2">
              {words.map((word: string, index: number) => {
                const isSelected = selectedIndices.includes(index)
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      let newIndices = [...selectedIndices]
                      if (isSelected) {
                        newIndices = newIndices.filter(
                          (i: number) => i !== index
                        )
                      } else {
                        newIndices.push(index)
                      }
                      onChange({ indices: newIndices })
                    }}
                    className={`rounded px-2 py-1 transition-colors ${
                      isSelected
                        ? 'bg-red-500 text-white'
                        : 'border bg-white hover:bg-gray-100'
                    }`}
                  >
                    {word}
                  </button>
                )
              })}
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            Selected {selectedIndices.length} word
            {selectedIndices.length !== 1 ? 's' : ''}
          </p>
        </div>
      )

    default:
      return (
        <div className="text-red-600">
          Unsupported question type: {questionType}
        </div>
      )
  }
}
