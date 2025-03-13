"use client"

import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useInView } from "react-intersection-observer"

interface Project {
  id: number
  title: string
  description: string
  tags: string[]
  image: string
  link: string
}

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  return (
    <Card
      ref={ref}
      className={`overflow-hidden group border-border transition-all duration-500 hover:shadow-lg ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden aspect-video">
        <img
          src={project.image || "/placeholder.svg"}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t from-background/90 to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-70"
          }`}
        ></div>

        <div className="absolute bottom-0 left-0 w-full p-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {project.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-background/80 backdrop-blur-sm transition-all duration-300 hover:bg-background"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
        <p className="text-muted-foreground mb-4">{project.description}</p>
        <Link href={project.link} className="inline-flex items-center text-sm font-medium text-primary hover:underline">
          View Project
          <ArrowUpRight
            className={`ml-1 h-4 w-4 transition-transform duration-300 ${
              isHovered ? "translate-x-1 -translate-y-1" : ""
            }`}
          />
        </Link>
      </CardContent>
    </Card>
  )
}

