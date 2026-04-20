'use client'

interface ClientLocationToggleProps {
  userId: string
}

export default function ClientLocationToggle({ userId }: ClientLocationToggleProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
      <span className="text-sm text-gray-600">Location toggle for {userId}</span>
    </div>
  )
}
