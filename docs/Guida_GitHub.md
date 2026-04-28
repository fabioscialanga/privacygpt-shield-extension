# Guida GitHub PrivacyGPT Shield Extension V3.3

## Nome repository consigliato

```text
privacygpt-shield-extension
```

## Primo caricamento

Dentro la cartella del progetto:

```bash
git init
git add .
git commit -m "Release PrivacyGPT Shield Extension V3.3"
git branch -M main
git remote add origin https://github.com/TUO_USERNAME/privacygpt-shield-extension.git
git push -u origin main
```

Sostituisci `TUO_USERNAME` con il tuo username GitHub reale.

## Aggiornamento di un repository già pubblicato

Se il repository esiste già e devi pubblicare questa nuova versione:

```bash
git status
git add .
git commit -m "Update PrivacyGPT Shield Extension V3.3"
git push origin main
```

## Se il remote è sbagliato

Controlla il remote:

```bash
git remote -v
```

Correggilo così:

```bash
git remote set-url origin https://github.com/TUO_USERNAME/privacygpt-shield-extension.git
```

Poi fai push:

```bash
git push -u origin main
```

## Release GitHub consigliata

Crea una release con:

- tag: `v3.3.0`
- titolo: `PrivacyGPT Shield Extension V3.3`
- allegato: ZIP del progetto

## Descrizione repository consigliata

```text
Chrome extension for local privacy redaction before sending prompts to ChatGPT.
```
