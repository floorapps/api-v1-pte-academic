"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface VoiceButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  trailing?: string
  state?: "idle" | "recording" | "processing" | "success" | "error"
  onPress?: () => void
}

const VoiceButton = React.forwardRef<HTMLButtonElement, VoiceButtonProps>(
  ({ className, label = "Voice", trailing, state = "idle", onPress, ...props }, ref) => {
    const getStateStyles = () => {
      switch (state) {
        case "recording":
          return "bg-red-500 hover:bg-red-600 animate-pulse"
        case "processing":
          return "bg-yellow-500 hover:bg-yellow-600"
        case "success":
          return "bg-green-500 hover:bg-green-600"
        case "error":
          return "bg-destructive hover:bg-destructive/90"
        default:
          return "bg-primary hover:bg-primary/90"
      }
    }

    const getStateIcon = () => {
      switch (state) {
        case "recording":
          return (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          )
        case "processing":
          return <Loader2 className="h-4 w-4 animate-spin" />
        case "success":
          return (
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )
        case "error":
          return (
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )
        default:
          return (
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )
      }
    }

    const getStateLabel = () => {
      switch (state) {
        case "recording":
          return "Recording..."
        case "processing":
          return "Processing..."
        case "success":
          return "Success!"
        case "error":
          return "Error"
        default:
          return label
      }
    }

    return (
      <button
        ref={ref}
        onClick={onPress}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          getStateStyles(),
          className
        )}
        {...props}
      >
        {getStateIcon()}
        <span className="font-semibold">{getStateLabel()}</span>
        {trailing && (
          <span className="ml-auto text-xs opacity-70">{trailing}</span>
        )}
      </button>
    )
  }
)

VoiceButton.displayName = "VoiceButton"

export { VoiceButton }
