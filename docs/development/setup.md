# Setup & Installation - Environment Setup

> 🚀 **Configurar ambiente de desenvolvimento para contribuir**

## 📋 Pré-requisitos

### **Essenciais:**
- ✅ **Node.js 18+** (`node --version`)
- ✅ **Yarn** (`yarn --version`) 
- ✅ **Git** (`git --version`)
- ✅ **VS Code** (recomendado) ou outro editor

### **Para desenvolvimento:**
- ✅ **Chrome/Chromium** (para Puppeteer)
- ✅ **Docker** (opcional, para testes de integração)

## 🔧 Setup Completo

### **1. Clone e Dependencies (2 min)**
```bash
# Fork no GitHub primeiro!
git clone https://github.com/SEU_USERNAME/accessibility-monitor-tool.git
cd accessibility-monitor-tool

# Install dependencies
yarn install

# Verificar se tudo funcionou
yarn --version
node --version
```

### **2. Environment Configuration (1 min)**
```bash
# Copy environment file
cp env.example .env

# Configuração para desenvolvimento
# .env já vem com configurações adequadas para dev
```

**📄 Configuração de desenvolvimento (`.env`):**
```bash
# Development settings
NODE_ENV=development
SEND_EMAILS=false
LOG_LEVEL=debug

# Testing
CI=false
TIMEOUT=30000

# Database/Storage (se aplicável)
# DATABASE_URL=postgresql://localhost:5432/accessibility_dev
```

### **3. Build & Test (2 min)**
```bash
# Build inicial
yarn build

# Executar testes
yarn test

# Verificar linting
yarn lint

# ✅ Se todos passaram, ambiente está pronto!
```

## 🛠️ VS Code Setup

### **Extensions Recomendadas:**
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode", 
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.test-adapter-converter"
  ]
}
```

### **Settings.json:**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### **Configurar Debugging:**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Debug WCAG Audit",
      "type": "node", 
      "request": "launch",
      "program": "${workspaceFolder}/dist/scripts/wcag-validation.js",
      "args": ["https://example.com", "simple", "console"],
      "console": "integratedTerminal"
    }
  ]
}
```

## 🧪 Development Workflow

### **Daily Development:**
```bash
# 1. Pull latest changes
git checkout development
git pull origin development

# 2. Create feature branch
git checkout -b feature/my-awesome-feature

# 3. Start development
yarn dev  # Watch mode

# 4. Run tests in parallel terminal
yarn test --watch
```

### **Testing Strategy:**
```bash
# Unit tests
yarn test

# Integration tests
yarn test:integration

# E2E tests (se aplicável)
yarn test:e2e

# Coverage report
yarn test --coverage

# Specific test file
yarn test src/validation/wcag-validator.test.ts
```

### **Quality Checks:**
```bash
# Linting
yarn lint

# Fix auto-fixable issues
yarn lint --fix

# Type checking
yarn type-check

# Build verification
yarn build
```

## 📁 Project Structure para Developers

```
accessibility-monitor-tool/
├── src/
│   ├── core/              # WCAG criteria definitions
│   ├── validation/        # Main validation logic
│   ├── crawler/          # Page discovery
│   ├── reports/          # Report generation
│   ├── monitoring/       # Portfolio monitoring
│   ├── emergency/        # Emergency response
│   ├── api/              # REST API (se aplicável)
│   ├── utils/            # Shared utilities
│   └── scripts/          # CLI entry points
├── __tests__/            # Test files
├── docs/                 # Documentation
├── logs/                 # Log files (gitignored)
├── reports/              # Generated reports (gitignored)
└── dist/                 # Build output (gitignored)
```

## 🔧 Common Setup Issues

### ❌ **Error: "puppeteer: Chromium revision is not downloaded"**
```bash
# Force browser download
yarn install --force
# ou
npx puppeteer browsers install chrome
```

### ❌ **Error: "Cannot find module '@types/node'"**
```bash
# Install missing types
yarn add -D @types/node @types/jest
```

### ❌ **Error: "Permission denied" ao executar testes**
```bash
# Fix permissions
chmod +x node_modules/.bin/*
```

### ❌ **Error: "ENOSPC: System limit for number of file watchers reached"**
```bash
# Increase file watchers (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### ❌ **Tests failing with timeout errors**
```bash
# Increase timeout in jest.config.js
{
  "testTimeout": 30000
}

# Or set environment variable
TIMEOUT=60000 yarn test
```

## 🚀 Advanced Development Setup

### **Docker Development Environment:**
```bash
# Build dev container
docker build -f Dockerfile.dev -t accessibility-tool-dev .

# Run with volume mount
docker run -v $(pwd):/app -p 3000:3000 accessibility-tool-dev

# Development inside container
docker exec -it <container_id> bash
yarn dev
```

### **Database Setup (se aplicável):**
```bash
# PostgreSQL local
docker run --name accessibility-db \
  -e POSTGRES_PASSWORD=dev \
  -e POSTGRES_DB=accessibility_dev \
  -p 5432:5432 -d postgres:13

# Run migrations
yarn db:migrate

# Seed test data
yarn db:seed
```

### **Performance Profiling:**
```bash
# Profile specific script
node --prof dist/scripts/wcag-validation.js

# Analyze profile
node --prof-process isolate-*.log > profile.txt
```

## 📚 Next Steps

Agora que o ambiente está configurado:

1. 📖 **[Architecture Overview](architecture.md)** - Entender como funciona
2. 🤝 **[Contributing Guide](contributing.md)** - Workflow de contribuição
3. 🧪 **[Testing Guide](testing.md)** - Estratégias de teste
4. 📚 **[API Reference](api-reference.md)** - Classes e interfaces

## 🆘 Precisa de Ajuda?

- 🔧 **Setup issues**: Verificar troubleshooting acima
- 💬 **Questions**: GitHub Discussions  
- 🐛 **Bugs**: GitHub Issues
- 📧 **Direct contact**: mauriciopereita@untile.pt

---

**✨ Environment ready! Happy coding! 🎉**
