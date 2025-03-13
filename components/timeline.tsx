"use client"

import { useRef, useEffect, useState } from "react"
import styles from "./styles/timeline.module.css"

interface TimelineItem {
  year: string
  title: string
  company: string
  description: string
}

interface TimelineProps {
  items: TimelineItem[]
}

export default function Timeline({ items }: TimelineProps) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"))
          if (entry.isIntersecting && !isNaN(index)) {
            setVisibleItems((prev) => new Set(prev).add(index))
          }
        })
      },
      { threshold: 0.3 },
    )

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      itemRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [items])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] md:left-1/2 md:-ml-[1px] top-0 h-full w-[2px] bg-gradient-to-b from-primary/80 via-primary/50 to-primary/20"></div>

        {items.map((item, index) => (
          <div
            key={index}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            data-index={index}
            className={`relative cursor-pointer mb-12 md:mb-16 transition-opacity duration-700 ease-out hover:opacity-100 hover:translate-y-0 ${styles.card} ${
              index % 2 === 0
                ? "md:pr-12 md:text-right md:ml-0 md:mr-auto md:pl-0"
                : "md:pl-12 md:ml-auto md:mr-0 md:pr-0"
            } pl-12 ${visibleItems.has(index) ? "md:opacity-80 opacity-100 translate-y-0" : "md:opacity-40 opacity-100 translate-y-4"} md:max-w-full`}
          >
            {/* Year label */}
            <div
              className={`absolute left-[28px] md:left-1/2 -top-12 transition-all duration-300 z-10 hover:opacity-100 ${
                index % 2 === 0
                  ? "md:translate-x-[-120%] md:left-1/2 md:pr-4"
                  : "md:translate-x-[20%] md:left-1/2 md:pl-4"
              } ${visibleItems.has(index) ? "text-primary font-bold md:opacity-80 opacity-100" : "text-muted-foreground md:opacity-40 opacity-100"}`}
            >
              {item.year}
            </div>

            {/* Content card */}
            <div
              className={`bg-background p-6 rounded-lg border shadow-sm transition-all duration-500 ease-out hover:opacity-100 ${
                visibleItems.has(index)
                  ? "border-primary/30 shadow-md translate-y-0 backdrop-blur-0 md:opacity-80 opacity-100"
                  : "border-border translate-y-2 backdrop-blur-sm md:opacity-40 opacity-100"
              } hover:shadow-md hover:-translate-y-1 md:max-w-full`}
            >
              <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
              <h4 className="text-muted-foreground mb-3">{item.company}</h4>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
