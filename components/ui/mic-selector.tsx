"use client"

import * as React from "react"
import { Check, Mic } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MicSelectorProps {
  onDeviceChange?: (deviceId: string) => void
  className?: string
}

const MicSelector = React.forwardRef<HTMLDivElement, MicSelectorProps>(
  ({ onDeviceChange, className }, ref) => {
    const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([])
    const [selectedDevice, setSelectedDevice] = React.useState<string>("")
    const [hasPermission, setHasPermission] = React.useState<boolean>(false)

    React.useEffect(() => {
      const loadDevices = async () => {
        try {
          // Request microphone permission
          await navigator.mediaDevices.getUserMedia({ audio: true })
          setHasPermission(true)

          // Get available audio input devices
          const deviceList = await navigator.mediaDevices.enumerateDevices()
          const audioInputs = deviceList.filter(
            (device) => device.kind === "audioinput"
          )
          setDevices(audioInputs)

          // Set default device
          if (audioInputs.length > 0 && !selectedDevice) {
            const defaultDevice = audioInputs.find((d) => d.deviceId === "default") || audioInputs[0]
            setSelectedDevice(defaultDevice.deviceId)
            onDeviceChange?.(defaultDevice.deviceId)
          }
        } catch (error) {
          console.error("Error accessing microphone:", error)
          setHasPermission(false)
        }
      }

      loadDevices()

      // Listen for device changes
      navigator.mediaDevices.addEventListener("devicechange", loadDevices)
      return () => {
        navigator.mediaDevices.removeEventListener("devicechange", loadDevices)
      }
    }, [])

    const handleDeviceChange = (deviceId: string) => {
      setSelectedDevice(deviceId)
      onDeviceChange?.(deviceId)
    }

    if (!hasPermission) {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center gap-2 text-sm text-muted-foreground",
            className
          )}
        >
          <Mic className="h-4 w-4" />
          <span>Microphone permission required</span>
        </div>
      )
    }

    if (devices.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center gap-2 text-sm text-muted-foreground",
            className
          )}
        >
          <Mic className="h-4 w-4" />
          <span>No microphone detected</span>
        </div>
      )
    }

    return (
      <div ref={ref} className={cn("flex items-center gap-2", className)}>
        <Mic className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedDevice} onValueChange={handleDeviceChange}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select microphone" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                <div className="flex items-center gap-2">
                  {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                  {selectedDevice === device.deviceId && (
                    <Check className="h-4 w-4 ml-auto" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }
)

MicSelector.displayName = "MicSelector"

export { MicSelector }
