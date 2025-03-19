"use client"

import { forwardRef } from "react"
import { motion } from "framer-motion"

const AboutSection = forwardRef<HTMLElement>((props, ref) => {
  return (
    <section id="about" ref={ref} className="py-20 bg-muted/10 backdrop-blur-[2px]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">About Me</h2>
          <div className="h-1 w-20 bg-primary mx-auto mb-8"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-lg">
              Software engineer specializing in Front and Back-end web development using technologies such as React, Node.js, Angular, Python, and AWS technologies. Currently working at Itaú Unibanco, where I develop innovative solutions with the team responsible for the Itaú Portal, improving user experience and operational efficiency. I'm always open to collaborations and opportunities involving technological innovation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="bg-primary/10 p-6 rounded-lg text-center">
              <h3 className="text-x font-bold mb-2">Front-end</h3>
              <p>React, Next.js, Angular</p>
            </div>
            <div className="bg-primary/10 p-6 rounded-lg text-center">
              <h3 className="text-x font-bold mb-2">Back-end</h3>
              <p>Node.js, Express, Python, Flask</p>
            </div>
            <div className="bg-primary/10 p-6 rounded-lg text-center">
              <h3 className="text-x font-bold mb-2">Agile Project Management</h3>
              <p> <a href="https://www.credly.com/badges/bb32913c-ea6a-4f6d-8161-7dd65c651a97/linked_in_profile" target="_blank_">Certified Professional Scrum Product Owner™ I</a></p>
            </div>
            <div className="bg-primary/10 p-6 rounded-lg text-center">
              <h3 className="text-x font-bold mb-2">Cloud Computing</h3>
              <p>Amazon Web Services (AWS)</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
})

AboutSection.displayName = "AboutSection"

export default AboutSection

