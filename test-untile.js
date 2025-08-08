const puppeteer = require('puppeteer');

async function testUntile() {
  console.log('Testing UNTILE website access...');
  
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    console.log('✅ Browser initialized');
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('✅ Navigating to https://www.untile.pt...');
    await page.goto('https://www.untile.pt', { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('✅ Page loaded successfully');
    
    console.log('✅ Loading axe-core...');
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.0/axe.min.js'
    });
    console.log('✅ Axe-core loaded');
    
    console.log('✅ Running axe-core...');
    const results = await page.evaluate(() => {
      return globalThis.axe.run();
    });
    console.log('✅ Axe-core executed');
    console.log('Violations found:', results.violations.length);
    
    if (results.violations.length > 0) {
      console.log('First violation:', results.violations[0].description);
    }
    
    await browser.close();
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testUntile();
