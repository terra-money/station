import { initReactI18next } from "react-i18next"
import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { Dictionary } from "ramda"
import { debug } from "utils/env"

import es from "locales/es.json"
import fr from "locales/fr.json"
import it from "locales/it.json"
// import ko from "locales/ko.json"
import pl from "locales/pl.json"
import ru from "locales/ru.json"
import zh from "locales/zh.json"

const flatten = (obj: object, initial = {}): Dictionary<string> => {
  return Object.entries(obj).reduce((prev, [key, value]) => {
    if (!value) return prev
    const next =
      typeof value === "string" ? { [key]: value } : flatten(value, prev)
    return Object.assign({}, prev, next)
  }, initial)
}

export const Languages = {
  en: { value: "en", label: "English", translation: {} },
  es: { value: "es", label: "Español", translation: flatten(es) },
  fr: { value: "fr", label: "Français", translation: flatten(fr) },
  it: { value: "it", label: "Italiano", translation: flatten(it) },
  // ko: { value: "ko", label: "한국어", translation: flatten(ko) },
  pl: { value: "pl", label: "Polish", translation: flatten(pl) },
  ru: { value: "ru", label: "Русский", translation: flatten(ru) },
  zh: { value: "zh", label: "中文", translation: flatten(zh) },
}

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: Languages,
  debug: !!debug.translation,
})
