# Testing & Debugging - Estratégias de Teste

> 🧪 **Guia completo para testes, debugging e garantia de qualidade**

## 🎯 Testing Strategy Overview

### **Testing Pyramid:**
```
                    🔺 E2E Tests
                   (Slow, High Value)
                 Integration Tests  
               (Medium Speed, Medium Value)
             Unit Tests
           (Fast, Medium Value)
         Static Analysis
       (Fastest, Low Value)
```

### **Test Categories:**

#### **🚀 Unit Tests** - Fast & Isolated
- **Scope**: Individual functions/classes
- **Speed**: < 1s per test
- **Coverage**: 80%+ target
- **Tools**: Jest, TS-Jest

#### **🔗 Integration Tests** - Real Dependencies  
- **Scope**: Component interaction
- **Speed**: 5-30s per test
- **Coverage**: Critical paths
- **Tools**: Jest + real browsers

#### **🌐 E2E Tests** - Full Workflows
- **Scope**: User journeys
- **Speed**: 1-5min per test
- **Coverage**: Happy paths + edge cases
- **Tools**: Playwright + real sites

#### **📊 Performance Tests** - Speed & Memory
- **Scope**: Resource usage
- **Speed**: Variable
- **Tools**: Clinic.js, Artillery

## 🧪 Running Tests

### **Basic Commands:**
```bash
# All tests
yarn test

# Unit tests only
yarn test:unit

# Integration tests
yarn test:integration

# E2E tests
yarn test:e2e

# Coverage report
yarn test --coverage

# Watch mode (development)
yarn test --watch

# Specific test file
yarn test src/validation/wcag-validator.test.ts

# Specific test pattern
yarn test --testNamePattern="should validate accessible pages"
```

### **Advanced Testing:**
```bash
# Debug mode
yarn test --inspect-brk src/validation/wcag-validator.test.ts

# Verbose output
yarn test --verbose

# Update snapshots
yarn test --updateSnapshot

# Run tests in band (no parallel)
yarn test --runInBand

# Max workers
yarn test --maxWorkers=2

# Timeout for slow tests
yarn test --testTimeout=60000
```

## 📁 Test Structure

### **Directory Layout:**
```
__tests__/
├── unit/                    # Unit tests
│   ├── core/
│   │   ├── wcag-criteria.test.ts
│   │   └── scoring.test.ts
│   ├── validation/
│   │   ├── wcag-validator.test.ts
│   │   └── multi-page-validator.test.ts
│   └── crawler/
│       └── page-crawler.test.ts
├── integration/             # Integration tests
│   ├── browser-automation.test.ts
│   ├── report-generation.test.ts
│   └── email-notifications.test.ts
├── e2e/                    # End-to-end tests
│   ├── complete-audit-workflow.test.ts
│   ├── multi-page-discovery.test.ts
│   └── portfolio-monitoring.test.ts
├── fixtures/               # Test data
│   ├── html-samples/
│   ├── expected-results/
│   └── mock-responses/
└── helpers/                # Test utilities
    ├── test-server.ts
    ├── mock-browser.ts
    └── assertions.ts
```

### **Test File Naming:**
```bash
# Unit tests
component-name.test.ts
component-name.spec.ts

# Integration tests  
feature-name.integration.test.ts

# E2E tests
workflow-name.e2e.test.ts

# Performance tests
component-name.perf.test.ts
```

## ✍️ Writing Good Tests

