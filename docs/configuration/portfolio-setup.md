# Portfolio Configuration - Monitorizar Múltiplos Sites

> 📋 **Configurar e gerir portfolio de sites para monitorização automática**

## 🎯 O que é Portfolio Monitoring?

O Portfolio Monitoring permite:
- 🌐 **Monitorizar múltiplos sites** simultaneamente
- ⏰ **Auditorias agendadas** automáticas
- 📊 **Relatórios consolidados** de todos os sites
- 🚨 **Alertas centralizados** para violações
- 📈 **Tracking de tendências** ao longo do tempo

## 🚀 Quick Setup Portfolio

### **1. Configuração Básica (5 min)**
```bash
# 1. Editar arquivo de configuração
cp src/monitoring/portfolio-sites.example.json src/monitoring/portfolio-sites.json

# 2. Adicionar seus sites
nano src/monitoring/portfolio-sites.json

# 3. Configurar emails
ALERT_EMAIL=devops@company.com yarn audit:portfolio

# 4. Primeiro teste
yarn audit:portfolio console
```

### **2. Arquivo de Configuração**
```json
{
  "portfolio": {
    "name": "Company Portfolio",
    "description": "All company websites for accessibility monitoring",
    "owner": "devops@company.com"
  },
  "sites": [
    {
      "url": "https://www.company.com",
      "name": "Main Website",
      "priority": "critical",
      "auditType": "complete",
      "frequency": "daily",
      "contact": "webmaster@company.com",
      "tags": ["production", "public-facing"]
    },
    {
      "url": "https://app.company.com",
      "name": "Web Application",
      "priority": "high", 
      "auditType": "simple",
      "frequency": "hourly",
      "contact": "frontend-team@company.com",
      "tags": ["production", "app"]
    },
    {
      "url": "https://docs.company.com",
      "name": "Documentation",
      "priority": "medium",
      "auditType": "simple", 
      "frequency": "weekly",
      "contact": "docs-team@company.com",
      "tags": ["documentation"]
    }
  ],
  "globalSettings": {
    "defaultAuditType": "simple",
    "defaultFrequency": "daily",
    "timeout": 30000,
    "retryAttempts": 3,
    "enableScreenshots": true
  },
  "notifications": {
    "email": {
      "enabled": true,
      "alertEmail": "devops@company.com",
      "emergencyEmail": "oncall@company.com",
      "reportEmail": "management@company.com"
    },
    "slack": {
      "enabled": false,
      "webhookUrl": "https://hooks.slack.com/services/...",
      "channel": "#accessibility"
    }
  }
}
```

---

## 📊 Estrutura de Sites

### **Site Configuration:**
```json
{
  "url": "https://example.com",
  "name": "Human-readable site name",
  "priority": "critical|high|medium|low",
  "auditType": "simple|complete", 
  "frequency": "hourly|daily|weekly|monthly",
  "contact": "responsible-person@company.com",
  "tags": ["production", "ecommerce", "public"],
  "customSettings": {
    "timeout": 45000,
    "maxPages": 50,
    "includePatterns": ["/products/*", "/category/*"],
    "excludePatterns": ["/admin/*", "/test/*"]
  }
}
```

### **Priority Levels:**

#### **🔴 Critical**
- **SLA**: 2 horas para violações
- **Frequency**: Hourly/Daily checks
- **Alerting**: Imediato para P0 violations
- **Examples**: Homepage, checkout, login

#### **🟡 High**
- **SLA**: 8 horas para violações
- **Frequency**: Daily checks
- **Alerting**: Para P0 e P1 violations
- **Examples**: Product pages, main app

#### **🔵 Medium**
- **SLA**: 24 horas
- **Frequency**: Weekly checks  
- **Alerting**: Apenas P0 violations
- **Examples**: Documentation, blog

#### **🟢 Low**
- **SLA**: 1 semana
- **Frequency**: Monthly checks
- **Alerting**: Reportes apenas
- **Examples**: Archive pages, legacy content

### **Audit Types:**

#### **Simple (15 critérios críticos)**
- ⚡ **Speed**: 2-5 min por site
- 🎯 **Focus**: Violações que impedem uso
- 💰 **Cost**: Baixo resource usage
- ✅ **Use**: Regular monitoring, CI/CD

