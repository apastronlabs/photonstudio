import { initNavbar } from './navbar.js?v=1.0.3';
import { renderFooter } from './footer.js?v=1.0.3';
import { initTheme } from './theme.js?v=1.0.3';

async function initPricing() {
  // Execute all initializations and fetches concurrently to drastically reduce load times
  const [navData, pricingData, fetchedComparisonData] = await Promise.all([
    fetch('./js/nav-data.json?v=1.0.3').then(r => r.json()),
    fetch('./js/pricing-data.json?v=1.0.3').then(r => r.json()),
    fetch('./js/pricing-comparision.json?v=1.0.0').then(r => r.json()),
    initTheme(),
    initNavbar()
  ]);

  globalComparisonData = fetchedComparisonData;

  renderFooter(navData);
  
  setupBanner();
  setupPricingTiers(pricingData);
  setupEnterprisePlan();
  setupBestPlanCalculator(pricingData);
  setupComparePlans();
  await setupFAQs();
}

function setupBanner() {
  const container = document.getElementById('pricing-banner');
  if (!container) return;

  container.innerHTML = `
    <div class="banner-badge">
      <svg viewBox="0 0 24 24" width="10" height="10" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
        <line x1="7" y1="7" x2="7.01" y2="7"></line>
      </svg>
      SPECIAL 30 % OFF
    </div>
    <div class="pricing-banner-title">
      NANO BANANA PRO & NANO BANANA 2.1 UNLIMITED.
    </div>
    <div class="pricing-banner-subtitle">
      KLING 4.0 UNLIMITED WITH 30% OFF
    </div>
    <div class="pricing-banner-text">
      Get Nano Banana 2.1 & Pro Unlimited on Ultra plan for 7 days with Special 30% discount
    </div>
  `;
}

// Stripe Payment URLs
const STRIPE_URLS = {
  basic: {
    monthly: 'https://pay.photonstudio.ai/b/00w3cvd0hfYMcelgvGgA800?client_reference_id=',
    annual: 'https://pay.photonstudio.ai/b/dRmfZh7FXbIwemt0wIgA801?client_reference_id='
  },
  pro: {
    monthly: 'https://pay.photonstudio.ai/b/9B6cN58K1aEsdipgvGgA803?client_reference_id=',
    annual: 'https://pay.photonstudio.ai/b/4gMcN5aS913SdipdjugA802?client_reference_id='
  },
  max: {
    monthly: 'https://pay.photonstudio.ai/b/bJe6oHe4l5k87Y5cfqgA805?client_reference_id=',
    annual: 'https://pay.photonstudio.ai/b/14AaEX4tLeUIa6d1AMgA804?client_reference_id='
  }
};

function getStripeUrl(planKey, annual = isAnnual) {
  let key = 'pro';
  const norm = (planKey || '').toLowerCase();
  if (norm.includes('basic')) key = 'basic';
  else if (norm.includes('max') || norm.includes('ultra')) key = 'max';
  else if (norm.includes('pro') || norm.includes('plus')) key = 'pro';

  const period = annual ? 'annual' : 'monthly';
  return STRIPE_URLS[key][period];
}

function navigateToStripe(planKey) {
  const url = getStripeUrl(planKey, isAnnual);
  window.location.href = url;
}

// Global fallbacks
window.handlePlanClick = (e, plan = 'pro') => {
  if (e && e.preventDefault) e.preventDefault();
  navigateToStripe(plan);
};
window.navigateToStripe = navigateToStripe;
window.getStripeUrl = getStripeUrl;

let isAnnual = true;
let businessSeats = 2;
let globalPricingData = null;
let globalComparisonData = null;

function setupPricingTiers(pricingData) {
  globalPricingData = pricingData;
  const container = document.getElementById('pricing-tiers');
  if (!container) return;

  container.innerHTML = `
    <div class="pricing-tiers-container">
      <div class="pricing-header">
        <h2 class="pricing-title">PICK YOUR PLAN</h2>
        <p class="pricing-subtitle">Scale creativity with higher limits, priority access, and early features</p>
        
        <div class="pricing-toggle-wrapper">
          <span>Monthly</span>
          <div class="toggle-switch active" id="billing-toggle">
            <div class="toggle-slider"></div>
          </div>
          <span>Annual <span class="discount-badge">30% OFF</span></span>
        </div>
      </div>
      <div id="pricing-grid-container"></div>
    </div>
  `;

  const toggleBtn = document.getElementById('billing-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isAnnual = !isAnnual;
      renderPricingGrid();
    });
  }

  renderPricingGrid();
}

