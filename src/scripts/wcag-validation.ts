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

  // Obter URL do parâmetro da linha de comando
  const url = process.argv[2];
  
  if (!url) {
    console.log('\n📝 URL não fornecida - usando URL padrão');
    console.log('==========================================');
    console.log('Uso: yarn audit:wcag <URL>');
    console.log('Exemplo: yarn audit:wcag https://example.com');
    console.log('\n🔍 Testando com URL padrão: https://www.untile.pt');
    console.log('💡 Para testar um site específico, forneça a URL como parâmetro');
  }
  
  // Usar URL fornecida ou URL padrão
  const targetUrl = url || 'https://www.untile.pt';

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
    // Mostrar critérios prioritários (versão resumida)
    console.log('\n🎯 CRITÉRIOS WCAG 2.1 AA PRIORITÁRIOS');
    console.log('========================================');
    console.log(`Total de critérios: ${PRIORITY_WCAG_CRITERIA.length}`);
    console.log(`Critérios críticos (P0): ${getCriticalCriteria().length}`);

    // Executar auditoria real
    console.log(`\n🔍 EXECUTANDO AUDITORIA WCAG`);
    console.log(`URL: ${targetUrl}`);

    // Criar um ID único para o site
    const siteId = `audit_${Date.now()}`;
    
    // Executar auditoria real
    const auditResult = await validator.auditSite(targetUrl, siteId);

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
    
    console.log('\n📈 SCORES LIGHTHOUSE');
    console.log(`  Acessibilidade: ${auditResult.lighthouseScore.accessibility}%`);
    console.log(`  Performance: ${auditResult.lighthouseScore.performance}%`);
    console.log(`  SEO: ${auditResult.lighthouseScore.seo}%`);
    console.log(`  Boas Práticas: ${auditResult.lighthouseScore.bestPractices}%`);

    // Mostrar violações encontradas
    if (auditResult.violations.length > 0) {
      console.log('\n🚨 VIOLAÇÕES ENCONTRADAS');
      console.log('==========================');
      auditResult.violations.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.criteria.id} - ${violation.criteria.name}`);
        console.log(`   Severidade: ${violation.severity}`);
        console.log(`   Descrição: ${violation.description}`);
        console.log(`   Elemento: ${violation.element.substring(0, 100)}${violation.element.length > 100 ? '...' : ''}`);
      });
    } else {
      console.log('\n✅ NENHUMA VIOLAÇÃO DETETADA');
    }

    // Resumo da conformidade
    console.log('\n📋 RESUMO DE CONFORMIDADE');
    console.log('==========================');
    
    if (auditResult.wcagScore === -1) {
      console.log(`Conformidade WCAG 2.1 AA: ❓ NÃO DETERMINADA`);
      console.log(`Motivo: Auditoria limitada devido a problemas técnicos`);
    } else {
      const isCompliant = auditResult.wcagScore >= 80;
      console.log(`Conformidade WCAG 2.1 AA: ${isCompliant ? '✅ CONFORME' : '❌ NÃO CONFORME'}`);
      console.log(`Percentagem de conformidade: ${auditResult.wcagScore}%`);
    }

    // Recomendações baseadas no score
    if (auditResult.wcagScore < 80) {
      console.log('\n💡 RECOMENDAÇÕES');
      console.log('==================');
      console.log('• Corrigir violações críticas primeiro');
      console.log('• Melhorar contraste de cores');
      console.log('• Adicionar textos alternativos a imagens');
      console.log('• Verificar navegação por teclado');
      console.log('• Validar estrutura semântica HTML');
    }

    logger.info('Validação WCAG concluída');

  } catch (error) {
    logger.error('Erro na validação WCAG:', error);
    console.log('\n❌ ERRO NA AUDITORIA');
    console.log('=====================');
    console.log('Ocorreu um erro durante a auditoria:');
    console.log(error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await validator.close();
  }
}

if (require.main === module) {
  main().catch(error => {
    logger.error('Erro fatal:', error);
    process.exit(1);
  });
} 