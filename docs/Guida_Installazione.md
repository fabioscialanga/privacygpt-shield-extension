# Guida installazione PrivacyGPT Shield V3.3

## Obiettivo
Installare l'estensione manualmente in Chrome e verificarne il corretto funzionamento.

## Prerequisiti

- Google Chrome oppure un browser Chromium compatibile
- il progetto scaricato in ZIP o clonato da GitHub
- cartella del progetto estratta localmente

## Procedura dettagliata

### 1. Scarica il progetto
Puoi scegliere una delle due strade:

- scaricare lo ZIP del repository
- clonare il repository con Git

### 2. Estrai lo ZIP
Se hai scaricato il pacchetto ZIP, estrailo in una cartella locale.

### 3. Apri la pagina estensioni di Chrome
Apri Chrome e vai su:

`chrome://extensions`

### 4. Attiva la Modalità sviluppatore
L'interruttore si trova in alto a destra.

### 5. Carica l'estensione
Clicca su:

`Carica estensione non pacchettizzata`

### 6. Seleziona la cartella del progetto
Scegli la cartella:

`PrivacyGPT_Shield_V3_3`

### 7. Verifica l'installazione
Dovresti vedere l'estensione nell'elenco di Chrome con il nome **PrivacyGPT Shield V3.3** e il logo con scudo e lucchetto.

### 8. Apri ChatGPT
Apri ChatGPT e ricarica la pagina dopo l'installazione.

### 9. Configura il popup
Dal popup puoi:

- attivare o disattivare l'estensione
- scegliere modalità semplice o legale
- attivare o disattivare il debug overlay
- decidere se mascherare anche le aziende

### 10. Esegui i test
Puoi usare due strumenti:

- `Run diagnostics su ChatGPT`
- `Apri test locale`

## Verifiche utili

### Se il test locale funziona ma ChatGPT no
Probabile problema di selezione dell'editor o di cambiamenti nel DOM di ChatGPT.

### Se il test locale non funziona
Probabile problema nel motore regex di `rules.js`.

### Se non vedi il debug overlay
Controlla che l'opzione sia attiva e ricarica la pagina.

## GIF animata
La guida include anche una GIF animata che mostra visivamente i passaggi principali di installazione:

`docs/installazione_privacygpt_v33.gif`
