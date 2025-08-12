#!/usr/bin/env ts-node

import { AccessibilityAuditor } from './accessibility-audit';

async function main() {
  console.log('🔍 Testando Auditor de Acessibilidade Melhorado');
  console.log('===============================================\n');

  const auditor = new AccessibilityAuditor();

  // Teste de página única
  console.log('📄 Testando página única...');
  try {
    await auditor.auditSinglePage('https://www.casadeinvestimentos.pt/historia');
    console.log('✅ Teste de página única concluído\n');
  } catch (error) {
    console.error('❌ Erro no teste de página única:', error);
  }

  // Teste de site completo (limitado a 5 páginas para demonstração)
  console.log('🌐 Testando site completo (limitado a 20 páginas)...');
  try {
    await auditor.auditFullSite('https://www.casadeinvestimentos.pt', {
      maxPages: 20,
      generateIndividualReports: true
    });
    console.log('✅ Teste de site completo concluído\n');
  } catch (error) {
    console.error('❌ Erro no teste de site completo:', error);
  }

  console.log('🎉 Todos os testes concluídos!');
  console.log('📁 Verifique a pasta "reports" para os relatórios gerados.');
}

if (require.main === module) {
  main().catch(console.error);
}
