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
  return supportedLocales[locale]? {...supportedLocales[defaultLocale].messages, ...supportedLocales[locale].messages} : supportedLocales[defaultLocale].messages;
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
