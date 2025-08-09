# Quick Setup - 5 Minutos para Começar

> ⚡ **Setup mínimo para ter a ferramenta funcionando imediatamente**

## 🎯 Objetivo

Ter a ferramenta funcionando em **5 minutos** com configuração básica, sem emails ou configurações avançadas.

## 📋 Pré-requisitos

- ✅ Node.js 18+ (`node --version`)
- ✅ Yarn instalado (`yarn --version`)
- ✅ Acesso à internet

## ⚡ Setup em 3 Passos

### **Passo 1: Installation (2 min)**
```bash
# Clone
git clone https://github.com/moixocreative/accessibility-monitor-tool.git
cd accessibility-monitor-tool

# Install
yarn install
```

### **Passo 2: Basic Configuration (1 min)**
```bash
# Copy default config
cp .env.example .env

# ✅ Ready! As configurações padrão já funcionam
```

**📄 Configuração padrão (`.env`):**
```bash
# Modo desenvolvimento (emails desabilitados)
NODE_ENV=development
SEND_EMAILS=false
LOG_LEVEL=info

# Configurações básicas
MONITORING_INTERVAL=3600000  # 1 hora
WCAG_LEVEL=AA
PRIORITY_CRITERIA=15
```

### **Passo 3: Validate Configuration (30 sec)**
```bash
# Verificar se tudo está configurado
yarn emergency --validate

# ✅ Deve mostrar status das variáveis
```

### **Passo 4: First Test (2 min)**
```bash
# Teste básico
yarn audit:wcag https://www.example.com simple console

# ✅ Deve mostrar relatório de acessibilidade
```

## 🎉 Se Funcionou

Deve ver algo como:
```
🌐 RELATÓRIO DE ACESSIBILIDADE WCAG 2.1 AA
==========================================
📈 Score WCAG: 85% 🟢
📋 Total de Violações: 4
🔴 Críticas: 1
🟡 Sérias: 2
🔵 Menores: 1
```

**🎊 Parabéns! Ferramenta configurada com sucesso!**

## 🚀 Próximos Passos (Opcional)

### **Testar Diferentes Formatos**
```bash
# Relatório HTML (abre no browser)
yarn audit:wcag https://www.example.com simple html

# Dados em JSON (para integração)
yarn audit:wcag https://www.example.com simple json

# Análise completa (50+ critérios)
yarn audit:wcag https://www.example.com complete console
```

### **Testar Multi-página**
```bash
# Analisar site completo (até 5 páginas)
yarn audit:multi https://www.example.com comprehensive simple console 5
```

### **Configurar Emails (Opcional)**
Se quiser notificações por email:
```bash
# Editar .env
SEND_EMAILS=true
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com  
SMTP_PASS=your-app-password

# Testar
yarn emergency --test
```
→ Mais detalhes em [Email Setup](email-setup.md)

### **Adicionar Sites ao Portfolio (Opcional)**
Para monitorizar múltiplos sites:
```bash
# Editar src/monitoring/portfolio-monitor.ts
# Adicionar seus sites

# Executar
yarn audit:portfolio
```
→ Mais detalhes em [Portfolio Setup](portfolio-setup.md)

## 🔧 Troubleshooting Quick

### ❌ **Erro: "yarn command not found"**
```bash
# Instalar yarn
npm install -g yarn
```

### ❌ **Erro: "puppeteer chromium not downloaded"**
```bash
# Force download
yarn install --force
# ou
npx puppeteer browsers install chrome
```

### ❌ **Erro: "timeout" ou "connection failed"**
```bash
# Teste com timeout maior
TIMEOUT=60000 yarn audit:wcag https://example.com simple console
```

### ❌ **Erro: "Permission denied"**
```bash
# Fix permissions
chmod +x node_modules/.bin/*
# ou rodar com sudo se necessário
```

## 🎯 Configurações por Cenário

### **Desenvolvimento Local**
```bash
# .env padrão já está ideal
NODE_ENV=development
SEND_EMAILS=false
LOG_LEVEL=debug
```

### **Testing/QA Environment** 
```bash
# Test com emails simulados
NODE_ENV=test
SEND_EMAILS=false  # ou true com SMTP de teste
LOG_LEVEL=info
```

### **Production Ready**
```bash
# Configuração mínima para produção
NODE_ENV=production
SEND_EMAILS=true
SMTP_HOST=smtp.gmail.com
SMTP_USER=alerts@yourcompany.com
SMTP_PASS=your_app_password
LOG_LEVEL=warn
```

## 📚 Próximos Guias

Se setup funcionou, explore:

- 🌐 **[Environment Variables](environment.md)** - Todas as configurações disponíveis
- 📧 **[Email Setup](email-setup.md)** - Configurar notificações completas  
- 📋 **[Portfolio Setup](portfolio-setup.md)** - Monitorizar múltiplos sites
- 💻 **[Usage Guide](../usage/)** - Como usar todos os comandos

## 🆘 Ainda com Problemas?

1. ✅ **Verificar pré-requisitos** (Node.js 18+, Yarn)
2. 🔧 **Seguir troubleshooting** acima
3. 📖 **Consultar documentação** completa
4. 💬 **Abrir issue** no GitHub se problema persistir

---

**✨ Setup concluído! Agora pode começar a testar acessibilidade!**
