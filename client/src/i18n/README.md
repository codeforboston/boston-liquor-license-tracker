# Internationalization

The Boston Liquor License Tracker supports multiple languages and locales. We aim to support as many of Boston's most frequently used languages as practical, starting with English and Spanish.

- Supported locales are listed as key-value pairs in the `supportedLocales` object.
  - The key is a code in the format `xx-YY`, where `xx` is the ISO 639-1 two letter code for the language such as `en` for English, and YY is the ISO 3166-1 alpha 2 code for country, such as `UK` for the United Kingdom. So `en-UK` would stand for English of the UK variety. YY may also be a ISO-639-1 code for generic locale, such as `en-EN` for generic English.
  - The value has two properties:
    - `name`, which is the display name of the locale (preferably in the given language, e.g. "Español" instead of "Spanish")
    - `messages`, which is the object containing all of the translatable messages for the locale. This is imported from a JSON file.
- For each locale, there should be a JSON file (named as xx-YY.json using the definitions of xx and YY above) containing a list of all the translatable messages for the locale.
- The default locale is American English (`en-US`). This PR also adds European Spanish (`es-ES`) as a supported locale.
- The current selected locale is saved to LocalStorage, so when the user returns to the app the language they see does not change.
- To display a translatable message, use a `<FormattedMessage />` element for text, `<FormattedNumber />` element for numbers, or the appropriate element in [this page](https://formatjs.github.io/docs/react-intl/components), with an `id` attribute pointing to the appropriate key in the translation JSON file. If you need to translate element attributes like `aria-label`, use the [imperative API](https://formatjs.github.io/docs/react-intl/api)
- For additional information, see [the documentation](https://formatjs.github.io/docs/react-intl) for `react-intl`.
