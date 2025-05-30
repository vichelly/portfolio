"use client"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import TimelineItem from "@/components/ui/TimelineItem"

const TimelineSection = forwardRef<HTMLElement>((props, ref) => {
  return (
    <section id="timeline" ref={ref} className="py-20 bg-background/50 backdrop-blur-[2px] overflow-hidden">
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
          <div className="absolute inset-y-0 left-4 md:left-1/2 md:-translate-x-1/2 w-1 bg-primary/30"></div>

          {/* Timeline Items */}
          <TimelineItem
            year="2024 - Present"
            title="Software Engineer Intern"
            company="Itaú Unibanco"
            description="Digital Achievement - Itaú Portal Management
Developed the web application Jarvis, using AWS Cloud, Angular, and Python (Flask), for SEO analysis and correction of Itaú blog pages with generative AI.
Maintain Itaú's institutional website with VWO, ContentStack, and Bynder."
            side="right"
          />

          <TimelineItem
            year="2024"
            title="Professional Scrum Product Owner™ I (PSPO I) Certification"
            company="Scrum.Org"
            description=""
            side="left"
          />

          <TimelineItem
            year="2022 - 2024"
            title="Software Engineer Intern"
            company="Agile inc"
            description="During my tenure, I developed significant projects using advanced technologies. I created institutional sites and campaigns with Next.js and React, including the company's site, Scrum Day 2023 campaign, and Agile School's back-office site. I also implemented a checkout system on Magento2, maintained WooCommerce sites for Agile School, and developed on the Hotmart platform for Agile Academy's migration. Additionally, I contributed to consulting projects by building a B2B site on Salesforce and a fully customized WooCommerce e-commerce site with unique PHP and JavaScript functionalities."
            side="right"
          />

          <TimelineItem
            year="2022"
            title="Bacharelo's degree, Computer Science"
            company="FEI University Center"
            description="Pursued a Computer Science degree at one of Brazil's leading engineering schools, specializing in software development, artificial intelligence, and cutting-edge technologies"
            side="left"
          />
        </div>
      </div>
    </section>
  )
})

TimelineSection.displayName = "TimelineSection"

export default TimelineSection