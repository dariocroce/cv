---
# MODELLO PER UN NUOVO PROGETTO (i file che iniziano con _ vengono ignorati dalla build)
# 1. Copia questo file in content/progetti/<slug>.md: il nome del file diventa l'indirizzo /progetti/<slug>/
# 2. Compila i campi e le sezioni con contenuti verificati, poi esegui: npm run build
#
# Valori ammessi per category: siti-app | automation-data-ai | digital-marketing | data-governance-measurement
# order = posizione nell'area · featured: true = in evidenza in home · published: false = non pubblicato
# role: solo se esplicitamente confermato · technologies e competencies: elenchi separati da virgole
# related: slug di progetti collegati · omit: sezioni da non mostrare (es. risultato)
# Facoltativo, se il titolo è in inglese:  titleLang: en
title: Titolo del progetto
category: siti-app
order: 10
featured: false
published: true
role: TODO
scope: TODO
summary: TODO: Descrizione sintetica (1–2 frasi), usata nella card e come meta description.
technologies: TODO
competencies:
related:
---

<!--
Sezioni ammesse, in quest'ordine: Contesto, Problema, Ruolo, Approccio, Soluzione, Risultato, Stack.
Una sezione assente o che contiene "TODO: …" viene mostrata come segnaposto.
"BOZZA: …" mostra un testo da validare. I titoli ### creano gruppi di attività (riquadri affiancati).

Diagramma di processo (lista ordinata, renderizzata in HTML/CSS):

```flow
caption: Workflow
- Google Sheets
- Apps Script | nota facoltativa
[ Gruppo facoltativo
- Passaggio dentro il gruppo
]
- Dashboard
```

Struttura (componenti affiancati su una base comune):

```structure
caption: Struttura della piattaforma
base: CMS
- Componente | nota facoltativa
```

Link a un altro progetto: [Titolo](project:slug) · a uno strumento: [Python](tool:python)
Immagine: ![Testo alternativo obbligatorio](assets/img/progetti/nome-file.png "Didascalia facoltativa")
-->

## Contesto

TODO: Qual era il contesto iniziale.

## Problema

TODO: Quale problema o esigenza doveva essere affrontato.

## Ruolo

TODO: Ruolo e attività svolte personalmente (solo se confermati).

## Approccio

TODO: Come è stato affrontato il problema.

## Soluzione

TODO: Soluzione, processo, POC o implementazione realizzata.

## Risultato

TODO: Solo risultati documentati. Nessuna metrica se non verificabile.
