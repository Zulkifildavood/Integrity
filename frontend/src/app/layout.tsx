import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ritual Window',
  description: 'Discipline-as-a-Service Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  )
}
