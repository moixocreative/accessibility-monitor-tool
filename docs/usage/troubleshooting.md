# Troubleshooting - Resolver Problemas Comuns

> 🔧 **Soluções práticas para os problemas mais frequentes**

## 🚨 Problemas de Instalação

### ❌ **Error: "yarn command not found"**

**Sintomas:**
```bash
yarn audit:wcag https://example.com
# zsh: command not found: yarn
```

**Soluções:**
```bash
# Opção 1: Instalar yarn globalmente
npm install -g yarn

# Opção 2: Usar npx (sem instalar)
npx yarn audit:wcag https://example.com

# Opção 3: Usar npm diretamente
npm run audit:wcag https://example.com
```

**Verificar se funcionou:**
```bash
yarn --version
# Deve mostrar: 1.22.19 (ou similar)
```

---

### ❌ **Error: "puppeteer: Chromium revision is not downloaded"**

**Sintomas:**
```bash
Error: Could not find Chromium revision 1097271
```

**Soluções:**
```bash
# Opção 1: Reinstalar dependências
yarn install --force

# Opção 2: Download manual do browser
npx puppeteer browsers install chrome

# Opção 3: Usar Chrome do sistema
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

**Para macOS:**
```bash
# Instalar Chrome se não tiver
brew install --cask google-chrome

# Configurar path
export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

**Para Ubuntu/Debian:**
```bash
# Instalar dependências do Chrome
sudo apt-get update
sudo apt-get install -y libxss1 libgconf-2-4 libxtst6 libxrandr2 libasound2 libpangocairo-1.0-0 libatk1.0-0 libcairo-gobject2 libgtk-3-0 libgdk-pixbuf2.0-0 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libnss3 libcups2 libxrandr2 libasound2
```

---

### ❌ **Error: "Permission denied"**

**Sintomas:**
```bash
Error: EACCES: permission denied, open 'logs/audit.log'
```

**Soluções:**
```bash
# Opção 1: Fix permissions das pastas
chmod 755 logs/
chmod 644 logs/*.log

# Opção 2: Executar com sudo (não recomendado)
sudo yarn audit:wcag https://example.com

# Opção 3: Mudar owner das pastas
sudo chown -R $USER:$USER logs/ reports/
```

---

## 🌐 Problemas de Conectividade

### ❌ **Error: "ERR_NAME_NOT_RESOLVED" (DNS não resolve)**

**Sintomas:**
```bash
21:55:34 [warn]: Tentativa 1 falhou: page.goto: net::ERR_NAME_NOT_RESOLVED at https://example.com/
```

**Soluções:**
```bash
# ✅ JÁ RESOLVIDO: URLs do portfolio foram corrigidos
# Se ainda tiver problemas, verifique:
yarn emergency --validate
# Deve mostrar configuração correta
```

### ❌ **Error: "timeout" ou "Navigation timeout"**

**Sintomas:**
```bash
Error: Navigation timeout of 30000 ms exceeded
```

**Soluções:**
```bash
# Opção 1: Aumentar timeout
TIMEOUT=60000 yarn audit:wcag https://example.com

# Opção 2: Usar timeout no comando
yarn audit:wcag https://example.com simple console --timeout 60000

# Opção 3: Testar conectividade
curl -I https://example.com
ping example.com
```

**Configurar timeout permanentemente:**
```bash
# Adicionar ao .env
TIMEOUT=60000
BROWSER_TIMEOUT=45000
PAGE_TIMEOUT=30000
```

---

### ❌ **Error: "net::ERR_INTERNET_DISCONNECTED"**

**Sintomas:**
```bash
Error: net::ERR_INTERNET_DISCONNECTED
```

**Soluções:**
```bash
# 1. Verificar conectividade
ping google.com

# 2. Testar DNS
nslookup example.com

# 3. Verificar proxy/firewall
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# 4. Usar URL alternativo para teste
yarn audit:wcag https://google.com simple console
```

---

### ❌ **Error: "SSL certificate problem"**

**Sintomas:**
```bash
Error: SSL certificate problem: unable to get local issuer certificate
```

**Soluções:**
```bash
# Opção 1: Ignorar SSL (só para testes!)
NODE_TLS_REJECT_UNAUTHORIZED=0 yarn audit:wcag https://example.com

# Opção 2: Configurar certificados corporativos
export NODE_EXTRA_CA_CERTS=/path/to/corporate-certs.pem

# Opção 3: Usar HTTP se possível
yarn audit:wcag http://example.com simple console
```

