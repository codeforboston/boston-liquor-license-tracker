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
        messages={supportedLocales[locale].messages}
      >
        {props.children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}