### **Unit Test Example:**
```typescript
// src/validation/__tests__/wcag-validator.test.ts
import { WCAGValidator } from '../wcag-validator';
import { mockBrowser } from '../../__tests__/helpers/mock-browser';

describe('WCAGValidator', () => {
  let validator: WCAGValidator;
  
  beforeEach(() => {
    validator = new WCAGValidator();
  });

  afterEach(async () => {
    await validator.cleanup();
  });

  describe('validateUrl', () => {
    it('should return high score for accessible page', async () => {
      // Arrange
      const accessibleHtml = `
        <html lang="en">
          <head><title>Accessible Page</title></head>
          <body>
            <h1>Main Heading</h1>
            <img src="logo.png" alt="Company Logo">
            <a href="/contact">Contact Us</a>
          </body>
        </html>
      `;
      
      const mockPage = mockBrowser.createPage(accessibleHtml);
      jest.spyOn(validator, 'initBrowser').mockResolvedValue(mockPage);

      // Act
      const result = await validator.validateUrl('https://accessible.example.com', {
        auditType: 'simple'
      });

      // Assert
      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.violations).toHaveLength(0);
      expect(result.url).toBe('https://accessible.example.com');
      expect(result.auditType).toBe('simple');
    });

    it('should detect missing alt text violation', async () => {
      // Arrange
      const inaccessibleHtml = `
        <html>
          <body>
            <img src="important-chart.png"> <!-- Missing alt -->
          </body>
        </html>
      `;
      
      const mockPage = mockBrowser.createPage(inaccessibleHtml);
      jest.spyOn(validator, 'initBrowser').mockResolvedValue(mockPage);

      // Act
      const result = await validator.validateUrl('https://broken.example.com');

      // Assert
      expect(result.score).toBeLessThan(90);
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          id: 'image-alt',
          impact: 'critical',
          nodes: expect.arrayContaining([
            expect.objectContaining({
              html: '<img src="important-chart.png">'
            })
          ])
        })
      );
    });

    it('should handle network timeouts gracefully', async () => {
      // Arrange
      jest.spyOn(validator, 'initBrowser').mockRejectedValue(
        new Error('Navigation timeout of 30000 ms exceeded')
      );

      // Act & Assert
      await expect(
        validator.validateUrl('https://timeout.example.com', { timeout: 1000 })
      ).rejects.toThrow('Navigation timeout');
    });
  });
});
```

### **Integration Test Example:**
```typescript
// __tests__/integration/complete-audit-workflow.integration.test.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';

const execAsync = promisify(exec);

describe('Complete Audit Workflow Integration', () => {
  it('should complete full audit and generate HTML report', async () => {
    // Arrange
    const testUrl = 'https://accessible-colors.com'; // Known accessible site
    const reportPath = 'reports/integration-test-report.html';

    // Act
    const { stdout, stderr } = await execAsync(
      `yarn audit:wcag ${testUrl} simple html`,
      { timeout: 60000 }
    );

    // Assert
    expect(stderr).toBe('');
    expect(stdout).toContain('Score WCAG:');
    expect(stdout).toContain('🟢'); // Should be green (good score)

    // Verify report file was created
    const reportContent = await readFile(reportPath, 'utf-8');
    expect(reportContent).toContain('<html');
    expect(reportContent).toContain('Accessibility Report');
    expect(reportContent).toContain(testUrl);
  }, 60000);

  it('should discover multiple pages and audit them', async () => {
    // Arrange
    const testUrl = 'https://a11yproject.com'; // Known site with sitemap
    
    // Act
    const { stdout } = await execAsync(
      `yarn audit:multi ${testUrl} sitemap simple console 5`,
      { timeout: 120000 }
    );

    // Assert
    expect(stdout).toContain('PÁGINAS DESCOBERTAS:');
    expect(stdout).toMatch(/\d+ páginas encontradas/);
    expect(stdout).toContain('RELATÓRIO MULTI-PÁGINA');
  }, 120000);
});
```

