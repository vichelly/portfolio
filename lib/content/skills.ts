import type { Localized } from "@/lib/i18n/locale"

export interface SkillCategory {
  id: string
  title: Localized
  skills: Localized
  link?: string
}

export const skills: SkillCategory[] = [
  {
    id: "backend",
    title: { en: "Back-end", pt: "Back-end" },
    skills: {
      en: "Go, Java, Spring Boot, Node.js, Express, Python, Flask",
      pt: "Go, Java, Spring Boot, Node.js, Express, Python, Flask",
    },
  },
  {
    id: "frontend",
    title: { en: "Front-end", pt: "Front-end" },
    skills: {
      en: "React, Next.js, Angular, TypeScript",
      pt: "React, Next.js, Angular, TypeScript",
    },
  },
  {
    id: "agile",
    title: { en: "Agile Project Management", pt: "Gestão Ágil de Projetos" },
    skills: {
      en: "Certified Professional Scrum Product Owner™ I",
      pt: "Professional Scrum Product Owner™ I certificado",
    },
    link: "https://www.credly.com/badges/bb32913c-ea6a-4f6d-8161-7dd65c651a97/linked_in_profile",
  },
  {
    id: "cloud",
    title: { en: "Cloud & Infrastructure", pt: "Cloud e Infraestrutura" },
    skills: {
      en: "AWS (S3, EC2, CloudFront, Lambda), Docker, CI/CD",
      pt: "AWS (S3, EC2, CloudFront, Lambda), Docker, CI/CD",
    },
  },
  {
    id: "nocode",
    title: { en: "No code", pt: "No code" },
    skills: {
      en: "WordPress, WooCommerce (Elementor), Magento2, Salesforce",
      pt: "WordPress, WooCommerce (Elementor), Magento2, Salesforce",
    },
  },
]
