"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LiveWaveformProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean
  barCount?: number
  audioLevel?: number
}

const LiveWaveform = React.forwardRef<HTMLDivElement, LiveWaveformProps>(
  ({ className, isActive = false, barCount = 32, audioLevel = 0, ...props }, ref) => {
    const [bars, setBars] = React.useState<number[]>(
      Array(barCount).fill(0)
    )

    React.useEffect(() => {
      if (!isActive) {
        setBars(Array(barCount).fill(0))
        return
      }

      const interval = setInterval(() => {
        setBars((prevBars) =>
          prevBars.map((_, i) => {
            // Create wave pattern based on audio level
            const baseHeight = audioLevel * 100
            const wave = Math.sin((i / barCount) * Math.PI * 2 + Date.now() / 200) * 0.3 + 0.7
            const randomness = Math.random() * 0.2
            return Math.min(100, (baseHeight * wave + randomness * 20))
          })
        )
      }, 50)

      return () => clearInterval(interval)
    }, [isActive, barCount, audioLevel])

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-0.5 h-16 w-full",
          className
        )}
        {...props}
      >
        {bars.map((height, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-all duration-75 ease-out",
              isActive
                ? "bg-primary"
                : "bg-muted"
            )}
            style={{
              height: `${Math.max(4, height)}%`,
              opacity: isActive ? 0.7 + (height / 100) * 0.3 : 0.3,
            }}
          />
        ))}
      </div>
    )
  }
)

LiveWaveform.displayName = "LiveWaveform"

export { LiveWaveform }
