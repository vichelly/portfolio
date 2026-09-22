import type { Localized } from "@/lib/i18n/locale"

export interface ExperienceEntry {
  id: string
  year: string
  title: Localized
  company: string
  /** The full account, shown in the text view. */
  description: Localized
  /**
   * The short account, shown on the station panel in the world. A panel read
   * from a game camera is a poster, not a CV page: entries long enough to
   * outrun that distance carry a summary, and the full text stays one click
   * away in the text view.
   */
  summary?: Localized
}

export const experience: ExperienceEntry[] = [
  {
    id: "itau-rpa",
    year: "Jul 2025 - Present",
    title: {
      en: "Junior Software Engineer",
      pt: "Engenheiro de Software Júnior",
    },
    company: "Itaú Unibanco",
    summary: {
      en:
        "Hyperautomation - RPA · AWS, Generative AI, FinOps\n\n" +
        "Consolidated three legacy API Gateways into one governance-compliant platform - governance score 59% to 100%.\n" +
        "Shipped generative AI agents for RPA workflows: a Streamlit app on AWS ECS with Dataverse and DynamoDB.\n" +
        "Observability with Datadog, infrastructure as code in Terraform. FinOps work saving ~R$3,500/month.",
      pt:
        "Hyperautomation - RPA · AWS, IA generativa, FinOps\n\n" +
        "Consolidei três API Gateways legados em uma plataforma em conformidade - governança de 59% para 100%.\n" +
        "Coloquei em produção agentes de IA generativa para fluxos de RPA: app Streamlit no AWS ECS com Dataverse e DynamoDB.\n" +
        "Observabilidade com Datadog, infraestrutura como código em Terraform. FinOps economizando ~R$3.500/mês.",
    },
    description: {
      en:
        "Hyperautomation - RPA · AWS, Generative AI, FinOps\n\n" +
        "Led the consolidation of three legacy API Gateways into a single governance-compliant platform (v2.0 standard): redesigned authentication and authorization flows, migrated deprecated routes, implemented VPC Links and Load Balancers, and decommissioned the legacy APIs. The governance score went from 59% to 100%.\n\n" +
        "Designed and deployed generative AI agents supporting RPA products and automation workflows, including a containerized Streamlit (Python) application on AWS ECS, integrated with Microsoft Dataverse and DynamoDB to classify RPA use cases and optimize automation license distribution.\n\n" +
        "Built an AI-powered ServiceNow agent that answers recurring customer questions and cuts ticket volume for the squad.\n\n" +
        "Implemented observability - logs, tracing and APM - for ECS and Lambda with Datadog, provisioning infrastructure through Terraform and CloudFormation. Contributed to FinOps work, identifying cloud optimizations worth roughly R$3,500/month in AWS savings.",
      pt:
        "Hyperautomation - RPA · AWS, IA generativa, FinOps\n\n" +
        "Liderei a consolidação de três API Gateways legados em uma única plataforma em conformidade com a governança (padrão v2.0): redesenhei os fluxos de autenticação e autorização, migrei rotas depreciadas, implementei VPC Links e Load Balancers e descomissionei as APIs legadas. O índice de governança subiu de 59% para 100%.\n\n" +
        "Projetei e coloquei em produção agentes de IA generativa que dão suporte aos produtos de RPA e aos fluxos de automação, incluindo uma aplicação Streamlit (Python) conteinerizada no AWS ECS, integrada ao Microsoft Dataverse e ao DynamoDB para classificar casos de uso de RPA e otimizar a distribuição de licenças de automação.\n\n" +
        "Desenvolvi um agente de IA no ServiceNow que responde dúvidas recorrentes dos clientes e reduz a abertura de chamados para a squad.\n\n" +
        "Implementei observabilidade - logs, tracing e APM - para ECS e Lambda com Datadog, provisionando a infraestrutura via Terraform e CloudFormation. Atuei em FinOps, identificando otimizações de nuvem que representam cerca de R$3.500/mês de economia em AWS.",
    },
  },
  {
    id: "itau",
    year: "Jul 2024 - Jul 2025",
    title: {
      en: "Software Engineer Intern",
      pt: "Estagiário de Engenharia de Software",
    },
    company: "Itaú Unibanco",
    summary: {
      en:
        "Digital Achievement - Conquista PF · AWS, Python, AngularJS\n\n" +
        "Built Jarvis end to end: a Lambda crawler and SEO checks in Python/Flask, an LLM call for the analysis, an Angular front end on S3.\n" +
        "Rebuilt the Vault login front end on the corporate design system and moved it off EC2 to static S3 hosting.",
      pt:
        "Digital Achievement - Conquista PF · AWS, Python, AngularJS\n\n" +
        "Desenvolvi o Jarvis de ponta a ponta: crawler em Lambda e checagens de SEO em Python/Flask, chamada a LLM para a análise e front-end Angular no S3.\n" +
        "Reconstruí o front-end do login do Vault sobre o design system corporativo e tirei da EC2 para hospedagem estática em S3.",
    },
    description: {
      en:
        "Digital Achievement - Itaú Portal Management, Conquista PF · AWS, Python, AngularJS, TypeScript\n\n" +
        "Built Jarvis, a web application for SEO analysis of Itaú's non-logged portal, working across both ends. Back end: a crawler in an AWS Lambda collects the HTML of a submitted URL, runs SEO checks, and a second Lambda calls ChatGPT for the analysis, in Python with Flask. Front end: Angular components following the bank's IDS conventions, hosted from an S3 bucket.\n\n" +
        "Maintained Itaú's institutional website with VWO, ContentStack and Bynder, and exposed new open API routes through API Gateway using the iara SDK.\n\n" +
        "Vault login modernization, the last project of the internship: rebuilt the entire front end of a business-critical, high-risk internal login application on Itaú's corporate design system, replacing a legacy interface, and migrated hosting from a self-managed EC2 instance to a static S3 deployment.",
      pt:
        "Digital Achievement - Gestão do Portal Itaú, Conquista PF · AWS, Python, AngularJS, TypeScript\n\n" +
        "Desenvolvi o Jarvis, aplicação web para análise de SEO das páginas do portal não logado do Itaú, atuando nas duas pontas. Back-end: um crawler em AWS Lambda coleta o HTML da URL enviada, roda as verificações de SEO e uma segunda Lambda chama o ChatGPT para a análise, em Python com Flask. Front-end: componentes em Angular seguindo as convenções do IDS do banco, hospedados em um bucket S3.\n\n" +
        "Mantive o site institucional do Itaú com VWO, ContentStack e Bynder, e disponibilizei novas rotas de API aberta via API Gateway usando o iara SDK.\n\n" +
        "Modernização do login do Vault, último projeto do estágio: reconstruí todo o front-end de uma aplicação interna crítica e de alto risco sobre o design system corporativo do Itaú, substituindo uma interface legada, e migrei a hospedagem de uma instância EC2 autogerenciada para deploy estático em S3.",
    },
  },
  {
    id: "pspo",
    year: "2024",
    title: {
      en: "Professional Scrum Product Owner™ I (PSPO I) Certification",
      pt: "Certificação Professional Scrum Product Owner™ I (PSPO I)",
    },
    company: "Scrum.Org",
    description: { en: "", pt: "" },
  },
  {
    id: "agile-inc",
    year: "Nov 2022 - Jun 2024",
    title: {
      en: "Software Engineer Intern",
      pt: "Estagiário de Engenharia de Software",
    },
    company: "Agile inc",
    summary: {
      en:
        "Institutional sites and campaigns in Next.js and React - the company site, Scrum Day 2023, Agile School's back office.\n" +
        "A Magento2 checkout, WooCommerce storefronts, a B2B build on Salesforce and fully custom PHP/JavaScript e-commerce.",
      pt:
        "Sites institucionais e campanhas em Next.js e React - site da empresa, Scrum Day 2023, back-office da Agile School.\n" +
        "Checkout no Magento2, lojas WooCommerce, um site B2B em Salesforce e e-commerce totalmente customizado em PHP e JavaScript.",
    },
    description: {
      en:
        "During my tenure, I developed significant projects using advanced technologies. I created institutional sites and campaigns with Next.js and React, including the company's site, Scrum Day 2023 campaign, and Agile School's back-office site. I also implemented a checkout system on Magento2, maintained WooCommerce sites for Agile School, and developed on the Hotmart platform for Agile Academy's migration. Additionally, I contributed to consulting projects by building a B2B site on Salesforce and a fully customized WooCommerce e-commerce site with unique PHP and JavaScript functionalities.",
      pt:
        "Nesse período entreguei projetos relevantes com tecnologias modernas. Criei sites institucionais e campanhas em Next.js e React, incluindo o site da empresa, a campanha do Scrum Day 2023 e o back-office da Agile School. Implementei um sistema de checkout no Magento2, mantive lojas WooCommerce da Agile School e desenvolvi na plataforma Hotmart para a migração da Agile Academy. Também atuei em projetos de consultoria, construindo um site B2B no Salesforce e um e-commerce WooCommerce totalmente customizado com funcionalidades próprias em PHP e JavaScript.",
    },
  },
  {
    id: "fei",
    year: "2022",
    title: {
      en: "Bachelor's degree, Computer Science",
      pt: "Bacharelado em Ciência da Computação",
    },
    company: "FEI University Center",
    description: {
      en: "Pursued a Computer Science degree at one of Brazil's leading engineering schools, specializing in software development, artificial intelligence, and cutting-edge technologies",
      pt: "Graduação em Ciência da Computação em uma das principais escolas de engenharia do Brasil, com foco em desenvolvimento de software, inteligência artificial e tecnologias de ponta.",
    },
  },
]