---

## 📊 Problemas de Relatórios

### ❌ **Error: "No violations found but score is low"**

**Sintomas:**
```bash
📊 RESUMO EXECUTIVO
===================
📈 Score WCAG: 45% 🔴
📋 Total de Violações: 0
```

**Causas possíveis:**
1. **JavaScript não carregou**: Página não renderizou completamente
2. **Conteúdo dinâmico**: AJAX content não foi detectado
3. **SPA/React**: Single Page App precisa tempo extra

**Soluções:**
```bash
# Opção 1: Aumentar wait time
WAIT_TIME=5000 yarn audit:wcag https://example.com

# Opção 2: Aguardar selector específico
yarn audit:wcag https://example.com simple console --wait-for-selector "#main-content"

# Opção 3: Desativar JavaScript (testar HTML puro)
yarn audit:wcag https://example.com simple console --disable-javascript
```

---

### ❌ **Error: "Report generation failed"**

**Sintomas:**
```bash
Error: Failed to generate HTML report
```

**Soluções:**
```bash
# Opção 1: Verificar espaço em disco
df -h

# Opção 2: Limpar reports antigos
rm -rf reports/*

# Opção 3: Usar formato alternativo
yarn audit:wcag https://example.com simple json
yarn audit:wcag https://example.com simple markdown

# Opção 4: Verificar permissions
chmod 755 reports/
```

---

### ❌ **Error: "Screenshot capture failed"**

**Sintomas:**
```bash
Warning: Could not capture screenshot for violation
```

**Soluções:**
```bash
# Opção 1: Desativar screenshots
CAPTURE_SCREENSHOTS=false yarn audit:wcag https://example.com

# Opção 2: Verificar display (Linux)
export DISPLAY=:99
Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &

# Opção 3: Usar headless mode específico
HEADLESS=new yarn audit:wcag https://example.com
```

---

## 🕷️ Problemas de Multi-página

### ❌ **Error: "No pages discovered"**

**Sintomas:**
```bash
🕷️ PÁGINAS DESCOBERTAS: 0
❌ ERRO: Nenhuma página encontrada para auditar
```

**Soluções:**
```bash
# Opção 1: Verificar se sitemap existe
curl https://example.com/sitemap.xml

# Opção 2: Usar estratégia diferente
yarn audit:multi https://example.com auto simple console 5
yarn audit:multi https://example.com manual simple console 5

# Opção 3: Testar discovery manualmente
yarn audit:multi https://example.com comprehensive simple console 20 --verbose

# Opção 4: Verificar robots.txt
curl https://example.com/robots.txt
```

---

### ❌ **Error: "Too many pages found"**

**Sintomas:**
```bash
⚠️ AVISO: 1847 páginas descobertas, limitando a 20
```

**Soluções:**
```bash
# Opção 1: Aumentar limite
yarn audit:multi https://example.com comprehensive simple console 50

# Opção 2: Usar estratégia mais específica
yarn audit:multi https://example.com sitemap simple console 20

# Opção 3: Filtrar por pattern
yarn audit:multi https://example.com comprehensive simple console 20 --include-pattern="/products/*"

# Opção 4: Usar sample mode
yarn audit:multi https://example.com comprehensive simple console 20 --sample-mode
```

---

## 📧 Problemas de Email/SMTP

### ❌ **Error: "SMTP authentication failed"**

**Sintomas:**
```bash
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Soluções:**
```bash
# 1. Verificar credenciais no .env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # NÃO a password normal!

# 2. Gerar app password (Gmail)
# Google Account → Security → 2-Step Verification → App passwords

# 3. Testar configuração
yarn emergency --validate

# 4. Verificar SMTP settings por provider
# Gmail: smtp.gmail.com:587
# Outlook: smtp-mail.outlook.com:587
# Yahoo: smtp.mail.yahoo.com:587
```

---

### ❌ **Error: "Connection timeout to SMTP server"**

**Sintomas:**
```bash
Error: Connection timeout
```

**Soluções:**
```bash
# 1. Verificar firewall/proxy
telnet smtp.gmail.com 587

# 2. Usar porta alternativa
SMTP_PORT=465  # SSL
SMTP_PORT=25   # Se 587 estiver bloqueada

# 3. Configurar proxy se necessário
HTTP_PROXY=http://proxy:8080 yarn emergency --test

