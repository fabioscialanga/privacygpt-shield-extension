# Release Notes - PrivacyGPT Shield V3.3.1

## Tipo release
Hotfix della versione V3.3.

## Correzioni principali

- Ridotti i falsi positivi nei contratti lunghi.
- Rimossa la regola generica che trasformava molte espressioni con iniziale maiuscola in `[PERSON_N]`.
- Migliorato il riconoscimento delle persone: ora la maschera `PERSON` viene applicata solo in presenza di contesti forti, come `legale rappresentante`, `nella persona di`, `in persona di`, `sig.`, `signor`, ecc.
- Migliorato il riconoscimento delle aziende con suffissi come `SRL`, `S.r.l.`, `SPA`, `S.p.A.`.
- Migliorato il riconoscimento degli indirizzi per evitare che vengano inglobate parole successive come `partita IVA` o `codice fiscale`.
- Mantenuta la compatibilità con il test locale tramite `test.js`, senza script inline.

## Nota privacy

Il test locale continua a usare solo dati fittizi. Nel progetto non sono presenti riferimenti a dati reali di clienti.
