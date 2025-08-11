import { WCAGValidator } from '../validation/wcag-validator';
import { HTMLReportGenerator } from '../reports/html-report-generator';
import { logger } from '../utils/logger';
import { PageCrawler } from '../crawler/page-crawler';

class FullSiteTest {
  private validator: WCAGValidator;
  private htmlGenerator: HTMLReportGenerator;
  private crawler: PageCrawler;

  constructor() {
    this.validator = new WCAGValidator();
    this.htmlGenerator = new HTMLReportGenerator();
    this.crawler = new PageCrawler();
  }

  async run(url: string, maxPages: number = 20): Promise<void> {
    logger.info(`🔍 Iniciando teste completo do site: ${url}`);
    logger.info(`📊 Máximo de páginas: ${maxPages}`);

    // 1. Descobrir páginas do site
    logger.info('🌐 Descobrindo páginas do site...');
    const discoveredPages = await this.crawler.discoverPages(url, 'comprehensive', maxPages);
    logger.info(`📄 Páginas descobertas: ${discoveredPages.length}`);

    // 2. Testar páginas com gestão de recursos
    const results: any[] = [];
    let totalScore = 0;
    let totalViolations = 0;

    for (let i = 0; i < discoveredPages.length; i++) {
      const pageUrl = discoveredPages[i];
      try {
        logger.info(`📄 Testando página ${i + 1}/${discoveredPages.length}: ${pageUrl}`);
        
        // Testar com timeout e retry
        const result = await this.testPageWithRetry(pageUrl, 3);
        results.push(result);
        totalScore += result.wcagScore || 0;
        totalViolations += result.violations.length;
        
        logger.info(`✅ ${pageUrl} - Score: ${result.wcagScore || 0}/10 - Violações: ${result.violations.length}`);
        
        // Pausa entre páginas para não sobrecarregar
        if (i < discoveredPages.length - 1) {
          await this.sleep(2000); // 2 segundos entre páginas
        }
        
      } catch (error) {
        logger.error(`❌ Erro ao testar ${pageUrl}:`, error);
        // Continuar com as próximas páginas mesmo se uma falhar
      }
    }

    // 3. Calcular estatísticas
    const averageScore = totalScore / results.length;
    const complianceLevel = this.calculateOverallCompliance(averageScore, results);

    // 4. Gerar relatório detalhado
    const reportData = {
      baseUrl: url,
      totalPages: discoveredPages.length,
      pagesAudited: results.length,
      startTime: new Date(),
      endTime: new Date(),
      pageResults: results,
      overallCompliance: complianceLevel,
      complianceDetails: {
        wcagScore: averageScore,
        checklistPercentage: this.calculateChecklistPercentage(results),
        reason: `Pontuação média: ${averageScore.toFixed(2)}/10`
      },
      summary: {
        averageScore,
        totalViolations,
        violationsBySeverity: this.calculateViolationsBySeverity(results),
        violationsByType: this.calculateViolationsByType(results)
      }
    };

    // 5. Gerar relatório HTML
    const reportPath = await this.htmlGenerator.generateMultiPageReport(reportData);
    logger.info(`📄 Relatório HTML gerado: ${reportPath}`);

    // 6. Mostrar resumo
    this.showSummary(reportData, reportPath);
  }

