(function(){
  const STATE = {
    enabled: true,
    mode: 'legal',
    interventionMode: 'manual',
    debug: false,
    maskCompanies: false,
    last: { detected:false, matches:0, action:'loaded' }
  };

  let LAST_EDITOR = null;
  let MANUAL_BUTTON = null;

  function log(...args){
    if(STATE.debug) console.log('[PrivacyGPT Shield V3.3]', ...args);
  }

  function getModeLabel(){
    return STATE.mode === 'legal' ? 'Legal' : 'Simple';
  }

  function getInterventionLabel(){
    return STATE.interventionMode === 'auto' ? 'Automatic' : 'Manual';
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
    box.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:2147483646;background:#111827;color:#fff;font:12px Arial,sans-serif;border-radius:10px;padding:10px 12px;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:340px;line-height:1.35';
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

    body.innerHTML = `Active: <b>${STATE.enabled ? 'YES' : 'NO'}</b><br>Mode: <b>${getModeLabel()}</b><br>Intervention: <b>${getInterventionLabel()}</b><br>Companies: <b>${STATE.maskCompanies ? 'YES' : 'NO'}</b><br>Input detected: <b>${STATE.last.detected ? 'YES' : 'NO'}</b><br>Patterns matched: <b>${STATE.last.matches}</b><br>Last action: <b>${action || STATE.last.action}</b>`;
  }

  function setManualButtonText(text, ok){
    if(!MANUAL_BUTTON) return;
    MANUAL_BUTTON.textContent = text;
    MANUAL_BUTTON.style.background = ok === true ? '#065f46' : ok === false ? '#7f1d1d' : '#0f172a';
    window.clearTimeout(MANUAL_BUTTON._privacygptTimer);
    MANUAL_BUTTON._privacygptTimer = window.setTimeout(()=>{
      if(MANUAL_BUTTON){
        MANUAL_BUTTON.textContent = '🔒 Anonimizza';
        MANUAL_BUTTON.style.background = '#0f172a';
      }
    }, 1800);
  }

  function createManualButton(){
    let button = document.getElementById('privacygpt-manual-button');
    if(button){
      MANUAL_BUTTON = button;
      return button;
    }

    button = document.createElement('button');
    button.id = 'privacygpt-manual-button';
    button.type = 'button';
    button.textContent = '🔒 Anonimizza';
    button.style.cssText = 'position:fixed;right:18px;bottom:86px;z-index:2147483647;background:#0f172a;color:#fff;border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:10px 14px;font:13px Arial,sans-serif;box-shadow:0 8px 24px rgba(15,23,42,.35);cursor:pointer;display:none;user-select:none;';

    button.addEventListener('mousedown', (e)=>{
      e.preventDefault();
      e.stopPropagation();
    }, true);

    button.addEventListener('click', (e)=>{
      e.preventDefault();
      e.stopPropagation();

      setManualButtonText('⏳ Anonimizzo...', null);

      const active = findBestEditor();
      if(!active){
        STATE.last.detected = false;
        STATE.last.matches = 0;
        STATE.last.action = 'manual button: editor not found';
        updateOverlay(STATE.last.action);
        log('manual button: editor not found');
        setManualButtonText('Editor non trovato', false);
        return;
      }

      rememberEditor(active);
      const ok = processEditor(active, 'Manual button');

      if(ok){
        STATE.last.action = 'manual anonymize completed';
        updateOverlay(STATE.last.action);
        setManualButtonText(`✅ Anonimizzato (${STATE.last.matches})`, true);
      } else {
        const hasText = !!getText(active).trim();
        STATE.last.action = hasText ? 'manual anonymize: no matches' : 'manual anonymize: empty input';
        updateOverlay(STATE.last.action);
        setManualButtonText(hasText ? 'Nessun dato trovato' : 'Testo vuoto', false);
      }
    }, true);

    document.documentElement.appendChild(button);
    MANUAL_BUTTON = button;
    return button;
  }

  function updateManualButton(){
    const button = createManualButton();
    const editors = getEditors();
    const show = STATE.enabled && STATE.interventionMode === 'manual' && editors.length > 0;

    // The manual button must remain visible even when Debug overlay is active.
    // Keep it above the overlay and move it higher to avoid visual overlap.
    button.style.zIndex = '2147483647';
    button.style.bottom = STATE.debug ? '172px' : '86px';
    button.style.display = show ? 'block' : 'none';
  }

  function loadSettings(){
    if (!chrome?.storage?.local) return;
    chrome.storage.local.get(['enabled','mode','legalMode','interventionMode','debug','maskCompanies'], (v)=>{
      STATE.enabled = v.enabled !== false;
      STATE.mode = v.mode || (v.legalMode === false ? 'simple' : 'legal');
      STATE.interventionMode = v.interventionMode || 'manual';
      STATE.debug = !!v.debug;
      STATE.maskCompanies = !!v.maskCompanies;
      updateManualButton();
      updateOverlay('settings loaded');
      log('settings', JSON.stringify({
        enabled: STATE.enabled,
        mode: STATE.mode,
        interventionMode: STATE.interventionMode,
        debug: STATE.debug,
        maskCompanies: STATE.maskCompanies
      }));
    });
  }

  function isPrivacyGPTElement(n){
    return !!(n && n.closest && (n.closest('#privacygpt-manual-button') || n.closest('#privacygpt-debug-overlay')));
  }

  function isUsableEditor(n){
    if(!n || !n.isConnected || isPrivacyGPTElement(n)) return false;
    const isEditor = n.matches && (
      n.matches('textarea') ||
      n.matches('div[contenteditable="true"]') ||
      n.matches('[contenteditable="true"]') ||
      n.matches('[data-testid="prompt-textarea"]') ||
      n.matches('#prompt-textarea')
    );
    if(!isEditor) return false;
    const rect = n.getBoundingClientRect();
    const visible = rect.width > 0 && rect.height > 0;
    const style = window.getComputedStyle(n);
    return visible && style.visibility !== 'hidden' && style.display !== 'none';
  }

  function rememberEditor(n){
    if(isUsableEditor(n)) LAST_EDITOR = n;
  }

  function getEditors(){
    const selectors = [
      '[data-testid="prompt-textarea"]',
      '#prompt-textarea',
      'textarea',
      'div[contenteditable="true"]',
      '[contenteditable="true"]'
    ];
    const nodes = [];
    selectors.forEach(sel => document.querySelectorAll(sel).forEach(n => nodes.push(n)));

    return [...new Set(nodes)]
      .filter(isUsableEditor)
      .sort((a,b)=>{
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return ar.top - br.top;
      });
  }

  function findBestEditor(){
    const active = document.activeElement;
    if(isUsableEditor(active)) return active;

    if(active && active.closest){
      const closest = active.closest('[data-testid="prompt-textarea"], #prompt-textarea, textarea, div[contenteditable="true"], [contenteditable="true"]');
      if(isUsableEditor(closest)) return closest;
    }

    if(isUsableEditor(LAST_EDITOR)) return LAST_EDITOR;

    const editors = getEditors();
    if(!editors.length) return null;

    const withText = editors.filter(e => getText(e).trim().length > 0);
    return withText[withText.length - 1] || editors[editors.length - 1];
  }

  function getText(el){
    if(!el) return '';
    if('value' in el) return el.value || '';
    return el.innerText || el.textContent || '';
  }

  function dispatchEditorEvents(el, text){
    try { el.dispatchEvent(new InputEvent('beforeinput', {bubbles:true, cancelable:true, inputType:'insertText', data:text})); } catch(e) {}
    try { el.dispatchEvent(new InputEvent('input', {bubbles:true, inputType:'insertText', data:text})); } catch(e) { el.dispatchEvent(new Event('input', {bubbles:true})); }
    try { el.dispatchEvent(new Event('change', {bubbles:true})); } catch(e) {}
  }

  function setText(el, text){
    if(!el) return false;
    rememberEditor(el);

    if('value' in el){
      el.focus();
      el.value = text;
      dispatchEditorEvents(el, text);
      return true;
    }

    el.focus();

    // Prefer direct content update for ChatGPT contenteditable nodes because clicking
    // the floating button can steal the current selection from the editor.
    try {
      el.textContent = text;
      dispatchEditorEvents(el, text);
      return true;
    } catch(e) {
      try {
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, text);
        dispatchEditorEvents(el, text);
        return true;
      } catch(err) {
        log('setText failed', err);
        return false;
      }
    }
  }

  function processEditor(el, reason){
    if(!STATE.enabled){
      STATE.last.action = 'extension disabled';
      updateOverlay(STATE.last.action);
      return false;
    }

    if(!window.PrivacyGPTRules || typeof window.PrivacyGPTRules.anonymizeText !== 'function'){
      STATE.last.action = 'rules engine not loaded';
      updateOverlay(STATE.last.action);
      log('rules engine not loaded');
      return false;
    }

    rememberEditor(el);

    const original = getText(el);
    STATE.last.detected = !!original;

    if(!original || original.trim().length < 3){
      STATE.last.matches = 0;
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
      const written = setText(el, result.text);
      STATE.last.action = written ? `replaced via ${reason}` : `replace failed via ${reason}`;
      log('processed', {reason, written, matches: result.matches, before: original, after: result.text});
      updateOverlay(STATE.last.action);
      return written;
    }

    STATE.last.action = `no matches via ${reason}`;
    log('no replacements', {reason, text: original});
    updateOverlay(STATE.last.action);
    return false;
  }

  function attachListeners(){
    document.addEventListener('focusin', (e)=>{
      const n = e.target;
      if(isUsableEditor(n)) rememberEditor(n);
      else if(n?.closest){
        const closest = n.closest('[data-testid="prompt-textarea"], #prompt-textarea, textarea, div[contenteditable="true"], [contenteditable="true"]');
        if(isUsableEditor(closest)) rememberEditor(closest);
      }
      updateManualButton();
    }, true);

    document.addEventListener('input', (e)=>{
      const n = e.target;
      if(isUsableEditor(n)) rememberEditor(n);
      else if(n?.closest){
        const closest = n.closest('[data-testid="prompt-textarea"], #prompt-textarea, textarea, div[contenteditable="true"], [contenteditable="true"]');
        if(isUsableEditor(closest)) rememberEditor(closest);
      }
    }, true);

    document.addEventListener('keydown', (e)=>{
      const n = e.target;
      if(isUsableEditor(n)) rememberEditor(n);
      if(STATE.interventionMode !== 'auto') return;
      if(e.key === 'Enter' && !e.shiftKey){
        const active = findBestEditor();
        if(active) processEditor(active, 'Enter');
      }
    }, true);

    document.addEventListener('click', (e)=>{
      const n = e.target;
      if(isUsableEditor(n)) rememberEditor(n);
      else if(n?.closest){
        const closest = n.closest('[data-testid="prompt-textarea"], #prompt-textarea, textarea, div[contenteditable="true"], [contenteditable="true"]');
        if(isUsableEditor(closest)) rememberEditor(closest);
      }

      if(STATE.interventionMode !== 'auto') return;
      const target = e.target;
      const isSend = target && (
        target.closest('button[data-testid*="send"]') ||
        target.closest('button[aria-label*="Send"]') ||
        target.closest('button[aria-label*="Invia"]')
      );
      if(isSend){
        const active = findBestEditor();
        if(active) processEditor(active, 'Send button');
      }
    }, true);

    setInterval(()=>{
      const editors = getEditors();
      STATE.last.detected = editors.length > 0;
      if(!isUsableEditor(LAST_EDITOR) && editors.length) LAST_EDITOR = editors[editors.length - 1];
      updateManualButton();
      updateOverlay(editors.length ? 'editor found' : 'waiting editor');
    }, 1500);
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
        hasLastEditor: !!isUsableEditor(LAST_EDITOR),
        enabled: STATE.enabled,
        mode: STATE.mode,
        interventionMode: STATE.interventionMode,
        debug: STATE.debug,
        maskCompanies: STATE.maskCompanies,
        firstNamesDictionary: !!window.PrivacyGPTFirstNames,
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

  createManualButton();
  loadSettings();
  attachListeners();
  log('content script loaded', location.href);
  updateOverlay('content loaded');
})();
