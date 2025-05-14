import { createContext, Dispatch, SetStateAction } from "react";
import { supportedLocales } from "./i18n-config";

export const LocaleContext = createContext<{
  locale: keyof typeof supportedLocales;
  setLocale: Dispatch<SetStateAction<keyof typeof supportedLocales>>;
}>({
  locale: "en-US", // Default locale
  setLocale: () => {},
});
