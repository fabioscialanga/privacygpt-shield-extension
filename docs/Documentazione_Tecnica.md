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

## Nota su modalità Manuale e Debug overlay

In modalità Manuale il pulsante **🔒 Anonimizza** resta visibile anche quando il Debug overlay è attivo.
Il pulsante viene posizionato più in alto per evitare sovrapposizioni visive con il riquadro di debug.
