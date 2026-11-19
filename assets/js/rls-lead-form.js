/*!
 * Royal LePage Solutions — shared lead form handler
 * Sends any form marked with data-rls-lead to the brokerage lead pipeline
 * (Google Apps Script → Google Sheet log → Bluebird rotation rlp_512).
 *
 * Usage on any page:
 *   <form data-rls-lead data-source="website" data-offer="home-value" novalidate>
 *     <input name="name"> <input name="email"> <input name="phone"> ...
 *     <div style="position:absolute;left:-9999px" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></div>
 *     <button type="submit">Send</button>
 *     <p data-rls-status role="status" aria-live="polite"></p>
 *   </form>
 *   <script src="https://royal-lepage.github.io/solutions/assets/js/rls-lead-form.js?v=1001" defer></script>
 *
 * Optional attributes on the <form>:
 *   data-source    channel tag (overridden by ?utm_source=)        default "website"
 *   data-offer     what the visitor asked for (home-value, buyer-guide, market-report…)
 *   data-success   thank-you message
 *   data-redirect  URL to send the visitor to after success
 *   data-endpoint  override the pipeline URL (testing only)
 *
 * Recognised field names: name or first_name + last_name, email, phone, intent, timeline,
 * address, community, postal_code, property_type, budget, message, consent, website (honeypot).
 */
(function () {
  'use strict';

  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbwgAPgb7EleV64JG712HUAxWmGApGDXSAvReKlHGtev4H2aoc6m3SrPJ_ccmV9EKvPR9w/exec';
  var DEFAULT_SUCCESS = "Thanks! A Royal LePage Solutions REALTOR® will be in touch shortly.";
  var DEFAULT_ERROR = 'Something went wrong. Please call us at 403.252.5900.';

  // Keep UTM tags from the landing URL for the whole visit.
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'];
  try {
    var qs = new URLSearchParams(window.location.search);
    UTM_KEYS.forEach(function (k) { if (qs.get(k)) sessionStorage.setItem('rls_' + k, qs.get(k)); });
  } catch (e) { /* storage unavailable */ }

  function utm(k) {
    try { return sessionStorage.getItem('rls_' + k) || ''; } catch (e) { return ''; }
  }

  function statusEl(form) {
    var el = form.querySelector('[data-rls-status]');
    if (!el) {
      el = document.createElement('p');
      el.setAttribute('data-rls-status', '');
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      form.appendChild(el);
    }
    return el;
  }

  function setStatus(form, text, type) {
    var el = statusEl(form);
    el.textContent = text;
    el.classList.remove('is-success', 'is-error');
    if (type) el.classList.add('is-' + type);
  }

  function collect(form) {
    var data = {};
    new FormData(form).forEach(function (v, k) {
      if (typeof v !== 'string') return; // skip files
      data[k] = data[k] ? data[k] + ', ' + v : v;
    });
    if (!data.name && (data.first_name || data.last_name)) {
      data.name = [data.first_name, data.last_name].filter(Boolean).join(' ');
    }
    // Fold extra fields into the message so nothing is lost.
    if (data.budget) data.message = ['Budget: ' + data.budget, data.message].filter(Boolean).join('\n');

    data.source = utm('utm_source') || form.getAttribute('data-source') || 'website';
    data.utm_medium = utm('utm_medium');
    data.utm_campaign = utm('utm_campaign');
    data.offer = form.getAttribute('data-offer') || data.offer || '';
    data.page_url = window.location.href.split('#')[0];
    var consent = form.querySelector('[name="consent"]');
    data.consent = consent && consent.checked ? 'yes' : 'no';
    return data;
  }

  function onSubmit(ev) {
    ev.preventDefault();
    var form = ev.currentTarget;
    if (form.getAttribute('data-rls-busy') === '1') return;

    var data = collect(form);
    if (!data.name || (!data.email && !data.phone)) {
      setStatus(form, 'Please add your name and an email or phone number.', 'error');
      return;
    }

    var button = form.querySelector('[type="submit"]');
    form.setAttribute('data-rls-busy', '1');
    if (button) button.disabled = true;
    setStatus(form, 'Sending…', null);

    // text/plain keeps this a "simple" request: Apps Script can't answer CORS preflights.
    fetch(form.getAttribute('data-endpoint') || ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res || !res.ok) throw new Error((res && res.error) || 'Lead not accepted');
        if (window.fbq) window.fbq('track', 'Lead');
        if (window.gtag) window.gtag('event', 'generate_lead', { offer: data.offer, source: data.source });
        if (window.dataLayer) window.dataLayer.push({ event: 'rls_lead', offer: data.offer, source: data.source });

        var redirect = form.getAttribute('data-redirect');
        if (redirect) { window.location.href = redirect; return; }
        form.reset();
        setStatus(form, form.getAttribute('data-success') || DEFAULT_SUCCESS, 'success');
      })
      .catch(function (err) {
        var msg = err && err.message && err.message !== 'Lead not accepted' && !/fetch|JSON|network/i.test(err.message)
          ? err.message : DEFAULT_ERROR;
        setStatus(form, msg, 'error');
      })
      .then(function () {
        form.removeAttribute('data-rls-busy');
        if (button) button.disabled = false;
      });
  }

  function init() {
    var forms = document.querySelectorAll('form[data-rls-lead]');
    for (var i = 0; i < forms.length; i++) {
      if (forms[i].getAttribute('data-rls-bound')) continue;
      forms[i].setAttribute('data-rls-bound', '1');
      forms[i].addEventListener('submit', onSubmit);
    }
  }

  window.RLSLeadForm = { init: init }; // call again for forms added later
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
