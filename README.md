# Portfolio · Dario Croce

Sito statico in HTML, CSS e JavaScript vanilla, pubblicato con **GitHub Pages**.
Non serve installare nulla: a ogni modifica salvata su GitHub, le pagine vengono generate e pubblicate in automatico.

- I testi stanno in `content/` (Markdown e JSON): è l'unica cartella da toccare per aggiornare il portfolio.
- La pubblicazione automatica (`.github/workflows/pubblica-sito.yml`) genera il sito e lo pubblica in un paio di minuti.
- L'elenco dei contenuti ancora da completare compare nel riepilogo di ogni pubblicazione, nella scheda **Actions** del repository.

Architettura dell'informazione, direzione visiva e design system sono descritti in [`DESIGN.md`](DESIGN.md).

## Struttura

```
portfolio-dario-croce/
├── .github/workflows/
│   └── pubblica-sito.yml         ← pubblicazione automatica su GitHub Pages (non va modificato)
├── content/                      ← fonte dei contenuti
│   ├── site.json                 ← nome, posizionamento, introduzione, contatti, siteUrl
│   ├── categories.json           ← macro-aree: ordine, titolo, descrizione
│   ├── tools.json                ← Tools & Technologies: gruppi, strumenti, alias
│   └── progetti/
│       ├── _modello.md           ← modello per un nuovo progetto (ignorato dalla build)
│       └── <slug>.md             ← un file per progetto → pagina /progetti/<slug>/
├── src/
│   ├── styles/                   ← design system (00-tokens … 05-media) → docs/assets/css/main.css
│   ├── scripts/main.js           ← menu mobile e filtri → docs/assets/js/main.js
│   ├── static/                   ← immagini e documenti → docs/assets/
│   └── build/                    ← generatore: build.mjs, templates.mjs, markdown.mjs, serve.mjs
├── docs/                         ← SITO GENERATO (da GitHub o da npm run build): non va caricato né modificato
│   ├── index.html
│   ├── progetti/index.html · progetti/<slug>/index.html
│   ├── strumenti/index.html
│   ├── 404.html · sitemap.xml · robots.txt · .nojekyll
│   └── assets/css · assets/js · assets/img · assets/docs
├── CONTENUTI-DA-COMPLETARE.md    ← checklist generata a ogni build (non va caricata)
├── DESIGN.md
└── package.json
```

## Anteprima sul tuo computer (facoltativa)

Serve solo se vuoi vedere il sito prima di pubblicarlo. Richiede **Node.js 18 o successivo**; non serve `npm install`.

| Comando | Cosa fa |
| --- | --- |
| `npm run build` | Rigenera `docs/` e `CONTENUTI-DA-COMPLETARE.md` |
| `npm run serve` | Anteprima locale su `http://localhost:8080/` |
| `npm start` | Build e anteprima in un solo comando |

Se `npm` non è disponibile: `node src/build/build.mjs` e `node src/build/serve.mjs`.

## Pubblicazione su GitHub Pages

Prima configurazione (una sola volta):

1. Crea un repository **pubblico** con l'opzione **Add README** attiva. Con il nome `nomeutente.github.io` il sito sarà su `https://nomeutente.github.io`; con un altro nome (es. `portfolio`) sarà su `https://nomeutente.github.io/portfolio/`.
2. **Prima di caricare i file**: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Nella pagina principale del repository: Add file → Upload files. Trascina **il contenuto** della cartella (non la cartella stessa), poi Commit changes.
4. Nella scheda **Actions** attendi la spunta verde: il sito è online. L'indirizzo è in Settings → Pages (Visit site).

L'indirizzo del sito (canonical, Open Graph, sitemap, pagina 404) viene ricavato in automatico dalle impostazioni di GitHub Pages, anche con un dominio personalizzato: `siteUrl` in `content/site.json` serve solo per l'anteprima locale.
La cartella `docs/` e il file `CONTENUTI-DA-COMPLETARE.md` non vanno caricati: li genera la pubblicazione automatica.

### Aggiornamenti

- **Modifica diretta su GitHub:** apri il file in `content/` → icona a matita (Edit) → modifica → Commit changes.
- **Sostituzione di un file:** entra nella cartella giusta (es. `content/progetti/`) → Add file → Upload files → trascina il file aggiornato → Commit changes.

Ogni modifica salvata avvia una nuova pubblicazione (scheda Actions). Se compare una X rossa, la pubblicazione si è fermata e il sito online resta quello precedente: apri l'esecuzione per leggere l'errore.

## Aggiornare un progetto con contenuti verificati

