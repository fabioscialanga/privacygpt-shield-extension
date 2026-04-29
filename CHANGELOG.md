# Changelog

## v3.3.0

### Aggiunto

- Modalità Semplice
- Modalità Legale
- Debug overlay realmente attivabile e disattivabile
- Opzione Maschera aziende
- Logo originale con scudo e lucchetto
- Icone Chrome in più dimensioni
- Banner per README GitHub
- GIF animata installazione
- Guida installazione
- Guida GitHub
- Documentazione tecnica
- Privacy Policy
- Release notes

### Modificato

- Sostituito il vecchio booleano `legalMode` con la proprietà `mode`, mantenendo compatibilità interna.
- Migliorato il popup dell'estensione con branding e logo.
- Aggiornato il test locale con soli dati fittizi e dimostrativi.

### Corretto

- Rimossi completamente i dati reali di cliente dai file di test e dalla diagnostica interna.


## V3.3 - Miglioramento riconoscimento persone

- Aggiunto `names.js` con dizionario generico di nomi propri comuni.
- Migliorato il riconoscimento delle persone in header email, saluti e firme.
- Migliorata la gestione delle date Outlook prima del riconoscimento telefoni.
- Nessun cognome, azienda, cliente, email, indirizzo o credenziale reale è stato cablato nel motore.
