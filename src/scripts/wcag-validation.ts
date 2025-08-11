#!/usr/bin/env ts-node

import { WCAGValidator } from '../validation/wcag-validator';
import { getCriticalCriteria, PRIORITY_WCAG_CRITERIA } from '../core/wcag-criteria';
import { logger } from '../utils/logger';
import { ReportGenerator } from '../reports/report-generator';

async function main() {
  logger.info('Iniciando validação WCAG 2.1 AA');

  // Verificar ambiente
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  if (isCI) {
    console.log('\n🏗️  AMBIENTE CI/CD DETECTADO');
    console.log('================================');
    console.log('⚠️  Browser não disponível - usando simulação');
    console.log('📊 Resultados serão simulados para teste');
  }

  // Obter parâmetros da linha de comando
  const args = process.argv.slice(2);
  const url = args.find(arg => !arg.startsWith('--'));
  const auditType = args.find(arg => !arg.startsWith('--') && arg !== url)?.toLowerCase();
  const reportFormat = args.find(arg => !arg.startsWith('--') && arg !== url && arg !== auditType)?.toLowerCase() || 'console';
  const useStandardFormula = args.includes('--useStandardFormula');
  
  if (!url) {
    console.log('\n📝 URL não fornecida - usando URL padrão');
    console.log('==========================================');
    console.log('Uso: yarn audit:wcag <URL> [tipo] [formato]');
    console.log('Tipos disponíveis:');
    console.log('  simple  - Apenas 15 critérios prioritários (padrão)');
    console.log('  complete - Todos os critérios WCAG 2.1 AA');
    console.log('Formatos disponíveis:');
    console.log('  console - Relatório no terminal (padrão)');
    console.log('  json    - Exportar como JSON');
    console.log('  html    - Exportar como HTML');
    console.log('  markdown- Exportar como Markdown');
    console.log('Exemplo: yarn audit:wcag https://example.com complete json');
    console.log('\n🔍 Testando com URL padrão: https://www.untile.pt');
    console.log('💡 Para testar um site específico, forneça a URL como parâmetro');
  }
  
  // Usar URL fornecida ou URL padrão
  const targetUrl = url || 'https://www.untile.pt';
  
  // Determinar tipo de auditoria
  const isCompleteAudit = auditType === 'complete';
  const auditTypeDisplay = isCompleteAudit ? 'COMPLETA' : 'SIMPLES';

  // Validar formato do relatório
  const validFormats = ['console', 'json', 'html', 'markdown'];
  if (!validFormats.includes(reportFormat)) {
    console.log('\n❌ ERRO: Formato de relatório inválido');
    console.log('================================');
    console.log(`Formato fornecido: ${reportFormat}`);
    console.log(`Formatos válidos: ${validFormats.join(', ')}`);
    process.exit(1);
  }

  // Validar formato da URL
  try {
    new URL(targetUrl);
  } catch (error) {
    console.log('\n❌ ERRO: URL inválida');
    console.log('================================');
    console.log(`URL fornecida: ${targetUrl}`);
    console.log('Certifique-se de incluir o protocolo (http:// ou https://)');
    process.exit(1);
  }

  const validator = new WCAGValidator();

  try {
    // Mostrar informações sobre o tipo de auditoria
    console.log('\n🎯 TIPO DE AUDITORIA WCAG 2.1 AA');
    console.log('==================================');
    console.log(`Tipo: ${auditTypeDisplay}`);
    
    if (isCompleteAudit) {
      console.log('📋 Testando TODOS os critérios WCAG 2.1 AA');
      console.log('⚠️  Auditoria completa pode demorar mais tempo');
    } else {
      console.log(`📋 Testando ${PRIORITY_WCAG_CRITERIA.length} critérios prioritários`);
      console.log(`Critérios críticos (P0): ${getCriticalCriteria().length}`);
    }

    // Executar auditoria real
    console.log(`\n🔍 EXECUTANDO AUDITORIA WCAG`);
    console.log(`URL: ${targetUrl}`);
    console.log(`Tipo: ${auditTypeDisplay}`);

    // Criar um ID único para o site
    const siteId = `audit_${Date.now()}`;
    
    // Executar auditoria real
    const auditResult = await validator.auditSite(targetUrl, siteId, isCompleteAudit, useStandardFormula);

    // Gerar relatório melhorado
    const reportGenerator = new ReportGenerator();
    const reportOptions = {
      format: reportFormat as 'console' | 'json' | 'html' | 'markdown',
      detailed: true,
      includeRecommendations: true,
      includeLegalRisk: true
    };

    const report = reportGenerator.generateReport(auditResult, reportOptions);

    if (reportFormat === 'console') {
      console.log(report);
    } else {
      // Salvar relatório em arquivo
      const fs = await import('fs');
      const path = await import('path');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const domainName = new URL(targetUrl).hostname.replace(/[^a-zA-Z0-9]/g, '-');
      const auditTypeShort = isCompleteAudit ? 'complete' : 'simple';
      
      const fileExtension = {
        json: 'json',
        html: 'html',
        markdown: 'md'
      }[reportFormat];
      
      const fileName = `accessibility-report-${domainName}-${auditTypeShort}-${timestamp}.${fileExtension}`;
      const filePath = path.join(process.cwd(), 'reports', fileName);
      
      // Criar diretório de relatórios se não existir
      const reportsDir = path.join(process.cwd(), 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, report, 'utf8');
      
      console.log('\n✅ RELATÓRIO EXPORTADO COM SUCESSO');
      console.log('==================================');
      console.log(`📄 Formato: ${reportFormat.toUpperCase()}`);
      console.log(`📁 Arquivo: ${fileName}`);
      console.log(`📍 Localização: ${filePath}`);
      console.log(`📊 Score WCAG: ${auditResult.wcagScore}%`);
      console.log(`🔍 Violações encontradas: ${auditResult.violations.length}`);
      
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
    logger.error('Erro na validação WCAG:', error);
    console.log('\n❌ ERRO NA AUDITORIA');
    console.log('=====================');
    console.log('Ocorreu um erro durante a auditoria:');
    console.log(error instanceof Error ? error.message : String(error));
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
      // Continuar mesmo com erro de cleanup
    }
  }
}

main().catch(error => {
  logger.error('Erro fatal na validação WCAG:', error);
  console.log('\n💥 ERRO FATAL');
  console.log('==============');
  console.log('Ocorreu um erro inesperado:');
  console.log(error instanceof Error ? error.message : String(error));
  process.exit(1);
}); 