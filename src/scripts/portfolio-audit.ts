#!/usr/bin/env ts-node

import { PortfolioMonitor } from '../monitoring/portfolio-monitor';
import { HTMLReportGenerator } from '../reports/html-report-generator';
import { logger } from '../utils/logger';

async function main() {
  logger.info('Iniciando auditoria do portfolio UNTILE');

  const portfolioMonitor = new PortfolioMonitor();

  try {
    // Executar auditoria completa
    await portfolioMonitor.runPortfolioAudit();

    // Obter estatísticas
    const stats = portfolioMonitor.getPortfolioStats();
    
    console.log('\n📊 ESTATÍSTICAS DO PORTFOLIO');
    console.log('================================');
    console.log(`Total de sites: ${stats.totalSites}`);
    console.log(`Score médio WCAG: ${stats.averageScore}%`);
    console.log(`Total de violações: ${stats.totalViolations}`);
    console.log(`Violações críticas: ${stats.criticalViolations}`);
    console.log(`Conformidade: ${stats.compliancePercentage}%`);

    // Obter sites
    const sites = portfolioMonitor.getSites();
    
    console.log('\n🌐 SITES DO PORTFOLIO');
    console.log('=======================');
    sites.forEach(site => {
      console.log(`\n${site.name} (${site.technology})`);
      console.log(`  URL: ${site.url}`);
      console.log(`  Score WCAG: ${site.wcagScore}%`);
      console.log(`  Violações: ${site.violations.length}`);
      console.log(`  Última auditoria: ${site.lastAudit.toLocaleString('pt-PT')}`);
      
      if (site.violations.length > 0) {
        console.log('  Violações:');
        site.violations.forEach(violation => {
          console.log(`    - ${violation.criteria.name} (${violation.criteria.id}): ${violation.severity}`);
        });
      }
    });

    logger.info('Auditoria do portfolio concluída');

    // Gerar relatório HTML do portfólio
    try {
      const reportGenerator = new HTMLReportGenerator();
      
      // Preparar dados para o relatório
      const reportData = {
        baseUrl: 'Portfolio UNTILE',
        totalPages: sites.length,
        pagesAudited: sites.length,
        startTime: new Date(),
        endTime: new Date(),
        pageResults: sites.map(site => ({
          id: `site_${Date.now()}`,
          siteId: site.name,
          timestamp: site.lastAudit,
          wcagScore: site.wcagScore / 10, // Converter de % para escala 0-10
          violations: site.violations,
          lighthouseScore: {
            performance: 0,
            accessibility: site.wcagScore,
            bestPractices: 0,
            seo: 0
          },
          axeResults: { 
            url: site.url,
            violations: [],
            passes: [],
            incomplete: [],
            inapplicable: []
          },
          summary: {
            totalViolations: site.violations.length,
            criticalViolations: site.violations.filter(v => v.severity === 'critical').length,
            priorityViolations: site.violations.filter(v => v.severity === 'critical' || v.severity === 'serious').length,
            compliancePercentage: Math.max(0, 100 - (site.violations.length * 10))
          }
        })),
        overallCompliance: (stats.compliancePercentage >= 75 ? 'PLENAMENTE CONFORME' : 
                          stats.compliancePercentage >= 50 ? 'PARCIALMENTE CONFORME' : 'NÃO CONFORME') as 'PLENAMENTE CONFORME' | 'PARCIALMENTE CONFORME' | 'NÃO CONFORME',
        complianceDetails: {
          wcagScore: stats.averageScore / 10,
          checklistPercentage: stats.compliancePercentage,
          reason: `Portfolio com ${stats.compliancePercentage}% de conformidade`
        },
        summary: {
          averageScore: stats.averageScore / 10,
          totalViolations: stats.totalViolations,
          violationsBySeverity: {
            critical: stats.criticalViolations,
            serious: 0, // Seria necessário calcular
            moderate: 0, // Seria necessário calcular
            minor: 0 // Seria necessário calcular
          },
          violationsByType: {}
        }
      };
      
      const reportPath = await reportGenerator.generateMultiPageReport(reportData);
      logger.info(`📄 Relatório HTML do portfólio gerado: ${reportPath}`);
    } catch (error) {
      logger.warn('Erro ao gerar relatório HTML do portfólio:', error);
    }

  } catch (error) {
    logger.error('Erro na auditoria do portfolio:', error);
    process.exit(1);
  } finally {
    await portfolioMonitor.cleanup();
  }
}

if (require.main === module) {
  main().catch(error => {
    logger.error('Erro fatal:', error);
    process.exit(1);
  });
} 