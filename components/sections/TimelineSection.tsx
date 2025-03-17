"use client"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import TimelineItem from "@/components/ui/TimelineItem"

const TimelineSection = forwardRef<HTMLElement>((props, ref) => {
  return (
    <section id="timeline" ref={ref} className="py-20 bg-background/50 backdrop-blur-[2px]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">My Journey</h2>
          <div className="h-1 w-20 bg-primary mx-auto mb-8"></div>
          <p className="text-lg text-muted-foreground">A timeline of my education and professional experience</p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary/30"></div>

          {/* Timeline Items */}
          <TimelineItem
            year="2023 - Present"
            title="Senior Frontend Developer"
            company="Tech Company"
            description="Leading the frontend development team, implementing new features, and improving performance."
            side="right"
          />

          <TimelineItem
            year="2021 - 2023"
            title="Frontend Developer"
            company="Digital Agency"
            description="Developed responsive websites and web applications for various clients using React and Next.js."
            side="left"
          />

          <TimelineItem
            year="2019 - 2021"
            title="Junior Web Developer"
            company="Startup"
            description="Worked on building and maintaining the company's web platform and internal tools."
            side="right"
          />

          <TimelineItem
            year="2015 - 2019"
            title="Computer Science Degree"
            company="University"
            description="Studied computer science with a focus on web technologies and software engineering."
            side="left"
          />
        </div>
      </div>
    </section>
  )
})

TimelineSection.displayName = "TimelineSection"

export default TimelineSection

