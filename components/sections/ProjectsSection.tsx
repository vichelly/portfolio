"use client"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import ProjectCard from "@/components/ui/ProjectCard"

const ProjectsSection = forwardRef<HTMLElement>((props, ref) => {
  const projects = [
    {
      title: "PowerLifting Personal Records API",
      description: "User registration API and data related to their personal records in powerlifting exercises.",
      tags: ["Java","Springboot","Lambok","PostgreeSQL","Flask","Gemini AI","Angular"],
      image: "/projectspringpr.png?height=300&width=500",
      link: "https://www.linkedin.com/feed/update/urn:li:activity:7314102784411295744/",
      github: "https://github.com/vichelly/my-powerlifting-personal-records",
    },
    {
      title: "Scrum Day 2023 website",
      description: "The official website for Scrum Day 2023, providing event information, schedules, speaker details, and registration capabilities. Built with Next.js for optimal performance and user experience.",
      tags: ["Javascript","Typescript","Next.js"],
      image: "/scrumday.png?height=300&width=500",
      link: "https://github.com/vichelly/SD23",
      github: "https://github.com/vichelly/SD23",
    },
    {
      title: "Link Reader",
      description: "Link Reader is a simple web app built with Flask to experiment with the Gemini API. Users input a URL, and the app uses Python to scrape and summarize the webpage's content into a few sentences.",
      tags: ["Python","Flask","Gemini AI API","LLM"],
      image: "/linkreader.png?height=300&width=500",
      link: "https://link-reader.vercel.app/",
      github: "https://github.com/vichelly/LinkReader",
    },
    {
      title: "WorkAround",
      description: "WorkAround is a software engineering project developing a platform for connecting clients with domestic service providers. It includes use case modeling, Figma prototyping, and software engineering best practices, focusing on service scheduling, payment, and feedback.",
      tags: ["Figma"],
      image: "workaround.png?height=300&width=500",
      link: "https://github.com/vichelly/WorkAround_B2C/wiki",
      github: "https://github.com/vichelly/WorkAround_B2C/wiki",
    },
    {
      title: "Itaú Jr. Back-end",
      description: "This project is a practical learning experience with Spring Boot, inspired by the Itaú programming challenge. It implements a REST API that receives financial transactions and calculates real-time statistics, such as the sum, average, minimum, and maximum of transaction values over the last 60 seconds. The project adheres to the challenge's constraints, using only in-memory storage and JSON-based communication.",
      tags: ["Java", "Sringboot"],
      image: "API-Spring.png?height=300&width=500",
      link: "https://github.com/vichelly/desafio-itau-backend",
      github: "https://github.com/vichelly/desafio-itau-backend",
    },
    {
      title: "Gastly busters",
      description: "This is a simple game I created during my first semester of computer science at university. It was a straightforward project, but quite challenging. I spent many nights programming it, and I'm very proud of the game, even though it's simple and has a few bugs.",
      tags: ["Javascript", "Canvas"],
      image: "gastlybusters.png?height=300&width=500",
      link: "https://vichelly.github.io/gastly-busters/jogo.html",
      github: "https://github.com/vichelly/gastly-busters",
    },
  ]

  return (
    <section id="projects" ref={ref} className="py-20 bg-muted/10 backdrop-blur-[2px]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">My Projects</h2>
          <div className="h-1 w-20 bg-primary mx-auto mb-8"></div>
          <p className="text-lg text-muted-foreground">A selection of my recent work and personal projects</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              title={project.title}
              description={project.description}
              tags={project.tags}
              image={project.image}
              link={project.link}
              github={project.github}
            />
          ))}
        </div>
      </div>
    </section>
  )
})

ProjectsSection.displayName = "ProjectsSection"

export default ProjectsSection

