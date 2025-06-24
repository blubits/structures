import { createFileRoute } from '@tanstack/react-router'
import { FaCubes } from 'react-icons/fa'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-zinc-900 transition-colors">
      <div className="flex flex-col items-center">
        {/* Icon: FaCubes from react-icons */}
        <FaCubes className="w-32 h-32 mb-8 text-[#6366f1] dark:text-[#60a5fa]" />
        <p className="text-xl text-zinc-700 dark:text-zinc-300 text-center max-w-md">
          Click a data structure on the left to continue
        </p>
      </div>
    </div>
  )
}
