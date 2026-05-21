'use client'
import { useEffect } from 'react'
import { useLanguageStore } from '@/store/language'

export function LanguageHtml() {
  const { language } = useLanguageStore()
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])
  return null
}
