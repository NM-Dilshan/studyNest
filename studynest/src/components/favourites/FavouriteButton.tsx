'use client'

/**
 * FavouriteButton — Star toggle to favourite/unfavourite a hall
 */

import { useState } from 'react'
import { addFavourite, removeFavourite } from '@/services/favouriteService'

interface FavouriteButtonProps {
  hallId: string
  isFavourite: boolean
  onToggle: (hallId: string) => void
}

export default function FavouriteButton({ hallId, isFavourite, onToggle }: FavouriteButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)

    try {
      // Optimistic update — change UI immediately
      onToggle(hallId)

      // Update in Supabase
      if (isFavourite) {
        await removeFavourite('user-id', hallId) // TODO: Get actual user ID from auth context
      } else {
        await addFavourite('user-id', hallId)
      }
    } catch (error) {
      console.error('Failed to toggle favourite:', error)
      // Rollback on error
      onToggle(hallId)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-2xl transition-transform hover:scale-110 ${
        isFavourite ? '⭐' : '☆'
      }`}
      aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
    >
      {isFavourite ? '⭐' : '☆'}
    </button>
  )
}
