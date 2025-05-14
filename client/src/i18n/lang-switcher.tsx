import { useContext } from "react";
import { Locale, supportedLocales } from "./i18n-config";
import { LocaleContext } from "./locale-context";
import { setStoredLocale } from "./stored-locale";

export default function LangSwitcher() {
  // Pull in the top-level locale and its setter.
  const { locale, setLocale } = useContext(LocaleContext);

  return (
    <select
      value={locale}
      onChange={(e) => {
        setLocale(e.target.value as Locale);
        setStoredLocale(e.target.value as Locale);
      }}
      className="pe-2"
    >
      {Object.keys(supportedLocales).map((loc: string) => (
        <option value={loc} key={loc}>
          {supportedLocales[loc as Locale].name}
        </option>
      ))}
    </select>
  );
}
