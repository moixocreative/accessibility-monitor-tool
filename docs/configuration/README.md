# Configuration Guide - Setup Step-by-Step

> ⚙️ **Guia completo para configurar a ferramenta em qualquer ambiente**

Este guia é para **DevOps**, **SysAdmins**, **Tech Leads** e qualquer pessoa responsável por **configurar** e **deploy** da ferramenta.

## 📋 O que você vai encontrar aqui

### 🚀 [**Quick Setup (5 min)**](quick-setup.md)
- Setup mínimo para começar
- Configuração básica
- Primeiro teste

### 🌐 [**Environment Variables**](environment.md)
- Todas as variáveis explicadas
- Valores padrão e exemplos
- Configuração por ambiente

### 📧 [**Email & SMTP Setup**](email-setup.md)
- Configurar notificações
- Providers populares (Gmail, Outlook, etc.)
- Troubleshooting de email

### 📋 [**Portfolio Configuration**](portfolio-setup.md)
- Adicionar múltiplos sites
- Configuração avançada
- Templates e exemplos

## 🎯 Cenários de Configuração

### 🧪 **Development/Testing**
```bash
# Configuração mínima
SEND_EMAILS=false
LOG_LEVEL=debug
NODE_ENV=development
```
→ [Quick Setup](quick-setup.md)

### 🚀 **Production**
```bash
# Configuração completa
SEND_EMAILS=true
SMTP_HOST=smtp.gmail.com
SMTP_USER=alerts@company.com
SMTP_PASS=app_password_here
```
→ [Email Setup](email-setup.md)

### 📊 **CI/CD Integration**
```bash
# Configuração automática
NODE_ENV=test
CI=true
GITHUB_ACTIONS=true
```
→ [Environment Variables](environment.md)

### 🏢 **Enterprise Portfolio**
```bash
# Múltiplos sites
PORTFOLIO_CONFIG=./config/sites.json
MONITORING_INTERVAL=3600000
ALERT_EMAIL=devops@company.com
```
→ [Portfolio Setup](portfolio-setup.md)

## ⚡ Quick Start por Ambiente

### 🏠 **Local Development**
```bash
# 1. Clone e install
git clone <repo>
cd accessibility-monitor-tool
yarn install

# 2. Basic config
cp .env.example .env
# SEND_EMAILS=false (já configurado)

# 3. Validate config
yarn emergency --validate

# 4. Test
yarn audit:wcag https://www.example.com simple console

### 🐳 **Docker**
```bash
# 1. Build
docker build -t accessibility-tool .

# 2. Run with env file
docker run --env-file .env accessibility-tool

# 3. Test
docker exec -it <container> yarn audit:wcag https://example.com simple console
```

### ☁️ **Cloud Deployment**
```bash
# 1. Set environment variables
export SEND_EMAILS=true
export SMTP_HOST=smtp.gmail.com
export SMTP_USER=alerts@company.com

# 2. Deploy
npm run build
pm2 start dist/index.js

# 3. Verify
yarn emergency --validate
```

## 🔧 Configuration Files

### **Primary Config: `.env`**
```bash
# Essential settings
NODE_ENV=production
LOG_LEVEL=info
SEND_EMAILS=true

