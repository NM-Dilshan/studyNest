'use client';

import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { VolunteerDashboardStats } from '@/components/volunteer/VolunteerDashboardStats';

interface VolunteerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  volunteerId: string;
}

export function VolunteerDashboardModal({
  isOpen,
  onClose,
  volunteerId,
}: VolunteerDashboardModalProps) {
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop/Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Modal Card */}
        <div className="w-full max-w-2xl my-8 animate-in fade-in zoom-in duration-300">
          {/* Close Button (positioned relative to modal) */}
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 text-gray-400 hover:text-gray-600 p-2 transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-6 h-6" />
          </button>

          {/* Stats Content */}
          <VolunteerDashboardStats
            volunteerId={volunteerId}
            onClose={onClose}
          />
        </div>
      </div>
    </>
  );
}
