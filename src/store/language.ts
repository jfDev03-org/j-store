import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'pt' | 'en'

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'pt',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'jstore-language' }
  )
)
