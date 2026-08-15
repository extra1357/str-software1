'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GA_ID) return
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : '')
    window.gtag?.('config', process.env.NEXT_PUBLIC_GA_ID, { page_path: url })
  }, [pathname, searchParams])

  return null
}