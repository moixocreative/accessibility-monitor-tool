# Contributing Guide - Como Contribuir

> 🤝 **Workflow completo para contribuir com o projeto**

## 🎯 Como Contribuir

### **Types de Contribuições Bem-vindas:**
- 🐛 **Bug fixes** - Corrigir problemas existentes
- ✨ **New features** - Adicionar funcionalidades
- 📚 **Documentation** - Melhorar documentação
- 🧪 **Tests** - Adicionar ou melhorar testes
- 🎨 **UI/UX** - Melhorar relatórios e interface
- 🚀 **Performance** - Otimizações de velocidade
- 🔧 **Tooling** - CI/CD, linting, automation

## 🚀 Quick Start para Contribuir

### **1. Setup (5 min)**
```bash
# 1. Fork no GitHub (botão Fork)
# 2. Clone o seu fork
git clone https://github.com/SEU_USERNAME/accessibility-monitor-tool.git
cd accessibility-monitor-tool

# 3. Add upstream remote
git remote add upstream https://github.com/moixocreative/accessibility-monitor-tool.git

# 4. Install e verificar
yarn install
yarn test
yarn lint
```

### **2. Create Feature Branch (1 min)**
```bash
# Sempre criar branch a partir do development
git checkout development
git pull upstream development

# Criar branch com nome descritivo
git checkout -b feature/add-pdf-report-generator
# ou
git checkout -b fix/resolve-memory-leak-crawler
# ou  
git checkout -b docs/improve-api-documentation
```

### **3. Develop & Test (tempo variável)**
```bash
# Development com hot reload
yarn dev

# Run tests em watch mode
yarn test --watch

# Lint enquanto desenvolve
yarn lint --fix
```

### **4. Commit & Push (2 min)**
```bash
# Stage changes
git add .

# Commit seguindo conventional commits
git commit -m "feat: add PDF report generator with custom templates"

# Push para o seu fork
git push origin feature/add-pdf-report-generator
```

### **5. Create Pull Request (2 min)**
1. Ir ao GitHub no seu fork
2. Clicar "Compare & pull request"
3. Preencher template do PR
4. Aguardar review!

## 📋 Git Workflow Detalhado

### **Branch Strategy:**
```
main
├── development (branch principal)
│   ├── feature/new-wcag-criterion
│   ├── fix/browser-timeout-issue  
│   ├── docs/api-reference-update
│   └── refactor/improve-scoring
└── hotfix/critical-security-patch (direto do main)
```

### **Naming Conventions:**
```bash
# Features
feature/add-json-schema-validation
feature/integrate-lighthouse-metrics

# Bug fixes  
fix/resolve-memory-leak-in-crawler
fix/handle-ssl-certificate-errors

# Documentation
docs/update-installation-guide
docs/add-contributing-examples

# Refactoring
refactor/extract-report-generators
refactor/improve-error-handling

# Performance
perf/optimize-browser-pool-management
perf/reduce-memory-usage-large-sites

# Tests
test/add-integration-tests-crawler
test/improve-coverage-validation
```

### **Commit Message Format:**
Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: Nova funcionalidade
- `fix`: Bug fix
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refactoring (não é feature nem fix)
- `perf`: Melhoria de performance
- `test`: Adicionar ou corrigir testes
- `chore`: Maintenance (build, CI, etc.)

**Exemplos:**
```bash
feat(validation): add support for WCAG 2.2 criteria

fix(crawler): handle timeout errors in sitemap parsing

docs(api): update WCAGValidator interface documentation

refactor(reports): extract HTML template system

perf(browser): implement browser pooling for concurrent audits

test(integration): add multi-page validation test suite
```

## 🧪 Testing Guidelines

### **Test Strategy:**
```bash
# Unit tests (fast, isolated)
yarn test src/validation/wcag-validator.test.ts

# Integration tests (slower, real browsers)
yarn test:integration

# E2E tests (slowest, full workflows)
yarn test:e2e

# Coverage report
yarn test --coverage
```

### **Writing Good Tests:**
```typescript
// ✅ Good test example
describe('WCAGValidator', () => {
  describe('validateUrl', () => {
    it('should return score above 90% for accessible page', async () => {
      // Arrange
      const validator = new WCAGValidator();
      const accessibleUrl = 'https://accessible-example.com';
      
      // Act
      const result = await validator.validateUrl(accessibleUrl, {
        auditType: 'simple'
      });
      
      // Assert
      expect(result.score).toBeGreaterThan(90);
      expect(result.violations).toHaveLength(0);
      expect(result.url).toBe(accessibleUrl);
    });

    it('should handle network timeouts gracefully', async () => {
      // Arrange
      const validator = new WCAGValidator();
      const timeoutUrl = 'https://httpstat.us/200?sleep=60000';
      
      // Act & Assert
      await expect(
        validator.validateUrl(timeoutUrl, { timeout: 1000 })
      ).rejects.toThrow('Navigation timeout');
    });
  });
});
```

### **Test Requirements:**
- ✅ **Cada PR deve manter/melhorar coverage**
- ✅ **Testes devem ser determinísticos** (não flaky)
- ✅ **Mock dependencies externas** (network, filesystem)
- ✅ **Usar test data consistente**
- ✅ **Cleanup após testes** (browsers, temp files)

