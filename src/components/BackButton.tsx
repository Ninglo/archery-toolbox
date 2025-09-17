import { useRouter } from 'next/navigation'

interface BackButtonProps {
  onClick?: () => void
}

export default function BackButton({ onClick }: BackButtonProps) {
  const router = useRouter()
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.back()
    }
  }
  
  return (
    <button
      onClick={handleClick}
      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
    >
      <svg
        className="w-6 h-6 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>
  )
}