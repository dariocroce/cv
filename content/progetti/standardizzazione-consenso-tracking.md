---
title: Standardizzazione del processo di consenso e tracking
category: data-governance-measurement
order: 2
role: Redazione dello standard e gestione del tracking
scope: Web Analytics · Tracking · Privacy Governance
summary: Standardizzazione della gestione di analytics, pixel, cookie e sistemi di consenso sui touchpoint digitali del gruppo, per un'architettura di tracking centralizzata, verificabile e conforme.
technologies: Google Tag Manager, Google Analytics 4, Google Consent Mode v2, Avacy CMP, Matomo
competencies: Tracking Governance, Consent Management, Data Quality, Web Analytics, Debugging
---

## Contesto

I touchpoint digitali del gruppo utilizzano strumenti di analytics, pixel pubblicitari, cookie e sistemi di gestione del consenso, da governare in modo uniforme.

## Problema

Garantire un'architettura di tracking centralizzata, verificabile e conforme, eliminando gli script inseriti direttamente nel codice dei siti.

## Ruolo

Ho definito e redatto la guida standard aziendale per la configurazione uniforme di CMP, Tag Manager e Google Consent Mode v2, con i protocolli di verifica pre-rilascio, e gestisco la centralizzazione dei tag in Google Tag Manager.

## Approccio

### Standard aziendale

- Guida standard per la configurazione uniforme di CMP, Tag Manager e Google Consent Mode v2
- Protocolli di verifica prima di ogni rilascio

### Centralizzazione in Google Tag Manager

- Gestione esclusiva tramite GTM di tutti i tag: GA4, Google Ads, Meta Pixel, LinkedIn Insight Tag, TikTok, Clarity, Hotjar
- Eliminazione degli script inseriti direttamente nel codice dei siti

### Gestione del consenso

- Google Consent Mode v2 in modalità Base, con consenso negato come stato iniziale
- Attivazione dei tag subordinata agli eventi di aggiornamento del consenso della CMP

### Qualità del dato

- Debugging con GTM Preview e analisi delle chiamate di rete
- Distinzione tra anomalie di configurazione e reali variazioni di traffico
- Analisi della navigazione e reportistica su GA4 e Matomo

## Soluzione

```flow
caption: Flusso del consenso
- Utente
- CMP (Avacy) | raccolta del consenso
- Stato del consenso
- Google Tag Manager
- Tag autorizzati
- Piattaforme di analytics e advertising
```

## Risultato

- Uno standard aziendale documentato per la configurazione e la verifica pre-rilascio di consenso e tracking
- Tag centralizzati in Google Tag Manager, senza script inseriti direttamente nel codice dei siti
- Attivazione dei tag subordinata al consenso dell'utente
