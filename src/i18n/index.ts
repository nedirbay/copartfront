import { createI18n } from 'vue-i18n'
import tkm from './locales/tkm'
import ru from './locales/ru'
import en from './locales/en'

export type SupportedLocale = 'tkm' | 'ru' | 'en'

const savedLocale = (localStorage.getItem('language') || 'tkm') as SupportedLocale
const validLocale: SupportedLocale = ['tkm', 'ru', 'en'].includes(savedLocale) ? savedLocale : 'tkm'

const i18n = createI18n({
  legacy: false,
  locale: validLocale,
  fallbackLocale: 'tkm',
  messages: {
    tkm,
    ru,
    en,
  },
})

export function setLanguage(lang: SupportedLocale) {
  i18n.global.locale.value = lang
  localStorage.setItem('language', lang)
  document.documentElement.lang = lang === 'tkm' ? 'tk' : lang
}

export default i18n
