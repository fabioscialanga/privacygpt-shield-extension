(function(){
  const counters = {};

  function nextToken(type){
    counters[type] = (counters[type] || 0) + 1;
    return `[${type}_${counters[type]}]`;
  }

  function resetCounters(){
    Object.keys(counters).forEach(k => delete counters[k]);
  }

  function tokenFor(type, original, matches){
    const token = nextToken(type);
    matches.push({ type, original, token });
    return token;
  }

  function replaceWithLog(text, type, regex, matches){
    return text.replace(regex, (m) => tokenFor(type, m, matches));
  }

  const companySuffix = "(?:S\\.?r\\.?l\\.?|SRL|S\\.?p\\.?A\\.?|SPA|SAS|SNC|LLC|LTD|GmbH|AG|SA|BV|NV|Inc\\.?|Corp\\.?)";
  const streetWords = "(?:via|viale|piazza|p\\.?zza|corso|largo|strada|vicolo|piazzale|avenue|ave\\.?|street|st\\.?|road|rd\\.?|square|sq\\.?|boulevard|blvd\\.?|lane|ln\\.?|drive|dr\\.?|rue|allee|straße|strasse|platz|calle|plaza|ronda)";
  const capWord = "(?:[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’]{1,}|[A-ZÀ-ÖØ-Þ]{2,})";
  const nameParticle = "(?:[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’]{1,}|[A-ZÀ-ÖØ-Þ]{2,})";

  const roleWords = /\b(?:amministrazione|finanza|controllo|responsabile|ufficio|acquisti|sistemista|project\s+manager|pmo|direttore|amministratore|commerciale|vendite|supporto|consulente|account|delivery|manager|segreteria|hr|risorse\s+umane|global\s+workplace\s+solutions)\b/i;
  const greetingWords = /\b(?:ciao|buongiorno|buonasera|salve|gentile|egregio|cara|caro|grazie|saluti|cordiali\s+saluti)\b/i;
  const headerWords = /^(?:Da|A|Cc|Ccn|From|To|Bcc|Sent|Inviato|Oggetto|Subject):/im;
  const stopPerson = new Set(['Cordiali Saluti','Buona Giornata','Buon Lavoro','Serena Pasqua','Project Manager','Data Systems','Privacy Shield','Chrome Extension','Global Workplace Solutions']);
  const weakSingleNameStop = new Set(['roma','milano','napoli','italia','marche','maggio','aprile','marzo','lunedì','martedì','mercoledì','giovedì','venerdì','sabato','domenica','teams','gamma','pec']);
  const companyAcronymStop = new Set(['RE','R','FW','FWD','PEC','GDPR','IASS','IAAS','DB','IP','URL','HTTP','HTTPS','PMO']);

  function normalizeWord(w){
    return String(w || '').toLocaleLowerCase('it-IT').replace(/[.,;:!?()\[\]{}<>"“”'’]/g, '').trim();
  }

  function isFirstName(w){
    const normalized = normalizeWord(w);
    return !!window.PrivacyGPTFirstNames && window.PrivacyGPTFirstNames.has(normalized);
  }

  function looksLikeNamePart(w){
    return /^[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’]{1,}$/.test(w) || /^[A-ZÀ-ÖØ-Þ]{2,}$/.test(w);
  }

  function stripPlaceholders(s){
    return String(s || '').replace(/\[[A-Z_]+_\d+\]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function cleanDisplayName(value){
    let clean = String(value || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\[[A-Z_]+_\d+\]/g, ' ')
      .replace(/^['"“”]+|['"“”]+$/g, '')
      .replace(/\s+@\s*[A-ZÀ-ÖØ-Þa-zà-öø-ÿ0-9_-]+\b/g, ' ')
      .replace(/\b@[A-ZÀ-ÖØ-Þa-zà-öø-ÿ0-9_-]+\b/g, ' ')
      .replace(/\s+-\s+[^;<>\n]+$/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    clean = clean.replace(/[,;:]+$/g, '').trim();
    return clean;
  }

  function isEmailThread(text){
    const headerCount = (String(text).match(/^(?:Da|A|Cc|Ccn|From|To|Sent|Inviato|Oggetto|Subject):/gmi) || []).length;
    const emailCount = (String(text).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).length;
    return headerCount >= 2 || emailCount >= 3;
  }

  function shouldMaskPerson(candidate, context){
    const clean = cleanDisplayName(candidate);
    if(!clean || stopPerson.has(clean)) return false;
    if(/^\[.+_\d+\]$/.test(clean)) return false;
    if(/[0-9:/\\]|https?|www\./i.test(clean)) return false;
    if(/\b(?:Srl|SRL|Spa|SPA|S\.r\.l\.|S\.p\.A\.)\b/.test(clean)) return false;
    if(roleWords.test(clean) || greetingWords.test(clean)) return false;

    const ctx = String(context || '');

    // Cognome, Nome nei destinatari Outlook: “Rossi, Mario @Roma”.
    const commaParts = clean.split(',').map(x => x.trim()).filter(Boolean);
    if(commaParts.length === 2){
      const left = commaParts[0].split(/\s+/).filter(Boolean);
      const right = commaParts[1].split(/\s+/).filter(Boolean);
      if(left.length >= 1 && left.length <= 2 && right.length >= 1 && right.length <= 2 && left.concat(right).every(looksLikeNamePart)){
        if(/header|mention|email/.test(ctx)) return true;
        if(right.some(isFirstName)) return true;
      }
    }

    const parts = clean.split(/\s+/).filter(Boolean);
    if(parts.length === 0 || parts.length > 4) return false;
    if(parts.some(p => !looksLikeNamePart(p))) return false;

    const first = parts[0];
    let score = 0;

    if(isFirstName(first)) score += 3;
    if(parts.length >= 2) score += 2;
    if(/header|email|signature|greeting|mention|role|single-context/.test(ctx)) score += 2;
    if(parts.length === 1 && isFirstName(first) && /greeting|mention|single-context/.test(ctx)) score += 2;
    if(parts.length === 1 && !isFirstName(first) && /greeting/.test(ctx)) score += 2;
    if(parts.length === 1 && weakSingleNameStop.has(normalizeWord(first))) score -= 5;
    if(/^[A-ZÀ-ÖØ-Þ]{2,}$/.test(clean) && parts.length === 1) score -= 2;

    // In header o menzioni, anche un display name Nome Cognome non presente nel dizionario è molto probabile.
    if(parts.length >= 2 && /header|mention|email/.test(ctx)) score += 2;

    return score >= 4;
  }

  function maskPersonCandidate(candidate, matches, context){
    if(!shouldMaskPerson(candidate, context)) return candidate;
    return tokenFor('PERSON', candidate, matches);
  }

  function replacePhoneCarefully(text, matches){
    const phoneRegex = /(?:\+\d{1,3}[\s./-]?)?(?:\(?\d{2,4}\)?[\s./-]?){2,5}\d{2,4}\b/g;
    return text.replace(phoneRegex, (m, offset, whole) => {
      const before = whole.slice(Math.max(0, offset - 60), offset);
      const after = whole.slice(offset, Math.min(whole.length, offset + m.length + 30));
      if(/GDPR\s*n\.?\s*$/i.test(before)) return m;
      if(/Regolamento\s+Europeo\s+GDPR/i.test(before)) return m;
      if(/(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)[,\s]*$/i.test(before) && /^\d{4}\s+\d{1,2}[:.]/.test(after)) return m;
      if(/^\d{4}$/.test(m.trim())) return m;
      return tokenFor('PHONE', m, matches);
    });
  }

  function replaceEmailHeaderPeople(text, matches){
    const headerLine = /^((?:Da|A|Cc|Ccn|From|To|Bcc):\s*)(.+)$/gmi;
    return text.replace(headerLine, (full, prefix, rest) => {
      const replaced = rest.replace(/(^|;\s*|,\s*)([^;<\n]{2,120}?)(?=\s*<\[EMAIL_\d+\]>|\s*<[^>]+>)/g, (m, sep, person) => {
        const clean = cleanDisplayName(person);
        return sep + maskPersonCandidate(clean, matches, 'header email');
      });
      return prefix + replaced;
    });
  }

  function replaceQuotedWriter(text, matches){
    return text.replace(/\b([^<\n]{2,120}?)\s*<\[EMAIL_\d+\]>\s+(?:ha scritto|wrote|scrive|wrote:)\b/gi, (full, person) => {
      const clean = cleanDisplayName(person);
      return full.replace(person, maskPersonCandidate(clean, matches, 'header email'));
    });
  }

  function replaceGreetingPeople(text, matches){
    return text.replace(/\b(Ciao|Buongiorno|Buonasera|Salve|Gentile|Egregio|Cara|Caro)\s+([A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’]{2,}(?:\s+[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’]{2,}){0,2})(?=\s*[,\n])/g, (full, greet, person) => {
      return greet + ' ' + maskPersonCandidate(person, matches, 'greeting');
    });
  }

  function replaceMentionPeople(text, matches){
    text = text.replace(/@\s*([A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’]{2,}\s*,\s*[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’]{2,}(?:\s+@[A-ZÀ-ÖØ-Þa-zà-öø-ÿ0-9_-]+)?)/g, (full, person) => {
      return '@' + maskPersonCandidate(cleanDisplayName(person), matches, 'mention');
    });
    return text.replace(/@\s*([A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’]{1,}(?:\s+[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’]{1,}){0,3})\b/g, (full, person) => {
      return '@' + maskPersonCandidate(cleanDisplayName(person), matches, 'mention');
    });
  }

  function replaceSingleNamesInEmailThread(text, matches, emailThreadMode){
    if(!emailThreadMode) return text;
    return text.replace(/\b(a|ad|di|da|con|per|verso|su)\s+([A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’]{2,})(?=\b)/g, (full, prep, name) => {
      if(!isFirstName(name)) return full;
      if(weakSingleNameStop.has(normalizeWord(name))) return full;
      return prep + ' ' + tokenFor('PERSON', name, matches);
    });
  }


  function replaceStandaloneCommaPeople(text, matches, emailThreadMode){
    if(!emailThreadMode) return text;
    return text.replace(/^\s*([A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’]{2,}\s*,\s*[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’]{2,}(?:\s+@[A-ZÀ-ÖØ-Þa-zà-öø-ÿ0-9_-]+)?)\s*$/gm, (full, person) => {
      const clean = cleanDisplayName(person);
      if(!shouldMaskPerson(clean, 'header email')) return full;
      return full.replace(person, tokenFor('PERSON', clean, matches));
    });
  }

  function replaceSignaturePeople(text, matches){
    const lines = text.split(/\n/);
    for(let i = 0; i < lines.length; i++){
      const original = lines[i];
      const trimmed = original.trim();
      if(!trimmed || /^\[.+_\d+\]$/.test(trimmed)) continue;
      if(trimmed.length > 90) continue;
      if(/[<@:/\\]||\d/.test(trimmed)) continue;

      const prevBlock = lines.slice(Math.max(0, i - 7), i).join(' ');
      const nextBlock = lines.slice(i + 1, Math.min(lines.length, i + 6)).join(' ');
      const contextIsSignature = greetingWords.test(prevBlock) || roleWords.test(nextBlock) || /\b(?:tel\.?|fax|cell\.?|email|www\.|http|via|viale|piazza|project\s+manager)\b/i.test(nextBlock);

      if(!contextIsSignature) continue;

      const candidate = trimmed.replace(/^[-–—•\s]+/, '').replace(/[,;:.]+$/, '');
      if(shouldMaskPerson(candidate, 'signature role')){
        lines[i] = original.replace(candidate, tokenFor('PERSON', candidate, matches));
      }
    }
    return lines.join('\n');
  }

  function replaceSubjectCompanies(text, matches){
    return text.replace(/^(\s*(?:Oggetto|Subject):\s*)(.+)$/gmi, (full, prefix, subject) => {
      let updated = subject;
      updated = updated.replace(/\b([A-ZÀ-ÖØ-Þ][A-ZÀ-ÖØ-Þ0-9&.'-]{2,})(?=\b)/g, (m) => {
        if(companyAcronymStop.has(m.toUpperCase())) return m;
        return tokenFor('COMPANY', m, matches);
      });
      updated = updated.replace(/\b(Importante\s+)([A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÖØ-öø-ÿ0-9&.'-]{2,40})(?=\s*[-–:])/g, (m, lead, company) => {
        if(/\[COMPANY_\d+\]/.test(company)) return m;
        return lead + tokenFor('COMPANY', company, matches);
      });
      return prefix + updated;
    });
  }

  function replaceGenericCompanies(text, matches){
    const companyRegex = new RegExp("\\b[A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÖØ-öø-ÿ0-9 &'’.]+?\\s+" + companySuffix + "\\b", 'g');
    text = replaceWithLog(text, 'COMPANY', companyRegex, matches);

    // Linee tipo “ACME | Global Workplace Solutions”.
    text = text.replace(/^\s*([A-Z][A-Z0-9&.'-]{2,12})(\s*\|\s*[^\n]+)$/gm, (full, acronym) => {
      if(companyAcronymStop.has(acronym.toUpperCase())) return full;
      return tokenFor('COMPANY', full.trim(), matches);
    });

    // Domini citati come brand, es. “ACME.com”.
    text = text.replace(/\b([A-Z][A-Z0-9&.'-]{2,12})(\.com)\b/g, (full, brand, tld) => {
      if(companyAcronymStop.has(brand.toUpperCase())) return full;
      return tokenFor('COMPANY', brand, matches) + tld;
    });

    // Aziende isolate su riga singola, escludendo ruoli e saluti.
    text = text.replace(/^\s*([A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÖØ-öø-ÿ0-9 &'’.]{2,60})\s*$/gm, (full, company) => {
      if(/\[.+_\d+\]/.test(company)) return full;
      if(roleWords.test(company) || greetingWords.test(company)) return full;
      if(shouldMaskPerson(company, 'signature')) return full.replace(company, tokenFor('PERSON', company.trim(), matches));
      if(company.split(/\s+/).length > 5) return full;
      return full.replace(company, tokenFor('COMPANY', company.trim(), matches));
    });

    return text;
  }

  function anonymizeText(input, options = {}){
    resetCounters();

    let text = String(input || '');
    const matches = [];
    const mode = options.mode || (options.legalMode === false ? 'simple' : 'legal');
    const legalMode = mode === 'legal';
    const maskCompanies = !!options.maskCompanies;
    const emailThreadMode = isEmailThread(text) || !!options.emailThreadMode;

    // Date e orari prima dei telefoni, per evitare falsi positivi su Outlook/GDPR.
    text = replaceWithLog(text, 'DATETIME', /\b(?:lun(?:edì)?|mar(?:tedì)?|mer(?:coledì)?|gio(?:vedì)?|ven(?:erdì)?|sab(?:ato)?|dom(?:enica)?|monday|tuesday|wednesday|thursday|friday|saturday|sunday)[,\s]+\d{1,2}\s+(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[,\s]+\d{4}\s+\d{1,2}[:.]\d{2}\b/gi, matches);
    text = replaceWithLog(text, 'DATETIME', /\b\d{1,2}\s+(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)[,\s]+\d{4}\s+\d{1,2}[:.]\d{2}\b/gi, matches);
    text = replaceWithLog(text, 'DATE', /\b\d{1,2}\s+(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+\d{4}\b/gi, matches);
    text = replaceWithLog(text, 'DATE', /\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/g, matches);
    text = replaceWithLog(text, 'TIME', /\b(?:[01]?\d|2[0-3])[:.]\d{2}\b/g, matches);

    // Identificatori strutturati.
    text = replaceWithLog(text, 'EMAIL', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, matches);
    text = replaceWithLog(text, 'IBAN', /\b[A-Z]{2}\d{2}[A-Z0-9 ]{11,34}\b/g, matches);
    text = replaceWithLog(text, 'URL', /\b(?:https?:\/\/|www\.)[^\s)<>]+/gi, matches);
    text = replaceWithLog(text, 'SERVER', /\b(?:\d{1,3}\.){3}\d{1,3}:\d{2,5}\b/g, matches);
    text = replaceWithLog(text, 'IP', /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, matches);
    text = replaceWithLog(text, 'CF', /\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/gi, matches);
    text = replaceWithLog(text, 'PIVA', /\b(?:IT)?\d{11}\b/g, matches);

    // Credenziali tecniche evidenti in contesto.
    text = text.replace(/\b(?:username|utente|user|login)\s*[:=]\s*([^\n\r]{3,80})/gi, (full, value) => full.replace(value, tokenFor('USERNAME', value.trim(), matches)));
    text = text.replace(/\b(?:password|pwd|pass)\s*[:=]\s*([^\n\r]{3,80})/gi, (full, value) => full.replace(value, tokenFor('PASSWORD', value.trim(), matches)));
    text = text.replace(/\b(?:database|db)\s+(?:da utilizzare|si chiama|name|nome)?\s*:?\s*([A-Z0-9_]{4,})\b/gi, (full, value) => full.replace(value, tokenFor('DATABASE', value.trim(), matches)));

    text = replacePhoneCarefully(text, matches);

    if (legalMode) {
      text = replaceWithLog(text, 'BIRTHDATE', /\b(?:nato|nata|born)\s+(?:a|in)?\s*[A-ZÀ-ÖØ-Þa-zà-öø-ÿ'’\s]*,?\s*(?:il|on)?\s*\[DATE_\d+\]\b/gi, matches);

      const addressRegex = new RegExp("\\b" + streetWords + "\\s+[A-ZÀ-ÖØ-Þa-zà-öø-ÿ0-9'’ .,/-]{2,100}?(?:n\\.?|numero)?\\s*(?:\\d+[A-Z]?|snc|s\\.?n\\.?c\\.?)\\s*(?:[|–-]\\s*)?(?:\\d{5})?(?:\\s*,?\\s*[A-ZÀ-ÖØ-Þa-zà-öø-ÿ'’ ()-]{2,50})?", 'gi');
      text = replaceWithLog(text, 'ADDRESS', addressRegex, matches);
      text = replaceWithLog(text, 'ADDRESS', /\b(?:con sede(?: legale)? in|registered office at|with registered office in)\s+[A-ZÀ-ÖØ-Þa-zà-öø-ÿ0-9'’ .,-]{10,120}/gi, matches);

      // Persone in contesti forti.
      text = replaceEmailHeaderPeople(text, matches);
      text = replaceQuotedWriter(text, matches);
      text = replaceGreetingPeople(text, matches);
      text = replaceMentionPeople(text, matches);
      text = replaceStandaloneCommaPeople(text, matches, emailThreadMode);
      text = replaceSingleNamesInEmailThread(text, matches, emailThreadMode);

      const personAfterContext = new RegExp("\\b(?:Direttore Generale|legale rappresentante|rappresentante legale|referente amministrativ[oa]|amministratore delegato|nella persona(?: del| della| di)?|in persona(?: del| della| di)?|signor|signora|sig\\.?|sig\\.ra|Mr\\.?|Ms\\.?|Mrs\\.?)\\s*,?\\s*(?:[a-zà-öø-ÿ'’]+\\s+){0,5}(" + nameParticle + "\\s+" + nameParticle + "(?:\\s+" + nameParticle + ")?)", 'gi');
      text = text.replace(personAfterContext, (full, person) => full.replace(person, maskPersonCandidate(person, matches, 'role')));

      text = replaceSignaturePeople(text, matches);

      text = text.replace(/\bnato\s+a\s+([A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’ -]{2,40})\b/g, (full, city) => {
        const token = tokenFor('CITY', city, matches);
        return full.replace(city, token);
      });

      if (maskCompanies) {
        text = replaceSubjectCompanies(text, matches);
        text = replaceGenericCompanies(text, matches);
      }
    }

    return {
      text,
      matches,
      counters: { ...counters },
      meta: { mode, legalMode, maskCompanies, emailThreadMode, firstNamesDictionary: !!window.PrivacyGPTFirstNames }
    };
  }

  window.PrivacyGPTRules = { anonymizeText };
})();
