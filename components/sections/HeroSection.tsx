"use client"

import { forwardRef, useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface HeroSectionProps {
  scrollToSection: (sectionId: string) => void
}

const HeroSection = forwardRef<HTMLElement, HeroSectionProps>(({ scrollToSection }, ref) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const olhoRef = useRef<HTMLSpanElement>(null) // Referência para o olho
  const [fontSize, setFontSize] = useState(60) // Tamanho da fonte inicial
  const [theme, setTheme] = useState('light') // Estado para controlar o tema

  const handleMouseMove = (e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)

    // Função para calcular o tamanho da fonte
    const updateFontSize = () => {
      const h1 = document.querySelector('h1');
      if (h1) {
        const computedFontSize = parseFloat(window.getComputedStyle(h1).fontSize);
        setFontSize(computedFontSize);
      }
    }

    // Detectar o tema atual
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setTheme(currentTheme);

    // Atualizar o tamanho da fonte ao redimensionar a tela
    window.addEventListener('resize', updateFontSize)
    updateFontSize()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', updateFontSize)
    }
  }, [])

  // Raio do olho e da pupila, agora dependente do tamanho da fonte
  const eyeRadius = fontSize * 0.4; // O olho será 30% do tamanho da fonte
  const pupilRadius = fontSize * 0.12; // A pupila será 10% do tamanho da fonte

  // Deslocamento do centro do olho para a esquerda e para cima
  const offsetX = 7; // Deslocamento horizontal
  const offsetY = 7; // Deslocamento vertical

  // Função para limitar o movimento da pupila dentro do olho
  const calculatePupilPosition = (mouseX: number, mouseY: number) => {
    // Pegando o centro do olho com base na posição da div 'olho'
    if (!olhoRef.current) return { x: 0, y: 0 }
    
    const eyeRect = olhoRef.current.getBoundingClientRect();
    const eyeCenterX = eyeRect.left + eyeRect.width / 2; // Centro do olho
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;

    // Calcula a distância do mouse ao centro do olho
    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;

    // Limita a distância máxima que a pupila pode se mover (não ultrapassando os limites do olho)
    const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), eyeRadius - pupilRadius);

    // Normaliza a posição da pupila para que ela não ultrapasse o limite do olho
    const moveX = deltaX * (distance / Math.sqrt(deltaX * deltaX + deltaY * deltaY));
    const moveY = deltaY * (distance / Math.sqrt(deltaX * deltaX + deltaY * deltaY));

    // Ajusta o limite da pupila considerando o deslocamento do centro
    return { x: moveX - offsetX, y: moveY - offsetY };
  }

  // Calculando a posição da pupila com base no mouse
  const pupilPosition = calculatePupilPosition(mousePosition.x, mousePosition.y);

  return (
    <section id="home" ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container text-center z-10 relative"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          VIT
          <span className="olho" ref={olhoRef}>
            <div
              className={`pupila ${theme === 'dark' ? 'bg-white' : 'bg-black'}`} // Altera a cor da pupila com base no tema
              style={{
                transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)` // Aplica o cálculo da posição da pupila
              }}
            ></div>
          </span>
          R 
          
          LUCAS
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-muted-foreground">
          Software Developer
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection("projects")
              }}
            >
              View My Work
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection("contact")
              }}
            >
              Contact Me
            </a>
          </Button>
        </div>
      </motion.div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
      <style jsx>{`
        .olho {
          position: relative;
          width: ${eyeRadius * 2}px; /* O olho vai ter o diâmetro 2x o raio */
          height: ${eyeRadius * 2}px;
          border-radius: 50%;
          display: inline-block;
          vertical-align: middle;
          margin-bottom: 10px;
          border: 5px solid currentColor; /* Borda do olho será da mesma cor da fonte */
        }
        .pupila {
          position: absolute;
          width: ${pupilRadius * 2}px; /* A pupila vai ter o diâmetro 2x o raio */
          height: ${pupilRadius * 2}px;
          background-color: currentColor; /* A pupila será da mesma cor da fonte */
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: transform 0.9s ease-out;
        }
      `}</style>
    </section>
  )
})

HeroSection.displayName = "HeroSection"

export default HeroSection
