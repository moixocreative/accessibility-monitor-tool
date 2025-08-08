import { WCAGValidator } from './wcag-validator';
import { PageCrawler, CrawlResult, CrawlOptions } from '../crawler/page-crawler';
import { AuditResult, AccessibilityViolation } from '../types';
import { logger } from '../utils/logger';

export interface MultiPageAuditOptions {
  crawlStrategy: 'auto' | 'sitemap' | 'manual';
  crawlOptions: Partial<CrawlOptions>;
  auditType: 'simple' | 'complete';
  maxConcurrent: number;
  delayBetweenPages: number;
}

export interface MultiPageAuditResult {
  id: string;
  baseUrl: string;
  startTime: Date;
  endTime: Date;
  strategy: string;
  auditType: string;
  pagesDiscovered: number;
  pagesAudited: number;
  pageResults: PageAuditResult[];
  summary: MultiPageSummary;
  crawlStats: any;
}

export interface PageAuditResult {
  url: string;
  title: string;
  auditResult: AuditResult;
  auditTime: number; // em millisegundos
  crawlInfo: CrawlResult;
}

export interface MultiPageSummary {
  totalViolations: number;
  averageScore: number;
  bestPage: { url: string; score: number };
  worstPage: { url: string; score: number };
  violationsByType: Record<string, number>;
  violationsBySeverity: { critical: number; serious: number; moderate: number; minor: number };
  commonIssues: { criteria: string; count: number; pages: string[] }[];
  overallRiskLevel: string;
  averageLegalRisk: number;
}

export class MultiPageValidator {
  private wcagValidator: WCAGValidator;
  private pageCrawler: PageCrawler;

  constructor() {
    this.wcagValidator = new WCAGValidator();
    this.pageCrawler = new PageCrawler();
  }

  /**
   * Executar auditoria de múltiplas páginas
   */
  async auditMultiplePages(
    baseUrl: string,
    options: Partial<MultiPageAuditOptions> = {}
  ): Promise<MultiPageAuditResult> {
    const startTime = new Date();
    const auditId = `multi_audit_${Date.now()}`;

    const defaultOptions: MultiPageAuditOptions = {
      crawlStrategy: 'auto',
      crawlOptions: {
        maxPages: 10,
        maxDepth: 2,
        includeExternal: false
      },
      auditType: 'simple',
      maxConcurrent: 2,
      delayBetweenPages: 1000,
      ...options
    };

    logger.info('Iniciando auditoria multi-página', { 
      baseUrl, 
      options: defaultOptions 
    });

    try {
      // Fase 1: Descobrir páginas
      logger.info('🕷️ Fase 1: Descobrindo páginas...');
      const discoveredPages = await this.pageCrawler.discoverPages(
        baseUrl,
        defaultOptions.crawlStrategy,
        defaultOptions.crawlOptions
      );

      logger.info(`📋 Descobertas ${discoveredPages.length} páginas para auditoria`);

      // Fase 2: Auditar cada página
      logger.info('🔍 Fase 2: Auditando páginas descobertas...');
      const pageResults = await this.auditPages(
        discoveredPages,
        defaultOptions
      );

      // Fase 3: Gerar sumário consolidado
      logger.info('📊 Fase 3: Gerando análise consolidada...');
      const summary = this.generateMultiPageSummary(pageResults);
      const crawlStats = this.pageCrawler.getStats();

      const endTime = new Date();
      const totalTime = endTime.getTime() - startTime.getTime();

      logger.info(`✅ Auditoria multi-página concluída em ${totalTime}ms`, {
        pagesDiscovered: discoveredPages.length,
        pagesAudited: pageResults.length,
        averageScore: summary.averageScore
      });

      return {
        id: auditId,
        baseUrl,
        startTime,
        endTime,
        strategy: defaultOptions.crawlStrategy,
        auditType: defaultOptions.auditType,
        pagesDiscovered: discoveredPages.length,
        pagesAudited: pageResults.length,
        pageResults,
        summary,
        crawlStats
      };

    } catch (error) {
      logger.error('Erro durante auditoria multi-página:', error);
      throw error;
    }
  }

