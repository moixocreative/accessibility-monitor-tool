# Guia de Utilização - UNTILE Accessibility Monitoring System

## 🎯 Visão Geral

O sistema de monitorização de acessibilidade UNTILE oferece três funcionalidades principais:

1. **Monitorização Automática** - Auditoria contínua de websites
2. **Sistema de Emergência** - Resposta rápida a violações críticas
3. **Relatórios** - Geração de relatórios de conformidade

## 📊 Scripts Principais

### Monitorização

#### Auditoria WCAG Única
```bash
yarn audit:wcag
```
**O que faz:**
- Valida os 15 critérios WCAG 2.1 AA prioritários
- Gera relatório detalhado de conformidade
- Salva resultados em `logs/audit.log`

#### Auditoria do Portfolio
```bash
yarn audit:portfolio
```
**O que faz:**
- Audita todos os sites configurados no portfolio
- Valida acessibilidade e performance
- Gera relatório consolidado

#### Monitorização Contínua
```bash
yarn monitor
```
**O que faz:**
- Inicia monitorização contínua (intervalo configurável)
- Detecta violações em tempo real
- Envia alertas automáticos

### Emergência

#### Teste do Sistema de Emergência
```bash
yarn emergency --test
```
**O que faz:**
- Testa o sistema de notificações
- Simula cenários de emergência
- Valida templates de comunicação

#### Validação de Configurações
```bash
yarn emergency --validate
```
**O que faz:**
- Valida configurações de emergência
- Verifica conectividade de notificações
- Testa templates de email

#### Relatório de Emergência
```bash
yarn emergency --report
```
**O que faz:**
- Gera relatório de incidentes
- Lista violações críticas
- Sugere ações corretivas

### Relatórios

#### Relatório de Testes
```bash
yarn report --test
```
**O que faz:**
- Gera relatório de testes executados
- Mostra cobertura de validação
- Lista problemas encontrados

#### Relatório de Release
```bash
yarn report --release
```
**O que faz:**
- Gera relatório para releases
- Valida conformidade antes do deploy
- Documenta mudanças

#### Relatório de Deploy
```bash
yarn report --deploy
```
**O que faz:**
- Gera relatório pós-deploy
- Confirma conformidade em produção
- Valida performance

## ⚙️ Configuração

### Portfolio de Sites

Editar `src/monitoring/portfolio-monitor.ts`:
```typescript
export const PORTFOLIO_SITES = [
  {
    url: 'https://untile.pt',
    name: 'Website Principal',
    priority: 'high'
  },
  {
    url: 'https://cliente.untile.pt',
    name: 'Área de Cliente',
    priority: 'critical'
  },
  {
    url: 'https://docs.untile.pt',
    name: 'Documentação',
    priority: 'medium'
  }
];
```

### Configuração de Notificações

Editar `.env`:
```env
# Email Configuration
SEND_EMAILS=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=accessibility@untile.pt
SMTP_PASS=your-app-password

# Alert Configuration
ALERT_EMAIL=accessibility@untile.pt
EMERGENCY_EMAIL=emergency@untile.pt
AUTHORITY_EMAIL=authority@example.pt

# Monitoring Configuration
MONITORING_INTERVAL=3600000  # 1 hora
WCAG_LEVEL=AA
PRIORITY_CRITERIA=15
```

### Critérios WCAG Personalizados

Editar `src/core/wcag-criteria.ts`:
```typescript
export const CUSTOM_CRITERIA = {
  '1.1.1': { priority: 'P0', description: 'Conteúdo Não-Textual' },
  '1.4.3': { priority: 'P0', description: 'Contraste (Mínimo)' },
  '2.1.1': { priority: 'P0', description: 'Teclado' },
  // ... outros critérios
};
```

## 📈 Interpretação de Resultados

### Relatórios de Auditoria

#### Estrutura do Relatório
```json
{
  "site": "https://untile.pt",
  "timestamp": "2024-01-15T10:30:00Z",
  "overall_score": 85,
  "wcag_compliance": {
    "passed": 12,
    "failed": 3,
    "total": 15
  },
  "critical_violations": [
    {
      "criterion": "1.4.3",
      "description": "Contraste insuficiente",
      "severity": "P0",
      "elements": ["button.primary", "a.nav-link"]
    }
  ],
  "recommendations": [
    "Aumentar contraste do texto principal",
    "Adicionar labels aos formulários"
  ]
}
```

