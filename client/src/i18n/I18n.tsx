import { IntlProvider } from "react-intl";
import {
  defaultLocale,
  getBestMatchLocale,
  supportedLocales,
} from "./i18n-config";
import { useState } from "react";
import { LocaleContext } from "./locale-context";

export default function I18n(props: React.PropsWithChildren) {
  const [locale, setLocale] =
    useState<keyof typeof supportedLocales>(getBestMatchLocale());

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <IntlProvider
        locale={locale}
        defaultLocale={defaultLocale}
        messages={getMessagesWithFallback(locale)}
      >
        {props.children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}

const getMessagesWithFallback = (locale: Locale) => {
  const baseMessages = supportedLocales[defaultLocale].messages;
  const localeMessages = supportedLocales[locale].messages;

  if (locale === defaultLocale) {
    return localeMessages;
  } else {
    // Merge locale messages on top of base messages
    return { ...baseMessages, ...localeMessages };
  }
}
