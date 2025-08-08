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
  const baseUrl = process.argv[2];
  const strategy = (process.argv[3]?.toLowerCase() as 'auto' | 'sitemap' | 'manual') || 'auto';
  const auditType = (process.argv[4]?.toLowerCase() as 'simple' | 'complete') || 'simple';
  const reportFormat = (process.argv[5]?.toLowerCase() as 'console' | 'json' | 'html' | 'markdown') || 'console';
  const maxPages = parseInt(process.argv[6] || '10') || 10;

  if (!baseUrl) {
    console.log('\n📝 AUDITORIA MULTI-PÁGINA - WCAG 2.1 AA');
    console.log('==========================================');
    console.log('Uso: yarn audit:multi <URL> [estratégia] [tipo] [formato] [max-páginas]');
    console.log('');
    console.log('Parâmetros:');
    console.log('  URL         - URL base do site para auditar');
    console.log('');
    console.log('Estratégias disponíveis:');
    console.log('  auto        - Descoberta automática de páginas (padrão)');
    console.log('  sitemap     - Usar sitemap.xml do site');
    console.log('  manual      - Auditar apenas a URL fornecida');
    console.log('');
    console.log('Tipos de auditoria:');
    console.log('  simple      - Apenas 15 critérios prioritários (padrão)');
    console.log('  complete    - Todos os critérios WCAG 2.1 AA');
    console.log('');
    console.log('Formatos de relatório:');
    console.log('  console     - Relatório no terminal (padrão)');
    console.log('  json        - Exportar como JSON');
    console.log('  html        - Exportar como HTML');
    console.log('  markdown    - Exportar como Markdown');
    console.log('');
    console.log('Max páginas:');
    console.log('  número      - Máximo de páginas para auditar (padrão: 10)');
    console.log('');
    console.log('Exemplos:');
    console.log('  yarn audit:multi https://example.com');
    console.log('  yarn audit:multi https://example.com auto complete html 20');
    console.log('  yarn audit:multi https://example.com sitemap simple json 15');
    console.log('');
    console.log('💡 A auditoria multi-página pode demorar vários minutos dependendo');
    console.log('   do número de páginas e da estratégia escolhida.');
    process.exit(1);
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
  const validStrategies = ['auto', 'sitemap', 'manual'];
  if (!validStrategies.includes(strategy)) {
    console.log('\n❌ ERRO: Estratégia inválida');
    console.log('================================');
    console.log(`Estratégia fornecida: ${strategy}`);
    console.log(`Estratégias válidas: ${validStrategies.join(', ')}`);
    process.exit(1);
  }

  const validAuditTypes = ['simple', 'complete'];
  if (!validAuditTypes.includes(auditType)) {
    console.log('\n❌ ERRO: Tipo de auditoria inválido');
    console.log('================================');
    console.log(`Tipo fornecido: ${auditType}`);
    console.log(`Tipos válidos: ${validAuditTypes.join(', ')}`);
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

  const validator = new MultiPageValidator();

  try {
    // Mostrar informações da auditoria
    console.log('\n🌐 AUDITORIA MULTI-PÁGINA - WCAG 2.1 AA');
    console.log('=========================================');
    console.log(`🔗 Site Base: ${baseUrl}`);
    console.log(`🕷️ Estratégia: ${strategy.toUpperCase()}`);
    console.log(`📋 Tipo: ${auditType.toUpperCase()}`);
    console.log(`📄 Formato: ${reportFormat.toUpperCase()}`);
    console.log(`📊 Máx. Páginas: ${maxPages}`);
    console.log('');

    if (strategy === 'auto') {
      console.log('🤖 A descoberta automática pode encontrar:');
      console.log('   • Links na homepage');
      console.log('   • Páginas de navegação principal');
      console.log('   • Páginas importantes (sobre, contacto, etc.)');
    } else if (strategy === 'sitemap') {
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
      crawlStrategy: strategy,
      crawlOptions: {
        maxPages,
        maxDepth: strategy === 'auto' ? 2 : 1,
        includeExternal: false,
        excludePatterns: [
          '/admin', '/login', '/logout', '/api/', 
          '.pdf', '.jpg', '.png', '.gif', '.zip',
          '/wp-admin', '/wp-content', '#', '/search',
          '/cart', '/checkout', '/account'
        ]
      },
      auditType,
      maxConcurrent: 2, // Máximo 2 páginas em paralelo para evitar sobrecarga
      delayBetweenPages: 2000 // 2 segundos entre páginas
    });

    // Gerar relatório
    const reportGenerator = new MultiPageReportGenerator();
    const reportOptions = {
      format: reportFormat,
      detailed: true,
      includeRecommendations: true,
      includeLegalRisk: true
    };

    const report = reportGenerator.generateMultiPageReport(auditResult, reportOptions);

    if (reportFormat === 'console') {
      console.log(report);
    } else {
      // Salvar relatório em arquivo
      const fs = await import('fs');
      const path = await import('path');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const domainName = new URL(baseUrl).hostname.replace(/[^a-zA-Z0-9]/g, '-');
      
      const fileExtension = {
        json: 'json',
        html: 'html',
        markdown: 'md'
      }[reportFormat];
      
      const fileName = `multi-page-audit-${domainName}-${strategy}-${auditType}-${timestamp}.${fileExtension}`;
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
