# Análise Comparativa: AccessMonitor vs Nossa Ferramenta

## Resumo dos Resultados Esperados (AccessMonitor)

### 1. Contas de Gestão Individual
- **Pontuação**: 8.1/10
- **Principais Violações**:
  - Skip link ausente (2.4.1)
  - Hierarquia de cabeçalhos incorreta (1.3.1, 2.4.10)
  - Contraste insuficiente: 14 combinações (1.4.3)
  - IDs duplicados: 1 (4.1.1)
  - Label incorreto: 1 (2.5.3)
  - Landmark contentinfo mal posicionado

### 2. História
- **Pontuação**: 7.8/10
- **Principais Violações**:
  - Skip link ausente (2.4.1)
  - Hierarquia de cabeçalhos incorreta (1.3.1, 2.4.10)
  - Contraste insuficiente: 27 combinações (1.4.3)
  - IDs duplicados: 2 (4.1.1)
  - Elemento scrollable não acessível por teclado (2.1.1)
  - Label incorreto: 1 (2.5.3)
  - Landmark contentinfo mal posicionado

### 3. Filosofia e Processo de Investimento
- **Pontuação**: 8.0/10
- **Principais Violações**:
  - Skip link ausente (2.4.1)
  - Hierarquia de cabeçalhos incorreta (1.3.1, 2.4.10)
  - Múltiplos h1: 2 cabeçalhos nível 1 (1.3.1)
  - Uso incorreto de <br> para listas (1.3.1)
  - Contraste insuficiente: 30 combinações (1.4.3)
  - IDs duplicados: 2 (4.1.1)
  - Label incorreto: 1 (2.5.3)
  - Landmark contentinfo mal posicionado

## Padrões Comuns Identificados

### Violações Críticas (Erros):
1. **Skip Link Ausente** (2.4.1) - Todas as páginas
2. **Hierarquia de Cabeçalhos** (1.3.1, 2.4.10) - Todas as páginas
3. **Contraste Insuficiente** (1.4.3) - Todas as páginas
4. **IDs Duplicados** (4.1.1) - Todas as páginas
5. **Labels Incorretos** (2.5.3) - Todas as páginas
6. **Landmark contentinfo mal posicionado** - Todas as páginas

### Violações Moderadas (Avisos):
1. **Contraste Otimizado** (1.4.6) - Todas as páginas
2. **Especificação de Cores CSS** (1.4.3, 1.4.6, 1.4.8) - Todas as páginas

### Critérios Cumpridos:
1. **Imagens com Alt** (1.1.1) - Todas as páginas
2. **Formulários com Botões** (3.2.2) - Todas as páginas
3. **HTML Válido** (4.1.1) - Todas as páginas
4. **Estrutura Semântica** (1.3.1) - Maioria dos elementos
5. **ARIA Válido** - Todas as páginas

## Implicações para Nossa Ferramenta

### 1. Fórmula de Pontuação
- AccessMonitor usa uma fórmula específica que resulta em pontuações entre 7.8-8.1
- Nossa ferramenta deve replicar exatamente esta fórmula

### 2. Detecção de Violações
- **Skip Links**: Deve detectar ausência de links para #main, #content
- **Hierarquia de Cabeçalhos**: Deve verificar sequência lógica h1 → h2 → h3
- **Contraste**: Deve usar fórmula WCAG 4.5:1 para texto normal, 3:1 para texto grande
- **IDs Duplicados**: Deve verificar atributos id únicos
- **Labels**: Deve verificar associação label-input correta
- **Landmarks**: Deve verificar posicionamento semântico correto

### 3. Critérios de Classificação
- **Plenamente Conforme**: >9.0 (nenhuma página atinge)
- **Parcialmente Conforme**: 8.0-9.0 (todas as páginas)
- **Não Conforme**: <8.0 (nenhuma página)

## Próximos Passos

1. **Implementar detecção específica** das violações encontradas pelo AccessMonitor
2. **Ajustar fórmula de pontuação** para replicar resultados exatos
3. **Testar com as 3 páginas** para validar correspondência
4. **Implementar relatórios detalhados** por tipo de violação
