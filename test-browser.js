const puppeteer = require('puppeteer');

async function testBrowser() {
  console.log('Testing Puppeteer browser initialization...');
  
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-ipc-flooding-protection'
      ],
      timeout: 30000
    });
    
    console.log('✅ Browser initialized successfully!');
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto('https://www.untile.pt', { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('✅ Page loaded successfully!');
    
    await browser.close();
    console.log('✅ Browser closed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing browser:', error.message);
    console.error('Full error:', error);
  }
}

testBrowser();
