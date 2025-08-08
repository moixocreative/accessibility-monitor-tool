const puppeteer = require('puppeteer');

class SimpleValidator {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    console.log('Initializing browser...');
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
      console.log('✅ Browser initialized');
    } catch (error) {
      console.error('❌ Browser initialization failed:', error.message);
      this.browser = null;
    }
  }

  async auditSite(url) {
    console.log(`Auditing: ${url}`);
    
    if (!this.browser) {
      console.log('Initializing browser...');
      await this.initBrowser();
    }

    if (!this.browser) {
      console.log('❌ Browser not available');
      return { score: -1, violations: [] };
    }

    try {
      const page = await this.browser.newPage();
      await page.setViewport({ width: 1280, height: 720 });
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      await page.addScriptTag({
        url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.0/axe.min.js'
      });

      const results = await page.evaluate(() => {
        return globalThis.axe.run();
      });

      await page.close();

      return {
        score: 100 - (results.violations.length * 5),
        violations: results.violations
      };

    } catch (error) {
      console.error('❌ Audit failed:', error.message);
      return { score: -1, violations: [] };
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function test() {
  console.log('Testing simple validator...');
  const validator = new SimpleValidator();
  
  try {
    const result = await validator.auditSite('https://example.com');
    console.log('✅ Audit completed');
    console.log('Score:', result.score);
    console.log('Violations:', result.violations.length);
    
    await validator.close();
    console.log('✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

test();
