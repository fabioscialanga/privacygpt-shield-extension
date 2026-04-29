(function(){
  const counters = {};

  function nextToken(type){
    counters[type] = (counters[type] || 0) + 1;
    return `[${type}_${counters[type]}]`;
  }

  function resetCounters(){
    Object.keys(counters).forEach(k => delete counters[k]);
  }

  function replaceWithLog(text, type, regex, matches){
    return text.replace(regex, (m) => {
      if(/^\[[A-Z]+_\d+\]$/.test(m)) return m;
      const token = nextToken(type);
      matches.push({ type, original: m, token });
      return token;
    });
  }

  function replaceGroupWithLog(text, type, regex, groupIndex, matches){
    return text.replace(regex, (...args) => {
      const full = args[0];
      const group = args[groupIndex];
      if(!group || /^\[[A-Z]+_\d+\]$/.test(group.trim())) return full;
      const token = nextToken(type);
      matches.push({ type, original: group.trim(), token });
      return full.replace(group, token);
    });
  }

  const companySuffix = "(?:S\\.?R\\.?L\\.?|S\\.?P\\.?A\\.?|S\\.?A\\.?S\\.?|S\\.?N\\.?C\\.?|LLC|LTD|GmbH|AG|SA|BV|NV|Inc\\.?|Corp\\.?)";
  const streetWords = "(?:via|viale|piazza|p\\.?zza|corso|largo|strada|vicolo|piazzale|avenue|ave\\.?|street|st\\.?|road|rd\\.?|square|sq\\.?|boulevard|blvd\\.?|lane|ln\\.?|drive|dr\\.?|rue|allee|straße|strasse|platz|calle|plaza|ronda)";
  const nameParticle = "(?:[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’]{1,}|[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’]+-[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’]+)";
  const fullName = nameParticle + "\\s+" + nameParticle + "(?:\\s+" + nameParticle + "){0,2}";

  const roleOrFooterWords = "(?:Responsabile|Sistemista|Project Manager|PMO|Amministratore|Direttore|Ufficio|Acquisti|Commerciale|Tecnico|Consulente|Developer|Manager|Sales|CEO|CTO|CFO|Inviato dal|Sent from|Informativa sulla privacy|Tel|Fax|Cell|Email)";

  function looksLikeEmailThread(text){
    return /(^|\n)\s*(Da|A|Cc|Ccn|From|To|Subject|Oggetto|Inviato|Sent):/im.test(text) || /<[^>]+@[^>]+>/i.test(text);
  }

  function maskAngleDisplayNames(text, matches){
    // Header lines may contain several recipients separated by semicolon.
    text = text.replace(/(^|\n)(\s*(?:Da|A|Cc|Ccn|From|To|Mittente):\s*)([^\n]+)/gi, (full, nl, prefix, line) => {
      const maskedLine = line.replace(/'?([^<;\n]{2,120}?)'?\s*<\s*(\[EMAIL_\d+\])\s*>/g, (m, display, emailToken) => {
        const clean = String(display || '').replace(/^['\s;]+|['\s;]+$/g, '').trim();
        if(!clean || clean.startsWith('[')) return m;
        const token = nextToken(/\b(?:srl|spa|sas|snc|llc|ltd|gmbh|inc|corp)\b/i.test(clean) ? 'COMPANY' : 'PERSON');
        matches.push({ type: token.startsWith('[COMPANY') ? 'COMPANY' : 'PERSON', original: clean, token });
        return `${token} <${emailToken}>`;
      });
      return nl + prefix + maskedLine;
    });

    // Generic display names before an already masked email token, also outside explicit header lines.
    return text.replace(/'?([^<\n;]{2,120}?)'?\s*<\s*(\[EMAIL_\d+\])\s*>/g, (full, display, emailToken) => {
      const clean = String(display || '').replace(/^['\s;]+|['\s;]+$/g, '').trim();
      if(!clean || clean.startsWith('[') || /^(Da|A|Cc|Ccn|From|To|Mittente):/i.test(clean)) return full;
      const type = /\b(?:srl|spa|sas|snc|llc|ltd|gmbh|inc|corp)\b/i.test(clean) ? 'COMPANY' : 'PERSON';
      const token = nextToken(type);
      matches.push({ type, original: clean, token });
      return `${token} <${emailToken}>`;
    });
  }

  function maskHeaderNamesWithoutEmail(text, matches){
    return text.replace(/(^|\n)(\s*(?:Da|A|Cc|Ccn|From|To|Mittente):\s*)([^<\n;]{2,120})(?=\n|;|$)/gi, (full, nl, prefix, value) => {
      const clean = value.replace(/^['\s]+|['\s]+$/g, '').trim();
      if(!clean || clean.startsWith('[') || !/[a-zà-öø-ÿ]/i.test(clean)) return full;
      const type = /\b(?:srl|spa|sas|snc|llc|ltd|gmbh|inc|corp)\b/i.test(clean) ? 'COMPANY' : 'PERSON';
      const token = nextToken(type);
      matches.push({ type, original: clean, token });
      return nl + prefix + token;
    });
  }

  function maskSignatureAndNames(text, matches){
    // Full name in signature block: followed shortly by role, company, address, contact, URL, or privacy footer.
    const signatureRe = new RegExp("(^|\\n)([ \\t]*(" + fullName + ")[ \\t]*)(?=\\n[\\s\\S]{0,180}(?:" + roleOrFooterWords + "|\\[EMAIL_\\d+\\]|\\[PHONE_\\d+\\]|\\[URL_\\d+\\]|\\[ADDRESS_\\d+\\]|" + streetWords + "|" + companySuffix + "))", 'gim');
    text = text.replace(signatureRe, (full, prefix, line, person) => {
      const token = nextToken('PERSON');
      matches.push({ type: 'PERSON', original: person.trim(), token });
      return prefix + line.replace(person, token);
    });

    // Sign-off full name after salutations.
    const signoffRe = new RegExp("(^|\\n)\\s*(?:Cordiali Saluti|Distinti Saluti|Saluti|Grazie|Thanks|Regards)[\\s\\r\\n]+(" + fullName + ")(?=\\s*(?:\\n|$))", 'gi');
    text = text.replace(signoffRe, (full, person) => {
      const token = nextToken('PERSON');
      matches.push({ type: 'PERSON', original: person.trim(), token });
      return full.replace(person, token);
    });

    // Single first name in greeting.
    text = replaceGroupWithLog(text, 'PERSON', /\b(?:Ciao|Buongiorno|Buonasera|Gentile|Salve)\s+([A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’]{2,})(?=[,\n])/g, 1, matches);

    // Mentioned people with @ in copied mail body.
    text = replaceWithLog(text, 'PERSON', /@[A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÖØ-öø-ÿ'’]+\s+[A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÖØ-öø-ÿ'’]+(?:\s+[A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÖØ-öø-ÿ'’]+)?/g, matches);

    // Isolated first name before mobile/client mail footer.
    text = replaceGroupWithLog(text, 'PERSON', new RegExp("(^|\\n)\\s*(" + nameParticle + ")\\s*(?=\\n\\s*(?:Inviato dal|Sent from|Outlook per|\\[PHONE_\\d+\\]))", 'g'), 2, matches);

    return text;
  }

  function maskCompanies(text, matches){
    const companyRegex = new RegExp("\\b[A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÖØ-öø-ÿ0-9 &'’.:-]{1,100}?\\s+" + companySuffix + "\\b", 'gi');
    text = replaceWithLog(text, 'COMPANY', companyRegex, matches);

    // Company-like subject prefix before colon in email subject.
    text = replaceGroupWithLog(text, 'COMPANY', /\bOggetto:\s*(?:R:\s*)?([A-Z][A-Z0-9 &'.-]{4,})(?=\s*:)/g, 1, matches);

    return text;
  }

  function anonymizeText(input, options = {}){
    resetCounters();

    let text = String(input || '');
    const matches = [];
    const mode = options.mode || (options.legalMode === false ? 'simple' : 'legal');
    const legalMode = mode === 'legal';
    const emailThreadMode = looksLikeEmailThread(text);
    const maskCompaniesEffective = !!options.maskCompanies || (legalMode && emailThreadMode);

    // High-confidence patterns first.
    text = replaceWithLog(text, 'EMAIL', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, matches);
    text = replaceWithLog(text, 'URL', /\bhttps?:\/\/[^\s)<>]+/gi, matches);
    text = replaceWithLog(text, 'SERVER', /\b(?:\d{1,3}\.){3}\d{1,3}:\d{2,5}\b/g, matches);
    text = replaceWithLog(text, 'IP', /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, matches);
    text = replaceWithLog(text, 'IBAN', /\b[A-Z]{2}\d{2}[A-Z0-9 ]{11,34}\b/g, matches);
    text = replaceWithLog(text, 'CF', /\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/gi, matches);
    text = replaceWithLog(text, 'PIVA', /\b(?:IT)?\d{11}\b/g, matches);
    text = replaceWithLog(text, 'PHONE', /\b(?:\+\d{1,3}[\s.\/-]?)?(?:(?:\d{2,4}[\s.\/-]){1,}\d{3,8}|\d{8,12})(?:\s*(?:int\.?|interno)\s*\d+)?\b/gi, matches);

    if (legalMode) {
      // Email and Outlook-style headers.
      text = maskAngleDisplayNames(text, matches);
      text = maskHeaderNamesWithoutEmail(text, matches);

      // Technical data often present in support threads.
      text = replaceGroupWithLog(text, 'USERNAME', /(^|\n)\s*(Administrator|Admin|root)\s*(?=\n|$)/gi, 2, matches);
      text = replaceGroupWithLog(text, 'PASSWORD', /(^|\n)\s*((?=[A-Za-z0-9!@#$%^&*_.-]{8,}\s*$)(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*_.-])[A-Za-z0-9!@#$%^&*_.-]{8,})\s*(?=\n|$)/gm, 2, matches);
      text = replaceGroupWithLog(text, 'DATABASE', /\b(?:DB|database)\s+(?:da\s+utilizzare\s+)?(?:si\s+chiama\s*:|è\s*:|e'?\s*:)?\s*([A-Z][A-Z0-9_]{4,})\b/gi, 1, matches);

      // Dates and times in long mail threads.
      text = replaceWithLog(text, 'DATE', /\b\d{1,2}\s*\/\s*(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s*\/\s*\d{4}\b/gi, matches);
      text = replaceWithLog(text, 'DATE', /\b(?:lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)\s+\d{1,2}\s+(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+\d{4}\b/gi, matches);
      text = replaceWithLog(text, 'DATE', /\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/g, matches);
      text = replaceWithLog(text, 'TIME', /\b(?:alle\s+ore\s+|ore\s+|alle\s+)?\d{1,2}[.:]\d{2}(?:\s*-\s*\d{1,2}[.:]\d{2})?\b/gi, matches);
      text = replaceWithLog(text, 'BIRTHDATE', /\b(?:nato|nata|born)\s+(?:a|in)?\s*[A-ZÀ-ÖØ-Þa-zà-öø-ÿ'’\s]*,?\s*(?:il|on)?\s*\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/gi, matches);

      // Addresses: street line and postal/city line.
      const streetLine = new RegExp("(^|\\n)([ \\t]*(?:Filiale:[ \\t]*)?" + streetWords + "\\s+[^\\n]{2,120})(?=\\n|$)", 'gim');
      text = text.replace(streetLine, (full, prefix, addr) => {
        const token = nextToken('ADDRESS');
        matches.push({ type: 'ADDRESS', original: addr.trim(), token });
        return prefix + token;
      });
      text = replaceWithLog(text, 'ADDRESS', /^\s*\d{5}\s+[A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÖØ-öø-ÿ'’ .-]{2,80}(?:\([A-Z]{2}\))?(?:\s*-\s*[A-Za-zÀ-ÖØ-öø-ÿ'’ .-]+)?\s*$/gm, matches);
      text = replaceWithLog(text, 'ADDRESS', /\b(?:con sede(?: legale)? in|registered office at|with registered office in)\s+[A-ZÀ-ÖØ-Þa-zà-öø-ÿ0-9'’ .,-]{10,120}/gi, matches);

      // Persons with strong personal context.
      const personAfterContext = new RegExp("\\b(?:Direttore Generale|legale rappresentante|rappresentante legale|amministratore delegato|referente amministrativ[ao]|procuratore|nella persona(?: del| della)?|in persona(?: del| della)?|signor|signora|sig\\.?|sig\\.ra|Mr\\.?|Ms\\.?|Mrs\\.?)\\s*,?\\s*(?:[a-zà-öø-ÿ'’]+\\s+){0,7}(" + fullName + ")", 'g');
      text = text.replace(personAfterContext, (full, person) => {
        const token = nextToken('PERSON');
        matches.push({ type: 'PERSON', original: person, token });
        return full.replace(person, token);
      });

      text = text.replace(/\bnato\s+a\s+([A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’ -]{2,40})\b/g, (full, city) => {
        const token = nextToken('CITY');
        matches.push({ type: 'CITY', original: city, token });
        return full.replace(city, token);
      });

      text = maskSignatureAndNames(text, matches);

      if(maskCompaniesEffective){
        text = maskCompanies(text, matches);
      }
    }

    return {
      text,
      matches,
      counters: { ...counters },
      meta: { mode, legalMode, emailThreadMode, maskCompanies: maskCompaniesEffective }
    };
  }

  window.PrivacyGPTRules = { anonymizeText };
})();
