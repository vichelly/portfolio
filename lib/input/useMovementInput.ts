import { useEffect, useRef } from "react"

export interface MovementVector {
  x: number
  y: number
  jump: boolean
}

/**
 * Normalizes WASD/arrow-key input and touch-joystick output into one
 * {x, y, jump} vector, read imperatively via a ref (not React state) so
 * per-frame consumption in useFrame doesn't trigger re-renders.
 */
export function useMovementInput() {
  const vector = useRef<MovementVector>({ x: 0, y: 0, jump: false })
  const keys = useRef<Record<string, boolean>>({})

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true
      if (e.code === "Space") vector.current.jump = true
    }
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false
      if (e.code === "Space") vector.current.jump = false
    }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)

    const tick = () => {
      let x = 0
      let y = 0
      if (keys.current["KeyW"] || keys.current["ArrowUp"]) y -= 1
      if (keys.current["KeyS"] || keys.current["ArrowDown"]) y += 1
      if (keys.current["KeyA"] || keys.current["ArrowLeft"]) x -= 1
      if (keys.current["KeyD"] || keys.current["ArrowRight"]) x += 1

      // Touch joystick writes directly into vector.current via setTouchVector;
      // only overwrite from keyboard state when a keyboard key is actually held,
      // so touch input isn't stomped on every frame.
      if (x !== 0 || y !== 0) {
        const len = Math.hypot(x, y) || 1
        vector.current.x = x / len
        vector.current.y = y / len
      } else if (!touchActive.current) {
        vector.current.x = 0
        vector.current.y = 0
      }
      raf = requestAnimationFrame(tick)
    }
    let raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
      cancelAnimationFrame(raf)
    }
  }, [])

  const touchActive = useRef(false)

  const setTouchVector = (x: number, y: number) => {
    touchActive.current = x !== 0 || y !== 0
    if (touchActive.current) {
      vector.current.x = x
      vector.current.y = y
    } else {
      vector.current.x = 0
      vector.current.y = 0
    }
  }

  const setTouchJump = (jump: boolean) => {
    vector.current.jump = jump
  }

  return { vector, setTouchVector, setTouchJump }
}
