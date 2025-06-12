import { test } from "vitest";
import getMismatchedKeys from "@/i18n/vitest-translations-validation/getMismatchedKeys";

// English serves as the source of truth
import en from "@/data/locales/en-US.json";

// Import all non-English locales
import nonEnglishLocales from "@/i18n/vitest-translations-validation/nonEnglishLocales";

const mismatchedKeys: { [key: string]: string[] } = {};

// This flag is used to determine if there are any mismatched keys
let flag = false;

for (const lang of Object.keys(nonEnglishLocales) as Array<
  keyof typeof nonEnglishLocales
>) {
  const { missingInA } = getMismatchedKeys(en, nonEnglishLocales[lang]);
  if (missingInA.length > 0) {
    flag = true;
  }
  mismatchedKeys[lang] = missingInA;
}

test(`Validate English locale file against non-English locales`, () => {
  // If there are no mismatched keys, the test will pass silently
  if (flag) {
    throw new Error(
      `Missing internationalization keys in en-US locale:\n\n${Object.entries(
        mismatchedKeys
      )
        .map(
          ([lang, keys]) =>
            `${lang}-${lang.toUpperCase()}.json keys: [${keys.join(", ")}]`
        )
        .join("\n")}\n\n^ Please add all missing keys to  ->  en-US.json  <-\n`
    );
  }
  return true;
});
