# Guia de Desenvolvimento - UNTILE Accessibility Monitoring System

## 🏗️ Arquitetura do Sistema

### Estrutura de Pastas
```
src/
├── core/                    # Lógica principal
│   ├── wcag-criteria.ts    # Critérios WCAG
│   └── index.ts            # Exports principais
├── monitoring/              # Sistema de monitorização
│   ├── portfolio-monitor.ts # Monitorização de portfolio
│   └── index.ts
├── validation/              # Validação WCAG
│   ├── wcag-validator.ts   # Validador principal
│   └── index.ts
├── emergency/               # Sistema de emergência
│   ├── emergency-response.ts # Resposta a emergências
│   ├── notification-service.ts # Serviço de notificações
│   └── index.ts
├── reporting/               # Geração de relatórios
│   ├── report-generator.ts  # Gerador de relatórios
│   └── index.ts
├── api/                     # API REST
│   ├── routes/              # Rotas da API
│   ├── middleware/          # Middleware
│   └── index.ts
├── scripts/                 # Scripts executáveis
│   ├── wcag-validation.ts   # Script de validação
│   ├── emergency-response.ts # Script de emergência
│   ├── generate-report.ts   # Script de relatórios
│   └── monitoring.ts        # Script de monitorização
├── types/                   # Definições de tipos
│   └── index.ts
├── utils/                   # Utilitários
│   ├── logger.ts            # Sistema de logging
│   └── index.ts
└── index.ts                 # Entry point
```

### Tecnologias Utilizadas
- **Node.js:** Runtime principal
- **TypeScript:** Linguagem de desenvolvimento
- **Puppeteer:** Automação de navegador
- **axe-core:** Validação de acessibilidade
- **Lighthouse:** Auditoria de performance e acessibilidade
- **Express:** API REST
- **Winston:** Logging estruturado
- **Nodemailer:** Envio de emails
- **Jest:** Framework de testes

## 🚀 Setup de Desenvolvimento

### Pré-requisitos
```bash
# Instalar Node.js >=18.0.0
node --version

# Instalar Yarn >=1.22.0
yarn --version

# Instalar Git >=2.30.0
git --version
```

### Configuração Inicial
```bash
# Clone do repositório
git clone https://github.com/moixocreative/accessibility-monitoring.git
cd accessibility-monitoring

# Instalar dependências
yarn install

# Configurar ambiente
cp env.example .env
```

### Configuração do Ambiente de Desenvolvimento
```env
# .env para desenvolvimento
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Configurações de teste
SEND_EMAILS=false
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Configurações de desenvolvimento
MONITORING_INTERVAL=60000  # 1 minuto para testes
WCAG_LEVEL=AA
PRIORITY_CRITERIA=15
```

## 📝 Convenções de Código

### Estrutura de Arquivos
```typescript
// Nome do arquivo: kebab-case.ts
// Exemplo: wcag-validator.ts

// Classe: PascalCase
export class WCAGValidator {
  // Propriedades: camelCase
  private browser: Browser | null = null;
  
  // Métodos: camelCase
  public async validateSite(url: string): Promise<ValidationResult> {
    // Implementação
  }
  
  // Métodos privados: camelCase com underscore
  private async _initBrowser(): Promise<void> {
    // Implementação
  }
}
```

### Convenções de Naming
```typescript
// Interfaces: PascalCase com I prefix
interface IValidationResult {
  site: string;
  score: number;
  violations: IViolation[];
}

// Tipos: PascalCase
type SeverityLevel = 'P0' | 'P1' | 'P2';

// Constantes: UPPER_SNAKE_CASE
const WCAG_CRITERIA = ['1.1.1', '1.4.3', '2.1.1'];

// Enums: PascalCase
enum NotificationType {
  EMERGENCY = 'emergency',
  MAINTENANCE = 'maintenance',
  ALERT = 'alert'
}
```

