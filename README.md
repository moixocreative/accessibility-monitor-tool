# 🔍 AccessMonitor - Ferramenta de Auditoria de Acessibilidade

Ferramenta de monitorização de acessibilidade web que reproduz **exatamente** os critérios e fórmula do [AccessMonitor](https://accessmonitor.acessibilidade.gov.pt/) (acessibilidade.gov.pt).

## 🎯 **Características**

- ✅ **Reprodução exata** dos critérios do AccessMonitor
- ✅ **Fórmula de pontuação idêntica** (2 pontos por violação)
- ✅ **10 aspetos críticos** de acessibilidade funcional
- ✅ **Classificação de conformidade** igual ao AccessMonitor
- ✅ **Auditoria individual** ou **em lote** de múltiplos sites
- ✅ **Relatórios** em console, HTML e JSON

## 🚀 **Instalação**

```bash
# Clonar repositório
git clone <repository-url>
cd accessibility-monitor-tool

# Instalar dependências
yarn install

# Configurar variáveis de ambiente
cp .env.example .env
```

## 📋 **Uso Rápido**

### Auditoria Individual
```bash
# Auditoria básica
yarn audit https://example.com

# Com estratégia específica
yarn audit https://example.com comprehensive html

# Com limite de páginas
yarn audit https://example.com sitemap json 50
```

### Auditoria em Lote
```bash
# Usar configuração padrão
yarn audit:batch

# Usar configuração personalizada
yarn audit:batch my-sites.json
```

### Monitorização Periódica
```bash
# Iniciar monitorização (semanal às 0h de segunda-feira)
yarn monitor:start

# Teste da monitorização
yarn monitor:test
```

## ⚙️ **Configuração**

### Estratégias de Descoberta de Páginas
- **`comprehensive`** (padrão): Usa todos os métodos
- **`auto`**: Discovery automático
- **`sitemap`**: Apenas sitemap.xml
- **`manual`**: Apenas a URL fornecida

### Formatos de Relatório
- **`console`** (padrão): Apenas console
- **`html`**: Relatório HTML
- **`json`**: Relatório JSON

### Arquivo de Configuração para Lote
```json
{
  "sites": [
    {
      "url": "https://example.com",
      "name": "Example Site",
      "description": "Descrição do site"
    }
  ],
  "defaultSettings": {
    "strategy": "comprehensive",
    "maxPages": 20,
    "outputFormat": "console"
  }
}
```

## 📊 **Classificação de Conformidade**

### Plenamente Conforme
- Todas as páginas com pontuação > 9.0 **E**
- Passar ≥ 75% dos 10 aspetos críticos

### Parcialmente Conforme
- Todas as páginas com pontuação > 8.0 **E**
- Passar entre 50% e 75% dos 10 aspetos críticos

### Não Conforme
- Qualquer página com pontuação ≤ 8.0 **OU**
- Violar > 50% dos 10 aspetos críticos

## 🔧 **Comandos Disponíveis**

| Comando | Descrição |
|---------|-----------|
| `yarn audit <URL>` | Auditoria individual de um site |
| `yarn audit:batch` | Auditoria em lote de múltiplos sites |
| `yarn monitor:start` | Iniciar monitorização periódica |
| `yarn monitor:test` | Teste da monitorização |
| `yarn lint` | Verificar código |
| `yarn build` | Compilar TypeScript |

## 📁 **Estrutura de Relatórios**

```
reports/
├── accessmonitor-example-2024-01-15.html
├── accessmonitor-example-2024-01-15.json
└── batch/
    └── batch-report-2024-01-15.json
```

## 🎯 **Critérios Testados**

A ferramenta testa os **10 aspetos críticos de acessibilidade funcional** definidos pelo acessibilidade.gov.pt:

1. **1.1.1** - Conteúdo não textual
2. **1.4.3** - Contraste (mínimo)
3. **2.1.1** - Teclado
4. **2.4.1** - Mecanismos de navegação
5. **2.4.7** - Foco visível
6. **3.3.2** - Rótulos ou instruções
7. **4.1.2** - Nome, função e valor
8. **1.3.1** - Informação e relações
9. **2.2.1** - Ajustamento de tempo
10. **3.3.1** - Identificação de erros

## 🔍 **Fórmula de Pontuação**

A ferramenta usa a **mesma fórmula do AccessMonitor**:
- **Pontuação = 100 - (total de violações × 2)**
- Cada violação penaliza 2 pontos
- Pontuação mínima: 0

## 📝 **Licença**

MIT License - ver [LICENSE](LICENSE) para detalhes.

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

**Desenvolvido para reproduzir exatamente os critérios do [AccessMonitor](https://accessmonitor.acessibilidade.gov.pt/)**