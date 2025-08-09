# Email & SMTP Setup - Configurar Notificações

> 📧 **Guia completo para configurar notificações por email**

## 🎯 Overview

O sistema de notificações permite:
- 🚨 **Alertas automáticos** para violações críticas
- 📊 **Relatórios agendados** do portfolio
- 🆘 **Notificações de emergência** (P0/P1/P2)
- 📈 **Resumos periódicos** de acessibilidade

## ⚡ Quick Setup (5 minutos)

### **Gmail (Recomendado)**
```bash
# 1. Adicionar ao .env
SEND_EMAILS=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 2. Configurar destinatários
ALERT_EMAIL=your-email@gmail.com
EMERGENCY_EMAIL=your-email@gmail.com

# 3. Testar
yarn emergency --test
```

**📱 Como gerar App Password no Gmail:**
1. Ir a [myaccount.google.com](https://myaccount.google.com)
2. Security → 2-Step Verification → App passwords
3. Gerar password para "Mail"
4. Usar esse password no `SMTP_PASS`

---

## 📧 Configuração por Provider

### **🟦 Gmail**
```bash
# Configuração Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=alerts@yourcompany.com
SMTP_PASS=abcd1234efgh5678  # App Password obrigatório!

# Emails de destino
ALERT_EMAIL=devops@yourcompany.com
EMERGENCY_EMAIL=oncall@yourcompany.com
AUTHORITY_EMAIL=compliance@yourcompany.com
```

**✅ Vantagens:**
- Fácil configuração
- Alta deliverability
- Interface familiar

**❌ Limitações:**
- Requer 2FA + App Password
- Rate limits (500 emails/dia)

---

### **🔵 Outlook/Office 365**
```bash
# Configuração Outlook
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=accessibility@company.com
SMTP_PASS=your-password

# Ou para Office 365 Business
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=alerts@company.onmicrosoft.com
SMTP_PASS=your-password
```

**✅ Vantagens:**
- Integração empresarial
- Não requer app passwords
- Boa deliverability

---

### **🟡 Yahoo Mail**
```bash
# Configuração Yahoo
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password  # App Password necessário
```

---

### **🟠 SendGrid (Profissional)**
```bash
# Configuração SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key
```

**✅ Vantagens:**
- Alta deliverability
- Analytics detalhados
- Rate limits altos

**💰 Custo:** Plano gratuito (100 emails/dia)

---

### **🟪 Mailgun (Empresarial)**
```bash
# Configuração Mailgun
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.yourcompany.com
SMTP_PASS=your-mailgun-password
```

**✅ Vantagens:**
- APIs poderosas
- Tracking avançado
- Boa para automação

---

### **🔒 Corporate SMTP**
```bash
# Servidor SMTP corporativo
SMTP_HOST=mail.company.com
SMTP_PORT=587  # ou 25, 465
SMTP_SECURE=false  # ou true para porta 465
SMTP_USER=accessibility-tool@company.com
SMTP_PASS=corporate-password

# Configurações avançadas
SMTP_TLS_REJECT_UNAUTHORIZED=false  # Para certificados self-signed
SMTP_AUTH_METHOD=PLAIN  # ou LOGIN, CRAM-MD5
```

---

## 🔧 Configuração Avançada

### **Múltiplos Destinatários:**
```bash
# Alertas gerais
ALERT_EMAIL=devops@company.com,qa@company.com

# Emergências (P0)
EMERGENCY_EMAIL=oncall@company.com,manager@company.com

# Autoridades/Compliance
AUTHORITY_EMAIL=compliance@company.com,legal@company.com
```

### **Templates de Email:**
```bash
# Personalizar assuntos
EMAIL_SUBJECT_PREFIX=[ACCESSIBILITY]
EMAIL_SUBJECT_EMERGENCY=[URGENT]

# Templates personalizados
EMAIL_TEMPLATE_PATH=./templates/custom-email.html
```

### **Configurações de Throttling:**
```bash
# Rate limiting
EMAIL_RATE_LIMIT=50  # emails por hora
EMAIL_BATCH_SIZE=10  # emails por lote

# Retry settings
EMAIL_RETRY_ATTEMPTS=3
EMAIL_RETRY_DELAY=5000  # ms
```

---

## 🚨 Tipos de Notificações

### **🔴 Alertas Críticos (P0)**
**Trigger:** Violações críticas detectadas
**SLA:** 2 horas
**Destinatários:** `EMERGENCY_EMAIL`

**Exemplo de email:**
```
Subject: [URGENT] Critical Accessibility Violations - example.com

🚨 CRITICAL ACCESSIBILITY ALERT

Site: https://example.com
Detected: 09/08/2025, 15:30:45
Score: 45% 🔴 (Critical)

CRITICAL VIOLATIONS (3):
- [1.1.1] 12 images without alt text
- [1.4.3] Poor color contrast (ratio: 2.1:1)
- [2.1.1] Dropdown menu not keyboard accessible

REQUIRED ACTION:
This site may be non-compliant with accessibility laws.
Immediate remediation required within 2 hours.

View full report: https://reports.company.com/audit_123456
```

### **🟡 Alertas Importantes (P1)**
**Trigger:** Score < 70% ou violações sérias
**SLA:** 8 horas
**Destinatários:** `ALERT_EMAIL`

### **📊 Relatórios Periódicos**
**Trigger:** Agendamento (diário/semanal)
**Conteúdo:** Resumo do portfolio
**Destinatários:** `ALERT_EMAIL`

**Exemplo:**
```
Subject: [ACCESSIBILITY] Weekly Portfolio Report

📊 WEEKLY ACCESSIBILITY REPORT
===============================
Period: 02/08/2025 - 09/08/2025

PORTFOLIO SUMMARY:
- Sites monitored: 5
- Average score: 87% 🟡
- Total violations: 23
- Critical issues: 2

SITES REQUIRING ATTENTION:
🔴 E-commerce (Score: 67%) - 8 critical violations
🟡 Mobile App (Score: 78%) - 3 serious violations

TRENDS:
📈 Main Website: +5% improvement
📈 Documentation: +2% improvement
📉 E-commerce: -3% decline

View detailed reports: https://dashboard.company.com
```

---

## 🧪 Testing & Validation

### **Teste Básico:**
```bash
# Testar configuração SMTP
yarn emergency --test

# Deve mostrar:
✅ SMTP connection successful
✅ Test email sent to: your-email@company.com
✅ Email system is working correctly
```

### **Teste com Email Real:**
```bash
# Enviar email de teste
yarn emergency --test --send-real-email

# Verificar na caixa de entrada:
Subject: [TEST] Accessibility Monitoring System Test
Content: This is a test email to verify SMTP configuration...
```

### **Validação de Configuração:**
```bash
# Verificar todas as configurações
yarn emergency --validate

# Output esperado:
✅ SMTP Host: smtp.gmail.com
✅ SMTP Port: 587
✅ SMTP User: alerts@company.com
✅ Alert Email: devops@company.com
✅ Emergency Email: oncall@company.com
⚠️  Authority Email: Not configured
```

---

## 🔧 Troubleshooting

### **❌ Error: "Authentication failed"**

**Sintomas:**
```bash
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Soluções:**
```bash
# Gmail: Usar app password (não password normal)
1. Ativar 2FA na conta Google
2. Gerar app password em Security settings
3. Usar app password no SMTP_PASS

# Outlook: Verificar se "Less secure apps" está ativado
# Corporate: Verificar credenciais com IT team
```

---

### **❌ Error: "Connection timeout"**

**Sintomas:**
```bash
Error: Connection timeout to smtp.gmail.com:587
```

**Soluções:**
```bash
# 1. Verificar conectividade
telnet smtp.gmail.com 587

# 2. Testar porta alternativa
SMTP_PORT=465
SMTP_SECURE=true

# 3. Verificar firewall/proxy
HTTP_PROXY=http://proxy:8080 yarn emergency --test

# 4. Usar DNS público
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
```

---

### **❌ Error: "SSL/TLS issues"**

**Sintomas:**
```bash
Error: unable to verify the first certificate
```

**Soluções:**
```bash
# Desenvolvimento apenas (não para produção!)
NODE_TLS_REJECT_UNAUTHORIZED=0 yarn emergency --test

# Ou adicionar ao .env
SMTP_TLS_REJECT_UNAUTHORIZED=false

# Produção: obter certificados corretos
SMTP_CA_FILE=/path/to/ca-certificates.pem
```

---

### **❌ Emails não chegam (deliverability)**

**Verificações:**
```bash
# 1. Verificar spam folder
# 2. Verificar rate limits
# 3. Verificar SPF/DKIM records (para domínios corporativos)
# 4. Usar email de teste temporário

# Testar com Mailtrap (desenvolvimento)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-pass
```

---

## 🛡️ Security Best Practices

### **✅ Recomendações:**

#### **Credenciais:**
```bash
# ✅ Usar app passwords quando possível
SMTP_PASS=app_password_here

# ✅ Não usar passwords principais
# ❌ SMTP_PASS=my_email_password

# ✅ Rotate credentials regularmente
# ✅ Use diferentes accounts para diferentes ambientes
```

#### **Configuração:**
```bash
# ✅ Configurar SPF record (domínios corporativos)
v=spf1 include:_spf.gmail.com ~all

# ✅ Usar TLS sempre que possível
SMTP_SECURE=true  # Para porta 465
# ou STARTTLS para porta 587

# ✅ Limitar rate de emails
EMAIL_RATE_LIMIT=50  # Por hora
```

#### **Monitorização:**
```bash
# ✅ Log email activities
LOG_EMAIL_ACTIVITIES=true

# ✅ Monitor bounce rates
MONITOR_EMAIL_BOUNCES=true

# ✅ Alert on SMTP failures
ALERT_ON_SMTP_FAILURE=true
```

---

## 📊 Monitoring & Analytics

### **Email Metrics:**
```bash
# Ver estatísticas de emails
yarn emergency --stats

# Output:
📧 EMAIL STATISTICS (Last 30 days)
===================================
Emails sent: 127
Success rate: 98.4%
Bounce rate: 1.6%
Average delivery time: 2.3s

BREAKDOWN BY TYPE:
🚨 Critical alerts: 12 (9.4%)
🟡 Regular alerts: 89 (70.1%)
📊 Reports: 26 (20.5%)
```

### **Integration com Analytics:**
```bash
# Enviar metrics para monitoring
ENABLE_EMAIL_METRICS=true
METRICS_ENDPOINT=https://analytics.company.com/api/email

# Webhook para email events
EMAIL_WEBHOOK_URL=https://hooks.company.com/email-events
```

---

## 🔄 Environment Examples

### **Development:**
```bash
# .env.development
SEND_EMAILS=false  # Não enviar emails em dev
LOG_EMAIL_CONTENT=true  # Log content em vez de enviar
EMAIL_MOCK_MODE=true  # Mock SMTP para testes
```

### **Staging:**
```bash
# .env.staging
SEND_EMAILS=true
SMTP_HOST=smtp.mailtrap.io  # Email de teste
SMTP_PORT=2525
ALERT_EMAIL=qa-team@company.com
EMAIL_SUBJECT_PREFIX=[STAGING]
```

### **Production:**
```bash
# .env.production
SEND_EMAILS=true
SMTP_HOST=smtp.company.com
SMTP_PORT=587
ALERT_EMAIL=devops@company.com
EMERGENCY_EMAIL=oncall@company.com,manager@company.com
AUTHORITY_EMAIL=compliance@company.com
EMAIL_RATE_LIMIT=100
```

---

## 📚 Next Steps

Depois do email configurado:

- ⚙️ **[Environment Variables](environment.md)** - Configurações avançadas
- 📋 **[Portfolio Setup](portfolio-setup.md)** - Monitorizar múltiplos sites
- 🔧 **[Quick Setup](quick-setup.md)** - Setup completo em 5 minutos

---

**📧 Notificações configuradas = monitorização proativa de acessibilidade!**
