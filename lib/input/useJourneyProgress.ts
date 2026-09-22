import { useEffect, useRef, useState } from "react"
import { JOURNEY_PATH, findWaypointAtPosition, type Waypoint } from "@/lib/world/journey"

interface JourneyState {
  currentWaypoint: Waypoint | null
  currentIndex: number
  isActive: boolean
  dismissTime: number
}

/**
 * Tracks avatar position and manages animated panel display along the guided journey.
 * Shows panels when avatar gets close to waypoints, auto-dismisses after duration.
 */
export function useJourneyProgress(avatarPosition: [number, number, number] | null) {
  const [state, setState] = useState<JourneyState>({
    currentWaypoint: null,
    currentIndex: -1,
    isActive: false,
    dismissTime: 0,
  })

  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!avatarPosition) return

    const nearby = findWaypointAtPosition(avatarPosition, 3)

    if (nearby) {
      const index = JOURNEY_PATH.indexOf(nearby)
      setState((prev) => ({
        ...prev,
        currentWaypoint: nearby,
        currentIndex: index,
        isActive: true,
        dismissTime: Date.now(),
      }))

      // Clear existing dismiss timer
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)

      // Set new dismiss timer based on waypoint duration
      const duration = (nearby.duration || 5) * 1000
      dismissTimerRef.current = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isActive: false,
        }))
      }, duration)
    }
  }, [avatarPosition])

  return state
}
