# PrivacyGPT Shield V3.3

![PrivacyGPT Shield Banner](assets/github_banner.png)

**PrivacyGPT Shield V3.3** è una estensione Chrome ideata e sviluppata da **Fabio Scialanga** per aiutare professionisti, consulenti e aziende ad anonimizzare dati sensibili prima dell'invio di prompt a ChatGPT.

> PrivacyGPT Shield elabora il testo localmente nel browser e non invia i contenuti a server esterni.

## Obiettivo del progetto

Quando si lavora con documenti tecnici, amministrativi, contrattuali o legali, può capitare di incollare in ChatGPT contenuti che contengono dati personali o aziendali. PrivacyGPT Shield nasce per ridurre questo rischio, sostituendo automaticamente i pattern sensibili riconosciuti con token anonimi.

## Funzionalità principali

### Modalità semplice

Maschera i dati più evidenti:

- email
- numeri di telefono
- IBAN
- codice fiscale
- partita IVA
- URL
- indirizzi IP

### Modalità legale

Pensata per contesti contrattuali, legali e amministrativi. Oltre ai dati della modalità semplice, prova a mascherare anche:

- nomi e cognomi
- date rilevanti
- date di nascita in contesto
- indirizzi
- sedi legali
- città in contesto sensibile
- aziende, se l'opzione è attiva

### Dizionario nomi comuni

La modalità **Legale** usa anche un piccolo dizionario locale di nomi propri comuni per migliorare il riconoscimento delle persone in header email, saluti e firme.

Il dizionario contiene solo nomi di battesimo generici, non contiene cognomi, aziende, email, indirizzi, clienti o dati reali specifici.

Il riconoscimento non si basa solo sul nome: il motore valuta anche il contesto, ad esempio `Da:`, `A:`, `Cc:`, saluti, firme e righe vicine a ruoli aziendali.

### Debug overlay opzionale

Mostra un riquadro tecnico in basso a destra con:

- stato dell'estensione
- modalità attiva
- editor rilevato o meno
- numero di pattern trovati
- ultima azione eseguita

### Test locale

La pagina `test.html` permette di testare il motore di anonimizzazione senza usare ChatGPT.

Tutti i dati presenti nel test locale sono **fittizi e dimostrativi**.

## GIF installazione

![Installazione PrivacyGPT Shield V3.3](docs/installazione_privacygpt_v33.gif)

## Struttura del repository

```text
PrivacyGPT_Shield_V3_3/
  manifest.json
  content.js
  popup.html
  popup.js
  rules.js
  test.html
  README.md
  PRIVACY_POLICY.md
  CHANGELOG.md
  RELEASE_NOTES_v3.3.0.md
  CONTRIBUTING.md
  SECURITY.md
  LICENSE
  .gitignore
  assets/
    logo_master.png
    github_banner.png
    icon16.png
    icon32.png
    icon48.png
    icon64.png
    icon96.png
    icon128.png
    icon256.png
    icon512.png
  docs/
    Guida_Installazione.md
    Guida_GitHub.md
    Documentazione_Tecnica.md
    installazione_privacygpt_v33.gif
    screenshots/
      step1.png
      step2.png
      step3.png
      step4.png
```

## Installazione in Chrome

1. Scarica lo ZIP del progetto o clona il repository.
2. Estrai lo ZIP in una cartella locale.
3. Apri Chrome.
4. Vai su `chrome://extensions`.
5. Attiva **Modalità sviluppatore**.
6. Clicca **Carica estensione non pacchettizzata**.
7. Seleziona la cartella `PrivacyGPT_Shield_V3_3`.
8. Apri ChatGPT e ricarica la pagina.
9. Apri il popup dell'estensione e scegli modalità e opzioni.

## Uso

1. Scrivi o incolla un testo nell'editor di ChatGPT.
2. Premi invio oppure clicca il pulsante di invio.
3. L'estensione analizza il testo.
4. Se trova pattern sensibili, sostituisce i valori con token anonimi.

Esempi di token:

- `[EMAIL_1]`
- `[PHONE_1]`
- `[IBAN_1]`
- `[PERSON_1]`
- `[ADDRESS_1]`

## Popup dell'estensione

Dal popup puoi gestire:

- attivazione o disattivazione dell'estensione
- modalità semplice o legale
- debug overlay
- mascheramento aziende
- diagnostica su ChatGPT
- apertura del test locale

## Documentazione

- [Guida installazione](docs/Guida_Installazione.md)
- [Guida GitHub](docs/Guida_GitHub.md)
- [Documentazione tecnica](docs/Documentazione_Tecnica.md)
- [Privacy Policy](PRIVACY_POLICY.md)
- [Changelog](CHANGELOG.md)
- [Release notes V3.3](RELEASE_NOTES_v3.3.0.md)

## Architettura

### `manifest.json`
Definisce nome, versione, permessi, icone, popup e content script.

### `content.js`
Gestisce l'integrazione con ChatGPT, l'intercettazione dell'invio, il debug overlay e la diagnostica.

### `rules.js`
Contiene il motore di anonimizzazione basato su pattern regex.

### `popup.html` e `popup.js`
Gestiscono l'interfaccia dell'estensione.

### `test.html`
Permette di testare localmente il motore con dati fittizi.

## Limiti

Il motore è basato su regex, quindi:

- non garantisce anonimizzazione perfetta in ogni scenario
- può generare falsi positivi
- può non riconoscere dati scritti in formati insoliti
- può richiedere aggiornamenti se cambia il DOM di ChatGPT

## Pubblicazione GitHub consigliata

```bash
git init
git add .
git commit -m "Release PrivacyGPT Shield V3.3"
git branch -M main
git remote add origin https://github.com/TUO_USERNAME/privacygpt-shield-v3-3.git
git push -u origin main
```

## Release GitHub consigliata

- tag: `v3.3.0`
- titolo: `PrivacyGPT Shield V3.3`
- allegato: `PrivacyGPT_Shield_V3_3_GitHub_Package.zip`

## Autore

PrivacyGPT Shield V3.3 è stato ideato e sviluppato da **Fabio Scialanga**.

## Licenza

MIT License. Vedi file [LICENSE](LICENSE).