### **E2E Test Example:**
```typescript
// __tests__/e2e/portfolio-monitoring.e2e.test.ts
import { PortfolioMonitor } from '../../src/monitoring/portfolio-monitor';
import { EmergencyResponse } from '../../src/emergency/emergency-response';

describe('Portfolio Monitoring E2E', () => {
  let monitor: PortfolioMonitor;
  let emergencyResponse: EmergencyResponse;

  beforeAll(async () => {
    // Setup test environment
    monitor = new PortfolioMonitor({
      sites: [
        { url: 'https://good-site.example.com', priority: 'high' },
        { url: 'https://broken-site.example.com', priority: 'critical' }
      ]
    });
    emergencyResponse = new EmergencyResponse();
  });

  afterAll(async () => {
    await monitor.cleanup();
  });

  it('should monitor portfolio and trigger alerts for critical violations', async () => {
    // Arrange
    const alertsSent: any[] = [];
    jest.spyOn(emergencyResponse, 'sendAlert').mockImplementation(async (alert) => {
      alertsSent.push(alert);
    });

    // Act
    await monitor.auditPortfolio();

    // Assert
    expect(alertsSent).toHaveLength(1); // Only broken site should trigger alert
    expect(alertsSent[0]).toMatchObject({
      site: 'https://broken-site.example.com',
      priority: 'P0',
      violations: expect.arrayContaining([
        expect.objectContaining({ impact: 'critical' })
      ])
    });
  }, 180000);
});
```

## 🔍 Test Data & Fixtures

### **HTML Test Fixtures:**
```typescript
// __tests__/fixtures/html-samples.ts
export const HTML_FIXTURES = {
  accessible: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Accessible Test Page</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body>
        <header>
          <h1>Main Page Title</h1>
          <nav>
            <ul>
              <li><a href="/home">Home</a></li>
              <li><a href="/about">About</a></li>
            </ul>
          </nav>
        </header>
        <main>
          <h2>Content Section</h2>
          <img src="chart.png" alt="Sales data showing 20% increase">
          <p>This page follows WCAG 2.1 AA guidelines.</p>
        </main>
      </body>
    </html>
  `,

  missingAltText: `
    <html>
      <body>
        <img src="important-image.png">
        <img src="decorative.png" alt="">
      </body>
    </html>
  `,

  poorContrast: `
    <html>
      <head>
        <style>
          .low-contrast { color: #ccc; background: #ddd; }
        </style>
      </head>
      <body>
        <p class="low-contrast">This text has poor contrast</p>
      </body>
    </html>
  `,

  missingHeadings: `
    <html>
      <body>
        <h3>This should be h1</h3>
        <h2>This h2 comes before h1</h2>
        <h1>Main heading comes too late</h1>
      </body>
    </html>
  `
};
```

### **Expected Results:**
```typescript
// __tests__/fixtures/expected-results.ts
export const EXPECTED_RESULTS = {
  accessiblePage: {
    score: 100,
    violations: [],
    totalElements: 8,
    criteria: {
      '1.1.1': { passed: true, description: 'All images have alt text' },
      '1.4.3': { passed: true, description: 'Sufficient color contrast' },
      '2.4.1': { passed: true, description: 'Skip links present' }
    }
  },

  missingAltText: {
    scoreRange: { min: 70, max: 85 },
    violations: [
      {
        id: 'image-alt',
        impact: 'critical',
        nodeCount: 1
      }
    ]
  }
};
```

## 🔧 Debugging Tests

### **Debug Configuration:**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "--runInBand",
        "--testNamePattern=${input:testName}"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Debug Specific Test File",
      "type": "node",
      "request": "launch", 
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "--runInBand",
        "${relativeFile}"
      ],
      "console": "integratedTerminal"
    }
  ],
  "inputs": [
    {
      "id": "testName",
      "description": "Test name pattern",
      "default": "should validate accessible pages",
      "type": "promptString"
    }
  ]
}
```

### **Debug Commands:**
```bash
# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand src/validation/wcag-validator.test.ts

# Debug with Chrome DevTools
node --inspect node_modules/.bin/jest --runInBand

# Debug integration test
DEBUG=* yarn test:integration

# Debug browser automation
PUPPETEER_HEADLESS=false yarn test:integration
```

