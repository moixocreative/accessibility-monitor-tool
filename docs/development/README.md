# Development Guide - Para Developers

> 👨‍💻 **Guia completo para contribuir com o desenvolvimento da ferramenta**

Este guia é para **developers** que querem **contribuir**, **extender** ou **integrar** esta ferramenta nos seus projetos.

## 📋 O que você vai encontrar aqui

### 🚀 [**Setup & Installation**](setup.md)
- Ambiente de desenvolvimento
- Dependências e ferramentas
- Primeira contribuição

### 🏗️ [**Architecture Overview**](architecture.md)
- Como o sistema funciona
- Estrutura de código
- Patterns e princípios

### 🤝 [**Contributing Guide**](contributing.md)
- Workflow de contribuição
- Code review process
- Git flow e PRs

### 🧪 [**Testing & Debugging**](testing.md)
- Testes unitários e integração
- Debugging tools
- Performance testing

### 📚 [**API Reference**](api-reference.md)
- Classes e interfaces principais
- Extensibilidade
- Hooks e plugins

## 🎯 Quick Start para Developers

### ⚡ **Setup Rápido**
```bash
# Clone e setup
git clone https://github.com/moixocreative/accessibility-monitor-tool.git
cd accessibility-monitor-tool
yarn install

# Ambiente de desenvolvimento
cp env.example .env
yarn build
yarn test
```

### 🧪 **Desenvolvimento**
```bash
# Watch mode
yarn dev

# Executar testes
yarn test --watch

# Debugging
yarn test:debug

# Linting
yarn lint --fix
```

### 🚀 **Fazer uma contribuição**
```bash
# Criar feature branch
git checkout -b feature/amazing-feature

# Desenvolver + testar
yarn test
yarn lint

# Commit (seguindo conventional commits)
git commit -m "feat: add amazing feature"

# Push e PR
git push origin feature/amazing-feature
```

## 🏗️ Arquitetura em 5 minutos

### **Core Components:**
```
src/
├── core/              # 15 critérios WCAG prioritários
├── validation/        # WCAGValidator (axe-core + custom)
├── crawler/          # PageCrawler (sitemap + auto discovery)
├── reports/          # ReportGenerator (HTML, JSON, etc.)
├── monitoring/       # PortfolioMonitor (múltiplos sites)
├── emergency/        # EmergencyResponse (notifications)
└── scripts/          # CLI commands (wcag-validation.ts, etc.)
```

### **Key Classes:**
- `WCAGValidator` - Executa validações de acessibilidade
- `PageCrawler` - Descobre páginas automaticamente  
- `MultiPageValidator` - Orquestra validação multi-página
- `ReportGenerator` - Gera relatórios em vários formatos
- `PortfolioMonitor` - Gere múltiplos sites

### **Technologies Stack:**
- **TypeScript** - Linguagem principal
- **Puppeteer/Playwright** - Browser automation
- **axe-core** - Accessibility testing engine
- **Node.js** - Runtime
- **Jest** - Testing framework

## 🛠️ Areas de Contribuição

### 🎯 **Beginner Friendly**
- Documentação e exemplos
- Testes unitários
- Bug fixes pequenos
- Melhoria de mensagens de erro

### 🔧 **Intermediate**
- Novos tipos de relatório
- Melhoria de performance
- Integração com ferramentas CI/CD
- Novos critérios WCAG

### 🚀 **Advanced**
- Nova arquitetura de crawling
- Extensão do validation engine
- Integração com APIs externas
- Otimização de browser automation

## 📊 Workflow de Desenvolvimento

### **1. Planning & Issue Creation**
- Criar/pegar issue no GitHub
- Discutir approach nos comentários
- Definir scope e acceptance criteria

### **2. Development**
- Criar feature branch
- Desenvolver com TDD
- Escrever/atualizar testes
- Seguir coding standards

### **3. Testing & Quality**
- Executar testes localmente
- Verificar coverage
- Executar linting
- Testar em diferentes ambientes

### **4. Code Review & Integration**
- Criar PR com descrição detalhada
- Revisar feedback
- Fazer ajustes necessários
- Merge após approval

## 🎪 Demo: Adicionar Novo Critério WCAG

Exemplo prático de como estender a ferramenta:

```typescript
// 1. Adicionar critério em src/core/wcag-criteria.ts
'2.5.1': {
  name: 'Gestos de Ponteiro',
  level: 'A',
  priority: 'P1',
  description: 'Funcionalidades ativadas por gestos multi-ponto...'
}

// 2. Implementar validação em src/validation/wcag-validator.ts
private async validateCriterion2_5_1(page: Page): Promise<CriterionResult> {
  // Implementar lógica de validação
  const result = await page.evaluate(() => {
    // Verificar gestos multi-ponto
    return /* lógica de validação */;
  });
  
  return {
    criterion: '2.5.1',
    passed: result.passed,
    description: result.description,
    elements: result.failingElements
  };
}

// 3. Adicionar testes em __tests__/
describe('WCAG 2.5.1 - Gestos de Ponteiro', () => {
  it('should pass when no multi-point gestures', async () => {
    // Test implementation
  });
});
```

## 🔄 Metodologia & Standards

### **Git Flow:**
- `development` - Branch principal de desenvolvimento
- `feature/*` - Novas funcionalidades
- `fix/*` - Bug fixes
- `docs/*` - Documentação

### **Commit Convention:**
```bash
feat: add new WCAG criterion validation
fix: resolve timeout issues in browser automation  
docs: update API reference
refactor: improve crawler performance
test: add integration tests for multi-page validation
```

### **Code Style:**
- **ESLint** + **Prettier** configurados
- **TypeScript strict mode**
- **Conventional naming** (camelCase, PascalCase, etc.)
- **Documentation** obrigatória para public APIs

## 📚 Recursos para Developers

### **Documentação Técnica:**
- [Setup & Installation](setup.md) - Environment setup
- [Architecture](architecture.md) - System design
- [API Reference](api-reference.md) - Classes e interfaces
- [Testing Guide](testing.md) - Testing strategies

### **External Resources:**
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Puppeteer API](https://pptr.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🆘 Support & Community

- 💬 **GitHub Discussions** - Perguntas e ideias
- 🐛 **GitHub Issues** - Bug reports e feature requests  
- 📧 **Email** - mauriciopereita@untile.pt
- 📖 **Code Reviews** - Aprender com PRs de outros developers

---

**🚀 Ready to contribute? Start with [Setup & Installation](setup.md)!**
