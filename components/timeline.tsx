"use client"

import { useRef, useEffect, useState } from "react"

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
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"))
          if (entry.isIntersecting && !isNaN(index)) {
            setActiveIndex(index)
          }
        })
      },
      { threshold: 0.5 },
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
            className={`relative mb-12 md:mb-16 ${
              index % 2 === 0
                ? "md:pr-12 md:text-right md:ml-0 md:mr-auto md:pl-0"
                : "md:pl-12 md:ml-auto md:mr-0 md:pr-0"
            } pl-12 transition-all duration-500 ${activeIndex === index ? "opacity-100" : "opacity-50"}`}
            style={{
              width: "100%",
              maxWidth: "50%",
            }}
            onMouseEnter={() => setActiveIndex(index)}
          >
            {/* Year bubble */}
            <div
              className={`absolute left-0 md:left-1/2 top-0 w-[15px] h-[15px] rounded-full border-4 transition-all duration-300 ${
                activeIndex === index ? "bg-primary border-background scale-125" : "bg-background border-primary/50"
              }`}
              style={{
                transform: `translateX(${index % 2 === 0 ? "calc(-50% + 7px)" : "calc(-50% + 7px)"}) ${activeIndex === index ? "scale(1.25)" : "scale(1)"}`,
              }}
            ></div>

            {/* Year label */}
            <div
              className={`absolute left-[28px] md:left-1/2 top-[-10px] transition-all duration-300 ${
                index % 2 === 0
                  ? "md:translate-x-[-120%] md:left-1/2 md:pr-4"
                  : "md:translate-x-[20%] md:left-1/2 md:pl-4"
              } ${activeIndex === index ? "text-primary font-bold" : "text-muted-foreground"}`}
            >
              {item.year}
            </div>

            {/* Content card */}
            <div
              className={`bg-background/50 backdrop-blur-sm p-6 rounded-lg border shadow-sm transition-all duration-500 ${
                activeIndex === index
                  ? "border-primary/30 shadow-md transform translate-y-0"
                  : "border-border transform translate-y-2"
              } hover:shadow-md hover:-translate-y-1`}
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

