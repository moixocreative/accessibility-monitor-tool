import { AccessibilityViolation } from '../types';
import { logger } from '../utils/logger';

export interface ComplianceResult {
  level: 'Plenamente conforme' | 'Parcialmente conforme' | 'Não conforme';
  score: number;
  criteriaPassRate: number;
  reasons: string[];
  recommendations: string[];
}

export class ComplianceValidator {
  /**
   * Validar conformidade de uma página individual baseada nos critérios do acessibilidade.gov.pt
   * Especificamente para quando useStandardFormula=true e criteriaSet=gov-pt
   */
  static validatePageCompliance(
    pageScore: number,
    violations: AccessibilityViolation[],
    criteriaSet: 'untile' | 'gov-pt' | 'custom' = 'gov-pt'
  ): ComplianceResult {
    logger.info(`🔍 Validando conformidade da página - Score: ${pageScore}, Violações: ${violations.length}`);

    // Para critérios gov-pt com fórmula padrão, usar apenas a pontuação do AccessMonitor (axe-core)
    if (criteriaSet === 'gov-pt') {
      return this.validateGovPtCompliance(pageScore, violations);
    }

    // Para outros critérios, usar lógica híbrida
    return this.validateHybridCompliance(pageScore, violations);
  }

  /**
   * Validar conformidade usando critérios EXATOS do acessibilidade.gov.pt
   * Esta é a implementação principal para TRUE + gov-pt
   */
  private static validateGovPtCompliance(
    pageScore: number,
    violations: AccessibilityViolation[]
  ): ComplianceResult {
    // Critérios EXATOS do acessibilidade.gov.pt:
    // - Pontuação superior a 9 = Plenamente conforme
    // - Pontuação superior a 8 = Parcialmente conforme
    // - Pontuação inferior a 8 = Não conforme

    let level: 'Plenamente conforme' | 'Parcialmente conforme' | 'Não conforme';
    const reasons: string[] = [];
    const recommendations: string[] = [];

    if (pageScore >= 9.0) {
      level = 'Plenamente conforme';
      reasons.push(`✅ Pontuação da página: ${pageScore}/10 (superior a 9.0)`);
      reasons.push('✅ Critério acessibilidade.gov.pt: Pontuação superior a 9 no AccessMonitor');
      recommendations.push('Manter o excelente nível de acessibilidade');
      recommendations.push('Considerar candidatura ao Selo de Acessibilidade Digital');
    } else if (pageScore >= 8.0) {
      level = 'Parcialmente conforme';
      reasons.push(`⚠️ Pontuação da página: ${pageScore}/10 (entre 8.0 e 8.99)`);
      reasons.push('⚠️ Critério acessibilidade.gov.pt: Pontuação superior a 8 no AccessMonitor');
      recommendations.push('Melhorar acessibilidade para atingir conformidade plena');
      recommendations.push('Corrigir violações críticas e sérias prioritariamente');
      recommendations.push('Focar em melhorias que aumentem a pontuação para 9+');
    } else {
      level = 'Não conforme';
      reasons.push(`❌ Pontuação da página: ${pageScore}/10 (inferior a 8.0)`);
      reasons.push('❌ Critério acessibilidade.gov.pt: Pontuação inferior a 8 no AccessMonitor');
      recommendations.push('Corrigir violações críticas imediatamente');
      recommendations.push('Implementar plano de correção de acessibilidade prioritário');
      recommendations.push('Considerar auditoria completa e especializada');
      recommendations.push('Não é elegível para o Selo de Acessibilidade Digital');
    }

    // Adicionar detalhes das violações
    if (violations.length > 0) {
      const criticalCount = violations.filter(v => v.severity === 'critical').length;
      const seriousCount = violations.filter(v => v.severity === 'serious').length;
      const moderateCount = violations.filter(v => v.severity === 'moderate').length;
      const minorCount = violations.filter(v => v.severity === 'minor').length;
      
      reasons.push(`📊 Total de violações: ${violations.length}`);
      if (criticalCount > 0) reasons.push(`🚨 Violações críticas: ${criticalCount}`);
      if (seriousCount > 0) reasons.push(`⚠️ Violações sérias: ${seriousCount}`);
      if (moderateCount > 0) reasons.push(`🔶 Violações moderadas: ${moderateCount}`);
      if (minorCount > 0) reasons.push(`🔸 Violações menores: ${minorCount}`);
    }

    return {
      level,
      score: pageScore,
      criteriaPassRate: 1.0, // Para gov-pt, usamos apenas a pontuação
      reasons,
      recommendations
    };
  }