### Logging
```typescript
import { logger } from '../utils/logger';

export class WCAGValidator {
  public async validateSite(url: string): Promise<ValidationResult> {
    logger.info(`Iniciando validação WCAG para: ${url}`);
    
    try {
      const result = await this._performValidation(url);
      logger.info(`Validação concluída com score: ${result.score}`);
      return result;
    } catch (error) {
      logger.error(`Erro na validação WCAG: ${error.message}`, error);
      throw error;
    }
  }
}
```

### Comentários
```typescript
/**
 * Valida um site contra critérios WCAG 2.1 AA
 * @param url - URL do site a validar
 * @param criteria - Lista de critérios a validar
 * @returns Promise<ValidationResult> - Resultado da validação
 */
public async validateSite(
  url: string, 
  criteria: string[] = WCAG_CRITERIA
): Promise<ValidationResult> {
  // Validação de entrada
  if (!url || !url.startsWith('http')) {
    throw new Error('URL inválida fornecida');
  }
  
  // Implementação da validação
  // ...
}
```

## 🔧 Desenvolvimento de Novas Funcionalidades

### Adicionando Novos Critérios WCAG

1. **Atualizar critérios em `src/core/wcag-criteria.ts`:**
```typescript
export const WCAG_CRITERIA = {
  '1.1.1': {
    name: 'Conteúdo Não-Textual',
    level: 'A',
    priority: 'P0',
    description: 'Todo o conteúdo não textual tem alternativa textual'
  },
  '1.4.3': {
    name: 'Contraste (Mínimo)',
    level: 'AA',
    priority: 'P0',
    description: 'Contraste de cor de pelo menos 4.5:1'
  },
  // Adicionar novo critério aqui
  '2.5.1': {
    name: 'Gestos de Ponteiro',
    level: 'A',
    priority: 'P1',
    description: 'Todas as funcionalidades podem ser usadas com um único ponteiro'
  }
};
```

2. **Implementar validação em `src/validation/wcag-validator.ts`:**
```typescript
private async validateCriterion2_5_1(page: Page): Promise<CriterionResult> {
  try {
    // Implementar lógica de validação específica
    const hasPointerGestures = await page.evaluate(() => {
      // Verificar se há gestos de ponteiro
      const touchElements = document.querySelectorAll('[ontouchstart]');
      return touchElements.length === 0;
    });
    
    return {
      criterion: '2.5.1',
      passed: hasPointerGestures,
      description: 'Gestos de ponteiro verificados',
      elements: hasPointerGestures ? [] : ['touch-elements']
    };
  } catch (error) {
    logger.error('Erro ao validar critério 2.5.1:', error);
    return {
      criterion: '2.5.1',
      passed: false,
      description: 'Erro na validação',
      error: error.message
    };
  }
}
```

### Adicionando Novos Sites ao Portfolio

1. **Atualizar `src/monitoring/portfolio-monitor.ts`:**
```typescript
export const PORTFOLIO_SITES = [
  {
    url: 'https://untile.pt',
    name: 'Website Principal',
    priority: 'high',
    frequency: 'hourly'
  },
  {
    url: 'https://novo-site.untile.pt',
    name: 'Novo Site',
    priority: 'medium',
    frequency: 'daily'
  }
];
```

### Criando Novos Scripts

1. **Criar arquivo em `src/scripts/`:**
```typescript
#!/usr/bin/env node

import { logger } from '../utils/logger';
import { WCAGValidator } from '../validation/wcag-validator';

async function main() {
  const validator = new WCAGValidator();
  
  try {
    logger.info('Iniciando novo script...');
    
    // Implementar lógica do script
    const result = await validator.validateSite('https://example.com');
    
    logger.info('Script concluído com sucesso');
    process.exit(0);
  } catch (error) {
    logger.error('Erro no script:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
```

2. **Adicionar script ao `package.json`:**
```json
{
  "scripts": {
    "novo-script": "ts-node src/scripts/novo-script.ts"
  }
}
```

## 🧪 Testes

### Testes Unitários

