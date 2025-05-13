import ES_ES_MESSAGES from "../locales/es-ES.json";
import EN_US_MESSAGES from "../locales/en-US.json";

// Default to American English when app loads, or when translation files are missing
export const defaultLocale = "es-ES";

export type Locale = keyof typeof supportedLocales;

// Supported locales
export const supportedLocales = {
  "en-US": {
    name: "English",
    messages: EN_US_MESSAGES,
  },

  "es-ES": {
    name: "Español",
    messages: ES_ES_MESSAGES,
  },
};
