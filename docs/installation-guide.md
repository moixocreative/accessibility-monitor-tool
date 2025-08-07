# Guia de Instalação - UNTILE Accessibility Monitoring System

## 📋 Pré-requisitos

### Requisitos do Sistema
- **Node.js:** >=18.0.0
- **Yarn:** >=1.22.0
- **Git:** >=2.30.0
- **RAM:** Mínimo 4GB (recomendado 8GB)
- **Espaço:** Mínimo 2GB livre

### Verificação de Pré-requisitos
```bash
node --version    # Deve ser >=18.0.0
yarn --version    # Deve ser >=1.22.0
git --version     # Deve ser >=2.30.0
```

## 🚀 Instalação Passo-a-Passo

### 1. Clone do Repositório
```bash
git clone https://github.com/moixocreative/accessibility-monitoring.git
cd accessibility-monitoring
```

### 2. Instalação de Dependências
```bash
yarn install
```

### 3. Configuração de Ambiente
```bash
cp env.example .env
```

Editar o arquivo `.env` com suas configurações:
```env
# Configurações Gerais
NODE_ENV=development
PORT=3000

# Monitorização
MONITORING_INTERVAL=3600000  # 1 hora
ALERT_EMAIL=seu-email@untile.pt

# WCAG Validation
WCAG_LEVEL=AA
PRIORITY_CRITERIA=15

# Emergency Contacts
EMERGENCY_EMAIL=seu-email@untile.pt
EMERGENCY_PHONE=+351-XXX-XXX-XXX
AUTHORITY_EMAIL=authority@example.pt

# SMTP Configuration (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@untile.pt
SMTP_PASS=sua-senha-smtp
SMTP_FROM=seu-email@untile.pt
SEND_EMAILS=false  # true para enviar emails reais

# Logging
LOG_LEVEL=info
```

### 4. Verificação da Instalação
```bash
yarn lint      # Verificar linting
yarn build     # Compilar TypeScript
yarn test      # Executar testes
```

## 🔧 Configuração Avançada

### Configuração do Portfolio
Editar `src/monitoring/portfolio-monitor.ts`:
```typescript
const PORTFOLIO_SITES = [
  'https://untile.pt',
  'https://cliente.untile.pt',
  'https://docs.untile.pt'
];
```

### Configuração de Critérios WCAG
Editar `src/core/wcag-criteria.ts` para personalizar critérios:
```typescript
export const PRIORITY_CRITERIA = [
  '1.1.1', '1.4.3', '1.4.4', '1.2.2', '1.3.1',
  '1.4.10', '2.1.1', '2.4.1', '2.4.2', '2.4.7',
  '2.2.1', '3.3.1', '3.3.2', '3.1.1', '4.1.2'
];
```

## 🧪 Testes

### Testes Básicos
```bash
yarn test                    # Testes unitários
yarn audit:wcag --test      # Teste de validação WCAG
yarn emergency --test        # Teste do sistema de emergência
yarn report --test          # Teste de geração de relatórios
```

### Testes de Integração
```bash
yarn audit:portfolio        # Auditoria completa do portfolio
yarn monitor               # Monitorização contínua (teste)
```

## 🔍 Troubleshooting

### Problemas Comuns

#### Erro: "Puppeteer failed to launch"
```bash
# Instalar dependências do sistema
sudo apt-get update
sudo apt-get install -y chromium-browser

# Ou no macOS
brew install chromium
```

#### Erro: "Lighthouse connection failed"
```bash
# Verificar se o browser está disponível
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

#### Erro: "SMTP authentication failed"
```bash
# Verificar configurações SMTP
# Para Gmail, ativar "App passwords"
# Definir SEND_EMAILS=false para testes
```

#### Erro: "TypeScript compilation failed"
```bash
# Limpar cache
rm -rf node_modules
yarn install
yarn build
```

### Logs e Debugging
```bash
# Ver logs em tempo real
tail -f logs/accessibility.log
tail -f logs/error.log

# Verificar configuração
yarn lint
yarn build
```

## 🔒 Segurança

### Variáveis de Ambiente
- Nunca commitar `.env` no repositório
- Usar secrets no GitHub Actions
- Rotacionar senhas regularmente

### Permissões de Arquivo
```bash
chmod 600 .env
chmod 755 logs/
```

### Firewall e Rede
- Configurar firewall para portas necessárias
- Usar HTTPS para todas as comunicações
- Validar certificados SSL

## 📊 Performance

### Otimizações Recomendadas
```bash
# Aumentar memória do Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

# Configurar cache do Puppeteer
export PUPPETEER_CACHE_DIR=~/.cache/puppeteer
```

### Monitorização de Recursos
```bash
# Verificar uso de memória
ps aux | grep node

# Verificar uso de CPU
top -p $(pgrep -f "node.*accessibility")
```

## 🚀 Deploy

### Ambiente de Desenvolvimento
```bash
yarn dev
```

### Ambiente de Produção
```bash
yarn build
yarn start
```

### Docker (opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install --production
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start"]
```

## ✅ Checklist de Instalação

- [ ] Node.js >=18.0.0 instalado
- [ ] Yarn >=1.22.0 instalado
- [ ] Git >=2.30.0 instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas
- [ ] Arquivo .env configurado
- [ ] Testes passando
- [ ] Build funcionando
- [ ] Logs configurados
- [ ] Portfolio configurado
- [ ] Notificações testadas

## 🆘 Suporte

Para problemas de instalação:
- **Email:** accessibility@untile.pt
- **Slack:** #accessibility-dev
- **Documentação:** [Guia de Desenvolvimento](./development-guide.md) 