# site-interactive-content

This is the interactive content of [ishamf.dev](https://ishamf.dev/), implemented using Svelte and published as custom elements.

## Development

```sh
pnpm install
pnpm dev
```

This will show the contents of `App.svelte`. To keep it simple, all the interactive components are added to this page.

## Building and Usage

```sh
pnpm build
```

This will produce `entry-*.js` files, based on the files in `src/lib/entries`.
You can then include these files in any webpage and use the custom elements that are included in each entry point.
The tag name of the custom elements can be found at the top of their `.svelte` files.
