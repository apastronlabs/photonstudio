const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('http://127.0.0.1:8080/pricing.html');
  await new Promise(r => setTimeout(r, 2000));
  
  try {
    console.log("Trying to click a left-side option...");
    await page.click('.calc-option');
    console.log("Clicked option successfully.");
    
    console.log("Trying to click the 'Monthly' toggle item...");
    await page.click('.calc-bottom-toggles .calc-toggle-item:nth-child(2)');
    console.log("Clicked toggle successfully.");
    
    const priceText = await page.$eval('.calc-price-new', el => el.textContent);
    console.log("Price after toggle is:", priceText);
  } catch (err) {
    console.log("PUPPETEER ERROR:", err.message);
  }
  
  await browser.close();
})();
