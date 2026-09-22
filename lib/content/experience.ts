export interface ExperienceEntry {
  id: string
  year: string
  title: string
  company: string
  description: string
}

export const experience: ExperienceEntry[] = [
  {
    id: "itau",
    year: "2024 - Present",
    title: "Software Engineer Intern",
    company: "Itaú Unibanco",
    description:
      "Digital Achievement - Itaú Portal Management\n" +
      "Developed the web application Jarvis, using AWS Cloud, Angular, and Python (Flask), for SEO analysis and correction of Itaú blog pages with generative AI.\n" +
      "Maintain Itaú's institutional website with VWO, ContentStack, and Bynder.\n\n" +
      "Vault login modernization: rebuilt the entire front end of a business-critical, high-risk internal Vault login application using Itaú's corporate design system, replacing a legacy interface. Migrated hosting from a self-managed EC2 instance to a static S3-hosted deployment, reducing operational overhead while modernizing a system few engineers were comfortable touching.",
  },
  {
    id: "pspo",
    year: "2024",
    title: "Professional Scrum Product Owner™ I (PSPO I) Certification",
    company: "Scrum.Org",
    description: "",
  },
  {
    id: "agile-inc",
    year: "2022 - 2024",
    title: "Software Engineer Intern",
    company: "Agile inc",
    description:
      "During my tenure, I developed significant projects using advanced technologies. I created institutional sites and campaigns with Next.js and React, including the company's site, Scrum Day 2023 campaign, and Agile School's back-office site. I also implemented a checkout system on Magento2, maintained WooCommerce sites for Agile School, and developed on the Hotmart platform for Agile Academy's migration. Additionally, I contributed to consulting projects by building a B2B site on Salesforce and a fully customized WooCommerce e-commerce site with unique PHP and JavaScript functionalities.",
  },
  {
    id: "fei",
    year: "2022",
    title: "Bacharelo's degree, Computer Science",
    company: "FEI University Center",
    description:
      "Pursued a Computer Science degree at one of Brazil's leading engineering schools, specializing in software development, artificial intelligence, and cutting-edge technologies",
  },
]