# 4. Usar SMTP de teste (desenvolvimento)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
```

---

## 🔧 Problemas de Performance

### ❌ **Error: "Memory limit exceeded"**

**Sintomas:**
```bash
Error: FATAL ERROR: Ineffective mark-compacts near heap limit
```

**Soluções:**
```bash
# Opção 1: Aumentar memory limit
node --max-old-space-size=4096 node_modules/.bin/yarn audit:wcag https://example.com

# Opção 2: Processar em batches menores
yarn audit:multi https://example.com comprehensive simple console 5  # Em vez de 20

# Opção 3: Usar modo simples
yarn audit:wcag https://example.com simple console  # Em vez de complete

# Opção 4: Fechar browsers entre audits
REUSE_BROWSER=false yarn audit:multi https://example.com
```

---

### ❌ **Error: "Process hanging/não termina"**

**Sintomas:**
```bash
# Comando não termina, fica "pendurado"
yarn audit:wcag https://example.com
# (sem output, processo não termina)
```

**Soluções:**
```bash
# 1. Usar timeout
timeout 300s yarn audit:wcag https://example.com  # 5 minutos

# 2. Debug mode para ver onde trava
DEBUG=* yarn audit:wcag https://example.com

# 3. Verificar processos Chromium órfãos
ps aux | grep -i chromium
killall chromium-browser

# 4. Usar modo headless específico
HEADLESS=new yarn audit:wcag https://example.com
```

---

## ✅ Melhorias Recentes (Problemas Resolvidos)

### **🔧 Sistema Mais Robusto**

**Problemas que foram resolvidos:**

#### **1. Navegação de Páginas**
```bash
# ❌ Antes: Uma tentativa, falha se timeout
# ✅ Agora: Múltiplas tentativas com fallbacks
- domcontentloaded → networkidle0 → load
- Timeouts configuráveis
- Tratamento de erros de rede
```

#### **2. Axe-core Execution**
```bash
# ❌ Antes: Falha se CDN não carrega
# ✅ Agora: Fallbacks automáticos
- CDN principal → CDN alternativo
- Verificação robusta de carregamento
- Múltiplas tentativas de execução
```

#### **3. URLs do Portfolio**
```bash
# ❌ Antes: URLs inválidos causavam erros DNS
# ✅ Agora: URLs corrigidos e validados
- welligence.pt → solutions.welligence.com
- demo-ecommerce.untile.pt → removido
- Validação automática de configuração
```

#### **4. Configuração de Ambiente**
```bash
# ❌ Antes: Configuração manual complexa
# ✅ Agora: Template e validação automática
- .env.example com instruções completas
- yarn emergency --validate
- Prioridade automática: GitHub Secrets → .env → defaults
```

### **🎯 Resultado:**
- ✅ **Zero erros de DNS** no portfolio
- ✅ **Execução mais estável** do axe-core
- ✅ **Configuração mais simples** para novos usuários
- ✅ **Melhor tratamento de erros** e timeouts

---

## 🆘 Como Pedir Ajuda

### **1. Gather Information**
```bash
# Versões
node --version
yarn --version
npm --version

# Sistema operativo
uname -a  # Linux/macOS
systeminfo  # Windows

# Logs relevantes
tail -n 50 logs/error.log
tail -n 50 logs/audit.log
```

### **2. Teste Básico**
```bash
# Verificar se funciona com site simples
yarn audit:wcag https://example.com simple console

# Verificar dependencies
yarn install --check-files
```

### **3. Create Issue**
Quando criar issue no GitHub, incluir:

- ✅ **Versão**: Node.js, yarn, SO
- ✅ **Comando exato** que falhou
- ✅ **Error message completa**
- ✅ **Logs relevantes**
- ✅ **Passos para reproduzir**

### **4. Troubleshooting Checklist**
```bash
□ Verificar pré-requisitos (Node.js 18+)
□ Reinstalar dependencies (yarn install --force)
□ Verificar permissions (logs/, reports/)
□ Testar conectividade (ping, curl)
□ Verificar .env configuration
□ Testar com site simples (example.com)
□ Verificar logs de erro
□ Tentar com diferentes comandos/parâmetros
```

---

## 📚 Recursos de Suporte

- 📖 **Documentation**: [README.md](../../README.md)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/moixocreative/accessibility-monitor-tool/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/moixocreative/accessibility-monitor-tool/discussions)
- 📧 **Direct Contact**: mauriciopereita@untile.pt

---

**🔧 A maioria dos problemas tem solução simples! Não hesites em pedir ajuda!**
