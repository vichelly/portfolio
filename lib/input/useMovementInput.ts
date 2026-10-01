import { useCallback, useEffect, useRef } from "react"

export interface MovementVector {
  x: number
  y: number
}

export interface JumpRequest {
  /** performance.now() of the press that has not been acted on yet. */
  queuedAt: number | null
}

/**
 * Normalizes WASD/arrow keys and touch controls into one movement vector plus a
 * jump *request*. Jump is an event, not a level: a press stores a timestamp the
 * controller consumes when it actually jumps. That single mechanism gives both
 * jump buffering (the press survives until the body lands) and "one jump per
 * press" (holding the key never re-queues, because key repeat is ignored).
 *
 * Both are read imperatively through refs, so per-frame consumption inside
 * useFrame never triggers a React render.
 */
export function useMovementInput() {
  const vector = useRef<MovementVector>({ x: 0, y: 0 })
  const jump = useRef<JumpRequest>({ queuedAt: null })
  const keys = useRef<Record<string, boolean>>({})
  const touchActive = useRef(false)

  useEffect(() => {
    // The vector only changes when a key or the page's focus does, so it is
    // recomputed there rather than polled on a second animation-frame loop that
    // would run alongside the renderer's own - including while the page is
    // hidden.
    const recompute = () => {
      let x = 0
      let y = 0
      if (keys.current["KeyW"] || keys.current["ArrowUp"]) y -= 1
      if (keys.current["KeyS"] || keys.current["ArrowDown"]) y += 1
      if (keys.current["KeyA"] || keys.current["ArrowLeft"]) x -= 1
      if (keys.current["KeyD"] || keys.current["ArrowRight"]) x += 1

      // The touch joystick writes into vector.current directly; only overwrite
      // from keyboard state when a key is actually held.
      if (x !== 0 || y !== 0) {
        const len = Math.hypot(x, y) || 1
        vector.current.x = x / len
        vector.current.y = y / len
      } else if (!touchActive.current) {
        vector.current.x = 0
        vector.current.y = 0
      }
    }

    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true
      if (e.code === "Space") {
        e.preventDefault()
        // Ignore auto-repeat: holding must not re-queue a consumed jump.
        if (!e.repeat) jump.current.queuedAt = performance.now()
      }
      recompute()
    }
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false
      recompute()
    }
    // A key released while the page was hidden or unfocused never delivers its
    // keyup here, so it would still read as held on return.
    const release = () => {
      keys.current = {}
      jump.current.queuedAt = null
      recompute()
    }
    const onVisibility = () => {
      if (document.visibilityState === "hidden") release()
    }

    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    window.addEventListener("blur", release)
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
      window.removeEventListener("blur", release)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  const setTouchVector = useCallback((x: number, y: number) => {
    touchActive.current = x !== 0 || y !== 0
    vector.current.x = touchActive.current ? x : 0
    vector.current.y = touchActive.current ? y : 0
  }, [])

  /** Called on touch-button press (true) and release (false). Only a press queues. */
  const setTouchJump = useCallback((pressed: boolean) => {
    if (pressed) jump.current.queuedAt = performance.now()
  }, [])

  /**
   * Takes a pending jump if one was pressed within `bufferSeconds`. Returns
   * true exactly once per press; an expired request is discarded rather than
   * firing late.
   */
  const consumeJump = useCallback((bufferSeconds: number) => {
    const queuedAt = jump.current.queuedAt
    if (queuedAt === null) return false
    if (performance.now() - queuedAt > bufferSeconds * 1000) {
      jump.current.queuedAt = null
      return false
    }
    jump.current.queuedAt = null
    return true
  }, [])

  return { vector, jump, setTouchVector, setTouchJump, consumeJump }
}
