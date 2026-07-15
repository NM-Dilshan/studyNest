import type { ReactNode } from 'react'
import EmptyState from '@/components/ui/EmptyState'

interface VolunteerEmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
}

export default function VolunteerEmptyState({
  title,
  description,
  icon,
}: VolunteerEmptyStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={icon}
    />
  )
}
