# Guida installazione PrivacyGPT Shield Extension V3.3

Questa guida spiega come installare **PrivacyGPT Shield Extension V3.3** in Google Chrome usando la modalità sviluppatore.

PrivacyGPT Shield è una estensione Chrome locale pensata per aiutarti ad anonimizzare dati sensibili prima dell'invio di prompt a ChatGPT.

## Requisiti

Prima di iniziare assicurati di avere:

- Google Chrome installato
- il repository scaricato o clonato sul computer
- la cartella del progetto estratta se hai scaricato uno ZIP

## Regola fondamentale

Quando Chrome ti chiede quale cartella caricare, devi selezionare **la cartella che contiene il file `manifest.json`**.

Il nome della cartella può essere diverso, per esempio:

```text
privacygpt-shield-extension
```

oppure:

```text
PrivacyGPT_Shield_V3_3
```

Il nome non è importante. È importante che dentro la cartella ci sia questo file:

```text
manifest.json
```

Non selezionare:

- il file ZIP
- una cartella superiore
- la cartella `docs`
- la cartella `assets`
- eventuali cartelle di appoggio o distribuzione

## Installazione da GitHub

### 1. Scarica il repository

Apri la pagina GitHub del progetto e clicca:

```text
Code > Download ZIP
```

In alternativa puoi clonare il repository con Git.

### 2. Estrai lo ZIP

Se hai scaricato il file ZIP, estrailo in una cartella locale del tuo computer.

Esempio:

```text
C:\AgentAi\privacygpt-shield-extension
```

### 3. Apri Chrome Extensions

Apri Google Chrome e vai su:

```text
chrome://extensions
```

### 4. Attiva Modalità sviluppatore

In alto a destra attiva:

```text
Modalità sviluppatore
```

### 5. Carica l'estensione

Clicca:

```text
Carica estensione non pacchettizzata
```

### 6. Seleziona la cartella corretta

Seleziona la cartella principale del progetto, cioè quella che contiene:

```text
manifest.json
```

Esempio corretto:

```text
C:\AgentAi\privacygpt-shield-extension
```

Esempi non corretti:

```text
C:\AgentAi
C:\AgentAi\privacygpt-shield-extension\docs
C:\AgentAi\privacygpt-shield-extension\assets
PrivacyGPT_Shield_V3_3.zip
```

### 7. Verifica il caricamento

Dopo il caricamento dovresti vedere l'estensione nella lista delle estensioni Chrome con il nome:

```text
PrivacyGPT Shield Extension V3.3
```

Se compare un errore, controlla di aver selezionato la cartella che contiene `manifest.json`.

### 8. Apri ChatGPT

Apri ChatGPT e ricarica la pagina.

L'estensione viene caricata solo dopo il refresh della pagina.

### 9. Configura l'estensione

Clicca sull'icona di PrivacyGPT Shield nella barra delle estensioni di Chrome.

Dal popup puoi scegliere:

- modalità anonimizzazione: **Semplice** o **Legale**
- modalità intervento: **Manuale** o **Automatica**
- anonimizza aziende: **ON** o **OFF**
- debug overlay: **ON** o **OFF**

## Modalità consigliata

Per un utilizzo sicuro e controllabile, la modalità consigliata è:

```text
Modalità anonimizzazione: Legale
Modalità intervento: Manuale
Anonimizza aziende: ON se stai lavorando con clienti, fornitori o documenti riservati
Debug overlay: OFF durante l'uso normale, ON solo per test
```

## Come usare la modalità Manuale

In modalità Manuale l'estensione non modifica automaticamente il testo quando premi Invio.

Il flusso consigliato è:

1. scrivi o incolla il testo in ChatGPT
2. clicca il pulsante **🔒 Anonimizza**
3. controlla il testo anonimizzato
4. invia manualmente il messaggio

Questa modalità è consigliata perché ti permette di verificare il risultato prima dell'invio.

## Come usare la modalità Automatica

In modalità Automatica l'estensione prova ad anonimizzare il testo quando:

- premi Invio
- clicchi il pulsante di invio di ChatGPT

Questa modalità è più veloce, ma meno controllabile. Per documenti lunghi, contratti o email riservate è preferibile la modalità Manuale.

## Test locale

Il progetto include una pagina di test locale:

```text
test.html
```

Serve per provare il motore di anonimizzazione senza usare ChatGPT.

Per usarla:

1. apri il popup dell'estensione
2. clicca **Apri test locale**
3. premi **Anonimizza**
4. verifica l'output e il log dei match

Il test locale usa solo dati fittizi e dimostrativi.

## Risoluzione problemi

### L'estensione non si carica

Controlla di aver selezionato la cartella che contiene `manifest.json`.

### Il pulsante Anonimizza non compare

Verifica nel popup che la modalità intervento sia impostata su:

```text
Manuale
```

Poi ricarica ChatGPT.

### L'estensione non modifica il testo

Controlla che:

- l'estensione sia attiva
- la pagina ChatGPT sia stata ricaricata dopo l'installazione
- il testo contenga dati riconoscibili dal motore
- la modalità scelta sia coerente con il tipo di testo

### Il test locale non funziona

Assicurati di non aver aperto direttamente un file dentro lo ZIP.

Devi prima estrarre tutta la cartella del progetto e poi aprire `test.html`.

### Vedo troppi falsi positivi

Usa la modalità **Semplice** oppure disattiva **Anonimizza aziende**.

### Vedo pochi dati anonimizzati

Usa la modalità **Legale** e, se stai lavorando con email o documenti riservati, attiva **Anonimizza aziende**.

## Privacy

PrivacyGPT Shield Extension V3.3 elabora il testo localmente nel browser.

L'estensione:

- non invia il testo a server esterni
- non usa API esterne
- non salva il contenuto dei prompt
- salva solo le impostazioni locali tramite `chrome.storage.local`

## Nota importante

PrivacyGPT Shield Extension V3.3 riduce il rischio di esposizione di dati sensibili, ma non garantisce anonimizzazione perfetta in ogni scenario.

Per documenti importanti, email lunghe, contratti o testi molto delicati, controlla sempre il risultato prima dell'invio.

La modalità Manuale è la scelta consigliata.
