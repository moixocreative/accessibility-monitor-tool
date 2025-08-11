import { WCAGValidator } from './src/validation/wcag-validator';

async function testThreePages(): Promise<void> {
  console.log('🧪 Testando 3 páginas da Casa de Investimentos...');
  
  const validator = new WCAGValidator();
  
  const pages = [
    {
      url: 'https://www.casadeinvestimentos.pt/contas-de-gestao-individual',
      name: 'contas-gestao-individual'
    },
    {
      url: 'https://www.casadeinvestimentos.pt/filosofia-e-processo-de-investimento',
      name: 'filosofia-processo-investimento'
    },
    {
      url: 'https://www.casadeinvestimentos.pt/historia',
      name: 'historia'
    }
  ];
  
  try {
    for (const page of pages) {
      console.log(`\n📊 Testando: ${page.name}`);
      console.log(`🌐 URL: ${page.url}`);
      
      const result = await validator.auditSite(
        page.url,
        page.name,
        false, // isCompleteAudit
        true   // useStandardFormula
      );
      
      console.log(`✅ ${page.name} - Score: ${result.wcagScore}/10`);
      console.log(`🚨 Violações: ${result.violations.length}`);
      
      if (result.checklistResults) {
        console.log(`📋 Checklist: ${result.checklistResults.passedItems}/${result.checklistResults.totalItems} (${result.checklistResults.percentage}%)`);
      }
      
      console.log(`📄 Relatório gerado automaticamente para: ${page.name}`);
    }
    
    console.log('\n✨ Todos os 3 relatórios foram gerados com sucesso!');
    console.log('📁 Verificar diretório "reports" para os relatórios HTML');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await validator.close();
  }
}

testThreePages();
