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
    title: "Welcome to My Journey",
    description:
      "Bem-vindo! I'm a full-stack developer with experience spanning fintech, e-commerce, and modern web technologies. Follow the path to discover my career story.",
    duration: 6,
  },
  {
    id: "vault-modernization",
    position: [-8, 0, -15],
    room: "experience",
    contentId: "itau-unibanco",
    title: "🏦 Itaú Unibanco • 2024-Present",
    description:
      "Modernized a business-critical Vault login application. Rebuilt the entire frontend using Itaú's design system and migrated from EC2 to serverless S3 hosting. Also contributed to Jarvis—an AI-powered SEO analysis tool built with AWS, Angular, and Python.",
    duration: 7,
  },
  {
    id: "agile-fullstack",
    position: [0, 0, -30],
    room: "experience",
    contentId: "agile-inc",
    title: "💡 Agile Inc • 2022-2024",
    description:
      "Developed institutional sites and campaigns with Next.js & React. Implemented checkout systems on Magento2, maintained WooCommerce stores, and built custom e-commerce solutions with PHP & JavaScript. Experience ranges from B2B Salesforce builds to full-stack customization.",
    duration: 7,
  },
  {
    id: "skills-showcase",
    position: [22, 0, -10],
    room: "skills",
    contentId: "skills-intro",
    title: "🛠️ Technical Toolbox",
    description:
      "Frontend: React, Next.js, TypeScript, Three.js, Tailwind CSS. Backend: Node.js, Python, PHP, SQL. Cloud: AWS, S3, CloudFront. Tools: Git, Docker, Webpack. AI/ML: Generative AI integration, prompt engineering.",
    duration: 6,
  },
  {
    id: "projects-archive",
    position: [-25, 0, -5],
    room: "projects",
    contentId: "projects-intro",
    title: "🚀 Featured Projects",
    description:
      "Interactive 3D portfolio (you are here!), AI-powered SEO analyzer, institutional websites for Agile, WooCommerce e-commerce sites, B2B Salesforce implementations, and full-stack checkout systems. Each project refined my skills across the modern web stack.",
    duration: 6,
  },
  {
    id: "parkour-challenge",
    position: [38, 0, -38],
    room: "parkour",
    contentId: "parkour-challenge",
    title: "🎮 Parkour Challenge (Optional)",
    description:
      "Test your reflexes! This optional challenge demonstrates physics-based gameplay. Jump, land, and reach the goal. No pressure—explore at your own pace.",
    duration: 5,
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
