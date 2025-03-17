export interface MousePosition {
  x: number
  y: number
}

export interface TimelineData {
  year: string
  title: string
  company: string
  description: string
  side: "left" | "right"
}

export interface ProjectData {
  title: string
  description: string
  tags: string[]
  image: string
  link: string
  github: string
}

