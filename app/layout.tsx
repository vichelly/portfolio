import type React from "react"
import "@/app/globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Interactive Portfolio</title>
        <meta name="description" content="Interactive portfolio website" />
      </head>
      <body>

          {children}

      </body>
    </html>
  )
}

