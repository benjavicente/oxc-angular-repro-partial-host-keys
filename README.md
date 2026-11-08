# `compilationMode: 'partial'` keeps template syntax in host binding keys

> 🤖 Made by agents

`@oxc-angular/vite@0.0.43`, Angular 22.2.5.

```sh
npm install
npm run repro
```

A directive with `host: { '(click)': 'onClick()', '[attr.data-active]': 'active' }`
is compiled in partial mode by `@oxc-angular/vite` and by `ngc`.

Expected (ngc): `ɵɵngDeclareDirective` uses bare names,
`listeners: { "click": … }` and `properties: { "attr.data-active": … }`.

Actual (oxc): the keys keep their template syntax,
`listeners: { "(click)": … }` and `properties: { "[attr.data-active]": … }`.

Linking that output with Angular's linker (`@angular/compiler-cli/linker/babel`,
which the Angular CLI uses for libraries) produces
`ɵɵlistener("(click)", …)` and `ɵɵdomProperty("[attr.data-active]", …)`, so the
listener never fires and the attribute is never set in consuming apps.
