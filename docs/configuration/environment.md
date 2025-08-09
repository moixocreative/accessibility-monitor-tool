# Environment Variables - Configuração Completa

> 🌐 **Todas as variáveis de ambiente explicadas com exemplos práticos**

## 📋 Configuração por Ambiente

### **🏠 Development (Padrão)**
```bash
# .env para desenvolvimento local
NODE_ENV=development
SEND_EMAILS=false
LOG_LEVEL=debug

# Browser settings
HEADLESS=true
TIMEOUT=30000
BROWSER_TIMEOUT=45000

# Testing
CI=false
CAPTURE_SCREENSHOTS=true
```

### **🧪 Testing/CI**
```bash
# .env.test ou CI environment
NODE_ENV=test
SEND_EMAILS=false
LOG_LEVEL=warn

# CI optimizations
HEADLESS=true
CAPTURE_SCREENSHOTS=false
REUSE_BROWSER=false
TIMEOUT=60000

# CI flags
CI=true
GITHUB_ACTIONS=true
```

### **🚀 Production**
```bash
# .env.production
NODE_ENV=production
SEND_EMAILS=true
LOG_LEVEL=info

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alerts@company.com
SMTP_PASS=app_password_here

# Monitoring
MONITORING_INTERVAL=3600000  # 1 hora
ALERT_EMAIL=devops@company.com
```

## 🔧 Variáveis por Categoria

### **🌍 General Configuration**

#### **`NODE_ENV`**
- **Descrição**: Ambiente de execução
- **Valores**: `development`, `test`, `production`
- **Padrão**: `development`
- **Exemplo**: `NODE_ENV=production`

#### **`LOG_LEVEL`**
- **Descrição**: Nível de logging
- **Valores**: `error`, `warn`, `info`, `debug`
- **Padrão**: `info`
- **Exemplo**: `LOG_LEVEL=debug`

#### **`LOG_FORMAT`**
- **Descrição**: Formato dos logs
- **Valores**: `json`, `simple`, `combined`
- **Padrão**: `simple`
- **Exemplo**: `LOG_FORMAT=json`

#### **`LOG_FILE`**
- **Descrição**: Arquivo de log principal
- **Padrão**: `logs/accessibility.log`
- **Exemplo**: `LOG_FILE=/var/log/accessibility.log`

---

### **🌐 Browser & Automation**

#### **`HEADLESS`**
- **Descrição**: Executar browser em modo headless
- **Valores**: `true`, `false`, `new`
- **Padrão**: `true`
- **Exemplo**: `HEADLESS=new`

#### **`TIMEOUT`**
- **Descrição**: Timeout geral para operações (ms)
- **Padrão**: `30000` (30s)
- **Exemplo**: `TIMEOUT=60000`

#### **`BROWSER_TIMEOUT`**
- **Descrição**: Timeout específico para navegação (ms)
- **Padrão**: `60000` (60s)
- **Exemplo**: `BROWSER_TIMEOUT=120000`

#### **`DEBUG_MODE`**
- **Descrição**: Ativar modo debug detalhado
- **Valores**: `true`, `false`
- **Padrão**: `false`
- **Exemplo**: `DEBUG_MODE=true`

#### **`BROWSER_TIMEOUT`**
- **Descrição**: Timeout para launch do browser (ms)
- **Padrão**: `45000` (45s)
- **Exemplo**: `BROWSER_TIMEOUT=60000`

#### **`PAGE_TIMEOUT`**
- **Descrição**: Timeout para carregamento de página (ms)
- **Padrão**: `30000` (30s)
- **Exemplo**: `PAGE_TIMEOUT=45000`

#### **`NAVIGATION_TIMEOUT`**
- **Descrição**: Timeout para navegação (ms)
- **Padrão**: `15000` (15s)
- **Exemplo**: `NAVIGATION_TIMEOUT=20000`

#### **`WAIT_TIME`**
- **Descrição**: Tempo de espera após carregamento (ms)
- **Padrão**: `2000` (2s)
- **Exemplo**: `WAIT_TIME=5000`

#### **`PUPPETEER_EXECUTABLE_PATH`**
- **Descrição**: Caminho para executável do Chrome
- **Padrão**: (auto-detectado)
- **Exemplo**: `PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome`