function renderPricingGrid() {
  const gridContainer = document.getElementById('pricing-grid-container');
  if (!gridContainer || !globalPricingData) return;

  const mainToggle = document.getElementById('billing-toggle');
  const compToggle = document.getElementById('compare-billing-toggle');
  const calcToggle = document.querySelector('#best-plan-calculator .calc-bottom-toggles .toggle-switch');

  if (isAnnual) {
    if (mainToggle) mainToggle.classList.add('active');
    if (compToggle) compToggle.classList.add('active');
    if (calcToggle) calcToggle.classList.add('active');
  } else {
    if (mainToggle) mainToggle.classList.remove('active');
    if (compToggle) compToggle.classList.remove('active');
    if (calcToggle) calcToggle.classList.remove('active');
  }

  if (typeof setupComparePlans === "function") setupComparePlans();
  if (window.updateCalcCardState) window.updateCalcCardState();

  const basicPrice = "$" + (isAnnual ? 5 : 7);
  const proPrice = "$" + (isAnnual ? 10 : 14);
  const proMaxPrice = "$" + (isAnnual ? 24 : 29);

  const getSeedanceBonusBtn = (planKey, mb = "24px") => !isAnnual ? '' : `
        <a href="${getStripeUrl(planKey, isAnnual)}" class="seedance-unlimited-btn" data-plan="${planKey}" style="margin-bottom: ${mb}; position: relative; z-index: 2;">
          <svg width="16" height="16" viewBox="0 0 512 512" fill="#000000" style="flex-shrink:0;">
            <path d="M190.5 68.8C180.9 36 154.7 16 123.6 16c-38.3 0-67.6 34.6-67.6 74.5 0 26.6 14.3 50.1 35.8 61.5H32c-17.7 0-32 14.3-32 32v64c0 8.8 7.2 16 16 16h176V68.8zM123.6 80c-7.7 0-14.8-4.4-17.9-11.4-3.1-7-1.7-15.1 3.5-20.7 5.2-5.5 13-7.9 20.3-6.2 7.3 1.7 12.8 7.6 13.9 15.1 1.1 7.4-2.4 14.7-8.8 18.6-3.3 2.1-7.1 3.2-11 3.2zm264.8-64c-31.1 0-57.3 20-66.9 52.8V264h176c8.8 0 16-7.2 16-16v-64c0-17.7-14.3-32-32-32h-59.2c21.5-11.4 35.8-34.9 35.8-61.5 0-39.9-29.3-74.5-67.6-74.5zm-11 64c-3.9 0-7.7-1.1-11-3.2-6.4-3.9-9.9-11.2-8.8-18.6 1.1-7.5 6.6-13.4 13.9-15.1 7.3-1.7 15.1.7 20.3 6.2 5.2 5.6 6.6 13.7 3.5 20.7-3.1 7-10.2 11.4-17.9 11.4zM32 288c-17.7 0-32 14.3-32 32v128c0 35.3 28.7 64 64 64h128V288H32zm448 0H320v224h128c35.3 0 64-28.7 64-64V320c0-17.7-14.3-32-32-32z"/>
          </svg>
          <span>UNLIMITED SEEDANCE 2.5 (30 Days)</span>
        </a>
  `;

  const getCancelGuaranteeCard = () => `
        <div class="cancel-guarantee-card">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
          <span>Cancel Anytime - No commitment</span>
        </div>
  `;

  gridContainer.innerHTML = `
    <div class="pricing-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 40px;">
      
      <!-- Basic -->
      <div class="pricing-card" style="border: 1px solid #333; border-radius: 16px; padding: 24px; background: #1a1a1a;">
        <div class="tier-name" style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">BASIC</div>
        <div class="tier-desc" style="font-size: 14px; color: #aaa; margin-bottom: 24px;">For first-time AI content creators</div>
        
        <div class="credits-box" style="background: #2a2a2a; border: 1px solid #444; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <div class="credits-amount" style="font-weight: bold; margin-bottom: 8px;"><span class="material-icons" style="font-size: 16px; vertical-align: -2px; margin-right: 4px;">auto_awesome</span>18,000 credits/mo.</div>
          <div class="credits-breakdown" style="font-size: 12px; color: #888; line-height: 1.5;">
            640 Nano Banana Pro (4K) Generations<br>
            220 Kling 4.0 (Motion Control) videos<br>
            100 Seedance 2.5 (720p) videos
          </div>
        </div>

        <div class="tier-price" style="font-size: 32px; font-weight: bold; margin-bottom: 24px;">
          ${basicPrice} <span class="tier-price-period" style="font-size: 14px; font-weight: normal; color: #888;">per month${isAnnual ? " billed annually" : ""}</span>
        </div>
        
        <a href="${getStripeUrl('basic', isAnnual)}" class="btn-plan basic" data-plan="basic" style="width: 100%; padding: 12px; border-radius: 8px; border: none; background: white; color: black; font-weight: bold; cursor: pointer; margin-bottom: 0px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; position: relative; z-index: 2;">Get Plan</a>
${getCancelGuaranteeCard()}

        <div class="features-list" style="font-size: 13px; line-height: 1.8; margin-bottom: 24px;">
          <div><span style="color: white; margin-right: 8px;">✓</span> Access to all image, video &amp; audio models</div>
          <div><span style="color: white; margin-right: 8px;">✓</span> Pro editing tools: image, video &amp; design</div>
          <div><span style="color: white; margin-right: 8px;">✓</span> Music, voice &amp; sound effects generation</div>
          <div><span style="color: white; margin-right: 8px;">✓</span> Commercial AI license</div>
          <div><span style="color: white; margin-right: 8px;">✓</span> Photon Image &amp; Video upscalers</div>
          ${isAnnual ? '<div><span style="color: white; margin-right: 8px;">✓</span> Credits valid for 1 year, no monthly resets</div>' : ''}
          <div style="color: #666;"><span style="margin-right: 8px;">✕</span> Early access to AI features</div>
          <div style="color: #666;"><span style="margin-right: 8px;">✕</span> Lowest cost per credit</div>
          <div style="color: #666;"><span style="margin-right: 8px;">✕</span> Access to all features</div>
        </div>

        <div class="unlimited-section" style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-weight: bold;">
             <img src="./assets/icons/bytedance.svg" alt="Seedance" style="width: 16px; height: 16px; vertical-align: middle;"> Seedance 2.5
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
            <span style="color: #666;"><span style="margin-right: 8px;">✕</span> Seedance 2.5</span>
            <span style="background: #475569; color: #94a3b8; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">NO ACCESS</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span><span style="color: white; margin-right: 8px;">✓</span> Seedance 2.5 Fast</span>
            <span style="background: #eab308; color: black; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">FULL ACCESS</span>
          </div>
        </div>

        <div class="unlimited-section" style="background: #262626; border: 1px solid #404040; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <div style="font-weight: bold; margin-bottom: 16px; font-size: 14px;">7-DAY UNLIMITED</div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
            <span style="color: #666;"><span style="margin-right: 8px;">✕</span> Seedance 2.5 mini</span>
            <span style="background: #404040; color: #888; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">NO UNLIMITED</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
            <span style="color: #666;"><span style="margin-right: 8px;">✕</span> Nano Banana 2.1</span>
            <span style="background: #404040; color: #888; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">NO UNLIMITED</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
            <span style="color: #666;"><span style="margin-right: 8px;">✕</span> Nano Banana Pro</span>
            <span style="background: #404040; color: #888; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">NO UNLIMITED</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
            <span style="color: #666;"><span style="margin-right: 8px;">✕</span> Kling 4.0</span>
            <span style="background: #404040; color: #888; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">NO UNLIMITED</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span style="color: #666;"><span style="margin-right: 8px;">✕</span> GPT Image 2.1</span>
            <span style="background: #404040; color: #888; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">NO UNLIMITED</span>
          </div>
        </div>

        <div style="font-weight: bold; margin-bottom: 16px; font-size: 14px;">365-DAY UNLIMITED &amp; FREE GENS</div>
        <div style="font-size: 13px; line-height: 2; color: #666;">
          <div><span style="margin-right: 8px;">✕</span> Marketing &amp; Cinema Factory</div>
          <div><span style="margin-right: 8px;">✕</span> Seedream 5.0 Lite</div>
          <div><span style="margin-right: 8px;">✕</span> Flux.2 Pro (1K)</div>
          <div><span style="margin-right: 8px;">✕</span> Kling 01 Image</div>
          <div><span style="margin-right: 8px;">✕</span> Reve 2.0 Image</div>
        </div>
      </div>

      <!-- Pro -->
      <div class="pricing-card" style="border: 1px solid #333; border-radius: 16px; padding: 24px; background: #1a1a1a;">
        <div class="tier-name" style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">PRO</div>
        <div class="tier-desc" style="font-size: 14px; color: #aaa; margin-bottom: 24px;">For Professional AI content creators</div>
        
        <div class="credits-box" style="background: #2a2a2a; border: 1px solid #444; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <div class="credits-amount" style="font-weight: bold; margin-bottom: 8px;"><span class="material-icons" style="font-size: 16px; vertical-align: -2px; margin-right: 4px;">auto_awesome</span>40,000 credits/mo.</div>
          <div class="credits-breakdown" style="font-size: 12px; color: #888; line-height: 1.5;">
            1,600 Nano Banana Pro (4K) Generations<br>
            550 Kling 4.0 (Motion Control) videos<br>
            250 Seedance 2.5 (720p) videos
          </div>
        </div>

        <div class="tier-price" style="font-size: 32px; font-weight: bold; margin-bottom: 24px;">
          ${proPrice} <span class="tier-price-period" style="font-size: 14px; font-weight: normal; color: #888;">per month${isAnnual ? " billed annually" : ""}</span>
        </div>
        
        <a href="${getStripeUrl('pro', isAnnual)}" class="btn-plan pro" data-plan="pro" style="width: 100%; padding: 12px; border-radius: 8px; border: none; background: white; color: black; font-weight: bold; cursor: pointer; margin-bottom: ${isAnnual ? '12px' : '0px'}; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; position: relative; z-index: 2;">Get Plan</a>

${getSeedanceBonusBtn('pro', '0px')}
${getCancelGuaranteeCard()}

        <div class="features-list" style="font-size: 13px; line-height: 1.8; margin-bottom: 24px;">
          <div><span style="color: white; margin-right: 8px;">✓</span> Access to all image, video &amp; audio models</div>
          <div><span style="color: white; margin-right: 8px;">✓</span> Pro editing tools: image, video &amp; design</div>
          <div><span style="color: white; margin-right: 8px;">✓</span> Music, voice &amp; sound effects generation</div>
          <div><span style="color: white; margin-right: 8px;">✓</span> Commercial AI license</div>
          <div><span style="color: white; margin-right: 8px;">✓</span> Photon Image &amp; Video upscalers</div>
          ${isAnnual ? '<div><span style="color: white; margin-right: 8px;">✓</span> Credits valid for 1 year, no monthly resets</div>' : ''}
          <div style="color: #666;"><span style="margin-right: 8px;">✕</span> Early access to AI features</div>
          <div style="color: #666;"><span style="margin-right: 8px;">✕</span> Lowest cost per credit</div>
          <div style="color: #666;"><span style="margin-right: 8px;">✕</span> Access to all features</div>
        </div>

        <div class="unlimited-section" style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-weight: bold;">
             <img src="./assets/icons/bytedance.svg" alt="Seedance" style="width: 16px; height: 16px; vertical-align: middle;"> Seedance 2.5
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
            <span><span style="margin-right: 8px;">○</span> Seedance 2.5</span>
            <span style="background: #eab308; color: black; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">FULL ACCESS</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span><span style="color: white; margin-right: 8px;">✓</span> Seedance 2.5 Fast</span>
            <span style="background: #eab308; color: black; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">FULL ACCESS</span>
          </div>
        </div>

        <div class="unlimited-section" style="background: #262626; border: 1px solid #404040; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <div style="font-weight: bold; margin-bottom: 16px; font-size: 14px;">7-DAY UNLIMITED</div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
            <span style="color: #666;"><span style="margin-right: 8px;">✕</span> Seedance 2.5 mini</span>
            <span style="background: #404040; color: #888; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">NO UNLIMITED</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
            <span><span style="color: white; margin-right: 8px;">✓</span> Nano Banana 2.1</span>
            <span style="background: #eab308; color: black; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">UNLIMITED</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
            <span style="color: #666;"><span style="margin-right: 8px;">✕</span> Nano Banana Pro</span>
            <span style="background: #404040; color: #888; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">NO UNLIMITED</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
            <span><span style="color: white; margin-right: 8px;">✓</span> Kling 4.0</span>
            <span style="background: #eab308; color: black; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">UNLIMITED</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span style="color: #666;"><span style="margin-right: 8px;">✕</span> GPT Image 2.1</span>
            <span style="background: #404040; color: #888; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">NO UNLIMITED</span>
          </div>
        </div>

        <div style="font-weight: bold; margin-bottom: 16px; font-size: 14px;">365-DAY UNLIMITED &amp; FREE GENS</div>
        <div style="font-size: 13px; line-height: 2; color: white;">
          <div><span style="margin-right: 8px;">✓</span> Marketing &amp; Cinema Factory</div>
          <div><span style="margin-right: 8px;">✓</span> Seedream 5.0 Lite</div>
          <div><span style="margin-right: 8px;">✓</span> Flux.2 Pro (1K)</div>
          <div><span style="margin-right: 8px;">✓</span> Kling 01 Image</div>
          <div><span style="margin-right: 8px;">✓</span> Reve 2.0 Image</div>
        </div>
      </div>

      <!-- Max -->
      <div class="pricing-card" style="border: 1px solid #ff8c00; border-radius: 16px; padding: 0; background: #1a1a1a; position: relative; overflow: hidden; display: flex; flex-direction: column;">
        <div style="background: #ff8c00; color: white; text-align: center; font-weight: bold; font-size: 12px; padding: 6px;">
           <span style="margin-right:4px;">🤍</span> MOST POPULAR
        </div>
        <div style="padding: 24px; flex-grow: 1;">
          <div class="tier-name" style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">PRO MAX</div>
          <div class="tier-desc" style="font-size: 14px; color: #aaa; margin-bottom: 24px;">For Experts &amp; Teams</div>
          
          <div class="credits-box" style="background: #2a2a2a; border: 1px solid #444; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <div class="credits-amount" style="font-weight: bold; margin-bottom: 8px;"><span class="material-icons" style="font-size: 16px; vertical-align: -2px; margin-right: 4px;">auto_awesome</span>80,000 credits/mo.</div>
            <div class="credits-breakdown" style="font-size: 12px; color: #888; line-height: 1.5;">
              4,000 Nano Banana Pro (4K) Generations<br>
              1,400 Kling 4.0 (Motion Control) videos<br>
              630 Seedance 2.5 (720p) videos
            </div>
          </div>

          <div class="tier-price" style="font-size: 32px; font-weight: bold; margin-bottom: 24px;">
            ${proMaxPrice} <span class="tier-price-period" style="font-size: 14px; font-weight: normal; color: #888;">per month${isAnnual ? " billed annually" : ""}</span>
          </div>
          
          <a href="${getStripeUrl('max', isAnnual)}" class="btn-plan pro-max" data-plan="max" style="width: 100%; padding: 12px; border-radius: 8px; border: none; background: #ff8c00; color: white; font-weight: bold; cursor: pointer; margin-bottom: ${isAnnual ? '12px' : '0px'}; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; position: relative; z-index: 2;">Get Plan</a>

${getSeedanceBonusBtn('max', '0px')}
${getCancelGuaranteeCard()}

          <div class="features-list" style="font-size: 13px; line-height: 1.8; margin-bottom: 24px;">
            <div><span style="color: white; margin-right: 8px;">✓</span> Access to all image, video &amp; audio models</div>
            <div><span style="color: white; margin-right: 8px;">✓</span> Pro editing tools: image, video &amp; design</div>
            <div><span style="color: white; margin-right: 8px;">✓</span> Music, voice &amp; sound effects generation</div>
            <div><span style="color: white; margin-right: 8px;">✓</span> Commercial AI license</div>
            <div><span style="color: white; margin-right: 8px;">✓</span> Photon Image &amp; Video upscalers</div>
            ${isAnnual ? '<div><span style="color: white; margin-right: 8px;">✓</span> Credits valid for 1 year, no monthly resets</div>' : ''}
            <div><span style="color: white; margin-right: 8px;">✓</span> Early access to AI features</div>
            <div><span style="color: white; margin-right: 8px;">✓</span> Lowest cost per credit</div>
            <div><span style="color: white; margin-right: 8px;">✓</span> Access to all features</div>
          </div>

          <div class="unlimited-section" style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-weight: bold;">
               <img src="./assets/icons/bytedance.svg" alt="Seedance" style="width: 16px; height: 16px; vertical-align: middle;"> Seedance 2.5
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
              <span><span style="color: white; margin-right: 8px;">✓</span> Seedance 2.5</span>
              <span style="background: #eab308; color: black; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">FULL ACCESS</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px;">
              <span><span style="color: white; margin-right: 8px;">✓</span> Seedance 2.5 Fast</span>
              <span style="background: #eab308; color: black; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">FULL ACCESS</span>
            </div>
          </div>

          <div class="unlimited-section" style="background: #262626; border: 1px solid #404040; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <div style="font-weight: bold; margin-bottom: 16px; font-size: 14px;">7-DAY UNLIMITED</div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
              <span><span style="color: white; margin-right: 8px;">✓</span> Seedance 2.5 mini</span>
              <span style="background: #eab308; color: black; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">UNLIMITED</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
              <span><span style="color: white; margin-right: 8px;">✓</span> Nano Banana 2.1</span>
              <span style="background: #eab308; color: black; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">UNLIMITED</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
              <span><span style="color: white; margin-right: 8px;">✓</span> Nano Banana Pro</span>
              <span style="background: #eab308; color: black; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">UNLIMITED</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 12px;">
              <span><span style="color: white; margin-right: 8px;">✓</span> Kling 4.0</span>
              <span style="background: #eab308; color: black; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">UNLIMITED</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px;">
              <span><span style="color: white; margin-right: 8px;">✓</span> GPT Image 2.1</span>
              <span style="background: #eab308; color: black; font-size: 10px; padding: 2px 6px; border-radius: 12px; font-weight: bold;">UNLIMITED</span>
            </div>
          </div>

          <div style="font-weight: bold; margin-bottom: 16px; font-size: 14px;">365-DAY UNLIMITED &amp; FREE GENS</div>
          <div style="font-size: 13px; line-height: 2; color: white;">
            <div><span style="margin-right: 8px;">✓</span> Marketing &amp; Cinema Factory</div>
            <div><span style="margin-right: 8px;">✓</span> Seedream 5.0 Lite</div>
            <div><span style="margin-right: 8px;">✓</span> Flux.2 Pro (1K)</div>
            <div><span style="margin-right: 8px;">✓</span> Kling 01 Image</div>
            <div><span style="margin-right: 8px;">✓</span> Reve 2.0 Image</div>
          </div>
        </div>
      </div>
      
    </div>
  `;

  // Attach direct Stripe checkout to buttons
  gridContainer.querySelectorAll('.btn-plan, .seedance-unlimited-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const plan = btn.getAttribute('data-plan') || (btn.classList.contains('basic') ? 'basic' : (btn.classList.contains('pro-max') ? 'max' : 'pro'));
      navigateToStripe(plan);
    });
  });
}

