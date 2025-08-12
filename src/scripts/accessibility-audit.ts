#!/usr/bin/env ts-node

import { AccessMonitorValidator } from '../validation/accessmonitor-validator';
import { HTMLReportGenerator } from '../reports/html-report-generator';
import { PageCrawler } from '../crawler/page-crawler';
import { ComplianceValidator } from '../core/compliance-validator';
import { AuditResult, PageResult, MultiPageReport } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { chromium } from 'playwright';

interface AuditOptions {
  singlePage?: boolean;
  generateIndividualReports?: boolean;
  maxPages?: number;
  timeout?: number;
  strategy?: 'comprehensive' | 'auto' | 'sitemap' | 'manual';
}

class AccessibilityAuditor {
  private validator: AccessMonitorValidator;
  private reportGenerator: HTMLReportGenerator;
  private crawler: PageCrawler;
  private complianceValidator: ComplianceValidator;

  constructor() {
    this.validator = new AccessMonitorValidator();
    this.reportGenerator = new HTMLReportGenerator();
    this.crawler = new PageCrawler();
    this.complianceValidator = new ComplianceValidator();
  }

  async auditSinglePage(url: string): Promise<AuditResult> {
    console.log(`🔍 Auditing single page: ${url}`);
    
    // Usar Playwright para carregar a página
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    const result = await this.validator.validatePage(page, url);
    await browser.close();
    
    // Converter AccessMonitorResult para AuditResult
    const auditResult: AuditResult = {
      id: `audit-${Date.now()}`,
      siteId: new URL(url).hostname,
      url: url,
      timestamp: new Date(),
      wcagScore: result.score,
      violations: result.violations.map(v => ({
        id: v.id,
        criteria: { id: v.criteria[0] || 'unknown', name: v.description, level: v.level as any, principle: 'PERCEIVABLE' as any, priority: 'P1' as any, description: v.description, technology: { webflow: '', laravel: '', wordpress: '' } },
        severity: v.type === 'Erro' ? 'critical' : v.type === 'Aviso' ? 'moderate' : 'minor',
        description: v.description,
        element: '',
        page: url,
        timestamp: new Date(),
        status: 'open' as any
      })),
      lighthouseScore: { accessibility: result.score * 10, performance: 0, seo: 0, bestPractices: 0 },
      axeResults: { violations: [], passes: [], incomplete: [], inapplicable: [] },
      summary: {
        totalViolations: result.summary.errors,
        criticalViolations: result.summary.errors,
        priorityViolations: result.summary.warnings,
        compliancePercentage: result.compliance.checklistPercentage
      },
      checklistResults: {
        totalItems: 10,
        passedItems: Math.round(result.compliance.checklistPercentage / 10),
        percentage: result.compliance.checklistPercentage,
        overallScore: result.score * 10,
        results: {}
      }
    };
    
    // Generate individual report
    const htmlReport = this.reportGenerator.generateSinglePageHTML(auditResult);
    const reportPath = path.join('reports', `single-page-${Date.now()}.html`);
    
    fs.mkdirSync('reports', { recursive: true });
    fs.writeFileSync(reportPath, htmlReport);
    
    console.log(`✅ Single page audit completed`);
    console.log(`📊 WCAG Score: ${result.score}`);
    console.log(`📋 Checklist: ${result.compliance.checklistPercentage}%`);
    console.log(`🚨 Violations: ${result.violations.length}`);
    console.log(`📄 Report saved: ${reportPath}`);
    
    return auditResult;
  }

