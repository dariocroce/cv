---
title: CAA Menu Accessibility
titleLang: en
category: automation-data-ai
order: 3
featured: true
role: Analisi e prototipazione
scope: Applied AI · Accessibility · Content Normalization · Proof of Concept
summary: Analisi e prototipazione di una soluzione per supportare la trasformazione dei menu della ristorazione scolastica in contenuti potenzialmente utilizzabili nell'ambito della Comunicazione Aumentativa Alternativa (CAA).
technologies: Microsoft Copilot, LLM, Prompt Engineering, Content Normalization, Structured Output, Accessibility, ARASAAC
related: portale-ristorazione-scolastica
---

## Contesto

Progetto esplorativo (*Discovery / Proof of Concept*) per valutare la fattibilità della trasformazione dei menu scolastici in rappresentazioni in CAA basate sui pittogrammi ARASAAC, limitando l'uso dell'AI generativa nei passaggi in cui un comportamento non deterministico potrebbe compromettere la qualità della traduzione.

## Problema

Il progetto nasce dall'esigenza di rendere i menu pubblicati sul [Portale Ristorazione Scolastica](project:portale-ristorazione-scolastica) maggiormente accessibili, valutando una soluzione che consentisse di sfruttare le capacità dei modelli linguistici senza introdurre componenti di Intelligenza Artificiale direttamente nel portale destinato agli utenti finali.

### Obiettivo

Verificare la fattibilità di un processo controllato per trasformare i menu scolastici in contenuti strutturati e predisposti per una successiva rappresentazione in CAA, mantenendo l'elaborazione AI separata dal portale di pubblicazione.

## Ruolo

Ho curato l'analisi e la prototipazione della soluzione: dallo studio delle diciture dei piatti e del catalogo dei pittogrammi fino alla definizione di un processo separato dal portale di pubblicazione.

## Approccio

- Analisi del formato e della struttura dei menu esistenti
- Individuazione delle criticità nella trasformazione automatica delle descrizioni dei piatti
- Sperimentazione dell'uso di LLM per normalizzare e semplificare il testo di partenza
- Definizione di una struttura di output standardizzata
- Prototipazione di un processo separato dal Portale Ristorazione Scolastica
- Valutazione della fattibilità tecnica di una pipeline in cui l'AI supporta la preparazione del contenuto senza essere integrata nel front-end
- Distinzione tra normalizzazione automatica del contenuto e successiva rappresentazione secondo criteri CAA

### Analisi e prototipazione

- Analisi di **7.622 diciture storiche** dei piatti e costruzione sperimentale di **837 macro-piatti**, per ricondurre varianti testuali diverse a concetti comuni
- Analisi e razionalizzazione del catalogo ARASAAC disponibile: **631 pittogrammi alimentari e 9 simboli di servizio**
- Uso di un agente Copilot di normalizzazione dei menu per proporre nome normalizzato e ingredienti caratterizzanti
- Studio di un'architettura ibrida che separa l'interpretazione generativa dall'associazione deterministica ai pittogrammi

## Soluzione

```flow
caption: Processo prototipato, separato dal portale di pubblicazione
- Menu esistenti | pubblicati sul Portale Ristorazione Scolastica
[ Processo separato dal portale
- Strutturazione del menu
- Proposta di piatto normalizzato | AI generativa
- Validazione
- Macro-piatto
- Associazione ai pittogrammi | deterministica
]
- Rappresentazione in CAA | richiede una validazione specialistica dedicata
```

> **Perimetro del Proof of Concept.** Il Proof of Concept ha l'obiettivo di validare l'approccio tecnico e il processo di normalizzazione; la correttezza della successiva rappresentazione in CAA richiede invece una validazione specialistica dedicata.

## Risultato

Risultati esplorativi:

- **7.601 diciture su 7.622 (99,7%)** classificate nell'esperimento sui macro-piatti
- Test su **4 menu reali e 222 piatti**: circa il **90%** dei piatti ricondotto a macro-piatti già individuati

> **Cosa misurano questi dati.** Le metriche indicano la copertura dell'approccio sperimentale, non l'accuratezza della traduzione in CAA, che resta subordinata a una validazione metodologica specialistica e alla verifica delle licenze prima di un'eventuale industrializzazione.
