---
title: Matilde Ristorazione
category: siti-app
order: 2
featured: true
role: Project Manager
scope: Website Restyling · WordPress
summary: Coordinamento del restyling del sito Matilde Ristorazione, realizzato in WordPress, con revisione della struttura del sito, dell'esperienza di navigazione e dell'identità visiva.
technologies: WordPress, JSON
competencies: Project Management, WordPress, UX/UI, Information Architecture, Web Design, Brand Design, System Integration, API Testing, Vendor Management
---

## Contesto

Restyling del sito matilderistorazione.it con l'obiettivo di modernizzare l'esperienza digitale, riorganizzare i contenuti e semplificare la consultazione delle informazioni rivolte a famiglie, scuole e territorio.

## Problema

Oltre a rinnovare struttura e navigazione, il progetto doveva superare la gestione separata dei menu: invece di gestirli a parte nel sito, l'obiettivo era esporli in modo dinamico a partire dalla fonte aziendale.

## Ruolo

Come **Project Manager** ho coordinato il progetto di restyling.

### Project Management

- Coordinamento complessivo del progetto di restyling
- Definizione delle attività e dei requisiti
- Coordinamento del fornitore durante progettazione, sviluppo e rilascio
- Confronto con gli stakeholder coinvolti
- Verifica delle implementazioni e gestione delle correzioni

### UX & Information Architecture

- Revisione dell'alberatura del sito
- Riorganizzazione dei contenuti e dei percorsi di navigazione
- Revisione dell'esperienza utente
- Definizione delle esigenze funzionali da trasferire al fornitore

### Visual & Brand

- Progettazione di una nuova mascotte per Matilde
- Contributo alla revisione dell'identità visiva digitale
- Verifica della coerenza degli elementi grafici all'interno del nuovo sito

### Menu Integration

- Integrazione del sito con il sistema aziendale di gestione dei menu
- Esposizione sul sito dei menu provenienti da una fonte centralizzata
- Definizione dei requisiti funzionali per l'integrazione
- Verifica del corretto funzionamento dell'integrazione all'interno dell'esperienza web

## Approccio

Accanto al restyling, ho seguito la progettazione funzionale e il testing dell'integrazione dei menu.

### Integrazione dei menu

- Definizione del flusso funzionale di consultazione e analisi della struttura dati necessaria all'esposizione web
- Analisi della documentazione dei web service, in raccordo con i referenti tecnici
- Definizione delle logiche di interrogazione per cliente, destinazione, grado scolastico e dieta
- Test delle API e analisi delle risposte JSON, verificando i menu restituiti in funzione di data, grado scolastico e dieta
- Segnalazione delle anomalie e test funzionale dell'integrazione sul front-end

## Soluzione

Un elemento caratterizzante del progetto è l'**integrazione con uno strumento aziendale per la gestione dei menu**, che consente al sito di esporre contenuti provenienti da una fonte centralizzata anziché gestirli separatamente all'interno di WordPress.

```flow
caption: Integrazione dei menu
- Strumento aziendale di gestione dei menu | fonte centralizzata dei contenuti
- API / web service | risposte in formato JSON
- Selezione per data, grado scolastico e dieta
- Sito Matilde Ristorazione (WordPress) | espone i menu senza gestirli separatamente
```

## Risultato

- Restyling completo del sito e riorganizzazione dell'architettura informativa
- Nuova versione della mascotte Matilde, con nuove pose e declinazioni grafiche
- Integrazione con il sistema aziendale di gestione dei menu progettata e testata: il sito espone i menu da una fonte centralizzata ed è integrato con i sistemi operativi