#### Estrutura de Testes
```typescript
// src/validation/__tests__/wcag-validator.test.ts
import { WCAGValidator } from '../wcag-validator';

describe('WCAGValidator', () => {
  let validator: WCAGValidator;
  
  beforeEach(() => {
    validator = new WCAGValidator();
  });
  
  afterEach(async () => {
    await validator.cleanup();
  });
  
  describe('validateSite', () => {
    it('should validate site successfully', async () => {
      const result = await validator.validateSite('https://example.com');
      
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
    
    it('should handle invalid URL', async () => {
      await expect(
        validator.validateSite('invalid-url')
      ).rejects.toThrow('URL inválida');
    });
  });
});
```

#### Executar Testes
```bash
# Executar todos os testes
yarn test

# Executar testes específicos
yarn test wcag-validator

# Executar testes com coverage
yarn test --coverage

# Executar testes em modo watch
yarn test --watch
```

### Testes de Integração

#### Teste de Sistema Completo
```typescript
// tests/integration/system.test.ts
import { PortfolioMonitor } from '../../src/monitoring/portfolio-monitor';
import { NotificationService } from '../../src/emergency/notification-service';

describe('System Integration', () => {
  it('should monitor portfolio and send notifications', async () => {
    const monitor = new PortfolioMonitor();
    const notifications = new NotificationService();
    
    const results = await monitor.auditPortfolio();
    expect(results).toHaveLength(3); // 3 sites no portfolio
    
    // Verificar se notificações foram enviadas
    const sentNotifications = await notifications.getSentNotifications();
    expect(sentNotifications).toBeDefined();
  });
});
```

### Testes de Performance

#### Teste de Performance
```typescript
// tests/performance/validator-performance.test.ts
import { WCAGValidator } from '../../src/validation/wcag-validator';

describe('WCAGValidator Performance', () => {
  it('should validate site within acceptable time', async () => {
    const validator = new WCAGValidator();
    const startTime = Date.now();
    
    await validator.validateSite('https://example.com');
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Deve completar em menos de 30 segundos
    expect(duration).toBeLessThan(30000);
  });
});
```

## 🐛 Debugging

### Logs de Debug

#### Configuração de Logs
```typescript
// src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/accessibility.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

#### Comandos de Debug
```bash
# Ver logs em tempo real
tail -f logs/accessibility.log

# Filtrar por nível de log
grep "ERROR" logs/error.log

# Ver logs de um período específico
grep "2024-01-15" logs/accessibility.log
```

### Debugging com Node.js Inspector

#### Iniciar com Debug
```bash
# Iniciar com debug
node --inspect src/scripts/wcag-validation.ts

# Ou com breakpoint
node --inspect-brk src/scripts/wcag-validation.ts
```

#### Debugging no VS Code
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug WCAG Validation",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/scripts/wcag-validation.ts",
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development",
        "LOG_LEVEL": "debug"
      }
    }
  ]
}
```

### Debugging de Puppeteer

#### Capturar Screenshots
```typescript
// Em caso de erro, capturar screenshot
try {
  await page.goto(url);
} catch (error) {
  await page.screenshot({ 
    path: `debug-screenshots/${Date.now()}.png`,
    fullPage: true 
  });
  throw error;
}
```

#### Debugging de Browser
```typescript
// Iniciar browser em modo não-headless para debug
const browser = await puppeteer.launch({
  headless: false,
  devtools: true,
  slowMo: 1000 // Desacelerar ações para debug
});
```

## 🚀 Build e Deploy

### Build de Produção

#### Build TypeScript
```bash
# Compilar TypeScript
yarn build

# Verificar build
yarn lint
yarn test
```

#### Build Otimizado
```bash
# Build com otimizações
NODE_ENV=production yarn build

# Verificar tamanho do build
du -sh dist/
```

### Deploy

#### Deploy Manual
```bash
# Build para produção
yarn build

# Copiar arquivos para servidor
scp -r dist/ user@server:/app/
scp package.json user@server:/app/
scp .env user@server:/app/

# Instalar dependências no servidor
ssh user@server "cd /app && yarn install --production"
```

#### Deploy com Docker
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN yarn install --production

