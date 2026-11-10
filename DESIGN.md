# Architettura e design system

## 1. Obiettivo

Un portfolio navigabile, non un CV online: il visitatore deve capire rapidamente che tipo di professionista è Dario Croce, su quali progetti ha lavorato, quale contributo ha dato personalmente e quali strumenti usa concretamente. Le prove del lavoro svolto (casi di studio) vengono prima delle dichiarazioni.

## 2. Information architecture

```
Home  /
├── Progetti  /progetti/                         elenco per area, filtrabile
│   ├── 01 Siti & App                            /progetti/#siti-app
│   │   ├── Portale Ristorazione Scolastica      /progetti/portale-ristorazione-scolastica/
│   │   ├── Matilde Ristorazione                 /progetti/matilde-ristorazione/
│   │   ├── Dettagli Catering                    /progetti/dettagli-catering/
│   │   └── People                               /progetti/people/
│   ├── 02 Automation, Data & AI                 /progetti/#automation-data-ai
│   │   ├── BOOM                                 /progetti/boom/
│   │   ├── AI Classification of Customer Feedback
│   │   ├── CAA Menu Accessibility
│   │   └── Automated Data Pipeline & SharePoint Dashboards
│   ├── 03 Digital Marketing                     /progetti/#digital-marketing
│   │   ├── Google Business Profile & Local SEO
│   │   └── SEO / Lead Generation
│   └── 04 Data Governance & Measurement         /progetti/#data-governance-measurement
│       ├── Migrazione Web Analytics verso Matomo
│       └── Standardizzazione del processo di consenso e tracking
├── Tools & Technologies  /strumenti/            strumento → progetti in cui è stato usato
└── Contatti  #contatti                          nel footer di ogni pagina (email, LinkedIn, CV)
```

**Navigazione principale:** Progetti · Tools & Technologies · Contatti.
**Home:** nome, posizionamento, introduzione, accesso a CV e LinkedIn, indice delle aree (con conteggio e link filtrato), progetti in evidenza, anteprima degli strumenti.
**Pagina progetto:** breadcrumb (Home / Progetti / Area / Progetto), metadati (area, ruolo, ambito), indice "In questa pagina", sette sezioni, progetti collegati, navigazione precedente/successivo.
**Strumenti e progetti sono separati:** uno strumento non è mai un progetto; la pagina Tools & Technologies mostra per ogni strumento i casi di studio in cui è stato applicato.

## 3. Template del case study

| # | Sezione | Contenuto |
| --- | --- | --- |
| 01 | Contesto | Qual era il contesto iniziale |
| 02 | Problema | Problema o esigenza da affrontare; eventuale "Obiettivo" |
| 03 | Ruolo | Ruolo concreto e attività svolte personalmente (in evidenza) |
| 04 | Approccio | Come è stato affrontato il problema |
| 05 | Soluzione | Soluzione, processo, POC o implementazione; diagramma se c'è un flusso |
| 06 | Risultato | Solo risultati documentati, nessuna metrica inventata |
| 07 | Stack | Tecnologie e strumenti effettivamente usati, competenze |

Il brief numerava due sezioni come 03 (Role e Approach): la numerazione è stata resa progressiva da 01 a 07.

**Regole di accuratezza applicate ai contenuti:** testi riportati fedelmente dalla fonte; nessun ruolo attribuito se non indicato (in quel caso la sezione Ruolo resta un segnaposto); nessuna metrica; verbi originali mantenuti ("progettazione", "sviluppo di un Proof of Concept", "analisi e prototipazione", "coordinamento"); i diagrammi visualizzano solo passaggi presenti nei contenuti forniti.

## 4. Direzione visiva

Editoriale e documentale, come un buon report tecnico: tipografia come elemento principale, molto spazio bianco, filetti sottili, un solo colore d'accento.

