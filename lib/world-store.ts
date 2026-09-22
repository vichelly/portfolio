import { create } from "zustand"

export type RoomId = "hub" | "experience" | "skills" | "certifications" | "projects" | "parkour"
export type InputMode = "keyboard" | "touch"

interface WorldState {
  activeRoom: RoomId
  setActiveRoom: (room: RoomId) => void

  inputMode: InputMode
  setInputMode: (mode: InputMode) => void

  openPanelId: string | null
  openPanel: (id: string) => void
  closePanel: () => void

  fallbackOpen: boolean
  openFallback: () => void
  closeFallback: () => void
}

export const useWorldStore = create<WorldState>((set) => ({
  activeRoom: "hub",
  setActiveRoom: (room) => set({ activeRoom: room }),

  inputMode: "keyboard",
  setInputMode: (mode) => set({ inputMode: mode }),

  openPanelId: null,
  openPanel: (id) => set({ openPanelId: id }),
  closePanel: () => set({ openPanelId: null }),

  fallbackOpen: false,
  openFallback: () => set({ fallbackOpen: true }),
  closeFallback: () => set({ fallbackOpen: false }),
}))
