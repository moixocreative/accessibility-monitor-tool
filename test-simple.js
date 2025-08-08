const puppeteer = require('puppeteer');

async function testSimple() {
  console.log('Testing simple browser functionality...');
  
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
    
    console.log('✅ Page created, navigating...');
    await page.goto('https://example.com', { waitUntil: 'domcontentloaded', timeout: 10000 });
    console.log('✅ Page loaded');
    
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
    
    await browser.close();
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSimple();
