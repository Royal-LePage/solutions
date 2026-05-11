/* =========================================================
   Royal LePage Solutions - Header Injection & Behavior
   v1002 - Logo wired up
   ========================================================= */

console.log('RLS HEADER JS LOADED v1002');

(function () {
  const VERSION = '1002';

  /* ─── Header markup ─── */
  function buildHeaderHTML() {
    return `
      <div class="rls-header-inner">
        <a href="https://royallepagesolutions.com/" class="rls-logo" aria-label="Royal LePage Solutions Home">
          <img src="assets/images/Solutions Logo Script_Black + Red Horizontal.jpg" alt="Royal LePage Solutions">
        </a>

        <div class="rls-header-right">
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
              <li><a href="about/">About Us</a></li>
              <li><a href="https://royallepagesolutions.com/agents.php">Our Agents</a></li>
              <li><a href="https://royallepagesolutions.com/joinus">Join Us / Careers</a></li>
              <li><a href="https://royallepagesolutions.com/contact">Contact</a></li>
            </ul>
          </div>

          <!-- Column 2: SEARCH & SERVICES -->
          <div class="rls-menu-col">
            <h3>Search &amp; Services</h3>
            <ul>
              <li><a href="https://royallepagesolutions.com/search">Search Listings</a></li>
              <li><a href="https://royallepagesolutions.com/featured">Featured Properties</a></li>
              <li><a href="https://royallepagesolutions.com/buy">Buying</a></li>
              <li><a href="https://royallepagesolutions.com/sell">Selling</a></li>
              <li><a href="https://royallepagesolutions.com/home-valuation">Home Valuation</a></li>
            </ul>
          </div>

          <!-- Column 3: COMMERCIAL & MARKET -->
          <div class="rls-menu-col">
            <h3>Commercial &amp; Market</h3>
            <ul>
              <li><a href="https://royallepagesolutions.com/commercial">Commercial Listings</a></li>
              <li><a href="commercial/vacancy/">Commercial Vacancy Report</a></li>
              <li><a href="market-reports/">Market Reports</a></li>
              <li>
                <button class="rls-submenu-trigger" data-submenu="communities" type="button">
                  <span>Calgary Communities</span>
                  <span class="rls-submenu-arrow">›</span>
                </button>
              </li>
            </ul>
          </div>

          <!-- Column 4: CONNECT -->
          <div class="rls-menu-col">
            <h3>Connect</h3>
            <ul>
              <li><a href="https://royallepagesolutions.com/contact">Contact Us</a></li>
              <li><a href="https://royallepagesolutions.com/newsletter">Newsletter</a></li>
              <li><a href="https://royallepagesolutions.com/blog">Blog</a></li>
            </ul>
          </div>

        </div>
      </div>

      <!-- Submenu: Calgary Communities -->
      <div class="rls-submenu-panel" id="rls-submenu-communities" aria-hidden="true">
        <button class="rls-submenu-back" data-submenu-back="communities" type="button">Back</button>
        <h3 class="rls-submenu-title">Calgary Communities</h3>
        <ul>
          <li><a href="calgary/">Calgary (All)</a></li>
          <li><a href="calgary/city-center/">City Center</a></li>
          <li><a href="calgary/north/">North</a></li>
          <li><a href="calgary/north-east/">North East</a></li>
          <li><a href="calgary/north-west/">North West</a></li>
          <li><a href="calgary/south/">South</a></li>
          <li><a href="calgary/south-east/">South East</a></li>
          <li><a href="calgary/east/">East</a></li>
          <li><a href="calgary/west/">West</a></li>
        </ul>
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

    // Header
    let header = document.getElementById('rls-header');
    if (!header) {
      header = document.createElement('header');
      header.id = 'rls-header';
      header.innerHTML = buildHeaderHTML();
      document.body.insertAdjacentElement('afterbegin', header);
    } else if (!header.querySelector('#rls-hamburger')) {
      header.innerHTML = buildHeaderHTML();
    }

    // Overlay
    let overlay = document.getElementById('rls-menu-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'rls-menu-overlay';
      document.body.appendChild(overlay);
    }

    // Slide-out menu
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
    detectHero(header);

    requestAnimationFrame(() => {
      document.body.classList.add('rls-header-ready');
    });

    console.log('[RLS Header] Injected + bound OK - v' + VERSION);
  }

  /* ─── Hero detection: transparent over hero only ─── */
  function detectHero(header) {
    const hero = document.querySelector('.rls-hero');
    if (hero) {
      document.body.classList.add('rls-has-hero');
      header.classList.add('is-transparent');
    } else {
      document.body.classList.remove('rls-has-hero');
      header.classList.remove('is-transparent');
    }
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
      // Close any open submenu panels
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

    // Submenu triggers
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

    // Submenu back buttons
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

    // Close menu when any link is clicked
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeMenu();
    });

    // Scroll state for header
    function handleScroll() {
      if (window.scrollY > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ─── Init ─── */
  function run() {
    ensureInjected();
    // Safety re-runs in case Bold Trail re-renders
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
