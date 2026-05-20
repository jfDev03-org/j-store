'use client'
import { useLanguageStore } from '@/store/language'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore()
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
      className="text-xs font-semibold px-2 h-8 text-muted-foreground hover:text-foreground"
      aria-label={language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
    >
      {language === 'pt' ? 'EN' : 'PT'}
    </Button>
  )
}
