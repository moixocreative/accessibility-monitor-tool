module.exports = {
  extends: [],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nova funcionalidade
        'fix',      // Correção de bug
        'docs',     // Documentação
        'style',    // Formatação, ponto e vírgula, etc.
        'refactor', // Refatoração
        'perf',     // Melhoria de performance
        'test',     // Adicionar ou corrigir testes
        'chore',    // Tarefas de build, configuração, etc.
        'ci',       // Mudanças em CI/CD
        'revert',   // Reverter commit
        'accessibility', // Melhorias de acessibilidade
        'emergency',    // Correções de emergência
        'monitoring',   // Melhorias de monitorização
        'wcag',         // Conformidade WCAG
      ],
    ],
    'type-case': [2, 'always', 'lowercase'],
    'type-empty': [2, 'never'],
    'subject-case': [2, 'always', 'lowercase'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
  },
}; 