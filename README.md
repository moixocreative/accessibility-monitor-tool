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



# Validação de configuração
yarn emergency --validate
```

## 🏗️ Arquitetura

```
src/
├── core/           # 15 critérios WCAG prioritários
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