import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface FavouriteButtonProps {
  isFavourite: boolean;
  onClick: () => Promise<void> | void;
}

export function FavouriteButton({ isFavourite: initialFavourite, onClick }: FavouriteButtonProps) {
  const [isFav, setIsFav] = useState(initialFavourite);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsFav(initialFavourite);
  }, [initialFavourite]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const newVal = !isFav;
    setIsFav(newVal);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    try {
      await onClick();
    } catch (err) {
      setIsFav(!newVal);
      console.error('Failed to toggle favourite', err);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none group relative z-10"
      aria-label={isFav ? "Remove to favourites" : "Add to favourites"}
    >
      <Star 
        className={`w-5 h-5 transition-all duration-300 ${
          isFav 
            ? 'fill-amber-400 text-amber-400' 
            : 'text-neutral-400 group-hover:text-amber-400/70'
        } ${isAnimating ? 'scale-125' : 'scale-100'}`} 
      />
    </button>
  );
}
