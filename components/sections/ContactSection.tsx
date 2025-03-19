"use client"

import { forwardRef } from "react"
import { Linkedin, Mail } from "lucide-react"
import { motion } from "framer-motion"
import ContactForm from "@/components/ui/ContactForm"

const ContactSection = forwardRef<HTMLElement>((props, ref) => {
  return (
    <section id="contact" ref={ref} className="py-20 bg-background/50 backdrop-blur-[2px]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
          <div className="h-1 w-20 bg-primary mx-auto mb-8"></div>
          <p className="text-lg text-muted-foreground">Interested in working together? Feel free to reach out!</p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.a
              href="https://www.linkedin.com/in/vitor-lucas-fujita-felício"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-8 rounded-lg bg-card hover:bg-primary/10 transition-colors border border-border"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Linkedin className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">LinkedIn</h3>
              <p className="text-center text-muted-foreground">Connect with me on LinkedIn</p>
            </motion.a>

            <motion.a
              href="mailto:vlucasff@hotmail.com"
              className="flex flex-col items-center p-8 rounded-lg bg-card hover:bg-primary/10 transition-colors border border-border"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              target="_blank_"
            >
              <Mail className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <p className="text-center text-muted-foreground">Send me an email at vlucasff@hotmail.com</p>
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  )
})

ContactSection.displayName = "ContactSection"

export default ContactSection

