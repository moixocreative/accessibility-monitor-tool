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

## 🇵🇹 Auditoria com Critérios acessibilidade.gov.pt

### **Auditoria Individual com Critérios Oficiais**

Para auditorias que usem os 10 critérios críticos oficiais do governo português:

```bash
# Auditoria básica com critérios Gov.pt
yarn audit:wcag https://www.example.com simple console

# Auditoria completa com critérios Gov.pt
yarn audit:wcag https://www.example.com complete html
```

**Nota:** O comando `yarn audit:wcag` usa sempre os critérios UNTILE por padrão. Para critérios Gov.pt, use `yarn audit:multi` com uma única página.

### **Auditoria Multi-página com Critérios Gov.pt**

```bash
# Auditoria de uma página com critérios Gov.pt
yarn audit:multi https://www.example.com manual simple html 1 false gov-pt

# Auditoria de múltiplas páginas com critérios Gov.pt
yarn audit:multi https://www.example.com auto simple html 20 false gov-pt

# Auditoria completa com critérios Gov.pt
yarn audit:multi https://www.example.com comprehensive complete html 50 false gov-pt
```

### **Critérios Incluídos (acessibilidade.gov.pt):**

1. **1.1.1** - Conteúdo Não-Textual
2. **1.4.3** - Contraste (Mínimo)
3. **2.1.1** - Teclado
4. **2.4.1** - Saltar Blocos
5. **2.4.7** - Foco Visível
6. **3.3.2** - Rótulos ou Instruções
7. **4.1.2** - Nome, Função, Valor
8. **1.3.1** - Info e Relações
9. **2.2.1** - Tempo Ajustável
10. **3.3.1** - Identificação de Erro

---

## 🕷️ Análise Multi-página

### `yarn audit:multi`

Descobre e analisa múltiplas páginas de um site automaticamente.

**Sintaxe:**
```bash
yarn audit:multi <URL> [estratégia] [tipo] [formato] [max-páginas] [fórmula-padrão] [conjunto-critérios] [critérios-personalizados]
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
- `[fórmula-padrão]` - `true` para fórmula axe-core, `false` para UNTILE (padrão: false)
- `[conjunto-critérios]` - `untile`, `gov-pt`, ou `custom` (padrão: untile)
- `[critérios-personalizados]` - Lista separada por vírgulas (ex: "1.1.1,1.4.3,2.1.1")

**Conjuntos de Critérios Disponíveis:**

#### **1. Critérios UNTILE (Padrão)**
- **15 critérios prioritários** baseados em dados empíricos WebAIM Million 2024
- **Foco:** Portfolio UNTILE e casos de uso específicos
- **Uso:** `yarn audit:multi https://example.com auto simple html 20 false untile`

#### **2. Critérios acessibilidade.gov.pt**
- **10 critérios críticos** oficiais do governo português
- **Foco:** Conformidade com padrões oficiais nacionais
- **Uso:** `yarn audit:multi https://example.com auto simple html 20 false gov-pt`

#### **3. Critérios Personalizados**
- **Critérios específicos** escolhidos pelo utilizador
- **Foco:** Auditorias direcionadas e específicas
- **Uso:** `yarn audit:multi https://example.com auto simple html 20 false custom "1.1.1,1.4.3,2.1.1"`

**Exemplos:**
```bash
# Análise básica com critérios UNTILE (padrão)
yarn audit:multi https://www.example.com

# Análise com critérios Gov.pt
yarn audit:multi https://www.example.com auto simple html 20 false gov-pt

# Análise com critérios personalizados
yarn audit:multi https://www.example.com auto simple html 20 false custom "1.1.1,1.4.3,2.1.1,2.4.1,4.1.2"

# Análise completa de até 50 páginas com critérios Gov.pt
yarn audit:multi https://www.example.com comprehensive complete html 50 false gov-pt

# Apenas páginas do sitemap.xml com critérios personalizados
yarn audit:multi https://www.example.com sitemap simple json 10 false custom "1.1.1,1.4.3"

# Discovery automático rápido com critérios Gov.pt
yarn audit:multi https://www.example.com auto simple console 5 false gov-pt
```

**🔧 Melhorias recentes:**
- ✅ Múltiplas tentativas de navegação
- ✅ Fallbacks automáticos para axe-core
- ✅ Tratamento robusto de erros de rede
- ✅ Timeouts configuráveis
- ✅ **Novo:** Seleção de critérios WCAG configuráveis
- ✅ **Novo:** Critérios oficiais acessibilidade.gov.pt

**⏱️ Tempo estimado:**
- **5 páginas**: 5-15 minutos
- **20 páginas**: 20-60 minutos
- **50 páginas**: 60-180 minutos

---

## 🔄 Monitorização Periódica

### `yarn monitor:start`

Inicia a monitorização periódica contínua de todos os sites do portfolio.

**Sintaxe:**
```bash
yarn monitor:start
```

**O que faz:**
- ✅ Inicia monitorização agendada (configurável via MONITORING_INTERVAL)
- ✅ Executa auditoria completa de todos os sites
- ✅ Detecta violações críticas automaticamente
- ✅ Gera relatórios periódicos
- ✅ Mantém processo ativo até Ctrl+C

**Configuração:**
```bash
# .env
MONITORING_INTERVAL=0 0 * * 1  # Semanalmente às 0h de segunda-feira
MONITORING_ENABLED=true
MONITORING_TIMEZONE=Europe/Lisbon
```

**Exemplo de saída:**
```bash
📊 CONFIGURAÇÃO DA MONITORIZAÇÃO
==================================
Intervalo: 0 0 * * 1
Ativo: ✅ Sim
Próxima execução: 11/08/2025, 00:00:00

🔄 Sistema de monitorização ativo. Pressione Ctrl+C para parar.
```

---

### `yarn monitor:test`

Testa a funcionalidade de monitorização periódica.

**Sintaxe:**
```bash
yarn monitor:test
```

**O que testa:**
- ✅ Validação de expressões cron
- ✅ Configuração de monitorização
- ✅ Auditoria única do portfolio
- ✅ Início/paragem de monitorização



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
