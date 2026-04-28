# Guida installazione PrivacyGPT Shield Extension V3.3

## Obiettivo

Installare l'estensione Chrome in locale e verificarne il funzionamento.

## Installazione

1. Scarica il pacchetto ZIP oppure clona il repository GitHub.
2. Se hai scaricato lo ZIP, estrailo in una cartella locale.
3. Apri Google Chrome.
4. Vai su `chrome://extensions`.
5. Attiva **Modalità sviluppatore**.
6. Clicca **Carica estensione non pacchettizzata**.
7. Seleziona la cartella `privacygpt-shield-extension` o `PrivacyGPT_Shield_V3_3`.
8. Verifica che l'estensione compaia nella lista.
9. Apri ChatGPT e ricarica la pagina.
10. Apri il popup dell'estensione e scegli le impostazioni.

## Impostazioni disponibili

### Attivo
Abilita o disabilita l'estensione.

### Modalità anonimizzazione

- **Semplice**: maschera dati strutturati come email, telefoni, URL, IP, IBAN, codici fiscali e partite IVA.
- **Legale**: aggiunge controlli più ampi per documenti, contratti, firme email e testi sensibili.

### Modalità intervento

- **Manuale**: mostra il pulsante `🔒 Anonimizza`. Il testo viene modificato solo quando premi il pulsante.
- **Automatica**: anonimizza quando premi Invio o clicchi il pulsante di invio di ChatGPT.

La modalità Manuale è consigliata perché permette di controllare il risultato prima dell'invio.

### Debug overlay
Mostra informazioni tecniche nella pagina ChatGPT.

### Anonimizza aziende
Maschera nomi di società, clienti e fornitori.

## Test locale

Dal popup puoi cliccare **Apri test locale**. La pagina di test usa dati fittizi e serve a verificare il motore di anonimizzazione senza usare ChatGPT.

## Problemi comuni

### Il pulsante Anonimizza non compare
Verifica che:

- l'estensione sia attiva
- la modalità intervento sia impostata su Manuale
- la pagina ChatGPT sia stata ricaricata

### L'anonimizzazione non parte in automatico
Verifica che la modalità intervento sia impostata su Automatica.

### Il test locale non funziona
Apri la console del browser e verifica eventuali errori. In Manifest V3 gli script inline non sono permessi, quindi la logica del test è contenuta nel file `test.js`.


## Animazione installazione

![Installazione PrivacyGPT Shield V3.3](installazione_privacygpt_v33.gif)
