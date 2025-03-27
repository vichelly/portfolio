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
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">About Me</h2>
          <div className="h-1 w-20 bg-primary mx-auto mb-8"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-6"
          >
            <p className="text-lg">
              Software engineer specializing in web development using technologies such as Java, Angular, React, Python, and AWS cloud. I have experience with agile teams and a strong product ownership mindset. Currently, I work at Itaú Unibanco, where I develop innovative solutions with the team that manages the Itaú Portal, improving user experience and operational efficiency. I am always open to collaborations and opportunities involving technological innovation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { title: "Back-end", skills: "Java, Springboot, Node.js, Express, Python, Flask" },
              { title: "Front-end", skills: "React, Next.js, Angular" },
              { title: "Agile Project Management", skills: <a href="https://www.credly.com/badges/bb32913c-ea6a-4f6d-8161-7dd65c651a97/linked_in_profile" target="_blank" rel="noopener noreferrer">Certified Professional Scrum Product Owner™ I</a> },
              { title: "Cloud Computing", skills: "Amazon Web Services (AWS)" },
              { title: "No code", skills: "Wordpress, Woocommerce (Elementor)" }
            ].map((item, index) => (
              <div key={index} className="bg-primary/10 p-6 rounded-lg text-center">
                <h3 className="text-x font-bold mb-2 break-words">{item.title}</h3>
                <p className="break-words">{item.skills}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
})

AboutSection.displayName = "AboutSection"

export default AboutSection
