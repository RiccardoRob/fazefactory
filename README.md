# fazefactory.com — Astro + Tailwind + Cloudflare Workers

Testato con: Node 22 · Astro 7.3 · @astrojs/cloudflare 14.3 · Tailwind 4.3 · Wrangler 4.

## 1. Ambiente (una volta sola)

1. **Node.js 22 LTS** (o superiore): https://nodejs.org — verifica con `node -v`.
2. **VS Code** + le estensioni consigliate (Astro, Tailwind CSS IntelliSense): VS Code le propone quando apri la cartella.
3. **Git** (consigliato) e un repository su GitHub.
4. **Account Cloudflare** con il dominio `fazefactory.com` aggiunto come zona (DNS gestiti da Cloudflare).

## 2. Avvio in locale

```bash
cd fazefactory
npm install
npm run dev          # http://localhost:4321 — gira già nel runtime di Cloudflare (workerd)
```

`npm run preview` costruisce e serve la versione di produzione, con `_headers` (CSP) e `_redirects` attivi.

## 3. Primo deploy su Cloudflare Workers

```bash
npx wrangler login   # apre il browser, autorizzi l'account Cloudflare
npm run deploy       # = astro build && wrangler deploy
```

- Se il dominio **non** è ancora su Cloudflare, togli il blocco `"routes"` da `wrangler.jsonc`: il sito esce su `fazefactory.<tuo-account>.workers.dev`.
- Con il dominio su Cloudflare, il blocco `routes` con `custom_domain: true` collega il Worker a `fazefactory.com` e crea da solo DNS e certificato.
- Al primo deploy Wrangler crea in automatico il KV `SESSION` usato dalle sessioni di Astro: è normale.

## 4. Impostazioni nel pannello Cloudflare (sostituiscono `.htaccess`)

| Prima (.htaccess)          | Ora su Cloudflare                                                   |
|----------------------------|---------------------------------------------------------------------|
| CSP e header di sicurezza  | `public/_headers`                                                   |
| cache dei file             | `public/_headers`                                                   |
| senza `.html`, senza index | `html_handling` in `wrangler.jsonc` (automatico)                    |
| http → https               | SSL/TLS › Edge Certificates › **Always Use HTTPS** = on             |
| www → senza www            | Rules › Redirect Rules › template **Redirect from WWW to root**     |
| gzip / brotli              | automatici                                                          |

La CSP ora è `script-src 'self'` senza hash: Astro mette lo script in un file esterno (`/_astro/…js`), quindi non serve più ricalcolare l'hash a ogni modifica.

## 5. Deploy automatico da GitHub (consigliato)

Cloudflare › Workers & Pages › Worker `fazefactory` › Settings › Builds › **Connect** al repository.
Build command: `npm run build` · Deploy command: `npx wrangler deploy`. Ogni push su `main` va online; ogni branch ha un'anteprima.

## 6. Struttura

```
src/
  pages/index.astro        la home (usa Base + Star)
  pages/404.astro          pagina non trovata (esempio di Tailwind)
  layouts/Base.astro       <head> comune: meta, font, PWA, favicon
  components/Star.astro    markup della stella (identico alla versione HTML)
  scripts/star.js          motore: fisica, colori, onde, typing, sfondo 3D
  styles/star.css          stile della pagina attuale
  styles/global.css        Tailwind + token del brand (@theme)
public/                    copiati così come sono: i18n.json, favicon, icone,
                           manifest, service worker, robots, llms.txt, _headers, _redirects
wrangler.jsonc             configurazione del Worker
```

## 7. Tailwind

- I token del brand sono in `src/styles/global.css` (`@theme`): `bg-ground`, `text-ink`, `text-mute`, `font-archivo`, `p-u` (8px)…
- Preflight (il reset di Tailwind) è spento per non toccare la pagina attuale. Per le sezioni nuove si potrà accendere (vedi il commento nel file).
- Esempio d'uso: `src/pages/404.astro`.

## 8. Segreti (DeepL, invio email, Turnstile)

- Locale: copia `.dev.vars.example` in `.dev.vars` e compila.
- Produzione: `npx wrangler secret put DEEPL_API_KEY` (un comando per chiave).
- Nel codice lato server: `import { env } from 'cloudflare:workers'`.

Le pagine sono statiche per default. Una route che deve girare sul server (per esempio `src/pages/api/contact.ts` per il form) dichiara `export const prerender = false`.

## 9. Service worker

Quando cambi file in `public/`, alza `VERSION` in `public/serviceWorker.js` (ora `ff-astro-1`), così i visitatori ricevono la cache nuova.
