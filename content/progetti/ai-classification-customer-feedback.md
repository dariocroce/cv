---
title: AI Classification of Customer Feedback
titleLang: en
category: automation-data-ai
order: 2
featured: true
role: Sviluppo del Proof of Concept
scope: Applied AI · NLP · Classification · Proof of Concept
summary: Sviluppo di un Proof of Concept per l'analisi e la classificazione automatica di feedback e suggerimenti raccolti attraverso survey.
technologies: Python, Azure OpenAI, Azure AI Foundry, Microsoft Copilot Studio, LLM, SurveyMonkey, NLP, Prompt Engineering, Structured Data
competencies: LLM Evaluation, Ground Truth, Prompt Engineering, AI-Assisted Scripting
---

## Contesto

Le survey di Customer Satisfaction raccolgono centinaia di risposte aperte, che devono confluire nella reportistica destinata ai clienti.

## Problema

Il progetto nasce dall'esigenza di trasformare grandi quantità di commenti testuali non strutturati in informazioni organizzate e utilizzabili per l'analisi, riducendo l'attività manuale necessaria alla loro lettura e categorizzazione.

### Obiettivo

Verificare la fattibilità di un sistema in grado di trasformare automaticamente feedback testuali non strutturati in dati classificati e utilizzabili per successive attività di analisi.

## Ruolo

Ho sviluppato il Proof of Concept seguendone le fasi operative: preparazione dei dati, definizione della tassonomia, costruzione della classificazione di riferimento (ground truth), classificazione tramite LLM e confronto dei risultati. Gli script sono stati realizzati con il supporto dell'AI (*AI-assisted scripting*).

## Approccio

- Definizione e progressiva revisione di una tassonomia di classificazione
- Identificazione degli intenti presenti nei commenti
- Classificazione multilivello dei contenuti
- Sperimentazione di differenti logiche di classificazione e prompting
- Costruzione di dataset di riferimento per la verifica dei risultati
- Analisi degli errori e affinamento iterativo delle regole di classificazione
- Test e confronto delle performance del classificatore
- Sviluppo del POC attraverso Python e modelli LLM

## Soluzione

Il primo Proof of Concept è stato realizzato sulle survey della **Ristorazione Scolastica**, su un dataset di **72 questionari e 983 risposte aperte**.

```flow
caption: Fase 1 · POC sulla Ristorazione Scolastica
- Survey
- Estrazione e pulizia dei dati
- Tassonomia | definizione e revisione
- Ground truth | classificazione manuale di riferimento
- Classificazione tramite LLM
- Validazione | confronto con la ground truth e affinamento del prompt
- Dataset classificato
```

Nella seconda fase il metodo è stato esteso alle survey della **Ristorazione Aziendale**, con un sistema che esegue in modo ripetibile configurazioni sperimentali diverse, per separare l'impatto del modello utilizzato da quello delle strategie di prompt engineering.

```flow
caption: Fase 2 · Architettura evolutiva
- SurveyMonkey
- Normalizzazione
- Benchmark di modelli e prompt
- Validazione
- Dataset classificato
- BI
```

### Benchmark di modelli e prompt

- Esecuzione dello stesso dataset e della stessa tassonomia su LLM diversi, locali e cloud
- Confronto automatico con la ground truth validata e misurazione dell'accuracy
- Test incrociati: prompt diversi a parità di modello, modelli diversi a parità di prompt
- Individuazione di errori ricorrenti e categorie problematiche

## Risultato

- POC completato sulla Ristorazione Scolastica (72 questionari, 983 risposte aperte)
- Pipeline di classificazione automatica validata su un caso d'uso reale
- Framework automatizzato per il confronto sistematico tra modelli e strategie di prompt
- Estensione in corso sulla Ristorazione Aziendale, verso un metodo ripetibile di misurazione, validazione e miglioramento dell'accuracy
