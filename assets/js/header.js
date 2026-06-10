/* =========================================================
   Royal LePage Solutions - Header Injection & Behavior
   v1014 - Logo now loads from raw.githubusercontent.com
           instead of the github.io Pages path. GitHub Pages
           mishandles the "%2B" (the "+") in the logo filename
           and 404s it; the raw host serves it correctly, and
           it matches the hero / Proudly-Canadian images that
           already work. All other links unchanged.
   v1013 - BoldTrail primary site moved from rlpsolutions.ca
           to royallepagesolutions.com. All BoldTrail links
           (logo, Meet Our Agents, Search Listings, Our
           Listings) now route through a BOLDTRAIL_BASE
           constant. Info-site links still use the
           self-detecting SITE_BASE introduced in v1012
           (GitHub URL until the info.royallepagesolutions.com
           CNAME propagates).
   ========================================================= */

console.log('RLS HEADER JS LOADED v1014');

(function () {
  const VERSION = '1014';

  // Base URL where logo and other assets live.
  // GitHub-hosted; works regardless of custom-domain DNS status.
  const ASSET_BASE = 'https://royal-lepage.github.io/solutions';

  /* ─────────────────────────────────────────────────────────
     BOLDTRAIL_BASE — the primary BoldTrail site.
     Moved from rlpsolutions.ca to royallepagesolutions.com.
     If your canonical is the bare apex (no www), drop the
     "www." below — BoldTrail typically redirects either way.
     ───────────────────────────────────────────────────────── */
  const BOLDTRAIL_BASE = 'https://www.royallepagesolutions.com';

  /* ─────────────────────────────────────────────────────────
     SITE_BASE — base for the GitHub-hosted info-site links.
     Self-detecting: only use the custom subdomain when the
     page is actually served from it (i.e. once the CNAME has
     propagated). Everywhere else — GitHub preview, BoldTrail,
     local — fall back to the GitHub URL, which always resolves.

     To force one or the other manually, replace the line below
     with a hardcoded value, e.g.:
       const SITE_BASE = 'https://royal-lepage.github.io/solutions';
     ───────────────────────────────────────────────────────── */
  const SITE_BASE = (location.hostname === 'info.royallepagesolutions.com')
    ? 'https://info.royallepagesolutions.com'
    : 'https://royal-lepage.github.io/solutions';

  const DEPOSIT_URL = 'https://keybox.payload.com/royal-lepage-solutions/payment/royal-lepage-solutions-trust';
  const DEPOSIT_INSTRUCTIONS_URL = ASSET_BASE + '/deposits/';
  // Served from raw.githubusercontent.com — GitHub Pages 404s the "%2B"
  // ("+") in this filename, but the raw host serves it fine (same host as
  // the hero / Proudly-Canadian images).
  const LOGO_URL = 'https://raw.githubusercontent.com/Royal-LePage/solutions/main/assets/images/Solutions%20Logo%20Script_White%20%2B%20Red.png';

  /* ─── Header markup ─── */
  function buildHeaderHTML() {
    return `
      <div class="rls-header-inner">
        <a href="${BOLDTRAIL_BASE}/" class="rls-logo" aria-label="Royal LePage Solutions Home">
          <img src="${LOGO_URL}" alt="Royal LePage Solutions">
        </a>

        <div class="rls-header-right">
          <a class="rls-deposit-btn" href="${DEPOSIT_URL}">Deposit Instructions</a>
          <a class="rls-phone" href="tel:4032525900">403.252.5900</a>
          <button class="rls-hamburger" id="rls-hamburger" aria-label="Open menu" aria-expanded="false" type="button">
            <span class="rls-hamburger-lines">
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>
    `;
  }

  /* ─── Slide-out menu markup ─── */
  function buildMenuHTML() {
    return `
      <button class="rls-menu-close" id="rls-menu-close" aria-label="Close menu" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
          <line x1="6" y1="6" x2="18" y2="18"/>
          <line x1="18" y1="6" x2="6" y2="18"/>
        </svg>
      </button>

      <div class="rls-menu-inner">
        <div class="rls-menu-grid">

          <!-- Column 1: THE BROKERAGE -->
          <div class="rls-menu-col">
            <h3>The Brokerage</h3>
            <ul>
              <li><a href="${SITE_BASE}/pages/about-us">Support Staff</a></li>
              <li><a href="${BOLDTRAIL_BASE}/agents.php">Meet Our Agents</a></li>
              <li><a href="${SITE_BASE}/pages/join-us/">Join Us / Careers</a></li>
              <li><a href="${SITE_BASE}/pages/deposit/">Deposit Instructions</a></li>
              <li><a href="${SITE_BASE}/pages/contact/">Contact</a></li>
              <li><a href="${SITE_BASE}/pages/blog/">Blog</a></li>
            </ul>
          </div>

          <!-- Column 2: SEARCH & SERVICES -->
          <div class="rls-menu-col">
            <h3>Search &amp; Services</h3>
            <ul>
              <li><a href="${BOLDTRAIL_BASE}/index.php?showagency=1&rtype=map">Search Listings</a></li>
              <li><a href="${BOLDTRAIL_BASE}/index.php?showagency=1#rslt">Our Listings</a></li>
              <li><a href="${SITE_BASE}/pages/commercial/">Commercial Listings</a></li>
              <li><a href="${SITE_BASE}/pages/buyers/">Buying</a></li>
              <li><a href="${SITE_BASE}/pages/seller/">Selling</a></li>
              <li><a href="${SITE_BASE}/pages/finance/">Finance</a></li>
              <li><a href="${SITE_BASE}/pages/lead/">Find an Agent</a></li>
            </ul>
          </div>

          <!-- Column 3: ROYAL LEPAGE -->
          <div class="rls-menu-col">
            <h3>Royal LePage</h3>
            <ul>
              <li><a href="https://www.royallepage.ca/en/realestate/about-us/">About Royal LePage</a></li>
              <li><a href="${SITE_BASE}/pages/shelter/">Shelter Foundation</a></li>
            </ul>
          </div>

          <!-- Column 4: CONNECT -->
          <div class="rls-menu-col">
            <h3>Connect</h3>
            <ul>
              <li><a href="${SITE_BASE}/pages/contact/">Contact Us</a></li>
              <li><a href="https://www.facebook.com/RLPSolutions" target="_blank" rel="noopener">Facebook</a></li>
              <li><a href="http://www.instagram.com/royallepagesolutions" target="_blank" rel="noopener">Instagram</a></li>
              <li><a href="http://www.linkedin.com/company/royal-lepage-solutions" target="_blank" rel="noopener">LinkedIn</a></li>
            </ul>
          </div>

        </div>
      </div>

      <!-- Contact strip -->
      <div class="rls-menu-contact">
        <div class="rls-contact-brand">Royal LePage&reg; Solutions</div>

        <div class="rls-contact-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <a href="tel:4032525900">403.252.5900</a>
        </div>

        <div class="rls-contact-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>Calgary, Alberta</span>
        </div>
      </div>
    `;
  }

  /* ─── Inject everything ─── */
  function ensureInjected() {
    document.body.classList.add('has-rls-header');

    let header = document.getElementById('rls-header');
    if (!header) {
      header = document.createElement('header');
      header.id = 'rls-header';
      header.innerHTML = buildHeaderHTML();
      document.body.insertAdjacentElement('afterbegin', header);
    } else if (!header.querySelector('#rls-hamburger')) {
      header.innerHTML = buildHeaderHTML();
    }

    let overlay = document.getElementById('rls-menu-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'rls-menu-overlay';
      document.body.appendChild(overlay);
    }

    let menu = document.getElementById('rls-slide-menu');
    if (!menu) {
      menu = document.createElement('aside');
      menu.id = 'rls-slide-menu';
      menu.setAttribute('aria-hidden', 'true');
      menu.innerHTML = buildMenuHTML();
      document.body.appendChild(menu);
    } else if (!menu.querySelector('#rls-menu-close')) {
      menu.innerHTML = buildMenuHTML();
    }

    bindHeaderBehavior(header, menu, overlay);

    requestAnimationFrame(() => {
      document.body.classList.add('rls-header-ready');
    });

    console.log('[RLS Header] Injected + bound OK - v' + VERSION);
  }

  /* ─── Behavior bindings ─── */
  function bindHeaderBehavior(header, menu, overlay) {
    if (header.dataset.rlsBound === '1') return;
    header.dataset.rlsBound = '1';

    const hamburger = document.getElementById('rls-hamburger');
    const closeBtn = document.getElementById('rls-menu-close');

    if (!hamburger || !closeBtn) return;

    function openMenu() {
      menu.classList.add('is-open');
      overlay.classList.add('is-open');
      document.body.classList.add('rls-menu-open');
      hamburger.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
    }

    function closeMenu() {
      menu.classList.remove('is-open');
      overlay.classList.remove('is-open');
      document.body.classList.remove('rls-menu-open');
      hamburger.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      menu.querySelectorAll('.rls-submenu-panel').forEach(p => {
        p.classList.remove('is-open');
        p.setAttribute('aria-hidden', 'true');
      });
    }

    hamburger.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
    });

    menu.querySelectorAll('.rls-submenu-trigger').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-submenu');
        const panel = document.getElementById('rls-submenu-' + id);
        if (panel) {
          panel.classList.add('is-open');
          panel.setAttribute('aria-hidden', 'false');
        }
      });
    });

    menu.querySelectorAll('[data-submenu-back]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-submenu-back');
        const panel = document.getElementById('rls-submenu-' + id);
        if (panel) {
          panel.classList.remove('is-open');
          panel.setAttribute('aria-hidden', 'true');
        }
      });
    });

    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeMenu();
    });
  }

  function run() {
    ensureInjected();
    setTimeout(ensureInjected, 500);
    setTimeout(ensureInjected, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
    window.addEventListener('load', run);
  } else {
    run();
  }
})();
