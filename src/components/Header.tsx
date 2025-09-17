import { ReactNode } from 'react'

interface HeaderProps {
  title: string
  leftButton?: ReactNode
  rightButton?: ReactNode
}

export default function Header({ title, leftButton, rightButton }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="w-10 flex justify-start">
        {leftButton}
      </div>
      <h1 className="text-lg font-medium text-gray-900 flex-1 text-center">
        {title}
      </h1>
      <div className="w-10 flex justify-end">
        {rightButton}
      </div>
    </header>
  )
}