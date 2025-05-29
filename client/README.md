# React Client

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