#### **Complete (50+ critérios)**
- 🔍 **Depth**: Análise abrangente
- ⏱️ **Speed**: 10-30 min por site
- 📊 **Detail**: Compliance completo
- ✅ **Use**: Auditorias oficiais, reports

---

## ⏰ Frequency & Scheduling

### **Scheduling Options:**
```json
{
  "frequency": "hourly",     // A cada hora
  "frequency": "daily",      // 1x por dia (9:00 AM)
  "frequency": "weekly",     // 1x por semana (Monday 9:00 AM)  
  "frequency": "monthly",    // 1x por mês (1st day, 9:00 AM)
  "frequency": "custom",     // Cron expression custom
  "cronExpression": "0 9 * * 1-5"  // Weekdays at 9 AM
}
```

### **Frequency Recommendations:**

| Site Type | Priority | Recommended Frequency |
|-----------|----------|---------------------|
| **E-commerce Homepage** | Critical | Hourly (business hours) |
| **Checkout Process** | Critical | Every 30 minutes |
| **Main Application** | High | Every 4 hours |
| **Product Pages** | High | Daily |
| **Blog/News** | Medium | Weekly |
| **Documentation** | Medium | Weekly |
| **Archive/Legacy** | Low | Monthly |

---

## 🚀 Running Portfolio Audits

### **Manual Commands:**
```bash
# Auditar todo o portfolio
yarn audit:portfolio

# Specific output format
yarn audit:portfolio html
yarn audit:portfolio json
yarn audit:portfolio markdown

# Dry run (não executa, só mostra o que faria)
yarn audit:portfolio --dry-run

# Auditar apenas sites críticos
yarn audit:portfolio --priority critical

# Auditar sites com tag específica
yarn audit:portfolio --tags production

# Forçar auditoria completa
yarn audit:portfolio --force-complete
```

### **Scheduled Monitoring:**
```bash
# Iniciar monitorização contínua
yarn monitor:start

# Parar monitorização
yarn monitor:stop

# Status da monitorização
yarn monitor:status

# Ver logs de monitorização
tail -f logs/portfolio-monitor.log
```

---

## 📊 Portfolio Reports

### **Console Report:**
```
📋 PORTFOLIO ACCESSIBILITY REPORT
==================================
🏢 Portfolio: Company Portfolio
📅 Generated: 09/08/2025, 15:30:45
📊 Sites monitored: 5

📈 OVERALL STATISTICS
=====================
Average score: 84% 🟡
Total violations: 47
Sites with issues: 3/5 (60%)
Compliance trend: ↗️ +2.3% (last 30 days)

📊 SITES SUMMARY
================
🔴 E-commerce (67%) - CRITICAL - 12 violations
   Last audit: 2 hours ago
   Trend: ↘️ -5% (declining)
   Contact: ecommerce@company.com

🟡 Web App (78%) - HIGH - 8 violations  
   Last audit: 4 hours ago
   Trend: → 0% (stable)
   Contact: frontend@company.com

🟢 Main Website (92%) - CRITICAL - 2 violations
   Last audit: 1 hour ago
   Trend: ↗️ +3% (improving)
   Contact: webmaster@company.com

🟢 Documentation (96%) - MEDIUM - 1 violation
   Last audit: 1 day ago
   Trend: ↗️ +1% (improving)
   Contact: docs@company.com

🟢 Blog (89%) - LOW - 3 violations
   Last audit: 1 week ago
   Trend: → 0% (stable)
   Contact: marketing@company.com

🚨 SITES REQUIRING IMMEDIATE ATTENTION
=======================================
1. E-commerce (Priority: CRITICAL, Score: 67%)
   - 3 critical violations affecting checkout
   - SLA: 2 hours (⚠️ 1.5 hours remaining)
   - Action: Immediate remediation required

🎯 RECOMMENDATIONS
==================
1. Focus on E-commerce critical violations
2. Schedule monthly review for Web App
3. Consider upgrading Blog audit frequency
```

