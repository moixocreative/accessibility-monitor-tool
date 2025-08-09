# Understanding Reports - Como Interpretar Resultados

> 📊 **Guia completo para entender os relatórios de acessibilidade**

## 🎯 Tipos de Relatórios

### **Console Report (Padrão)**
```
🌐 RELATÓRIO DE ACESSIBILIDADE WCAG 2.1 AA
==========================================
📅 Data: 09/08/2025, 15:30:45
🔗 URL: https://www.example.com
🆔 ID da Auditoria: audit_1754751045123

📊 RESUMO EXECUTIVO
===================
📈 Score WCAG: 85% 🟢
📋 Total de Violações: 7
🔴 Críticas: 2
🟡 Sérias: 3
🔵 Moderadas: 1
🟢 Menores: 1

🚨 VIOLAÇÕES CRÍTICAS
=====================
1. [1.1.1] Imagens sem texto alternativo
   📍 Elementos afetados: 3
   🔧 Como corrigir: Adicionar atributos alt nas imagens
   
2. [2.1.1] Funcionalidade não acessível por teclado
   📍 Elementos afetados: 1
   🔧 Como corrigir: Adicionar tabindex ou handlers de teclado
```

### **HTML Report**
- ✅ **Visual e interativo**
- ✅ **Screenshots dos elementos com problemas**
- ✅ **Links diretos para guidelines**
- ✅ **Fácil de partilhar com stakeholders**

### **JSON Report**
- ✅ **Ideal para integração com outras ferramentas**
- ✅ **Formato estruturado para processamento automático**
- ✅ **CI/CD pipelines**

### **Markdown Report**
- ✅ **Documentação versionável**
- ✅ **Pull requests e wikis**
- ✅ **Fácil de ler e editar**

## 📊 Entendendo o Score WCAG

### **Score Range & Meaning:**
```
🟢 90-100% - Excelente conformidade
🟡 70-89%  - Boa conformidade (alguns ajustes necessários)
🟠 50-69%  - Conformidade moderada (ação requerida)
🔴 0-49%   - Conformidade baixa (ação urgente)
```

### **Como é Calculado:**
```typescript
// Algoritmo simplificado
const baseScore = 100;
let penalties = 0;

violations.forEach(violation => {
  const elementCount = violation.nodes.length;
  
  switch (violation.severity) {
    case 'critical': penalties += elementCount * 20; break;
    case 'serious':  penalties += elementCount * 10; break;
    case 'moderate': penalties += elementCount * 5;  break;
    case 'minor':    penalties += elementCount * 1;  break;
  }
});

const finalScore = Math.max(0, baseScore - penalties);
```

### **Fatores que Afetam o Score:**
- **Severidade das violações** (crítica > séria > moderada > menor)
- **Número de elementos afetados** (mais elementos = maior penalty)
- **Tipo de critério violado** (alguns critérios são mais importantes)

## 🚨 Tipos de Violações

### **🔴 Críticas (P0) - SLA: 2 horas**
Impedem o uso do site por pessoas com deficiência:

**Exemplos:**
- **[1.1.1]** Imagens sem texto alternativo
- **[1.4.3]** Contraste insuficiente (< 4.5:1)
- **[2.1.1]** Funcionalidade inacessível por teclado
- **[4.1.2]** Elementos sem nome acessível

**Impacto:**
- ❌ Utilizadores cegos não conseguem entender imagens
- ❌ Utilizadores com baixa visão não conseguem ler texto
- ❌ Utilizadores sem mouse não conseguem navegar
- ❌ Screen readers não conseguem identificar elementos

### **🟡 Sérias (P1) - SLA: 8 horas** 
Dificultam significativamente o uso:

**Exemplos:**
- **[1.3.1]** Estrutura de headings incorreta
- **[2.4.1]** Falta de skip links
- **[2.4.7]** Foco visual não visível
- **[3.1.1]** Idioma da página não declarado

**Impacto:**
- ⚠️ Navegação confusa para screen readers
- ⚠️ Dificuldade para saltar conteúdo
- ⚠️ Perda de contexto de foco
- ⚠️ Pronúncia incorreta por tecnologias assistivas

### **🔵 Moderadas (P2) - SLA: 24 horas**
Melhorias que aumentam a usabilidade:

**Exemplos:**
- **[1.4.10]** Falta de responsividade
- **[2.4.4]** Textos de link pouco descritivos
- **[3.2.2]** Mudanças de contexto inesperadas

**Impacto:**
- 📱 Problemas em dispositivos móveis
- 🔗 Links ambíguos ou pouco claros
- 🔄 Experiência de utilizador inconsistente

### **🟢 Menores (P3) - SLA: 1 semana**
Melhorias de qualidade e best practices:

**Exemplos:**
- **[2.4.2]** Título da página pouco descritivo
- **[3.1.2]** Idioma de partes do conteúdo
- **[1.4.12]** Espaçamento de texto

**Impacto:**
- 📄 SEO e identificação menos eficaz
- 🌍 Suporte multilíngue limitado
- 📝 Legibilidade reduzida

## 📋 Detalhes das Violações

