"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    // Simulate form submission
    try {
      // In a real application, you would send the form data to your server
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast.success("Your message has been sent successfully!")

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2 group">
          <label htmlFor="name" className="text-sm font-medium group-focus-within:text-primary transition-colors">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            className="bg-muted/50 focus:border-primary transition-all duration-300 hover:bg-muted/70"
          />
        </div>
        <div className="space-y-2 group">
          <label htmlFor="email" className="text-sm font-medium group-focus-within:text-primary transition-colors">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Your email"
            value={formData.email}
            onChange={handleChange}
            className="bg-muted/50 focus:border-primary transition-all duration-300 hover:bg-muted/70"
          />
        </div>
      </div>

      <div className="space-y-2 group">
        <label htmlFor="subject" className="text-sm font-medium group-focus-within:text-primary transition-colors">
          Subject
        </label>
        <Input
          id="subject"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          className="bg-muted/50 focus:border-primary transition-all duration-300 hover:bg-muted/70"
        />
      </div>

      <div className="space-y-2 group">
        <label htmlFor="message" className="text-sm font-medium group-focus-within:text-primary transition-colors">
          Message <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="message"
          name="message"
          placeholder="Your message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          className="bg-muted/50 resize-none focus:border-primary transition-all duration-300 hover:bg-muted/70"
        />
      </div>

      <Button type="submit" className="w-full relative overflow-hidden group" disabled={isSubmitting}>
        <span className="absolute inset-0 w-full h-full bg-primary/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
        {isSubmitting ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12a7.962 7.962 0 014-6.291V8a8 8 0 01-7.8 7.995L.2 16H0c0 6.627 5.373 12 12 12v-4a8 8 0 01-8-8z"
              ></path>
            </svg>
            <span className="relative">Sending...</span>
          </>
        ) : (
          <span className="relative">Send Message</span>
        )}
      </Button>
    </form>
  )
}

