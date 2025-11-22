"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { VoiceButton } from "@/components/ui/voice-button";
import { LiveWaveform } from "@/components/ui/live-waveform";
import { MicSelector } from "@/components/ui/mic-selector";
import type { SpeakingTimings, SpeakingType } from "@/lib/pte/types";

export type RecorderState =
  | "idle"
  | "prepping"
  | "recording"
  | "processing"
  | "finished"
  | "denied"
  | "unsupported"
  | "error";

export type SpeakingRecorderProps = {
  type: SpeakingType;
  timers: { prepMs?: number; recordMs: number };
  onRecorded: (data: {
    blob: Blob;
    durationMs: number;
    timings: SpeakingTimings;
  }) => void;

  // NEW: Optional external auto control. When active=true, component will ensure recording is running
  // (respecting prepMs first). When active=false, if currently recording it will stop.
  auto?: { active: boolean };

  // NEW: Notify parent on state changes (for orchestration/telemetry)
  onStateChange?: (state: RecorderState) => void;

  onTick?: (tick: { state: RecorderState; prepRemainingMs: number; recordElapsedMs: number }) => void;

  // NEW: Allow file uploads instead of recording
  allowFileUpload?: boolean;
};

const MIME = "audio/webm;codecs=opus";
const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15MB client-side guard

