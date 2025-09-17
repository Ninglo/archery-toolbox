import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: '射箭工具箱',
  description: '射箭环值记录工具',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}