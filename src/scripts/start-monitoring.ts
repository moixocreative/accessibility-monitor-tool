#!/usr/bin/env ts-node

import { PortfolioMonitor } from '../monitoring/portfolio-monitor';
import { EmergencyResponse } from '../emergency/emergency-response';
import { logger } from '../utils/logger';

async function main() {
  logger.info('🚀 Iniciando sistema de monitorização periódica UNTILE');

  const portfolioMonitor = new PortfolioMonitor();
  const emergencyResponse = new EmergencyResponse();

  try {
    // Verificar configuração
    const monitoringStats = portfolioMonitor.getMonitoringStats();
    
    console.log('\n📊 CONFIGURAÇÃO DA MONITORIZAÇÃO');
    console.log('==================================');
    console.log(`Intervalo: ${monitoringStats.interval}`);
    console.log(`Ativo: ${monitoringStats.isActive ? '✅ Sim' : '❌ Não'}`);
    console.log(`Próxima execução: ${monitoringStats.nextRun?.toLocaleString('pt-PT') || 'N/A'}`);

    // Iniciar monitorização contínua
    portfolioMonitor.startMonitoring();

    // Executar auditoria inicial imediatamente
    console.log('\n🔍 Executando auditoria inicial...');
    await portfolioMonitor.runPortfolioAudit();

    // Verificar SLA breaches
    const slaBreaches = emergencyResponse.checkSLABreaches();
    if (slaBreaches.length > 0) {
      console.log(`\n⚠️  ${slaBreaches.length} incidentes com SLA excedido`);
    }

    // Mostrar estatísticas do portfolio
    const stats = portfolioMonitor.getPortfolioStats();
    console.log('\n📈 ESTATÍSTICAS DO PORTFOLIO');
    console.log('==============================');
    console.log(`Total de sites: ${stats.totalSites}`);
    console.log(`Score médio WCAG: ${stats.averageScore}%`);
    console.log(`Total de violações: ${stats.totalViolations}`);
    console.log(`Violações críticas: ${stats.criticalViolations}`);

    // Manter processo ativo
    console.log('\n🔄 Sistema de monitorização ativo. Pressione Ctrl+C para parar.');
    
    process.on('SIGINT', async () => {
      console.log('\n🛑 Recebido sinal de paragem, limpando recursos...');
      await portfolioMonitor.cleanup();
      console.log('✅ Sistema parado com sucesso');
      process.exit(0);
    });

    // Log periódico de status
    setInterval(() => {
      const currentStats = portfolioMonitor.getMonitoringStats();
      logger.info('Status da monitorização', {
        isActive: currentStats.isActive,
        nextRun: currentStats.nextRun?.toISOString(),
        lastRun: currentStats.lastRun?.toISOString()
      });
    }, 300000); // A cada 5 minutos

  } catch (error) {
    logger.error('Erro no sistema de monitorização:', error);
    console.error('❌ Erro fatal:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro não tratado:', error);
    process.exit(1);
  });
}

export { main as startMonitoring };
