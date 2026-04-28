(function(){
  const STATE = {
    enabled: true,
    mode: 'legal',
    interventionMode: 'manual',
    debug: true,
    maskCompanies: false,
    last: { detected:false, matches:0, action:'loaded' }
  };

  const MANUAL_BUTTON_ID = 'privacygpt-manual-anonymize-button';

  function log(...args){
    if(STATE.debug) console.log('[PrivacyGPT Shield V3.3]', ...args);
  }

  function getModeLabel(){
    return STATE.mode === 'legal' ? 'Legal' : 'Simple';
  }

  function getInterventionLabel(){
    return STATE.interventionMode === 'auto' ? 'Auto' : 'Manual';
  }

  function removeOverlay(){
    const box = document.getElementById('privacygpt-debug-overlay');
    if(box) box.remove();
  }

  function createOverlay(){
    if(!STATE.debug) return;
    if(document.getElementById('privacygpt-debug-overlay')) return;

    const box = document.createElement('div');
    box.id = 'privacygpt-debug-overlay';
    box.style.cssText = 'position:fixed;right:14px;bottom:74px;z-index:2147483647;background:#111827;color:#fff;font:12px Arial,sans-serif;border-radius:10px;padding:10px 12px;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:320px;line-height:1.35';
    box.innerHTML = '<b>PrivacyGPT Debug</b><div id="privacygpt-debug-body">loading...</div>';
    document.documentElement.appendChild(box);
  }

  function updateOverlay(action){
    if(!STATE.debug){
      removeOverlay();
      return;
    }

    createOverlay();
    const body = document.getElementById('privacygpt-debug-body');
    if(!body) return;

    body.innerHTML = `Active: <b>${STATE.enabled ? 'YES' : 'NO'}</b><br>Mode: <b>${getModeLabel()}</b><br>Intervention: <b>${getInterventionLabel()}</b><br>Input detected: <b>${STATE.last.detected ? 'YES' : 'NO'}</b><br>Patterns matched: <b>${STATE.last.matches}</b><br>Last action: <b>${action || STATE.last.action}</b>`;
  }

  function removeManualButton(){
    const button = document.getElementById(MANUAL_BUTTON_ID);
    if(button) button.remove();
  }

  function ensureManualButton(){
    if(!STATE.enabled || STATE.interventionMode !== 'manual'){
      removeManualButton();
      return;
    }

    let button = document.getElementById(MANUAL_BUTTON_ID);
    if(button) return;

    button = document.createElement('button');
    button.id = MANUAL_BUTTON_ID;
    button.type = 'button';
    button.textContent = '🔒 Anonimizza';
    button.title = 'Anonimizza il testo prima di inviarlo';
    button.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:2147483647;background:#111827;color:#fff;border:0;border-radius:999px;padding:11px 15px;font:13px Arial,sans-serif;font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.25)';
    button.addEventListener('click', ()=>{
      const editors = getEditors();
      const active = editors.includes(document.activeElement) ? document.activeElement : editors[editors.length-1];
      if(active){
        processEditor(active, 'Manual button');
      } else {
        STATE.last.action = 'manual button: no editor found';
        updateOverlay(STATE.last.action);
      }
    });
    document.documentElement.appendChild(button);
  }

  function loadSettings(){
    if (!chrome?.storage?.local) return;
    chrome.storage.local.get(['enabled','mode','legalMode','interventionMode','debug','maskCompanies'], (v)=>{
      STATE.enabled = v.enabled !== false;
      STATE.mode = v.mode || (v.legalMode === false ? 'simple' : 'legal');
      STATE.interventionMode = v.interventionMode || 'manual';
      STATE.debug = v.debug !== false;
      STATE.maskCompanies = !!v.maskCompanies;
      ensureManualButton();
      updateOverlay('settings loaded');
      log('settings', JSON.stringify(STATE));
    });
  }

  function getEditors(){
    const selectors = [
      'div[contenteditable="true"]',
      'textarea',
      '[data-testid="prompt-textarea"]',
      '#prompt-textarea'
    ];
    const nodes = [];
    selectors.forEach(sel => document.querySelectorAll(sel).forEach(n => nodes.push(n)));
    return [...new Set(nodes)].filter(n => n && n.offsetParent !== null);
  }

  function getText(el){
    if(!el) return '';
    if('value' in el) return el.value || '';
    return el.innerText || el.textContent || '';
  }

  function setText(el, text){
    if(!el) return false;
    if('value' in el){
      el.value = text;
      el.dispatchEvent(new Event('input', {bubbles:true}));
      el.dispatchEvent(new Event('change', {bubbles:true}));
      return true;
    }

    el.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, text);
    el.dispatchEvent(new InputEvent('input', {bubbles:true, inputType:'insertText', data:text}));
    return true;
  }

  function processEditor(el, reason){
    if(!STATE.enabled || !window.PrivacyGPTRules) return false;

    const original = getText(el);
    STATE.last.detected = !!original;

    if(!original || original.trim().length < 3){
      STATE.last.action = 'empty input';
      updateOverlay(STATE.last.action);
      return false;
    }

    const result = window.PrivacyGPTRules.anonymizeText(original, {
      mode: STATE.mode,
      legalMode: STATE.mode === 'legal',
      maskCompanies: STATE.maskCompanies
    });

    STATE.last.matches = result.matches.length;

    if(result.text !== original){
      setText(el, result.text);
      STATE.last.action = `replaced via ${reason}`;
      log('processed', {reason, matches: result.matches, before: original, after: result.text});
      updateOverlay(STATE.last.action);
      return true;
    }

    STATE.last.action = `no matches via ${reason}`;
    log('no replacements', {reason, text: original});
    updateOverlay(STATE.last.action);
    return false;
  }

  function attachListeners(){
    document.addEventListener('keydown', (e)=>{
      if(STATE.interventionMode !== 'auto') return;
      if(e.key === 'Enter' && !e.shiftKey){
        const editors = getEditors();
        const active = editors.includes(document.activeElement) ? document.activeElement : editors[editors.length-1];
        if(active) processEditor(active, 'Enter');
      }
    }, true);

    document.addEventListener('click', (e)=>{
      if(STATE.interventionMode !== 'auto') return;
      const target = e.target;
      const isSend = target && (
        target.closest('button[data-testid*="send"]') ||
        target.closest('button[aria-label*="Send"]') ||
        target.closest('button[aria-label*="Invia"]')
      );
      if(isSend){
        const editors = getEditors();
        if(editors.length) processEditor(editors[editors.length-1], 'Send button');
      }
    }, true);

    setInterval(()=>{
      const editors = getEditors();
      STATE.last.detected = editors.length > 0;
      ensureManualButton();
      updateOverlay(editors.length ? 'editor found' : 'waiting editor');
    }, 2500);
  }

  chrome.runtime?.onMessage?.addListener((msg, sender, sendResponse)=>{
    if(msg?.type === 'RUN_DIAGNOSTICS'){
      const editors = getEditors();
      const sample = 'Laura Bianchi, Marco Rossi, nato a Torino il 14.03.1982, con sede legale in Via delle Magnolie 25, 20100 Milano, email demo.privacy@example.com, phone +39 347 123 4567, IBAN IT60X0542811101000000123456';
      const res = window.PrivacyGPTRules?.anonymizeText(sample, {
        mode: STATE.mode,
        legalMode: STATE.mode === 'legal',
        maskCompanies: STATE.maskCompanies
      });

      sendResponse({
        loaded: true,
        version: '3.3.0',
        url: location.href,
        editorsFound: editors.length,
        enabled: STATE.enabled,
        mode: STATE.mode,
        interventionMode: STATE.interventionMode,
        debug: STATE.debug,
        maskCompanies: STATE.maskCompanies,
        sampleMatches: res?.matches?.length || 0,
        sampleOutput: res?.text || null
      });
      return true;
    }

    if(msg?.type === 'RELOAD_SETTINGS'){
      loadSettings();
      sendResponse({ok:true});
      return true;
    }
  });

  loadSettings();
  attachListeners();
  log('content script loaded', location.href);
  updateOverlay('content loaded');
})();
