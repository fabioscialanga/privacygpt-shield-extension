# Changelog

## 3.3.2

- Migliorata anonimizzazione email thread e firme aziendali.
- Aggiunto riconoscimento display name in header email.
- Aggiunto riconoscimento indirizzi con `snc` e righe CAP/città.
- Aggiunto riconoscimento server `IP:porta`.
- Aggiunto riconoscimento credenziali tecniche isolate.
- Aggiunto riconoscimento nomi database in contesti tecnici.
- Migliorati telefoni con separatori `/`, `.`, spazio e trattino.
- Ridotti falsi positivi su contratti lunghi.

## 3.3.1

- Ridotti falsi positivi nella modalità legale.
- Rimosso riconoscimento generico troppo aggressivo dei nomi persona.

## 3.3.0

- Introduzione modalità semplice e modalità legale.
- Debug overlay opzionale.
- Logo e asset grafici.
- Test locale con dati fittizi.

## 3.3.3 - Email Thread Detection Hotfix

- Migliorato il riconoscimento delle email thread lunghe.
- Rafforzato il parsing generico degli header `Da`, `A`, `Cc`, `From`, `To`.
- Migliorato il riconoscimento dei nomi nelle firme senza cablare nomi reali.
- Aggiunta modalità interna `emailThreadMode` per applicare regole più robuste quando il testo assomiglia a una catena email.
- Migliorato il mascheramento automatico delle aziende nelle email thread in modalità legale.
- Nessun nome reale o azienda reale è stato inserito nel sorgente per costruire le regole.
