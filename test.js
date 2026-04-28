(function(){
  function byId(id){
    return document.getElementById(id);
  }

  function setStatus(message, kind){
    const status = byId('status');
    if(!status) return;
    status.textContent = message;
    status.className = 'status' + (kind ? ' ' + kind : '');
  }

  function runAnonymize(){
    const output = byId('output');
    const log = byId('log');

    try {
      if(!window.PrivacyGPTRules || typeof window.PrivacyGPTRules.anonymizeText !== 'function'){
        throw new Error('rules.js non è stato caricato. Verifica che test.html, test.js e rules.js siano nella stessa cartella.');
      }

      const input = byId('input').value;
      const mode = byId('mode').value;
      const maskCompanies = byId('maskCompanies').checked;

      const res = window.PrivacyGPTRules.anonymizeText(input, {
        mode: mode,
        maskCompanies: maskCompanies
      });

      output.value = res.text;
      log.textContent = JSON.stringify(res.matches, null, 2);
      setStatus('Test eseguito correttamente. Match trovati: ' + res.matches.length, 'ok');
    } catch (err) {
      output.value = '';
      log.textContent = String(err && err.stack ? err.stack : err);
      setStatus('Errore nel test locale: ' + (err && err.message ? err.message : err), 'err');
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    const button = byId('run');
    if(button){
      button.addEventListener('click', runAnonymize);
    }

    if(window.PrivacyGPTRules && typeof window.PrivacyGPTRules.anonymizeText === 'function'){
      setStatus('Motore caricato. Premi Anonimizza per eseguire il test.', 'ok');
    } else {
      setStatus('Motore non caricato. Se hai aperto il file da uno ZIP, estrai prima tutta la cartella.', 'err');
    }
  });
})();
