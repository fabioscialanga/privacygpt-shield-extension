# Documentazione tecnica PrivacyGPT Shield Extension V3.3

## Architettura

L'estensione è composta da:

- `manifest.json`: configurazione Manifest V3
- `content.js`: logica iniettata su ChatGPT
- `rules.js`: motore di anonimizzazione locale
- `popup.html` e `popup.js`: interfaccia utente del popup
- `test.html` e `test.js`: test locale del motore

## Impostazioni salvate

Le impostazioni sono salvate in `chrome.storage.local`:

- `enabled`
- `mode`
- `interventionMode`
- `debug`
- `maskCompanies`

## Modalità anonimizzazione

### `mode = simple`
Applica pattern ad alta confidenza.

### `mode = legal`
Applica pattern più estesi per contesti legali, firme email e testi strutturati.

## Modalità intervento

### `interventionMode = manual`
`content.js` crea un pulsante flottante `🔒 Anonimizza`. Il testo viene processato solo al click del pulsante.

### `interventionMode = auto`
`content.js` intercetta Enter o click sul pulsante di invio di ChatGPT e processa il testo prima dell'invio.

## Debug overlay

Il debug overlay è creato dinamicamente da `content.js` e mostra:

- stato attivo
- modalità anonimizzazione
- modalità intervento
- editor rilevato
- numero match
- ultima azione

## Motore regex

Il file `rules.js` espone:

```js
window.PrivacyGPTRules.anonymizeText(text, options)
```

Output:

```json
{
  "text": "testo anonimizzato",
  "matches": [],
  "counters": {},
  "meta": {}
}
```

## Sicurezza

L'estensione non invia testo a server esterni. Tutta l'elaborazione avviene localmente nel browser.

## Limiti

Il motore è basato su regex e regole. Non può garantire anonimizzazione perfetta su tutti i testi. Per testi lunghi e molto complessi è consigliato controllare sempre il risultato in modalità Manuale.


## Materiale dimostrativo

La documentazione include due GIF:

- `docs/installazione_privacygpt_v33.gif`, per mostrare l installazione in Chrome.
- `docs/utilizzo_privacygpt_v33.gif`, per mostrare il flusso di utilizzo in modalità manuale.
