// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://fazefactory.com',
  // Pages are static by default (prerendered to HTML, served from Cloudflare's edge as assets).
  // A route that needs the server (the contact form endpoint, later) opts in with
  // `export const prerender = false`, and runs in the Worker.
  adapter: cloudflare(),
  // URLs without extension and without trailing slash: /about, not /about.html or /about/
  trailingSlash: 'never',
  build: { format: 'file' },
  // assetsInlineLimit 0: never inline small scripts into the page; the CSP only allows script files from 'self'
  vite: { plugins: [tailwindcss()], build: { assetsInlineLimit: 0 } }
});
