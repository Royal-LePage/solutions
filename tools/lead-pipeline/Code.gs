/**
 * Royal LePage Solutions — Lead Pipeline
 * --------------------------------------
 * Receives leads from any brokerage form (landing pages, community pages,
 * open-house QR forms, partner links), logs every lead to a Google Sheet,
 * and posts it into the Bluebird lead rotation (account rlp_512).
 *
 * If Bluebird's API is down or rejects the lead, the lead is emailed to the
 * Bluebird email endpoint as a fallback and an alert is sent, so no lead is lost.
 *
 * SCRIPT PROPERTIES (Project Settings → Script properties):
 *   BLUEBIRD_API_KEY   required  X-Auth-Token from Bluebird → Configuration → Integrations → Your API Key
 *   BLUEBIRD_SLUG      optional  defaults to rlp_512
 *   FALLBACK_EMAIL     optional  defaults to rlp_512@md.royallepage.ca (Bluebird email endpoint)
 *   ALERT_EMAIL        optional  who gets told when the API fails (e.g. kyleduiker@royallepage.ca)
 *   SHEET_ID           optional  only needed if this script is NOT bound to the log spreadsheet
 *   TEST_AGENT         optional  Bluebird agent identifier used by testLead() so the test lead
 *                                isn't rotated to other agents (see setup notes)
 */

const CONFIG = {
  // Royal LePage's Bluebird runs on leads.royallepage.ca; the generic docs use app.gobluebird.io.
  // findApiBase() tries each and saves the one that accepts the key as BLUEBIRD_BASE.
  API_BASES: ['https://leads.royallepage.ca/extapi/', 'https://app.gobluebird.io/extapi/'],
  DEFAULT_SLUG: 'rlp_512',
  DEFAULT_FALLBACK_EMAIL: 'rlp_512@md.royallepage.ca',
  SHEET_NAME: 'Leads',
  DEFAULT_CITY: 'Calgary, AB, Canada',
  DUPLICATE_WINDOW_SECONDS: 600, // ignore the same email/phone re-submitting within 10 minutes
  BRAND: 'Royal LePage Solutions'
};

const LOG_HEADERS = [
  'Received', 'Status', 'Bluebird HTTP', 'Bluebird response',
  'Name', 'Email', 'Phone', 'Intent', 'Timeline',
  'Address', 'Community', 'Postal code', 'Property type',
  'Offer', 'Source', 'Campaign', 'Medium', 'Page URL',
  'Marketing consent', 'Message', 'Tags'
];

/* ------------------------------------------------------------------ */
/* Web app entry points                                                */
/* ------------------------------------------------------------------ */

function doPost(e) {
  let lead;
  try {
    lead = normalizeLead_(parseRequest_(e));
  } catch (err) {
    return json_({ ok: false, error: 'Could not read the form submission.' });
  }

  // Honeypot: bots fill the hidden "website" field. Pretend success, do nothing.
  if (lead.honeypot) return json_({ ok: true });

  const problem = validate_(lead);
  if (problem) return json_({ ok: false, error: problem });

  if (isDuplicate_(lead)) return json_({ ok: true, duplicate: true });

  const result = sendToBluebird_(lead);
  let status = result.ok ? 'SENT' : 'API_FAILED';

  if (!result.ok) {
    const fallbackOk = sendFallbackEmail_(lead, result);
    status = fallbackOk ? 'API_FAILED → EMAILED' : 'API_FAILED → EMAIL_FAILED';
    sendAlert_(lead, result, status);
  }

  logLead_(lead, status, result);

  // Always tell the visitor it worked if we captured the lead somewhere.
  const captured = result.ok || status === 'API_FAILED → EMAILED';
  return json_({ ok: captured });
}

/** Simple health check: open the web app URL in a browser. */
function doGet() {
  return json_({ ok: true, service: 'RLPS lead pipeline' });
}

/* ------------------------------------------------------------------ */
/* Parsing and cleanup                                                 */
/* ------------------------------------------------------------------ */

function parseRequest_(e) {
  // Accepts JSON (sent as text/plain to avoid CORS preflight) or normal form posts.
  if (e && e.postData && e.postData.contents) {
    const raw = e.postData.contents.trim();
    if (raw.charAt(0) === '{') return JSON.parse(raw);
  }
  return (e && e.parameter) ? e.parameter : {};
}

