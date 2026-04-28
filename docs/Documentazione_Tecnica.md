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

## Nota CSP su Manifest V3

Le pagine dell'estensione non possono eseguire script inline a causa della Content Security Policy di Chrome.
Per questo motivo il test locale usa due file separati:

- `test.html` per la struttura HTML
- `test.js` per la logica JavaScript

Questa scelta evita errori come `Executing inline script violates the Content Security Policy directive`.

## Hotfix 3.3.1 - riduzione falsi positivi

La regola generica di riconoscimento di nomi propri a due o tre parole è stata rimossa perché nei contratti lunghi produceva falsi positivi, ad esempio su definizioni, titoli, servizi, prodotti, documenti o concetti giuridici.

Da questa versione il token `PERSON` viene applicato solo quando il possibile nome compare dopo un contesto forte, ad esempio:

- legale rappresentante
- rappresentante legale
- nella persona di
- in persona di
- signor / signora / sig. / sig.ra
- referente amministrativo
- amministratore delegato

Questo approccio è più prudente e adatto a documenti contrattuali lunghi.

## Hotfix 3.3.2

La versione 3.3.2 introduce regole più adatte alle email thread esportate da Outlook o copiate da client di posta.

Pattern migliorati:

- display name prima di email già anonimizzate
- righe firma con nome e ruolo
- aziende con suffisso societario
- indirizzi su singola riga e righe CAP/città
- server in formato IP:porta
- username amministrativi isolati
- password-like isolate
- nomi database in frasi tecniche

Nota: le regole restano regex-based, quindi vanno considerate come supporto preventivo e non come garanzia assoluta di anonimizzazione completa.
