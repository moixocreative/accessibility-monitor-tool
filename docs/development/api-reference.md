# API Reference - Classes e Interfaces

> 📚 **Documentação técnica completa das APIs principais**

## 🎯 Core Classes

### **WCAGValidator**

Principal classe para validação de acessibilidade WCAG.

```typescript
class WCAGValidator {
  constructor(options?: ValidatorOptions)
  
  async validateUrl(url: string, options: ValidationOptions): Promise<AuditResult>
  async validateHTML(html: string, options: ValidationOptions): Promise<AuditResult>
  async cleanup(): Promise<void>
}
```

#### **Constructor Options:**
```typescript
interface ValidatorOptions {
  browserOptions?: BrowserOptions;
  timeout?: number;
  headless?: boolean;
  userAgent?: string;
}
```

#### **Methods:**

##### `validateUrl(url, options)`
Valida uma URL específica.

**Parameters:**
- `url: string` - URL para validar
- `options: ValidationOptions` - Opções de validação

**Returns:** `Promise<AuditResult>`

**Example:**
```typescript
const validator = new WCAGValidator();

const result = await validator.validateUrl('https://example.com', {
  auditType: 'simple',
  outputFormat: 'json'
});

console.log(`Score: ${result.score}%`);
console.log(`Violations: ${result.violations.length}`);
```

---

### **PageCrawler**

Responsável pela descoberta automática de páginas.

```typescript
class PageCrawler {
  constructor(options?: CrawlerOptions)
  
  async discoverPages(baseUrl: string, strategy: CrawlStrategy): Promise<CrawlResult[]>
  async parseSitemap(sitemapUrl: string): Promise<string[]>
  async deepCrawl(url: string, maxDepth: number): Promise<string[]>
}
```

#### **Constructor Options:**
```typescript
interface CrawlerOptions {
  maxPages?: number;
  timeout?: number;
  respectRobotsTxt?: boolean;
  followRedirects?: boolean;
  includePatterns?: string[];
  excludePatterns?: string[];
}
```

#### **Methods:**

##### `discoverPages(baseUrl, strategy)`
Descobre páginas usando diferentes estratégias.

**Parameters:**
- `baseUrl: string` - URL base do site
- `strategy: CrawlStrategy` - Estratégia de descoberta

**Returns:** `Promise<CrawlResult[]>`

**Example:**
```typescript
const crawler = new PageCrawler({
  maxPages: 50,
  respectRobotsTxt: true
});

const pages = await crawler.discoverPages('https://example.com', 'comprehensive');
console.log(`Found ${pages.length} pages`);
```

---

### **ReportGenerator**

Gera relatórios em diferentes formatos.

```typescript
class ReportGenerator {
  constructor(options?: ReportOptions)
  
  async generateHTML(result: AuditResult): Promise<string>
  async generateJSON(result: AuditResult): Promise<string>
  async generateMarkdown(result: AuditResult): Promise<string>
  async generatePDF(result: AuditResult): Promise<Buffer>
}
```

#### **Constructor Options:**
```typescript
interface ReportOptions {
  template?: string;
  includeScreenshots?: boolean;
  theme?: 'light' | 'dark';
  branding?: BrandingOptions;
}
```

---

## 🔍 Core Interfaces

### **AuditResult**

Resultado principal de uma auditoria.

```typescript
interface AuditResult {
  id: string;
  url: string;
  timestamp: Date;
  auditType: 'simple' | 'complete';
  score: number;
  scoreDetails: ScoreDetails;
  violations: AccessibilityViolation[];
  passes: AccessibilityCheck[];
  inapplicable: AccessibilityCheck[];
  incomplete: AccessibilityCheck[];
  metadata: AuditMetadata;
}
```

#### **Properties:**
- `id` - Identificador único da auditoria
- `url` - URL auditada
- `timestamp` - Data/hora da auditoria
- `auditType` - Tipo de auditoria ('simple' = 15 critérios, 'complete' = 50+)
- `score` - Score WCAG (0-100)
- `violations` - Array de violações encontradas
- `passes` - Testes que passaram
- `metadata` - Informações técnicas da auditoria

---

### **AccessibilityViolation**

Representa uma violação de acessibilidade.

```typescript
interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: ViolationNode[];
  wcagCriterion?: string;
  priority?: 'P0' | 'P1' | 'P2';
}
```

