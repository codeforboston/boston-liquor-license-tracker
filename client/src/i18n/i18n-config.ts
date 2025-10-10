import ES_ES_MESSAGES from "@/data/locales/es-ES.json";
import EN_US_MESSAGES from "@/data/locales/en-US.json";
import ZH_CN_MESSAGES from "@/data/locales/zh-CN.json";
import ZH_TW_MESSAGES from "@/data/locales/zh-TW.json";
import { match } from "@formatjs/intl-localematcher";
import { getStoredLocale } from "./stored-locale";

// Default to American English when app loads, or when translation files are missing
export const defaultLocale = "en-US";

export type Locale = keyof typeof supportedLocales;

// Locales contain null values for missing translations
// We filter them out to allow fallback to default locale
const getNonNullMessages = (messages: Record<string, string | null>) => {
  return Object.fromEntries(
    Object.entries(messages).filter(([_, value]) => value !== null)
  ) as Record<string, string>;
}

// Locales supported by the app
export const supportedLocales = {
  "en-US": {
    name: "English",
    messages: getNonNullMessages(EN_US_MESSAGES),
  },

  "es-ES": {
    name: "Español",
    messages: getNonNullMessages(ES_ES_MESSAGES),
  },

  "zh-CN": {
    name: "简体中文",
    messages: getNonNullMessages(ZH_CN_MESSAGES),
  },

  "zh-TW": {
    name: "繁體中文",
    messages: getNonNullMessages(ZH_TW_MESSAGES),
  }
};

// Locales supported by the browser
export function getBrowserLocales(): string[] {
  const browserLocales = [];

  // User
  if (navigator.languages) {
    for (const language of navigator.languages) {
      browserLocales.push(language);
    }
  }

  if (navigator.language) {
    browserLocales.push(navigator.language);
  }

  return browserLocales;
}

// Return the best match between the browser and the supported locales
export function getBestMatchLocale(): Locale {
  // If we have already stored a locale, use it
  const storedLocale = getStoredLocale();
  if (storedLocale) {
    return storedLocale as Locale;
  }

  const browserLocales = getBrowserLocales();
  const supported = Object.keys(supportedLocales);

  // Match the best locale
  const bestMatch = match(browserLocales, supported, defaultLocale);

  return bestMatch as Locale;
}