function setupEnterprisePlan() {
  const container = document.getElementById('enterprise-plan');
  if (!container) return;

  container.innerHTML = `
    <div class="enterprise-container">
      <div class="enterprise-left">
        <h2 class="enterprise-heading">Enterprise AI video infrastructure for teams that produce at scale</h2>
        <p class="enterprise-subheading">Tailored workflows, dedicated support, seamless onboarding, full control at scale, and no training on your data.</p>
        
        <div class="enterprise-cards">
          <div class="ent-card">
            <div class="ent-card-icon">
              <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
            </div>
            <h3 class="ent-card-title">Security & Compliance</h3>
            <p class="ent-card-desc">Your data is never used for model training. SOC 2 Type 2 in progress.</p>
          </div>
          <div class="ent-card">
            <div class="ent-card-icon">
              <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M12 3C7.58 3 4 4.79 4 7s3.58 4 8 4 8-1.79 8-4-3.58-4-8-4zm0 6c-4.42 0-8-1.79-8-4v3c0 2.21 3.58 4 8 4s8-1.79 8-4V9c0 2.21-3.58 4-8 4zm0 6c-4.42 0-8-1.79-8-4v3c0 2.21 3.58 4 8 4s8-1.79 8-4v-3c0 2.21-3.58 4-8 4z"/></svg>
            </div>
            <h3 class="ent-card-title">Data & usage rights</h3>
            <p class="ent-card-desc">You retain your rights in every AI generated output &mdash; no restrictions to use, edit, or publish anywhere</p>
          </div>
          <div class="ent-card">
            <div class="ent-card-icon">
              <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            </div>
            <h3 class="ent-card-title">SSO & admin control</h3>
            <p class="ent-card-desc">Secure your team and stay in control &mdash; set and manage roles and permissions from a single, centralized dashboard</p>
          </div>
        </div>
      </div>

      <div class="enterprise-right">
        <div class="ent-right-title">Everything on Business Plan and...</div>
        <ul class="ent-checklist">
          <li><span class="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" width="12" height="12"><polyline points="20 6 9 17 4 12"></polyline></svg></span> Unlimited members</li>
          <li><span class="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" width="12" height="12"><polyline points="20 6 9 17 4 12"></polyline></svg></span> Custom credit amount</li>
          <li><span class="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" width="12" height="12"><polyline points="20 6 9 17 4 12"></polyline></svg></span> Dedicated model capacity</li>
          <li><span class="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" width="12" height="12"><polyline points="20 6 9 17 4 12"></polyline></svg></span> Access to all models on the platform</li>
          <li><span class="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" width="12" height="12"><polyline points="20 6 9 17 4 12"></polyline></svg></span> Volume-based discounts at the best rates</li>
          <li><span class="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" width="12" height="12"><polyline points="20 6 9 17 4 12"></polyline></svg></span> Priority queue for faster task processing</li>
        </ul>
        <div class="ent-actions">
          <a href="#" class="btn-ent-primary">Contact Sales</a>
          <a href="#" class="btn-ent-secondary">Learn More</a>
        </div>
      </div>
    </div>
  `;
}

