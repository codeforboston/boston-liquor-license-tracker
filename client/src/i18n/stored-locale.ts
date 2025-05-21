import { Locale } from "./i18n-config";

const K_LOCALE = "locale";

export function getStoredLocale() {
  return localStorage.getItem(K_LOCALE);
}

export function setStoredLocale(newLocale: Locale) {
  localStorage.setItem(K_LOCALE, newLocale);
}
