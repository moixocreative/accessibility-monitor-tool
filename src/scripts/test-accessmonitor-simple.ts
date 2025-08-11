#!/usr/bin/env ts-node

import { AccessMonitorValidator } from '../validation/accessmonitor-validator';
import { chromium } from 'playwright';
import { HTMLReportGenerator } from '../reports/html-report-generator';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const url = args[0];
  
  if (!url) {
    console.log('Uso: yarn test:accessmonitor-simple <URL>');
    console.log('Exemplo: yarn test:accessmonitor-simple https://example.com');
    process.exit(1);
  }
  
  console.log(`🔍 Testando AccessMonitorValidator diretamente: ${url}`);
  
  try {
    // Inicializar browser simples
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Navegar para a URL
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    // Testar AccessMonitorValidator diretamente
    const validator = new AccessMonitorValidator();
    const result = await validator.validatePage(page, url);
    
    // Gerar relatório HTML
    const reportGenerator = new HTMLReportGenerator();
    
    // Converter resultado para formato AuditResult
    const auditResult = {
      id: `accessmonitor_${Date.now()}`,
      siteId: new URL(url).hostname,
      url, // Adicionar URL da página testada
      timestamp: new Date(),
      wcagScore: result.score,
      violations: result.violations.map(violation => ({
        id: violation.id,
        criteria: {
          id: violation.criteria[0] || 'unknown',
          name: violation.description,
          level: violation.level,
          principle: 'PERCEIVABLE' as const,
          priority: (violation.level === 'A' ? 'P1' : violation.level === 'AA' ? 'P2' : 'P0') as 'P0' | 'P1' | 'P2',
          description: violation.description,
          technology: {
            webflow: 'N/A',
            laravel: 'N/A',
            wordpress: 'N/A'
          }
        },
        severity: (violation.type === 'Erro' ? 'critical' : violation.type === 'Aviso' ? 'serious' : 'moderate') as 'critical' | 'serious' | 'moderate' | 'minor',
        description: violation.description,
        element: violation.value || 'unknown',
        page: url,
        timestamp: new Date(),
        status: 'open' as const
      })),
      lighthouseScore: {
        accessibility: Math.round(result.score * 10),
        performance: 75,
        seo: 80,
        bestPractices: 90
      },
      axeResults: {
        violations: [],
        passes: [],
        incomplete: [],
        inapplicable: []
      },
      summary: {
        totalViolations: result.violations.filter(v => v.type === 'Erro').length,
        criticalViolations: result.violations.filter(v => v.type === 'Erro').length,
        priorityViolations: result.violations.filter(v => v.type === 'Aviso').length,
        compliancePercentage: result.compliance.checklistPercentage
      },
      checklistResults: {
        totalItems: 10,
        passedItems: Math.round((result.compliance.checklistPercentage / 100) * 10),
        percentage: result.compliance.checklistPercentage,
        overallScore: result.compliance.checklistPercentage,
        results: {}
      }
    };
    
    // Gerar relatório HTML
    const reportPath = await reportGenerator.generateSinglePageReport(auditResult);
    console.log(`📄 Relatório HTML gerado: ${reportPath}`);
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 RESULTADO ACCESSMONITOR VALIDATOR');
    console.log('='.repeat(80));
    console.log(`🌐 URL: ${url}`);
    console.log(`📊 Score: ${result.score}/10`);
    console.log(`⚖️ Conformidade: ${result.compliance.level}`);
    console.log(`📋 Justificação: ${result.compliance.reason}`);
    console.log(`📋 Checklist crítica: ${result.compliance.checklistPercentage.toFixed(1)}%`);
    console.log(`📋 Total testes: ${result.summary.totalTests}`);
    console.log(`✅ Sucessos: ${result.summary.successes}`);
    console.log(`❌ Erros: ${result.summary.errors}`);
    console.log(`⚠️ Avisos: ${result.summary.warnings}`);
    
    if (result.violations.length > 0) {
      console.log('\n🚨 VIOLAÇÕES DETECTADAS:');
      console.log('─'.repeat(80));
      result.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id} (${violation.type})`);
        console.log(`   Nível: ${violation.level}`);
        console.log(`   Descrição: ${violation.description}`);
        console.log(`   Ocorrências: ${violation.occurrences}`);
        console.log('');
      });
    }
    
    console.log('='.repeat(80));
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}
