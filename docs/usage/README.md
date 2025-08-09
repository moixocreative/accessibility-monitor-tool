# Usage Guide - Para QA Testers & Users

> 🧪 **Guia completo para usar a ferramenta de acessibilidade UNTILE**

Este guia é para **QA testers**, **designers**, **product managers** e qualquer pessoa que precisa **testar acessibilidade** mas não necessariamente desenvolver código.

## 📋 O que você vai encontrar aqui

### 🚀 [**Getting Started**](getting-started.md)
- Primeiro uso em 5 minutos
- Instalação básica
- Primeiro teste

### 💻 [**Commands Reference**](commands.md)
- Todos os comandos disponíveis
- Exemplos práticos
- Parâmetros e opções

### 📊 [**Understanding Reports**](reports.md)
- Como interpretar resultados
- Scores e métricas
- Tipos de violações

### 🔧 [**Troubleshooting**](troubleshooting.md)
- Problemas comuns
- Soluções práticas
- Como pedir ajuda

## 🎯 Casos de Uso Principais

### ✅ **Teste rápido de um site**
```bash
yarn audit:wcag https://www.example.com simple console
```
→ Análise de 15 critérios críticos em 2-3 minutos

### 🔍 **Análise completa**
```bash
yarn audit:wcag https://www.example.com complete html
```
→ Análise de 50+ critérios com relatório HTML

### 🕷️ **Site completo (todas as páginas)**
```bash
yarn audit:multi https://www.example.com comprehensive simple console 20
```
→ Descobre e analisa automaticamente até 20 páginas

### 📋 **Portfolio de múltiplos sites**
```bash
yarn audit:portfolio console
```
→ Analisa todos os sites configurados

### ⚙️ **Validação de configuração**
```bash
yarn emergency --validate
```
→ Verifica se todas as configurações estão corretas

## 🎪 Demo Interativo

Quer ver em ação? Teste estes comandos:

```bash
# Teste básico (2 min)
yarn audit:wcag https://www.untile.pt simple console

# Análise completa com relatório (5 min)  
yarn audit:wcag https://www.untile.pt complete html

# Site inteiro (10 min)
yarn audit:multi https://www.untile.pt comprehensive simple console 5
```

## 🆘 Precisa de Ajuda?

- 📖 **Documentação**: Veja os guias específicos acima
- 🐛 **Problemas**: Consulte [Troubleshooting](troubleshooting.md)
- 💬 **Suporte**: [Abra uma issue](https://github.com/moixocreative/accessibility-monitor-tool/issues)

---

**💡 Dica**: Comece pelo [Getting Started](getting-started.md) para o seu primeiro teste!
