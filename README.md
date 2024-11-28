# site-interactive-content

This is the interactive content of [ishamf.dev](https://ishamf.dev/), implemented using Svelte and published as custom elements.

## Development

```sh
pnpm install
```

Then go to any framework folder in `packages/`, and run:

```sh
pnpm dev
```

## Building and Usage

```sh
pnpm build
```

This will produce `entry-*.js` files, each of them will define one or more
custom elements that can be used in a page.
