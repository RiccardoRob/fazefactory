# Fazefactory® — pagina di revamping

Documento di lavoro: cosa è stato fatto finora, come funziona, cosa resta aperto e il piano per i prossimi passi.
Aggiornato al 6 ottobre 2026 (sfondo 3D, progetto Astro + Tailwind, deploy su Cloudflare Workers).

> **Per riprendere in una nuova chat:** allega questo file e `fazefactory-astro.zip` (oppure il link al repository GitHub `fazefactory`).
> La pagina è stata portata in Astro: d'ora in poi si lavora lì, non più sul file HTML unico.
> A che punto siamo: vedi la **sezione 10**. Il prossimo passo è il **saluto nella lingua del browser** (sezione 9, punto 2).

---

## 1. Il progetto in breve

**fazefactory.com** è in fase di revamping. Al posto del sito c'è una pagina unica, a schermo intero, costruita attorno alla stella del logo. La stella si può toccare, trascinare, lanciare e "scrivere": è il primo pezzo dell'identità del nuovo sito.

- **Titolo della pagina:** Digital Creative Service | Fazefactory®
- **Marchio:** Fazefactory® (tutto attaccato), FAZE®, Est. 2014, Italy
- **Peso:** `index.html` circa 21 KB, il sito completo circa 100 KB (le icone PNG sono la parte più pesante)

---

## 2. Design

### Griglia e impaginazione
- Griglia svizzera a 12 colonne (linee nascoste), margine laterale fluido da 16 a 32 px.
- Ritmo verticale su un modulo di **8 px**: distanze da 1 e 3 moduli tra etichetta, titolo, indicatori e copyright.
- Quattro angoli:
  - **in alto a sinistra** la stellina bianca, con la scritta FAZE® / EST 2014, ITALY che entra al passaggio del mouse;
  - **in alto a destra** il pulsante mail (aeroplanino);
  - **in basso a sinistra** etichetta, titolo multilingua, indicatori e copyright;
  - **in basso a destra** libero.

### Tipografia
- Un solo font: **Archivo**, peso 500 (Google Fonts).
- Testi piccoli: maiuscolo, 12 px, spaziatura 0,08 em; principali in bianco, secondari in bianco attenuato.
- Cinese, coreano e giapponese usano il font di sistema migliore disponibile (PingFang, Apple SD Gothic, Hiragino, Noto…).

### Colore
- Primari di Itten (RYB): rosso `#E3242B`, giallo `#F6C700`, blu `#1F4FBF`.
- La stella fa il giro rosso → giallo → blu in **φ⁵ ≈ 11,09 s**. Le interpolazioni sono in OKLCH, così i passaggi restano vivi (arancio, verde, viola).
- Lo sfondo è il gradiente della stella invertito, in tinte scure e sature delle **stesse tinte**. Logo e sfondo non sono mai complementari, quindi non c'è contrasto simultaneo: il contrasto è solo di luminosità.

### Sfondo 3D
- Scena in **prospettiva** (900 px) con due piani: il campo di colore in fondo (profondità −1500 px) e la **griglia svizzera** davanti (−450 px). La griglia ha le 12 colonne della pagina, in celle quadrate, con linee bianche al 7 %.
- La scena si sposta **in direzione opposta al mouse**. In orizzontale l'escursione arriva al 5 % della larghezza dello schermo, in verticale è φ volte più corta; anche la velocità orizzontale è φ volte quella verticale. Inclinazione fino a circa 3° in orizzontale e 2° in verticale, per dare profondità.
- Il piano lontano si muove meno di quello vicino (**parallasse**).
- **Attrito:** la scena segue il mouse su una molla con rapporto di smorzamento **Ω_Λ = 0,685**, la frazione di energia oscura dell'universo (Planck 2018). È appena sotto lo smorzamento critico: scivola, supera il punto di un soffio e si assesta.
- Quando il mouse esce dalla finestra, la scena torna al centro.
- Costo: per ogni fotogramma cambia solo la trasformazione della scena, che la scheda grafica gestisce senza ridisegnare.

### Tempi
I tempi seguono il **rapporto aureo φ = 1,618**: durate, dissolvenze e pause sono potenze di φ (0,236 · 0,382 · 0,618 · 1 · 1,618 · 2,618 · 4,236 s).

