"use client"

import { motion } from "framer-motion"

interface TimelineItemProps {
  year: string
  title: string
  company: string
  description: string
  side: "left" | "right"
}

export default function TimelineItem({ year, title, company, description, side }: TimelineItemProps) {
  return (
    <motion.div
      className={`relative mb-16 ${side === "left" ? "md:pr-10 md:text-right" : "md:pl-10"} md:w-1/2 ${side === "left" ? "md:ml-0 md:mr-auto" : "md:ml-auto md:mr-0"}`}
      initial={{ opacity: 0, x: side === "left" ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div
        className={`p-6 rounded-lg border border-border bg-card shadow-sm ${side === "left" ? "md:mr-4" : "md:ml-4"}`}
      >
        <div className="absolute top-6 bg-primary text-primary-foreground py-1 px-3 rounded-full text-sm font-medium">
          {year}
        </div>
        <div className={`mt-8`}>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-primary font-medium mb-2">{company}</p>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}

