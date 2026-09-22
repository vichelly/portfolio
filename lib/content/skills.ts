export interface SkillCategory {
  id: string
  title: string
  skills: string
  link?: string
}

export const skills: SkillCategory[] = [
  {
    id: "backend",
    title: "Back-end",
    skills: "Java, Springboot, Node.js, Express, Python, Flask",
  },
  {
    id: "frontend",
    title: "Front-end",
    skills: "React, Next.js, Angular",
  },
  {
    id: "agile",
    title: "Agile Project Management",
    skills: "Certified Professional Scrum Product Owner™ I",
    link: "https://www.credly.com/badges/bb32913c-ea6a-4f6d-8161-7dd65c651a97/linked_in_profile",
  },
  {
    id: "cloud",
    title: "Cloud Computing",
    skills: "Amazon Web Services (AWS)",
  },
  {
    id: "nocode",
    title: "No code",
    skills: "Wordpress, Woocommerce (Elementor)",
  },
]