### **HTML Report:**
```bash
# Gerar relatório HTML
yarn audit:portfolio html

# Output: reports/portfolio-report-YYYYMMDD-HHMMSS.html
# Inclui:
# - Dashboard visual
# - Trend charts
# - Detailed violation breakdown
# - Screenshots of issues
# - Compliance roadmap
```

### **JSON Report (API Integration):**
```json
{
  "portfolio": {
    "name": "Company Portfolio",
    "generatedAt": "2025-08-09T15:30:45.123Z",
    "totalSites": 5,
    "averageScore": 84.2,
    "totalViolations": 47,
    "sitesWithIssues": 3,
    "complianceTrend": 2.3
  },
  "sites": [
    {
      "url": "https://ecommerce.company.com",
      "name": "E-commerce",
      "priority": "critical",
      "score": 67,
      "violations": 12,
      "criticalViolations": 3,
      "lastAudit": "2025-08-09T13:30:45.123Z",
      "trend": -5,
      "status": "requires-attention",
      "slaRemaining": "1.5 hours",
      "contact": "ecommerce@company.com",
      "tags": ["production", "ecommerce"]
    }
  ],
  "alerts": [
    {
      "type": "sla-warning",
      "site": "https://ecommerce.company.com",
      "message": "SLA deadline approaching",
      "timeRemaining": "1.5 hours"
    }
  ]
}
```

---

## 🚨 Alerting & Notifications

### **Alert Types:**

#### **🔴 Critical Alerts (P0)**
```json
{
  "trigger": "Critical violations detected",
  "sla": "2 hours",
  "recipients": ["emergency-email"],
  "escalation": "After 1 hour, notify manager",
  "channels": ["email", "slack", "sms"]
}
```

#### **🟡 Warning Alerts (P1)**
```json
{
  "trigger": "Score drops below 70%",
  "sla": "8 hours", 
  "recipients": ["alert-email"],
  "escalation": "After 4 hours, notify team lead",
  "channels": ["email", "slack"]
}
```

#### **📊 Trend Alerts**
```json
{
  "trigger": "Score declining for 7 days",
  "recipients": ["report-email"],
  "frequency": "weekly",
  "channels": ["email"]
}
```

### **Email Notification Examples:**

#### **Critical Alert:**
```
Subject: [URGENT] Critical Accessibility Violations - E-commerce Site

🚨 CRITICAL PORTFOLIO ALERT

Site: E-commerce (https://shop.company.com)
Priority: CRITICAL
Score: 67% 🔴 (Critical)
SLA: 2 hours (⚠️ 1.5 hours remaining)

CRITICAL VIOLATIONS (3):
- [1.1.1] Product images missing alt text (8 elements)
- [2.1.1] Checkout form not keyboard accessible
- [1.4.3] "Buy Now" button insufficient contrast

IMPACT:
- Customers with disabilities cannot complete purchases
- Legal compliance risk
- Revenue impact estimated

REQUIRED ACTION:
Immediate remediation required within 1.5 hours.

Contact: ecommerce@company.com
View details: https://dashboard.company.com/sites/ecommerce
```

#### **Weekly Summary:**
```
Subject: [ACCESSIBILITY] Weekly Portfolio Summary

📊 PORTFOLIO WEEKLY SUMMARY
============================
Week: 02/08/2025 - 09/08/2025
Sites: 5 monitored

📈 IMPROVEMENTS:
- Main Website: 89% → 92% (+3%)
- Documentation: 95% → 96% (+1%)

📉 CONCERNS:
- E-commerce: 72% → 67% (-5%) ⚠️
- Web App: 78% → 78% (stable, but below target)

🎯 WEEKLY GOALS MET: 3/5 sites above 80%
🔄 TREND: Portfolio average stable at 84%

🎯 NEXT WEEK FOCUS:
1. E-commerce critical violations
2. Web App accessibility review
3. Quarterly compliance report prep

View dashboard: https://dashboard.company.com
```

---

## 🔧 Advanced Configuration

### **Custom Audit Rules:**
```json
{
  "customRules": {
    "company-brand-compliance": {
      "description": "Company-specific branding requirements",
      "criteria": [
        "Logo alt text must include company name",
        "Color contrast must be > 4.5:1",
        "Focus indicators must be blue (#0066cc)"
      ]
    }
  }
}
```

