import { initTheme } from './theme.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 0. Initialize theme
    await initTheme();

    // 1. Navigation Menu Toggle
    const overlay = document.querySelector('.mobile-menu-overlay');
    const menuLinks = document.querySelectorAll('.mobile-menu__content a');


    // 2. Footer Accordions (Exactly like in mobile.html)
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.accordion-icon');
            if (content) {
                content.classList.toggle('active');
                if (content.classList.contains('active')) {
                    icon.textContent = 'expand_less';
                } else {
                    icon.textContent = 'expand_more';
                }
            }
        });
    });

    // 3. FAQ Accordion (Exactly like in mobile.html)
    const faqContainer = document.getElementById('faq-accordion');
    if (faqContainer) {
        fetch('./js/faq-content.json')
            .then(res => res.json())
            .then(data => {
                let html = '';
                data.faqs.forEach((faq) => {
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

                const faqItems = faqContainer.querySelectorAll('.faq-item');
                faqItems.forEach(item => {
                    const btn = item.querySelector('.faq-question');
                    btn.addEventListener('click', () => {
                        const isActive = item.classList.contains('active');
                        faqItems.forEach(i => i.classList.remove('active'));
                        if (!isActive) {
                            item.classList.add('active');
                        }
                    });
                });
            })
            .catch(err => console.error("Failed to load FAQs:", err));
    }

    // 4. Pricing Logic
    let pricingData = null;
    let billingPeriod = 'annual'; // 'annual' or 'monthly'
    let selectedPlan = 'plus'; // Default selected plan is 'plus'

    try {
        pricingData = await fetch('./js/pricing-data.json').then(r => r.json());
    } catch (e) {
        console.error("Failed to fetch pricing data:", e);
        // Fallback data in case of fetch failure
        pricingData = {
            basic: { monthly: 3, annual: 3, monthlyOld: null, annualOld: null },
            plus: { monthly: 49, annual: 39, monthlyOld: null, annualOld: 49 },
            ultra: { monthly: 129, annual: 99, monthlyOld: null, annualOld: 129 }
        };
    }

    // Stripe Payment URLs
    const STRIPE_URLS = {
        basic: {
            monthly: 'https://pay.photonstudio.ai/b/00w3cvd0hfYMcelgvGgA800?client_reference_id=',
            annual: 'https://pay.photonstudio.ai/b/dRmfZh7FXbIwemt0wIgA801?client_reference_id='
        },
        plus: { // PRO
            monthly: 'https://pay.photonstudio.ai/b/9B6cN58K1aEsdipgvGgA803?client_reference_id=',
            annual: 'https://pay.photonstudio.ai/b/4gMcN5aS913SdipdjugA802?client_reference_id='
        },
        ultra: { // PRO MAX
            monthly: 'https://pay.photonstudio.ai/b/bJe6oHe4l5k87Y5cfqgA805?client_reference_id=',
            annual: 'https://pay.photonstudio.ai/b/14AaEX4tLeUIa6d1AMgA804?client_reference_id='
        }
    };

    const getStripeUrl = (planKey, period) => {
        let key = 'plus';
        if (planKey === 'basic') key = 'basic';
        else if (planKey === 'ultra' || planKey === 'pro-max' || planKey === 'max') key = 'ultra';
        const p = (period === 'monthly') ? 'monthly' : 'annual';
        return STRIPE_URLS[key][p];
    };

    window.getStripeUrl = getStripeUrl;
    window.navigateToStripe = (plan) => {
        window.location.href = getStripeUrl(plan, billingPeriod);
    };

    // Sync Toggles (both top and bottom toggles)
    const toggles = document.querySelectorAll('.billing-toggle-container');
    const updateTogglesUI = () => {
        toggles.forEach(toggleContainer => {
            const annualBtn = toggleContainer.querySelector('[data-period="annual"]');
            const monthlyBtn = toggleContainer.querySelector('[data-period="monthly"]');

            if (billingPeriod === 'annual') {
                annualBtn.classList.add('active');
                monthlyBtn.classList.remove('active');
            } else {
                annualBtn.classList.remove('active');
                monthlyBtn.classList.add('active');
            }
        });
    };

    toggles.forEach(toggleContainer => {
        const buttons = toggleContainer.querySelectorAll('.toggle-option');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                billingPeriod = btn.getAttribute('data-period');
                updateTogglesUI();
                updatePricingUI();
            });
        });
    });

    // Plan Selection Click Handler for Cards
    // Since there are top and bottom stacks, we should handle selection separately but sync state.
    const bindCardClicks = () => {
        const cards = document.querySelectorAll('.pricing-ticket');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                selectedPlan = card.getAttribute('data-plan');
                
                // Highlight selected card globally
                document.querySelectorAll('.pricing-ticket').forEach(c => {
                    if (c.getAttribute('data-plan') === selectedPlan) {
                        c.classList.add('selected');
                    } else {
                        c.classList.remove('selected');
                    }
                });

                updatePricingUI();
            });
        });
    };

    // Update Pricing Display
    const updatePricingUI = () => {
        if (!pricingData) return;

        // 1. Update Card Pricing Amounts
        const basicPrices = document.querySelectorAll('[data-price-amount="basic"]');
        basicPrices.forEach(el => el.textContent = `$${pricingData.basic[billingPeriod]}`);

        const plusPrices = document.querySelectorAll('[data-price-amount="plus"]');
        plusPrices.forEach(el => el.textContent = `$${pricingData.plus[billingPeriod]}`);
        
        const ultraPrices = document.querySelectorAll('[data-price-amount="ultra"]');
        ultraPrices.forEach(el => el.textContent = `$${pricingData.ultra[billingPeriod]}`);

        // Update Card Pricing Period Subtexts
        const pricePeriods = document.querySelectorAll('[data-price-period]');
        pricePeriods.forEach(el => {
            const plan = el.getAttribute('data-price-period');
            if (plan === 'basic') {
                el.textContent = 'per month';
            } else if (plan === 'plus' || plan === 'ultra') {
                el.textContent = billingPeriod === 'annual' ? 'per month, billed annually' : 'per month, billed monthly';
            }
        });

        // 3. Update Sticky Bottom Bar
        const stickyBillingText = document.querySelector('.sticky-bottom-bar .sticky-billing-text');
        const stickyCtaBtn = document.querySelector('.sticky-bottom-bar .sticky-cta-btn');

        if (stickyCtaBtn) {
            const priceVal = pricingData[selectedPlan][billingPeriod];

            // Map display name
            let planDisplay = selectedPlan.toUpperCase();
            if (selectedPlan === 'plus') planDisplay = 'PRO';
            if (selectedPlan === 'ultra') planDisplay = 'PRO MAX';
            
            stickyCtaBtn.textContent = `GET ${planDisplay} — $${priceVal}`;
        }

        if (stickyBillingText) {
            if (billingPeriod === 'annual') {
                stickyBillingText.textContent = 'Billed Annually';
            } else {
                stickyBillingText.textContent = 'Billed Monthly';
            }
        }

        // 4. Update Main CTA Button below tickets
        const mainCtas = document.querySelectorAll('.action-cta');
        mainCtas.forEach(cta => {
            let planDisplay = selectedPlan.toUpperCase();
            if (selectedPlan === 'plus') planDisplay = 'PRO';
            if (selectedPlan === 'ultra') planDisplay = 'PRO MAX';
            cta.innerHTML = `Get ${planDisplay} <span class="material-icons" style="font-size: 18px;">arrow_forward</span>`;
            cta.href = getStripeUrl(selectedPlan, billingPeriod);
        });

        // 5. Update Card Buttons href & bonus button visibility
        const isAnnual = (billingPeriod === 'annual');
        document.querySelectorAll('.pricing-ticket').forEach(card => {
            const plan = card.getAttribute('data-plan');
            const btn = card.querySelector('.ticket-btn');
            if (btn && plan) {
                btn.href = getStripeUrl(plan, billingPeriod);
                if (plan === 'plus' || plan === 'ultra') {
                    btn.style.marginBottom = isAnnual ? '12px' : '0px';
                }
            }
            const bonusBtn = card.querySelector('.seedance-unlimited-btn');
            if (bonusBtn && plan) {
                bonusBtn.href = getStripeUrl(plan, billingPeriod);
                bonusBtn.style.display = isAnnual ? 'flex' : 'none';
            }
        });
        document.querySelectorAll('.seedance-unlimited-btn').forEach(btn => {
            btn.style.display = isAnnual ? 'flex' : 'none';
        });

        // 6. Update Sticky CTA href
        if (stickyCtaBtn) {
            stickyCtaBtn.href = getStripeUrl(selectedPlan, billingPeriod);
        }

        // 7. Update Table CTA href
        const tableCta = document.querySelector('.pricing-cta');
        if (tableCta) {
            tableCta.href = getStripeUrl('plus', billingPeriod);
        }
    };

    // Attach event listeners to initial setup
    bindCardClicks();
    updatePricingUI();

    // 5. Scroll listener to show sticky bottom bar
    const mainCta = document.querySelector('.action-cta');
    const stickyBar = document.querySelector('.sticky-bottom-bar');
    
    if (mainCta && stickyBar) {
        window.addEventListener('scroll', () => {
            const ctaPosition = mainCta.getBoundingClientRect().bottom + window.scrollY;
            const scrollPosition = window.scrollY + window.innerHeight;
            
            // Show sticky bar once user scrolls past the top cards CTA
            if (window.scrollY > 300) {
                stickyBar.classList.add('visible');
            } else {
                stickyBar.classList.remove('visible');
            }
        });
    }

    // 6. Direct Stripe Redirection on Button Clicks
    document.querySelectorAll('.ticket-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const card = btn.closest('.pricing-ticket');
            const plan = btn.getAttribute('data-plan') || (card && card.getAttribute('data-plan')) || selectedPlan;
            window.location.href = getStripeUrl(plan, billingPeriod);
        });
    });

    document.querySelectorAll('.action-cta').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = getStripeUrl(selectedPlan, billingPeriod);
        });
    });

    const stickyCtaBtnEl = document.querySelector('.sticky-bottom-bar .sticky-cta-btn');
    if (stickyCtaBtnEl) {
        stickyCtaBtnEl.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = getStripeUrl(selectedPlan, billingPeriod);
        });
    }

    const tableCtaBtn = document.querySelector('.pricing-cta');
    if (tableCtaBtn) {
        tableCtaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = getStripeUrl('plus', billingPeriod);
        });
    }

    // Navbar buttons
    const loginBtn = document.querySelector('.mobile-nav__btn-login');
    const getStartedBtn = document.querySelector('.mobile-nav__btn-primary');

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'https://app.photonstudio.ai/login';
        });
    }

    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'https://app.photonstudio.ai';
        });
    }


    // 6. Community Masonry Fetch (Replicated from mobile.js)
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

    // 7. 15-Minute Countdown Timer Stored in Cache (localStorage)
    const countdownTimerEl = document.getElementById('countdown-timer');
    if (countdownTimerEl) {
        const TIMER_DURATION_MS = 15 * 60 * 1000; // 15 minutes
        let endTime = localStorage.getItem('pricing_countdown_end_time');
        
        if (!endTime) {
            // Set end time to 15 minutes from now and store it
            endTime = Date.now() + TIMER_DURATION_MS;
            localStorage.setItem('pricing_countdown_end_time', endTime);
        } else {
            endTime = parseInt(endTime, 10);
            // If the stored end time has already passed, reset it
            if (Date.now() > endTime) {
                endTime = Date.now() + TIMER_DURATION_MS;
                localStorage.setItem('pricing_countdown_end_time', endTime);
            }
        }

        const updateTimer = () => {
            const now = Date.now();
            const timeRemaining = endTime - now;

            if (timeRemaining <= 0) {
                countdownTimerEl.textContent = '00:00';
                clearInterval(timerInterval);
            } else {
                const totalSeconds = Math.floor(timeRemaining / 1000);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                
                const minutesStr = String(minutes).padStart(2, '0');
                const secondsStr = String(seconds).padStart(2, '0');
                
                countdownTimerEl.textContent = `${minutesStr}:${secondsStr}`;
            }
        };

        // Run immediately and then start interval
        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
    }

    // 8. Avatar Tabs Toggle
    const avatarTabs = document.querySelectorAll('.avatar-tab');
    const avatarMainImg = document.getElementById('avatar-main-img');
    
    const specLabels = [
        document.getElementById('spec-card-1').querySelector('.spec-label'),
        document.getElementById('spec-card-2').querySelector('.spec-label'),
        document.getElementById('spec-card-3').querySelector('.spec-label'),
        document.getElementById('spec-card-4').querySelector('.spec-label')
    ];
    
    const specPlaceholders = [
        document.getElementById('spec-card-1').querySelector('.spec-img-placeholder'),
        document.getElementById('spec-card-2').querySelector('.spec-img-placeholder'),
        document.getElementById('spec-card-3').querySelector('.spec-img-placeholder'),
        document.getElementById('spec-card-4').querySelector('.spec-img-placeholder')
    ];

    const avatarData = {
        business_woman: {
            img: './assets/images/business_woman.png',
            labels: ['BROWN', 'WARM', 'SUIT', 'BOB CUT'],
            gradients: [
                'radial-gradient(circle, #8E7C68 0%, #4A3E31 100%)',
                'radial-gradient(circle, #E6C5B3 0%, #AF8671 100%)',
                'radial-gradient(circle, #333945 0%, #171B24 100%)',
                'radial-gradient(circle, #292929 0%, #0F0F0F 100%)'
            ]
        },
        fashion_influencer: {
            img: './assets/images/fashion_influencer.png',
            labels: ['GREY', 'PALE', 'CASUAL', 'LONG BLONDE'],
            gradients: [
                'radial-gradient(circle, #6C7A89 0%, #2C3E50 100%)',
                'radial-gradient(circle, #F5D6C6 0%, #C49F8C 100%)',
                'radial-gradient(circle, #E8D7F1 0%, #8A649E 100%)',
                'radial-gradient(circle, #F3E5AB 0%, #C2B280 100%)'
            ]
        },
        tech_bro: {
            img: './assets/images/tech_bro.png',
            labels: ['BLUE', 'TAN', 'HOODIE', 'SHORT CUT'],
            gradients: [
                'radial-gradient(circle, #4183D7 0%, #22313F 100%)',
                'radial-gradient(circle, #D5A6BD 0%, #8E7C68 100%)',
                'radial-gradient(circle, #3E3E3E 0%, #1A1A1A 100%)',
                'radial-gradient(circle, #1F1F1F 0%, #050505 100%)'
            ]
        }
    };

    avatarTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            avatarTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const type = tab.getAttribute('data-avatar');
            const data = avatarData[type];

            if (data) {
                // Smooth fade effect for the image swap
                avatarMainImg.style.opacity = 0.3;
                setTimeout(() => {
                    avatarMainImg.src = data.img;
                    avatarMainImg.style.opacity = 1;
                }, 150);

                // Update overlay labels and gradients
                data.labels.forEach((label, idx) => {
                    specLabels[idx].textContent = label;
                });
                data.gradients.forEach((gradient, idx) => {
                    specPlaceholders[idx].style.background = gradient;
                });
            }
        });
    });
});

// Register Service Worker for media caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered successfully:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
