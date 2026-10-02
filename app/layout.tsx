import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import localFont from "next/font/local"

// The same files the 3D text already fetches, so the page's own text and the
// panels share one cached copy and nothing waits on a third-party host.
const inter = localFont({
  src: [
    { path: "../public/fonts/inter-latin-400.woff", weight: "400", style: "normal" },
    { path: "../public/fonts/inter-latin-600.woff", weight: "600", style: "normal" },
  ],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
})

export const metadata: Metadata = {
  title: "Vitor Lucas Fujita Felício — 3D Portfolio",
  description:
    "Walk through an interactive low-poly 3D world to explore Vitor Lucas Fujita Felício's experience, skills, certifications, and projects.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
