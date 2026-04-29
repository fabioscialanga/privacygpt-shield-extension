const ids = ['enabled','mode','interventionMode','debug','maskCompanies'];

function out(v){
  document.getElementById('out').textContent = typeof v === 'string' ? v : JSON.stringify(v, null, 2);
}

chrome.storage.local.get(['enabled','mode','legalMode','interventionMode','debug','maskCompanies'], (v)=>{
  document.getElementById('enabled').checked = v.enabled !== false;
  document.getElementById('mode').value = v.mode || (v.legalMode === false ? 'simple' : 'legal');
  document.getElementById('interventionMode').value = v.interventionMode || 'manual';
  document.getElementById('debug').checked = !!v.debug;
  document.getElementById('maskCompanies').checked = !!v.maskCompanies;
});

document.getElementById('save').onclick = ()=>{
  const settings = {
    enabled: document.getElementById('enabled').checked,
    mode: document.getElementById('mode').value,
    interventionMode: document.getElementById('interventionMode').value,
    debug: document.getElementById('debug').checked,
    maskCompanies: document.getElementById('maskCompanies').checked
  };

  chrome.storage.local.set(settings, ()=>{
    out('Impostazioni salvate. Ricarica la pagina ChatGPT oppure premi Run diagnostics.');
    chrome.tabs.query({active:true,currentWindow:true}, tabs=>{
      if(tabs[0]?.id){
        chrome.tabs.sendMessage(tabs[0].id, {type:'RELOAD_SETTINGS'}, ()=>{});
      }
    });
  });
};

document.getElementById('diag').onclick = ()=>{
  chrome.tabs.query({active:true,currentWindow:true}, tabs=>{
    if(!tabs[0]?.id) return out('Nessuna tab attiva.');
    chrome.tabs.sendMessage(tabs[0].id, {type:'RUN_DIAGNOSTICS'}, (res)=>{
      if(chrome.runtime.lastError) out('Errore: apri ChatGPT, ricarica la pagina e riprova. Dettaglio: ' + chrome.runtime.lastError.message);
      else out(res);
    });
  });
};

document.getElementById('local').onclick = ()=> chrome.tabs.create({url: chrome.runtime.getURL('test.html')});