# SMTP Configuration  
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring
MONITORING_INTERVAL=3600000
ALERT_EMAIL=alerts@company.com
```

### **Portfolio Config: `portfolio-sites.json`** (opcional)
```json
{
  "sites": [
    {
      "url": "https://www.company.com",
      "name": "Main Website", 
      "priority": "high",
      "frequency": "hourly"
    },
    {
      "url": "https://app.company.com",
      "name": "Web App",
      "priority": "critical", 
      "frequency": "every-30-min"
    }
  ]
}
```

### **WCAG Custom Criteria: `wcag-custom.json`** (opcional)
```json
{
  "customCriteria": {
    "2.5.1": {
      "name": "Pointer Gestures",
      "priority": "P1",
      "enabled": true
    }
  }
}
```

## 📊 Configuration Templates

### **Template: Startup/SME**
```bash
# Configuração simples para pequenas empresas
NODE_ENV=production
SEND_EMAILS=true
SMTP_HOST=smtp.gmail.com
SMTP_USER=webmaster@startup.com
SMTP_PASS=generated_app_password
ALERT_EMAIL=webmaster@startup.com
MONITORING_INTERVAL=7200000  # 2 horas
LOG_LEVEL=info
```

### **Template: Enterprise**
```bash
# Configuração enterprise com múltiplos ambientes  
NODE_ENV=production
SEND_EMAILS=true
SMTP_HOST=smtp.office365.com
SMTP_USER=accessibility-alerts@enterprise.com
SMTP_PASS=complex_secure_password
ALERT_EMAIL=accessibility-team@enterprise.com
EMERGENCY_EMAIL=devops-oncall@enterprise.com
AUTHORITY_EMAIL=compliance@enterprise.com
MONITORING_INTERVAL=1800000  # 30 minutos
LOG_LEVEL=warn
WCAG_LEVEL=AAA  # Standard mais rigoroso
```

### **Template: Agency/Consultancy**
```bash
# Configuração para agências que gerem múltiplos clientes
NODE_ENV=production
SEND_EMAILS=true
SMTP_HOST=smtp.mailgun.org
SMTP_USER=accessibility@agency.com
SMTP_PASS=mailgun_api_key
ALERT_EMAIL=qa-team@agency.com
MONITORING_INTERVAL=3600000  # 1 hora
PORTFOLIO_CONFIG=./configs/client-sites.json
LOG_LEVEL=info
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

## 🔐 Security Best Practices

### **Environment Variables**
- ✅ **Never commit** `.env` files
- ✅ **Use app passwords** não passwords principais
- ✅ **Rotate credentials** regularly
- ✅ **Separate configs** por ambiente

### **SMTP Security**
```bash
# ✅ App passwords (mais seguro)
SMTP_PASS=app_specific_password

# ❌ Evitar passwords principais
SMTP_PASS=my_email_password
```

### **Access Control**
```bash
# Restringir logs sensitive
LOG_LEVEL=warn  # Evita logs debug em produção

# Timeouts seguros
TIMEOUT=30000  # Evita requests infinitos

# Rate limiting
RATE_LIMIT=100  # Requests por minuto
```

## 📊 Monitoring & Alerting

### **Health Checks**
```bash
# Verificar se tudo está funcionando
yarn emergency --validate

# Test SMTP connectivity
yarn emergency --test

# Portfolio validation
yarn audit:portfolio --dry-run
```

### **Log Management**
```bash
# Log rotation (recomendado)
LOG_MAX_SIZE=10MB
LOG_MAX_FILES=5

# Centralized logging
LOG_OUTPUT=file,console,syslog
```

### **Performance Monitoring**
```bash
# Métricas de performance
ENABLE_METRICS=true
METRICS_PORT=9090

# Timeout configurations
BROWSER_TIMEOUT=30000
PAGE_TIMEOUT=15000
NAVIGATION_TIMEOUT=10000
```

## 🔄 Environment Management

### **Development → Staging → Production**

```bash
# Development
NODE_ENV=development
SEND_EMAILS=false
LOG_LEVEL=debug

# Staging
NODE_ENV=staging  
SEND_EMAILS=true
SMTP_HOST=smtp.mailtrap.io  # Test SMTP
LOG_LEVEL=info

# Production
NODE_ENV=production
SEND_EMAILS=true
SMTP_HOST=smtp.gmail.com  # Real SMTP
LOG_LEVEL=warn
```

## 🆘 Troubleshooting

### **Common Issues:**
- 📧 **Emails não enviam** → [Email Setup](email-setup.md)
- ⚙️ **Variables não carregam** → [Environment Variables](environment.md)
- 📊 **Portfolio não funciona** → [Portfolio Setup](portfolio-setup.md)
- 🚀 **Performance issues** → Ajustar timeouts e intervals

### **Support:**
- 📖 **Documentation**: Guides específicos acima
- 🐛 **Issues**: GitHub Issues para bugs
- 💬 **Discussions**: GitHub Discussions para dúvidas
- 📧 **Email**: mauriciopereita@untile.pt

---

**⚡ Ready to configure? Start with [Quick Setup](quick-setup.md)!**
