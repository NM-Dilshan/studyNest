'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { removeHighlightParam, scrollToComplaint } from '@/utils/complaintHighlight'

export function useComplaintHighlight() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const id = Number(searchParams.get('highlight'))
    if (!id || Number.isNaN(id)) return

    const t = window.setTimeout(async () => {
      const ok = await scrollToComplaint(id, {
        behavior: 'smooth',
        block: 'center',
        delay: 150,
      })

      if (ok) {
        // Keep URL clean after the effect runs.
        window.setTimeout(() => removeHighlightParam(), 800)
      }
    }, 200)

    return () => window.clearTimeout(t)
  }, [searchParams])
}
