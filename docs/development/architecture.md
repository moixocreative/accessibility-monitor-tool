# Architecture Overview - System Design

> 🏗️ **Como o sistema funciona internamente - patterns, princípios e design decisions**

## 🎯 Visão Geral da Arquitetura

### **High-Level Architecture:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CLI Scripts   │    │   Web API       │    │   Monitoring    │
│   (Entry Point) │    │   (Optional)    │    │   (Scheduled)   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Core Validation       │
                    │      WCAGValidator        │
                    └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
    ┌─────▼─────┐         ┌─────▼─────┐         ┌─────▼─────┐
    │  Crawler  │         │  Axe-Core │         │ Reports   │
    │ Discovery │         │ Validation│         │Generator  │
    └───────────┘         └───────────┘         └───────────┘
```

### **Core Components:**

1. **🎯 Core Layer** (`src/core/`)
   - WCAG criteria definitions
   - Business rules e constraints
   - Domain models

2. **🔍 Validation Layer** (`src/validation/`)
   - WCAGValidator (main orchestrator)
   - Browser automation (Puppeteer/Playwright)
   - Axe-core integration

3. **🕷️ Crawler Layer** (`src/crawler/`)
   - Page discovery algorithms
   - Sitemap parsing
   - URL validation

4. **📊 Reports Layer** (`src/reports/`)
   - Multi-format generators (HTML, JSON, MD)
   - Scoring algorithms
   - Template system

5. **📡 Monitoring Layer** (`src/monitoring/`)
   - Portfolio management
   - Scheduled audits
   - Emergency response

## 🔍 Core Validation Flow

### **Main Validation Pipeline:**
```typescript
async function validateSite(url: string, type: 'simple' | 'complete') {
  // 1. Initialize Browser
  const browser = await initBrowser();
  
  // 2. Navigate & Wait
  const page = await browser.newPage();
  await page.goto(url);
  
  // 3. Inject Axe-Core
  await injectAxeCore(page);
  
  // 4. Run Validation
  const criteria = getCriteria(type); // 15 vs 50+ critérios
  const results = await runAxeValidation(page, criteria);
  
  // 5. Calculate Score
  const score = calculateWCAGScore(results);
  
  // 6. Generate Report
  return generateReport(results, score);
}
```

### **Key Classes & Responsibilities:**

#### **WCAGValidator** (`src/validation/wcag-validator.ts`)
```typescript
class WCAGValidator {
  async validateUrl(url: string, options: ValidationOptions): Promise<AuditResult>
  async runAxeCoreOptimized(page: Page, auditType: AuditType): Promise<AxeResults>
  private async initBrowser(): Promise<Browser>
  private calculateWCAGScore(results: AxeResults): number
}
```

**Responsabilidades:**
- Orchestrate complete validation process
- Browser lifecycle management
- Axe-core integration
- Score calculation

#### **PageCrawler** (`src/crawler/page-crawler.ts`)
```typescript
class PageCrawler {
  async discoverPages(baseUrl: string, strategy: CrawlStrategy): Promise<CrawlResult[]>
  private async parseSitemap(url: string): Promise<string[]>
  private async deepCrawl(url: string, maxDepth: number): Promise<string[]>
  private async discoverCommonPatterns(baseUrl: string): Promise<string[]>
}
```

**Responsabilidades:**
- Auto-discover site pages
- Multiple discovery strategies
- URL validation and filtering

#### **MultiPageValidator** (`src/validation/multi-page-validator.ts`)
```typescript
class MultiPageValidator {
  async validateMultiplePages(urls: string[], options: ValidationOptions): Promise<MultiPageAuditResult>
  private async validatePageBatch(urls: string[]): Promise<AuditResult[]>
  private consolidateResults(results: AuditResult[]): MultiPageAuditResult
}
```

**Responsabilidades:**
- Coordinate multi-page audits
- Batch processing
- Results consolidation

## 🎯 WCAG Criteria System

### **Criteria Definition** (`src/core/wcag-criteria.ts`)
```typescript
interface WCAGCriterion {
  id: string;           // "1.1.1"
  name: string;         // "Non-text Content"
  level: 'A' | 'AA' | 'AAA';
  priority: 'P0' | 'P1' | 'P2';
  description: string;
  techniques: string[];
  axeRules: string[];   // Map to axe-core rules
}

