/**
 * Photon Studio — Navbar Component
 * Renders navbar dynamically from nav-data.json
 */

/* ---- SVG Icon Map (32×32, stroke-based, #ffffff) ---- */
const SVG_ICONS = {
  'image-plus': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/><line x1="14" y1="3" x2="14" y2="9"/><line x1="11" y1="6" x2="17" y2="6"/></svg>`,
  'camera': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  'pen-tool': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
  'sun': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  'user': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  'brush': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 114.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 00-3-3.02z"/></svg>`,
  'maximize': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  'smile': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
  'users': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  'shirt': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"/></svg>`,
  'star': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  'cpu': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
  'message-square': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
  'zap': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  'layers': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  'activity': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  'image': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  'diamond': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M2 9h20"/><path d="M10 3l-4 6 6 13 6-13-4-6"/></svg>`,
  'sparkles': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/></svg>`,
  'video': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
  'scissors': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`,
  'film': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`,
  'cast': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 16.1A5 5 0 015.9 20M2 12.05A9 9 0 019.95 20M2 8V6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2h-6"/><line x1="2" y1="20" x2="2.01" y2="20"/></svg>`,
  'upload': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>`,
  'move': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>`,
  'music': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  'play-circle': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`,
  'globe': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
  'mic': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  'repeat': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>`,
  'volume-2': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>`,
  'headphones': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>`,
  'bar-chart': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`,
  'wand': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8L19 13"/><path d="M15 9h0"/><path d="M17.8 6.2L19 5"/><path d="M11 6.2L9.7 5"/><path d="M3 21l9-9"/></svg>`,
  'droplet': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>`,
  'eye': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  'grid': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  'award': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  'dollar-sign': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`
};

function getIconSvg(iconName) {
  return SVG_ICONS[iconName] || SVG_ICONS['star'];
}

export async function initNavbar() {
  const [navData, siteConfig] = await Promise.all([
    fetch('./js/nav-data.json?v=1.0.3').then(r => r.json()),
    fetch('./js/site-config.json?v=1.0.3').then(r => r.json())
  ]);

  // Collect all unique icons used in navData
  const uniqueIcons = new Set();
  if (navData && navData.navItems) {
    navData.navItems.forEach(item => {
      if (item.subItems && item.subItems.columns) {
        item.subItems.columns.forEach(col => {
          if (col.items) {
            col.items.forEach(sub => {
              if (sub.icon) uniqueIcons.add(sub.icon);
            });
          }
        });
      }
    });
  }

  // Fetch all icons that are not already in SVG_ICONS inline map
  await Promise.all(
    Array.from(uniqueIcons).map(async iconName => {
      if (!SVG_ICONS[iconName]) {
        try {
          let res = await fetch(`./assets/icons/${iconName}.svg`);
          if (!res.ok) {
            res = await fetch(`./assets/icons/${iconName.toLowerCase()}.svg`);
          }
          if (res.ok) {
            SVG_ICONS[iconName] = await res.text();
          } else {
            console.warn(`Icon file not found: ./assets/icons/${iconName}.svg`);
          }
        } catch (err) {
          console.error(`Error loading icon ${iconName}:`, err);
        }
      }
    })
  );

  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // --- Logo ---
  const logo = document.createElement('a');
  logo.className = 'navbar__logo';
  logo.href = 'index.html';
  if (siteConfig.logo.type === 'image' && siteConfig.logo.imageUrl) {
    const img = document.createElement('img');
    img.src = siteConfig.logo.imageUrl;
    img.alt = siteConfig.siteName;
    logo.appendChild(img);
  } else {
    logo.textContent = siteConfig.logo.text;
  }
  navbar.appendChild(logo);

  // --- Nav Items ---
  const nav = document.createElement('nav');
  nav.className = 'navbar__nav';
  nav.id = 'navbar-nav';

  navData.navItems.forEach(item => {
    if (item.type === 'divider') {
      const divider = document.createElement('span');
      divider.className = 'navbar__divider';
      nav.appendChild(divider);
    } else {
      const el = createNavItem(item);
      nav.appendChild(el);
    }
  });

  navbar.appendChild(nav);

  // --- Action Buttons ---
  const actions = document.createElement('div');
  actions.className = 'navbar__actions';

  // Search Bar
  const searchBar = document.createElement('div');
  searchBar.className = 'navbar__search';
  searchBar.innerHTML = `
    <svg class="navbar__search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
    <span class="navbar__search-placeholder">Search</span>
    <span class="navbar__search-shortcut">⌘ K</span>
  `;
  actions.appendChild(searchBar);

  // Upgrade Button
  const upgradeBtn = document.createElement('a');
  upgradeBtn.href = 'pricing.html';
  upgradeBtn.className = 'navbar__btn-upgrade';
  upgradeBtn.innerHTML = `
    <span class="material-icons navbar__upgrade-icon">rocket_launch</span>
    <span>Upgrade</span>
  `;
  actions.appendChild(upgradeBtn);

  navbar.appendChild(actions);

  // --- Hamburger ---
  const hamburger = document.createElement('button');
  hamburger.className = 'navbar__hamburger';
  hamburger.id = 'navbar-hamburger';
  hamburger.setAttribute('aria-label', 'Menu');
  for (let i = 0; i < 3; i++) {
    hamburger.appendChild(document.createElement('span'));
  }
  navbar.appendChild(hamburger);

  // --- Mobile Overlay ---
  const overlay = document.createElement('div');
  overlay.className = 'navbar__mobile-overlay';
  overlay.id = 'navbar-mobile-overlay';

  navData.navItems.forEach(item => {
    if (item.type === 'divider') return;
    const el = createNavItem(item, true);
    overlay.appendChild(el);
  });

  // Mobile action buttons
  const mobileActions = document.createElement('div');
  mobileActions.style.cssText = 'display:flex;flex-direction:column;gap:12px;margin-top:24px;padding:0 16px;';
  
  const mobSearch = document.createElement('div');
  mobSearch.className = 'navbar__search';
  mobSearch.style.cssText = 'display:flex;width:100%;justify-content:space-between;';
  mobSearch.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;">
      <svg class="navbar__search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <span class="navbar__search-placeholder">Search</span>
    </div>
    <span class="navbar__search-shortcut">⌘ K</span>
  `;
  mobileActions.appendChild(mobSearch);

  const mobUpgrade = document.createElement('a');
  mobUpgrade.href = 'pricing.html';
  mobUpgrade.className = 'navbar__btn-upgrade';
  mobUpgrade.style.cssText = 'display:flex;justify-content:center;align-items:center;padding:12px;';
  mobUpgrade.innerHTML = `
    <span class="material-icons navbar__upgrade-icon" style="margin-right:8px; font-size:16px;">rocket_launch</span>
    <span>Upgrade</span>
  `;
  mobileActions.appendChild(mobUpgrade);

  overlay.appendChild(mobileActions);

  document.body.appendChild(overlay);

  // --- Event Listeners ---
  setupNavEvents(navbar, hamburger, overlay);
}

function createNavItem(item, isMobile = false) {
  const wrapper = document.createElement('div');
  wrapper.className = 'navbar__item';

  const link = document.createElement('a');
  link.className = 'navbar__link';
  link.href = item.href;
  link.textContent = item.label;

  // No dropdown arrow icon — removed per design spec

  if (item.subItems) {
    if (isMobile) {
      // Prevent navigation for items with sub-menus on mobile to allow toggling dropdown
      link.addEventListener('click', e => {
        e.preventDefault();
        wrapper.classList.toggle('active');
        // Close other items
        const siblings = wrapper.parentElement.querySelectorAll('.navbar__item.active');
        siblings.forEach(s => {
          if (s !== wrapper) s.classList.remove('active');
        });
      });
    }

    // Dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'navbar__dropdown';

    const cols = document.createElement('div');
    cols.className = 'navbar__dropdown-columns';

    item.subItems.columns.forEach(col => {
      const colEl = document.createElement('div');
      colEl.className = 'navbar__dropdown-column';

      // No column heading — removed per design spec

      col.items.forEach(sub => {
        const a = document.createElement('a');
        a.className = 'navbar__dropdown-link';
        a.href = sub.href;

        // Add 32px white SVG icon
        if (sub.icon) {
          const iconSpan = document.createElement('span');
          iconSpan.className = 'navbar__dropdown-icon';
          iconSpan.innerHTML = getIconSvg(sub.icon);
          a.appendChild(iconSpan);
        }

        const textContainer = document.createElement('div');
        textContainer.className = 'navbar__dropdown-text';

        const labelSpan = document.createElement('span');
        labelSpan.textContent = sub.label;
        textContainer.appendChild(labelSpan);

        if (sub.description) {
          const descSpan = document.createElement('span');
          descSpan.className = 'navbar__dropdown-desc';
          descSpan.textContent = sub.description;
          textContainer.appendChild(descSpan);
        }

        a.appendChild(textContainer);

        colEl.appendChild(a);
      });

      cols.appendChild(colEl);
    });

    dropdown.appendChild(cols);
    wrapper.appendChild(link);
    wrapper.appendChild(dropdown);
  } else {
    wrapper.appendChild(link);
  }

  return wrapper;
}

function setupNavEvents(navbar, hamburger, overlay) {
  // Scroll styling
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Desktop: close dropdowns when clicking outside
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      navbar.querySelectorAll('.navbar__item.active').forEach(el => el.classList.remove('active'));
    }
  });

  // Desktop: hover behavior for dropdowns
  const desktopItems = navbar.querySelectorAll('.navbar__item');
  desktopItems.forEach(item => {
    let timer;
    item.addEventListener('mouseenter', () => {
      clearTimeout(timer);
      // Close others
      desktopItems.forEach(i => {
        if (i !== item) i.classList.remove('active');
      });
      if (item.querySelector('.navbar__dropdown')) {
        item.classList.add('active');
      }
    });
    item.addEventListener('mouseleave', () => {
      timer = setTimeout(() => item.classList.remove('active'), 200);
    });
  });

  // Mobile hamburger toggle
  hamburger.addEventListener('click', () => {
    overlay.classList.toggle('open');
    document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
  });
}