### **Estrutura de uma Violação:**
```json
{
  "id": "image-alt",
  "impact": "critical",
  "description": "Images must have alternate text",
  "help": "Elements must have alternate text",
  "helpUrl": "https://dequeuniversity.com/rules/axe/4.4/image-alt",
  "nodes": [
    {
      "html": "<img src=\"logo.png\">",
      "target": ["#header > img"],
      "failureSummary": "Fix any of the following:\n  Element does not have an alt attribute"
    }
  ]
}
```

### **Campos Importantes:**
- **`id`**: Identificador da regra (mapeia para critério WCAG)
- **`impact`**: Severidade (critical, serious, moderate, minor)
- **`description`**: Descrição do problema
- **`helpUrl`**: Link para documentação detalhada
- **`nodes`**: Elementos específicos com o problema
- **`target`**: Seletor CSS para localizar o elemento

## 🎯 Exemplo: Interpretando um Relatório Real

### **Cenário: E-commerce com Score 73%**

```
📊 RESUMO EXECUTIVO
===================
📈 Score WCAG: 73% 🟡
📋 Total de Violações: 12
🔴 Críticas: 3
🟡 Sérias: 5  
🔵 Moderadas: 3
🟢 Menores: 1
```

### **Análise e Priorização:**

#### **🔥 Ação Imediata (Críticas):**
1. **Imagens de produtos sem alt** (9 elementos)
   - **Prioridade**: P0
   - **Esforço**: Baixo (adicionar alt attributes)
   - **Impacto**: Alto (produtos inacessíveis para cegos)

2. **Botão "Comprar" sem contraste** (1 elemento)
   - **Prioridade**: P0
   - **Esforço**: Baixo (ajustar cor)
   - **Impacto**: Alto (conversão inacessível)

3. **Dropdown menu sem teclado** (1 elemento)
   - **Prioridade**: P0
   - **Esforço**: Médio (implementar handlers)
   - **Impacto**: Alto (navegação impossível)

#### **📅 Próxima Sprint (Sérias):**
4. **Headings fora de ordem** (estrutural)
5. **Links "clique aqui"** (5 elementos)
6. **Falta de skip link** (navegação)

#### **📆 Roadmap (Moderadas/Menores):**
7. **Responsividade mobile**
8. **Títulos de página genéricos**

### **Estimativa de Impacto:**
```
Correção das 3 críticas:  73% → ~88% 🟢
Correção das 5 sérias:    88% → ~94% 🟢
Correção completa:        94% → ~98% 🟢
```

## 📈 Acompanhar Progresso

### **Multi-page Reports:**
```
🕷️ RELATÓRIO MULTI-PÁGINA
==========================
🌐 Site: https://www.example.com
📊 Páginas analisadas: 15/20
⏱️ Tempo total: 8m 32s

📊 SCORES POR PÁGINA
===================
Homepage:           95% 🟢
Produtos:           78% 🟡  ← Precisa atenção
Checkout:           65% 🟠  ← Crítico
Contacto:           92% 🟢
FAQ:                88% 🟢

📊 CONSOLIDADO
===============
Score médio:        84% 🟡
Violações totais:   47
Páginas críticas:   2 (Checkout, Produtos)
```

### **Portfolio Reports:**
```
📋 RELATÓRIO DE PORTFOLIO
=========================
🏢 Portfolio: Empresa XYZ
📊 Sites monitorizados: 5
📅 Última auditoria: 09/08/2025

📊 RESUMO POR SITE
==================
🌐 Site Principal:     92% 🟢 (↑ 3%)
🛒 E-commerce:         78% 🟡 (↓ 2%) 
📱 App Mobile:         85% 🟡 (→ 0%)
📖 Documentação:       96% 🟢 (↑ 1%)
🎧 Suporte:           82% 🟡 (↑ 5%)

📊 TENDÊNCIAS (30 dias)
=======================
Média do portfolio:   86.6% 🟡
Tendência geral:      ↗️ Melhorando (+2.1%)
Sites em risco:       1 (E-commerce)
```

## 🔧 Ações Recomendadas por Score

### **Score 90-100% 🟢**
- ✅ **Manter**: Excelente conformidade
- 🔄 **Monitorizar**: Auditorias regulares
- 📈 **Otimizar**: Performance e UX

### **Score 70-89% 🟡**
- 🎯 **Focar**: Violações críticas primeiro
- 📅 **Planear**: Correções nas próximas 2 sprints
- 📊 **Medir**: Progress semanal

### **Score 50-69% 🟠**
- 🚨 **Ação urgente**: Plano de correção imediato
- 👥 **Envolver**: Equipa de UX/development
- 📋 **Priorizar**: Top 10 violações mais impactantes

### **Score 0-49% 🔴**
- 🆘 **Emergência**: Pode haver questões legais
- 🔒 **Considerar**: Restringir acesso até correção
- 👨‍💼 **Escalar**: Management e legal teams

## 📚 Recursos Adicionais

### **Para Designers:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Accessible Colors](https://accessible-colors.com/)
- [Color Oracle](https://colororacle.org/) (simulador de daltonismo)

### **Para Developers:**
- [axe-core GitHub](https://github.com/dequelabs/axe-core)
- [WAVE Web Accessibility Evaluation Tool](https://wave.webaim.org/)
- [a11y Project](https://a11yproject.com/)

### **Para QA:**
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Testing com Screen Readers](https://webaim.org/articles/screenreader_testing/)

---

**📊 Agora já sabes interpretar qualquer relatório de acessibilidade!**
