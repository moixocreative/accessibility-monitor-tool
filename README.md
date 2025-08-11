# UNTILE Accessibility Monitor Tool

> 🔍 **Ferramenta automatizada de monitorização de acessibilidade WCAG 2.1 AA para websites**

[![Build Status](https://github.com/moixocreative/accessibility-monitor-tool/workflows/CI/badge.svg)](https://github.com/moixocreative/accessibility-monitor-tool/actions)
[![Coverage](https://img.shields.io/badge/coverage-85%25-green.svg)](https://github.com/moixocreative/accessibility-monitor-tool)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🚀 Quick Start (5 minutos)

```bash
# 1. Clone e instale (1 min)
git clone https://github.com/moixocreative/accessibility-monitor-tool.git
cd accessibility-monitor-tool
yarn install

# 2. Configure básico (2 min)
cp .env.example .env
# Edite .env com suas configurações básicas

# 3. Primeiro teste (2 min)
yarn audit:wcag https://www.example.com simple console
```

## 📋 O que esta ferramenta faz?

### ✅ **Dois tipos de análise WCAG**
- **Simples**: 15 critérios críticos (análise rápida)
- **Completa**: 50+ critérios WCAG 2.1 AA (análise abrangente)

### 🕷️ **Análise completa de sites**
- Crawling automático de todas as páginas
- Análise individual por URL
- Monitorização de portfolio (múltiplos sites)

### 📊 **Relatórios detalhados**
- Console, JSON, HTML, Markdown
- Scoring realista baseado em violações
- Recomendações específicas por site

### 🔧 **Sistema robusto**
- Múltiplas tentativas de navegação
- Fallbacks automáticos para axe-core
- Tratamento robusto de erros de rede
- Configuração automática de ambiente

### 🔄 **Monitorização Periódica**
- Agendamento configurável (cron expressions)
- Análise completa automática de todos os sites
- Notificações de violações críticas
- Relatórios periódicos

## 🎯 Para quem é esta ferramenta?

### 👨‍💻 **Developers** → [Development Guide](docs/development/)
- Configurar ambiente de desenvolvimento
- Contribuir para o projeto
- Arquitetura e testes

### 🧪 **QA Testers** → [Usage Guide](docs/usage/)
- Executar testes de acessibilidade
- Interpretar relatórios
- Comandos principais

### ⚙️ **DevOps/Admin** → [Configuration Guide](docs/configuration/)
- Setup rápido em 5 minutos
- Configurar SMTP/emails
- Adicionar sites ao portfolio

## 📊 Comandos Principais

```bash
# Análise individual
yarn audit:wcag https://example.com simple console    # 15 critérios críticos
yarn audit:wcag https://example.com complete html     # 50+ critérios completos

# Análise multi-página  
yarn audit:multi https://example.com comprehensive simple console 20

# Portfolio (múltiplos sites)
yarn audit:portfolio console

# Monitorização Periódica
yarn monitor:start                    # Iniciar monitorização contínua (semanal)
yarn monitor:test                     # Testar monitorização

# Monitorização com Critérios Gov.pt
yarn monitor:start:gov-pt            # Monitorização com critérios acessibilidade.gov.pt
yarn monitor:test:gov-pt             # Testar monitorização Gov.pt

# Validação de configuração
yarn emergency --validate
```

## 🎯 Critérios WCAG Configuráveis

### **Conjuntos Disponíveis:**

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

### **Exemplos Completos:**

```bash
# Auditoria com critérios UNTILE (padrão)
yarn audit:multi https://example.com auto simple html 20 false untile

# Auditoria com critérios Gov.pt
yarn audit:multi https://example.com auto simple html 20 false gov-pt

# Auditoria com critérios personalizados
yarn audit:multi https://example.com auto simple html 20 false custom "1.1.1,1.4.3,2.1.1,2.4.1,4.1.2"

# Monitorização periódica com critérios Gov.pt
yarn monitor:start:gov-pt
```

## 🏗️ Arquitetura

```
src/
├── core/           # Critérios WCAG (UNTILE + Gov.pt + custom)
├── validation/     # Validadores (axe-core + custom)
├── crawler/        # Discovery automático de páginas
├── reports/        # Geração de relatórios
└── scripts/        # Comandos executáveis
```

## 📚 Documentação Completa

| Público | Documentação | Descrição |
|---------|--------------|-----------|
| **QA/Users** | [**Usage Guide**](docs/usage/) | Como usar a ferramenta |
| **Developers** | [**Development Guide**](docs/development/) | Como contribuir |
| **Admin/DevOps** | [**Configuration Guide**](docs/configuration/) | Como configurar |

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch: `git checkout -b feature/amazing-feature`
3. Commit suas mudanças: `git commit -m 'feat: add amazing feature'`
4. Push para a branch: `git push origin feature/amazing-feature`
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ pela equipa UNTILE**