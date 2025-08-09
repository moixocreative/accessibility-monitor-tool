# GitHub Actions - Monitorização Manual

## 🚀 Visão Geral

Este projeto inclui um GitHub Action que permite executar a **monitorização periódica** através de um botão no GitHub, sem necessidade de executar comandos localmente.

## 📋 Workflow Disponível

### **Trigger Periodic Monitoring** (`.github/workflows/trigger-monitoring.yml`)

Workflow simples para acionar a monitorização periódica manualmente.

**Como usar:**
1. Vá para a aba **Actions** no GitHub
2. Selecione **Trigger Periodic Monitoring**
3. Clique em **Run workflow**
4. Confirme a execução

## 🎯 O que o workflow faz

### Trigger Periodic Monitoring
- ✅ **Todos os sites** do portfolio
- ✅ **Análise completa** (todos os critérios WCAG 2.1 AA)
- ✅ **Monitorização periódica** (mesmo que `yarn monitor:start`)
- ✅ Relatórios em artifacts
- ✅ Timeout de 30 minutos
- ✅ Configuração automática

## 📊 Resultados

### Artifacts Gerados
- **Relatórios**: `reports/`
- **Logs**: `logs/`
- **Screenshots**: `screenshots/` (se habilitado)
- **Retenção**: 30-90 dias

### Como aceder aos resultados
1. Vá para a aba **Actions**
2. Clique na execução desejada
3. Descarregue os artifacts no final da página

## ⚙️ Configuração

### Variáveis de Ambiente
Os workflows usam automaticamente:
```bash
WCAG_LEVEL=AA
PRIORITY_CRITERIA=all
TIMEOUT=180000
HEADLESS=true
DEBUG_MODE=true
CAPTURE_SCREENSHOTS=true
```

### Timeouts
- **Portfolio audit**: 30 minutos
- **Multi-page audit**: 30 minutos por site
- **Report generation**: 10 minutos

## 🔧 Troubleshooting

### Problemas Comuns

#### Workflow falha com timeout
- **Solução**: Aumentar timeout no workflow
- **Causa**: Sites grandes ou lentos

#### Browser não encontrado
- **Solução**: Verificar instalação do Playwright
- **Causa**: Dependências não instaladas

#### Erro de rede
- **Solução**: Verificar conectividade
- **Causa**: Sites offline ou bloqueados

### Logs e Debug
- Verificar logs na aba **Actions**
- Artifacts contêm logs detalhados
- `DEBUG_MODE=true` para mais detalhes

## 🎯 Casos de Uso

### Monitorização Manual
1. Executar **Trigger Periodic Monitoring** quando necessário
2. Revisar relatórios nos artifacts
3. Corrigir violações críticas

### Monitorização de Emergência
1. Executar **Trigger Periodic Monitoring** para auditoria imediata
2. Verificar violações críticas
3. Tomar ações corretivas

### Monitorização de Desenvolvimento
1. Executar **Trigger Periodic Monitoring** para testes
2. Verificar mudanças recentes
3. Validar correções

## 📈 Monitorização Contínua

Para monitorização automática:
```bash
# Local
yarn monitor:start

# GitHub Actions (cron)
# Configurar em .github/workflows/scheduled-monitoring.yml
```

## 🔐 Segurança

- Workflows não expõem credenciais
- Artifacts são privados
- Logs não contêm dados sensíveis
- Timeouts previnem execução infinita

---

**💡 Dica**: Use os workflows GitHub Actions para auditorias completas sem consumir recursos locais!
