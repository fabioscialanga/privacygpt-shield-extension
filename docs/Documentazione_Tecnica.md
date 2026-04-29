# Documentazione tecnica PrivacyGPT Shield V3.3

## Panoramica tecnica

L'estensione intercetta l'interazione con l'editor di ChatGPT e applica una trasformazione preventiva del testo tramite un motore regex-based.

## Flusso operativo

1. caricamento impostazioni da `chrome.storage.local`
2. individuazione editor di input nella pagina
3. intercettazione invio tramite Enter o click sul pulsante di invio
4. lettura del contenuto dell'editor
5. anonimizzazione mediante `rules.js`
6. sostituzione del testo anonimizzato nell'editor
7. eventuale aggiornamento debug overlay

## Storage usato

Chiavi principali:

- `enabled`
- `mode`
- `debug`
- `maskCompanies`

## Selettori usati per l'editor

- `div[contenteditable="true"]`
- `textarea`
- `[data-testid="prompt-textarea"]`
- `#prompt-textarea`

## Eventi monitorati

- `keydown` su `Enter`
- `click` sul pulsante di invio
- polling periodico per verificare la presenza dell'editor

## Motore regole

Il motore in `rules.js` restituisce un oggetto con:

- `text`
- `matches`
- `counters`
- `meta`

## Limiti tecnici

- dipendenza da regex
- dipendenza dal DOM di ChatGPT
- possibili falsi positivi o falsi negativi

## Test locale

La pagina `test.html` è stata sanificata e usa solo dati dimostrativi fittizi.


## Dizionario generico nomi comuni

La versione V3.3 include il file `names.js`, caricato prima di `rules.js`.

Il file espone `window.PrivacyGPTFirstNames`, un insieme locale di nomi propri comuni.

Il dizionario non contiene cognomi, aziende, clienti, indirizzi, email o credenziali. Viene usato solo come segnale di supporto per uno scoring contestuale.

Esempi di contesti che aumentano il punteggio:

- header email `Da:`, `A:`, `Cc:`
- presenza di `<[EMAIL_X]>` dopo il nome
- saluti come `Ciao Nome` o `Buongiorno Nome`
- firme email vicino a ruoli aziendali

La modalità Semplice non usa queste regole avanzate sulle persone.
