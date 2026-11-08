# `compilationMode: 'partial'` keeps template syntax in host binding keys

> 🤖 Made by agents

`@oxc-angular/vite@0.0.43`, Angular 22.2.5, Node 22+.

`src/index.ts` is a directive with
`host: { '(click)': 'onClick()', '[attr.data-active]': 'active' }`. It is
compiled in partial mode by `@oxc-angular/vite` and by `ngc`, then both partial
outputs are linked with Angular's own linker, as the Angular CLI does for
partially compiled libraries.

## Quick run

```sh
npm install
npm run repro
```

```
Partial declaration (input of the linker):
  ngc:               { listeners: { "click": "onClick()" }, properties: { "attr.data-active": "active" } }
  @oxc-angular/vite: { listeners: { "(click)": "onClick()" }, properties: { "[attr.data-active]": "active" } }

Linked host bindings:
  ngc:
    i0.ɵɵlistener("click", function MyLink_click_HostBindingHandler() {
    i0.ɵɵattribute("data-active", ctx.active);
  @oxc-angular/vite:
    i0.ɵɵlistener("(click)", function MyLink__click__HostBindingHandler() {
    i0.ɵɵdomProperty("[attr.data-active]", ctx.active);
```

## Step by step

1. Install the pinned dependencies.

   ```sh
   npm install
   ```

2. Build the library with `@oxc-angular/vite` in partial mode (`vite.config.ts`)
   and look at the `host` of the emitted `ɵɵngDeclareDirective`.

   ```sh
   npm run build:oxc
   grep -n 'listeners:\|properties:' dist/index.mjs
   ```

   ```
   26:				listeners: { "(click)": "onClick()" },
   27:				properties: { "[attr.data-active]": "active" }
   ```

   The keys still contain the template syntax: `"(click)"` and
   `"[attr.data-active]"`.

3. Build the same file with Angular's `ngc` in partial mode
   (`tsconfig.ngc.json`) for the reference output.

   ```sh
   npm run build:ngc
   grep -o 'host: { listeners: [^}]*}, properties: [^}]*} }' ngc-out/index.js
   ```

   ```
   host: { listeners: { "click": "onClick()" }, properties: { "attr.data-active": "active" } }
   ```

   `ngc` writes bare names, `"click"` and `"attr.data-active"`. This is the
   format the partial declaration linker expects.

4. Link both outputs with `@angular/compiler-cli/linker/babel` (`link.mjs`
   writes `linked/oxc.mjs` and `linked/ngc.mjs`) and compare the generated
   host binding instructions.

   ```sh
   npm run link
   grep -n 'ɵɵlistener\|ɵɵattribute\|ɵɵdomProperty' linked/*.mjs
   ```

   ```
   linked/oxc.mjs:21:          i0.ɵɵlistener("(click)", function MyLink__click__HostBindingHandler() {
   linked/oxc.mjs:26:          i0.ɵɵdomProperty("[attr.data-active]", ctx.active);
   linked/ngc.mjs:20:          i0.ɵɵlistener("click", function MyLink_click_HostBindingHandler() {
   linked/ngc.mjs:25:          i0.ɵɵattribute("data-active", ctx.active);
   ```

## Why it fails

The linker treats each key as the bare event or property name, as `ngc` emits
them. With the oxc output:

- `ɵɵlistener("(click)", …)` listens for a DOM event literally named
  `(click)`, which is never dispatched, so `onClick()` never runs.
- `ɵɵdomProperty("[attr.data-active]", …)` assigns a property literally named
  `[attr.data-active]` on the element instead of setting the `data-active`
  attribute (`ɵɵattribute("data-active", …)` with `ngc`).

So in an Angular CLI app that consumes the published library, host listeners
never fire and host bindings are never applied.