### **Logging in Tests:**
```typescript
// Test-specific logging
beforeEach(() => {
  if (process.env.DEBUG_TESTS) {
    console.log('Starting test:', expect.getState().currentTestName);
  }
});

// Conditional detailed logging
const debugLog = process.env.DEBUG_TESTS ? console.log : () => {};

it('should handle complex validation', async () => {
  debugLog('Setting up test data...');
  const testData = setupTestData();
  
  debugLog('Running validation...');
  const result = await validator.validate(testData);
  
  debugLog('Validation result:', result);
  expect(result.score).toBeGreaterThan(80);
});
```

## 📊 Performance Testing

### **Memory Usage Tests:**
```typescript
// __tests__/performance/memory-usage.perf.test.ts
describe('Memory Usage Performance', () => {
  it('should not leak memory during multiple validations', async () => {
    // Arrange
    const validator = new WCAGValidator();
    const initialMemory = process.memoryUsage().heapUsed;
    const urls = Array(50).fill('https://example.com');

    // Act
    for (const url of urls) {
      await validator.validateUrl(url);
      
      // Force garbage collection periodically
      if (global.gc && urls.indexOf(url) % 10 === 0) {
        global.gc();
      }
    }

    // Assert
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    const maxAcceptableIncrease = 100 * 1024 * 1024; // 100MB

    expect(memoryIncrease).toBeLessThan(maxAcceptableIncrease);
  });
});
```

### **Speed Benchmarks:**
```typescript
// __tests__/performance/validation-speed.perf.test.ts
describe('Validation Speed Benchmarks', () => {
  it('should validate simple page within 5 seconds', async () => {
    // Arrange
    const validator = new WCAGValidator();
    const testUrl = 'https://simple-page.example.com';
    
    // Act
    const startTime = Date.now();
    await validator.validateUrl(testUrl, { auditType: 'simple' });
    const endTime = Date.now();
    
    // Assert
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(5000); // 5 seconds
  });

  it('should complete multi-page audit within reasonable time', async () => {
    // Arrange
    const validator = new MultiPageValidator();
    const maxPages = 10;
    const maxTimePerPage = 8000; // 8 seconds per page
    
    // Act
    const startTime = Date.now();
    await validator.validateMultiplePages('https://example.com', { maxPages });
    const endTime = Date.now();
    
    // Assert
    const duration = endTime - startTime;
    const maxExpectedTime = maxPages * maxTimePerPage;
    expect(duration).toBeLessThan(maxExpectedTime);
  });
});
```

## 🎯 Test Coverage

### **Coverage Configuration:**
```json
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/scripts/**', // CLI scripts
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    'src/core/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    'src/validation/': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

### **Coverage Commands:**
```bash
# Generate coverage report
yarn test --coverage

# View HTML coverage report
open coverage/lcov-report/index.html

# Coverage for specific directory
yarn test src/validation/ --coverage

# Watch coverage
yarn test --coverage --watchAll
```

## 🚀 CI/CD Integration

### **GitHub Actions Test Workflow:**
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18, 20]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'yarn'
      
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      
      - name: Run linting
        run: yarn lint
      
      - name: Run unit tests
        run: yarn test:unit --coverage
      
      - name: Run integration tests
        run: yarn test:integration
        env:
          CI: true
          HEADLESS: true
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## 📚 Testing Best Practices

### **✅ Do's:**
- ✅ **Test behavior, not implementation**
- ✅ **Use descriptive test names**
- ✅ **Follow AAA pattern** (Arrange, Act, Assert)
- ✅ **Mock external dependencies**
- ✅ **Test edge cases and error conditions**
- ✅ **Keep tests independent and idempotent**
- ✅ **Use real data when possible**

### **❌ Don'ts:**
- ❌ **Don't test third-party libraries**
- ❌ **Don't use production data in tests**
- ❌ **Don't write tests that depend on external services**
- ❌ **Don't skip cleanup (memory leaks)**
- ❌ **Don't test implementation details**
- ❌ **Don't write flaky tests**

---

**🧪 Solid testing = reliable, maintainable code!**
