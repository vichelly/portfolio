"use client"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import ProjectCard from "@/components/ui/ProjectCard"

const ProjectsSection = forwardRef<HTMLElement>((props, ref) => {
  const projects = [
    {
      title: "E-commerce Platform",
      description: "A full-featured online store with product management, cart functionality, and payment processing.",
      tags: ["Next.js", "Tailwind CSS", "Stripe"],
      image: "/placeholder.svg?height=300&width=500",
      link: "#",
      github: "#",
    },
    {
      title: "Portfolio Website",
      description: "A responsive portfolio website with dark mode, animations, and contact form.",
      tags: ["React", "Framer Motion", "Tailwind CSS"],
      image: "/placeholder.svg?height=300&width=500",
      link: "#",
      github: "#",
    },
    {
      title: "Task Management App",
      description: "A productivity app for managing tasks, projects, and deadlines with team collaboration features.",
      tags: ["React", "Node.js", "MongoDB"],
      image: "/placeholder.svg?height=300&width=500",
      link: "#",
      github: "#",
    },
    {
      title: "Weather Dashboard",
      description: "A weather application showing current conditions and forecasts with interactive maps.",
      tags: ["JavaScript", "API Integration", "CSS"],
      image: "/placeholder.svg?height=300&width=500",
      link: "#",
      github: "#",
    },
    {
      title: "Blog Platform",
      description: "A content management system for creating and publishing blog posts with user authentication.",
      tags: ["Next.js", "Prisma", "PostgreSQL"],
      image: "/placeholder.svg?height=300&width=500",
      link: "#",
      github: "#",
    },
    {
      title: "Fitness Tracker",
      description: "An application for tracking workouts, progress, and setting fitness goals.",
      tags: ["React Native", "Firebase", "Redux"],
      image: "/placeholder.svg?height=300&width=500",
      link: "#",
      github: "#",
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

