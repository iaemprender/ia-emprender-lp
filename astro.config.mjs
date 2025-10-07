// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// 1. IMPORTAR el Adaptador de Netlify
import netlify from '@astrojs/netlify'; 

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  
  // 2. CONFIGURAR el modo Server (SSR) y el Adaptador
  output: 'server', // Le dice a Astro que compile para un servidor (Server-Side Rendering)
  adapter: netlify(), // Le dice a Astro que use el adaptador de Netlify para ese servidor

  integrations: [mdx(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});