function setupBestPlanCalculator(pricingData) {
  const container = document.getElementById('best-plan-calculator');
  if (!container || !pricingData || !pricingData.max) return;

  const maxPlan = pricingData.max;
  const annualPrice = maxPlan.annual; // 59
  const monthlyPriceOld = maxPlan.monthly; // 79

  container.innerHTML = `
    <div class="calculator-header">
      <h2 class="calc-main-title">Find the best plan for you</h2>
      <p class="calc-sub-title">Choose what you want to create and get what you need</p>
    </div>
    
    <div class="calculator-container">
      <div class="calc-left">
        <!-- Step 1 -->
        <div class="calc-step">
          <div class="calc-step-number">1</div>
          <div class="calc-step-content">
            <div class="calc-step-title">What are you here to make?</div>
            <div class="calc-step-subtitle">Multiple options can be selected</div>
            
            <div class="calc-options-grid">
              <div class="calc-option">
                <span class="calc-opt-icon">▶</span> Social media videos
                <span class="calc-check">✓</span>
              </div>
              <div class="calc-option">
                <span class="calc-opt-icon">👤</span> Talking-avatar videos
                <span class="calc-check">✓</span>
              </div>
              <div class="calc-option">
                <span class="calc-opt-icon">💰</span> UGC & product video ads
                <span class="calc-check">✓</span>
              </div>
              <div class="calc-option">
                <span class="calc-opt-icon">📷</span> Marketing product photos
                <span class="calc-check">✓</span>
              </div>
              <div class="calc-option">
                <span class="calc-opt-icon">🎥</span> Cinematic videos
                <span class="calc-check">✓</span>
              </div>
              <div class="calc-option">
                <span class="calc-opt-icon">✨</span> Personal use
                <span class="calc-check">✓</span>
              </div>
            </div>
          </div>
        </div>

        <div class="calc-divider"></div>

        <!-- Step 2 -->
        <div class="calc-step">
          <div class="calc-step-number">2</div>
          <div class="calc-step-content">
            <div class="calc-step-title">How many content items per month?</div>
            <div class="calc-step-subtitle">
              ≈ 36 credits each · per Seedance 2.5 generation, 8s, 720p<br>
              = 2 credits each · per Nano Banana Pro generation
            </div>
            
            <div class="calc-sliders-container">
              <!-- Slider 1 -->
              <div class="calc-slider-wrapper">
                <div class="calc-slider-track-bg"></div>
                <div class="calc-slider-ticks">
                  ${Array(25).fill('<div class="calc-tick"></div>').join('')}
                </div>
                <div class="calc-slider-progress" style="width: 0%;"></div>
                <div class="calc-slider-thumb" style="left: 0%;">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="black" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="black" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
                <div class="calc-slider-labels">
                  <span class="calc-slider-name"># Seedance 2.5 videos <span style="color:#666;">900 credits</span></span>
                  <span class="calc-slider-value"><span>^</span> 0+</span>
                </div>
              </div>

              <!-- Slider 2 -->
              <div class="calc-slider-wrapper">
                <div class="calc-slider-track-bg"></div>
                <div class="calc-slider-ticks">
                  ${Array(25).fill('<div class="calc-tick"></div>').join('')}
                </div>
                <div class="calc-slider-progress" style="width: 0%;"></div>
                <div class="calc-slider-thumb" style="left: 0%;">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="black" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="black" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
                <div class="calc-slider-labels">
                  <span class="calc-slider-name"># Nano Banana Pro images <span style="color:#666;">60 credits</span></span>
                  <span class="calc-slider-value"><span>^</span> 0+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="calc-divider"></div>

        <!-- Step 3 -->
        <div class="calc-step">
          <div class="calc-step-number">3</div>
          <div class="calc-step-content" style="width: 100%;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; width: 100%;">
              <div>
                <div class="calc-step-title">Features & capabilities</div>
                <div class="calc-step-subtitle">Add anything else you'll need</div>
              </div>
              <button class="calc-add-features-btn">
                + Add features
                <span class="calc-add-badge">0</span>
              </button>
            </div>
            
            <div class="calc-chips">
            </div>
          </div>
        </div>

      </div>

      <div class="calc-right">
        <div class="calc-recommend-header">
          We recommend Max plan
        </div>

        <div class="calc-max-card">
          <div class="calc-max-header">
            <div class="calc-max-title">PRO MAX</div>
            <div class="calc-max-subtitle">For Experts &amp; Teams</div>
          </div>

          <div class="calc-max-credits-box">
            <div class="credits-amount" style="font-weight: bold; margin-bottom: 8px;"><span class="material-icons" style="font-size: 16px; vertical-align: -2px; margin-right: 4px;">auto_awesome</span>80,000 credits/mo.</div>
            <div class="credits-breakdown" style="font-size: 12px; color: #888; line-height: 1.5;">
              - 4,000 Nano Banana Pro (4K) Generations<br>
              - 1,400 Kling 4.0 (Motion Control) videos<br>
              - 630 Seedance 2.5 (720p) videos
            </div>
          </div>



          <ul class="calc-max-features">
            <li><span style="margin-right:6px;">✓</span> 7-Day Unlimited Kling 4.0 + Nano Banana Pro</li>
            <li><span style="margin-right:6px;">✓</span> Lowest cost per credit</li>
            <li><span style="margin-right:6px;">✓</span> 10,000 free Wan 3.0 generation</li>
          </ul>

          <div class="calc-price-row">
            <span class="calc-price-old">$${monthlyPriceOld}</span>
            <span class="calc-price-new">$${annualPrice}</span>
            <span class="calc-price-period">/month, billed annually</span>
          </div>

          <button class="calc-get-max-btn">Get Pro Max</button>
          <div class="calc-savings">Save $240 compared to monthly</div>
        </div>

        <div class="calc-bottom-toggles">

          <div class="calc-toggle-item">
            <span>Monthly</span>
            <div class="toggle-switch active" style="transform: scale(0.8);">
              <div class="toggle-slider"></div>
            </div>
            <span>Annual <span class="calc-save-pill" style="font-size: 10px;">30% OFF</span></span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Features Modal -->
    <div id="features-modal" class="calc-modal" style="display: none;">
      <div class="calc-modal-content">
        <div class="calc-modal-header">
          <h3>Select Features</h3>
          <span class="calc-modal-close">&times;</span>
        </div>
        <div class="calc-modal-tags">
          <div class="calc-modal-tag" data-feature="AI Images only">AI Images only</div>
          <div class="calc-modal-tag" data-feature="AI videos only">AI videos only</div>
          <div class="calc-modal-tag" data-feature="Unlimited Seedance 2.5 mini">Unlimited Seedance 2.5 mini</div>
          <div class="calc-modal-tag" data-feature="Unlimited GPT & Nano Banana Image models">Unlimited GPT & Nano Banana Image models</div>
          <div class="calc-modal-tag" data-feature="High Concurrent generations">High Concurrent generations</div>
        </div>
        <button id="calc-modal-apply" class="calc-get-max-btn" style="margin-top: 16px;">Add Selected</button>
      </div>
    </div>
  `;

  // --- Interactivity Logic ---

  function updateRecommendationCard() {
    let tier = 'BASIC';
    
    const opts = Array.from(container.querySelectorAll('.calc-option.active')).map(o => o.textContent.trim());
    if (opts.some(t => t.includes('Social media videos') || t.includes('UGC'))) tier = 'PRO';
    if (opts.some(t => t.includes('Cinematic videos'))) tier = 'MAX';
    
    const sliderVals = Array.from(container.querySelectorAll('.calc-slider-value')).map(s => {
       const text = s.textContent.replace(/[^0-9]/g, '');
       return parseInt(text) || 0;
    });
    
    const seedanceVal = sliderVals[0] || 0;
    const nanoVal = sliderVals[1] || 0;
    
    if (seedanceVal >= 20 && seedanceVal < 70) { if (tier === 'BASIC') tier = 'PRO'; }
    if (seedanceVal >= 70) tier = 'MAX';
    
    if (nanoVal >= 100 && nanoVal < 250) { if (tier === 'BASIC') tier = 'PRO'; }
    if (nanoVal >= 250) tier = 'MAX';

    const chips = Array.from(container.querySelectorAll('.calc-chip')).map(c => c.textContent.replace('×', '').trim());
    if (chips.some(c => c.includes('AI videos only') || c.includes('Unlimited GPT'))) {
       if (tier === 'BASIC') tier = 'PRO';
    }
    if (chips.some(c => c.includes('Unlimited Seedance 2.5 mini') || c.includes('High Concurrent generations'))) {
       tier = 'MAX';
    }
    
    const card = container.querySelector('.calc-max-card');
    if (!card) return;
    const title = container.querySelector('.calc-max-title');
    const amount = container.querySelector('.credits-amount');
    const breakdown = container.querySelector('.credits-breakdown');
    const featuresList = container.querySelector('.calc-max-features');
    const priceOld = container.querySelector('.calc-price-old');
    const priceNew = container.querySelector('.calc-price-new');
    const period = container.querySelector('.calc-price-period');
    const btn = container.querySelector('.calc-get-max-btn');
    const savings = container.querySelector('.calc-savings');
    const recommendHeader = container.querySelector('.calc-recommend-header');
    
    // Use global isAnnual

    const prices = {
      BASIC: { m: pricingData.basic.monthly, a: pricingData.basic.annual },
      PRO: { m: pricingData.plus.monthly, a: pricingData.plus.annual },
      MAX: { m: pricingData.max.monthly || 79, a: pricingData.max.annual || 59 }
    };
    
    const tData = prices[tier];
    const isMax = tier === 'MAX';
    
    if (recommendHeader) {
      // Capitalize first letter (e.g. Basic, Pro, Pro Max)
      const formattedTier = tier === 'MAX' ? 'Pro Max' : (tier.charAt(0) + tier.slice(1).toLowerCase());
      recommendHeader.textContent = `We recommend ${formattedTier} plan`;
    }
    
    title.innerHTML = tier === 'MAX' ? 'PRO MAX' : tier;
    
    if (isMax) {
      card.style.background = '';
      btn.style.background = 'var(--primary)';
      btn.style.color = 'black';
    } else {
      card.style.background = 'linear-gradient(135deg, rgba(41, 38, 31, 0.3), rgba(255, 188, 0, 0.3))';
      btn.style.background = 'white';
      btn.style.color = 'black';
    }
    
    btn.textContent = `Get ${tier === 'MAX' ? 'PRO MAX' : tier}`;
    btn.dataset.tier = tier;
    
    if (tier === 'BASIC') {
      amount.innerHTML = '<span class="material-icons" style="font-size: 16px; vertical-align: -2px; margin-right: 4px;">auto_awesome</span> 18,000 credits/mo.';
      breakdown.innerHTML = '- 640 Nano Banana Pro (4K) Generations<br>- 220 Kling 4.0 (Motion Control) videos<br>- 100 Seedance 2.5 (720p) videos';
      featuresList.innerHTML = '<li><span style="margin-right:6px;">✓</span> Access to all image, video & audio models</li><li><span style="margin-right:6px;">✓</span> Pro editing tools: image, video & design</li><li><span style="margin-right:6px;">✓</span> Music, voice & sound effects generation</li>';
    } else if (tier === 'PRO') {
      amount.innerHTML = '<span class="material-icons" style="font-size: 16px; vertical-align: -2px; margin-right: 4px;">auto_awesome</span> 40,000 credits/mo.';
      breakdown.innerHTML = '- 1,600 Nano Banana Pro (4K) Generations<br>- 550 Kling 4.0 (Motion Control) videos<br>- 250 Seedance 2.5 (720p) videos';
      featuresList.innerHTML = '<li><span style="margin-right:6px;">✓</span> Access to all image, video & audio models</li><li><span style="margin-right:6px;">✓</span> Pro editing tools: image, video & design</li><li><span style="margin-right:6px;">✓</span> Music, voice & sound effects generation</li>';
    } else {
      amount.innerHTML = '<span class="material-icons" style="font-size: 16px; vertical-align: -2px; margin-right: 4px;">auto_awesome</span> 80,000 credits/mo.';
      breakdown.innerHTML = '- 4,000 Nano Banana Pro (4K) Generations<br>- 1,400 Kling 4.0 (Motion Control) videos<br>- 630 Seedance 2.5 (720p) videos';
      featuresList.innerHTML = '<li><span style="margin-right:6px;">✓</span> 7-Day Unlimited Kling 4.0 + Nano Banana Pro</li><li><span style="margin-right:6px;">✓</span> Lowest cost per credit</li><li><span style="margin-right:6px;">✓</span> 10,000 free Wan 3.0 generation</li>';
    }
    
    if (isAnnual) {
      priceNew.textContent = '$' + tData.a;
      priceOld.textContent = '$' + tData.m;
      priceOld.style.display = 'inline-block';
      period.textContent = '/month, billed annually';
      const savingsAmt = (tData.m - tData.a) * 12;
      savings.textContent = `Save $${savingsAmt} compared to monthly`;
      savings.style.display = 'block';
    } else {
      priceNew.textContent = '$' + tData.m;
      priceOld.style.display = 'none';
      period.textContent = '/month';
      savings.style.display = 'none';
    }
  }

  // 1. Checkboxes
  const options = container.querySelectorAll('.calc-option');
  options.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.preventDefault();
      opt.classList.toggle('active');
      updateRecommendationCard();
    });
  });

  // 2. Chips (Delegated to container)
  const chipsContainer = container.querySelector('.calc-chips');
  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('calc-chip-close')) {
        e.stopPropagation();
        e.target.parentElement.style.display = 'none'; // hide instead of remove to preserve grid if any
        e.target.parentElement.classList.remove('calc-chip'); // remove class so count is accurate
        const badge = container.querySelector('.calc-add-badge');
        if (badge) {
           const activeChips = chipsContainer.querySelectorAll('.calc-chip').length;
           badge.textContent = activeChips;
        }
        updateRecommendationCard();
      }
    });
  }

  // 3. Left Sliders
  const leftSliderWrappers = container.querySelectorAll('.calc-left .calc-slider-wrapper');
  const maxValues = [200, 500]; // Array matching the two left sliders
  
  leftSliderWrappers.forEach((wrapper, index) => {
    const thumb = wrapper.querySelector('.calc-slider-thumb');
    const progress = wrapper.querySelector('.calc-slider-progress');
    const track = wrapper.querySelector('.calc-slider-track-bg');
    const valueSpan = wrapper.querySelector('.calc-slider-value');
    const maxVal = maxValues[index] || 100;
    
    let isDragging = false;
    
    const updateSlider = (clientX) => {
      const rect = track.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const percentage = (x / rect.width) * 100;
      thumb.style.left = `${percentage}%`;
      progress.style.width = `${percentage}%`;
      
      // Update text value
      const currentVal = Math.round((percentage / 100) * maxVal);
      if (valueSpan) {
         valueSpan.innerHTML = `<span>^</span> ${currentVal}+`;
      }
      updateRecommendationCard();
    };

    thumb.addEventListener('mousedown', (e) => { isDragging = true; e.preventDefault(); });
    thumb.addEventListener('touchstart', (e) => { isDragging = true; }, {passive: true});
    
    document.addEventListener('mouseup', () => { isDragging = false; });
    document.addEventListener('touchend', () => { isDragging = false; });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      updateSlider(e.clientX);
    });
    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      updateSlider(e.touches[0].clientX);
    }, {passive: true});

    // Click on track to seek
    wrapper.addEventListener('click', (e) => {
      if (e.target !== thumb && !thumb.contains(e.target)) {
        updateSlider(e.clientX);
      }
    });
  });

  // 4. Right Slider (Removed)

  // 5. Monthly/Annual toggle
  const bottomToggleItems = container.querySelectorAll('.calc-bottom-toggles .calc-toggle-item');
  if (bottomToggleItems.length > 0) {
    const billingItem = bottomToggleItems[0];
    
    billingItem.addEventListener('click', () => {
      isAnnual = !isAnnual;
      renderPricingGrid();
    });
  }

  // 6. Interactive Buttons Visual Feedback
  const buttons = container.querySelectorAll('.calc-get-max-btn, .calc-add-features-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.id !== 'calc-modal-apply' && !btn.classList.contains('calc-add-features-btn')) {
         e.preventDefault();
      }
      // Simple click animation
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => { btn.style.transform = 'none'; }, 100);
      if (btn.classList.contains('calc-get-max-btn') && btn.id !== 'calc-modal-apply') {
        const tier = btn.dataset.tier || 'MAX';
        navigateToStripe(tier);
      }
    });
  });

  // 7. Modal Logic
  const addFeaturesBtn = container.querySelector('.calc-add-features-btn');
  const modal = container.querySelector('#features-modal');
  if (addFeaturesBtn && modal) {
    const modalClose = modal.querySelector('.calc-modal-close');
    const modalApply = modal.querySelector('#calc-modal-apply');
    const modalTags = modal.querySelectorAll('.calc-modal-tag');

    addFeaturesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.style.display = 'flex';
    });

    modalClose.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modalTags.forEach(tag => {
      tag.addEventListener('click', () => {
        tag.classList.toggle('selected');
      });
    });

    modalApply.addEventListener('click', () => {
      const selectedTags = modal.querySelectorAll('.calc-modal-tag.selected');
      selectedTags.forEach(tag => {
        const featureName = tag.getAttribute('data-feature');
        // Check if it already exists to avoid duplicates
        const exists = Array.from(chipsContainer.querySelectorAll('.calc-chip')).some(c => c.textContent.includes(featureName));
        if (!exists) {
          const chip = document.createElement('div');
          chip.className = 'calc-chip';
          chip.innerHTML = `${featureName} <span class="calc-chip-close">×</span>`;
          chipsContainer.appendChild(chip);
        }
        tag.classList.remove('selected'); // unselect for next time
      });
      
      // Update badge
      const badge = container.querySelector('.calc-add-badge');
      if (badge && chipsContainer) {
         badge.textContent = chipsContainer.querySelectorAll('.calc-chip').length;
      }
      
      updateRecommendationCard();
      modal.style.display = 'none';
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  // Expose to global for cross-component sync
  window.updateCalcCardState = updateRecommendationCard;

  // Initialize recommendation card state
  updateRecommendationCard();
}

function setupComparePlans() {
  const container = document.getElementById('compare-plans');
  if (!container || !globalComparisonData) return;

  const data = globalComparisonData.comparison_table;
  const t = data.tiers;
  
  const basicPrice = isAnnual ? t.BASIC.annual_pricing.price : t.BASIC.monthly_pricing.price;
  const basicCredits = isAnnual ? t.BASIC.annual_pricing.credits : t.BASIC.monthly_pricing.credits;
  
  const proPrice = isAnnual ? t.PRO.annual_pricing.price : t.PRO.monthly_pricing.price;
  const proCredits = isAnnual ? t.PRO.annual_pricing.credits : t.PRO.monthly_pricing.credits;

  const maxPrice = isAnnual ? t.MAX.annual_pricing.price : t.MAX.monthly_pricing.price;
  const maxCredits = isAnnual ? t.MAX.annual_pricing.credits : t.MAX.monthly_pricing.credits;

  const periodText = isAnnual ? "Billed annually" : "Billed monthly";

  const generateRow = (item, isOther = false) => {
    let title = isOther ? item.feature : item.model;
    let subtitle = item.cost ? item.cost : '';
    let tagsHtml = '';
    if (item.tags && item.tags.length > 0) {
       tagsHtml = item.tags.map(tag => `<span style="background: ${tag === 'NEW' ? '#eab308' : (tag === 'UNLIMITED' ? '#3b82f6' : '#475569')}; color: #ffffff; -webkit-text-fill-color: #ffffff; font-style: italic; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-left: 6px;">${tag}</span>`).join('');
    }
    
    let formatVal = (val) => {
      if (val === true) return '<span style="color:white; font-size:14px; font-weight:bold;">✓</span>';
      if (val === false) return '<span style="color:#666; font-size:14px; font-weight:bold;">✕</span>';
      if (val === '∞') return '<span style="color:white; font-size: 20px; line-height: 1;">∞</span>';
      return val;
    };

    let allowanceObj = item.allowance || item.annual_allowance;
    let basicVal = formatVal(allowanceObj.BASIC);
    let proVal = formatVal(allowanceObj.PRO);
    let maxVal = formatVal(allowanceObj.MAX);

    return `
      <tr>
        <td class="td-label">
          <div class="row-title" style="display: flex; align-items: center; gap:4px;">${title}${tagsHtml}</div>
          ${subtitle ? `<div class="row-subtitle">${subtitle}</div>` : ''}
        </td>
        <td style="color:#aaa;">${basicVal}</td>
        <td style="color:#aaa;">${proVal}</td>
        <td style="color:#aaa;">${maxVal}</td>
      </tr>
    `;
  };

  const videoRows = data.categories.AI_video.map(item => generateRow(item)).join('');
  const imageRows = data.categories.AI_image.map(item => generateRow(item)).join('');
  const audioRows = data.categories.AI_audio.map(item => generateRow(item)).join('');
  const otherRows = data.categories.other_perks.map(item => generateRow(item, true)).join('');

  container.innerHTML = `
    <h2 class="compare-heading">COMPARE PLANS</h2>
    <div class="compare-container">
      <div class="compare-table-wrapper">
        <table class="compare-table">
          <thead>
            <tr>
              <th style="width: 28%;">
                <div class="compare-toggle">
                  <span style="font-size: 12px;">Annual <span style="color:#d1fe16; font-weight: bold;">30% OFF</span></span>
                  <div class="toggle-switch ${isAnnual ? 'active' : ''}" id="compare-billing-toggle" style="transform: scale(0.8); margin-left: 8px;">
                    <div class="toggle-slider"></div>
                  </div>
                </div>
              </th>
              <th style="width: 24%;">
                <div class="th-plan-name">Basic</div>
                <div class="th-plan-price" style="font-size:24px; font-weight:bold;">${basicPrice}</div>
                <div class="th-plan-period" style="font-size:12px; color:#888;">${periodText}</div>
                <div style="font-size: 12px; color: #888; margin-bottom: 16px;">${basicCredits}</div>
                <a href="${getStripeUrl('basic', isAnnual)}" class="btn-compare" data-plan="basic" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;">Get Plan</a>
              </th>
              <th style="width: 24%;">
                <div class="th-plan-name">Pro</div>
                <div class="th-plan-price" style="font-size:24px; font-weight:bold;">${proPrice}</div>
                <div class="th-plan-period" style="font-size:12px; color:#888;">${periodText}</div>
                <div style="font-size: 12px; color: #888; margin-bottom: 16px;">${proCredits}</div>
                <a href="${getStripeUrl('pro', isAnnual)}" class="btn-compare" data-plan="pro" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;">Get Plan</a>
              </th>
              <th style="width: 24%;">
                <div class="th-plan-name">Pro Max</div>
                <div class="th-plan-price" style="font-size:24px; font-weight:bold;">${maxPrice}</div>
                <div class="th-plan-period" style="font-size:12px; color:#888;">${periodText}</div>
                <div style="font-size: 12px; color: #888; margin-bottom: 16px;">${maxCredits}</div>
                <a href="${getStripeUrl('max', isAnnual)}" class="btn-compare" data-plan="max" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;">Get Plan</a>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="section-row">
              <td colspan="4">Video Generation</td>
            </tr>
            ${videoRows}

            <tr class="section-row">
              <td colspan="4">Image Generation</td>
            </tr>
            ${imageRows}

            <tr class="section-row">
              <td colspan="4">Audio Generation</td>
            </tr>
            ${audioRows}

            <tr class="section-row">
              <td colspan="4">Other Perks</td>
            </tr>
            ${otherRows}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Attach Stripe navigation to compare plan buttons
  container.querySelectorAll('.btn-compare').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const plan = btn.getAttribute('data-plan') || 'pro';
      navigateToStripe(plan);
    });
  });

  const compToggleBtn = document.getElementById('compare-billing-toggle');
  if (compToggleBtn) {
    compToggleBtn.addEventListener('click', () => {
      isAnnual = !isAnnual;
      renderPricingGrid();
    });
  }
}

async function setupFAQs() {
  const container = document.getElementById('faqs');
  if (!container) return;

  try {
    const faqData = await fetch('./js/pricing-faq-content.json').then(r => r.json());
    
    let html = '<h2 class="faq-title">Frequently Asked Questions</h2><div class="faq-list">';
    
    faqData.faqs.forEach((faq, index) => {
      html += `
        <div class="faq-item">
          <button class="faq-question">
            <span>${faq.question}</span>
            <span class="faq-icon">+</span>
          </button>
          <div class="faq-answer">
            ${faq.answer}
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;

    // Add accordion event listeners
    const faqItems = container.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const btn = item.querySelector('.faq-question');
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close all
        faqItems.forEach(i => i.classList.remove('active'));
        // Open clicked if it wasn't already open
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });

  } catch (error) {
    console.error("Error loading FAQs:", error);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initPricing);

// Register Service Worker for media caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered successfully:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
