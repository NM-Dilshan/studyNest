interface Option {
  label: string
  value: string
  colorClass: string
}

interface VolunteerStatusSelectorProps {
  label: string
  value: string
  options: Option[]
  required?: boolean
  error?: string
  onChange: (value: string) => void
}

export default function VolunteerStatusSelector({
  label,
  value,
  options,
  required = false,
  error,
  onChange,
}: VolunteerStatusSelectorProps) {
  const groupLabel = `${label}${required ? ' required' : ''}`

  return (
    <div role="radiogroup" aria-label={groupLabel}>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {label} {required ? <span className="text-rose-300">*</span> : null}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? option.colorClass
                  : 'border-[var(--surface-border)] bg-[var(--surface-inset)] text-[var(--text-soft)] hover:bg-[var(--surface-card-muted)]'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)]`}
              role="radio"
              aria-checked={active}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      {error ? <p className="mt-1 text-xs text-rose-300">{error}</p> : null}
    </div>
  )
}
