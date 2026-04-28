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
      const token = nextToken(type);
      matches.push({ type, original: m, token });
      return token;
    });
  }

  const companySuffix = "(?:S\\.?R\\.?L\\.?|S\\.?P\\.?A\\.?|S\\.?A\\.?S\\.?|S\\.?N\\.?C\\.?|LLC|LTD|GmbH|AG|SA|BV|NV|Inc\\.?|Corp\\.?)";
  const streetWords = "(?:via|viale|piazza|p\\.?zza|corso|largo|strada|vicolo|piazzale|avenue|ave\\.?|street|st\\.?|road|rd\\.?|square|sq\\.?|boulevard|blvd\\.?|lane|ln\\.?|drive|dr\\.?|rue|allee|straße|strasse|platz|calle|plaza|ronda)";
  const nameParticle = "(?:[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’]{2,})";

  function anonymizeText(input, options = {}){
    resetCounters();

    let text = String(input || '');
    const matches = [];
    const mode = options.mode || (options.legalMode === false ? 'simple' : 'legal');
    const legalMode = mode === 'legal';
    const maskCompanies = !!options.maskCompanies;

    // High-confidence patterns first.
    text = replaceWithLog(text, 'EMAIL', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, matches);
    text = replaceWithLog(text, 'IBAN', /\b[A-Z]{2}\d{2}[A-Z0-9 ]{11,34}\b/g, matches);
    text = replaceWithLog(text, 'URL', /\bhttps?:\/\/[^\s)]+/gi, matches);
    text = replaceWithLog(text, 'IP', /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, matches);
    text = replaceWithLog(text, 'CF', /\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/gi, matches);
    text = replaceWithLog(text, 'PIVA', /\b(?:IT)?\d{11}\b/g, matches);
    text = replaceWithLog(text, 'PHONE', /(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,5}\d{2,4}\b/g, matches);

    if (legalMode) {
      // Dates connected to personal context are masked as birth dates.
      text = replaceWithLog(text, 'BIRTHDATE', /\b(?:nato|nata|born)\s+(?:a|in)?\s*[A-ZÀ-ÖØ-Þa-zà-öø-ÿ'’\s]*,?\s*(?:il|on)?\s*\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/gi, matches);
      text = replaceWithLog(text, 'DATE', /\b\d{1,2}[./-]\d{1,2}[./-]\d{4}\b/g, matches);

      // Addresses with street words.
      const addressRegex = new RegExp("\\b" + streetWords + "\\s+[A-ZÀ-ÖØ-Þa-zà-öø-ÿ0-9'’ .-]{1,70}?(?:n\\.?|numero)?\\s*\\d+[A-Z]?(?:\\s*,?\\s*\\d{5}\\s+[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'’ -]{2,40})?", 'gi');
      text = replaceWithLog(text, 'ADDRESS', addressRegex, matches);

      text = replaceWithLog(text, 'ADDRESS', /\b(?:con sede(?: legale)? in|registered office at|with registered office in)\s+[A-ZÀ-ÖØ-Þa-zà-öø-ÿ0-9'’ .,-]{10,120}/gi, matches);

      // Persons are masked only when introduced by strong personal-context expressions.
      // This avoids false positives such as "Servizi di Delivery", "Contratto", "Clienti" or legal definitions.
      const personAfterContext = new RegExp("\\b(?:Direttore Generale|legale rappresentante|rappresentante legale|amministratore delegato|referente amministrativ[ao]|procuratore|nella persona(?: del| della)?|in persona(?: del| della)?|signor|signora|sig\\.?|sig\\.ra|Mr\\.?|Ms\\.?|Mrs\\.?)\\s*,?\\s*(?:[a-zà-öø-ÿ'’]+\\s+){0,7}(" + nameParticle + "\\s+" + nameParticle + "(?:\\s+" + nameParticle + ")?)", 'g');
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

      if (maskCompanies) {
        // Company names with legal suffix. Case-insensitive to catch SRL, S.r.l., SpA, S.P.A., etc.
        const companyRegex = new RegExp("\\b[A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÖØ-öø-ÿ0-9 &'’.:-]{1,90}?\\s+" + companySuffix + "\\b", 'gi');
        text = replaceWithLog(text, 'COMPANY', companyRegex, matches);
      }
    }

    return {
      text,
      matches,
      counters: { ...counters },
      meta: { mode, legalMode, maskCompanies }
    };
  }

  window.PrivacyGPTRules = { anonymizeText };
})();
