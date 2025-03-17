"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function ContactForm() {
  return (
    <motion.form
      className="space-y-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            className="w-full px-4 py-2 border border-border rounded-md bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Your Name"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-4 py-2 border border-border rounded-md bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="your.email@example.com"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium">
          Subject
        </label>
        <input
          id="subject"
          className="w-full px-4 py-2 border border-border rounded-md bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Subject"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          className="w-full px-4 py-2 border border-border rounded-md bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Your message..."
        />
      </div>
      <Button type="submit" className="w-full">
        Send Message
      </Button>
    </motion.form>
  )
}

