<div align="center">

![PrivacyGPT Shield Banner](assets/github_banner.png)

# 🔒 PrivacyGPT Shield Extension V3.3

### Anonimizza dati sensibili prima di inviare prompt a ChatGPT

**Una estensione Chrome locale, leggera e controllabile, pensata per professionisti, consulenti e aziende che lavorano con testi riservati.**

<br>

![Version](https://img.shields.io/badge/version-3.3-blue?style=for-the-badge)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Privacy First](https://img.shields.io/badge/Privacy-Local%20Only-0f172a?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

<br>

**Ideato e sviluppato da Fabio Scialanga**

</div>

---

## 🚀 Perché nasce PrivacyGPT Shield

Quando lavori con ChatGPT capita spesso di incollare email, contratti, ticket, documenti tecnici o conversazioni che contengono dati sensibili.

PrivacyGPT Shield nasce per ridurre questo rischio: prima dell'invio, l'estensione può anonimizzare automaticamente o manualmente informazioni come nomi, email, telefoni, indirizzi, aziende, URL, IP, IBAN, codici fiscali, partite IVA e credenziali tecniche evidenti.

> **PrivacyGPT Shield elabora il testo localmente nel browser. Non invia i contenuti a server esterni.**

---

## 🎬 Demo video

Guarda il video dimostrativo completo:

<div align="center">

[![Guarda il video demo](assets/github_banner.png)](docs/privacygpt_shield_v33_demo.mp4)

👉 **[Apri il video demo MP4](docs/privacygpt_shield_v33_demo.mp4)**

</div>

---

## ✨ Demo visuali

### Installazione

La GIF seguente mostra come installare PrivacyGPT Shield in Chrome in modalità sviluppatore.

![Installazione PrivacyGPT Shield V3.3](docs/installazione_privacygpt_v33.gif)

### Esempio di utilizzo

La GIF seguente mostra il flusso consigliato in modalità manuale.

![Utilizzo PrivacyGPT Shield V3.3](docs/utilizzo_privacygpt_v33.gif)

---

## 🧠 Cosa fa

PrivacyGPT Shield intercetta il testo scritto o incollato in ChatGPT e lo anonimizza prima dell'invio.

Esempio:

```text
Mario Rossi <mario.rossi@example.com>
Tel: +39 333 1234567
Azienda Demo S.r.l.
Via Esempio 10, Roma
```

può diventare:

```text
[PERSON_1] <[EMAIL_1]>
Tel: [PHONE_1]
[COMPANY_1]
[ADDRESS_1]
```

---

## 🛡️ Funzioni principali

### 1. Modalità anonimizzazione

#### Semplice

Pensata per un uso prudente e con basso rischio di falsi positivi. Maschera soprattutto dati strutturati:

- email
- URL
- IP
- IBAN
- codice fiscale
- partita IVA
- telefoni

#### Legale

Pensata per email, contratti, documenti amministrativi e testi più delicati. Aggiunge controlli più estesi su:

- persone in contesti riconoscibili
- indirizzi
- aziende, se l'opzione è attiva
- date e orari
- firme email
- header email come `Da`, `A`, `Cc`, `From`, `To`
- server, username, password e database in contesti tecnici

---

### 2. Modalità intervento

#### Manuale, consigliata

Mostra un pulsante flottante:

```text
🔒 Anonimizza
```

Il testo viene modificato solo quando l'utente preme il pulsante. Dopo l'anonimizzazione puoi controllare il risultato e inviare manualmente.

#### Automatica

Replica il comportamento originario dell'estensione. Quando premi Invio o clicchi il pulsante di invio di ChatGPT, l'estensione prova ad anonimizzare il testo prima dell'invio.

---

### 3. Anonimizza aziende

Opzione per mascherare nomi di società, clienti e fornitori.

```text
Azienda Demo S.r.l. → [COMPANY_1]
```

---

### 4. Debug overlay

Mostra un riquadro tecnico nella pagina ChatGPT con:

- estensione attiva o meno
- modalità anonimizzazione
- modalità intervento
- editor rilevato
- numero di pattern trovati
- ultima azione eseguita

---

### 5. Test locale

La pagina `test.html` permette di provare il motore senza ChatGPT.

Il test locale usa solo dati fittizi e dimostrativi.

---

## 📦 Installazione locale

1. Scarica o clona il repository.
2. Apri Chrome.
3. Vai su `chrome://extensions`.
4. Attiva **Modalità sviluppatore**.
5. Clicca **Carica estensione non pacchettizzata**.
6. Seleziona la cartella del progetto.
7. Apri ChatGPT e ricarica la pagina.
8. Apri il popup dell'estensione e configura le opzioni.

Per una guida dettagliata consulta:

👉 [`docs/Guida_Installazione.md`](docs/Guida_Installazione.md)

---

## 🧪 Uso consigliato

Il flusso più sicuro è questo:

1. imposta **Modalità: Legale**
2. imposta **Intervento: Manuale**
3. attiva **Anonimizza aziende** se il testo contiene clienti, fornitori o partner
4. incolla il testo in ChatGPT
5. premi **🔒 Anonimizza**
6. controlla il testo trasformato
7. invia manualmente

---

## 📁 Struttura del progetto

```text
privacygpt-shield-extension/
  manifest.json
  content.js
  popup.html
  popup.js
  rules.js
  test.html
  test.js
  README.md
  PRIVACY_POLICY.md
  CHANGELOG.md
  RELEASE_NOTES_v3.3.0.md
  LICENSE
  assets/
    logo_master.png
    github_banner.png
    icon16.png
    icon32.png
    icon48.png
    icon128.png
  docs/
    Guida_Installazione.md
    Guida_GitHub.md
    Documentazione_Tecnica.md
    Esempio_Utilizzo.md
    installazione_privacygpt_v33.gif
    utilizzo_privacygpt_v33.gif
    privacygpt_shield_v33_demo.mp4
```

---

## 🔐 Privacy

PrivacyGPT Shield:

- elabora il testo localmente nel browser
- non invia il testo a server esterni
- non usa API esterne
- salva solo impostazioni locali tramite `chrome.storage.local`
- non richiede account o login

Per i dettagli consulta:

👉 [`PRIVACY_POLICY.md`](PRIVACY_POLICY.md)

---

## ⚠️ Limiti noti

PrivacyGPT Shield Extension V3.3 usa un motore locale basato su regole e regex.

È utile per ridurre il rischio di esposizione dati, ma non garantisce anonimizzazione perfetta in ogni contesto.

Sono possibili:

- falsi positivi
- falsi negativi
- risultati non perfetti su email thread molto lunghe
- necessità di controllo umano prima dell'invio

Per questo la modalità **Manuale** è consigliata.

---

## 🗺️ Roadmap

### V3.3

Versione stabile con motore regex locale, modalità manuale e automatica.

### V4.0

Possibile integrazione opzionale con un motore locale AI separato, basato su PrivacyGPT Local Engine.

---

## 👤 Autore

PrivacyGPT Shield Extension V3.3 è stato ideato e sviluppato da **Fabio Scialanga**.

---

## 📄 Licenza

Questo progetto include una licenza MIT di esempio. Personalizzala in base alle tue esigenze prima della pubblicazione definitiva.

---

<div align="center">

### 🔒 PrivacyGPT Shield Extension V3.3

**Proteggi i dati sensibili prima di dialogare con l'AI.**

</div>
