import { IntlProvider } from "react-intl";
import {
  defaultLocale,
  getBestMatchLocale,
  supportedLocales,
} from "./i18n-config";
import { useState } from "react";
import { LocaleContext } from "./locale-context";

type Locale = keyof typeof supportedLocales;

const getMessagesWithFallback = (locale: Locale) => {
  const baseMessages = supportedLocales[defaultLocale].messages;
  const localeMessages = supportedLocales[locale].messages;

  if (locale === defaultLocale) {
    return localeMessages;
  } else {
    return { ...baseMessages, ...localeMessages };
  }
}

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