  /**
   * Validar conformidade usando lógica híbrida (UNTILE + Gov.pt)
   */
  private static validateHybridCompliance(
    pageScore: number,
    violations: AccessibilityViolation[]
  ): ComplianceResult {
    // Lógica híbrida que considera tanto a pontuação quanto os critérios específicos
    let level: 'Plenamente conforme' | 'Parcialmente conforme' | 'Não conforme';
    const reasons: string[] = [];
    const recommendations: string[] = [];

    // Determinar nível baseado na pontuação
    if (pageScore >= 9.0) {
      level = 'Plenamente conforme';
      reasons.push(`✅ Pontuação excelente: ${pageScore}/10`);
    } else if (pageScore >= 8.0) {
      level = 'Parcialmente conforme';
      reasons.push(`⚠️ Pontuação aceitável: ${pageScore}/10`);
    } else {
      level = 'Não conforme';
      reasons.push(`❌ Pontuação insuficiente: ${pageScore}/10`);
    }

    // Analisar violações por severidade
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    const seriousViolations = violations.filter(v => v.severity === 'serious');

    if (criticalViolations.length > 0) {
      reasons.push(`🚨 Violações críticas: ${criticalViolations.length}`);
      if (level === 'Plenamente conforme') {
        level = 'Parcialmente conforme';
        reasons.push('⚠️ Rebaixado devido a violações críticas');
      }
    }

    if (seriousViolations.length > 0) {
      reasons.push(`⚠️ Violações sérias: ${seriousViolations.length}`);
    }

    // Gerar recomendações baseadas no nível e violações
    if (level === 'Plenamente conforme') {
      recommendations.push('Manter excelente nível de acessibilidade');
      recommendations.push('Monitorizar regularmente para evitar regressões');
    } else if (level === 'Parcialmente conforme') {
      recommendations.push('Corrigir violações críticas prioritariamente');
      recommendations.push('Melhorar violações sérias para atingir conformidade plena');
      recommendations.push('Implementar testes automatizados para prevenir regressões');
    } else {
      recommendations.push('Corrigir TODAS as violações críticas imediatamente');
      recommendations.push('Implementar plano de correção estruturado');
      recommendations.push('Considerar auditoria especializada externa');
      recommendations.push('Estabelecer processo de validação contínua');
    }

    return {
      level,
      score: pageScore,
      criteriaPassRate: 1.0, // Para lógica híbrida, usamos principalmente a pontuação
      reasons,
      recommendations
    };
  }

