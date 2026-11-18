# React Client
### Contents
- [Tech Stack](#tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Testing](#testing)
- [Tailwind Utility Classes](#using-tailwind-utility-classes)
- [CSS Modules](#using-css-modules)

## Tech Stack

- Framework: React 19 with TypeScript
- Build Tool: [Vite](https://vitejs.dev/)
- Routing: [TanStack Router](https://tanstack.com/router)
- Styling: [Tailwind CSS](https://tailwindcss.com/)
- Maps: [MapLibre GL](https://maplibre.org/)
- Internationalization: [react-intl](https://formatjs.io/docs/react-intl/)
- UI Components: Custom components in `src/components/ui/`, using [React Aria Components](https://react-spectrum.adobe.com/react-aria/) for accessible widgets and [class-variance-authority](https://cva.style/) for variants
- Testing: [Vitest](https://vitest.dev/)

## Project Directory Structure

```
client/
├── public/                    # Static public assets
└── src/
    ├── assets/                # Static assets (images, icons, logos)
    ├── components/            # React components
    │   ├── layout/            # Header, footer, and layout components
    │   ├── pages/             # Page-specific components
    │   │   ├── home/          # Homepage sections (hero, about, case studies)
    │   │   ├── database/      # Database interface components
    │   │   ├── maps/          # Map visualization components
    │   │   ├── not-found/     # 404 error page
    │   │   └── resources/     # Resource page components
    │   └── ui/                # Reusable UI components
    ├── data/                  # Static data files and schemas
    ├── i18n/                  # Internationalization setup and utilities
    ├── lib/                   # Small shared helpers (e.g. cn() for class names)
    ├── routes/                # TanStack Router route definitions
    ├── services/              # API interfaces and business logic
    └── styles/                # Global styles and CSS utilities
```

For further details, read the README.md in a specific directory.

## Component Structure

Components are kebab-case `.tsx` files in the folder for their page (or `ui/` if shared). Most styling uses [Tailwind utility classes](#using-tailwind-utility-classes). When a component needs custom CSS, put it in a [CSS module](#using-css-modules) next to the component:

```
components/pages/resources/
├── agency-card.tsx          # React component
└── agency-card.module.css   # Optional component-scoped styles
```

## Testing

Testing is done using [Vitest](https://vitest.dev/). Tests sit next to the code they test, with a `.test.ts` or `.test.tsx` suffix. Run them with `npm test`, and check a production build with `npm run build`.

## Using Tailwind utility classes

Tailwind creates utility classes for each of the colors defined in the @theme block of [our color palette](./src/styles/index.css). We defined `--color-button-default-dark` in the @theme block, so we can now have `bg-button-default-dark` available to use as a class name across the codebase. `bg-` is a common prefix, but see [Tailwind's documentation](https://tailwindcss.com/docs/colors#using-custom-colors) for other ways to use custom colors.

Hex colors are only allowed in `src/styles/index.css`; Stylelint flags them anywhere else. Add new colors there as variables and use the generated classes or `var(--color-...)`.


## Using CSS Modules

We are using [Tailwind utility classes](#using-tailwind-utility-classes) to style components, but it will sometimes be necessary to define your own custom css styles. We use CSS modules for this to scope these styles to their respective components.

Import the css file into the component and use the camelcased names.

```js
import footerStyles from "./footer.module.css";

const Footer = () => {
  return (
    <footer className={footerStyles.footerTest}>
      This is the footer content.
    </footer>
  );
};
```

```css
.footer-test {
  padding: 10px;
  text-decoration: none;
}
.footer-test:hover {
  text-decoration: underline;
}
```

For debugging purposes, you'll be able to identify the classes in the DOM tree with names like `footer-module__footer-test___FSx98`. This is generated from the module name, class name, and unique hash that scopes the style to the component. This is only available in development, production will only show the hash, so please do not target these class names to overwrite styles or for testing.
