import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Failure Injection AI',
  description: 'Internal chaos engineering platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "bg-background text-foreground flex h-screen overflow-hidden")}>
        <Sidebar />
        <main className="flex-1 overflow-auto bg-background p-8">
          {children}
        </main>
      </body>
    </html>
  )
}
