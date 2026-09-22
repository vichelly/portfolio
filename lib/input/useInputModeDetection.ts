import { useEffect } from "react"
import { useWorldStore } from "@/lib/world-store"

/**
 * Detects whether the visitor is on a touch-primary device (coarse pointer)
 * and keeps world-store.inputMode in sync, so the correct control scheme
 * (virtual joystick vs. keyboard-only) is shown automatically.
 */
export function useInputModeDetection() {
  const setInputMode = useWorldStore((s) => s.setInputMode)

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)")
    const apply = () => setInputMode(coarse.matches ? "touch" : "keyboard")
    apply()

    coarse.addEventListener("change", apply)

    // Fallback: a real touchstart on an otherwise "fine pointer" device
    // (e.g. touchscreen laptop) switches to touch controls too.
    const onTouch = () => setInputMode("touch")
    window.addEventListener("touchstart", onTouch, { once: true })

    return () => {
      coarse.removeEventListener("change", apply)
      window.removeEventListener("touchstart", onTouch)
    }
  }, [setInputMode])
}