  /**
   * Validar conformidade de múltiplas páginas
   * Esta é a função principal para auditorias multi-página
   */
  static validateMultiPageCompliance(
    pageResults: Array<{ url: string; score: number; violations: AccessibilityViolation[] }>,
    criteriaSet: 'untile' | 'gov-pt' | 'custom' = 'gov-pt'
  ): ComplianceResult {
    logger.info(`🔍 Validando conformidade de ${pageResults.length} páginas com critérios ${criteriaSet}`);

    if (pageResults.length === 0) {
      return {
        level: 'Não conforme',
        score: 0,
        criteriaPassRate: 0,
        reasons: ['Nenhuma página foi auditada'],
        recommendations: ['Executar auditoria completa do site']
      };
    }

    // Calcular pontuação média
    const totalScore = pageResults.reduce((sum, page) => sum + page.score, 0);
    const averageScore = Math.round((totalScore / pageResults.length) * 100) / 100;

    // Verificar se TODAS as páginas cumprem os critérios mínimos
    const allPagesCompliant = pageResults.every(page => {
      if (criteriaSet === 'gov-pt') {
        return page.score >= 8.0; // Mínimo para gov-pt conforme acessibilidade.gov.pt
      }
      return page.score >= 7.0; // Mínimo para outros critérios
    });

    // Verificar se TODAS as páginas cumprem critérios para "Plenamente conforme"
    const allPagesFullyCompliant = pageResults.every(page => {
      if (criteriaSet === 'gov-pt') {
        return page.score > 9.0; // Para gov-pt: TODAS as páginas devem ser > 9.0
      }
      return page.score >= 9.0; // Para outros critérios
    });

    // Calcular taxa de aprovação dos 10 aspetos críticos (apenas para gov-pt)
    let criticalCriteriaPassRate = 1.0; // Default para outros critérios
    if (criteriaSet === 'gov-pt') {
      // Contar quantos critérios críticos foram violados em todas as páginas
      const criticalCriteriaIds = [
        '1.1.1', '1.4.3', '2.1.1', '2.4.1', '2.4.7', 
        '3.3.2', '4.1.2', '1.3.1', '2.2.1', '3.3.1'
      ];
      
      const totalCriticalCriteria = criticalCriteriaIds.length; // 10 critérios
      let passedCriticalCriteria = totalCriticalCriteria;
      
      // Verificar cada critério crítico
      criticalCriteriaIds.forEach(criteriaId => {
        // Se alguma página violar este critério crítico, consideramos que falhou
        const hasViolation = pageResults.some(page => 
          page.violations.some(violation => violation.criteria.id === criteriaId)
        );
        if (hasViolation) {
          passedCriticalCriteria--;
        }
      });
      
      criticalCriteriaPassRate = passedCriticalCriteria / totalCriticalCriteria;
    }

    // Determinar nível de conformidade geral
    let level: 'Plenamente conforme' | 'Parcialmente conforme' | 'Não conforme';
    const reasons: string[] = [];
    const recommendations: string[] = [];

    if (criteriaSet === 'gov-pt') {
      // LÓGICA EXATA para gov-pt conforme acessibilidade.gov.pt
      // CRITÉRIO 1: Pontuação do AccessMonitor
      // CRITÉRIO 2: Checklist "10 aspetos críticos"
      
      // Verificar requisitos para cada nível
      const allPagesAboveNine = pageResults.every(page => page.score > 9.0);
      const allPagesAboveEight = pageResults.every(page => page.score > 8.0);
      
      // Determinar nível baseado nos DOIS critérios
      if (allPagesAboveNine && criticalCriteriaPassRate >= 0.75) {
        // ✅ Plenamente conforme: TODAS as páginas > 9.0 E ≥75% dos critérios críticos
        level = 'Plenamente conforme';
        reasons.push(`✅ Pontuação média: ${averageScore}/10`);
        reasons.push(`✅ Todas as ${pageResults.length} páginas com pontuação superior a 9.0`);
        reasons.push(`✅ Checklist "10 aspetos críticos": ${Math.round(criticalCriteriaPassRate * 100)}% aprovados`);
        reasons.push('✅ Critério acessibilidade.gov.pt: Plenamente conforme');
      } else if (allPagesAboveEight && criticalCriteriaPassRate >= 0.50) {
        // ⚠️ Parcialmente conforme: TODAS as páginas > 8.0 E 50-75% dos critérios críticos
        level = 'Parcialmente conforme';
        reasons.push(`⚠️ Pontuação média: ${averageScore}/10`);
        reasons.push(`✅ Todas as ${pageResults.length} páginas com pontuação superior a 8.0`);
        reasons.push(`⚠️ Checklist "10 aspetos críticos": ${Math.round(criticalCriteriaPassRate * 100)}% aprovados`);
        reasons.push('⚠️ Critério acessibilidade.gov.pt: Parcialmente conforme');
        
        // Mostrar detalhes do que não está plenamente conforme
        if (!allPagesAboveNine) {
          const notFullyCompliantPages = pageResults.filter(p => p.score <= 9.0);
          reasons.push(`⚠️ ${notFullyCompliantPages.length} páginas não são plenamente conforme (≤ 9.0)`);
        }
        if (criticalCriteriaPassRate < 0.75) {
          const failedCriticalCriteria = Math.round((1 - criticalCriteriaPassRate) * 10);
          reasons.push(`⚠️ ${failedCriticalCriteria} dos 10 aspetos críticos falharam`);
        }
      } else {
        // ❌ Não conforme: Qualquer página ≤ 8.0 OU <50% dos critérios críticos
        level = 'Não conforme';
        reasons.push(`❌ Pontuação média: ${averageScore}/10`);
        
        if (!allPagesAboveEight) {
          const nonCompliantPages = pageResults.filter(p => p.score <= 8.0);
          reasons.push(`❌ ${nonCompliantPages.length} páginas com pontuação ≤ 8.0`);
        }
        if (criticalCriteriaPassRate < 0.50) {
          const failedCriticalCriteria = Math.round((1 - criticalCriteriaPassRate) * 10);
          reasons.push(`❌ ${failedCriticalCriteria} dos 10 aspetos críticos falharam (<50%)`);
        }
        
        reasons.push('❌ Critério acessibilidade.gov.pt: Não conforme');
      }
    } else {
      // Lógica para outros critérios
      if (allPagesFullyCompliant) {
        level = 'Plenamente conforme';
        reasons.push(`✅ Pontuação média excelente: ${averageScore}/10`);
        reasons.push(`✅ Todas as ${pageResults.length} páginas com pontuação ≥ 9.0`);
      } else if (allPagesCompliant) {
        level = 'Parcialmente conforme';
        reasons.push(`⚠️ Pontuação média: ${averageScore}/10`);
        reasons.push(`✅ Todas as ${pageResults.length} páginas cumprem critérios mínimos`);
        
        // Mostrar páginas que não são plenamente conforme
        const notFullyCompliantPages = pageResults.filter(p => p.score < 9.0);
        if (notFullyCompliantPages.length > 0) {
          reasons.push(`⚠️ ${notFullyCompliantPages.length} páginas não são plenamente conforme (< 9.0)`);
        }
      } else {
        level = 'Não conforme';
        reasons.push(`❌ Pontuação média insuficiente: ${averageScore}/10`);
        if (!allPagesCompliant) {
          const nonCompliantPages = pageResults.filter(p => p.score < 7.0);
          reasons.push(`❌ ${nonCompliantPages.length} páginas não cumprem critérios mínimos`);
        }
      }
    }

    // Adicionar estatísticas gerais
    const totalViolations = pageResults.reduce((sum, page) => sum + page.violations.length, 0);
    reasons.push(`📊 Total de violações em todas as páginas: ${totalViolations}`);

    // Gerar recomendações baseadas no nível
    if (level === 'Plenamente conforme') {
      recommendations.push('Manter excelente nível de acessibilidade em todo o site');
      recommendations.push('Implementar monitorização contínua para prevenir regressões');
      if (criteriaSet === 'gov-pt') {
        recommendations.push('✅ Elegível para candidatura ao Selo de Acessibilidade Digital');
        recommendations.push('Considerar certificação oficial de acessibilidade');
      }
    } else if (level === 'Parcialmente conforme') {
      recommendations.push('Corrigir violações nas páginas com menor pontuação');
      recommendations.push('Implementar processo de validação antes de deploy');
      recommendations.push('Estabelecer metas de melhoria mensais');
      if (criteriaSet === 'gov-pt') {
        recommendations.push('⚠️ Trabalhar para atingir conformidade plena (pontuação 9+)');
      }
    } else {
      recommendations.push('Implementar plano de correção prioritário');
      recommendations.push('Corrigir violações críticas em todas as páginas');
      recommendations.push('Considerar auditoria especializada externa');
      recommendations.push('Estabelecer processo de validação obrigatório');
      if (criteriaSet === 'gov-pt') {
        recommendations.push('❌ Não elegível para o Selo de Acessibilidade Digital');
        recommendations.push('Focar em atingir pontuação mínima de 8.0 em todas as páginas');
      }
    }

    return {
      level,
      score: averageScore,
      criteriaPassRate: criticalCriteriaPassRate,
      reasons,
      recommendations
    };
  }

