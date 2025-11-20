"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ConversationBarProps {
  agentId: string
  onConnect?: () => void
  onDisconnect?: () => void
  onMessage?: (message: any) => void
  onError?: (error: Error) => void
  className?: string
  waveformClassName?: string
}

export function ConversationBar({
  agentId,
  onConnect,
  onDisconnect,
  onMessage,
  onError,
  className,
  waveformClassName,
}: ConversationBarProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const toggleConnection = async () => {
    if (isConnected) {
      disconnect()
    } else {
      await connect()
    }
  }

  const connect = async () => {
    try {
      setIsConnecting(true)

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up audio context for visualization
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)

      analyser.fftSize = 256
      source.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      // Start visualization
      updateAudioLevel()

      setIsConnected(true)
      setIsConnecting(false)
      onConnect?.()
    } catch (error) {
      console.error("Failed to connect:", error)
      setIsConnecting(false)
      onError?.(error as Error)
    }
  }

  const disconnect = () => {
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
    setIsConnected(false)
    setAudioLevel(0)
    onDisconnect?.()
  }

  const updateAudioLevel = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
    setAudioLevel(average / 255)

    if (isConnected) {
      requestAnimationFrame(updateAudioLevel)
    }
  }

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  return (
    <div className={cn("flex items-center gap-4 rounded-lg border bg-card p-4", className)}>
      <Button
        size="icon"
        variant={isConnected ? "destructive" : "default"}
        onClick={toggleConnection}
        disabled={isConnecting}
        className="h-12 w-12 rounded-full"
      >
        {isConnecting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isConnected ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </Button>

      <div className="flex-1">
        <div className="flex items-center gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-8 w-1 rounded-full bg-gradient-to-t from-primary to-primary/50 transition-all",
                waveformClassName
              )}
              style={{
                opacity: isConnected ? Math.max(0.1, audioLevel) : 0.1,
                transform: `scaleY(${isConnected ? 0.5 + audioLevel * (0.3 + 0.7 * Math.sin(i * 0.5 + audioLevel * 2)) : 0.5})`,
              }}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {isConnecting
            ? "Connecting..."
            : isConnected
            ? "Listening... Click to stop"
            : "Click to start conversation"}
        </p>
      </div>
    </div>
  )
}