#### **`REUSE_BROWSER`**
- **Descrição**: Reutilizar instância do browser
- **Valores**: `true`, `false`
- **Padrão**: `true`
- **Exemplo**: `REUSE_BROWSER=false`

#### **`CAPTURE_SCREENSHOTS`**
- **Descrição**: Capturar screenshots das violações
- **Valores**: `true`, `false`
- **Padrão**: `true`
- **Exemplo**: `CAPTURE_SCREENSHOTS=false`

---

### **📧 Email & SMTP Configuration**

#### **`SEND_EMAILS`**
- **Descrição**: Ativar envio de emails
- **Valores**: `true`, `false`
- **Padrão**: `false`
- **Exemplo**: `SEND_EMAILS=true`

#### **`SMTP_HOST`**
- **Descrição**: Servidor SMTP
- **Exemplo**: `SMTP_HOST=smtp.gmail.com`

#### **`SMTP_PORT`**
- **Descrição**: Porta SMTP
- **Valores**: `25`, `465` (SSL), `587` (TLS)
- **Padrão**: `587`
- **Exemplo**: `SMTP_PORT=587`

#### **`SMTP_SECURE`**
- **Descrição**: Usar conexão segura
- **Valores**: `true`, `false`
- **Padrão**: `false` (usa STARTTLS na porta 587)
- **Exemplo**: `SMTP_SECURE=true`

#### **`SMTP_USER`**
- **Descrição**: Username SMTP
- **Exemplo**: `SMTP_USER=alerts@company.com`

#### **`SMTP_PASS`**
- **Descrição**: Password SMTP (usar app passwords!)
- **Exemplo**: `SMTP_PASS=abcd1234efgh5678`

#### **`ALERT_EMAIL`**
- **Descrição**: Email para receber alertas
- **Exemplo**: `ALERT_EMAIL=devops@company.com`

#### **`EMERGENCY_EMAIL`**
- **Descrição**: Email para emergências (P0)
- **Exemplo**: `EMERGENCY_EMAIL=oncall@company.com`

#### **`AUTHORITY_EMAIL`**
- **Descrição**: Email para autoridades (compliance)
- **Exemplo**: `AUTHORITY_EMAIL=compliance@company.com`

---

### **📊 Monitoring & Auditing**

#### **`MONITORING_INTERVAL`**
- **Descrição**: Intervalo entre auditorias automáticas (ms)
- **Padrão**: `3600000` (1 hora)
- **Exemplo**: `MONITORING_INTERVAL=1800000` (30 min)

#### **`WCAG_LEVEL`**
- **Descrição**: Nível WCAG para validação
- **Valores**: `A`, `AA`, `AAA`
- **Padrão**: `AA`
- **Exemplo**: `WCAG_LEVEL=AAA`

#### **`PRIORITY_CRITERIA`**
- **Descrição**: Número de critérios prioritários
- **Padrão**: `15`
- **Exemplo**: `PRIORITY_CRITERIA=20`

#### **`MAX_PAGES`**
- **Descrição**: Máximo de páginas para multi-page audit
- **Padrão**: `20`
- **Exemplo**: `MAX_PAGES=50`

#### **`PORTFOLIO_CONFIG`**
- **Descrição**: Caminho para configuração do portfolio
- **Padrão**: `src/monitoring/portfolio-sites.json`
- **Exemplo**: `PORTFOLIO_CONFIG=./config/production-sites.json`

---

### **🔧 Advanced Configuration**

#### **`RATE_LIMIT`**
- **Descrição**: Requests por minuto (rate limiting)
- **Padrão**: `60`
- **Exemplo**: `RATE_LIMIT=120`

#### **`CONCURRENCY_LIMIT`**
- **Descrição**: Máximo de auditorias concorrentes
- **Padrão**: `3`
- **Exemplo**: `CONCURRENCY_LIMIT=5`

#### **`MEMORY_LIMIT`**
- **Descrição**: Limite de memória Node.js (MB)
- **Padrão**: `2048`
- **Exemplo**: `MEMORY_LIMIT=4096`

#### **`ENABLE_METRICS`**
- **Descrição**: Ativar métricas de performance
- **Valores**: `true`, `false`
- **Padrão**: `false`
- **Exemplo**: `ENABLE_METRICS=true`