---

## 3. La stella: comportamenti

La stella è un **corpo rigido**: si sposta, ruota e si allontana, ma la geometria del logo non viene mai deformata. L'unica eccezione è il magnete, vedi sotto.

| Azione | Cosa succede |
|---|---|
| **Fluttua da sola** | Orbita ellittica leggera e "pulsar" (si avvicina e si allontana appena), in ordine casuale con pause. |
| **Clic** | Si allontana del **16,18 %** (φ/10) e torna morbidamente. |
| **Tenere premuto** | Si allontana sempre più in fretta seguendo la **legge di Hubble** (distanza ∝ e^(H·t)), fino a φ⁵ volte. Intanto la luce si sposta verso il rosso (*redshift*). Al rilascio torna. |
| **Trascinare** | Segue il puntatore come attaccata a un elastico morbido. |
| **Lanciare** | Parte con la velocità della mano e gira in base a dove l'hai presa. Rimbalza sui bordi di un'area pari al **79 %** dello schermo, conservando 1/φ della velocità. |
| **Inclinazione** | Mai oltre **23,44°**, l'inclinazione dell'asse terrestre. Poi torna dritta. |
| **Ritorno** | Torna sempre al centro con una molla morbida. |
| **Passaggio del mouse** | Magnete: i pezzi del logo si avvicinano leggermente al puntatore. |

**Attrito:** nel vuoto non c'è aria, quindi la stella è frenata dall'**attrito di Hubble** con h = 0,674 (Planck 2018), letto come 0,674 al secondo.

**Onde:** la stella emette continuamente il proprio contorno (tratto sottile con lo stesso gradiente). Da ferma è un'onda ogni 0,236 s; in movimento ne lascia una scia che ricalca il percorso. Al massimo 16 onde visibili insieme.

**Entanglement:** la stellina in alto ha la stessa classe `.star` e riceve gli stessi movimenti della grande, esclusa la posizione. Anche la favicon è collegata ai suoi colori.