- **Carta calda e inchiostro:** fondo `#f7f6f2`, testo quasi nero, card bianche con bordo sottile, nessuna ombra.
- **Un accento verde scuro** (`#1e5a4b`) per link, focus e numerazioni. Niente gradienti, glow o glassmorphism.
- **Etichette in monospace maiuscolo** per occhielli, metadati e numerazione delle sezioni ("01 /"): richiamano la documentazione tecnica senza effetti decorativi.
- **Nessuna fotografia stock, nessuna skill bar, nessun contatore, nessun muro di badge:** tecnologie e competenze sono liste di testo con separatore "·".
- **Diagrammi in HTML/CSS:** liste ordinate con connettori disegnati in CSS, leggibili anche da screen reader.
- **Animazioni minime:** solo transizioni di colore e piccoli spostamenti delle frecce, azzerati con `prefers-reduced-motion`.
- **Segnaposto evidenti ma separati dal design:** riquadri tratteggiati color ambra ("Da completare") e bordo ambra per i testi proposti ("Bozza da validare"). Spariscono quando il contenuto è definitivo.

## 5. Design token (`src/styles/00-tokens.css`)

| Token | Valore | Uso | Contrasto |
| --- | --- | --- | --- |
| `--color-bg` | `#f7f6f2` | Fondo pagina | — |
| `--color-surface` | `#ffffff` | Card, riquadri | — |
| `--color-surface-muted` | `#efede7` | Footer, box secondari | — |
| `--color-ink` | `#161616` | Testo | 16.7:1 sul fondo |
| `--color-ink-muted` | `#57544d` | Testo secondario | 7.0:1 sul fondo · 6.5:1 su surface-muted |
| `--color-accent` | `#1e5a4b` | Link, focus, numeri | 7.4:1 sul fondo · bianco su accento 8.0:1 |
| `--color-line` | `#dcd8cf` | Filetti decorativi | — |
| `--color-line-strong` | `#8b867b` | Bordi di componenti | 3.4:1 sul fondo |
| `--color-ph-*` | ambra | Segnaposto e bozze | testo 9.3:1, bordo 4.1:1 |

**Tipografia:** font di sistema (`system-ui`: Segoe UI su Windows, SF su macOS/iOS, Roboto su Android), nessun caricamento esterno; monospace di sistema per le etichette. Scala fluida con `clamp()`: testo 17–18 px, H1 home 44–80 px, H1 interni 32–48 px, H2 24–32 px. Interlinea 1.65 per il testo, larghezza massima 68 caratteri.
**Spaziature:** scala 4/8 (`--space-1` … `--space-9`), sezioni separate da `--section-gap` (56–104 px).
**Layout:** contenitore 72 rem, margini fluidi; breakpoint 40 rem, 48 rem, 64 rem; mobile-first.

Per usare un font ospitato nel repository: copia i file `.woff2` in `src/static/fonts/`, dichiara `@font-face` in `01-base.css` con `url("../fonts/…")` e aggiorna `--font-sans`.

## 6. Componenti

| Componente | Classe | Note |
| --- | --- | --- |
| Header e menu | `.site-header`, `.site-nav`, `.nav-toggle` | Menu compatto sotto 48 rem solo con JavaScript; Esc chiude |
| Indice aree | `.area-index` | Home: aree con conteggio progetti e link filtrato |
| Card progetto | `.card` | Area, titolo (unico link, card cliccabile), descrizione, ruolo, ambito, stack, "Esplora progetto" |
| Filtri | `.filters`, `.filter-btn` | Pulsanti `aria-pressed`, risultato annunciato, URL con `#area` |
| Breadcrumb | `.breadcrumb` | `aria-current="page"` sull'ultima voce |
| Metadati | `.meta-list` | Area, ruolo, ambito del case study |
| Indice di pagina | `.toc` | Laterale e fisso su desktop, griglia su mobile |
| Sezione | `.case-section` | Numero in monospace + titolo |
| Riquadri attività | `.groups`, `.group` | Generati dai titoli `###` |
| Diagramma di flusso | `.diagram--flow`, `.flow` | Lista ordinata, gruppi tratteggiati, connettori CSS |
| Diagramma a struttura | `.diagram--structure` | Componenti affiancati su una base comune |
| Nota | `.callout` | Da `> testo` |
| Stack | `.stack`, `.inline-list` | Strumenti collegati alla pagina Tools & Technologies |
| Progetti collegati | `.related` | Da `related:` |
| Precedente/successivo | `.pager` | Ordine: area, poi `order` |
| Segnaposto | `.ph`, `.draft`, `.btn--placeholder` | Registrati dalla build: pagina in noindex |
