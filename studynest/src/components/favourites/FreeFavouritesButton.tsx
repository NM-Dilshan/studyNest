'use client'

/**
 * FreeFavouritesButton — One-click to show free favourite halls
 */

interface FreeFavouritesButtonProps {
  onClick: () => void
  enabled: boolean
  count: number
}

export default function FreeFavouritesButton({ onClick, enabled, count }: FreeFavouritesButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        enabled
          ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
      }`}
    >
      <span>⭐</span>
      <span>Free Favourites ({count})</span>
    </button>
  )
}
