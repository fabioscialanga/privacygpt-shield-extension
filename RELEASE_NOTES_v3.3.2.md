# Release Notes PrivacyGPT Shield V3.3.2

## Tipo release
Hotfix funzionale.

## Obiettivo
Migliorare l'anonimizzazione di email thread lunghe, firme aziendali, header Outlook e informazioni tecniche presenti nel corpo del messaggio.

## Correzioni principali

- migliorato riconoscimento dei display name negli header `Da`, `A`, `Cc`
- migliorato riconoscimento dei nomi nelle firme email
- migliorato riconoscimento indirizzi con `snc`
- migliorato riconoscimento telefoni, fax e cellulari con separatori diversi
- aggiunto mascheramento server nel formato `IP:porta`
- aggiunto mascheramento credenziali tecniche isolate
- aggiunto mascheramento nomi database in contesti tecnici
- ridotti falsi positivi su contratti e documenti lunghi

## Sicurezza dati
Il pacchetto non contiene dati reali di clienti. I dati presenti nel test locale sono fittizi.
