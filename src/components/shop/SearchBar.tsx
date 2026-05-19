'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useRef, useTransition } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
}

export default function SearchBar({ placeholder = 'Search products…' }: SearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentQuery = searchParams.get('q') ?? ''

  const updateQuery = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('q', value)
      } else {
        params.delete('q')
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [router, pathname, searchParams]
  )

  // useRef keeps the timer ID stable across renders, fixing stale closure issue.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debouncedUpdate = useCallback(
    (value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => updateQuery(value), 350)
    },
    [updateQuery]
  )

  function handleClear() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        defaultValue={currentQuery}
        onChange={(e) => debouncedUpdate(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
      />
      {currentQuery && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {isPending && (
        <span
          className="absolute right-8 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin"
          aria-hidden="true"
        />
      )}
    </div>
  )
}
