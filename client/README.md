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
- UI Components: Custom component library with [shadcn/ui](https://ui.shadcn.com/)
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
    ├── routes/                # TanStack Router route definitions
    ├── services/              # API interfaces and business logic
    └── styles/                # Global styles and CSS utilities
```

For further details, read the README.md in a specific directory.

## Component Structure

Each component follows this structure:

```
ComponentName/
├── component-name.tsx    # React component
└── component-name.css    # Component-specific styles
```

## Testing

Testing is done using [Vitest](https://vitest.dev/). Tests are located in the same directory as the component they test, with a `.test.tsx` suffix.

## Using Tailwind utility classes

Tailwind creates utility classes for each of the colors defined in the @theme block of [our color palette](./src/styles/index.css). We defined `--color-button-default-dark` in the @theme block, so we can now have `bg-button-default-dark` available to use as a class name across the codebase. `bg-` is a common suffix, but see [Tailwind's documentation](https://v3.tailwindcss.com/docs/customizing-colors#using-custom-colors) for other ways to use custom colors.


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

## Buttons

Use the shared `Button` (`src/components/ui/button.tsx`) for anything that looks like a button, whether it renders a `<button>` or a link. Styles come from `buttonVariants` in `button-variants.ts`:

| Variant | Look | Used for |
|---|---|---|
| `primary` (default) | Dark | Home navigation, Resources links |
| `accent` | Yellow | Calls to action, e.g. the case study |
| `secondary` | Light gray | Filter dropdowns, table legend |

Sizes are `sm`, `md` (default), `lg` and `xl`. Keep layout (width, flex sizing, margins) at the call site via `className`.

```tsx
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";

// A real button
<Button onClick={save}>Save</Button>

// A link styled as a button: asChild puts the styles on the child element
<Button asChild size="xl" className="w-full">
  <Link to="/maps">Map</Link>
</Button>

// A component that must render its own element, like a react-aria Button
<AriaButton className={buttonVariants({ variant: "secondary", size: "sm" })} />
```
