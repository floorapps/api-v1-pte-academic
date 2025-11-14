'use client'

import React from 'react'
import type { ReadingQuestionType } from '@/app/api/reading/schemas'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

type Props = {
  questionType: ReadingQuestionType
  question: any
  value: any
  onChange: (value: any) => void
}

export default function ReadingInput({
  questionType,
  question,
  value,
  onChange,
}: Props) {
  const options = question?.options || []

  switch (questionType) {
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
          <h3 className="font-medium">Select all that apply:</h3>
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
                    newSelected = newSelected.filter((s) => s !== option)
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

    case 'reorder_paragraphs':
      const order = value?.order || options.map((_: any, i: number) => i + 1)
      return (
        <div className="space-y-3">
          <h3 className="font-medium">Reorder the paragraphs:</h3>
          <div className="space-y-2">
            {order.map((paragraphIndex: number, position: number) => (
              <div key={position} className="flex items-start space-x-2">
                <span className="mt-1 text-sm font-medium">
                  {position + 1}.
                </span>
                <div className="flex-1 rounded-md border bg-gray-50 p-3">
                  {options[paragraphIndex - 1]}
                </div>
                <div className="flex flex-col space-y-1">
                  {position > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newOrder = [...order]
                        ;[newOrder[position], newOrder[position - 1]] = [
                          newOrder[position - 1],
                          newOrder[position],
                        ]
                        onChange({ order: newOrder })
                      }}
                      className="rounded border px-2 py-1 text-xs hover:bg-gray-100"
                    >
                      ↑
                    </button>
                  )}
                  {position < order.length - 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newOrder = [...order]
                        ;[newOrder[position], newOrder[position + 1]] = [
                          newOrder[position + 1],
                          newOrder[position],
                        ]
                        onChange({ order: newOrder })
                      }}
                      className="rounded border px-2 py-1 text-xs hover:bg-gray-100"
                    >
                      ↓
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'fill_in_blanks':
    case 'reading_writing_fill_blanks':
      const answers = value?.answers || {}
      // Parse blanks from prompt text - look for [blank] placeholders
      const promptParts = question?.promptText?.split(/(\[blank\])/i) || []

      return (
        <div className="space-y-3">
          <h3 className="font-medium">Fill in the blanks:</h3>
          <div className="space-y-2">
            {promptParts.map((part: string, index: number) => {
              if (part.toLowerCase() === '[blank]') {
                const blankIndex = Math.floor(index / 2) + 1
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

    default:
      return (
        <div className="text-red-600">
          Unsupported question type: {questionType}
        </div>
      )
  }
}