#### **`METRICS_PORT`**
- **Descrição**: Porta para endpoint de métricas
- **Padrão**: `9090`
- **Exemplo**: `METRICS_PORT=3001`

---

### **🗄️ Database & Storage (Opcional)**

#### **`DATABASE_URL`**
- **Descrição**: URL de conexão com base de dados
- **Exemplo**: `DATABASE_URL=postgresql://user:pass@localhost:5432/accessibility`

#### **`REDIS_URL`**
- **Descrição**: URL de conexão com Redis (cache)
- **Exemplo**: `REDIS_URL=redis://localhost:6379`

#### **`STORAGE_TYPE`**
- **Descrição**: Tipo de storage para relatórios
- **Valores**: `local`, `s3`, `gcs`
- **Padrão**: `local`
- **Exemplo**: `STORAGE_TYPE=s3`

#### **`AWS_BUCKET`**
- **Descrição**: S3 bucket para storage
- **Exemplo**: `AWS_BUCKET=accessibility-reports`

---

### **🔐 Security & Authentication**

#### **`API_KEY`**
- **Descrição**: API key para autenticação
- **Exemplo**: `API_KEY=your-secret-api-key`

#### **`JWT_SECRET`**
- **Descrição**: Secret para JWT tokens
- **Exemplo**: `JWT_SECRET=your-jwt-secret`

#### **`WEBHOOK_SECRET`**
- **Descrição**: Secret para validar webhooks
- **Exemplo**: `WEBHOOK_SECRET=github-webhook-secret`

---

### **🔗 Integrations**

#### **`SLACK_WEBHOOK_URL`**
- **Descrição**: Webhook URL para notificações Slack
- **Exemplo**: `SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...`

#### **`DISCORD_WEBHOOK_URL`**
- **Descrição**: Webhook URL para notificações Discord
- **Exemplo**: `DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...`

#### **`TEAMS_WEBHOOK_URL`**
- **Descrição**: Webhook URL para Microsoft Teams
- **Exemplo**: `TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...`

#### **`JIRA_BASE_URL`**
- **Descrição**: Base URL da instância Jira
- **Exemplo**: `JIRA_BASE_URL=https://company.atlassian.net`

#### **`JIRA_USERNAME`**
- **Descrição**: Username para integração Jira
- **Exemplo**: `JIRA_USERNAME=automation@company.com`

#### **`JIRA_API_TOKEN`**
- **Descrição**: API token para Jira
- **Exemplo**: `JIRA_API_TOKEN=your-jira-api-token`

---

## 📊 Templates por Provider

### **Gmail SMTP**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # App Password, não a password normal!
```

### **Outlook/Hotmail SMTP**
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### **Yahoo SMTP**
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### **Custom Corporate SMTP**
```bash
SMTP_HOST=mail.company.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=alerts@company.com
SMTP_PASS=corporate-password
```

### **SendGrid**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### **Mailgun**
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@mg.company.com
SMTP_PASS=your-mailgun-password
```

## 🔧 Validation & Testing

### **Verificar Configuração:**
```bash
# Testar configuração completa
yarn emergency --validate

# Testar apenas SMTP
yarn emergency --test

# Debug environment variables
node -e "console.log(process.env)" | grep -E "(SMTP|NODE_ENV|LOG_LEVEL)"
```

### **Override Temporário:**
```bash
# Override para um comando específico
SMTP_HOST=smtp.mailtrap.io yarn emergency --test

# Múltiplas variáveis
LOG_LEVEL=debug TIMEOUT=60000 yarn audit:wcag https://example.com

# Usar arquivo de env diferente
cp .env.production .env.temp
NODE_ENV=production yarn audit:portfolio
```

---

## 🛡️ Security Best Practices

### **✅ Recomendações:**
- 🔐 **Nunca commit** `.env` files para git
- 🔑 **Usar app passwords** em vez de passwords principais
- 🔄 **Rotate credentials** regularmente
- 📝 **Document sensitive variables** na equipa
- 🔒 **Use secrets management** em produção (Vault, etc.)

### **❌ Evitar:**
- ❌ Passwords em plain text no código
- ❌ API keys em repositories públicos
- ❌ Same credentials entre ambientes
- ❌ Over-permissive API tokens

---

**🌐 Configuração completa = ferramenta robusta e segura!**
