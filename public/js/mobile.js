import { initTheme } from './theme.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 0. Initialize theme
  await initTheme();

  // 1. Hamburger Menu Toggle
  const hamburger = document.querySelector('.mobile-nav__hamburger');
  const overlay = document.querySelector('.mobile-menu-overlay');
  const menuLinks = document.querySelectorAll('.mobile-menu__content a');

  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => {
      overlay.classList.toggle('active');
    });

    // Close menu when a link is clicked
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        overlay.classList.remove('active');
      });
    });
  }

  // 2. Footer Accordions
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const icon = header.querySelector('.accordion-icon');
      
      if (content) {
        // Toggle current content
        content.classList.toggle('active');
        
        // Toggle icon
        if (content.classList.contains('active')) {
          icon.textContent = 'expand_less';
        } else {
          icon.textContent = 'expand_more';
        }
      }
    });
  });

  // 3. Hero Video Carousel (Auto-fade)
  const heroVideoTrack = document.getElementById('hero-video-track');
  const heroBadgeText = document.getElementById('hero-badge-text');
  const heroDotsContainer = document.getElementById('hero-dots');

  if (heroVideoTrack && heroBadgeText && heroDotsContainer) {
    fetch('./js/hero-mobile.json')
      .then(res => res.json())
      .then(data => {
        const videos = data.heroVideos;
        let wrappers = [];
        let dots = [];
        
        videos.forEach((video, index) => {
          // Add Video Wrapper
          const wrapper = document.createElement('div');
          wrapper.className = 'hero-bg-video-wrapper' + (index === 0 ? ' active' : '');
          wrapper.innerHTML = `
            <video ${index === 0 ? 'autoplay preload="auto"' : 'preload="none"'} loop muted playsinline class="hero-bg-video">
                <source src="${video.src}" type="video/mp4">
            </video>
          `;
          heroVideoTrack.appendChild(wrapper);
          wrappers.push(wrapper);

          // Add Dot
          const dot = document.createElement('span');
          dot.className = 'dot' + (index === 0 ? ' active' : '');
          dot.style.cursor = 'pointer';
          dot.addEventListener('click', () => {
            goToSlide(index);
            resetInterval();
          });
          heroDotsContainer.appendChild(dot);
          dots.push(dot);
        });

        // Set initial label
        if (videos.length > 0) {
          heroBadgeText.textContent = videos[0].label;
        }

        let currentIndex = 0;
        let slideInterval;

        const goToSlide = (index) => {
          // Remove active class from old slide
          wrappers[currentIndex].classList.remove('active');
          dots[currentIndex].classList.remove('active');
          
          currentIndex = index;
          
          // Add active class to new slide
          wrappers[currentIndex].classList.add('active');
          dots[currentIndex].classList.add('active');
          heroBadgeText.textContent = videos[currentIndex].label;
          
          // Play the new video
          const newVid = wrappers[currentIndex].querySelector('video');
          if (newVid) {
            if (newVid.readyState === 0) newVid.load();
            newVid.play().catch(() => {});
          }
        };

        const nextSlide = () => {
          const newIndex = (currentIndex + 1) % videos.length;
          goToSlide(newIndex);
        };

        const resetInterval = () => {
          clearInterval(slideInterval);
          slideInterval = setInterval(nextSlide, 5000); // Change every 5 seconds
        };

        // Start auto-play
        resetInterval();
      })
      .catch(err => console.error("Failed to load hero videos:", err));
  }

  // 4. Optional: Smooth Scrolling for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Delay lower section fetching to prioritize hero video
  setTimeout(() => {
  // 5. Trust Logos Ticker
  const trustLogosTrack = document.getElementById('trust-logos-track');
  if (trustLogosTrack) {
    fetch('./js/trust-logos.json')
      .then(res => res.json())
      .then(data => {
        const logos = data.logos;
        // Duplicate the array for seamless infinite scroll
        const tickerLogos = [...logos, ...logos];
        
        trustLogosTrack.innerHTML = ''; // Clear existing
        
        tickerLogos.forEach(logo => {
          const card = document.createElement('div');
          card.className = 'trust-logo-card';
          card.innerHTML = `<img src="${logo.src}" alt="${logo.alt}" style="height: 24px; filter: brightness(0) invert(1);">`;
          trustLogosTrack.appendChild(card);
        });
      })
      .catch(err => console.error("Failed to load trust logos:", err));
  }

  // 6. Model Icons Fetch
  fetch('./js/model-icons.json?v=1.0.3')
    .then(res => res.json())
    .then(data => {
      const modelIcons = document.querySelectorAll('.model-icon');
      modelIcons.forEach((iconContainer, index) => {
        if (data.icons && data.icons[index]) {
          iconContainer.innerHTML = `<img src="${data.icons[index]}" alt="Model Icon">`;
        }
      });
    })
    .catch(err => console.error("Failed to load model icons:", err));

  // 7. Community Masonry Fetch
  const masonryLeft = document.getElementById('masonry-left');
  const masonryRight = document.getElementById('masonry-right');
  
  if (masonryLeft && masonryRight) {
    fetch('./js/community-content.json')
      .then(res => res.json())
      .then(data => {
        const buildCards = (colData) => {
          let html = '';
          const items = [...colData, ...colData];
          items.forEach(item => {
            const avatarHtml = item.avatar 
              ? `<img src="${item.avatar}" class="creator-avatar">`
              : `<div class="creator-avatar fallback">${item.avatarText}</div>`;
              
            html += `
                <div class="creator-card">
                    <img src="${item.bgImage}" class="creator-bg">
                    <div class="creator-overlay"></div>
                    <div class="creator-info">
                        ${avatarHtml}
                        <span class="creator-handle">${item.handle}</span>
                    </div>
                </div>
            `;
          });
          return html;
        };

        masonryLeft.innerHTML = buildCards(data.leftColumn);
        masonryRight.innerHTML = buildCards(data.rightColumn);
      })
      .catch(err => console.error("Failed to load community content:", err));
  }

  // 8. Marketing Carousel Fetch
  const marketingTrack = document.getElementById('marketing-carousel-track');
  if (marketingTrack) {
    fetch('./js/marketing-content.json')
      .then(res => res.json())
      .then(data => {
        let html = '';
        data.carousel.forEach(item => {
          html += `
            <div class="marketing-card">
                <video autoplay loop muted playsinline preload="none" src="${item.video}" alt="${item.title}"></video>
                <div class="marketing-card-title">${item.title}</div>
                <div class="marketing-card-subtitle">${item.subtitle}</div>
            </div>
          `;
        });
        marketingTrack.innerHTML = html;
      })
      .catch(err => console.error("Failed to load marketing content:", err));
  }

  // 9. Customer Reviews Fetch & Rotation
  const reviewContainer = document.getElementById('review-card-container');
  const reviewPrev = document.getElementById('review-prev');
  const reviewNext = document.getElementById('review-next');
  
  if (reviewContainer) {
    fetch('./js/reviews-content.json')
      .then(res => res.json())
      .then(data => {
        let currentReviewIndex = 0;
        let reviewInterval;
        
        // Build the HTML for all reviews
        const html = data.reviews.map((review, index) => {
          let starsHtml = '';
          for(let i=0; i<5; i++) {
            if(i < review.rating) {
              starsHtml += '<span class="material-icons">star</span>';
            } else {
              starsHtml += '<span class="material-icons empty">star</span>';
            }
          }
          
          return `
            <div class="review-item ${index === 0 ? 'active' : ''}" data-index="${index}">
              <div class="review-inner">
                <div class="review-header">
                  <div class="review-title">${review.title}</div>
                  <div class="review-stars">${starsHtml}</div>
                </div>
                <div class="review-text">${review.text}</div>
              </div>
              <div class="review-author">
                <div class="review-avatar">${review.avatarText}</div>
                <div class="review-author-name">${review.author}</div>
              </div>
            </div>
          `;
        }).join('');
        
        reviewContainer.innerHTML = html;
        const reviewItems = reviewContainer.querySelectorAll('.review-item');
        
        const showReview = (index) => {
          reviewItems.forEach(item => item.classList.remove('active'));
          reviewItems[index].classList.add('active');
        };
        
        const nextReview = () => {
          currentReviewIndex = (currentReviewIndex + 1) % reviewItems.length;
          showReview(currentReviewIndex);
        };
        
        const prevReview = () => {
          currentReviewIndex = (currentReviewIndex - 1 + reviewItems.length) % reviewItems.length;
          showReview(currentReviewIndex);
        };
        
        const startRotation = () => {
          clearInterval(reviewInterval);
          reviewInterval = setInterval(nextReview, 5000);
        };
        
        if (reviewPrev && reviewNext) {
          reviewPrev.addEventListener('click', () => {
            prevReview();
            startRotation(); // Reset timer on manual click
          });
          reviewNext.addEventListener('click', () => {
            nextReview();
            startRotation(); // Reset timer on manual click
          });
        }
        
        startRotation();
      })
      .catch(err => console.error("Failed to load reviews:", err));
  }

  // 10. FAQ Accordion Fetch
  const faqContainer = document.getElementById('faq-accordion');
  if (faqContainer) {
    fetch('./js/faq-content.json')
      .then(res => res.json())
      .then(data => {
        let html = '';
        data.faqs.forEach((faq, index) => {
          html += `
            <div class="faq-item">
              <button class="faq-question">
                ${faq.question}
                <span class="faq-icon material-icons">expand_more</span>
              </button>
              <div class="faq-answer">
                ${faq.answer}
              </div>
            </div>
          `;
        });
        faqContainer.innerHTML = html;
        
        // Add click listeners for accordion
        const faqItems = faqContainer.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
          const btn = item.querySelector('.faq-question');
          btn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items (optional: allows only one open at a time)
            faqItems.forEach(i => i.classList.remove('active'));
            
            // Toggle current
            if (!isActive) {
              item.classList.add('active');
            }
          });
        });
      })
      .catch(err => console.error("Failed to load FAQs:", err));
  }
  }, 1000); // End of delayed execution
});

// Register Service Worker for media caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered successfully:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
