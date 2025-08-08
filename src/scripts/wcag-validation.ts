#!/usr/bin/env ts-node

import { WCAGValidator } from '../validation/wcag-validator';
import { getCriticalCriteria, PRIORITY_WCAG_CRITERIA } from '../core/wcag-criteria';
import { logger } from '../utils/logger';

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

  // Obter URL e tipo de auditoria dos parâmetros da linha de comando
  const url = process.argv[2];
  const auditType = process.argv[3]?.toLowerCase();
  
  if (!url) {
    console.log('\n📝 URL não fornecida - usando URL padrão');
    console.log('==========================================');
    console.log('Uso: yarn audit:wcag <URL> [tipo]');
    console.log('Tipos disponíveis:');
    console.log('  simple  - Apenas 15 critérios prioritários (padrão)');
    console.log('  complete - Todos os critérios WCAG 2.1 AA');
    console.log('Exemplo: yarn audit:wcag https://example.com complete');
    console.log('\n🔍 Testando com URL padrão: https://www.untile.pt');
    console.log('💡 Para testar um site específico, forneça a URL como parâmetro');
  }
  
  // Usar URL fornecida ou URL padrão
  const targetUrl = url || 'https://www.untile.pt';
  
  // Determinar tipo de auditoria
  const isCompleteAudit = auditType === 'complete';
  const auditTypeDisplay = isCompleteAudit ? 'COMPLETA' : 'SIMPLES';

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
    const auditResult = await validator.auditSite(targetUrl, siteId, isCompleteAudit);

    console.log('\n📊 RESULTADOS DA AUDITORIA');
    console.log('============================');
    
    if (auditResult.wcagScore === -1) {
      console.log(`Score WCAG: ❌ NÃO CALCULADO (Browser não disponível)`);
      console.log(`⚠️  Auditoria limitada - Browser não pôde ser inicializado`);
      console.log(`💡 Para auditoria completa, verifique a configuração do Puppeteer`);
    } else {
      console.log(`Score WCAG: ${auditResult.wcagScore}%`);
    }
    
    console.log(`Total de violações: ${auditResult.violations.length}`);
    console.log(`Violações críticas: ${auditResult.violations.filter(v => v.severity === 'critical').length}`);
    
    // Separar violações por tipo de auditoria
    const priorityViolations = auditResult.violations.filter(v => 
      PRIORITY_WCAG_CRITERIA.some(criteria => criteria.id === v.criteria.id)
    );
    const otherViolations = auditResult.violations.filter(v => 
      !PRIORITY_WCAG_CRITERIA.some(criteria => criteria.id === v.criteria.id)
    );

    if (isCompleteAudit) {
      console.log('\n📋 VIOLAÇÕES DOS 15 CRITÉRIOS PRIORITÁRIOS');
      console.log('=============================================');
      console.log(`Violações prioritárias: ${priorityViolations.length}`);
      if (priorityViolations.length > 0) {
        priorityViolations.forEach((violation, index) => {
          console.log(`${index + 1}. ${violation.criteria.id} - ${violation.criteria.name}`);
          console.log(`   Severidade: ${violation.severity}`);
          console.log(`   Descrição: ${violation.description}`);
        });
      } else {
        console.log('✅ Nenhuma violação encontrada nos critérios prioritários');
      }

      console.log('\n📋 VIOLAÇÕES DOS CRITÉRIOS ADICIONAIS');
      console.log('========================================');
      console.log(`Violações adicionais: ${otherViolations.length}`);
      if (otherViolations.length > 0) {
        otherViolations.forEach((violation, index) => {
          console.log(`${index + 1}. ${violation.criteria.id} - ${violation.criteria.name}`);
          console.log(`   Severidade: ${violation.severity}`);
          console.log(`   Descrição: ${violation.description}`);
        });
      } else {
        console.log('✅ Nenhuma violação encontrada nos critérios adicionais');
      }
    } else {
      console.log('\n📋 VIOLAÇÕES DOS CRITÉRIOS PRIORITÁRIOS');
      console.log('=========================================');
      if (auditResult.violations.length > 0) {
        auditResult.violations.forEach((violation, index) => {
          console.log(`${index + 1}. ${violation.criteria.id} - ${violation.criteria.name}`);
          console.log(`   Severidade: ${violation.severity}`);
          console.log(`   Descrição: ${violation.description}`);
        });
      } else {
        console.log('✅ Nenhuma violação encontrada');
      }
    }
    
    console.log('\n📈 SCORES LIGHTHOUSE');
    console.log(`  Acessibilidade: ${auditResult.lighthouseScore.accessibility}%`);
    console.log(`  Performance: ${auditResult.lighthouseScore.performance}%`);
    console.log(`  SEO: ${auditResult.lighthouseScore.seo}%`);
    console.log(`  Boas Práticas: ${auditResult.lighthouseScore.bestPractices}%`);

    // Mostrar recomendações baseadas no tipo de auditoria
    console.log('\n💡 RECOMENDAÇÕES');
    console.log('==================');
    
    if (auditResult.wcagScore === -1) {
      console.log('❌ Não foi possível executar a auditoria completa');
      console.log('🔧 Verifique a configuração do browser e tente novamente');
    } else if (auditResult.wcagScore >= 90) {
      console.log('✅ Excelente conformidade WCAG 2.1 AA');
      console.log('🎉 O site está muito bem otimizado para acessibilidade');
    } else if (auditResult.wcagScore >= 70) {
      console.log('⚠️  Boa conformidade, mas há espaço para melhorias');
      console.log('🔧 Considere corrigir as violações identificadas');
    } else if (auditResult.wcagScore >= 50) {
      console.log('⚠️  Conformidade moderada - melhorias necessárias');
      console.log('🚨 Priorize a correção das violações críticas');
    } else {
      console.log('❌ Baixa conformidade WCAG 2.1 AA');
      console.log('🚨 Correções urgentes necessárias para acessibilidade');
    }

    if (isCompleteAudit && otherViolations.length > 0) {
      console.log('\n📝 Para auditoria mais detalhada dos critérios adicionais:');
      console.log('   - Consulte a documentação WCAG 2.1 AA completa');
      console.log('   - Considere implementar correções progressivas');
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