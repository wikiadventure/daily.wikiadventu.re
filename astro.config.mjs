// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import Icons from 'unplugin-icons/vite';
import tailwindcss from '@tailwindcss/vite'; // only used for shadcn components

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  // i18n: {
  //   locales: ["en", "fr", "de", "es"],
  //   defaultLocale: "en",
  //   routing: {
  //     redirectToDefaultLocale: true,
  //     prefixDefaultLocale: true
  //   }
  // },

  integrations: [react()],

  vite: {
    plugins:[
      Icons({ compiler: 'jsx', jsx: 'react' }),
      tailwindcss(),
    ],
    css: {
      transformer: "lightningcss",
      lightningcss: {
        targets: browserslistToTargets(browserslist('>= 0.25%'))
      }
    },
  },

  adapter: netlify(),
});