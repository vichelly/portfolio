"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

export default function InteractiveBackground() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const particlesRef = useRef(
    Array.from({ length: 40 }).map(() => ({
      size: Math.random() * 10 + 5,
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      opacity: 0.3 + Math.random() * 0.4,
      driftX: (Math.random() - 0.5) * 2, // Increased drift for more constant movement
      driftY: (Math.random() - 0.5) * 2, // Increased drift for more constant movement
    }))
  )

  useEffect(() => {
    function updateDimensions() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const particles = particlesRef.current.map((particle, i) => {
    return (
      <motion.div
        key={i}
        className="absolute rounded-full bg-primary/10 dark:bg-primary/20"
        style={{
          width: particle.size,
          height: particle.size,
          left: `${particle.initialX}%`,
          top: `${particle.initialY}%`,
          opacity: particle.opacity,
        }}
        animate={{
          x: [0, particle.driftX * 100],
          y: [0, particle.driftY * 100],
        }}
        transition={{
          duration: 5 + Math.random() * 5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
    )
  })

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 z-0">
      {/* Particles */}
      {particles}
    </div>
  )
}
