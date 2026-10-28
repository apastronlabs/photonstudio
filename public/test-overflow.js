const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Navigate to live-server
  await page.goto('http://127.0.0.1:8080/');
  
  // Wait for network idle or 2 seconds
  await page.waitForTimeout(2000);
  
  const dimensions = await page.evaluate(() => {
    return {
      windowWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      bodyOverflowX: getComputedStyle(document.body).overflowX,
      htmlOverflowX: getComputedStyle(document.documentElement).overflowX,
      carousel7Width: document.querySelector('#carousel-section-7') ? document.querySelector('#carousel-section-7').offsetWidth : null,
      errors: window.errors || []
    };
  });
  
  console.log(JSON.stringify(dimensions, null, 2));
  
  await browser.close();
})();