1. Apri `content/progetti/<slug>.md`.
2. Sostituisci ogni riga `TODO: …` con il testo verificato.
3. Salva la modifica su GitHub (Commit changes): il sito si aggiorna da solo. Il riepilogo della pubblicazione, nella scheda Actions, mostra cosa resta da completare.

### Campi del front matter

| Campo | Uso |
| --- | --- |
| `title` | Titolo del progetto (obbligatorio) |
| `titleLang` | `en` se il titolo è in inglese (lettura corretta per gli screen reader) |
| `category` | `siti-app` · `automation-data-ai` · `digital-marketing` · `data-governance-measurement` |
| `order` | Posizione all'interno dell'area |
| `featured` | `true` = progetto in evidenza in home |
| `published` | `false` = il progetto non viene pubblicato |
| `role` | Ruolo, **solo se esplicitamente confermato**; vuoto o `TODO` = segnaposto |
| `scope` | Ambito / tipologia di intervento (es. `Website Restyling · WordPress`) |
| `summary` | Descrizione sintetica: card, intestazione del case study e meta description |
| `technologies` | Strumenti usati, separati da virgole; i nomi presenti in `tools.json` diventano link |
| `competencies` | Competenze, separate da virgole (facoltativo) |
| `related` | Slug di progetti collegati (facoltativo) |
| `omit` | Sezioni da non mostrare, es. `risultato` (facoltativo) |

Le righe del front matter che iniziano con `#` sono commenti.

### Sezioni del case study

Sempre nello stesso ordine, introdotte da `## `: **Contesto, Problema, Ruolo, Approccio, Soluzione, Risultato, Stack**.
Una sezione assente o che contiene `TODO: …` viene mostrata come segnaposto con il testo guida.
La sezione Stack si genera da `technologies` e `competencies`; testo aggiuntivo facoltativo sotto `## Stack`.

### Sintassi disponibile

| Scrivi | Ottieni |
| --- | --- |
| `TODO: testo guida` | Segnaposto visibile (pagina in noindex) |
| `BOZZA: testo` | Testo proposto da validare (pagina in noindex) |
| `### Titolo` | Riquadro di attività; due o più riquadri si affiancano |
| `> **Nota.** testo` | Riquadro di nota |
| `**grassetto**`, `*corsivo*` | Enfasi |
| `[Portale](project:portale-ristorazione-scolastica)` | Link a un altro progetto |
| `[Python](tool:python)` | Link a uno strumento nella pagina Tools & Technologies |
| `![Testo alternativo](assets/img/progetti/file.png "Didascalia")` | Immagine (testo alternativo obbligatorio; file in `src/static/img/progetti/`) |

Diagramma di processo (lista ordinata in HTML/CSS, nessuna immagine):

````
```flow
caption: Workflow
- Google Sheets
- Apps Script | nota facoltativa
[ Gruppo facoltativo
- Passaggio dentro il gruppo
]
- Dashboard
```
````

Struttura a componenti su una base comune:

````
```structure
caption: Struttura della piattaforma
base: CMS proprietario
- Componente pubblica
- Area riservata | differenti profilazioni utente
```
````

## Contatti e CV

In `content/site.json` → `contacts`: `null` mostra un segnaposto, `false` nasconde la voce.
Per il CV copia il PDF in `src/static/docs/` e imposta `"cv": "assets/docs/NomeFile.pdf"`.
Il sito è pubblico: usa un indirizzo email personale, non aziendale.

## Indicizzazione

- Ogni pagina che contiene un segnaposto o una bozza viene pubblicata con `noindex` e resta fuori da `sitemap.xml`: puoi pubblicare il sito in anteprima senza che i testi provvisori finiscano nei motori di ricerca. Quando una pagina non ha più segnaposto diventa indicizzabile in automatico.
- Per rendere indicizzabili prima alcune pagine, nascondi i progetti non ancora pronti con `published: false`.
- Canonical, Open Graph e dati strutturati (WebSite, ProfilePage/Person, CreativeWork, BreadcrumbList) sono generati a ogni build.
- `robots.txt` viene letto dai crawler solo alla radice del dominio: è efficace con un dominio personalizzato o con un repository `nomeutente.github.io`. Con un sito di progetto (`nomeutente.github.io/portfolio`) invia la sitemap da Google Search Console.

## Accessibilità

Riferimento WCAG 2.2 AA: HTML semantico, un solo H1 per pagina, gerarchia dei titoli senza salti, link "Vai al contenuto", focus sempre visibile, contrasti verificati, target di almeno 24 px, navigazione completa da tastiera (Esc chiude il menu), annuncio dei risultati dei filtri per gli screen reader, `prefers-reduced-motion` rispettato, contenuti leggibili anche senza JavaScript, lingua delle parti in inglese marcata con `lang="en"`.