  /**
   * Auditar lista de páginas descobertas
   */
  private async auditPages(
    pages: CrawlResult[],
    options: MultiPageAuditOptions
  ): Promise<PageAuditResult[]> {
    const results: PageAuditResult[] = [];
    const validPages = pages.filter(page => page.isValid);

    // Processar páginas em lotes para evitar sobrecarga
    for (let i = 0; i < validPages.length; i += options.maxConcurrent) {
      const batch = validPages.slice(i, i + options.maxConcurrent);
      
      const batchPromises = batch.map(async (page, batchIndex) => {
        try {
          // Delay entre páginas para evitar rate limiting
          if (i > 0 || batchIndex > 0) {
            await new Promise(resolve => 
              setTimeout(resolve, options.delayBetweenPages)
            );
          }

          logger.info(`Auditando página ${i + batchIndex + 1}/${validPages.length}: ${page.url}`);
          
          const startTime = Date.now();
          const isCompleteAudit = options.auditType === 'complete';
          
          const auditResult = await this.wcagValidator.auditSite(
            page.url,
            `page_${Date.now()}_${batchIndex}`,
            isCompleteAudit
          );
          
          const auditTime = Date.now() - startTime;

          return {
            url: page.url,
            title: page.title,
            auditResult,
            auditTime,
            crawlInfo: page
          };

        } catch (error) {
          logger.warn(`Erro ao auditar página ${page.url}:`, error);
          
          // Retornar resultado de erro para manter consistência
          return {
            url: page.url,
            title: page.title,
            auditResult: {
              id: `error_${Date.now()}`,
              siteId: `page_error`,
              timestamp: new Date(),
              wcagScore: -1,
              lighthouseScore: {
                accessibility: 0,
                performance: 0,
                seo: 0,
                bestPractices: 0
              },
              violations: [],
              axeResults: {
                violations: [],
                passes: [],
                incomplete: [],
                inapplicable: []
              },
              summary: {
                totalViolations: 0,
                criticalViolations: 0,
                priorityViolations: 0,
                compliancePercentage: 0
              }
            },
            auditTime: 0,
            crawlInfo: page
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      logger.info(`Lote ${Math.floor(i / options.maxConcurrent) + 1} concluído: ${batchResults.length} páginas auditadas`);
    }

    return results;
  }

  /**
   * Gerar sumário consolidado de múltiplas páginas
   */
  private generateMultiPageSummary(pageResults: PageAuditResult[]): MultiPageSummary {
    const validResults = pageResults.filter(result => result.auditResult.wcagScore >= 0);
    
    if (validResults.length === 0) {
      return {
        totalViolations: 0,
        averageScore: 0,
        bestPage: { url: 'N/A', score: 0 },
        worstPage: { url: 'N/A', score: 0 },
        violationsByType: {},
        violationsBySeverity: { critical: 0, serious: 0, moderate: 0, minor: 0 },
        commonIssues: [],
        overallRiskLevel: 'UNKNOWN',
        averageLegalRisk: 0
      };
    }

    // Calcular métricas básicas
    const scores = validResults.map(result => result.auditResult.wcagScore);
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

    const bestPage = validResults.reduce((best, current) => 
      current.auditResult.wcagScore > best.auditResult.wcagScore ? current : best
    );

    const worstPage = validResults.reduce((worst, current) => 
      current.auditResult.wcagScore < worst.auditResult.wcagScore ? current : worst
    );

    // Agregar violações
    const allViolations: AccessibilityViolation[] = [];
    validResults.forEach(result => {
      allViolations.push(...result.auditResult.violations);
    });

    const violationsByType: Record<string, number> = {};
    const violationsBySeverity = { critical: 0, serious: 0, moderate: 0, minor: 0 };

    allViolations.forEach(violation => {
      // Por tipo (critério WCAG)
      const key = `${violation.criteria.id} - ${violation.criteria.name}`;
      violationsByType[key] = (violationsByType[key] || 0) + 1;

      // Por severidade
      if (violation.severity in violationsBySeverity) {
        violationsBySeverity[violation.severity as keyof typeof violationsBySeverity]++;
      }
    });

    // Encontrar problemas comuns (presentes em múltiplas páginas)
    const issuesByPage: Record<string, string[]> = {};
    validResults.forEach(result => {
      result.auditResult.violations.forEach(violation => {
        const issueKey = `${violation.criteria.id} - ${violation.criteria.name}`;
        if (!issuesByPage[issueKey]) {
          issuesByPage[issueKey] = [];
        }
        issuesByPage[issueKey].push(result.url);
      });
    });

    const commonIssues = Object.entries(issuesByPage)
      .filter(([, pages]) => pages.length > 1) // Apenas problemas em múltiplas páginas
      .map(([criteria, pages]) => ({
        criteria,
        count: pages.length,
        pages: [...new Set(pages)] // Remover duplicatas
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 problemas mais comuns

    // Calcular risco legal médio
    let totalLegalRisk = 0;
    let pagesWithRisk = 0;
    
    validResults.forEach(result => {
      const legalRisk = (result.auditResult as any).legalRiskMetrics;
      if (legalRisk && legalRisk.legalRiskScore >= 0) {
        totalLegalRisk += legalRisk.legalRiskScore;
        pagesWithRisk++;
      }
    });

    const averageLegalRisk = pagesWithRisk > 0 ? Math.round(totalLegalRisk / pagesWithRisk) : 0;

    // Determinar nível de risco geral
    let overallRiskLevel = 'BAIXO';
    if (averageLegalRisk > 70) overallRiskLevel = 'ALTO';
    else if (averageLegalRisk > 40) overallRiskLevel = 'MÉDIO';

    return {
      totalViolations: allViolations.length,
      averageScore,
      bestPage: { url: bestPage.url, score: bestPage.auditResult.wcagScore },
      worstPage: { url: worstPage.url, score: worstPage.auditResult.wcagScore },
      violationsByType,
      violationsBySeverity,
      commonIssues,
      overallRiskLevel,
      averageLegalRisk
    };
  }

  /**
   * Fechar recursos
   */
  async close(): Promise<void> {
    await this.wcagValidator.close();
  }
}
