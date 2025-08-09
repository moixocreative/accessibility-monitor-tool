# Getting Started - Primeiro Uso em 5 Minutos

> 🚀 **Tutorial passo-a-passo para o seu primeiro teste de acessibilidade**

## 📋 Pré-requisitos

Antes de começar, certifique-se que tem:
- ✅ **Node.js** 18+ instalado (`node --version`)
- ✅ **Yarn** ou npm instalado (`yarn --version`) 
- ✅ **Acesso à internet** (para baixar dependências)

## 🏁 Passo 1: Instalação (2 minutos)

```bash
# Clone o repositório
git clone https://github.com/moixocreative/accessibility-monitor-tool.git
cd accessibility-monitor-tool

# Instale as dependências
yarn install
```

**✅ Teste se funcionou:**
```bash
yarn --version
# Deve mostrar a versão do yarn
```

## ⚙️ Passo 2: Configuração Básica (1 minuto)

```bash
# Copie o arquivo de configuração
cp .env.example .env

# (Opcional) Edite configurações básicas
# Por agora pode usar as configurações padrão
```

**✅ Teste se funcionou:**
```bash
cat .env | head -5
# Deve mostrar as primeiras linhas do arquivo

# Valide a configuração
yarn emergency --validate
# Deve mostrar status das variáveis de ambiente
```

## 🧪 Passo 3: Primeiro Teste (2 minutos)

Vamos fazer o primeiro teste numa página simples:

```bash
# Teste básico (15 critérios críticos)
yarn audit:wcag https://www.untile.pt simple console
```

**🎉 Se tudo funcionou, deve ver algo como:**

```
🌐 RELATÓRIO DE ACESSIBILIDADE WCAG 2.1 AA
==========================================
📅 Data: 09/08/2025, 15:30:45
🔗 URL: https://www.untile.pt
🆔 ID da Auditoria: audit_1754751045123

📊 RESUMO EXECUTIVO
===================
📈 Score WCAG: 91% 🟢
📋 Total de Violações: 3
🔴 Críticas: 1
🟡 Sérias: 1
🔵 Menores: 1
```

## 🎯 Próximos Passos

Agora que já funciona, pode explorar:

### 🔍 **Análise Completa**
```bash
# Todos os 50+ critérios WCAG
yarn audit:wcag https://www.untile.pt complete html
```
→ Gera relatório HTML detalhado

### 🕷️ **Site Completo**
```bash
# Analisa múltiplas páginas automaticamente
yarn audit:multi https://www.untile.pt comprehensive simple console 5
```
→ Descobre e analisa 5 páginas do site

### 📊 **Formatos de Relatório**
```bash
# JSON (para integração)
yarn audit:wcag https://www.untile.pt simple json

# HTML (para apresentações)
yarn audit:wcag https://www.untile.pt simple html

# Markdown (para documentação)
yarn audit:wcag https://www.untile.pt simple markdown
```

## 🔧 Problemas Comuns

### ❌ **Erro: "command not found: yarn"**
```bash
# Instale o yarn
npm install -g yarn
```

### ❌ **Erro: "puppeteer: Chromium revision is not downloaded"**
```bash
# Force o download do browser
yarn install --force
```

### ❌ **Erro: "timeout" ou "connection failed"**
```bash
# Teste com timeout maior
yarn audit:wcag https://www.example.com simple console --timeout 60000
```

## 📚 Próximos Guias

- 💻 **[Commands Reference](commands.md)** - Todos os comandos disponíveis
- 📊 **[Understanding Reports](reports.md)** - Como interpretar resultados
- 🔧 **[Troubleshooting](troubleshooting.md)** - Resolver problemas

## 🆘 Precisa de Ajuda?

Se alguma coisa não funcionou:

1. 📖 **Verifique pré-requisitos** no topo desta página
2. 🔧 **Consulte troubleshooting** para problemas comuns
3. 💬 **Abra uma issue** se o problema persistir

---

**🎉 Parabéns! Já fez o seu primeiro teste de acessibilidade!**
