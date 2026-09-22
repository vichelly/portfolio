import type { RoomId } from "@/lib/world-store"

export interface Waypoint {
  id: string
  position: [number, number, number]
  room: RoomId
  contentId: string
  title: string
  description?: string
  cameraOffset?: [number, number, number]
  duration?: number // How long to show the panel (seconds)
}

export const JOURNEY_PATH: Waypoint[] = [
  {
    id: "start",
    position: [0, 0, 6],
    room: "hub",
    contentId: "intro",
    title: "Welcome",
    description: "Bem-vindo à minha jornada profissional. Siga o caminho para descobrir minha história.",
    duration: 5,
  },
  {
    id: "exp-1",
    position: [-8, 0, -15],
    room: "experience",
    contentId: "itau-unibanco",
    title: "Itaú Unibanco - Vault Modernization",
    description: "Refiz o front inteiro do login de vault, migrando de EC2 para S3 com design system.",
    duration: 6,
  },
  {
    id: "exp-2",
    position: [0, 0, -30],
    room: "experience",
    contentId: "agile-inc",
    title: "Agile Inc - Full-Stack Development",
    description: "Trabalhei com Next.js, React e tecnologias modernas.",
    duration: 5,
  },
  {
    id: "skills",
    position: [22, 0, -10],
    room: "skills",
    contentId: "skills-intro",
    title: "Meu Toolbox",
    description: "Conheça as tecnologias e skills que utilizo.",
    duration: 4,
  },
  {
    id: "projects",
    position: [-25, 0, -5],
    room: "projects",
    contentId: "projects-intro",
    title: "Projetos Realizados",
    description: "Veja alguns dos projetos que desenvolvei.",
    duration: 4,
  },
  {
    id: "parkour-optional",
    position: [38, 0, -38],
    room: "parkour",
    contentId: "parkour-challenge",
    title: "Desafio Opcional",
    description: "Quer testar suas habilidades? Tente o parkour!",
    duration: 3,
  },
]

export function getNextWaypoint(currentIndex: number): Waypoint | null {
  return currentIndex < JOURNEY_PATH.length - 1 ? JOURNEY_PATH[currentIndex + 1] : null
}

export function findWaypointAtPosition(position: [number, number, number], radius: number = 3): Waypoint | null {
  for (const wp of JOURNEY_PATH) {
    const dx = position[0] - wp.position[0]
    const dz = position[2] - wp.position[2]
    const dist = Math.hypot(dx, dz)
    if (dist < radius) return wp
  }
  return null
}
