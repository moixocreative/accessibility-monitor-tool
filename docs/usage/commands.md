# Commands Reference - Todos os Comandos Disponíveis

> 💻 **Referência completa de todos os comandos da ferramenta**

## 🎯 Análise Individual de Sites

### `yarn audit:wcag`

Analisa um site específico usando critérios WCAG.

**Sintaxe:**
```bash
yarn audit:wcag <URL> [tipo] [formato]
```

**Parâmetros:**
- `<URL>` - URL do site a analisar (obrigatório)
- `[tipo]` - Tipo de análise: `simple` (padrão) ou `complete`  
- `[formato]` - Formato do relatório: `console` (padrão), `json`, `html`, `markdown`

**Exemplos:**
```bash
# Análise básica (15 critérios críticos)
yarn audit:wcag https://www.example.com simple console

# Análise completa (50+ critérios) 
yarn audit:wcag https://www.example.com complete html

# Exportar como JSON
yarn audit:wcag https://www.example.com simple json

# Relatório em Markdown
yarn audit:wcag https://www.example.com complete markdown
```

**⏱️ Tempo estimado:**
- **Simple**: 1-3 minutos
- **Complete**: 3-8 minutos

---

## 🕷️ Análise Multi-página

### `yarn audit:multi`

Descobre e analisa múltiplas páginas de um site automaticamente.

**Sintaxe:**
```bash
yarn audit:multi <URL> [estratégia] [tipo] [formato] [max-páginas]
```

**Parâmetros:**
- `<URL>` - URL base do site (obrigatório)
- `[estratégia]` - Como descobrir páginas:
  - `comprehensive` (padrão) - Usa todos os métodos
  - `auto` - Discovery automático
  - `sitemap` - Apenas sitemap.xml
  - `manual` - Apenas a URL fornecida
- `[tipo]` - `simple` (padrão) ou `complete`
- `[formato]` - `console` (padrão), `json`, `html`, `markdown`
- `[max-páginas]` - Número máximo de páginas (padrão: 20)

**Exemplos:**
```bash
# Análise básica com discovery automático
yarn audit:multi https://www.example.com

# Análise completa de até 50 páginas
yarn audit:multi https://www.example.com comprehensive complete html 50

# Apenas páginas do sitemap.xml
yarn audit:multi https://www.example.com sitemap simple json 10

# Discovery automático rápido
yarn audit:multi https://www.example.com auto simple console 5
```

**🔧 Melhorias recentes:**
- ✅ Múltiplas tentativas de navegação
- ✅ Fallbacks automáticos para axe-core
- ✅ Tratamento robusto de erros de rede
- ✅ Timeouts configuráveis

**⏱️ Tempo estimado:**
- **5 páginas**: 5-15 minutos
- **20 páginas**: 20-60 minutos
- **50 páginas**: 60-180 minutos

---

## ⚙️ Validação e Configuração

### `yarn emergency --validate`

Valida se todas as configurações estão corretas.

**Sintaxe:**
```bash
yarn emergency --validate
```

**O que verifica:**
- ✅ Variáveis de ambiente (.env)
- ✅ Configuração SMTP
- ✅ Contactos de emergência
- ✅ Configuração do portfolio

**Exemplo de saída:**
```bash
Verificação de Variáveis de Ambiente:
  ✅ EMERGENCY_EMAIL: Configurado
  ✅ SMTP_HOST: smtp.gmail.com
  ❌ SMTP_PASS: Não configurado
  ⚠️  EMAIL_ENABLED: true
```

**💡 Dica:** Execute este comando sempre que tiver problemas de configuração.

---

## 📋 Portfolio (Múltiplos Sites)

### `yarn audit:portfolio`

Analisa todos os sites configurados no portfolio.

**Sintaxe:**
```bash
yarn audit:portfolio [formato]
```

**Parâmetros:**
- `[formato]` - `console` (padrão), `json`, `html`, `markdown`

**Exemplos:**
```bash
# Analisar todo o portfolio
yarn audit:portfolio

# Gerar relatório HTML do portfolio
yarn audit:portfolio html

# Exportar dados do portfolio em JSON
yarn audit:portfolio json
```

**⚠️ Nota:** Requer configuração prévia dos sites no arquivo de configuração.

---

## 🚨 Sistema de Emergência

### `yarn emergency`

