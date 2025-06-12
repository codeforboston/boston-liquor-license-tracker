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
  const { missingInB } = getMismatchedKeys(en, nonEnglishLocales[lang]);
  if (missingInB.length > 0) {
    flag = true;
  }
  mismatchedKeys[lang] = missingInB;
}

test(`Validate English locale file against non-English locales`, () => {
  // If there are no mismatched keys, the test will pass silently
  if (flag) {
    throw new Error(
      `Missing internationalization keys in non en-US translated locales:\n\n${Object.entries(
        mismatchedKeys
      )
        .map(
          ([lang, keys]) =>
            `${lang}-${lang.toUpperCase()}.json: [${keys.join(", ")}]`
        )
        .join("\n")}\n`
    );
  }
  return true;
});