function normalizeLead_(d) {
  const clean = v => (v === undefined || v === null) ? '' : String(v).trim().slice(0, 1000);
  const first = clean(d.first_name || d.firstName);
  const last = clean(d.last_name || d.lastName);
  const postal = clean(d.postal_code || d.postalCode).toUpperCase().replace(/\s+/g, '');

  return {
    honeypot: clean(d.website),
    name: clean(d.name) || [first, last].filter(String).join(' '),
    email: clean(d.email).toLowerCase(),
    phone: formatPhone_(clean(d.phone)),
    intent: clean(d.intent),              // buy | sell | both | unsure
    timeline: clean(d.timeline),          // e.g. 0-3 months
    address: clean(d.address),
    community: clean(d.community),
    city: clean(d.city),
    postal: postal,
    propertyType: clean(d.property_type || d.propertyType),
    offer: clean(d.offer),                // e.g. home-value, buyer-guide
    source: clean(d.source || d.utm_source) || 'website',
    campaign: clean(d.utm_campaign || d.campaign),
    medium: clean(d.utm_medium || d.medium),
    pageUrl: clean(d.page_url || d.pageUrl || d.url),
    consent: /^(true|yes|on|1)$/i.test(clean(d.consent)) ? 'Yes' : 'No',
    message: clean(d.message),
    extraTags: clean(d.tags)
  };
}

function formatPhone_(p) {
  const digits = p.replace(/\D/g, '');
  const ten = digits.length === 11 && digits.charAt(0) === '1' ? digits.slice(1) : digits;
  if (ten.length !== 10) return p; // leave unusual numbers as typed
  return '(' + ten.slice(0, 3) + ') ' + ten.slice(3, 6) + '-' + ten.slice(6);
}

function validate_(lead) {
  if (!lead.name) return 'Please enter your name.';
  if (!lead.email && !lead.phone) return 'Please enter an email or phone number.';
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return 'Please check your email address.';
  return '';
}

function isDuplicate_(lead) {
  const key = 'lead:' + (lead.email || lead.phone.replace(/\D/g, '')) + ':' + lead.offer;
  const cache = CacheService.getScriptCache();
  if (cache.get(key)) return true;
  cache.put(key, '1', CONFIG.DUPLICATE_WINDOW_SECONDS);
  return false;
}

/* ------------------------------------------------------------------ */
/* Bluebird                                                            */
/* ------------------------------------------------------------------ */

function buildPayload_(lead) {
  const tags = [lead.source, lead.offer, lead.intent, lead.community, lead.city, lead.campaign]
    .concat(lead.extraTags ? lead.extraTags.split(',') : [])
    .map(t => String(t).trim())
    .filter(String);

  const payload = {
    name: lead.name,
    message: buildMessage_(lead),
    tags: Array.from(new Set(tags)),
    lead_source: [CONFIG.BRAND, lead.source, lead.offer].filter(String).join(' – ')
  };
  if (lead.email) payload.email = lead.email;
  if (lead.phone) payload.phone = lead.phone;
  if (lead.pageUrl && /^https?:\/\//i.test(lead.pageUrl)) payload.url = lead.pageUrl;

  // Location for Bluebird's geo routing.
  // e.g. "123 Main St, Chestermere, AB, Canada"; defaults to Calgary when no city is given.
  const where = lead.address || lead.community;
  if (where) {
    payload.geolocation_address = lead.city
      ? where + ', ' + lead.city + ', AB, Canada'
      : where + ', ' + CONFIG.DEFAULT_CITY;
  }
  if (/^[A-Z]\d[A-Z]/.test(lead.postal)) payload.fsa = lead.postal.slice(0, 3);

  if (lead.identifiedAgent) payload.identified_agent = lead.identifiedAgent;
  return payload;
}

function buildMessage_(lead) {
  const lines = [
    ['Looking to', lead.intent],
    ['Timeline', lead.timeline],
    ['Property address', lead.address],
    ['Community', lead.community],
    ['City', lead.city],
    ['Property type', lead.propertyType],
    ['Requested', lead.offer],
    ['Source', [lead.source, lead.medium, lead.campaign].filter(String).join(' / ')],
    ['Marketing email consent', lead.consent],
    ['Message', lead.message]
  ].filter(row => row[1]).map(row => row[0] + ': ' + row[1]);
  return lines.join('\n');
}

function sendToBluebird_(lead, baseOverride) {
  const props = PropertiesService.getScriptProperties();
  const key = (props.getProperty('BLUEBIRD_API_KEY') || '').trim();
  if (!key) return { ok: false, code: 0, body: 'BLUEBIRD_API_KEY is not set in Script properties.' };

  const slug = (props.getProperty('BLUEBIRD_SLUG') || CONFIG.DEFAULT_SLUG).trim();
  const base = baseOverride || props.getProperty('BLUEBIRD_BASE') || CONFIG.API_BASES[0];
  const url = base + encodeURIComponent(slug) + '/lead';
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'X-Auth-Token': key },
    payload: JSON.stringify(buildPayload_(lead)),
    muteHttpExceptions: true
  };

  // One retry for rate limits and server errors.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = UrlFetchApp.fetch(url, options);
      const code = res.getResponseCode();
      const body = res.getContentText().slice(0, 500);
      if (code >= 200 && code < 300) return { ok: true, code: code, body: body };
      if (attempt === 1 && (code === 429 || code >= 500)) { Utilities.sleep(2000); continue; }
      return { ok: false, code: code, body: body };
    } catch (err) {
      if (attempt === 2) return { ok: false, code: 0, body: String(err).slice(0, 500) };
      Utilities.sleep(2000);
    }
  }
  return { ok: false, code: 0, body: 'Unknown error' };
}