#### **Properties:**
- `id` - Identificador da regra (e.g., 'image-alt')
- `impact` - Severidade da violação
- `description` - Descrição do problema
- `help` - Texto de ajuda
- `helpUrl` - Link para documentação
- `nodes` - Elementos HTML afetados
- `wcagCriterion` - Critério WCAG correspondente (e.g., '1.1.1')

#### **Example:**
```typescript
const violation: AccessibilityViolation = {
  id: 'image-alt',
  impact: 'critical',
  description: 'Images must have alternate text',
  help: 'Elements must have alternate text',
  helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/image-alt',
  tags: ['cat.text-alternatives', 'wcag2a', 'wcag111'],
  nodes: [
    {
      html: '<img src="chart.png">',
      target: ['#content > img:nth-child(1)'],
      failureSummary: 'Fix any of the following:\n  Element does not have an alt attribute'
    }
  ],
  wcagCriterion: '1.1.1',
  priority: 'P0'
};
```

---

### **ValidationOptions**

Opções para configurar uma validação.

```typescript
interface ValidationOptions {
  auditType?: 'simple' | 'complete';
  outputFormat?: 'console' | 'json' | 'html' | 'markdown';
  timeout?: number;
  waitForSelector?: string;
  disableJavaScript?: boolean;
  viewport?: ViewportOptions;
  customCriteria?: string[];
  includeScreenshots?: boolean;
}
```

#### **Properties:**
- `auditType` - Tipo de auditoria (padrão: 'simple')
- `outputFormat` - Formato do relatório (padrão: 'console')
- `timeout` - Timeout em ms (padrão: 30000)
- `waitForSelector` - Aguardar elemento específico
- `disableJavaScript` - Desabilitar JS (para testar HTML puro)
- `viewport` - Configurações de viewport
- `customCriteria` - Critérios WCAG específicos
- `includeScreenshots` - Capturar screenshots das violações

---

### **CrawlResult**

Resultado da descoberta de uma página.

```typescript
interface CrawlResult {
  url: string;
  title?: string;
  status: number;
  contentType?: string;
  lastModified?: Date;
  depth: number;
  source: 'sitemap' | 'robots' | 'crawl' | 'common-patterns';
  links?: string[];
}
```

---

## 🛠️ Utility Functions

### **WCAG Criteria Utilities**

```typescript
// Get criteria by audit type
function getCriteriaForAudit(type: AuditType): WCAGCriterion[]

// Get criterion details
function getCriterion(id: string): WCAGCriterion | undefined

// Check if criterion is priority
function isCriticalCriterion(id: string): boolean

// Map axe rule to WCAG criterion
function mapAxeRuleToWCAG(ruleId: string): string | undefined
```

**Example:**
```typescript
import { getCriteriaForAudit, getCriterion } from './core/wcag-criteria';

const simpleCriteria = getCriteriaForAudit('simple');
console.log(`Simple audit covers ${simpleCriteria.length} criteria`);

const criterion = getCriterion('1.1.1');
console.log(`Criterion: ${criterion.name}`);
```

---

### **Scoring Utilities**

```typescript
// Calculate WCAG score from violations
function calculateWCAGScore(violations: AccessibilityViolation[]): number

// Get score color/status
function getScoreStatus(score: number): 'excellent' | 'good' | 'needs-improvement' | 'poor'

// Calculate improvement suggestions
function getImprovementSuggestions(violations: AccessibilityViolation[]): Suggestion[]
```

**Example:**
```typescript
import { calculateWCAGScore, getScoreStatus } from './utils/scoring';

const score = calculateWCAGScore(violations);
const status = getScoreStatus(score);

console.log(`Score: ${score}% (${status})`);
```

---

### **Browser Utilities**

```typescript
// Initialize browser with options
function initBrowser(options?: BrowserOptions): Promise<Browser>

// Create page with accessibility setup
function createAccessibilityPage(browser: Browser): Promise<Page>

// Inject axe-core into page
function injectAxeCore(page: Page): Promise<void>

// Capture element screenshot
function captureElementScreenshot(page: Page, selector: string): Promise<Buffer>
```

---

## 🎨 Extension Points

### **Custom WCAG Criteria**

Adicionar critérios customizados:

```typescript
// Define custom criterion
const customCriterion: WCAGCriterion = {
  id: '2.5.1',
  name: 'Pointer Gestures',
  level: 'A',
  priority: 'P1',
  description: 'All functionality that uses multipoint or path-based gestures...',
  techniques: ['G215', 'G216'],
  axeRules: ['target-size']
};

// Register criterion
registerCustomCriterion(customCriterion);

// Use in validation
const result = await validator.validateUrl(url, {
  customCriteria: ['2.5.1']
});
```

