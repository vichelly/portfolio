"use client"

import { ArrowUpRight, Github, Linkedin, Mail, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ProjectCard from "@/components/project-card"
import ContactForm from "@/components/contact-form"
import { useState, useEffect } from "react"
import ParticleBackground from "@/components/particle-background"
import { useTheme } from "next-themes"
import Timeline from "@/components/timeline"
import { Toaster } from "sonner"
import Image from "next/image";
import styles from "./styles/perfil-image.module.css"

export default function Portfolio() {
  const [scrollY, setScrollY] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Handle mouse movement for interactive elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Handle scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Theme setup
  useEffect(() => {
    setMounted(true)
  }, [])

  const projects = [
    {
      id: 1,
      title: "E-commerce Platform",
      description: "A full-stack e-commerce solution with payment integration and admin dashboard.",
      tags: ["React", "Node.js", "MongoDB", "Stripe"],
      image: "/placeholder.svg?height=400&width=600",
      link: "#",
    },
    {
      id: 2,
      title: "Social Media App",
      description: "A responsive social media application with real-time messaging and notifications.",
      tags: ["Next.js", "Firebase", "Tailwind CSS", "WebSockets"],
      image: "/placeholder.svg?height=400&width=600",
      link: "#",
    },
    {
      id: 3,
      title: "Portfolio Website",
      description: "A creative portfolio website with interactive animations and 3D elements.",
      tags: ["Three.js", "GSAP", "React", "Framer Motion"],
      image: "/placeholder.svg?height=400&width=600",
      link: "#",
    },
  ]

  const timelineItems = [
    {
      year: "2023 - Present",
      title: "Senior Frontend Developer",
      company: "Tech Innovations Inc.",
      description: "Leading the frontend team in developing cutting-edge web applications using React and Next.js.",
    },
    {
      year: "2020 - 2023",
      title: "Full Stack Developer",
      company: "Digital Solutions Ltd.",
      description: "Developed and maintained full-stack applications using MERN stack and implemented CI/CD pipelines.",
    },
    {
      year: "2018 - 2020",
      title: "Web Developer",
      company: "Creative Agency",
      description:
        "Created responsive websites and interactive user interfaces for various clients across different industries.",
    },
    {
      year: "2016 - 2018",
      title: "Junior Developer",
      company: "Startup Hub",
      description:
        "Started my career building websites using HTML, CSS, and JavaScript while learning modern frameworks.",
    },
  ]

  // Calculate parallax effect for hero elements based on mouse position
  const calculateParallax = (depth = 20) => {
    if (typeof window === "undefined") return { x: 0, y: 0 }

    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    const x = (mousePosition.x - centerX) / depth
    const y = (mousePosition.y - centerY) / depth

    return { x, y }
  }

  const heroParallax = calculateParallax(40)
  const subtitleParallax = calculateParallax(60)

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Sonner Toaster */}
      <Toaster position="top-right" richColors />

      {/* Header with animated background */}
      <header
        className={`fixed w-full z-50 transition-all duration-500 ${
          scrollY > 50 ? "bg-background/90 backdrop-blur-md shadow-md py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight hover:text-primary transition-colors">
            Portfolio
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div
              className={`w-6 h-0.5 bg-foreground mb-1.5 transition-all duration-300 ease-in-out transform origin-center ${
                isMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            ></div>
            <div
              className={`w-6 h-0.5 bg-foreground mb-1.5 transition-all duration-300 ease-in-out ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            ></div>
            <div
              className={`w-6 h-0.5 bg-foreground transition-all duration-300 ease-in-out transform origin-center ${
                isMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            ></div>
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {["Home", "About", "Experience", "Projects", "Contact"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {mounted &&
                (theme === "dark" ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-700" />
                ))}
            </button>
          </nav>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden absolute w-full bg-background/95 backdrop-blur-md transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-80 py-4 shadow-md" : "max-h-0 overflow-hidden"
          }`}
        >
          <div className="container mx-auto px-4 flex flex-col gap-4">
            {["Home", "About", "Experience", "Projects", "Contact"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </Link>
            ))}

            {/* Mobile theme toggle */}
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Theme</span>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {mounted &&
                  (theme === "dark" ? (
                    <Sun className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <Moon className="h-5 w-5 text-slate-700" />
                  ))}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section with interactive background */}
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Interactive particle background */}
        <ParticleBackground />

        {/* Content with parallax effect */}
        <div className="container mx-auto px-4 z-10 text-center relative">
          <div
            className="absolute top-1/2 left-1/2 w-64 h-64 md:w-96 md:h-96 rounded-full bg-primary/20 blur-3xl -translate-x-1/2 -translate-y-1/2"
            style={{
              transform: `translate(calc(-50% + ${heroParallax.x * 2}px), calc(-50% + ${heroParallax.y * 2}px))`,
            }}
          ></div>

          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight relative"
            style={{
              transform: `translate(${heroParallax.x}px, ${heroParallax.y}px)`,
            }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Creative Developer
            </span>
          </h1>
          <p
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 relative"
            style={{
              transform: `translate(${subtitleParallax.x}px, ${subtitleParallax.y}px)`,
            }}
          >
            Crafting beautiful digital experiences with code and creativity
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Button
              size="lg"
              className="group relative overflow-hidden"
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
            >
              <span className="absolute inset-0 w-full h-full bg-primary/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
              <span className="relative">View Projects</span>
              <ArrowUpRight className="relative ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group relative overflow-hidden"
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              <span className="absolute inset-0 w-full h-full bg-primary/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
              <span className="relative">Contact Me</span>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-muted-foreground flex justify-center items-start p-1">
            <div className="w-1 h-3 bg-muted-foreground rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* About section with scroll animations */}
      <section id="about" className="py-20 bg-muted/30 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl -translate-y-1/2"
          style={{
            opacity: Math.min(1, Math.max(0, (scrollY - 300) / 300)),
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <h2
            className="text-3xl md:text-4xl font-bold mb-12 text-center"
            style={{
              opacity: Math.min(1, Math.max(0, (scrollY - 300) / 300)),
            }}
          >
            About <span className="text-primary">Me</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div
              className="relative"
              style={{
                opacity: Math.min(1, Math.max(0, (scrollY - 300) / 300)),
              }}
            >
              {/* Imagem de Perfil */}
              <div className={`aspect-square rounded-2xl overflow-hidden border border-border shadow-xl ${styles['perfil-image']}`}
              >
                <Image
                  src=""
                  alt="Profile"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className={`absolute -bottom-6 -right-6 bg-background p-4 rounded-xl shadow-lg border border-border ${styles['social-footer']}`}
              >
                <div className="flex gap-4">
                  <Link
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors transform hover:scale-110 duration-200"
                  >
                    <Github className="h-6 w-6" />
                  </Link>
                  <Link
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors transform hover:scale-110 duration-200"
                  >
                    <Linkedin className="h-6 w-6" />
                  </Link>
                  <Link
                    href="mailto:example@example.com"
                    className="text-muted-foreground hover:text-foreground transition-colors transform hover:scale-110 duration-200"
                  >
                    <Mail className="h-6 w-6" />
                  </Link>
                </div>
              </div>
            </div>

            <div
              style={{
                opacity: Math.min(1, Math.max(0, (scrollY - 300) / 300)),
              }}
            >
              <h3
                className="text-2xl font-semibold mb-4"
                style={{
                  opacity: Math.min(1, Math.max(0, (scrollY - 450) / 200)),
                }}
              >
                Hello, I&apos;m <span className="text-primary">John Doe</span>
              </h3>
              <p
                className="text-muted-foreground mb-6"
                style={{
                  opacity: Math.min(1, Math.max(0, (scrollY - 500) / 200)),
                }}
              >
                I&apos;m a passionate full-stack developer with over 5 years of experience creating engaging digital
                experiences. I specialize in building modern web applications with React, Next.js, and Node.js.
              </p>
              <p
                className="text-muted-foreground mb-6"
                style={{
                  opacity: Math.min(1, Math.max(0, (scrollY - 550) / 200)),
                }}
              >
                My approach combines technical expertise with creative problem-solving to deliver solutions that are not
                only functional but also visually appealing and user-friendly.
              </p>

              <div
                className="grid grid-cols-2 gap-4 mb-8"
                style={{
                  opacity: Math.min(1, Math.max(0, (scrollY - 600) / 200)),
                }}
              >
                <div className="p-3 rounded-lg hover:bg-background transition-colors duration-300">
                  <h4 className="font-medium">Location</h4>
                  <p className="text-muted-foreground">New York, USA</p>
                </div>
                <div className="p-3 rounded-lg hover:bg-background transition-colors duration-300">
                  <h4 className="font-medium">Experience</h4>
                  <p className="text-muted-foreground">5+ Years</p>
                </div>
                <div className="p-3 rounded-lg hover:bg-background transition-colors duration-300">
                  <h4 className="font-medium">Email</h4>
                  <p className="text-muted-foreground">example@example.com</p>
                </div>
                <div className="p-3 rounded-lg hover:bg-background transition-colors duration-300">
                  <h4 className="font-medium">Freelance</h4>
                  <p className="text-muted-foreground">Available</p>
                </div>
              </div>

              <Button
                variant="outline"
                className="group relative overflow-hidden"
                style={{
                  opacity: Math.min(1, Math.max(0, (scrollY - 650) / 200)),
                }}
              >
                <span className="absolute inset-0 w-full h-full bg-primary/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                <span className="relative">Download CV</span>
                <ArrowUpRight className="relative ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Timeline section */}
      <section id="experience" className="py-20 relative overflow-hidden">
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl translate-y-1/2"
          style={{
            transform: `translateY(${scrollY * 0.05}px) translateX(${-scrollY * 0.02}px)`,
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            My <span className="text-primary">Experience</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            A timeline of my professional journey and career growth
          </p>

          <Timeline items={timelineItems} />
        </div>
      </section>

      {/* Projects section with interactive cards */}
      <section id="projects" className="py-20 bg-muted/30 relative">
        {/* Background Glow */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl -translate-y-1/2"
          style={{
            transform: `translateY(${scrollY * 0.02}px) translateX(${scrollY * 0.005}px)`,
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Title */}
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 text-center"
            style={{
              transform: `translateY(${Math.max(0, (scrollY - 1200) * 0.05)}px)`,
              opacity: Math.min(1, Math.max(0, (scrollY - 1200) / 200)),
            }}
          >
            My <span className="text-primary">Projects</span>
          </h2>

          {/* Section Description */}
          <p
            className="text-muted-foreground text-center max-w-2xl mx-auto mb-12"
            style={{
              transform: `translateY(${Math.max(0, (scrollY - 1250) * 0.05)}px)`,
              opacity: Math.min(1, Math.max(0, (scrollY - 1250) / 200)),
            }}
          >
            Here are some of my recent projects. Each project represents a unique challenge and showcases different
            skills and technologies.
          </p>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div
                key={project.id}
                style={{
                  transform: `translateY(${Math.max(0, (scrollY - 1300 - index * 50) * 0.05)}px)`,
                  opacity: Math.min(1, Math.max(0, (scrollY - 1300 - index * 50) / 200)),
                  transition: `transform 0.4s ease-out, opacity 0.4s ease-out`,
                  transitionDelay: `${index * 75}ms`,
                }}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div
            className="text-center mt-12"
            style={{
              transform: `translateY(${Math.max(0, (scrollY - 1500) * 0.05)}px)`,
              opacity: Math.min(1, Math.max(0, (scrollY - 1500) / 200)),
            }}
          >
            <Button variant="outline" className="group relative overflow-hidden">
              <span className="absolute inset-0 w-full h-full bg-primary/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
              <span className="relative">View All Projects</span>
              <ArrowUpRight className="relative ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Button>
          </div>
        </div>
      </section>



      {/* Contact section with interactive form */}
      <section id="contact" className="py-20 relative overflow-hidden">
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl translate-y-1/2"
          style={{
            transform: `translateY(${scrollY * 0.02}px) translateX(${-scrollY * 0.01}px)`,
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            Get In <span className="text-primary">Touch</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Have a project in mind or want to collaborate? Feel free to reach out!
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-300">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-muted-foreground">example@example.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-300">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-muted-foreground">+1 (123) 456-7890</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-300">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Location</h4>
                    <p className="text-muted-foreground">New York, USA</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-medium mb-4">Follow Me</h4>
                <div className="flex gap-4">
                  <Link
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted p-3 rounded-full text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 hover:bg-muted/80"
                  >
                    <Github className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted p-3 rounded-full text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 hover:bg-muted/80"
                  >
                    <Linkedin className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted p-3 rounded-full text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 hover:bg-muted/80"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </Link>
                  <Link
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted p-3 rounded-full text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 hover:bg-muted/80"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">© {new Date().getFullYear()} Portfolio. All rights reserved.</p>
        </div>
      </footer>

      {/* Scroll to top button */}
      <button
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 ${
          scrollY > 300 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="m18 15-6-6-6 6"></path>
        </svg>
      </button>
    </div>
  )
}

