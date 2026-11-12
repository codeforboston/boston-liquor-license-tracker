## Styles

Global style sheets belong in this directory. `index.css` defines the site's color palette (the only place hex colors are allowed) and global element styles.

Style sheets for individual components belong next to that component. Use [CSS modules](https://github.com/css-modules/css-modules) when possible.
Example:
```
src/
  components/
    layout/
      header.tsx
      header.module.css
```
