'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

type QuickLink = {
  label: string
  href: string
}

const QUICK_LINKS: QuickLink[] = [
  { label: 'Free Lecture Halls', href: '/student/halls' },
  { label: 'Study Areas', href: '/study-areas' },
  { label: 'My Complaints', href: '/Naveen/my-complaints' },
]

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const filteredLinks = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return QUICK_LINKS

    return QUICK_LINKS.filter((link) => link.label.toLowerCase().includes(normalized))
  }, [query])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalized = query.trim()
    if (!normalized) {
      router.push('/student/halls')
      return
    }

    router.push(`/student/halls?q=${encodeURIComponent(normalized)}`)
  }

  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSearch} className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
          aria-hidden="true"
        />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search halls, study areas, or features"
          className="w-full rounded-2xl border border-slate-200 bg-white/90 py-3 pl-11 pr-4 text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          aria-label="Search study spaces"
        />
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {filteredLinks.map((link) => (
          <button
            key={link.href}
            type="button"
            onClick={() => router.push(link.href)}
            className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  )
}