### Scrivere con la tastiera
- Le lettere compaiono **accanto alla stella**, in bianco, con il font dei titoli e la spaziatura e il kerning originali del font.
- **Griglia a 5 guide equidistanti** sulla stella: le maiuscole occupano le 3 centrali, quindi la stella supera il testo di una guida sopra e una sotto.
- La **distanza tra la stella e il testo** è pari a una distanza tra due guide (¼ dell'altezza della stella), misurata sul disegno reale della prima lettera.
- Più si scrive, più stella e testo **rimpiccioliscono insieme** per restare nel 79 % dello schermo. La riga resta centrata e segue la stella.
- **Cursore:** barra bianca con angoli tondi, più alta delle maiuscole del 12 % e un po' staccata dall'ultima lettera. Lampeggia mentre scrivi, sparisce dopo φ² s di pausa e quando il testo è vuoto.
- **Tasti:** Backspace cancella, Esc azzera. Funzionano anche @ # € e gli altri caratteri con Alt Gr/Option; le scorciatoie Ctrl e Cmd non vengono intercettate.

---

## 4. Testi multilingua (`i18n.json`)

Ogni φ³ s (4,236 s) cambia lingua, in ordine casuale e con dissolvenza. L'etichetta in alto è "revamping" nella lingua più il grido per sollevare insieme ("oh issa"); il titolo gioca su **riprendere forma / rimettersi in forma**.

| Lingua | Etichetta | Titolo |
|---|---|---|
| en | Revamping · Heave-ho! | Back in / shape. |
| it | Rinnovamento · Oh issa! | Torniamo / in forma. |
| es | Renovación · ¡Arriba! | Volvemos / en forma. |
| fr | Refonte · Allez, hop ! | De retour / en forme. |
| de | Relaunch · Hau ruck! | Wieder / in Form. |
| nl | Vernieuwing · Hup! | Weer in / vorm. |
| fi | Uudistus · Hiio hoi! | Takaisin / kuntoon. |
| ru | Обновление · Раз-два, взяли! | Снова / в форме. |
| zh | 焕新 · 加油！ | 重新 / 塑形。 |
| ko | 리뉴얼 · 영차! | 제 모습 / 되찾는 중. |
| ja | リニューアル · よいしょ！ | カタチ、 / 取り戻し中。 |

Struttura del file: `interval`, `fade`, `languages[]` con `lang`, `name`, `label`, `headline[2]`. Se il JSON non si carica, la pagina resta in inglese.

> Da far rileggere a madrelingua: cinese, coreano, giapponese, russo, finlandese.

---

## 5. Indicatori (in basso, sotto il titolo)

- **Due cerchi** da 32 px con i due colori principali della stella in quel momento.
- **Grafico a tre anelli concentrici** (32 px), tutti in senso orario dalle 12:
  - **esterno:** ciclo completo dei colori (si chiude ogni φ⁵ s);
  - **medio:** passaggio corrente tra due primari;
  - **interno:** movimento automatico in corso (arco tenue = durata, arco bianco = tempo trascorso).

---

## 6. Prestazioni e accessibilità

- Animazione calcolata sul **tempo reale**, quindi identica a 60, 120 o 144 Hz. Fisica a passi fissi di 1/120 s.
- Scritture nella pagina **solo quando un valore cambia**; i colori si aggiornano 30 volte al secondo.
- **Sfondo** su un canvas di 48×48 px allargato a tutto schermo: costa pochissimo.
- Favicon dal vivo aggiornata 4 volte al secondo.
- Misurato: circa l'11 % di un core in un browser di test senza GPU.
- `prefers-reduced-motion`: niente animazioni, onde o scie.
- Il rilascio del puntatore viene ascoltato su tutta la finestra (correzione per Safari e SVG).
- Tutti i caratteri non ASCII nel file sono codificati, quindi la pagina si legge bene anche con un server che dichiara la codifica sbagliata.

---

## 7. File del sito

```
fazefactory.com/
├── .htaccess                 HTTPS, no-www, URL senza index e senza .html, CSP, cache, compressione
├── index.html                la pagina (minificata)
├── i18n.json                 testi in 11 lingue
├── favicon.svg               la F con transizione di colore (animata in Firefox)
├── manifest.json             PWA: nome, colori, icone
├── serviceWorker.js          rete-prima per la pagina, cache per file e font, offline
├── registerServiceWorker.js  registra il SW dopo il caricamento
├── robots.txt                tutto aperto
├── llms.txt                  descrizione per i modelli linguistici
└── icons/                    192, 512, maskable 512, apple-touch 180
```

Sorgente leggibile e commentato: `src_full.html`, da tenere fuori dal server.

### Sicurezza (`.htaccess`)
- **CSP:** solo il proprio dominio più Google Fonts. Lo script nella pagina è ammesso tramite il suo hash SHA-256; gli stili inline sono permessi perché servono all'animazione.
- `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY`, `COOP`.
- HSTS presente ma commentato: va attivato solo con HTTPS su tutti i sottodomini.
- Rewrite verificati su Apache: `/index.html` e `/index` → `/`; `/pagina.html` → `/pagina`; http → https; www → senza www.

### Da ricordare a ogni modifica
1. Dopo una modifica allo script, **rigenerare l'hash nella CSP**, altrimenti il browser blocca l'animazione.
2. Alzare la **versione della cache** in `serviceWorker.js` (`ff-v1` → `ff-v2`).

---

## 8. Cose aperte

- [ ] **Email reale:** `info@fazefactory.com` è un segnaposto (pulsante mail e `llms.txt`).
- [ ] Revisione delle traduzioni da parte di madrelingua.
- [ ] Attivare HSTS quando HTTPS è pronto ovunque.
- [ ] Prova su dispositivi reali: iPhone (Safari), Android, Windows con Alt Gr.

---

## 9. Prossimi passi richiesti

1. **Form di contatto in stile Typeform**, con lo stesso sistema di scrittura accanto alla stella: un campo email, un campo messaggio su più righe, invio a passi, honeypot contro lo spam.
2. **Saluto nella lingua del browser**, scritto con l'effetto di digitazione; se la lingua non è tra le 11, inglese.
3. **Foto del testo scritto:** l'utente scatta un'immagine della stella con il suo testo e la scarica.
4. **Integrazione di `fullscreen.js`**, il modulo esistente per le sezioni.
5. **Contenuti dal CV:** estrarre le informazioni per un `llms.txt` completo e per le sezioni del sito, pensate per un buon posizionamento SEO.
6. **DeepL API** per le traduzioni.
7. **Motore AI** che presenti i contenuti in base all'interesse dell'utente.
8. **Tecnologia:** Astro + Tailwind CSS. ✅ Progetto creato (sezione 10).

### Hosting: Cloudflare Workers
- Hai già usato Cloudflare Pages, ma per un progetto Astro nuovo la scelta è **Cloudflare Workers con file statici**. L'adattatore ufficiale di Astro per Cloudflare non supporta più Pages e rimanda alla guida di migrazione verso Workers.
- **Perché Cloudflare e non Vercel:** lo conosci già, il piano gratuito è ampio, la rete è velocissima anche in Italia, e ha già ciò che serve:
  - **Turnstile:** anti-spam per il form, da usare insieme all'honeypot;
  - **Workers AI:** per il motore AI;
  - **variabili segrete:** per le chiavi di DeepL e del servizio mail.
- **Attenzione:** Cloudflare **non legge `.htaccess`**. Rewrite, redirect e intestazioni (CSP compresa) vanno spostati nei file `_redirects` e `_headers`, oppure nel middleware di Astro. Li prepariamo nel passaggio ad Astro.

### Raccomandazione: partire subito da Astro
- **Convertire dopo costa di più.** La pagina attuale è già un solo componente: portarla in Astro ora richiede poco; farlo dopo il form, le sezioni e le traduzioni vorrebbe dire rifare tutto.
- **Astro produce HTML statico.** Il risultato resta leggero come adesso. Service worker e CSP restano; il `.htaccess` è sostituito da `_headers`, `_redirects` e dalle impostazioni di Cloudflare (sezione 10).
- **Le funzioni nuove hanno bisogno di un server.** Invio mail, DeepL e AI richiedono chiavi segrete che non possono stare nel browser. Astro ha le *API routes* per questo: una sola base di codice invece di HTML più script separati.
- **Contenuti e lingue.** Le *content collections* gestiscono bene CV, sezioni e versioni tradotte, e l'i18n di Astro crea URL come `/it/…` e `/en/…`, utili per la SEO.
- **Tailwind si impara meglio così,** applicandolo ai componenti nuovi mentre la stella resta com'è.

### Note tecniche da decidere
- **Parola chiave di ricerca:** Google non passa più ai siti la parola cercata dall'utente (da anni appare come "not provided"). Per personalizzare i contenuti si possono usare: pagine dedicate per gruppi di parole chiave, parametri UTM nelle campagne, una ricerca interna al sito con l'AI, e i dati di Google Search Console per scegliere quali pagine creare.
- **Invio mail:** un servizio come Resend, Postmark o Formspree, oppure SMTP via endpoint.
- **Privacy:** form e AI trattano dati personali, quindi servono informativa privacy e consenso, in linea con il GDPR.

---

## 10. Astro + Cloudflare Workers: stato attuale

### Il progetto (`fazefactory-astro.zip`)
Testato con Node 22, Astro 7.3, `@astrojs/cloudflare` 14.3, Tailwind 4.3, Wrangler 4. Compilato e provato nel runtime di Cloudflare: la pagina funziona come la versione HTML, la CSP non blocca niente, il service worker si registra e la 404 risponde correttamente.

```
src/
  pages/index.astro        home (Base + Star)
  pages/404.astro          pagina non trovata, esempio di Tailwind
  layouts/Base.astro       <head> comune: meta, canonical, font, PWA, favicon
  components/Star.astro    markup della stella (identico alla versione HTML)
  scripts/star.js          motore: fisica, colori, onde, typing, sfondo 3D, favicon viva
  styles/star.css          stile della pagina
  styles/global.css        Tailwind (senza Preflight) + token del brand in @theme
public/                    i18n.json, favicon.svg, icons/, manifest.json, serviceWorker.js
                           (VERSION ff-astro-1), registerServiceWorker.js, robots.txt,
                           llms.txt, _headers, _redirects
astro.config.mjs           site, adapter cloudflare, trailingSlash 'never', build.format 'file'
wrangler.jsonc             nome "fazefactory", html_handling drop-trailing-slash, 404-page
README.md                  istruzioni passo passo
```

- **Pagine statiche per default.** Una route che deve girare sul server (form, DeepL, AI) dichiara `export const prerender = false`. I segreti si leggono con `import { env } from 'cloudflare:workers'`.
- **CSP in `public/_headers`:** `script-src 'self'` senza hash, perché lo script ora è un file esterno in `/_astro/`.
- **Tailwind:** Preflight è spento per non alterare la pagina attuale. I token del brand sono `bg-ground`, `bg-wine`, `text-ink`, `text-mute`, `font-archivo`, `p-u` (8px), `ryb-red` e `ryb-yellow`. `src/scripts` è escluso dalla scansione delle classi.
- **Al primo deploy** Wrangler crea da solo il KV `SESSION` e il binding `IMAGES` dell'adattatore: è normale.

### Comandi
```bash
npm install
npm run dev        # http://localhost:4321
npm run preview    # build di produzione in locale, con _headers e _redirects
npm run deploy     # build + wrangler deploy (serve: npx wrangler login)
```

### Dove siamo arrivati (6 ottobre 2026)
- [x] Progetto Astro + Tailwind + adattatore Cloudflare creato e verificato.
- [x] Repository GitHub `fazefactory` creato.
- [x] Cloudflare collegato a GitHub. L'errore "Cloudflare Pages was unable to be installed" si è risolto disinstallando e reinstallando l'app Cloudflare su GitHub.
- [ ] **Push dei file su GitHub: da completare.** `git push` da solo non faceva nulla. Serve la sequenza completa, dentro la cartella `fazefactory`:
  ```bash
  git init
  git add .
  git commit -m "Astro + Tailwind + Cloudflare Workers"
  git branch -M main
  git remote add origin https://github.com/TUO-UTENTE/fazefactory.git
  git push -u origin main
  ```
  Per controllare cosa manca: `git status` e `git remote -v`. Se il terminale resta fermo, sta aspettando le credenziali: usa `gh auth login` (GitHub CLI) oppure GitHub Desktop.
- [ ] **Prima build su Cloudflare.** Le impostazioni del Worker sono:
  - Project name: `fazefactory`
  - Build command: `npm run build`
  - Deploy command: `npx wrangler deploy`

  Il sito appare su `https://fazefactory.<account>.workers.dev`: lo trovi in Workers & Pages › fazefactory › Domains & Routes, oppure con il pulsante Visit. Se la build fallisce, guarda il log in Deployments/Builds.
- [ ] **Prima del deploy, togliere il blocco `routes` da `wrangler.jsonc`.** Il dominio non è ancora collegato e il deploy fallirebbe.

### Quando colleghi il dominio
1. Dal pannello Cloudflare scegli "Add a domain" e aggiungi `fazefactory.com`. Poi cambia i nameserver dal registrar attuale.
2. Rimetti in `wrangler.jsonc` il blocco:
   ```jsonc
   "routes": [{ "pattern": "fazefactory.com", "custom_domain": true }]
   ```
3. Attiva SSL/TLS › Edge Certificates › **Always Use HTTPS**.
4. Attiva Rules › Redirect Rules › template **Redirect from WWW to root**.
5. Più avanti, attiva HSTS in `public/_headers`.

### Da `.htaccess` a Cloudflare
| Prima (Apache)             | Ora                                         |
|----------------------------|---------------------------------------------|
| CSP e header di sicurezza  | `public/_headers`                           |
| cache                      | `public/_headers`                           |
| senza `.html`, senza index | `html_handling` in `wrangler.jsonc` + `_redirects` |
| http → https               | Always Use HTTPS                            |
| www → apex                 | Redirect Rule                               |
| compressione               | automatica                                  |

### Da ricordare
- Le modifiche alla stella si fanno in `src/scripts/star.js`, `src/styles/star.css` e `src/components/Star.astro`. `src_full.html` e `build.py` restano come archivio della versione HTML.
- Quando cambi file in `public/`, alza `VERSION` in `serviceWorker.js`.
- Ogni `git push` su `main` rifà il deploy in automatico.

