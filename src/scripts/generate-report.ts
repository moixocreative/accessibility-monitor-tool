#!/usr/bin/env ts-node

import { PortfolioMonitor } from '../monitoring/portfolio-monitor';
import { EmergencyResponse } from '../emergency/emergency-response';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const reportType = args[0];
  const version = args.find(arg => arg.startsWith('--version='))?.split('=')[1];
  const branch = args.find(arg => arg.startsWith('--branch='))?.split('=')[1];

  logger.info('Gerador de Relatórios UNTILE');

  const portfolioMonitor = new PortfolioMonitor();
  const emergencyResponse = new EmergencyResponse();

  // Configurar timeout mais longo
  const timeout = setTimeout(() => {
    logger.error('Timeout na geração de relatório');
    process.exit(1);
  }, 300000); // 5 minutos

  try {
    switch (reportType) {
      case '--test':
        await generateTestReport(portfolioMonitor, emergencyResponse);
        break;
      
      case '--release':
        await generateReleaseReport(portfolioMonitor, emergencyResponse, version);
        break;
      
      case '--deploy':
        await generateDeployReport(portfolioMonitor, emergencyResponse, branch);
        break;
      
      default:
        await showHelp();
        break;
    }

  } catch (error) {
    logger.error('Erro na geração de relatório:', error);
    process.exit(1);
  } finally {
    clearTimeout(timeout);
    await portfolioMonitor.cleanup();
  }
}

async function generateTestReport(portfolioMonitor: PortfolioMonitor, emergencyResponse: EmergencyResponse) {
  console.log('\n📊 GERANDO RELATÓRIO DE TESTES');
  console.log('================================');

  const stats = portfolioMonitor.getPortfolioStats();
  const emergencyReport = emergencyResponse.generateEmergencyReport();

  const report = {
    timestamp: new Date(),
    type: 'test',
    portfolio: stats,
    emergency: emergencyReport,
    summary: {
      totalSites: stats.totalSites,
      averageScore: stats.averageScore,
      totalViolations: stats.totalViolations,
      criticalViolations: stats.criticalViolations,
      compliancePercentage: stats.compliancePercentage,
      totalIncidents: emergencyReport.totalIncidents,
      slaBreaches: emergencyReport.slaBreaches
    }
  };

  // Salvar relatório
  const reportPath = path.join('reports', `test-report-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('✅ Relatório de testes gerado:', reportPath);
  console.log('\n📈 RESUMO:');
  console.log(`  Sites: ${stats.totalSites}`);
  console.log(`  Score médio: ${stats.averageScore}%`);
  console.log(`  Violações: ${stats.totalViolations}`);
  console.log(`  Incidentes: ${emergencyReport.totalIncidents}`);
  console.log(`  SLA breaches: ${emergencyReport.slaBreaches}`);
}

async function generateReleaseReport(portfolioMonitor: PortfolioMonitor, emergencyResponse: EmergencyResponse, version?: string) {
  console.log('\n📊 GERANDO RELATÓRIO DE RELEASE');
  console.log('=================================');

  const stats = portfolioMonitor.getPortfolioStats();
  const emergencyReport = emergencyResponse.generateEmergencyReport();

  const report = {
    timestamp: new Date(),
    type: 'release',
    version: version || 'unknown',
    portfolio: stats,
    emergency: emergencyReport,
    releaseChecks: {
      wcagCompliance: stats.averageScore >= 80,
      criticalViolations: stats.criticalViolations === 0,
      slaBreaches: emergencyReport.slaBreaches === 0,
      activeIncidents: emergencyResponse.getActiveIncidents().length === 0,
      releaseReady: stats.averageScore >= 80 && stats.criticalViolations === 0
    },
    summary: {
      releaseReady: stats.averageScore >= 80 && stats.criticalViolations === 0,
      totalSites: stats.totalSites,
      averageScore: stats.averageScore,
      criticalViolations: stats.criticalViolations,
      compliancePercentage: stats.compliancePercentage,
      totalIncidents: emergencyReport.totalIncidents,
      slaBreaches: emergencyReport.slaBreaches
    }
  };

  // Salvar relatório
  const reportPath = path.join('reports', `release-report-${version || Date.now()}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('✅ Relatório de release gerado:', reportPath);
  console.log('\n📈 RESUMO:');
  console.log(`  Versão: ${version || 'N/A'}`);
  console.log(`  Sites: ${stats.totalSites}`);
  console.log(`  Score médio: ${stats.averageScore}%`);
  console.log(`  Violações críticas: ${stats.criticalViolations}`);
  console.log(`  Release ready: ${report.releaseChecks.releaseReady ? '✅ SIM' : '❌ NÃO'}`);
}

async function generateDeployReport(portfolioMonitor: PortfolioMonitor, emergencyResponse: EmergencyResponse, branch?: string) {
  console.log('\n📊 GERANDO RELATÓRIO DE DEPLOY');
  console.log('================================');

  const stats = portfolioMonitor.getPortfolioStats();
  const emergencyReport = emergencyResponse.generateEmergencyReport();

  const report = {
    timestamp: new Date(),
    type: 'deploy',
    branch: branch || 'unknown',
    portfolio: stats,
    emergency: emergencyReport,
    deployChecks: {
      wcagCompliance: stats.averageScore >= 80,
      criticalViolations: stats.criticalViolations === 0,
      slaBreaches: emergencyReport.slaBreaches === 0,
      activeIncidents: emergencyResponse.getActiveIncidents().length === 0,
      deployReady: stats.averageScore >= 80 && stats.criticalViolations === 0
    },
    summary: {
      deployReady: stats.averageScore >= 80 && stats.criticalViolations === 0,
      totalSites: stats.totalSites,
      averageScore: stats.averageScore,
      criticalViolations: stats.criticalViolations,
      compliancePercentage: stats.compliancePercentage,
      totalIncidents: emergencyReport.totalIncidents,
      slaBreaches: emergencyReport.slaBreaches
    }
  };

  // Salvar relatório
  const reportPath = path.join('reports', `deploy-report-${branch || Date.now()}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('✅ Relatório de deploy gerado:', reportPath);
  console.log('\n📈 RESUMO:');
  console.log(`  Branch: ${branch || 'N/A'}`);
  console.log(`  Sites: ${stats.totalSites}`);
  console.log(`  Score médio: ${stats.averageScore}%`);
  console.log(`  Violações críticas: ${stats.criticalViolations}`);
  console.log(`  Deploy ready: ${report.deployChecks.deployReady ? '✅ SIM' : '❌ NÃO'}`);
}

async function showHelp() {
  console.log('\n📊 GERADOR DE RELATÓRIOS UNTILE');
  console.log('==================================');
  console.log('\nTipos de relatório disponíveis:');
  console.log('  --test                    Relatório de testes');
  console.log('  --release --version=X.X.X Relatório de release');
  console.log('  --deploy --branch=name    Relatório de deploy');
  console.log('\nExemplos:');
  console.log('  yarn report --test');
  console.log('  yarn report --release --version=1.0.0');
  console.log('  yarn report --deploy --branch=development');
}

if (require.main === module) {
  main().catch(error => {
    logger.error('Erro fatal:', error);
    process.exit(1);
  });
} 