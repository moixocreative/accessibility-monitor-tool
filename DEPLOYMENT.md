# Guia de Deploy - UNTILE Accessibility Monitoring

## Configuração de Produção

### 1. GitHub Secrets (OBRIGATÓRIO)

**⚠️ IMPORTANTE**: Configure os secrets do GitHub antes de usar o sistema!

#### Passo 1: Configurar SMTP_PASS
1. Aceda ao repositório: https://github.com/moixocreative/untile-accessibility-monitoring
2. Clique em **Settings** (menu superior)
3. No menu lateral, clique em **Secrets and variables** → **Actions**
4. Clique em **New repository secret**
5. Configure:
   - **Name**: `SMTP_PASS`
   - **Value**: `Moixo#1974*20Untile`
6. Clique em **Add secret**

#### Passo 2: Verificar Configuração
- ✅ Secret criado com sucesso
- ✅ Valor não é visível (mostra apenas `••••••••`)
- ✅ Disponível para todos os workflows

**📖 Guia Completo**: Ver `GITHUB_SECRETS_SETUP.md` para instruções detalhadas

### 2. Variáveis de Ambiente (Desenvolvimento Local)

Crie um arquivo `.env` baseado no `env.example` com as seguintes configurações:

```bash
# Configurações Gerais
NODE_ENV=production
PORT=3000

# Monitorização
MONITORING_INTERVAL=3600000  # 1 hora em milliseconds
ALERT_EMAIL=mauriciopereita@untile.pt

# WCAG Validation
WCAG_LEVEL=AA
PRIORITY_CRITERIA=15

# Emergency Contacts
EMERGENCY_EMAIL=mauriciopereita@untile.pt
EMERGENCY_PHONE=+351-XXX-XXX-XXX
AUTHORITY_EMAIL=mauriciopereita@untile.pt

# SMTP Configuration (Produção)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=mauriciopereita@untile.pt
SMTP_PASS=your_actual_smtp_password_here
SMTP_FROM=mauriciopereita@untile.pt

# Slack Integration (opcional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Database (para futuras implementações)
DATABASE_URL=postgresql://user:pass@localhost:5432/accessibility

# Logging
LOG_LEVEL=info
```

**⚠️ IMPORTANTE**: Substitua `your_actual_smtp_password_here` pela senha real do email. Nunca commite a senha real no repositório!

### 3. GitHub Actions Secrets (Opcionais para Deploy)

Configure os seguintes secrets no repositório GitHub:

#### Secrets para Deploy:
- `RCLONE_CONFIG_S3_ENDPOINT`: Endpoint do DigitalOcean Spaces
- `RCLONE_CONFIG_S3_ACCESS_KEY_ID`: Access Key do DigitalOcean
- `RCLONE_CONFIG_S3_SECRET_ACCESS_KEY`: Secret Key do DigitalOcean

#### Secrets Opcionais:
- `SLACK_WEBHOOK_URL`: Webhook do Slack para notificações

### 4. Instalação e Build

```bash
# Instalar dependências
yarn install --frozen-lockfile

# Build do projeto
yarn build

# Verificar se tudo está funcionando
yarn test
yarn audit:wcag
yarn audit:portfolio
```

### 5. Deploy Automático

O sistema está configurado para deploy automático via GitHub Actions:

#### Branches:
- `development`: Deploy para staging
- `master`: Deploy para produção

#### Workflows:
1. **Test Suite**: Executa testes em cada PR
2. **Release**: Cria releases quando tags são criadas
3. **Sync Dist**: Sincroniza arquivos com DigitalOcean Spaces

### 6. Monitorização

O sistema inclui monitorização automática:

#### Scripts Disponíveis:
```bash
# Monitorização contínua
yarn monitor

# Auditoria WCAG
yarn audit:wcag

# Auditoria do portfolio
yarn audit:portfolio

# Sistema de emergência
yarn emergency --test
yarn emergency --validate
yarn emergency --report

# Relatórios
yarn report --test
yarn report --release
yarn report --deploy
```

### 7. Configuração de Email

O sistema está configurado para enviar emails para:
- **Alertas de Emergência**: mauriciopereita@untile.pt
- **Alertas de Manutenção**: mauriciopereita@untile.pt
- **Notificações para Autoridade**: mauriciopereita@untile.pt

### 8. Troubleshooting

#### Problemas Comuns:

1. **Erro de SMTP**:
   - Verificar se o secret `SMTP_PASS` está configurado
   - Verificar credenciais do Gmail
   - Ativar "Less secure app access" ou usar App Password
   - Configurar `SMTP_PASS` como secret do GitHub

2. **Puppeteer não funciona**:
   - Verificar se Chromium está instalado
   - Configurar `PUPPETEER_EXECUTABLE_PATH`

3. **Workflows falham**:
   - Verificar secrets do GitHub
   - Verificar permissões do repositório
   - Verificar se `SMTP_PASS` está configurado

4. **Secret not found**:
   - Verificar se o secret está no repositório correto
   - Verificar se o nome do secret está correto
   - Verificar permissões do repositório

### 9. Segurança

- **NUNCA** commitar credenciais no repositório
- Usar secrets do GitHub para dados sensíveis
- Manter dependências atualizadas
- Monitorizar logs regularmente
- Usar App Passwords do Gmail em vez de senhas normais
- Rotacionar secrets regularmente

### 10. Backup e Recuperação

- Relatórios são salvos em `reports/`
- Logs são salvos em `logs/`
- Artefatos são uploadados para GitHub Actions
- Configurações são versionadas no repositório

### 11. Suporte

Para questões técnicas:
- **Email**: mauriciopereita@untile.pt
- **Slack**: #accessibility-emergency
- **Telefone**: +351-XXX-XXX-XXX (24/7 para emergências)
- **Documentação**: Ver `GITHUB_SECRETS_SETUP.md` para configuração detalhada

### 12. Checklist de Configuração

- [ ] Secret `SMTP_PASS` configurado no GitHub
- [ ] Workflow de teste executado com sucesso
- [ ] Sistema de emergência testado
- [ ] Notificações por email funcionando
- [ ] Secrets opcionais configurados (se necessário)

**Status**: 🟢 **CONFIGURAÇÃO COMPLETA** 