#### Interpretação de Scores
- **90-100:** Excelente conformidade
- **80-89:** Boa conformidade
- **70-79:** Conformidade aceitável
- **60-69:** Conformidade baixa
- **<60:** Não conforme

### Alertas de Emergência

#### Classificação de Severidade
- **P0 (Crítico):** SLA 2h - Violação de critério crítico
- **P1 (Alto):** SLA 8h - Violação de critério importante
- **P2 (Médio):** SLA 24h - Violação de critério menor

#### Estrutura do Alerta
```json
{
  "incident_id": "INC-2024-001",
  "severity": "P0",
  "site": "https://untile.pt",
  "criterion": "1.4.3",
  "description": "Contraste crítico insuficiente",
  "detected_at": "2024-01-15T10:30:00Z",
  "sla_deadline": "2024-01-15T12:30:00Z",
  "actions_required": [
    "Corrigir contraste imediatamente",
    "Notificar equipa de design",
    "Validar correção"
  ]
}
```

## 🔧 Troubleshooting

### Problemas Comuns

#### Monitorização Para de Funcionar
```bash
# Verificar logs
tail -f logs/accessibility.log

# Reiniciar monitorização
pkill -f "yarn monitor"
yarn monitor
```

#### Alertas Não Enviados
```bash
# Testar configuração SMTP
yarn emergency --test

# Verificar variáveis de ambiente
echo $SEND_EMAILS
echo $SMTP_HOST
```

#### Relatórios Não Gerados
```bash
# Verificar permissões
ls -la logs/
chmod 755 logs/

# Limpar cache
rm -rf logs/*.log
yarn report --test
```

### Logs e Debugging

#### Logs Principais
- `logs/accessibility.log` - Logs gerais do sistema
- `logs/audit.log` - Logs de auditoria
- `logs/emergency.log` - Logs de emergência
- `logs/error.log` - Logs de erro

#### Comandos de Debug
```bash
# Ver logs em tempo real
tail -f logs/accessibility.log

# Filtrar por tipo de erro
grep "ERROR" logs/error.log

# Ver últimas auditorias
tail -n 50 logs/audit.log
```

## 🔄 Monitorização Contínua

### Configuração de Cron Jobs

#### Linux/macOS
```bash
# Adicionar ao crontab
crontab -e

# Executar auditoria a cada hora
0 * * * * cd /path/to/accessibility-monitoring && yarn audit:portfolio

# Executar monitorização contínua
*/30 * * * * cd /path/to/accessibility-monitoring && yarn monitor
```

#### Windows (Task Scheduler)
```cmd
# Criar tarefa para auditoria
schtasks /create /tn "Accessibility Audit" /tr "yarn audit:portfolio" /sc hourly /ru "SYSTEM"

# Criar tarefa para monitorização
schtasks /create /tn "Accessibility Monitor" /tr "yarn monitor" /sc minute /mo 30 /ru "SYSTEM"
```

### Integração CI/CD

#### GitHub Actions
```yaml
name: Accessibility Check
on: [push, pull_request]
jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: yarn install
      - run: yarn audit:wcag
      - run: yarn emergency --test
```

#### Jenkins Pipeline
```groovy
stage('Accessibility Test') {
    steps {
        sh 'yarn install'
        sh 'yarn audit:wcag'
        sh 'yarn emergency --test'
    }
}
```

## 📊 Métricas e KPIs

### Métricas Principais
- **Conformidade WCAG:** Percentagem de critérios cumpridos
- **Tempo de Resposta:** SLA para correções
- **Violações Críticas:** Número de P0/P1
- **Cobertura Portfolio:** Sites monitorizados

### Dashboard de Monitorização
```bash
# Gerar relatório de métricas
yarn report --metrics

# Ver estatísticas
yarn report --stats
```

## ✅ Checklist de Utilização

### Configuração Inicial
- [ ] Portfolio configurado
- [ ] Notificações testadas
- [ ] Critérios WCAG definidos
- [ ] Logs configurados

### Monitorização Diária
- [ ] Verificar logs de erro
- [ ] Validar alertas recebidos
- [ ] Confirmar auditorias executadas
- [ ] Verificar relatórios gerados

### Manutenção Semanal
- [ ] Revisar configurações
- [ ] Atualizar portfolio se necessário
- [ ] Verificar performance do sistema
- [ ] Backup de logs e relatórios

## 🆘 Suporte

Para questões de utilização:
- **Email:** accessibility@untile.pt
- **Slack:** #accessibility-support
- **Documentação:** [Guia de Desenvolvimento](./development-guide.md) 