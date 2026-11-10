---
title: CAA Menu Accessibility
titleLang: en
category: automation-data-ai
order: 3
featured: true
scope: Applied AI · Accessibility · Content Normalization · Proof of Concept
summary: Analisi e prototipazione di una soluzione per supportare la trasformazione dei menu della ristorazione scolastica in contenuti potenzialmente utilizzabili nell'ambito della Comunicazione Aumentativa Alternativa (CAA).
technologies: Microsoft Copilot, LLM, Prompt Engineering, Content Normalization, Structured Output, Accessibility
related: portale-ristorazione-scolastica
---

## Problema

Il progetto nasce dall'esigenza di rendere i menu pubblicati sul [Portale Ristorazione Scolastica](project:portale-ristorazione-scolastica) maggiormente accessibili, valutando una soluzione che consentisse di sfruttare le capacità dei modelli linguistici senza introdurre componenti di Intelligenza Artificiale direttamente nel portale destinato agli utenti finali.

### Obiettivo

Verificare la fattibilità di un processo controllato per trasformare i menu scolastici in contenuti strutturati e predisposti per una successiva rappresentazione in CAA, mantenendo l'elaborazione AI separata dal portale di pubblicazione.

## Ruolo

TODO: Ruolo ricoperto e attività svolte personalmente nel Proof of Concept.

## Approccio

- Analisi del formato e della struttura dei menu esistenti
- Individuazione delle criticità nella trasformazione automatica delle descrizioni dei piatti
- Sperimentazione dell'uso di LLM per normalizzare e semplificare il testo di partenza
- Definizione di una struttura di output standardizzata
- Prototipazione di un processo separato dal Portale Ristorazione Scolastica
- Valutazione della fattibilità tecnica di una pipeline in cui l'AI supporta la preparazione del contenuto senza essere integrata nel front-end
- Distinzione tra normalizzazione automatica del contenuto e successiva rappresentazione secondo criteri CAA

## Soluzione

```flow
caption: Processo prototipato, separato dal portale di pubblicazione
- Menu esistenti | pubblicati sul Portale Ristorazione Scolastica
[ Processo separato dal portale
- Normalizzazione e semplificazione del testo | sperimentazione dell'uso di LLM
- Struttura di output standardizzata
]
- Successiva rappresentazione secondo criteri CAA | richiede una validazione specialistica dedicata
```

> **Perimetro del Proof of Concept.** Il Proof of Concept ha l'obiettivo di validare l'approccio tecnico e il processo di normalizzazione; la correttezza della successiva rappresentazione in CAA richiede invece una validazione specialistica dedicata.

## Risultato

TODO: Esito del Proof of Concept. Inserire metriche solo se documentate.