COPY dist/ ./dist/
COPY .env ./

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

```bash
# Build da imagem
docker build -t accessibility-monitoring .

# Executar container
docker run -p 3000:3000 accessibility-monitoring
```

### CI/CD Pipeline

#### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: yarn install
      - run: yarn build
      - run: yarn test
      - name: Deploy to server
        run: |
          # Script de deploy
```

## 🔒 Segurança

### Boas Práticas

#### Validação de Entrada
```typescript
// Sempre validar URLs
function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith('http');
  } catch {
    return false;
  }
}

// Sanitizar dados
function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, '');
}
```

#### Gestão de Secrets
```typescript
// Nunca commitar secrets
const config = {
  smtp: {
    host: process.env.SMTP_HOST,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

// Validar se secrets estão definidos
if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
  throw new Error('SMTP configuration missing');
}
```

#### Rate Limiting
```typescript
// Implementar rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por windowMs
});

app.use(limiter);
```

## 📊 Performance

### Otimizações

#### Cache de Browser
```typescript
// Reutilizar instância do browser
class BrowserManager {
  private static instance: Browser | null = null;
  
  static async getBrowser(): Promise<Browser> {
    if (!this.instance) {
      this.instance = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.instance;
  }
}
```

#### Pool de Conexões
```typescript
// Pool de páginas para melhor performance
class PagePool {
  private pages: Page[] = [];
  private maxPages = 5;
  
  async getPage(): Promise<Page> {
    if (this.pages.length > 0) {
      return this.pages.pop()!;
    }
    
    const browser = await BrowserManager.getBrowser();
    return browser.newPage();
  }
  
  async releasePage(page: Page): Promise<void> {
    if (this.pages.length < this.maxPages) {
      await page.goto('about:blank');
      this.pages.push(page);
    } else {
      await page.close();
    }
  }
}
```

### Monitorização de Performance

#### Métricas de Performance
```typescript
// Medir tempo de execução
async function measurePerformance<T>(
  fn: () => Promise<T>,
  name: string
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    logger.info(`${name} completed in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(`${name} failed after ${duration}ms:`, error);
    throw error;
  }
}
```

## 🤝 Workflow de Contribuição

### Processo de Desenvolvimento

1. **Criar branch de feature:**
```bash
git checkout development
git pull origin development
git checkout -b feature/nova-funcionalidade
```

2. **Desenvolver funcionalidade:**
```bash
# Fazer alterações
# Adicionar testes
# Atualizar documentação
```

3. **Testes locais:**
```bash
yarn lint
yarn test
yarn build
```

4. **Commit e push:**
```bash
git add .
git commit -m "feat: add nova funcionalidade"
git push origin feature/nova-funcionalidade
```

5. **Criar Pull Request:**
- Título descritivo
- Descrição detalhada
- Referência a issues relacionadas
- Screenshots se aplicável

### Code Review

#### Checklist de Review
- [ ] Código segue convenções
- [ ] Testes incluídos
- [ ] Documentação atualizada
- [ ] Performance considerada
- [ ] Segurança verificada
- [ ] Logs apropriados

#### Comentários de Review
```typescript
// ❌ Evitar
const result = await validateSite(url);

// ✅ Preferir
const validationResult = await validateSite(url);
logger.info(`Validation completed for ${url}`);
```

## 🆘 Suporte

### Recursos de Ajuda
- **Documentação:** [Guia de Instalação](./installation-guide.md)
- **Issues:** GitHub Issues
- **Slack:** #accessibility-dev
- **Email:** accessibility@untile.pt

### Troubleshooting Comum

#### Problemas de Build
```bash
# Limpar cache
rm -rf node_modules
yarn install

# Verificar versões
node --version
yarn --version
```

#### Problemas de Testes
```bash
# Executar testes com debug
yarn test --verbose

# Verificar cobertura
yarn test --coverage
```

#### Problemas de Deploy
```bash
# Verificar logs
docker logs container-name

# Verificar variáveis de ambiente
docker exec container-name env
``` 