---

### **Custom Report Templates**

Criar templates de relatório personalizados:

```typescript
// Define custom template
const customTemplate: ReportTemplate = {
  name: 'corporate-template',
  format: 'html',
  template: `
    <html>
      <head><title>{{company}} Accessibility Report</title></head>
      <body>
        <h1>{{siteName}} - Score: {{score}}%</h1>
        {{#violations}}
          <div class="violation {{impact}}">
            <h3>{{description}}</h3>
            <p>{{help}}</p>
          </div>
        {{/violations}}
      </body>
    </html>
  `,
  styles: 'path/to/corporate-styles.css'
};

// Register template
registerReportTemplate(customTemplate);

// Use in report generation
const report = await generator.generate(result, {
  template: 'corporate-template',
  variables: {
    company: 'ACME Corp',
    siteName: 'Main Website'
  }
});
```

---

### **Custom Crawl Strategies**

Implementar estratégias de descoberta personalizadas:

```typescript
class APICrawlStrategy implements CrawlStrategy {
  async discover(baseUrl: string, options: CrawlOptions): Promise<string[]> {
    // Use API to get list of pages
    const response = await fetch(`${baseUrl}/api/sitemap`);
    const pages = await response.json();
    
    return pages.map(page => `${baseUrl}${page.path}`);
  }
}

// Register strategy
registerCrawlStrategy('api', new APICrawlStrategy());

// Use in crawler
const pages = await crawler.discoverPages(baseUrl, 'api');
```

---

## 🔧 Configuration Types

### **ValidatorConfiguration**

```typescript
interface ValidatorConfiguration {
  browser: {
    headless: boolean;
    timeout: number;
    viewport: ViewportOptions;
    userAgent: string;
  };
  
  validation: {
    defaultAuditType: AuditType;
    customCriteria: string[];
    includeScreenshots: boolean;
    waitTime: number;
  };
  
  reports: {
    defaultFormat: OutputFormat;
    template: string;
    outputDirectory: string;
    includeTimestamp: boolean;
  };
  
  crawler: {
    maxPages: number;
    respectRobotsTxt: boolean;
    includePatterns: string[];
    excludePatterns: string[];
  };
  
  monitoring: {
    interval: number;
    emergencyThreshold: number;
    alertEmail: string;
  };
}
```

---

### **PortfolioConfiguration**

```typescript
interface PortfolioConfiguration {
  sites: PortfolioSite[];
  globalSettings: {
    auditType: AuditType;
    frequency: string; // cron expression
    timeout: number;
  };
  notifications: {
    email: EmailConfig;
    slack?: SlackConfig;
    webhook?: WebhookConfig;
  };
}

interface PortfolioSite {
  url: string;
  name: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  auditType?: AuditType;
  frequency?: string;
  contact?: string;
  tags?: string[];
}
```

---

## 📚 Usage Examples

### **Complete Validation Workflow**

```typescript
import { WCAGValidator, ReportGenerator, PageCrawler } from 'accessibility-monitor-tool';

async function auditWebsite(baseUrl: string) {
  // 1. Initialize components
  const crawler = new PageCrawler({ maxPages: 20 });
  const validator = new WCAGValidator();
  const reporter = new ReportGenerator();
  
  try {
    // 2. Discover pages
    const pages = await crawler.discoverPages(baseUrl, 'comprehensive');
    console.log(`Found ${pages.length} pages`);
    
    // 3. Validate each page
    const results: AuditResult[] = [];
    for (const page of pages) {
      const result = await validator.validateUrl(page.url, {
        auditType: 'simple',
        includeScreenshots: true
      });
      results.push(result);
    }
    
    // 4. Generate consolidated report
    const report = await reporter.generateMultiPageReport(results);
    console.log('Report generated:', report.filePath);
    
    // 5. Check for critical issues
    const criticalIssues = results.filter(r => r.score < 70);
    if (criticalIssues.length > 0) {
      console.warn(`⚠️ ${criticalIssues.length} pages with critical issues`);
    }
    
  } finally {
    await validator.cleanup();
  }
}

// Execute
auditWebsite('https://example.com');
```

---

**📚 Esta API foi projetada para ser extensível e fácil de usar!**
