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
  /** Outbound links folded in from a project this entry produced (e.g. a
   *  GitHub repo), rather than that project standing as its own station. */
  links?: { label: Localized; href: string }[]
  /**
   * Short, punchy achievement bullets for entries too dense to read as one
   * paragraph on the in-world panel. When present, the world shows a compact
   * header (period, title, company) plus one short card per highlight -
   * the same short-entry layout that already reads well for certifications -
   * instead of a wall of summary text. The full prose account stays in
   * `description` for the text view either way.
   */
  highlights?: { heading: Localized; body: Localized }[]
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
        "Modernized the login for RAAS, a legacy vault platform: migrated auth from STS to Entra ID, rebuilt the Java/Spring Boot backend on blue-green EC2, and took the front end from Angular 7 to 17.\n" +
        "Shipped generative AI agents for RPA workflows: a Streamlit app on AWS ECS with Dataverse and DynamoDB.\n" +
        "Observability with Datadog, infrastructure as code in Terraform. FinOps work cut AWS artifact costs 90.3% (R$4,785 to R$463/month).",
      pt:
        "Hyperautomation - RPA · AWS, IA generativa, FinOps\n\n" +
        "Consolidei três API Gateways legados em uma plataforma em conformidade - governança de 59% para 100%.\n" +
        "Modernizei o login da RAAS, plataforma legada de vault: migrei a autenticação de STS para Entra ID, reconstruí o back-end em Java/Spring Boot sobre EC2 blue-green e levei o front-end de Angular 7 para 17.\n" +
        "Coloquei em produção agentes de IA generativa para fluxos de RPA: app Streamlit no AWS ECS com Dataverse e DynamoDB.\n" +
        "Observabilidade com Datadog, infraestrutura como código em Terraform. FinOps reduziu o custo de artefatos AWS em 90,3% (R$4.785 para R$463/mês).",
    },
    description: {
      en:
        "Hyperautomation - RPA · AWS, Generative AI, FinOps\n\n" +
        "Led the consolidation of three legacy API Gateways into a single governance-compliant platform (v2.0 standard): redesigned authentication and authorization flows, migrated deprecated routes, implemented VPC Links and Load Balancers, and decommissioned the legacy APIs. The governance score went from 59% to 100%.\n\n" +
        "Modernized the login for RAAS (Robot as a Service), a legacy vault platform that stores credentials used in the bank's low-code and high-code automations: migrated authentication from STS to Entra ID, which required back-end changes - a Java/Spring Boot API with JUnit, running on EC2 under a blue-green architecture - and a full front-end modernization, from Angular 7 to Angular 17, rebuilt on the Itaú Design System. Also moved the system off a legacy tradops account onto a DevOps architecture backed by S3.\n\n" +
        "Designed and deployed generative AI agents supporting RPA products and automation workflows, including a containerized Streamlit (Python) application on AWS ECS, integrated with Microsoft Dataverse and DynamoDB to classify RPA use cases and optimize automation license distribution.\n\n" +
        "Built an AI-powered ServiceNow agent that answers recurring customer questions and cuts ticket volume for the squad.\n\n" +
        "Implemented observability - logs, tracing and APM - for ECS and Lambda with Datadog, provisioning infrastructure through Terraform and CloudFormation. Contributed to FinOps work, cutting AWS artifact costs by 90.3% - from R$4,785 to R$463/month.",
      pt:
        "Hyperautomation - RPA · AWS, IA generativa, FinOps\n\n" +
        "Liderei a consolidação de três API Gateways legados em uma única plataforma em conformidade com a governança (padrão v2.0): redesenhei os fluxos de autenticação e autorização, migrei rotas depreciadas, implementei VPC Links e Load Balancers e descomissionei as APIs legadas. O índice de governança subiu de 59% para 100%.\n\n" +
        "Modernizei o login da RAAS (Robot as a Service), plataforma legada de vault que guarda as credenciais usadas em automações low-code e high-code do banco: migrei a autenticação de STS para Entra ID, o que exigiu mudanças no back-end - uma API Java/Spring Boot com JUnit, rodando em EC2 sob arquitetura blue-green - e uma modernização completa do front-end, de Angular 7 para Angular 17, já sobre o Itaú Design System. Também tirei o sistema de uma conta tradops legada para uma arquitetura DevOps com infraestrutura em S3.\n\n" +
        "Projetei e coloquei em produção agentes de IA generativa que dão suporte aos produtos de RPA e aos fluxos de automação, incluindo uma aplicação Streamlit (Python) conteinerizada no AWS ECS, integrada ao Microsoft Dataverse e ao DynamoDB para classificar casos de uso de RPA e otimizar a distribuição de licenças de automação.\n\n" +
        "Desenvolvi um agente de IA no ServiceNow que responde dúvidas recorrentes dos clientes e reduz a abertura de chamados para a squad.\n\n" +
        "Implementei observabilidade - logs, tracing e APM - para ECS e Lambda com Datadog, provisionando a infraestrutura via Terraform e CloudFormation. Atuei em FinOps, reduzindo o custo de artefatos AWS em 90,3% - de R$4.785 para R$463/mês.",
    },
    highlights: [
      {
        heading: { en: "API Gateway consolidation", pt: "Consolidação de API Gateway" },
        body: {
          en: "3 legacy gateways unified into 1 platform. Governance score 59% → 100%.",
          pt: "3 gateways legados unificados em 1 plataforma. Governança 59% → 100%.",
        },
      },
      {
        heading: { en: "RAAS login modernization", pt: "Modernização do login da RAAS" },
        body: {
          en: "Vault login: STS → Entra ID, Angular 7 → 17, blue-green EC2 backend.",
          pt: "Login do vault: STS → Entra ID, Angular 7 → 17, back-end em EC2 blue-green.",
        },
      },
      {
        heading: { en: "AI agents in production", pt: "Agentes de IA em produção" },
        body: {
          en: "Streamlit on ECS + Dataverse/DynamoDB. AI agent cuts ServiceNow tickets.",
          pt: "Streamlit no ECS + Dataverse/DynamoDB. Agente de IA reduz chamados no ServiceNow.",
        },
      },
      {
        heading: { en: "FinOps", pt: "FinOps" },
        body: {
          en: "AWS artifact costs cut 90.3% — R$4,785 → R$463/month.",
          pt: "Custo de artefatos AWS reduzido em 90,3% — R$4.785 → R$463/mês.",
        },
      },
    ],
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
        "Maintained components on Itaú's blog and institutional website.",
      pt:
        "Digital Achievement - Conquista PF · AWS, Python, AngularJS\n\n" +
        "Desenvolvi o Jarvis de ponta a ponta: crawler em Lambda e checagens de SEO em Python/Flask, chamada a LLM para a análise e front-end Angular no S3.\n" +
        "Manutenção de componentes no blog e no site institucional do Itaú.",
    },
    description: {
      en:
        "Digital Achievement - Itaú Portal Management, Conquista PF · AWS, Python, AngularJS, TypeScript\n\n" +
        "Built Jarvis, a web application for SEO analysis of Itaú's non-logged portal, working across both ends. Back end: a crawler in an AWS Lambda collects the HTML of a submitted URL, runs SEO checks, and a second Lambda calls ChatGPT for the analysis, in Python with Flask. Front end: Angular components following the bank's IDS conventions, hosted from an S3 bucket.\n\n" +
        "Maintained components on Itaú's institutional website and blog, working with VWO, ContentStack and Bynder, and exposed new open API routes through API Gateway using the iara SDK.",
      pt:
        "Digital Achievement - Gestão do Portal Itaú, Conquista PF · AWS, Python, AngularJS, TypeScript\n\n" +
        "Desenvolvi o Jarvis, aplicação web para análise de SEO das páginas do portal não logado do Itaú, atuando nas duas pontas. Back-end: um crawler em AWS Lambda coleta o HTML da URL enviada, roda as verificações de SEO e uma segunda Lambda chama o ChatGPT para a análise, em Python com Flask. Front-end: componentes em Angular seguindo as convenções do IDS do banco, hospedados em um bucket S3.\n\n" +
        "Mantive componentes do site institucional e do blog do Itaú, trabalhando com VWO, ContentStack e Bynder, e disponibilizei novas rotas de API aberta via API Gateway usando o iara SDK.",
    },
    highlights: [
      {
        heading: { en: "Jarvis", pt: "Jarvis" },
        body: {
          en: "SEO crawler on Lambda + Flask. A second Lambda calls an LLM to analyze each page.",
          pt: "Crawler de SEO em Lambda + Flask. Uma segunda Lambda chama um LLM pra analisar cada página.",
        },
      },
      {
        heading: { en: "Blog & institutional site", pt: "Blog & site institucional" },
        body: {
          en: "Maintained components on Itaú's blog and institutional website (VWO, ContentStack, Bynder).",
          pt: "Manutenção de componentes no blog e no site institucional do Itaú (VWO, ContentStack, Bynder).",
        },
      },
    ],
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
    id: "devin-foundations",
    year: "Apr 2026",
    title: {
      en: "Devin Foundations Badge",
      pt: "Devin Foundations Badge",
    },
    company: "Cognition",
    description: { en: "", pt: "" },
  },
  {
    id: "api-owner",
    year: "Jun 2025",
    title: {
      en: "API Owner",
      pt: "API Owner",
    },
    company: "Itaú Unibanco",
    description: { en: "", pt: "" },
  },
  {
    id: "aws-certifications",
    year: "2025",
    title: {
      en: "AWS Certifications (Practitioner, Associate, Professional)",
      pt: "Certificações AWS (Practitioner, Associate, Professional)",
    },
    company: "AWS",
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
        "During my tenure, I developed significant projects using advanced technologies. I created institutional sites and campaigns with Next.js and React, including the company's site, the Scrum Day 2023 campaign site - built with Next.js, and open-sourced with the company's permission to stand as a portfolio piece - and Agile School's back-office site. I also implemented a checkout system on Magento2, maintained WooCommerce sites for Agile School, and developed on the Hotmart platform for Agile Academy's migration. Additionally, I contributed to consulting projects by building a B2B site on Salesforce and a fully customized WooCommerce e-commerce site with unique PHP and JavaScript functionalities.",
      pt:
        "Nesse período entreguei projetos relevantes com tecnologias modernas. Criei sites institucionais e campanhas em Next.js e React, incluindo o site da empresa, o site da campanha do Scrum Day 2023 - construído em Next.js, e disponibilizado com permissão da empresa como peça de portfólio - e o back-office da Agile School. Implementei um sistema de checkout no Magento2, mantive lojas WooCommerce da Agile School e desenvolvi na plataforma Hotmart para a migração da Agile Academy. Também atuei em projetos de consultoria, construindo um site B2B no Salesforce e um e-commerce WooCommerce totalmente customizado com funcionalidades próprias em PHP e JavaScript.",
    },
    links: [{ label: { en: "Scrum Day 2023 (GitHub)", pt: "Scrum Day 2023 (GitHub)" }, href: "https://github.com/vichelly/SD23" }],
    highlights: [
      {
        heading: { en: "Sites & campaigns", pt: "Sites & campanhas" },
        body: {
          en: "Next.js/React sites incl. Scrum Day 2023 and Agile School's back office.",
          pt: "Sites em Next.js/React incl. Scrum Day 2023 e o back-office da Agile School.",
        },
      },
      {
        heading: { en: "E-commerce & checkout", pt: "E-commerce & checkout" },
        body: {
          en: "Magento2 checkout, WooCommerce stores, Hotmart migration for Agile Academy.",
          pt: "Checkout no Magento2, lojas WooCommerce, migração da Agile Academy pro Hotmart.",
        },
      },
      {
        heading: { en: "Consulting projects", pt: "Projetos de consultoria" },
        body: {
          en: "A B2B site on Salesforce and a fully custom PHP/JavaScript e-commerce.",
          pt: "Site B2B no Salesforce e e-commerce totalmente customizado em PHP/JavaScript.",
        },
      },
    ],
  },
  {
    id: "fei",
    year: "2022",
    title: {
      en: "Bachelor's degree, Computer Science",
      pt: "Bacharelado em Ciência da Computação",
    },
    company: "FEI University Center",
    summary: {
      en:
        "Pursued a Computer Science degree at one of Brazil's leading engineering schools, specializing in software development, artificial intelligence, and cutting-edge technologies.\n\n" +
        "TCC (senior thesis): Atena, a teleoperated humanoid robot.\n" +
        "Course projects: WorkAround and Gastly Busters.",
      pt:
        "Graduação em Ciência da Computação em uma das principais escolas de engenharia do Brasil, com foco em desenvolvimento de software, inteligência artificial e tecnologias de ponta.\n\n" +
        "TCC: Atena, um robô humanoide teleoperado.\n" +
        "Projetos do curso: WorkAround e Gastly Busters.",
    },
    description: {
      en:
        "Pursued a Computer Science degree at one of Brazil's leading engineering schools, specializing in software development, artificial intelligence, and cutting-edge technologies.\n\n" +
        "TCC (senior thesis): Atena, a teleoperated humanoid robot built on the open-source InMoov platform, replicating a human operator's arm, forearm and hand movements in real time. Computer vision (MediaPipe and a ZED camera) captures the operator's body landmarks and gestures; the data is published over MQTT and consumed by a ROS2 control system, which drives the robot's actuators, including Dynamixel motors and a PCA9685 board. Built with a team, split across a Windows computer-vision/publisher pipeline and a Linux ROS2/subscriber pipeline.\n\n" +
        "Course projects: WorkAround, a service-marketplace platform covering use-case modeling, Figma prototyping, and software engineering practice; and Gastly Busters, a browser game built in the first semester with plain JavaScript and Canvas.",
      pt:
        "Graduação em Ciência da Computação em uma das principais escolas de engenharia do Brasil, com foco em desenvolvimento de software, inteligência artificial e tecnologias de ponta.\n\n" +
        "TCC: Atena, um robô humanoide teleoperado construído sobre a plataforma open-source InMoov, que replica em tempo real os movimentos dos braços, antebraços e mãos de um operador humano. A visão computacional (MediaPipe e câmera ZED) captura os marcos corporais e gestos do operador; os dados são publicados via MQTT e consumidos por um sistema de controle em ROS2, que aciona os atuadores do robô, incluindo motores Dynamixel e uma placa PCA9685. Desenvolvido em equipe, dividido entre um pipeline de visão computacional/publisher no Windows e um pipeline ROS2/subscriber no Linux.\n\n" +
        "Projetos do curso: WorkAround, uma plataforma de marketplace de serviços com modelagem de casos de uso, prototipação no Figma e prática de engenharia de software; e Gastly Busters, um jogo de navegador feito no primeiro semestre com JavaScript puro e Canvas.",
    },
    links: [
      { label: { en: "Atena — TCC (GitHub)", pt: "Atena — TCC (GitHub)" }, href: "https://github.com/fei-atena/fei-atena-tcc" },
      { label: { en: "WorkAround (wiki)", pt: "WorkAround (wiki)" }, href: "https://github.com/vichelly/WorkAround_B2C/wiki" },
      { label: { en: "Gastly Busters (play)", pt: "Gastly Busters (jogar)" }, href: "https://vichelly.github.io/gastly-busters/jogo.html" },
    ],
    highlights: [
      {
        heading: { en: "TCC — Atena (teleoperated robot)", pt: "TCC — Atena (robô teleoperado)" },
        body: {
          en: "Humanoid robot (InMoov) mirrors an operator's arm movements via MediaPipe + ZED, MQTT and ROS2.",
          pt: "Robô humanoide (InMoov) replica os movimentos dos braços do operador via MediaPipe + ZED, MQTT e ROS2.",
        },
      },
      {
        heading: { en: "Course projects", pt: "Projetos do curso" },
        body: {
          en: "WorkAround, a service marketplace; Gastly Busters, a first-semester browser game.",
          pt: "WorkAround, marketplace de serviços; Gastly Busters, jogo de navegador do primeiro semestre.",
        },
      },
    ],
  },
  {
    id: "fiap",
    year: "Mar 2026 - Aug 2026",
    title: {
      en: "Postgraduate Degree, Artificial Intelligence",
      pt: "Pós-graduação em Inteligência Artificial",
    },
    company: "FIAP",
    description: {
      en:
        "Specialization program covering Python for ML, classical algorithms (regression, clustering, decision trees) and model validation; computer vision (CNNs, OCR, object detection, YOLO, GANs); NLP and large language models; practical GenAI - prompt engineering, LangChain, LangGraph and RAG for document analysis; scalable ML on AWS, Azure and Google Cloud; and data protection under the LGPD.",
      pt:
        "Especialização cobrindo Python para ML, algoritmos clássicos (regressão, clusterização, árvores de decisão) e validação de modelos; visão computacional (CNNs, OCR, detecção de objetos, YOLO, GANs); NLP e modelos de linguagem de grande escala; GenAI na prática - prompt engineering, LangChain, LangGraph e RAG para análise de documentos; ML escalável em AWS, Azure e Google Cloud; e proteção de dados sob a LGPD.",
    },
  },
]