  private async testPageWithRetry(url: string, maxRetries: number): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`🎯 Tentativa ${attempt}/${maxRetries} para ${url}`);
        
        // Usar timeout para evitar que encrave
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 30000); // 30 segundos timeout
        });
        
        const testPromise = this.validator.auditSite(
          url, 
          'site-audit', 
          true, 
          false, 
          'untile', 
          undefined, 
          false, 
          true
        );
        
        const result = await Promise.race([testPromise, timeoutPromise]) as any;
        return result;
        
      } catch (error) {
        logger.warn(`⚠️ Tentativa ${attempt} falhou para ${url}:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        await this.sleep(1000 * attempt); // Backoff exponencial
      }
    }
  }

  private calculateOverallCompliance(averageScore: number, results: any[]): 'PLENAMENTE CONFORME' | 'PARCIALMENTE CONFORME' | 'NÃO CONFORME' {
    // Verificar se TODAS as páginas têm score > 9 (para Plenamente Conforme)
    const allPagesAbove9 = results.every(r => (r.wcagScore || 0) > 9);
    
    // Verificar se TODAS as páginas têm score > 8 (para Parcialmente Conforme)
    const allPagesAbove8 = results.every(r => (r.wcagScore || 0) > 8);
    
    const checklistPercentage = this.calculateChecklistPercentage(results);
    
    if (allPagesAbove9 && checklistPercentage >= 75) {
      return 'PLENAMENTE CONFORME';
    } else if (allPagesAbove8 && checklistPercentage >= 50 && checklistPercentage < 75) {
      return 'PARCIALMENTE CONFORME';
    } else {
      return 'NÃO CONFORME';
    }
  }

  private calculateChecklistPercentage(results: any[]): number {
    // Calcular percentagem baseada nos 10 aspetos críticos
    const criticalCriteriaIds = [
      '1.1.1', '1.4.3', '2.1.1', '2.4.1', '2.4.7', 
      '3.3.2', '4.1.2', '1.3.1', '2.2.1', '3.3.1'
    ];
    
    let passedCriteria = 0;
    criticalCriteriaIds.forEach(criteriaId => {
      const hasViolation = results.some(page => 
        page.violations.some((v: any) => v.criteria?.id === criteriaId)
      );
      if (!hasViolation) {
        passedCriteria++;
      }
    });
    
    return (passedCriteria / criticalCriteriaIds.length) * 100;
  }

  private calculateViolationsBySeverity(results: any[]): Record<string, number> {
    const severityCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
    
    results.forEach(page => {
      page.violations.forEach((violation: any) => {
        const severity = violation.severity || 'moderate';
        if (severityCounts[severity as keyof typeof severityCounts] !== undefined) {
          severityCounts[severity as keyof typeof severityCounts]++;
        }
      });
    });
    
    return severityCounts;
  }

  private calculateViolationsByType(results: any[]): Record<string, number> {
    const typeCounts: Record<string, number> = {};
    
    results.forEach(page => {
      page.violations.forEach((violation: any) => {
        const type = violation.criteria?.name || 'Unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
    });
    
    return typeCounts;
  }

  private showSummary(reportData: any, reportPath: string): void {
    console.log('\n================================================================================');
    console.log('🔍 RELATÓRIO ACCESSMONITOR - SITE COMPLETO');
    console.log('================================================================================');
    console.log(`🌐 Site: ${reportData.baseUrl}`);
    console.log(`📅 Data: ${new Date().toLocaleString('pt-PT')}`);
    console.log(`📊 Páginas descobertas: ${reportData.totalPages}`);
    console.log(`📊 Páginas auditadas: ${reportData.pagesAudited}`);
    console.log(`📈 Pontuação média: ${reportData.summary.averageScore.toFixed(2)}/10`);
    console.log(`⚖️ Nível de conformidade: ${reportData.overallCompliance}`);
    console.log(`📋 Total de violações: ${reportData.summary.totalViolations}`);
    console.log(`📄 Relatório HTML: ${reportPath}`);
    
    // Mostrar violações por severidade
    console.log('\n🚨 Violações por Severidade:');
    Object.entries(reportData.summary.violationsBySeverity).forEach(([severity, count]) => {
      console.log(`  ${severity}: ${count}`);
    });
    
    console.log('================================================================================');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const url = args[0] || 'https://www.casadeinvestimentos.pt';
  const maxPages = args[1] ? parseInt(args[1]) : 20;

  if (!url) {
    console.error('❌ URL é obrigatória');
    console.log('Uso: yarn ts-node src/scripts/test-full-site.ts <URL> [max-pages]');
    process.exit(1);
  }

  const test = new FullSiteTest();
  await test.run(url, maxPages);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

