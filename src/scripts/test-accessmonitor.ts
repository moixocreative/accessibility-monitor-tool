#!/usr/bin/env ts-node

import { WCAGValidator } from '../validation/wcag-validator';
import { logger } from '../utils/logger';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const url = args[0];
  
  if (!url) {
    console.log('Uso: yarn test:accessmonitor <URL>');
    console.log('Exemplo: yarn test:accessmonitor https://example.com');
    process.exit(1);
  }
  
  console.log(`🔍 Testando AccessMonitorValidator com: ${url}`);
  
  const validator = new WCAGValidator();
  
  try {
    // Usar AccessMonitorValidator (fórmula universal)
    const result = await validator.auditSite(url, 'test', true, false, 'untile', undefined, true, true);
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 RESULTADO ACCESSMONITOR VALIDATOR');
    console.log('='.repeat(80));
    console.log(`🌐 URL: ${url}`);
    console.log(`📊 Score: ${result.wcagScore}/10`);
    console.log(`🚨 Total violações: ${result.violations.length}`);
    console.log(`⚖️ Violações críticas: ${result.violations.filter(v => v.severity === 'critical').length}`);
    console.log(`⚠️ Violações sérias: ${result.violations.filter(v => v.severity === 'serious').length}`);
    console.log(`📋 Violações moderadas: ${result.violations.filter(v => v.severity === 'moderate').length}`);
    
    if (result.violations.length > 0) {
      console.log('\n🚨 VIOLAÇÕES DETECTADAS:');
      console.log('─'.repeat(80));
      result.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.criteria.name} (${violation.severity})`);
        console.log(`   Critério: ${violation.criteria.id}`);
        console.log(`   Descrição: ${violation.description}`);
        console.log('');
      });
    }
    
    console.log('='.repeat(80));
    
  } catch (error) {
    logger.error('❌ Erro no teste:', error);
    process.exit(1);
  } finally {
    await validator.close();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}
