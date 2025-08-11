#!/usr/bin/env ts-node

import { MultiPageValidator } from '../validation/multi-page-validator';
import { MultiPageReportGenerator } from '../reports/multi-page-report-generator';
import { logger } from '../utils/logger';

async function main() {
  logger.info('Iniciando auditoria multi-página WCAG 2.1 AA');

  // Verificar ambiente
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  if (isCI) {
    console.log('\n🏗️  AMBIENTE CI/CD DETECTADO');
    console.log('================================');
    console.log('⚠️  Browser não disponível - funcionalidade limitada');
    console.log('📊 Para auditoria multi-página, execute em ambiente local');
    process.exit(1);
  }

  // Obter parâmetros da linha de comando
  const baseUrl = process.argv[2] || 'https://www.untile.pt';
  const crawlStrategy = process.argv[3] || 'auto';
  const reportFormat = process.argv[4] || 'html';
  const maxPages = parseInt(process.argv[5] || '20') || 20;
  const useStandardFormula = process.argv[6] === 'true';
  const criteriaSet = (process.argv[7] || 'untile') as 'untile' | 'gov-pt' | 'custom';
  const customCriteria = process.argv[8] ? process.argv[8].split(',') : undefined;

  if (!baseUrl) {
    console.log('\n📝 URL não fornecida - usando URL padrão');
    console.log('==========================================');
    console.log('Uso: yarn audit:multi <URL> [estratégia] [formato] [max-páginas] [fórmula-padrão] [conjunto-critérios] [critérios-personalizados]');
    console.log('\nParâmetros:');
    console.log('  URL                    - URL base do site a auditar');
    console.log('  estratégia             - auto, sitemap, manual, comprehensive (padrão: auto)');
    console.log('  formato                - html, json, markdown, console (padrão: html)');
    console.log('  max-páginas            - Número máximo de páginas (padrão: 20)');
    console.log('  fórmula-padrão         - true/false para usar fórmula axe-core (padrão: false)');
    console.log('  conjunto-critérios     - untile, gov-pt, custom (padrão: untile)');
    console.log('  critérios-personalizados - Lista separada por vírgulas (ex: "1.1.1,1.4.3,2.1.1")');
    console.log('\nConjuntos de Critérios:');
    console.log('  untile                 - 15 critérios prioritários UNTILE (padrão)');
    console.log('  gov-pt                 - 10 critérios críticos acessibilidade.gov.pt');
    console.log('  custom                 - Critérios personalizados especificados');
    console.log('\nExemplos:');
    console.log('  yarn audit:multi https://example.com auto simple html 20 false untile');
    console.log('  yarn audit:multi https://example.com auto simple html 20 false gov-pt');
    console.log('  yarn audit:multi https://example.com auto simple html 20 false custom "1.1.1,1.4.3,2.1.1"');
    console.log('\n🔍 Testando com URL padrão: https://www.untile.pt');
    console.log('💡 Para testar um site específico, forneça a URL como parâmetro');
  }

  // Validar URL
  try {
    new URL(baseUrl);
  } catch (error) {
    console.log('\n❌ ERRO: URL inválida');
    console.log('================================');
    console.log(`URL fornecida: ${baseUrl}`);
    console.log('Certifique-se de incluir o protocolo (http:// ou https://)');
    process.exit(1);
  }

  // Validar parâmetros
  const validStrategies = ['auto', 'sitemap', 'manual', 'comprehensive'];
  if (!validStrategies.includes(crawlStrategy)) {
    console.log('\n❌ ERRO: Estratégia inválida');
    console.log('================================');
    console.log(`Estratégia fornecida: ${crawlStrategy}`);
    console.log(`Estratégias válidas: ${validStrategies.join(', ')}`);
    process.exit(1);
  }



  const validFormats = ['console', 'json', 'html', 'markdown'];
  if (!validFormats.includes(reportFormat)) {
    console.log('\n❌ ERRO: Formato de relatório inválido');
    console.log('================================');
    console.log(`Formato fornecido: ${reportFormat}`);
    console.log(`Formatos válidos: ${validFormats.join(', ')}`);
    process.exit(1);
  }

  if (maxPages < 1 || maxPages > 100) {
    console.log('\n❌ ERRO: Número de páginas inválido');
    console.log('================================');
    console.log(`Páginas fornecidas: ${maxPages}`);
    console.log('O número deve estar entre 1 e 100');
    process.exit(1);
  }

  // Validar conjunto de critérios
  if (criteriaSet === 'custom' && (!customCriteria || customCriteria.length === 0)) {
    console.error('❌ Erro: Para critérios personalizados, deve especificar uma lista separada por vírgulas');
    console.log('Exemplo: yarn audit:multi https://example.com auto simple html 20 false custom "1.1.1,1.4.3,2.1.1"');
    process.exit(1);
  }

  const validator = new MultiPageValidator();

  try {
    // Mostrar informações da auditoria
    console.log('\n🌐 AUDITORIA MULTI-PÁGINA - WCAG 2.1 AA');
    console.log('=========================================');
    console.log(`🔗 Site Base: ${baseUrl}`);
    console.log(`🕷️ Estratégia: ${crawlStrategy.toUpperCase()}`);
    console.log(`📋 Conjunto de Critérios: ${criteriaSet.toUpperCase()}`);
    console.log(`📄 Formato: ${reportFormat.toUpperCase()}`);
    console.log(`📊 Máx. Páginas: ${maxPages}`);
    console.log('');

    if (crawlStrategy === 'comprehensive') {
      console.log('🚀 A descoberta abrangente irá usar TODOS os métodos:');
      console.log('   • Sitemap.xml e robots.txt');
      console.log('   • Crawling automático aprofundado');
      console.log('   • Padrões comuns (/sobre, /contacto, etc.)');
      console.log('   • Filtros automáticos para páginas protegidas');
    } else if (crawlStrategy === 'auto') {
      console.log('🤖 A descoberta automática pode encontrar:');
      console.log('   • Links na homepage');
      console.log('   • Páginas de navegação principal');
      console.log('   • Páginas importantes (sobre, contacto, etc.)');
    } else if (crawlStrategy === 'sitemap') {
      console.log('🗺️ A estratégia de sitemap irá:');
      console.log('   • Procurar sitemap.xml no domínio');
      console.log('   • Auditar páginas listadas no sitemap');
      console.log('   • Fallback para descoberta automática se não encontrar');
    } else {
      console.log('👤 Modo manual: auditará apenas a URL fornecida');
    }

    console.log('');
    console.log('⚠️  ATENÇÃO: Esta operação pode demorar vários minutos...');
    console.log('🕐 Tempo estimado: 1-3 minutos por página');
    console.log('');

    // Executar auditoria multi-página
    console.log('🚀 Iniciando auditoria multi-página...');
    
    const auditResult = await validator.auditMultiplePages(baseUrl, {
      crawlStrategy: crawlStrategy as any,
      crawlOptions: {
        maxPages,
        maxDepth: 3,
        includeExternal: false
      },

      maxConcurrent: 1,
      delayBetweenPages: 5000,
      retryFailedPages: true,
      maxRetries: 2,
      useSharedSession: false,
      useStandardFormula,
      criteriaSet,
      customCriteria: customCriteria || []
    });

    // Gerar relatório
    const reportGenerator = new MultiPageReportGenerator();
    
    // Converter resultado para formato esperado pelo report generator
    const reportData = {
      baseUrl: auditResult.baseUrl,
      totalPages: auditResult.pagesDiscovered,
      auditedPages: auditResult.pagesAudited,
      timestamp: auditResult.endTime,
      overallScore: auditResult.summary.averageScore,
      pages: auditResult.pageResults.map(page => ({
        url: page.url,
        wcagScore: page.auditResult.wcagScore,
        violationCount: page.auditResult.violations.length,
        violations: page.auditResult.violations,
        axeResults: page.auditResult.axeResults,
        lighthouseScore: page.auditResult.lighthouseScore?.accessibility || 0,
        timestamp: page.auditResult.timestamp,
        ...(page.auditResult.wcagScore < 0 && { error: 'Erro durante auditoria' })
      })),
      summary: {
        averageScore: auditResult.summary.averageScore,
        bestPerformingPage: auditResult.summary.bestPage,
        worstPerformingPage: auditResult.summary.worstPage,
        totalViolations: auditResult.summary.totalViolations,
        criticalViolations: auditResult.summary.violationsBySeverity.critical,
        pagesWithIssues: auditResult.pageResults.filter(p => p.auditResult.violations.length > 0).length,
        compliance: auditResult.summary.compliance
      },
      commonIssues: auditResult.summary.commonIssues.map(issue => {
        // Determinar severidade baseada no tipo de critério WCAG
        let severity: 'critical' | 'serious' | 'moderate' | 'minor' = 'moderate';
        
        // Critérios críticos (P0 - Bloqueiam completamente o acesso)
        if (issue.criteria.includes('4.1.2') || // Nome, Função, Valor
            issue.criteria.includes('3.3.2') || // Rótulos ou Instruções
            issue.criteria.includes('label') || // Labels de formulário
            issue.criteria.includes('input-button-name')) {
          severity = 'critical';
        }
        // Critérios sérios (P1 - Dificultam significativamente o acesso)
        else if (issue.criteria.includes('1.4.3') || // Contraste (Mínimo)
                 issue.criteria.includes('color-contrast') || // Contraste de cor
                 issue.criteria.includes('duplicate-id-active') || // IDs duplicados ativos
                 issue.criteria.includes('aria-required-children') || // ARIA required children
                 issue.criteria.includes('aria-required-parent')) {
          severity = 'serious';
        }
        // Critérios moderados (P2 - Dificultam moderadamente o acesso)
        else if (issue.criteria.includes('1.3.1') || // Info e Relações
                 issue.criteria.includes('heading-order') || // Ordem de cabeçalhos
                 issue.criteria.includes('region') || // Regiões da página
                 issue.criteria.includes('landmark-one-main')) {
          severity = 'moderate';
        }
        // Critérios menores (P3 - Melhoram a experiência mas não bloqueiam)
        else if (issue.criteria.includes('duplicate-id') || // IDs duplicados
                 issue.criteria.includes('empty-table-header')) { // Cabeçalhos de tabela vazios
          severity = 'minor';
        }
        
        return {
          criteria: issue.criteria,
          count: issue.count,
          pages: issue.pages,
          severity,
          recommendation: `Corrigir ${issue.criteria} em ${issue.count} páginas`
        };
      }),
      recommendations: [
        'Revisar problemas críticos identificados',
        'Implementar testes automatizados de acessibilidade',
        'Treinar equipa em princípios WCAG 2.1 AA'
      ]
    };

    const report = reportGenerator.generateReport(reportData, reportFormat as 'console' | 'json' | 'html' | 'markdown');

    if (reportFormat === 'console') {
      console.log(report);
    } else {
      // Salvar relatório em arquivo
      const fs = await import('fs');
      const path = await import('path');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const domainName = new URL(baseUrl).hostname.replace(/[^a-zA-Z0-9]/g, '-');
      
      const fileExtension = {
        'html': 'html',
        'json': 'json',
        'markdown': 'md',
        'console': 'txt'
      }[reportFormat as 'html' | 'json' | 'markdown' | 'console'] || 'html';
      
      const fileName = `multi-page-audit-${domainName}-${crawlStrategy}-${criteriaSet}-${timestamp}.${fileExtension}`;
      const filePath = path.join(process.cwd(), 'reports', fileName);
      
      // Criar diretório de relatórios se não existir
      const reportsDir = path.join(process.cwd(), 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, report, 'utf8');
      
      console.log('\n✅ AUDITORIA MULTI-PÁGINA CONCLUÍDA');
      console.log('===================================');
      console.log(`📄 Formato: ${reportFormat.toUpperCase()}`);
      console.log(`📁 Arquivo: ${fileName}`);
      console.log(`📍 Localização: ${filePath}`);
      console.log(`📊 Páginas Auditadas: ${auditResult.pagesAudited}`);
      console.log(`📈 Score Médio: ${auditResult.summary.averageScore}%`);
      console.log(`🔍 Total de Violações: ${auditResult.summary.totalViolations}`);
      console.log(`⚖️ Risco Legal: ${auditResult.summary.overallRiskLevel}`);
      
      if (reportFormat === 'html') {
        console.log('\n💡 Para visualizar o relatório HTML:');
        console.log(`   Abra o arquivo no seu navegador ou execute:`);
        console.log(`   open "${filePath}"`);
      } else if (reportFormat === 'json') {
        console.log('\n💡 Para processar o relatório JSON:');
        console.log(`   Use ferramentas como jq ou importe em suas aplicações`);
      } else if (reportFormat === 'markdown') {
        console.log('\n💡 Para visualizar o relatório Markdown:');
        console.log(`   Abra em qualquer editor que suporte Markdown`);
      }
    }

  } catch (error) {
    logger.error('Erro na auditoria multi-página:', error);
    console.log('\n❌ ERRO NA AUDITORIA MULTI-PÁGINA');
    console.log('==================================');
    console.log('Ocorreu um erro durante a auditoria:');
    console.log(error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error && error.message.includes('timeout')) {
      console.log('\n💡 Sugestões para resolver problemas de timeout:');
      console.log('   • Reduza o número máximo de páginas');
      console.log('   • Use estratégia "manual" para testar apenas uma página');
      console.log('   • Verifique a conectividade com o site');
    }
    
    process.exit(1);
  } finally {
    try {
      console.log('\n🧹 Limpando recursos...');
      await Promise.race([
        validator.close(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Cleanup timeout')), 15000)
        )
      ]);
      console.log('✅ Recursos limpos com sucesso');
    } catch (cleanupError) {
      console.log('⚠️  Erro durante limpeza de recursos:', cleanupError);
    }
  }
}

main().catch(error => {
  logger.error('Erro fatal na auditoria multi-página:', error);
  console.log('\n💥 ERRO FATAL');
  console.log('==============');
  console.log('Ocorreu um erro inesperado:');
  console.log(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
