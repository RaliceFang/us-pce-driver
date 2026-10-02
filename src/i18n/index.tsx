import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import { useMemo } from 'react'
import en from './locales/en.json'
import tw from './locales/zh-tw.json'
import cn from './locales/zh-cn.json'
export const locales = ['zh-tw', 'zh-cn', 'en'] as const
export type Locale = typeof locales[number]
export function TranslationProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const instance = useMemo(() => {
    const i = createInstance()
    void i.init({ lng: locale, lowerCaseLng: true, fallbackLng: 'zh-tw', initAsync: false, resources: { 'zh-tw': { translation: tw }, 'zh-cn': { translation: cn }, en: { translation: en } }, interpolation: { escapeValue: false } })
    return i
  }, [locale])
  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>
}