  /**
   * Gerar relatório detalhado de conformidade
   */
  static generateComplianceReport(
    pageResults: Array<{ url: string; score: number; violations: AccessibilityViolation[] }>,
    criteriaSet: 'untile' | 'gov-pt' | 'custom' = 'gov-pt'
  ): string {
    const compliance = this.validateMultiPageCompliance(pageResults, criteriaSet);
    
    let report = `# Relatório de Conformidade - ${criteriaSet.toUpperCase()}\n\n`;
    report += `## Nível de Conformidade: ${compliance.level}\n\n`;
    report += `**Pontuação Média:** ${compliance.score}/10\n`;
    report += `**Critérios Cumpridos:** ${Math.round(compliance.criteriaPassRate * 100)}%\n\n`;

    report += `## Justificação\n\n`;
    compliance.reasons.forEach(reason => {
      report += `- ${reason}\n`;
    });

    report += `\n## Recomendações\n\n`;
    compliance.recommendations.forEach(rec => {
      report += `- ${rec}\n`;
    });

    report += `\n## Análise por Página\n\n`;
    report += `| Página | Pontuação | Status | Violações |\n`;
    report += `|--------|-----------|---------|-----------|\n`;

    pageResults.forEach(page => {
      const pageCompliance = this.validatePageCompliance(page.score, page.violations, criteriaSet);
      const status = pageCompliance.level === 'Plenamente conforme' ? '✅' : 
                    pageCompliance.level === 'Parcialmente conforme' ? '⚠️' : '❌';
      
      report += `| ${page.url} | ${page.score}/10 | ${status} ${pageCompliance.level} | ${page.violations.length} |\n`;
    });

    return report;
  }
}