const WCAG_CRITERIA: Record<string, WCAGCriterion> = {
  '1.1.1': {
    name: 'Non-text Content',
    level: 'A',
    priority: 'P0',
    axeRules: ['image-alt', 'input-image-alt', 'area-alt']
  },
  // ... 50+ critérios
};
```

### **Simple vs Complete Mode:**
```typescript
function getCriteriaForAudit(type: AuditType): WCAGCriterion[] {
  if (type === 'simple') {
    // 15 critérios críticos (P0 + alguns P1)
    return Object.values(WCAG_CRITERIA)
      .filter(c => c.priority === 'P0' || (c.priority === 'P1' && c.critical))
      .slice(0, 15);
  }
  
  if (type === 'complete') {
    // Todos os 50+ critérios WCAG 2.1 AA/AAA
    return Object.values(WCAG_CRITERIA)
      .filter(c => c.level === 'A' || c.level === 'AA');
  }
}
```

## 🕷️ Page Discovery Strategies

### **Strategy Pattern Implementation:**
```typescript
interface CrawlStrategy {
  discover(baseUrl: string, options: CrawlOptions): Promise<string[]>;
}

class SitemapStrategy implements CrawlStrategy {
  async discover(baseUrl: string): Promise<string[]> {
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    return await this.parseSitemap(sitemapUrl);
  }
}

class DeepCrawlStrategy implements CrawlStrategy {
  async discover(baseUrl: string, options: CrawlOptions): Promise<string[]> {
    return await this.crawlRecursively(baseUrl, options.maxDepth || 3);
  }
}

class ComprehensiveStrategy implements CrawlStrategy {
  async discover(baseUrl: string, options: CrawlOptions): Promise<string[]> {
    // Combine sitemap + deep crawl + common patterns
    const strategies = [
      new SitemapStrategy(),
      new DeepCrawlStrategy(), 
      new CommonPatternsStrategy()
    ];
    
    const results = await Promise.all(
      strategies.map(s => s.discover(baseUrl, options))
    );
    
    return [...new Set(results.flat())]; // Deduplicate
  }
}
```

## 📊 Scoring Algorithm

### **WCAG Score Calculation:**
```typescript
function calculateWCAGScore(results: AxeResults): number {
  const violations = results.violations;
  let penalties = 0;
  
  violations.forEach(violation => {
    const severity = getSeverity(violation.id);
    const elementCount = violation.nodes.length;
    
    switch (severity) {
      case 'critical':
        penalties += elementCount * 20; // Heavy penalty
        break;
      case 'serious': 
        penalties += elementCount * 10;
        break;
      case 'moderate':
        penalties += elementCount * 5;
        break;
      case 'minor':
        penalties += elementCount * 1;
        break;
    }
  });
  
  // Start from 100, subtract penalties
  const score = Math.max(0, 100 - penalties);
  return Math.round(score);
}
```

### **Severity Mapping:**
```typescript
const SEVERITY_MAP: Record<string, ViolationSeverity> = {
  'image-alt': 'critical',        // 1.1.1 - Essential
  'color-contrast': 'critical',   // 1.4.3 - Essential  
  'keyboard': 'critical',         // 2.1.1 - Essential
  'focus-order-semantics': 'serious',
  'landmark-one-main': 'moderate',
  'meta-viewport': 'minor'
};
```

## 🔧 Browser Automation Architecture

### **Browser Management:**
```typescript
class BrowserManager {
  private browsers: Map<string, Browser> = new Map();
  
  async getBrowser(options: BrowserOptions): Promise<Browser> {
    const key = this.getBrowserKey(options);
    
    if (!this.browsers.has(key)) {
      const browser = await this.launchBrowser(options);
      this.browsers.set(key, browser);
    }
    
    return this.browsers.get(key)!;
  }
  
