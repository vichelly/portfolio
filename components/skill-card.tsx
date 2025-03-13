"use client"

import { useInView } from "react-intersection-observer"
import { useState } from "react"

interface SkillProps {
  skill: {
    name: string
    icon: string
  }
}

export default function SkillCard({ skill }: SkillProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center justify-center p-4 bg-background rounded-lg border border-border shadow-sm transition-all duration-500 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } hover:shadow-md hover:-translate-y-2`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`w-12 h-12 mb-3 flex items-center justify-center transition-all duration-300 ${
          isHovered ? "scale-110" : ""
        }`}
      >
        <div
          className={`w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold transition-all duration-300 ${
            isHovered ? "bg-primary/20" : ""
          }`}
        >
          {skill.name.charAt(0)}
        </div>
      </div>
      <h3 className="text-sm font-medium text-center">{skill.name}</h3>
    </div>
  )
}