## 📝 Code Style & Standards

### **ESLint Configuration:**
```javascript
// .eslintrc.js (já configurado)
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

### **Prettier Configuration:**
```json
// .prettierrc (já configurado)
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### **TypeScript Standards:**
```typescript
// ✅ Good practices
interface WCAGCriterion {
  readonly id: string;
  readonly name: string;
  readonly level: 'A' | 'AA' | 'AAA';
  readonly priority: 'P0' | 'P1' | 'P2';
}

class WCAGValidator {
  private readonly browser: Browser;
  
  public async validateUrl(
    url: string, 
    options: ValidationOptions
  ): Promise<AuditResult> {
    // Implementation
  }
  
  private async initBrowser(): Promise<Browser> {
    // Private implementation details
  }
}

// ✅ Error handling
async function validateWithRetry(url: string): Promise<AuditResult> {
  try {
    return await validator.validateUrl(url);
  } catch (error) {
    if (error instanceof NetworkError) {
      logger.warn(`Network error validating ${url}:`, error.message);
      throw new ValidationError(`Failed to validate ${url}`, { cause: error });
    }
    throw error; // Re-throw unexpected errors
  }
}
```

## 🔍 Code Review Process

### **Review Checklist:**

#### **Functionality:**
- ✅ **Feature works as expected**
- ✅ **Edge cases are handled**
- ✅ **Error handling is appropriate**
- ✅ **Performance is acceptable**

#### **Code Quality:**
- ✅ **Code is readable and well-structured**
- ✅ **Functions are focused and single-purpose**
- ✅ **Naming is clear and consistent**
- ✅ **No code duplication**

#### **Testing:**
- ✅ **Adequate test coverage**
- ✅ **Tests are meaningful and stable**
- ✅ **Tests document expected behavior**

#### **Documentation:**
- ✅ **Public APIs are documented**
- ✅ **Complex logic has comments**
- ✅ **README is updated if needed**

### **Review Timeline:**
- 🕐 **Initial response**: 24 horas
- 🕑 **Full review**: 2-3 dias úteis
- 🕒 **Follow-up reviews**: 1 dia útil

### **Handling Review Feedback:**
```bash
# 1. Address feedback locally
git checkout feature/my-branch
# Make changes...

# 2. Commit changes (will be squashed)
git add .
git commit -m "address review feedback: improve error handling"

# 3. Push updates
git push origin feature/my-branch

# PR is automatically updated!
```

## 🚀 Release Process

### **Version Bumping:**
Usamos [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features (backward compatible)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

### **Release Checklist:**
```bash
# 1. Create release branch
git checkout development
git pull upstream development
git checkout -b release/v1.2.0

# 2. Update version
npm version minor  # ou major/patch

# 3. Update CHANGELOG.md
# Add release notes, breaking changes, new features

# 4. Create PR to main
# Get approval from maintainers

# 5. Tag release after merge
git tag v1.2.0
git push upstream v1.2.0

# 6. GitHub Actions will build and publish
```

## 📊 Issue & Project Management

### **Issue Labels:**
- 🐛 `bug` - Something isn't working
- ✨ `enhancement` - New feature or request
- 📚 `documentation` - Improvements or additions
- 🆘 `help wanted` - Extra attention is needed
- 🎯 `good first issue` - Good for newcomers
- 🔥 `priority: high` - High priority
- 🚀 `priority: critical` - Critical/blocking

### **Issue Templates:**
Usamos templates para consistência:

#### **Bug Report:**
```markdown
**Describe the bug**
Clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Run command '...'
2. With parameters '...'
3. See error

**Expected behavior**
What you expected to happen.

**Environment:**
- OS: [e.g. macOS 12.5]
- Node.js: [e.g. 18.16.0]
- Version: [e.g. 1.2.0]

**Additional context**
Any other context, logs, screenshots.
```

#### **Feature Request:**
```markdown
**Is your feature request related to a problem?**
Clear description of the problem.

**Describe the solution you'd like**
Clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions you've considered.

**Additional context**
Any other context or screenshots.
```

## 🏆 Recognition & Credits

### **Contributors:**
Todos os contributors são reconhecidos no README.md e releases.

### **Types of Contributions:**
- 💻 **Code** - Code contributions
- 📖 **Documentation** - Documentation improvements  
- 🐛 **Bug reports** - Bug discovery and reporting
- 💡 **Ideas** - Feature suggestions and discussions
- 🤔 **Mentoring** - Helping other contributors

### **Hall of Fame:**
Contributors significativos podem receber:
- 📛 **Special badges** no GitHub
- 🎉 **Mention in release notes**
- 🏆 **Contributor of the month**

## 🆘 Getting Help

### **For Contributors:**
- 💬 **GitHub Discussions** - Questions and ideas
- 📧 **Email** - mauriciopereita@untile.pt
- 🐛 **Issues** - Bug reports and feature requests

### **For Maintainers:**
- 🔒 **Private discussions** - Security issues
- 📋 **Project planning** - Roadmap discussions

---

**🤝 Thank you for contributing! Every contribution makes this project better! 🎉**
