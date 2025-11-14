'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RealtimeVoiceAgentProps {
  sessionType?: 'customer_support' | 'speaking_practice' | 'mock_interview'
  instructions?: string
  onTranscript?: (transcript: string, role: 'user' | 'assistant') => void
  onSessionEnd?: (sessionId: string, turns: ConversationTurn[]) => void
  className?: string
}

interface ConversationTurn {
  turnIndex: number
  role: 'user' | 'assistant' | 'system'
  transcript: string
  audioUrl?: string
  durationMs?: number
  metadata?: Record<string, any>
}

export function RealtimeVoiceAgent({
  sessionType = 'customer_support',
  instructions,
  onTranscript,
  onSessionEnd,
  className,
}: RealtimeVoiceAgentProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationTurns, setConversationTurns] = useState<ConversationTurn[]>([])

  const wsRef = useRef<WebSocket | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const processorRef = useRef<AudioWorkletNode | null>(null)
  const turnIndexRef = useRef(0)

  // Initialize session and connect to OpenAI Realtime API
  const connect = async () => {
    try {
      setError(null)

      // Create session
      const response = await fetch('/api/realtime/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionType }),
      })

      if (!response.ok) {
        throw new Error('Failed to create session')
      }

      const { sessionId, realtimeToken } = await response.json()
      sessionIdRef.current = sessionId

      // Connect to OpenAI Realtime WebSocket
      const ws = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
        ['realtime', `openai-insecure-api-key.${realtimeToken}`]
      )

      ws.addEventListener('open', async () => {
        console.log('Connected to OpenAI Realtime API')
        setIsConnected(true)

        // Send session configuration
        ws.send(
          JSON.stringify({
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              instructions:
                instructions ||
                'You are a helpful assistant for Pedagogist\'s PTE Academic platform. Answer questions about PTE exam preparation, practice tests, and scoring.',
              voice: 'verse',
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 500,
              },
            },
          })
        )

        // Setup audio capture
        await setupAudioCapture(ws)
      })

      ws.addEventListener('message', (event) => {
        const data = JSON.parse(event.data)
        handleRealtimeEvent(data)
      })

      ws.addEventListener('error', (event) => {
        console.error('WebSocket error:', event)
        setError('Connection error')
      })

      ws.addEventListener('close', () => {
        console.log('Disconnected from OpenAI Realtime API')
        setIsConnected(false)
        cleanup()
      })

      wsRef.current = ws
    } catch (err) {
      console.error('Failed to connect:', err)
      setError(err instanceof Error ? err.message : 'Connection failed')
    }
  }

  // Setup audio capture from microphone
  const setupAudioCapture = async (ws: WebSocket) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      streamRef.current = stream

      const audioContext = new AudioContext({ sampleRate: 24000 })
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)

      // Create ScriptProcessor for audio processing
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor as any

      processor.onaudioprocess = (e) => {
        if (isMuted || !ws || ws.readyState !== WebSocket.OPEN) return

        const inputData = e.inputBuffer.getChannelData(0)
        const pcm16 = new Int16Array(inputData.length)

        // Convert Float32 to Int16 PCM
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]))
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
        }

        // Send audio to OpenAI
        ws.send(
          JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: arrayBufferToBase64(pcm16.buffer),
          })
        )
      }

      source.connect(processor)
      processor.connect(audioContext.destination)
    } catch (err) {
      console.error('Failed to setup audio:', err)
      setError('Microphone access denied')
    }
  }

  // Handle events from OpenAI Realtime API
  const handleRealtimeEvent = (event: any) => {
    switch (event.type) {
      case 'conversation.item.created':
        if (event.item.type === 'message') {
          const role = event.item.role
          const content = event.item.content?.[0]?.transcript || ''
          if (content) {
            const turn: ConversationTurn = {
              turnIndex: turnIndexRef.current++,
              role,
              transcript: content,
              metadata: event.item,
            }
            setConversationTurns((prev) => [...prev, turn])
            onTranscript?.(content, role)
          }
        }
        break

      case 'response.audio.delta':
        // Play audio response (implement audio playback here)
        break

      case 'response.audio_transcript.done':
        const transcript = event.transcript
        if (transcript) {
          const turn: ConversationTurn = {
            turnIndex: turnIndexRef.current++,
            role: 'assistant',
            transcript,
            metadata: event,
          }
          setConversationTurns((prev) => [...prev, turn])
          onTranscript?.(transcript, 'assistant')
        }
        break

      case 'input_audio_buffer.speech_started':
        console.log('User started speaking')
        break

      case 'input_audio_buffer.speech_stopped':
        console.log('User stopped speaking')
        break

      case 'error':
        console.error('Realtime API error:', event.error)
        setError(event.error.message)
        break
    }
  }

  // Disconnect and save conversation
  const disconnect = async () => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    // Save conversation turns to database
    if (sessionIdRef.current && conversationTurns.length > 0) {
      try {
        await fetch('/api/realtime/turns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            turns: conversationTurns,
            sessionStatus: 'completed',
          }),
        })

        onSessionEnd?.(sessionIdRef.current, conversationTurns)
      } catch (err) {
        console.error('Failed to save conversation:', err)
      }
    }

    cleanup()
  }

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }
    wsRef.current = null
    setIsConnected(false)
    setConversationTurns([])
    turnIndexRef.current = 0
  }

  const toggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="flex items-center gap-4">
        <Button
          onClick={isConnected ? disconnect : connect}
          size="lg"
          variant={isConnected ? 'destructive' : 'default'}
          className="rounded-full"
        >
          {isConnected ? (
            <>
              <PhoneOff className="mr-2 h-5 w-5" />
              End Call
            </>
          ) : (
            <>
              <Phone className="mr-2 h-5 w-5" />
              Start Call
            </>
          )}
        </Button>

        {isConnected && (
          <Button
            onClick={toggleMute}
            size="lg"
            variant={isMuted ? 'outline' : 'secondary'}
            className="rounded-full"
          >
            {isMuted ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>

      {isConnected && (
        <div className="text-sm font-medium text-green-600">
          Connected - Speak naturally
        </div>
      )}

      {error && (
        <div className="text-sm font-medium text-red-600">{error}</div>
      )}

      {conversationTurns.length > 0 && (
        <div className="mt-4 w-full max-w-md rounded-lg border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold">Conversation</h3>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {conversationTurns.map((turn, idx) => (
              <div
                key={idx}
                className={cn(
                  'text-sm',
                  turn.role === 'user' ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                <span className="font-medium">
                  {turn.role === 'user' ? 'You: ' : 'Assistant: '}
                </span>
                {turn.transcript}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
