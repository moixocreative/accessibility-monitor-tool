# Configuração de GitHub Secrets - UNTILE Accessibility Monitoring

## 🔐 Configuração de Secrets do GitHub

Este guia explica como configurar os secrets necessários para o funcionamento do sistema de monitorização de acessibilidade.

---

## 📋 Secrets Obrigatórios

### 1. Configurações SMTP

#### SMTP_HOST
**Descrição**: Servidor SMTP para envio de emails
**Valor**: `smtp.gmail.com`

#### SMTP_PORT
**Descrição**: Porta do servidor SMTP
**Valor**: `587`

#### SMTP_USER
**Descrição**: Email para autenticação SMTP
**Valor**: `mauriciopereita@untile.pt`

#### SMTP_PASS
**Descrição**: Senha do email para autenticação SMTP
**Valor**: `Moixo#1974*20Untile`

#### SMTP_FROM
**Descrição**: Email remetente para notificações
**Valor**: `mauriciopereita@untile.pt`

### 2. Configurações de Email

#### ALERT_EMAIL
**Descrição**: Email para receber alertas gerais
**Valor**: `mauriciopereita@untile.pt`

#### EMERGENCY_EMAIL
**Descrição**: Email para receber alertas de emergência
**Valor**: `mauriciopereita@untile.pt`

#### AUTHORITY_EMAIL
**Descrição**: Email para notificações para autoridade
**Valor**: `mauriciopereita@untile.pt`

---

## 📋 Secrets para Deploy (Opcionais)

### 3. DigitalOcean Spaces

#### RCLONE_CONFIG_S3_ENDPOINT
**Descrição**: Endpoint do DigitalOcean Spaces para upload de ficheiros
**Valor**: `https://fra1.digitaloceanspaces.com` (ou o seu endpoint)

#### RCLONE_CONFIG_S3_ACCESS_KEY_ID
**Descrição**: Access Key do DigitalOcean para autenticação
**Valor**: Sua Access Key do DigitalOcean

#### RCLONE_CONFIG_S3_SECRET_ACCESS_KEY
**Descrição**: Secret Key do DigitalOcean para autenticação
**Valor**: Sua Secret Key do DigitalOcean

### 4. Integrações Opcionais

#### SLACK_WEBHOOK_URL
**Descrição**: Webhook do Slack para notificações
**Valor**: `https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK`

---

## 🔧 Como Configurar Todos os Secrets

### Passo 1: Aceder ao Repositório
1. Vá para: https://github.com/moixocreative/untile-accessibility-monitoring
2. Clique em **Settings** (menu superior)
3. No menu lateral, clique em **Secrets and variables** → **Actions**

### Passo 2: Configurar Secrets Obrigatórios

#### 2.1 SMTP_HOST
1. Clique em **New repository secret**
2. **Name**: `SMTP_HOST`
3. **Value**: `smtp.gmail.com`
4. Clique em **Add secret**

#### 2.2 SMTP_PORT
1. Clique em **New repository secret**
2. **Name**: `SMTP_PORT`
3. **Value**: `587`
4. Clique em **Add secret**

#### 2.3 SMTP_USER
1. Clique em **New repository secret**
2. **Name**: `SMTP_USER`
3. **Value**: `mauriciopereita@untile.pt`
4. Clique em **Add secret**

#### 2.4 SMTP_PASS
1. Clique em **New repository secret**
2. **Name**: `SMTP_PASS`
3. **Value**: `Moixo#1974*20Untile`
4. Clique em **Add secret**

#### 2.5 SMTP_FROM
1. Clique em **New repository secret**
2. **Name**: `SMTP_FROM`
3. **Value**: `mauriciopereita@untile.pt`
4. Clique em **Add secret**

#### 2.6 ALERT_EMAIL
1. Clique em **New repository secret**
2. **Name**: `ALERT_EMAIL`
3. **Value**: `mauriciopereita@untile.pt`
4. Clique em **Add secret**

#### 2.7 EMERGENCY_EMAIL
1. Clique em **New repository secret**
2. **Name**: `EMERGENCY_EMAIL`
3. **Value**: `mauriciopereita@untile.pt`
4. Clique em **Add secret**

#### 2.8 AUTHORITY_EMAIL
1. Clique em **New repository secret**
2. **Name**: `AUTHORITY_EMAIL`
3. **Value**: `mauriciopereita@untile.pt`
4. Clique em **Add secret**

### Passo 3: Verificar Configuração
- ✅ Todos os secrets criados com sucesso
- ✅ Valores não são visíveis (mostram apenas `••••••••`)
- ✅ Disponível para todos os workflows

---

## 🔍 Como Verificar se os Secrets Estão Configurados