  async auditFullSite(baseUrl: string, options: AuditOptions = {}): Promise<MultiPageReport> {
    console.log(`🌐 Starting full site audit: ${baseUrl}`);
    
    const {
      timeout = 30000,
      generateIndividualReports = false,
      strategy = 'comprehensive'
    } = options;

    // Implementar estratégias de descoberta de páginas
    const discoveredPages = new Set<string>([baseUrl]);
    
    if (strategy === 'manual') {
      // Apenas a URL fornecida
      console.log(`🔍 Estratégia: Manual - Apenas ${baseUrl}`);
    } else {
      // Usar Playwright para descobrir páginas
      const browser = await chromium.launch();
      const page = await browser.newPage();
      
      try {
        await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout });
        
        if (strategy === 'sitemap') {
          // Estratégia sitemap - tentar encontrar sitemap.xml
          console.log(`🔍 Estratégia: Sitemap - Procurando sitemap.xml`);
          await this.discoverPagesFromSitemap(page, baseUrl, discoveredPages);
        } else {
          // Estratégias comprehensive e auto
          console.log(`🔍 Estratégia: ${strategy === 'comprehensive' ? 'Comprehensive' : 'Auto'} - Descobrindo páginas`);
          
          // Extrair links da página principal
          const links = await this.extractLinksFromPage(page, baseUrl);
          links.forEach(url => discoveredPages.add(url));
          
          if (strategy === 'comprehensive') {
            // Navegar pelos primeiros 10 links para descobrir mais páginas
            const linksToExplore = links.slice(0, 10);
            for (const link of linksToExplore) {
              try {
                await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 15000 });
                const subLinks = await this.extractLinksFromPage(page, baseUrl);
                subLinks.forEach(url => discoveredPages.add(url));
                console.log(`🔍 Explorado ${link}: encontradas ${subLinks.length} sub-páginas`);
              } catch (error) {
                console.log(`⚠️ Erro ao explorar ${link}:`, error instanceof Error ? error.message : 'Unknown error');
              }
            }
          }
        }
      } finally {
        await browser.close();
      }
    }
    
    const allPages = Array.from(discoveredPages);
    console.log(`📊 Total de páginas descobertas: ${discoveredPages.size} páginas para auditoria completa`);
    
    // Debug: mostrar as primeiras 10 URLs encontradas
    console.log(`🔍 Primeiras 10 URLs encontradas:`);
    Array.from(discoveredPages).slice(0, 10).forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });

    console.log(`📄 Found ${allPages.length} pages to audit`);

    const pageResults: PageResult[] = [];
    let totalViolations = 0;
    let totalScore = 0;

    // Audit each page
    for (let i = 0; i < allPages.length; i++) {
      const pageUrl = allPages[i];
      if (!pageUrl) continue;
      
      console.log(`🔍 Auditing page ${i + 1}/${allPages.length}: ${pageUrl}`);
      
      try {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
        
        const result = await this.validator.validatePage(page, pageUrl);
        await browser.close();
        
        const pageResult: PageResult = {
          url: pageUrl,
          wcagScore: result.score,
          violations: result.violations
            .filter(v => v.type !== 'Sucesso') // Filtrar sucessos (não são violações)
            .map(v => ({
              rule: v.id,
              severity: v.type === 'Erro' ? 'critical' : v.type === 'Aviso' ? 'moderate' : 'minor',
              description: v.description,
              help: v.description,
              element: ''
            })),
          checklistResults: {
            percentage: result.compliance.checklistPercentage,
            passed: Math.round(result.compliance.checklistPercentage / 10),
            total: 10
          },
          timestamp: new Date().toISOString()
        };

        pageResults.push(pageResult);
        totalViolations += pageResult.violations.length; // Usar apenas violações reais (sem sucessos)
        totalScore += result.score;

        // Generate individual report if requested
        if (generateIndividualReports) {
          const auditResult: AuditResult = {
            id: `audit-${Date.now()}-${i}`,
            siteId: new URL(pageUrl).hostname,
            url: pageUrl,
            timestamp: new Date(),
            wcagScore: result.score,
            violations: result.violations
              .filter(v => v.type !== 'Sucesso') // Filtrar sucessos (não são violações)
              .map(v => ({
                id: v.id,
                criteria: { id: v.criteria[0] || 'unknown', name: v.description, level: v.level as any, principle: 'PERCEIVABLE' as any, priority: 'P1' as any, description: v.description, technology: { webflow: '', laravel: '', wordpress: '' } },
                severity: v.type === 'Erro' ? 'critical' : v.type === 'Aviso' ? 'moderate' : 'minor',
                description: v.description,
                element: '',
                page: pageUrl,
                timestamp: new Date(),
                status: 'open' as any
              })),
            lighthouseScore: { accessibility: result.score * 10, performance: 0, seo: 0, bestPractices: 0 },
            axeResults: { violations: [], passes: [], incomplete: [], inapplicable: [] },
            summary: {
              totalViolations: result.summary.errors,
              criticalViolations: result.summary.errors,
              priorityViolations: result.summary.warnings,
              compliancePercentage: result.compliance.checklistPercentage
            },
            checklistResults: {
              totalItems: 10,
              passedItems: Math.round(result.compliance.checklistPercentage / 10),
              percentage: result.compliance.checklistPercentage,
              overallScore: result.score * 10,
              results: {}
            }
          };
          
          const htmlReport = this.reportGenerator.generateSinglePageHTML(auditResult);
          const reportPath = path.join('reports', `page-${i + 1}-${Date.now()}.html`);
          fs.writeFileSync(reportPath, htmlReport);
          console.log(`📄 Individual report saved: ${reportPath}`);
        }

      } catch (error) {
        console.error(`❌ Error auditing ${pageUrl}:`, error);
        // Add failed page with error info
        pageResults.push({
          url: pageUrl,
          wcagScore: 0,
          violations: [],
          checklistResults: { percentage: 0, passed: 0, total: 10 },
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Calculate overall metrics
    const averageScore = pageResults.length > 0 ? totalScore / pageResults.length : 0;
    const complianceLevel = this.calculateOverallCompliance(pageResults);
    
    // Calculate violations by severity
    const violationsBySeverity = this.calculateViolationsBySeverity(pageResults);
    const violationsByType = this.calculateViolationsByType(pageResults);

    // Converter para MultiPageReport
    const multiPageReportData: MultiPageReport = {
      baseUrl,
      pageResults,
      averageScore,
      totalViolations,
      complianceLevel,
      violationsBySeverity,
      violationsByType,
      timestamp: new Date().toISOString(),
      totalPages: pageResults.length
    };

    // Generate consolidated report
    const htmlReport = this.reportGenerator.generateMultiPageHTML(multiPageReportData);
    const reportPath = path.join('reports', `full-site-${Date.now()}.html`);
    
    fs.mkdirSync('reports', { recursive: true });
    fs.writeFileSync(reportPath, htmlReport);

    console.log(`✅ Full site audit completed`);
    console.log(`📊 Average WCAG Score: ${averageScore.toFixed(2)}`);
    console.log(`🚨 Total Violations: ${totalViolations}`);
    console.log(`📋 Compliance Level: ${complianceLevel}`);
    console.log(`📄 Consolidated report saved: ${reportPath}`);

    return multiPageReportData as any;
  }

  private calculateOverallCompliance(pageResults: PageResult[]): string {
    const allScores = pageResults.map(p => p.wcagScore);
    const allChecklistPercentages = pageResults.map(p => p.checklistResults?.percentage || 0);
    
    const minScore = Math.min(...allScores);
    const minChecklistPercentage = Math.min(...allChecklistPercentages);
    
    if (minScore > 9 && minChecklistPercentage >= 75) {
      return 'Plenamente conforme';
    } else if (minScore > 8 && minChecklistPercentage >= 50 && minChecklistPercentage < 75) {
      return 'Parcialmente conforme';
    } else {
      return 'Não conforme';
    }
  }

  private calculateViolationsBySeverity(pageResults: PageResult[]): Record<string, number> {
    const severityCounts: Record<string, number> = {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0
    };

    pageResults.forEach(page => {
      page.violations.forEach(violation => {
        const severity = violation.severity || 'moderate';
        severityCounts[severity] = (severityCounts[severity] || 0) + 1;
      });
    });

    return severityCounts;
  }

  private calculateViolationsByType(pageResults: PageResult[]): Record<string, number> {
    const typeCounts: Record<string, number> = {};

    pageResults.forEach(page => {
      page.violations.forEach(violation => {
        const type = violation.rule || 'unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
    });

    return typeCounts;
  }

  /**
   * Extrair links de uma página
   */
  private async extractLinksFromPage(page: any, baseUrl: string): Promise<string[]> {
    return await page.evaluate((baseUrl: string) => {
      const anchors = (globalThis as any).document.querySelectorAll('a[href]');
      const urls = new Set<string>();
      
      anchors.forEach((anchor: any) => {
        const href = anchor.getAttribute('href');
        if (href && (href.startsWith('/') || href.startsWith(baseUrl))) {
          const fullUrl = href.startsWith('/') ? `${baseUrl}${href}` : href;
          
          // Filtrar URLs válidas do mesmo domínio
          if (fullUrl.startsWith(baseUrl) && 
              !fullUrl.includes('#') && 
              !fullUrl.includes('mailto:') && 
              !fullUrl.includes('tel:') &&
              !fullUrl.includes('.css') &&
              !fullUrl.includes('.js') &&
              !fullUrl.includes('.png') &&
              !fullUrl.includes('.jpg') &&
              !fullUrl.includes('.jpeg') &&
              !fullUrl.includes('.gif') &&
              !fullUrl.includes('.svg') &&
              !fullUrl.includes('.pdf') &&
              !fullUrl.includes('.xml') &&
              !fullUrl.includes('sitemap') &&
              !fullUrl.includes('robots.txt') &&
              !fullUrl.includes('wp-admin') &&
              !fullUrl.includes('wp-content') &&
              !fullUrl.includes('wp-includes')) {
            
            // Normalizar URL (remover parâmetros de query e fragmentos)
            const urlObj = new URL(fullUrl);
            const normalizedUrl = `${urlObj.origin}${urlObj.pathname}`;
            urls.add(normalizedUrl);
          }
        }
      });
      
      return Array.from(urls);
    }, baseUrl);
  }

  /**
   * Descobrir páginas a partir do sitemap.xml
   */
  private async discoverPagesFromSitemap(page: any, baseUrl: string, discoveredPages: Set<string>): Promise<void> {
    try {
      // Tentar acessar sitemap.xml
      const sitemapUrl = `${baseUrl}/sitemap.xml`;
      await page.goto(sitemapUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
      
      const urls = await page.evaluate(() => {
        const urlElements = (globalThis as any).document.querySelectorAll('url > loc, sitemap > loc');
        const urls: string[] = [];
        
        urlElements.forEach((element: any) => {
          const url = element.textContent?.trim();
          if (url) {
            urls.push(url);
          }
        });
        
        return urls;
      });
      
      urls.forEach((url: string) => discoveredPages.add(url));
      console.log(`📋 Sitemap encontrado: ${urls.length} URLs`);
      
    } catch (error) {
      console.log(`⚠️ Sitemap não encontrado ou erro ao acessar: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fallback: extrair links da página principal
      const links = await this.extractLinksFromPage(page, baseUrl);
      links.forEach(url => discoveredPages.add(url));
      console.log(`🔍 Fallback: ${links.length} links extraídos da página principal`);
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  Single page: yarn audit:single <URL>');
    console.log('  Full site: yarn audit:site <BASE_URL> [--individual-reports] [--max-pages=N]');
    process.exit(1);
  }

  const auditor = new AccessibilityAuditor();
  const url = args[0];
  const isSinglePage = args.includes('--single') || (process.argv[1] && process.argv[1].includes('single'));
  const generateIndividualReports = args.includes('--individual-reports');
  const maxPagesArg = args.find(arg => arg.startsWith('--max-pages='));
  const maxPages = maxPagesArg ? parseInt(maxPagesArg.split('=')[1] || 'Infinity') : Infinity;

  try {
    if (isSinglePage && url) {
      await auditor.auditSinglePage(url);
    } else if (url) {
      await auditor.auditFullSite(url, {
        generateIndividualReports,
        maxPages
      });
    } else {
      console.error('❌ URL is required');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { AccessibilityAuditor };
