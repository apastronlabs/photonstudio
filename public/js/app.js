/**
 * Photon Studio — Main Application Entry
 * Initializes all components
 */

import { initNavbar } from './navbar.js?v=1.0.3';
import { initCarousel } from './carousel.js?v=1.0.3';
import { initLazyVideos } from './lazy-video.js?v=1.0.3';
import { renderFooter } from './footer.js?v=1.0.3';
import { initTheme } from './theme.js?v=1.0.3';

async function init() {
  // Execute all initializations and fetches concurrently to drastically reduce load times
  const [carouselData, sectionsData, navData, appData] = await Promise.all([
    fetch('./js/carousel-data.json?v=1.0.4').then(r => r.json()),
    fetch('./js/sections-data.json?v=1.0.3').then(r => r.json()),
    fetch('./js/nav-data.json?v=1.0.3').then(r => r.json()),
    fetch('./js/app-data.json?v=1.0.0').then(r => r.json()),
    initTheme(),
    initNavbar()
  ]);

  // Section 2: 16:9 landscape carousel
  initCarousel('#carousel-section-2', carouselData.section2, {
    aspectRatio: '16/9',
    cardClass: 'carousel__card--landscape',
    desktopVisible: 3.5,
    tabletVisible: 2,
    mobileVisible: 1.5
  });

  // Section 7: 4:5 portrait carousel
  initCarousel('#carousel-section-7', appData, {
    aspectRatio: '4/5',
    cardClass: 'carousel__card--portrait',
    desktopVisible: 7.5,
    tabletVisible: 4.5,
    mobileVisible: 2.5
  });

  // 3. Feature Sections (4, 5, 6)
  renderFeatureSections(sectionsData.sections);
  setTimeout(resizeBentoItems, 100);

  // 4. Footer
  renderFooter(navData);

  // 5. Lazy video loading — after all DOM is built
  requestAnimationFrame(() => {
    initLazyVideos();
    resizeBentoItems();
  });
}

function renderFeatureSections(sections) {
  const container = document.getElementById('feature-sections');
  if (!container) return;

  sections.forEach((section, idx) => {
    const el = document.createElement('section');
    el.className = 'feature-section';
    el.id = section.id;

    // Info column (30%) — stacked: Image(z0) → Title(z2) → Button(z6)
    const info = document.createElement('div');
    info.className = 'feature-section__info';

    const heroImg = document.createElement('img');
    heroImg.className = 'feature-section__hero-img';
    heroImg.src = section.heroImage;
    heroImg.alt = section.title;
    heroImg.loading = 'lazy';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'feature-section__content';

    const title = document.createElement('h2');
    title.className = 'feature-section__title';
    title.textContent = section.title;

    const text = document.createElement('p');
    text.className = 'feature-section__text';
    text.textContent = section.paragraph;

    const btn = document.createElement('a');
    btn.className = 'btn-feature';
    btn.href = section.buttonHref;

    const icon = document.createElement('img');
    icon.src = './assets/icons/generate icon.png';
    icon.alt = '';
    icon.className = 'btn-feature__icon';

    const textSpan = document.createElement('span');
    textSpan.textContent = section.buttonText;

    btn.appendChild(icon);
    btn.appendChild(textSpan);

    contentWrapper.appendChild(title);
    contentWrapper.appendChild(text);
    contentWrapper.appendChild(btn);

    info.appendChild(heroImg);
    info.appendChild(contentWrapper);

    // Bento column (70%)
    const bento = document.createElement('div');
    bento.className = 'feature-section__bento';

    section.bentoItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'bento-card';
      if (item.type === 'landscape') {
        card.classList.add('bento-card--double');
      }

      if (item.imageUrl && item.imageUrl.toLowerCase().includes('.mp4')) {
        const video = document.createElement('video');
        video.src = item.imageUrl;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('disablepictureinpicture', '');
        video.controls = false;
        video.addEventListener('loadedmetadata', resizeBentoItems);
        video.addEventListener('loadeddata', resizeBentoItems);
        video.addEventListener('canplay', resizeBentoItems);
        card.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = item.imageUrl;
        img.alt = item.label;
        img.loading = 'lazy';
        img.addEventListener('load', resizeBentoItems);
        card.appendChild(img);
      }
      
      // No label/tag text — removed per design spec
      bento.appendChild(card);
    });

    el.appendChild(info);
    el.appendChild(bento);
    
    const overlay = document.createElement('div');
    overlay.className = 'section_gradient_overlay';
    el.appendChild(overlay);

    container.appendChild(el);
  });
  requestAnimationFrame(resizeBentoItems);
}

function resizeBentoItems() {
  if (window.innerWidth <= 768) {
    // Clean up any spans if user resizes from desktop to mobile
    document.querySelectorAll('.bento-card').forEach(card => {
      card.style.gridRowEnd = '';
    });
    return;
  }

  const bentoGrids = document.querySelectorAll('.feature-section__bento');
  bentoGrids.forEach(grid => {
    const cards = grid.querySelectorAll('.bento-card');
    
    // Pass 1: Reset grid rows and image heights to get natural height
    cards.forEach(card => {
      card.style.gridRowEnd = 'auto';
      const media = card.querySelector('img, video');
      if (media) {
         media.style.height = 'auto';
      }
    });
    
    // Pass 2: Calculate and apply spans, then set image height to 100%
    cards.forEach(card => {
      const media = card.querySelector('img, video');
      if (!media) return;
      
      const mediaHeight = media.getBoundingClientRect().height;
      if (mediaHeight > 0) {
        const rowHeight = 1; // matches grid-auto-rows
        const rowGap = 8;    // matches gap
        const totalHeight = mediaHeight + 2; // +2 for borders
        const rowSpan = Math.ceil((totalHeight + rowGap) / (rowHeight + rowGap));
        
        card.style.gridRowEnd = `span ${rowSpan}`;
        media.style.height = '100%';
      }
    });
  });
}

// Attach event listeners for resize and load
window.addEventListener('resize', resizeBentoItems);
window.addEventListener('load', resizeBentoItems);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Register Service Worker for media caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered successfully:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
