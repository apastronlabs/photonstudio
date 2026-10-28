/**
 * Photon Studio — Carousel Component
 * Reusable horizontal scroll carousel with glassmorphism nav buttons
 */

export function initCarousel(containerSelector, cards, options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const {
    aspectRatio = '16/9',
    cardClass = '',
    desktopVisible = 3.5,
    tabletVisible = 2,
    mobileVisible = 1.5
  } = options;

  // Build wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel__wrapper';

  const track = document.createElement('div');
  track.className = 'carousel__track';

  // Calculate card widths
  const updateCardWidths = () => {
    const vw = window.innerWidth;
    const marginPx = vw * 0.02; // 2% margin
    const gapPx = 16;
    let visible;
    if (vw >= 1200) visible = desktopVisible;
    else if (vw >= 768) visible = tabletVisible;
    else visible = mobileVisible;

    // Total available width for the track viewport
    const trackWidth = vw - marginPx * 2;
    // Number of gaps between visible cards (including fractional)
    const totalGaps = Math.floor(visible) * gapPx;
    const cardWidth = (trackWidth - totalGaps) / visible;

    track.querySelectorAll('.carousel__card').forEach(card => {
      card.style.width = `${cardWidth}px`;
      card.style.minWidth = `${cardWidth}px`;
    });
  };

  // Create cards
  cards.forEach(cardData => {
    const card = document.createElement('div');
    card.className = `carousel__card ${cardClass}`;

    const mediaWrapper = document.createElement('div');
    mediaWrapper.className = 'carousel__card-media';
    mediaWrapper.style.aspectRatio = aspectRatio;

    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.src = cardData.videoUrl;
    video.autoplay = true;
    // Poster: use a transparent pixel to avoid flash
    video.style.background = 'rgba(255,255,255,0.03)';
    video.play().catch(() => {});
    mediaWrapper.appendChild(video);

    card.appendChild(mediaWrapper);

    const info = document.createElement('div');
    info.className = 'carousel__card-info';

    const title = document.createElement('div');
    title.className = 'carousel__card-title';
    title.textContent = cardData.title;

    const subtitle = document.createElement('div');
    subtitle.className = 'carousel__card-subtitle';
    subtitle.textContent = cardData.subtitle;

    info.appendChild(title);
    info.appendChild(subtitle);
    card.appendChild(info);

    if (cardData.link || cardData.title === 'Unlimited Seedance 2.5') {
      const targetUrl = cardData.link || 'unlimited-seedance-2.5.html';
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        // Prevent accidental trigger if user clicked carousel nav buttons
        if (e.target.closest('.carousel__nav-btn')) return;
        window.location.href = targetUrl;
      });
    }

    track.appendChild(card);
  });

  wrapper.appendChild(track);

  // Nav buttons
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel__nav-btn carousel__nav-btn--prev';
  prevBtn.innerHTML = '&#8592;';
  prevBtn.setAttribute('aria-label', 'Previous');

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel__nav-btn carousel__nav-btn--next';
  nextBtn.innerHTML = '&#8594;';
  nextBtn.setAttribute('aria-label', 'Next');

  wrapper.appendChild(prevBtn);
  wrapper.appendChild(nextBtn);

  container.appendChild(wrapper);

  // Scroll logic
  const scrollAmount = () => {
    const firstCard = track.querySelector('.carousel__card');
    return firstCard ? firstCard.offsetWidth + 16 : 300;
  };

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -scrollAmount() * 2, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: scrollAmount() * 2, behavior: 'smooth' });
  });

  // Initial sizing + resize
  updateCardWidths();
  window.addEventListener('resize', updateCardWidths);

  return { track, updateCardWidths };
}