export default function SpeakingRecorder({
  type,
  timers,
  onRecorded,
  auto,
  onStateChange,
  onTick,
  allowFileUpload = true,
}: SpeakingRecorderProps) {
  const { prepMs = 0, recordMs } = timers;

  // Refs for recording and timing
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startAtRef = useRef<Date | null>(null);
  const endAtRef = useRef<Date | null>(null);

  // Intervals/timeouts
  const prepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // UI state
  const [state, _setState] = useState<RecorderState>(() => {
    // Always start with "idle" to prevent SSR hydration mismatch
    // Browser support check will happen in useEffect
    return "idle";
  });

  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  const setPhase = useCallback((next: RecorderState) => {
    _setState(next);
    try {
      onStateChangeRef.current?.(next);
    } catch { }
    try {
      onTick?.({ state: next, prepRemainingMs, recordElapsedMs });
    } catch { }
  }, []);

  const [error, setError] = useState<string | null>(null);
  const [prepRemainingMs, setPrepRemainingMs] = useState(prepMs);
  const [recordElapsedMs, setRecordElapsedMs] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [selectedMicId, setSelectedMicId] = useState<string>("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived progress values (0..100)
  const prepProgress = useMemo(() => {
    if (!prepMs) return 100;
    const used = Math.max(0, prepMs - prepRemainingMs);
    return Math.min(100, Math.round((used / prepMs) * 100));
  }, [prepMs, prepRemainingMs]);

  const recordProgress = useMemo(() => {
    const clamped = Math.min(recordMs, Math.max(0, recordElapsedMs));
    return Math.min(100, Math.round((clamped / recordMs) * 100));
  }, [recordMs, recordElapsedMs]);

  const clearPrepInterval = () => {
    if (prepTimerRef.current) {
      clearInterval(prepTimerRef.current);
      prepTimerRef.current = null;
    }
  };

  const clearRecordInterval = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  };

  const clearAutoStop = () => {
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
  };

  const cleanupStream = () => {
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch { }
      audioContextRef.current = null;
      analyserRef.current = null;
    }
    if (mediaStreamRef.current) {
      for (const track of mediaStreamRef.current.getTracks()) {
        try {
          track.stop();
        } catch { }
      }
      mediaStreamRef.current = null;
    }
    setAudioLevel(0);
  };

  const playBeep = useCallback((durationMs: number = 400, frequency: number = 1000, volume: number = 0.2) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        try {
          osc.stop();
          ctx.close();
        } catch { }
      }, durationMs + 50);
    } catch { }
  }, []);

  const resetAll = useCallback(() => {
    setError(null);
    setPhase("idle"); // Always reset to idle since we check support in useEffect
    setPrepRemainingMs(prepMs);
    setRecordElapsedMs(0);
    clearPrepInterval();
    clearRecordInterval();
    clearAutoStop();
    chunksRef.current = [];
    startAtRef.current = null;
    endAtRef.current = null;
    cleanupStream();
    if (recorderRef.current) {
      try {
        recorderRef.current.ondataavailable = null as any;
        recorderRef.current.onstop = null as any;
        recorderRef.current.onerror = null as any;
      } catch { }
      recorderRef.current = null;
    }
  }, [prepMs, setPhase]);

  // Stop recording flow (internal)
  const finalizeRecording = useCallback(async () => {
    try {
      const endAt = new Date();
      endAtRef.current = endAt;

      const blob = new Blob(chunksRef.current, { type: MIME });
      console.log(
        "[SpeakingRecorder] Blob creation: MIME type:",
        blob.type,
        "size:",
        blob.size
      );
      // Client-side size guard (additional to server)
      if (blob.size > MAX_SIZE_BYTES) {
        setError(
          "Recording exceeds 15MB limit. Please try a shorter response."
        );
        setPhase("error");
        return;
      }

      const startAt = startAtRef.current ?? endAt;
      const durationMs = Math.max(0, endAt.getTime() - startAt.getTime());

      const timings: SpeakingTimings = {
        prepMs: prepMs || undefined,
        recordMs,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      };

      console.log(
        "[SpeakingRecorder] Upload process: calling onRecorded with blob type:",
        blob.type,
        "size:",
        blob.size,
        "duration:",
        durationMs
      );
      setPhase("finished");
      onRecorded({ blob, durationMs, timings });
    } catch (e: any) {
      setError(e?.message || "Failed to finalize recording.");
      setPhase("error");
    } finally {
      clearRecordInterval();
      clearAutoStop();
      cleanupStream();
    }
  }, [onRecorded, prepMs, recordMs, setPhase]);

  // Start actual recording (called after prep or immediately if no prep)
  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // Request microphone with specific device if selected
      const constraints: MediaStreamConstraints = {
        audio: selectedMicId ? { deviceId: { exact: selectedMicId } } : true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      // Setup audio level monitoring
      try {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const updateLevel = () => {
          if (
            analyserRef.current &&
            recorderRef.current?.state === "recording"
          ) {
            analyserRef.current.getByteFrequencyData(dataArray);
            const average =
              dataArray.reduce((a, b) => a + b) / dataArray.length;
            setAudioLevel(average / 255);
            requestAnimationFrame(updateLevel);
          }
        };
        requestAnimationFrame(updateLevel);
      } catch (e) {
        console.warn("Audio level monitoring not available:", e);
      }

      const rec: MediaRecorder = new (window as any).MediaRecorder(stream, {
        mimeType: MIME,
        audioBitsPerSecond: 128000,
      });
      console.log(
        "[SpeakingRecorder] MediaRecorder creation: MIME type used:",
        MIME
      );
      recorderRef.current = rec;

      chunksRef.current = [];
      startAtRef.current = new Date();
      endAtRef.current = null;

      rec.ondataavailable = (ev: any) => {
        if (ev.data && ev.data.size > 0) {
          chunksRef.current.push(ev.data);
        }
      };

      rec.onstop = () => {
        // Defer finalize to ensure all chunks collected
        setTimeout(() => finalizeRecording(), 0);
      };

      rec.onerror = (ev: any) => {
        setError(ev?.error?.message || "Recording error.");
        setPhase("error");
        cleanupStream();
      };

      playBeep();

      // Begin recording
      rec.start(250); // gather data in ~250ms chunks
      setPhase("recording");
      setRecordElapsedMs(0);

      // Start elapsed interval
      clearRecordInterval();
      const startedAtMs = Date.now();
      recordTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startedAtMs;
        setRecordElapsedMs(elapsed);
        try { onTick?.({ state: 'recording', prepRemainingMs, recordElapsedMs: elapsed }); } catch { }
      }, 50);

      // Schedule auto-stop at recordMs
      clearAutoStop();
      autoStopTimeoutRef.current = setTimeout(() => {
        try {
          if (
            recorderRef.current &&
            recorderRef.current.state === "recording"
          ) {
            recorderRef.current.stop();
          }
        } catch { }
      }, recordMs);
    } catch (err: any) {
      // Permissions/unsupported
      if (err?.name === "NotAllowedError" || err?.name === "NotFoundError") {
        setPhase("denied");
        setError(
          "Microphone access denied. Please allow mic permission to record."
        );
      } else {
        setPhase("error");
        setError(err?.message || "Unable to start recording.");
      }
      cleanupStream();
    }
  }, [finalizeRecording, recordMs, setPhase, selectedMicId]);

  const begin = useCallback(async () => {
    setError(null);

    // Unsupported guard
    const hasMR =
      typeof window !== "undefined" &&
      typeof (window as any).MediaRecorder !== "undefined" &&
      ((window as any).MediaRecorder.isTypeSupported
        ? (window as any).MediaRecorder.isTypeSupported(MIME)
        : true);
    if (!hasMR) {
      setPhase("unsupported");
      return;
    }

    if (prepMs > 0) {
      setPhase("prepping");
      setPrepRemainingMs(prepMs);
      const started = Date.now();
      clearPrepInterval();
      prepTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - started;
        const remain = Math.max(0, prepMs - elapsed);
        setPrepRemainingMs(remain);
        try { onTick?.({ state, prepRemainingMs: remain, recordElapsedMs }); } catch { }
        if (remain <= 0) {
          clearPrepInterval();
          playBeep();

          // Auto transition to recording
          startRecording();
        }
      }, 50);
    } else {
      playBeep();

      // No prep - start recording immediately
      startRecording();
    }
  }, [prepMs, setPhase, startRecording]);

  const stop = useCallback(() => {
    try {
      if (recorderRef.current && recorderRef.current.state === "recording") {
        recorderRef.current.stop();
      }
    } catch { }
  }, []);

  const redo = useCallback(() => {
    resetAll();
  }, [resetAll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (recorderRef.current && recorderRef.current.state === "recording") {
          recorderRef.current.stop();
        }
      } catch { }
      clearPrepInterval();
      clearRecordInterval();
      clearAutoStop();
      cleanupStream();
    };
  }, []);

  // Check browser support on mount
  useEffect(() => {
    const hasMediaRecorder =
      typeof (window as any).MediaRecorder !== "undefined";
    console.log(
      "[SpeakingRecorder] Browser support check on mount: MediaRecorder available:",
      hasMediaRecorder
    );

    if (hasMediaRecorder) {
      // Log all supported MIME types
      const supportedTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/mpeg",
        "audio/wav",
        "audio/ogg;codecs=opus",
        "audio/ogg",
      ];
      const supportedMimeTypes = supportedTypes.filter((type) =>
        (window as any).MediaRecorder.isTypeSupported(type)
      );
      console.log(
        "[SpeakingRecorder] Browser support check on mount: Supported MIME types:",
        supportedMimeTypes
      );

      const mimeSupported = (window as any).MediaRecorder.isTypeSupported
        ? (window as any).MediaRecorder.isTypeSupported(MIME)
        : true;
      console.log(
        "[SpeakingRecorder] Browser support check on mount: Target MIME type supported:",
        MIME,
        mimeSupported
      );
      if (!mimeSupported) {
        setPhase("unsupported");
      }
    } else {
      setPhase("unsupported");
    }
  }, [setPhase]);

  // NEW: Auto orchestration effect
  useEffect(() => {
    if (!auto) return;
    // When active becomes true, ensure we're recording; if idle -> begin()
    if (auto.active) {
      if (state === "idle") {
        void begin();
      }
      // When in 'prepping' or 'recording', keep going (internal timers will handle transitions)
    } else {
      // active=false: if recording, stop
      if (state === "recording") {
        stop();
      }
    }
  }, [auto?.active, begin, state, stop]);

  const isStartDisabled =
    state === "prepping" ||
    state === "recording" ||
    state === "denied" ||
    state === "unsupported";
  const isStopDisabled = state !== "recording";
  const isRedoDisabled =
    state === "recording" || state === "prepping" || state === "idle";

  const getVoiceButtonState = ():
    | "idle"
    | "recording"
    | "processing"
    | "success"
    | "error" => {
    if (state === "recording") return "recording";
    if (state === "prepping") return "processing";
    if (state === "finished") return "success";
    if (state === "error" || state === "denied" || state === "unsupported")
      return "error";
    return "idle";
  };

  const handleVoiceButtonPress = useCallback(() => {
    if (state === "idle") {
      begin();
    } else if (state === "recording") {
      stop();
    }
  }, [state, begin, stop]);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setError(null);
        setPhase("processing" as RecorderState);

        // Validate file type
        const validTypes = [
          "audio/webm",
          "audio/mp3",
          "audio/mpeg",
          "audio/wav",
          "audio/ogg",
          "audio/mp4",
          "audio/m4a",
        ];
        if (!validTypes.some((type) => file.type.startsWith(type.split("/")[0]))) {
          setError("Please upload a valid audio file (webm, mp3, wav, ogg, m4a)");
          setPhase("error");
          return;
        }

        // Validate file size
        if (file.size > MAX_SIZE_BYTES) {
          setError("File exceeds 15MB limit. Please upload a smaller file.");
          setPhase("error");
          return;
        }

        // Get audio duration
        const audioDuration = await getAudioDuration(file);
        const durationMs = Math.round(audioDuration * 1000);

        // Create blob from file
        const blob = new Blob([file], { type: file.type });

        const now = new Date();
        const timings: SpeakingTimings = {
          prepMs: prepMs || undefined,
          recordMs,
          startAt: now.toISOString(),
          endAt: new Date(now.getTime() + durationMs).toISOString(),
        };

        console.log(
          "[SpeakingRecorder] File upload: type:",
          blob.type,
          "size:",
          blob.size,
          "duration:",
          durationMs
        );

        setPhase("finished");
        onRecorded({ blob, durationMs, timings });
      } catch (err: any) {
        setError(err?.message || "Failed to process audio file.");
        setPhase("error");
      } finally {
        // Reset file input
        if (e.target) {
          e.target.value = "";
        }
      }
    },
    [onRecorded, prepMs, recordMs, setPhase]
  );

  // Helper function to get audio duration
  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = document.createElement("audio");
      audio.preload = "metadata";

      audio.onloadedmetadata = () => {
        window.URL.revokeObjectURL(audio.src);
        resolve(audio.duration);
      };

      audio.onerror = () => {
        window.URL.revokeObjectURL(audio.src);
        reject(new Error("Failed to load audio metadata"));
      };

      audio.src = URL.createObjectURL(file);
    });
  };

  // Keyboard shortcut for Space key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        handleVoiceButtonPress();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleVoiceButtonPress]);

  return (
    <div className="w-full space-y-6">
      {/* Microphone Selector */}
      <div className="flex justify-center">
        <MicSelector onDeviceChange={setSelectedMicId} />
      </div>

      {/* Status and Mode */}
      <div className="flex flex-col items-center text-center space-y-2">
        <span className="text-muted-foreground text-sm">
          Mode: {type.replaceAll("_", " ")}
        </span>
        {state === "prepping" ? (
          <span aria-live="polite" className="text-sm font-medium">
            Preparation: {Math.floor(prepRemainingMs / 1000 / 60)}:{(Math.ceil(prepRemainingMs / 1000) % 60).toString().padStart(2, '0')}
          </span>
        ) : state === "recording" ? (
          <span aria-live="polite" className="text-sm font-medium text-red-600">
            Recording... {Math.floor((recordMs - recordElapsedMs) / 1000 / 60)}:{(Math.ceil((recordMs - recordElapsedMs) / 1000) % 60).toString().padStart(2, '0')} left
          </span>
        ) : state === "processing" ? (
          <span aria-live="polite" className="text-sm font-medium text-blue-600">
            Processing audio file...
          </span>
        ) : state === "finished" ? (
          <span className="text-sm text-emerald-600">
            Audio ready. You can submit or redo.
          </span>
        ) : state === "denied" ? (
          <span className="text-sm text-red-600">
            Microphone permission denied.
          </span>
        ) : state === "unsupported" ? (
          <span className="text-sm text-red-600">
            Recording not supported in this browser.
          </span>
        ) : state === "error" ? (
          <span className="text-sm text-red-600">Recording error.</span>
        ) : (
          <span className="text-sm">Ready to record.</span>
        )}
      </div>

      {/* Live Waveform */}
      <LiveWaveform
        isActive={state === "recording"}
        audioLevel={audioLevel}
        barCount={40}
      />

      {/* Voice Control Button */}
      <div className="flex flex-col items-center gap-3">
        <VoiceButton
          state={getVoiceButtonState()}
          onPress={handleVoiceButtonPress}
          label={state === "recording" ? "Stop Recording" : "Start Recording"}
          trailing="Space"
          className="min-w-[200px]"
        />

        {state === "finished" && (
          <Button
            aria-label="Redo recording"
            onClick={redo}
            variant="outline"
            size="sm"
          >
            Redo Recording
          </Button>
        )}
      </div>

      {/* File Upload Option */}
      {allowFileUpload && state === "idle" && (
        <div className="flex flex-col items-center gap-2">
          <div className="text-muted-foreground text-sm">or</div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
            id="audio-file-upload"
            aria-label="Upload audio file"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="min-w-[200px]"
          >
            Upload Audio File
          </Button>
          <p className="text-muted-foreground text-xs text-center">
            Supported: MP3, WAV, WebM, OGG, M4A (max 15MB)
          </p>
        </div>
      )}

      {/* Progress */}
      {state === "prepping" && prepMs > 0 && (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Preparation</span>
            <span className="text-xs">
              {Math.floor(prepRemainingMs / 1000 / 60)}:{(Math.ceil(prepRemainingMs / 1000) % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <Progress value={prepProgress} aria-label="Preparation progress" />
        </div>
      )}

      {state === "recording" && (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Recording</span>
            <span className="text-xs">
              {Math.floor((recordMs - recordElapsedMs) / 1000 / 60)}:{(Math.ceil((recordMs - recordElapsedMs) / 1000) % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <Progress value={recordProgress} aria-label="Recording progress" />
        </div>
      )}

      {/* Hints / Fallbacks */}
      {state === "unsupported" && (
        <p className="text-sm text-red-600">
          MediaRecorder not supported. Try Chrome or Edge, or update your
          browser.
        </p>
      )}
      {state === "denied" && (
        <p className="text-sm text-red-600">
          Microphone permission denied. Please allow access in your browser
          settings and try again.
        </p>
      )}
      {error && (
        <div role="alert" className="text-sm text-red-600">
          {error}
        </div>
      )}
      <p className="text-muted-foreground text-xs">
        Format: audio/webm (Opus), auto-stops after{" "}
        {Math.round(recordMs / 1000)}s, max 15MB.
      </p>
    </div>
  );
}