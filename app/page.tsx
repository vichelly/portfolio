"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"

import Navigation from "@/components/layout/Navigation"
import HeroSection from "@/components/sections/HeroSection"
import AboutSection from "@/components/sections/AboutSection"
import TimelineSection from "@/components/sections/TimelineSection"
import ProjectsSection from "@/components/sections/ProjectsSection"
import ContactSection from "@/components/sections/ContactSection"
import Footer from "@/components/layout/Footer"
import InteractiveBackground from "@/components/ui/InteractiveBackground"

export default function Portfolio() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [activeSection, setActiveSection] = useState("home")

  // Refs for each section
  const homeRef = useRef<HTMLElement>(null)
  const aboutRef = useRef<HTMLElement>(null)
  const timelineRef = useRef<HTMLElement>(null)
  const projectsRef = useRef<HTMLElement>(null)
  const contactRef = useRef<HTMLElement>(null)

  // Mouse movement effect for hero section
  useEffect(() => {
    setMounted(true)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  // Intersection Observer to detect active section
  useEffect(() => {
    if (!mounted) return

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }, options)

    // Observe all sections
    if (homeRef.current) observer.observe(homeRef.current)
    if (aboutRef.current) observer.observe(aboutRef.current)
    if (timelineRef.current) observer.observe(timelineRef.current)
    if (projectsRef.current) observer.observe(projectsRef.current)
    if (contactRef.current) observer.observe(contactRef.current)

    return () => {
      if (homeRef.current) observer.unobserve(homeRef.current)
      if (aboutRef.current) observer.unobserve(aboutRef.current)
      if (timelineRef.current) observer.unobserve(timelineRef.current)
      if (projectsRef.current) observer.unobserve(projectsRef.current)
      if (contactRef.current) observer.unobserve(contactRef.current)
    }
  }, [mounted])

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen relative bg-background text-foreground">
      {/* Global Interactive Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <InteractiveBackground />
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {/* Navigation Bar */}
        <Navigation activeSection={activeSection} scrollToSection={scrollToSection} theme={theme} setTheme={setTheme} />

        {/* Hero Section */}
        <HeroSection ref={homeRef} scrollToSection={scrollToSection} />

        {/* About Section */}
        <AboutSection ref={aboutRef} />

        {/* Timeline Section */}
        <TimelineSection ref={timelineRef} />

        {/* Projects Section */}
        <ProjectsSection ref={projectsRef} />

        {/* Contact Section */}
        <ContactSection ref={contactRef} />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}