Testa e valida o sistema de notificações de emergência.

**Comandos:**
```bash
# Testar sistema de notificações
yarn emergency --test

# Validar configurações
yarn emergency --validate  

# Gerar relatório de emergências
yarn emergency --report

# Verificação pós-deploy
yarn emergency --post-deploy
```

**Exemplos:**
```bash
# Teste completo do sistema
yarn emergency --test

# Verificar se emails estão configurados
yarn emergency --validate

# Ver histórico de incidentes
yarn emergency --report
```

---

## 🛠️ Comandos de Desenvolvimento

### Build e Testes
```bash
# Build do projeto
yarn build

# Executar testes
yarn test

# Linting do código  
yarn lint

# Verificar types do TypeScript
yarn type-check
```

### Relatórios de Desenvolvimento
```bash
# Relatório de testes
yarn report --test

# Relatório de release
yarn report --release

# Relatório de deploy
yarn report --deploy
```

---

## 📊 Formatos de Output

### Console (Padrão)
- ✅ **Vantagens**: Rápido, ideal para desenvolvimento
- ❌ **Desvantagens**: Não persistente, difícil de partilhar

```bash
yarn audit:wcag https://example.com simple console
```

### JSON
- ✅ **Vantagens**: Fácil integração, processamento automático
- ❌ **Desvantagens**: Não human-readable

```bash
yarn audit:wcag https://example.com simple json
```

### HTML
- ✅ **Vantagens**: Visual, fácil de partilhar, screenshots
- ❌ **Desvantagens**: Maior tamanho de arquivo

```bash
yarn audit:wcag https://example.com simple html
```

### Markdown
- ✅ **Vantagens**: Legível, versionável, documentação
- ❌ **Desvantagens**: Funcionalidades limitadas

```bash
yarn audit:wcag https://example.com simple markdown
```

---

## 🎛️ Configurações Globais

### Variáveis de Ambiente
```bash
# Logs mais detalhados
LOG_LEVEL=debug yarn audit:wcag https://example.com

# Timeout personalizado
TIMEOUT=60000 yarn audit:wcag https://example.com

# Desabilitar emails (desenvolvimento)
SEND_EMAILS=false yarn emergency --test
```

### Arquivos de Configuração
- `.env` - Configurações principais
- `src/core/wcag-criteria.ts` - Critérios WCAG customizados
- `src/monitoring/portfolio-monitor.ts` - Sites do portfolio

---

## 🚀 Exemplos de Workflows

### Workflow Básico (QA Testing)
```bash
# 1. Teste rápido
yarn audit:wcag https://staging.example.com simple console

# 2. Análise completa se necessário
yarn audit:wcag https://staging.example.com complete html

# 3. Verificar todo o site antes do deploy
yarn audit:multi https://staging.example.com comprehensive simple console 10
```

### Workflow CI/CD
```bash
# 1. Build
yarn build

# 2. Testes
yarn test

# 3. Análise de acessibilidade
yarn audit:wcag https://staging.example.com simple json

# 4. Validar sistema de emergência
yarn emergency --validate
```

### Workflow de Portfolio
```bash
# 1. Configurar sites no portfolio
# (Editar src/monitoring/portfolio-monitor.ts)

# 2. Executar análise completa
yarn audit:portfolio html

# 3. Verificar relatório
# (Abrir arquivo HTML gerado)
```

---

## 🔍 Debugging e Logs

### Ver Logs em Tempo Real
```bash
# Logs gerais
tail -f logs/accessibility.log

# Logs de auditoria
tail -f logs/audit.log

# Logs de erro
tail -f logs/error.log
```

### Debug Mode
```bash
# Executar com logs detalhados
LOG_LEVEL=debug yarn audit:wcag https://example.com simple console

# Ver execução step-by-step
DEBUG=* yarn audit:wcag https://example.com simple console
```

---

## 🆘 Precisa de Ajuda?

- 📊 **Como interpretar resultados**: [Understanding Reports](reports.md)
- 🔧 **Problemas comuns**: [Troubleshooting](troubleshooting.md)
- 🛠️ **Para developers**: [Development Guide](../development/)
- ⚙️ **Configuração avançada**: [Configuration Guide](../configuration/)

---

**💡 Dica**: Use `--help` em qualquer comando para ver opções específicas!
