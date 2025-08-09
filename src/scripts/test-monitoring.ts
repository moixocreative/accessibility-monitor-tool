#!/usr/bin/env ts-node

import { PortfolioMonitor } from '../monitoring/portfolio-monitor';
import { logger } from '../utils/logger';

async function main() {
  logger.info('🧪 Testando sistema de monitorização periódica');

  const portfolioMonitor = new PortfolioMonitor();

  try {
    // Testar configuração
    console.log('\n📊 TESTE DE CONFIGURAÇÃO');
    console.log('==========================');
    
    const monitoringStats = portfolioMonitor.getMonitoringStats();
    console.log(`Intervalo configurado: ${monitoringStats.interval}`);
    console.log(`Monitorização ativa: ${monitoringStats.isActive ? '✅ Sim' : '❌ Não'}`);
    console.log(`Próxima execução: ${monitoringStats.nextRun?.toLocaleString('pt-PT') || 'N/A'}`);

    // Testar validação de expressões cron
    console.log('\n🔍 TESTE DE VALIDAÇÃO CRON');
    console.log('============================');
    
    const testExpressions = [
      '0 */6 * * *',      // A cada 6 horas
      '0 0 * * *',        // Diariamente à meia-noite
      '0 */12 * * *',     // A cada 12 horas
      '0 9,18 * * *',     // Duas vezes por dia
      'invalid-cron',     // Inválida
      '0 0 * * 1'         // Semanalmente
    ];

    testExpressions.forEach(expr => {
      try {
        const { validateCronExpression } = require('cron');
        const validation = validateCronExpression(expr);
        console.log(`${expr}: ${validation.valid ? '✅ Válida' : '❌ Inválida'}`);
        if (!validation.valid) {
          console.log(`  Erro: ${validation.error}`);
        }
      } catch (error) {
        console.log(`${expr}: ❌ Erro na validação`);
      }
    });

    // Testar auditoria única
    console.log('\n🔍 TESTE DE AUDITORIA ÚNICA');
    console.log('=============================');
    
    console.log('Executando auditoria completa do portfolio...');
    await portfolioMonitor.runPortfolioAudit();
    
    const stats = portfolioMonitor.getPortfolioStats();
    console.log(`✅ Auditoria concluída:`);
    console.log(`  - Sites auditados: ${stats.totalSites}`);
    console.log(`  - Score médio: ${stats.averageScore}%`);
    console.log(`  - Violações: ${stats.totalViolations}`);
    console.log(`  - Críticas: ${stats.criticalViolations}`);

    // Testar monitorização (por 30 segundos)
    console.log('\n🔄 TESTE DE MONITORIZAÇÃO (30 segundos)');
    console.log('========================================');
    
    portfolioMonitor.startMonitoring();
    console.log('✅ Monitorização iniciada');
    
    // Aguardar 30 segundos
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    const finalStats = portfolioMonitor.getMonitoringStats();
    console.log('✅ Teste concluído:');
    console.log(`  - Monitorização ativa: ${finalStats.isActive ? 'Sim' : 'Não'}`);
    console.log(`  - Próxima execução: ${finalStats.nextRun?.toLocaleString('pt-PT') || 'N/A'}`);
    console.log(`  - Última execução: ${finalStats.lastRun?.toLocaleString('pt-PT') || 'N/A'}`);

    // Parar monitorização
    portfolioMonitor.stopMonitoring();
    console.log('✅ Monitorização parada');

    console.log('\n🎉 Todos os testes concluídos com sucesso!');

  } catch (error) {
    logger.error('Erro no teste de monitorização:', error);
    console.error('❌ Erro no teste:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await portfolioMonitor.cleanup();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro não tratado:', error);
    process.exit(1);
  });
}

export { main as testMonitoring };