### Método 1: Interface Web
1. Vá para **Settings** → **Secrets and variables** → **Actions**
2. Verifique se todos os secrets aparecem na lista:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_FROM`
   - `ALERT_EMAIL`
   - `EMERGENCY_EMAIL`
   - `AUTHORITY_EMAIL`
3. Os valores não são visíveis por segurança

### Método 2: Teste nos Workflows
1. Faça um commit para trigger um workflow
2. Vá para **Actions** → **Test Suite**
3. Clique no job que falhou
4. Verifique se há erros relacionados com variáveis de ambiente

### Método 3: Logs dos Workflows
Os workflows agora incluem todas as variáveis de ambiente nos logs (sem mostrar os valores):
```yaml
env:
  SMTP_HOST: ${{ secrets.SMTP_HOST }}
  SMTP_PORT: ${{ secrets.SMTP_PORT }}
  SMTP_USER: ${{ secrets.SMTP_USER }}
  SMTP_PASS: ${{ secrets.SMTP_PASS }}
  SMTP_FROM: ${{ secrets.SMTP_FROM }}
  ALERT_EMAIL: ${{ secrets.ALERT_EMAIL }}
  EMERGENCY_EMAIL: ${{ secrets.EMERGENCY_EMAIL }}
  AUTHORITY_EMAIL: ${{ secrets.AUTHORITY_EMAIL }}
```

---

## 🛡️ Segurança dos Secrets

### ✅ Boas Práticas
- ✅ **Nunca commitar** secrets no código
- ✅ **Usar sempre** `${{ secrets.SECRET_NAME }}`
- ✅ **Rotacionar** secrets regularmente
- ✅ **Limitar acesso** aos secrets
- ✅ **Todos os dados sensíveis** em secrets

### ❌ O que NÃO fazer
- ❌ Não commitar senhas no repositório
- ❌ Não usar valores hardcoded
- ❌ Não partilhar secrets por email
- ❌ Não usar secrets em logs
- ❌ Não deixar emails hardcoded no código

---

## 🧪 Teste da Configuração

### 1. Teste Local (com arquivo .env)
```bash
# Criar arquivo .env (não commitar!)
cat > .env << EOF
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=mauriciopereita@untile.pt
SMTP_PASS=Moixo#1974*20Untile
SMTP_FROM=mauriciopereita@untile.pt
ALERT_EMAIL=mauriciopereita@untile.pt
EMERGENCY_EMAIL=mauriciopereita@untile.pt
AUTHORITY_EMAIL=mauriciopereita@untile.pt
EOF

# Testar sistema
yarn emergency --test
yarn audit:wcag
```

### 2. Teste no GitHub Actions
1. Faça um commit para trigger o workflow
2. Vá para **Actions** → **Test Suite**
3. Verifique se todos os steps passam
4. Verifique se não há erros de SMTP

---

## 🔧 Troubleshooting

### Problema: "SMTP_PASS not found"
**Solução**: Verificar se o secret `SMTP_PASS` está configurado corretamente

### Problema: "Authentication failed"
**Solução**: 
1. Verificar se a senha está correta
2. Ativar "Less secure app access" no Gmail
3. Ou usar App Password do Gmail

### Problema: "Secret not accessible"
**Solução**: 
1. Verificar permissões do repositório
2. Verificar se o secret está no repositório correto
3. Verificar se o workflow tem acesso aos secrets

### Problema: "Email configuration missing"
**Solução**:
1. Verificar se todos os secrets de email estão configurados
2. Verificar se os nomes dos secrets estão corretos
3. Verificar se não há typos nos valores

---

## 📞 Suporte

Se tiver problemas com a configuração:

- **Email**: mauriciopereita@untile.pt
- **GitHub Issues**: Criar issue no repositório
- **Documentação**: Ver `DEPLOYMENT.md` para mais detalhes

---

## ✅ Checklist de Configuração

### Secrets Obrigatórios:
- [ ] `SMTP_HOST` configurado
- [ ] `SMTP_PORT` configurado
- [ ] `SMTP_USER` configurado
- [ ] `SMTP_PASS` configurado
- [ ] `SMTP_FROM` configurado
- [ ] `ALERT_EMAIL` configurado
- [ ] `EMERGENCY_EMAIL` configurado
- [ ] `AUTHORITY_EMAIL` configurado

### Secrets Opcionais:
- [ ] `RCLONE_CONFIG_S3_ENDPOINT` configurado (se necessário)
- [ ] `RCLONE_CONFIG_S3_ACCESS_KEY_ID` configurado (se necessário)
- [ ] `RCLONE_CONFIG_S3_SECRET_ACCESS_KEY` configurado (se necessário)
- [ ] `SLACK_WEBHOOK_URL` configurado (se necessário)

### Testes:
- [ ] Workflow de teste executado com sucesso
- [ ] Sistema de emergência testado
- [ ] Notificações por email funcionando
- [ ] Todos os secrets acessíveis nos workflows

**Status**: 🟢 **CONFIGURAÇÃO COMPLETA** 