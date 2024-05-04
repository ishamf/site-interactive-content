export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // The site we're putting these components in is using 10px in html,
    // if we don't replace it, it will be too small
    '@thedutchcoder/postcss-rem-to-px': { baseValue: 16 }
  },
};
