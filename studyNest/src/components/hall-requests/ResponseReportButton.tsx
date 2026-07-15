'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import AppButton from '@/components/ui/AppButton'
import { generateHallRequestPdf, type HallRequestReportData } from '@/lib/hall-requests/report'

interface ResponseReportButtonProps {
  request: HallRequestReportData
  responseId?: string
  label?: string
  loadingLabel?: string
  ariaLabel?: string
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  className?: string
}

export default function ResponseReportButton({
  request,
  responseId,
  label = 'Generate PDF',
  loadingLabel = 'Generating PDF...',
  ariaLabel,
  variant = 'secondary',
  size = 'sm',
  fullWidth = false,
  className = '',
}: ResponseReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true)
      setError('')
      await generateHallRequestPdf(request, responseId ? { responseId } : undefined)
    } catch (generationError) {
      console.error('Failed to generate hall request PDF report:', generationError)
      setError('Unable to generate the PDF report right now.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : 'items-end'}`}>
      <AppButton
        onClick={handleGenerateReport}
        disabled={isGenerating}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        className={className}
        aria-label={ariaLabel || `Generate PDF report for ${request.lecture_halls.hall_name}`}
      >
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        {isGenerating ? loadingLabel : label}
      </AppButton>

      {error ? (
        <p className={`max-w-52 text-xs text-rose-500 ${fullWidth ? 'text-left' : 'text-right'}`}>{error}</p>
      ) : null}
    </div>
  )
}
