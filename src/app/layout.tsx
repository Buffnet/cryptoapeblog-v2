import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CryptoApe Blog',
  description: 'Blog powered by Payload CMS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}