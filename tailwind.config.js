// tailwind.config.js
const plugin = require('flowbite/plugin');

module.exports = {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    'node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
  ],
  theme: {
    extend: {},
  },
  plugins: [plugin],
};