### **Integration Settings:**
```json
{
  "integrations": {
    "jira": {
      "enabled": true,
      "baseUrl": "https://company.atlassian.net",
      "project": "ACC",
      "autoCreateIssues": true,
      "criticalViolationsOnly": true
    },
    "slack": {
      "enabled": true,
      "webhookUrl": "https://hooks.slack.com/...",
      "channels": {
        "critical": "#accessibility-alerts",
        "reports": "#accessibility-reports"
      }
    },
    "datadog": {
      "enabled": true,
      "apiKey": "your-datadog-api-key",
      "tags": ["portfolio", "accessibility"]
    }
  }
}
```

### **Environment Overrides:**
```bash
# Override default settings via environment
PORTFOLIO_CONFIG=./config/production-portfolio.json
PORTFOLIO_DEFAULT_FREQUENCY=daily
PORTFOLIO_ALERT_EMAIL=alerts@company.com
PORTFOLIO_ENABLE_SCREENSHOTS=true
PORTFOLIO_MAX_CONCURRENT=3
```

---

## 📈 Monitoring & Analytics

### **Key Metrics Tracked:**
- 📊 **Score trends** over time
- 🚨 **Violation frequency** by type
- ⏱️ **SLA compliance** rates
- 📈 **Improvement velocity**
- 🎯 **Goal achievement** percentage

### **Dashboard Features:**
```
📊 PORTFOLIO DASHBOARD
======================
🎯 Compliance Overview
   - Overall score: 84% 🟡
   - Sites compliant: 3/5 (60%)
   - Trend: ↗️ Improving

📈 Trends (30 days)
   - Average improvement: +2.3%
   - Best performer: Documentation (+8%)
   - Needs attention: E-commerce (-12%)

🚨 Active Alerts
   - Critical: 1 (E-commerce)
   - Warnings: 2 (Web App, Blog)
   - SLA breaches: 0

📅 Upcoming Audits
   - E-commerce: In 30 minutes
   - Web App: In 2 hours
   - Documentation: Tomorrow 9 AM
```

---

## 🛠️ Troubleshooting

### **❌ Error: "No sites configured"**
```bash
# Verificar se arquivo existe
ls -la src/monitoring/portfolio-sites.json

# Criar se não existir
cp src/monitoring/portfolio-sites.example.json src/monitoring/portfolio-sites.json
```

### **❌ Error: "Site unreachable"**
```bash
# Verificar conectividade
curl -I https://problematic-site.com

# Testar com timeout maior
TIMEOUT=60000 yarn audit:portfolio
```

### **❌ Error: "Too many concurrent audits"**
```bash
# Reduzir concorrência
PORTFOLIO_MAX_CONCURRENT=2 yarn audit:portfolio

# Ou configurar no arquivo
"globalSettings": {
  "maxConcurrent": 2
}
```

---

## 📚 Best Practices

### **✅ Portfolio Organization:**
- 🏷️ **Tag sites** por tipo/team (production, staging, team-frontend)
- 📊 **Group por criticality** (critical sites more frequent monitoring)
- 📧 **Assign contacts** responsáveis por cada site
- 📅 **Balance frequencies** (não sobrecarregar sistema)

### **✅ Monitoring Strategy:**
- 🔍 **Start with simple audits** para baseline
- 📈 **Gradually increase** frequency baseado em needs
- 🎯 **Focus on critical sites** primeiro
- 📊 **Regular review** de portfolio configuration

### **✅ Alerting Configuration:**
- 🚨 **Configure SLAs** realistic e achievable
- 📧 **Route alerts** para pessoas certas
- 📊 **Weekly summaries** para stakeholders
- 🔄 **Regular review** de alert thresholds

---

## 📚 Next Steps

Depois do portfolio configurado:

- 📧 **[Email Setup](email-setup.md)** - Configurar notificações
- 🌐 **[Environment Variables](environment.md)** - Configurações avançadas
- 🔧 **[Quick Setup](quick-setup.md)** - Setup completo

---

**📋 Portfolio configurado = monitorização escalável de acessibilidade!**
