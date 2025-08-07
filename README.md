# UNTILE Accessibility Monitoring System

Sistema de monitorização contínua de acessibilidade digital para conformidade com WCAG 2.1 AA e EAA 2025.

<!-- Test commit to trigger workflow with secrets -->

## 🎯 Funcionalidades

### Monitorização Automática
- Auditoria contínua de websites
- Validação WCAG 2.1 AA (15 critérios prioritários)
- Deteção de violações críticas
- Relatórios automáticos

### Sistema de Emergência
- Classificação P0/P1/P2 de incidentes
- Notificações automáticas por email
- SLA management (2h/8h/24h)
- Comunicação com autoridades

### Controlo e Automação
- GitHub Actions para CI/CD
- Workflows de teste e release
- Sincronização com DigitalOcean Spaces
- Monitorização de performance

## 🚀 Instalação

```bash
# Clonar repositório
git clone https://github.com/moixocreative/untile-accessibility-monitoring.git
cd untile-accessibility-monitoring

# Instalar dependências
yarn install

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com suas configurações

# Build do projeto
yarn build
```

## 📋 Scripts Disponíveis

```bash
# Desenvolvimento
yarn dev          # Modo desenvolvimento
yarn build        # Build do projeto
yarn test         # Executar testes

# Monitorização
yarn monitor      # Iniciar monitorização contínua
yarn audit:wcag   # Auditoria WCAG única
yarn audit:portfolio # Auditoria completa do portfolio

# Emergência
yarn emergency --test     # Testar sistema de emergência
yarn emergency --validate # Validar configurações
yarn emergency --report   # Gerar relatório de emergência

# Relatórios
yarn report --test    # Relatório de testes
yarn report --release # Relatório de release
yarn report --deploy  # Relatório de deploy

# Qualidade
yarn lint           # Linting
yarn audit          # Auditoria de segurança
```

## 📚 Documentação

Para informações detalhadas sobre configuração e uso do sistema, consulte:

- **[Guia de Instalação](docs/installation-guide.md)** - Instalação passo a passo
- **[Guia de Uso](docs/usage-guide.md)** - Como usar o sistema
- **[Guia de Desenvolvimento](docs/development-guide.md)** - Para desenvolvedores
- **[Configuração de Email](docs/email-configuration.md)** - Configuração de notificações

## 🏗️ Arquitetura

```
src/
├── core/           # Lógica principal
├── monitoring/     # Sistema de monitorização
├── validation/     # Validação WCAG
├── emergency/      # Sistema de emergência
├── reporting/      # Geração de relatórios
├── api/           # API REST
├── utils/         # Utilitários
└── scripts/       # Scripts executáveis
```

## 🎯 Critérios WCAG 2.1 AA Prioritários

### 1. Perceção (P)
- **1.1.1** - Conteúdo não textual
- **1.3.1** - Informação e relacionamentos
- **1.4.3** - Contraste (mínimo)

### 2. Operável (O)
- **2.1.1** - Teclado
- **2.4.1** - Bypass blocks
- **2.4.7** - Foco visível

### 3. Compreensível (C)
- **3.1.1** - Idioma da página
- **3.2.1** - Foco
- **3.2.2** - Input

### 4. Robusto (R)
- **4.1.1** - Parsing
- **4.1.2** - Nome, função, valor

## 🚨 Sistema de Emergência

### Classificação de Incidentes
- **P0 (Crítico)**: SLA 2 horas
- **P1 (Alto)**: SLA 8 horas  
- **P2 (Médio)**: SLA 24 horas

### Fluxo de Emergência
1. Deteção automática de violação
2. Classificação por severidade
3. Notificação imediata da equipa
4. Comunicação com autoridades (se necessário)
5. Tracking até resolução

## 📊 Monitorização

### Configuração
```bash
# Intervalo de monitorização (1 hora)
MONITORING_INTERVAL=3600000

# Email para alertas
ALERT_EMAIL=mauriciopereita@untile.pt

# Nível WCAG
WCAG_LEVEL=AA

# Critérios prioritários
PRIORITY_CRITERIA=15
```

### Sites Monitorizados
- Website principal
- Área de cliente
- Portal de serviços
- Documentação técnica

## 🔧 Configuração

### Variáveis de Ambiente
```bash
# Configurações Gerais
NODE_ENV=production
PORT=3000

# Monitorização
MONITORING_INTERVAL=3600000  # 1 hora
ALERT_EMAIL=mauriciopereita@untile.pt

# WCAG Validation
WCAG_LEVEL=AA
PRIORITY_CRITERIA=15

# Emergency Contacts
EMERGENCY_EMAIL=mauriciopereita@untile.pt
EMERGENCY_PHONE=+351-XXX-XXX-XXX
AUTHORITY_EMAIL=mauriciopereita@untile.pt

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=mauriciopereita@untile.pt
SMTP_PASS=your_smtp_password_here
SMTP_FROM=mauriciopereita@untile.pt

# Slack Integration (opcional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Database (para futuras implementações)
DATABASE_URL=postgresql://user:pass@localhost:5432/accessibility

# Logging
LOG_LEVEL=info
```

## 📞 Suporte

Para informações detalhadas sobre instalação, configuração e utilização, consulte a documentação completa:

- [Guia de Instalação](docs/installation-guide.md) - Instruções passo-a-passo para instalação e configuração
- [Guia de Utilização](docs/usage-guide.md) - Como usar as funcionalidades do sistema
- [Guia de Desenvolvimento](docs/development-guide.md) - Informações para desenvolvedores

### Documentação Técnica
- [Anexo A - Critérios WCAG 2.1 AA](./docs/anexo_a_wcag_criteria_revised.md)
- [Anexo B - Conformidade Legal EAA 2025](./docs/anexo_b_legal_compliance_revised.md)
- [Anexo I - Monitorização Automática](./docs/anexo_i_automated_monitoring_revised.md)

Para questões técnicas ou de conformidade:

- **Email**: mauriciopereita@untile.pt
- **Slack**: #accessibility-emergency
- **Telefone**: +351-XXX-XXX-XXX (24/7 para emergências)

## 📄 Licença

Este projeto é propriedade da UNTILE e está sujeito aos termos de uso internos.

---

**Desenvolvido com ❤️ pela equipa UNTILE** 