  async cleanup(): Promise<void> {
    for (const browser of this.browsers.values()) {
      await browser.close();
    }
    this.browsers.clear();
  }
}
```

### **Page Lifecycle:**
```typescript
async function auditPage(url: string): Promise<AuditResult> {
  const browser = await browserManager.getBrowser();
  const page = await browser.newPage();
  
  try {
    // Configure page
    await page.setViewport({ width: 1200, height: 800 });
    await page.setUserAgent('AccessibilityAuditor/1.0');
    
    // Navigate with retries
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait for dynamic content
    await page.waitForTimeout(2000);
    
    // Inject and run axe
    await page.addScriptTag({ 
      url: 'https://unpkg.com/axe-core@latest/axe.min.js' 
    });
    
    const results = await page.evaluate(async () => {
      return await axe.run(document, {
        tags: ['wcag2a', 'wcag2aa'],
        timeout: 60000
      });
    });
    
    return processResults(results);
    
  } finally {
    await page.close();
  }
}
```

## 📡 Monitoring & Emergency System

### **Portfolio Monitor Architecture:**
```typescript
class PortfolioMonitor {
  private scheduler: NodeSchedule;
  private emergencyResponse: EmergencyResponse;
  
  async startMonitoring(): Promise<void> {
    // Schedule regular audits
    this.scheduler.scheduleJob('0 */1 * * *', async () => {
      await this.auditAllSites();
    });
    
    // Schedule emergency checks
    this.scheduler.scheduleJob('*/15 * * * *', async () => {
      await this.checkCriticalViolations();
    });
  }
  
  private async checkCriticalViolations(): Promise<void> {
    const sites = await this.getCriticalSites();
    
    for (const site of sites) {
      const result = await this.validator.validateUrl(site.url, {
        auditType: 'simple' // Quick check for critical issues
      });
      
      if (this.hasCriticalViolations(result)) {
        await this.emergencyResponse.triggerAlert({
          site: site.url,
          violations: result.violations.filter(v => v.severity === 'critical'),
          priority: this.calculatePriority(result)
        });
      }
    }
  }
}
```

### **Emergency Response System:**
```typescript
class EmergencyResponse {
  async triggerAlert(incident: Incident): Promise<void> {
    const priority = this.classifyIncident(incident);
    
    switch (priority) {
      case 'P0': // Critical - 2h SLA
        await this.sendImmediateAlert(incident);
        await this.notifyAuthorities(incident);
        break;
        
      case 'P1': // High - 8h SLA  
        await this.sendUrgentAlert(incident);
        break;
        
      case 'P2': // Medium - 24h SLA
        await this.sendNormalAlert(incident);
        break;
    }
    
    await this.logIncident(incident);
  }
}
```

## 🎯 Design Patterns Used

### **1. Strategy Pattern**
- **Usage**: Crawler strategies (sitemap, deep crawl, comprehensive)
- **Benefit**: Easy to add new discovery methods

### **2. Factory Pattern**
- **Usage**: Report generators (HTML, JSON, Markdown)
- **Benefit**: Consistent interface for different formats

### **3. Observer Pattern**
- **Usage**: Emergency alerts and notifications
- **Benefit**: Decouple monitoring from response actions

### **4. Template Method Pattern**
- **Usage**: Validation pipeline (init → validate → score → report)
- **Benefit**: Consistent validation flow with customizable steps

### **5. Singleton Pattern**
- **Usage**: Browser manager, logger
- **Benefit**: Resource management and consistent state

## 🔄 Error Handling & Resilience

### **Retry Strategy:**
```typescript
class RetryableValidator {
  async validateWithRetry(url: string, maxRetries = 3): Promise<AuditResult> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.validator.validateUrl(url);
      } catch (error) {
        lastError = error;
        
        if (this.isRetryableError(error)) {
          await this.delay(attempt * 1000); // Exponential backoff
          continue;
        }
        
        throw error; // Non-retryable error
      }
    }
    
    throw lastError;
  }
}
```

### **Circuit Breaker:**
```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

## 📚 Next Steps

Para continuar explorando a arquitetura:

1. 🤝 **[Contributing Guide](contributing.md)** - Como contribuir
2. 🧪 **[Testing Guide](testing.md)** - Testing strategies  
3. 📚 **[API Reference](api-reference.md)** - Detailed API docs

---

**🏗️ Arquitetura projetada para escalabilidade, manutenibilidade e extensibilidade!**
