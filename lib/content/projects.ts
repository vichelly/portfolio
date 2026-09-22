import type { Localized } from "@/lib/i18n/locale"

export interface ProjectEntry {
  id: string
  title: string
  description: Localized
  tags: string[]
  image: string
  link: string
  github: string
}

export const projects: ProjectEntry[] = [
  {
    id: "powerlifting-pr-api",
    title: "PowerLifting Personal Records API",
    description: {
      en:
        "User registration API and data related to their personal records in powerlifting exercises.",
      pt: "API de cadastro de usuários e dos dados relacionados aos seus recordes pessoais em exercícios de powerlifting.",
    },
    tags: ["Java", "Springboot", "Lambok", "PostgreeSQL", "Flask", "Gemini AI", "Angular"],
    image: "/projectspringpr.png?height=300&width=500",
    link: "https://www.linkedin.com/feed/update/urn:li:activity:7314102784411295744/",
    github: "https://github.com/vichelly/my-powerlifting-personal-records",
  },
  {
    id: "scrum-day-2023",
    title: "Scrum Day 2023 website",
    description: {
      en:
        "The official website for Scrum Day 2023, providing event information, schedules, speaker details, and registration capabilities. Built with Next.js for optimal performance and user experience.",
      pt: "Site oficial do Scrum Day 2023, com informações do evento, programação, palestrantes e inscrições. Construído em Next.js para desempenho e experiência de uso.",
    },
    tags: ["Javascript", "Typescript", "Next.js"],
    image: "/scrumday.png?height=300&width=500",
    link: "https://github.com/vichelly/SD23",
    github: "https://github.com/vichelly/SD23",
  },
  {
    id: "link-reader",
    title: "Link Reader",
    description: {
      en:
        "Link Reader is a simple web app built with Flask to experiment with the Gemini API. Users input a URL, and the app uses Python to scrape and summarize the webpage's content into a few sentences.",
      pt: "O Link Reader é um app web em Flask feito para experimentar a API do Gemini. O usuário informa uma URL e a aplicação usa Python para extrair e resumir o conteúdo da página em poucas frases.",
    },
    tags: ["Python", "Flask", "Gemini AI API", "LLM"],
    image: "/linkreader.png?height=300&width=500",
    link: "https://link-reader.vercel.app/",
    github: "https://github.com/vichelly/LinkReader",
  },
  {
    id: "workaround",
    title: "WorkAround",
    description: {
      en:
        "WorkAround is a software engineering project developing a platform for connecting clients with domestic service providers. It includes use case modeling, Figma prototyping, and software engineering best practices, focusing on service scheduling, payment, and feedback.",
      pt: "Projeto de engenharia de software que desenvolve uma plataforma para conectar clientes a prestadores de serviços domésticos. Inclui modelagem de casos de uso, prototipação no Figma e boas práticas de engenharia, com foco em agendamento, pagamento e avaliação dos serviços.",
    },
    tags: ["Figma"],
    image: "workaround.png?height=300&width=500",
    link: "https://github.com/vichelly/WorkAround_B2C/wiki",
    github: "https://github.com/vichelly/WorkAround_B2C/wiki",
  },
  {
    id: "itau-jr-backend",
    title: "Itaú Jr. Back-end",
    description: {
      en:
        "This project is a practical learning experience with Spring Boot, inspired by the Itaú programming challenge. It implements a REST API that receives financial transactions and calculates real-time statistics, such as the sum, average, minimum, and maximum of transaction values over the last 60 seconds. The project adheres to the challenge's constraints, using only in-memory storage and JSON-based communication.",
      pt: "Projeto prático de aprendizado com Spring Boot, inspirado no desafio de programação do Itaú. Implementa uma API REST que recebe transações financeiras e calcula estatísticas em tempo real — soma, média, mínimo e máximo dos valores dos últimos 60 segundos. Segue as restrições do desafio, usando apenas armazenamento em memória e comunicação em JSON.",
    },
    tags: ["Java", "Sringboot"],
    image: "API-Spring.png?height=300&width=500",
    link: "https://github.com/vichelly/desafio-itau-backend",
    github: "https://github.com/vichelly/desafio-itau-backend",
  },
  {
    id: "gastly-busters",
    title: "Gastly busters",
    description: {
      en:
        "This is a simple game I created during my first semester of computer science at university. It was a straightforward project, but quite challenging. I spent many nights programming it, and I'm very proud of the game, even though it's simple and has a few bugs.",
      pt: "Um jogo simples que criei no primeiro semestre de Ciência da Computação. Foi um projeto direto, mas bem desafiador. Passei muitas noites programando e tenho bastante orgulho dele, mesmo simples e com alguns bugs.",
    },
    tags: ["Javascript", "Canvas"],
    image: "gastlybusters.png?height=300&width=500",
    link: "https://vichelly.github.io/gastly-busters/jogo.html",
    github: "https://github.com/vichelly/gastly-busters",
  },
]