/* ------------------------------------------------------------------ */
/* Fallback, alerts, logging                                           */
/* ------------------------------------------------------------------ */

function sendFallbackEmail_(lead, result) {
  const to = PropertiesService.getScriptProperties().getProperty('FALLBACK_EMAIL') || CONFIG.DEFAULT_FALLBACK_EMAIL;
  try {
    MailApp.sendEmail({
      to: to,
      subject: 'New lead: ' + lead.name + (lead.offer ? ' (' + lead.offer + ')' : ''),
      body: [
        'Name: ' + lead.name,
        'Email: ' + lead.email,
        'Phone: ' + lead.phone,
        buildMessage_(lead),
        'Page: ' + lead.pageUrl
      ].filter(String).join('\n'),
      replyTo: lead.email || undefined
    });
    return true;
  } catch (err) {
    return false;
  }
}

function sendAlert_(lead, result, status) {
  const to = PropertiesService.getScriptProperties().getProperty('ALERT_EMAIL');
  if (!to) return;
  try {
    MailApp.sendEmail(to, 'Lead pipeline: Bluebird API problem (' + status + ')',
      'A lead could not be posted to the Bluebird API.\n\n' +
      'Lead: ' + lead.name + ' / ' + (lead.email || lead.phone) + '\n' +
      'HTTP ' + result.code + ': ' + result.body + '\n\n' +
      'Status: ' + status + '\nCheck the Leads sheet.');
  } catch (err) { /* nothing else to do */ }
}

function getSheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  const ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(LOG_HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, LOG_HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function logLead_(lead, status, result) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    getSheet_().appendRow([
      new Date(), status, result.code, result.body,
      lead.name, lead.email, lead.phone, lead.intent, lead.timeline,
      lead.address, lead.community, lead.postal, lead.propertyType,
      lead.offer, lead.source, lead.campaign, lead.medium, lead.pageUrl,
      lead.consent, lead.message, buildPayload_(lead).tags.join(', ')
    ].map(v => (typeof v === 'string' && /^[=+\-@]/.test(v)) ? "'" + v : v)); // block formula injection
  } catch (err) {
    // Logging must never stop a lead from being delivered.
  } finally {
    lock.releaseLock();
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ------------------------------------------------------------------ */
/* Run these from the editor                                           */
/* ------------------------------------------------------------------ */

/** 1) Run once: creates the Leads sheet and asks for permissions. */
function setup() {
  getSheet_();
  const key = PropertiesService.getScriptProperties().getProperty('BLUEBIRD_API_KEY');
  Logger.log(key ? 'Setup done. API key found.' : 'Setup done. Now add BLUEBIRD_API_KEY in Script properties.');
}

/**
 * 2) Sends one clearly-marked test lead straight to Bluebird (skips the web app).
 * WARNING: without TEST_AGENT set, this lead enters the LIVE rotation and an agent will be notified.
 */
function testLead() {
  const testAgent = PropertiesService.getScriptProperties().getProperty('TEST_AGENT');
  const lead = normalizeLead_({
    name: 'TEST LEAD - do not contact',
    email: 'test+' + Date.now() + '@example.com',
    phone: '403-555-0100',
    intent: 'sell',
    timeline: '0-3 months',
    community: 'Mahogany',
    postal_code: 'T3M 0A1',
    offer: 'home-value',
    source: 'pipeline-test',
    message: 'Pipeline test from Apps Script. Please ignore and delete.'
  });
  if (testAgent) lead.identifiedAgent = testAgent;

  // Try each known API address until one accepts the key, then remember it.
  const props = PropertiesService.getScriptProperties();
  const saved = props.getProperty('BLUEBIRD_BASE');
  const bases = saved ? [saved] : CONFIG.API_BASES;
  let result;
  for (const base of bases) {
    result = sendToBluebird_(lead, base);
    Logger.log(base + ' → HTTP ' + result.code + ': ' + result.body);
    if (result.ok) {
      props.setProperty('BLUEBIRD_BASE', base);
      Logger.log('Saved BLUEBIRD_BASE = ' + base);
      break;
    }
  }
  logLead_(lead, result.ok ? 'TEST SENT' : 'TEST FAILED', result);
}
