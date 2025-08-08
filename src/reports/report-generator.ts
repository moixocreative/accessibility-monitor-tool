import { AuditResult, AccessibilityViolation } from '../types';
import { PRIORITY_WCAG_CRITERIA } from '../core/wcag-criteria';

export interface ReportOptions {
  format: 'console' | 'json' | 'html' | 'markdown';
  detailed: boolean;
  includeRecommendations: boolean;
  includeLegalRisk: boolean;
}

export class ReportGenerator {
  /**
   * Gerar relatório formatado baseado nos resultados da auditoria
   */
  generateReport(auditResult: AuditResult, options: ReportOptions = {
    format: 'console',
    detailed: true,
    includeRecommendations: true,
    includeLegalRisk: true
  }): string {
    switch (options.format) {
      case 'console':
        return this.generateConsoleReport(auditResult, options);
      case 'json':
        return this.generateJsonReport(auditResult, options);
      case 'html':
        return this.generateHtmlReport(auditResult, options);
      case 'markdown':
        return this.generateMarkdownReport(auditResult, options);
      default:
        return this.generateConsoleReport(auditResult, options);
    }
  }

  /**
   * Gerar relatório para console (formato melhorado)
   */
  private generateConsoleReport(auditResult: AuditResult, options: ReportOptions): string {
    const lines: string[] = [];

    // Header com informações do site
    lines.push('');
    lines.push('🌐 RELATÓRIO DE ACESSIBILIDADE WCAG 2.1 AA');
    lines.push('==========================================');
    lines.push(`📅 Data: ${new Date().toLocaleString('pt-PT')}`);
    lines.push(`🔗 URL: ${this.extractUrlFromViolations(auditResult.violations)}`);
    lines.push(`🆔 ID da Auditoria: ${auditResult.id}`);
    lines.push('');

    // Resumo executivo
    lines.push('📊 RESUMO EXECUTIVO');
    lines.push('===================');
    
    const scoreStatus = this.getScoreStatus(auditResult.wcagScore);
    lines.push(`📈 Score WCAG: ${auditResult.wcagScore}% ${scoreStatus.emoji}`);
    lines.push(`📋 Total de Violações: ${auditResult.violations.length}`);
    
    const violationsBySeverity = this.categorizeViolationsBySeverity(auditResult.violations);
    lines.push(`🔴 Críticas: ${violationsBySeverity.critical}`);
    lines.push(`🟡 Sérias: ${violationsBySeverity.serious}`);
    lines.push(`🟠 Moderadas: ${violationsBySeverity.moderate}`);
    lines.push(`🔵 Menores: ${violationsBySeverity.minor}`);
    lines.push(`📊 Taxa de Conformidade: ${this.calculateComplianceRate(auditResult.violations)}%`);
    lines.push('');

    // Análise detalhada das violações
    if (auditResult.violations.length > 0) {
      lines.push('🔍 ANÁLISE DETALHADA DAS VIOLAÇÕES');
      lines.push('==================================');
      
      const priorityViolations = this.getPriorityViolations(auditResult.violations);
      const otherViolations = this.getOtherViolations(auditResult.violations);

      if (priorityViolations.length > 0) {
        lines.push('');
        lines.push('🎯 VIOLAÇÕES DOS CRITÉRIOS PRIORITÁRIOS');
        lines.push('---------------------------------------');
        lines.push(`Encontradas ${priorityViolations.length} violações nos 15 critérios prioritários:`);
        lines.push('');
        
        priorityViolations.forEach((violation, index) => {
          lines.push(...this.formatViolationDetails(violation, index + 1, options.detailed));
        });
      }

      if (otherViolations.length > 0) {
        lines.push('');
        lines.push('📋 VIOLAÇÕES DOS CRITÉRIOS ADICIONAIS');
        lines.push('------------------------------------');
        lines.push(`Encontradas ${otherViolations.length} violações em critérios adicionais:`);
        lines.push('');
        
        otherViolations.forEach((violation, index) => {
          lines.push(...this.formatViolationDetails(violation, index + 1, options.detailed));
        });
      }
    } else {
      lines.push('✅ NENHUMA VIOLAÇÃO ENCONTRADA');
      lines.push('==============================');
      lines.push('🎉 Parabéns! O site está em conformidade com os critérios testados.');
    }

    // Métricas Lighthouse
    if (auditResult.lighthouseScore) {
      lines.push('');
      lines.push('🚀 MÉTRICAS LIGHTHOUSE');
      lines.push('======================');
      lines.push(`🎯 Acessibilidade: ${auditResult.lighthouseScore.accessibility}% ${this.getScoreEmoji(auditResult.lighthouseScore.accessibility)}`);
      lines.push(`⚡ Performance: ${auditResult.lighthouseScore.performance}% ${this.getScoreEmoji(auditResult.lighthouseScore.performance)}`);
      lines.push(`🔍 SEO: ${auditResult.lighthouseScore.seo}% ${this.getScoreEmoji(auditResult.lighthouseScore.seo)}`);
      lines.push(`✅ Boas Práticas: ${auditResult.lighthouseScore.bestPractices}% ${this.getScoreEmoji(auditResult.lighthouseScore.bestPractices)}`);
    }

    // Métricas de Risco Legal
    if (options.includeLegalRisk && (auditResult as any).legalRiskMetrics) {
      const legalRisk = (auditResult as any).legalRiskMetrics;
      lines.push('');
      lines.push('⚖️  ANÁLISE DE RISCO LEGAL');
      lines.push('=========================');
      lines.push(`📊 Risco Legal: ${legalRisk.legalRiskScore}/100 ${this.getRiskEmoji(legalRisk.legalRiskScore)}`);
      lines.push(`📈 Exposição Legal: ${legalRisk.exposureScore}/100 ${this.getRiskEmoji(legalRisk.exposureScore)}`);
      lines.push(`🏷️  Nível de Risco: ${legalRisk.riskLevel} ${this.getRiskLevelEmoji(legalRisk.riskLevel)}`);
      lines.push('');
      lines.push('📋 Detalhes:');
      lines.push(`   • Violações Críticas: ${legalRisk.criticalViolations}`);
      lines.push(`   • Violações Sérias: ${legalRisk.seriousViolations}`);
      lines.push(`   • Violações Prioritárias: ${legalRisk.priorityViolations}`);
    }

    // Recomendações
    if (options.includeRecommendations) {
      lines.push('');
      lines.push('💡 RECOMENDAÇÕES PERSONALIZADAS');
      lines.push('===============================');
      lines.push(...this.generateRecommendations(auditResult));
    }

    // Próximos passos
    lines.push('');
    lines.push('🛠️  PRÓXIMOS PASSOS');
    lines.push('==================');
    lines.push(...this.generateNextSteps(auditResult));

    // Footer
    lines.push('');
    lines.push('📚 RECURSOS ADICIONAIS');
    lines.push('======================');
    lines.push('🌐 WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/');
    lines.push('🛠️  WebAIM: https://webaim.org/');
    lines.push('📖 MDN Accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility');
    lines.push('');
    lines.push('---');
    lines.push(`🤖 Relatório gerado automaticamente em ${new Date().toLocaleString('pt-PT')}`);
    lines.push('⚡ Powered by UNTILE Accessibility Monitor Tool');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Gerar relatório em formato JSON
   */
  private generateJsonReport(auditResult: AuditResult, options: ReportOptions): string {
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        auditId: auditResult.id,
        url: this.extractUrlFromViolations(auditResult.violations),
        toolVersion: '1.0.0',
        wcagVersion: '2.1 AA'
      },
      summary: {
        wcagScore: auditResult.wcagScore,
        totalViolations: auditResult.violations.length,
        complianceRate: this.calculateComplianceRate(auditResult.violations),
        violationsBySeverity: this.categorizeViolationsBySeverity(auditResult.violations),
        riskLevel: (auditResult as any).legalRiskMetrics?.riskLevel || 'UNKNOWN'
      },
      violations: auditResult.violations.map(v => ({
        id: v.id,
        criteria: v.criteria,
        severity: v.severity,
        description: v.description,
        element: options.detailed ? v.element : undefined,
        timestamp: v.timestamp
      })),
      scores: {
        wcag: auditResult.wcagScore,
        lighthouse: auditResult.lighthouseScore
      },
      legalRisk: options.includeLegalRisk ? (auditResult as any).legalRiskMetrics : undefined,
      recommendations: options.includeRecommendations ? this.generateRecommendations(auditResult) : undefined
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * Gerar relatório em formato HTML
   */
  private generateHtmlReport(auditResult: AuditResult, options: ReportOptions): string {
    const scoreStatus = this.getScoreStatus(auditResult.wcagScore);
    const violationsBySeverity = this.categorizeViolationsBySeverity(auditResult.violations);
    
    return `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Acessibilidade WCAG 2.1 AA</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #007acc; padding-bottom: 20px; margin-bottom: 30px; }
        .score-badge { display: inline-block; padding: 10px 20px; border-radius: 25px; font-weight: bold; margin: 10px; }
        .score-excellent { background: #4caf50; color: white; }
        .score-good { background: #ff9800; color: white; }
        .score-poor { background: #f44336; color: white; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007acc; }
        .violation { background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 15px; margin: 10px 0; }
        .violation-critical { border-left: 4px solid #e53e3e; }
        .violation-serious { border-left: 4px solid #dd6b20; }
        .violation-moderate { border-left: 4px solid #d69e2e; }
        .violation-minor { border-left: 4px solid #3182ce; }
        .recommendations { background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌐 Relatório de Acessibilidade WCAG 2.1 AA</h1>
            <p><strong>URL:</strong> ${this.extractUrlFromViolations(auditResult.violations)}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleString('pt-PT')}</p>
            <div class="score-badge ${scoreStatus.class}">
                Score WCAG: ${auditResult.wcagScore}% ${scoreStatus.emoji}
            </div>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <h3>📊 Violações Totais</h3>
                <p style="font-size: 2em; margin: 0; color: #007acc;">${auditResult.violations.length}</p>
            </div>
            <div class="metric-card">
                <h3>🎯 Taxa de Conformidade</h3>
                <p style="font-size: 2em; margin: 0; color: #007acc;">${this.calculateComplianceRate(auditResult.violations)}%</p>
            </div>
            <div class="metric-card">
                <h3>🔴 Violações Críticas</h3>
                <p style="font-size: 2em; margin: 0; color: #e53e3e;">${violationsBySeverity.critical}</p>
            </div>
            <div class="metric-card">
                <h3>⚖️ Risco Legal</h3>
                <p style="font-size: 2em; margin: 0; color: #007acc;">${(auditResult as any).legalRiskMetrics?.riskLevel || 'N/A'}</p>
            </div>
        </div>

        ${this.generateHtmlViolationsSection(auditResult.violations, options.detailed)}
        
        ${options.includeRecommendations ? this.generateHtmlRecommendations(auditResult) : ''}

        <div class="footer">
            <p>🤖 Relatório gerado automaticamente em ${new Date().toLocaleString('pt-PT')}</p>
            <p>⚡ Powered by UNTILE Accessibility Monitor Tool</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Gerar relatório em formato Markdown
   */
  private generateMarkdownReport(auditResult: AuditResult, options: ReportOptions): string {
    const lines: string[] = [];
    const scoreStatus = this.getScoreStatus(auditResult.wcagScore);
    const violationsBySeverity = this.categorizeViolationsBySeverity(auditResult.violations);

    // Header
    lines.push('# 🌐 Relatório de Acessibilidade WCAG 2.1 AA');
    lines.push('');
    lines.push(`**📅 Data:** ${new Date().toLocaleString('pt-PT')}`);
    lines.push(`**🔗 URL:** ${this.extractUrlFromViolations(auditResult.violations)}`);
    lines.push(`**🆔 ID da Auditoria:** ${auditResult.id}`);
    lines.push('');

    // Resumo
    lines.push('## 📊 Resumo Executivo');
    lines.push('');
    lines.push(`| Métrica | Valor |`);
    lines.push(`|---------|-------|`);
    lines.push(`| Score WCAG | **${auditResult.wcagScore}%** ${scoreStatus.emoji} |`);
    lines.push(`| Total de Violações | ${auditResult.violations.length} |`);
    lines.push(`| Violações Críticas | ${violationsBySeverity.critical} |`);
    lines.push(`| Taxa de Conformidade | ${this.calculateComplianceRate(auditResult.violations)}% |`);
    lines.push('');

    // Violações
    if (auditResult.violations.length > 0) {
      lines.push('## 🔍 Violações Encontradas');
      lines.push('');
      
      auditResult.violations.forEach((violation, index) => {
        lines.push(`### ${index + 1}. ${violation.criteria.id} - ${violation.criteria.name}`);
        lines.push('');
        lines.push(`**Severidade:** ${this.getSeverityEmoji(violation.severity)} ${violation.severity.toUpperCase()}`);
        lines.push(`**Descrição:** ${violation.description}`);
        lines.push('');
        if (options.detailed && violation.element) {
          lines.push('**Elemento:**');
          lines.push('```html');
          lines.push(violation.element.substring(0, 200) + (violation.element.length > 200 ? '...' : ''));
          lines.push('```');
          lines.push('');
        }
      });
    }

    // Recomendações
    if (options.includeRecommendations) {
      lines.push('## 💡 Recomendações');
      lines.push('');
      const recommendations = this.generateRecommendations(auditResult);
      recommendations.forEach(rec => lines.push(`- ${rec}`));
      lines.push('');
    }

    // Footer
    lines.push('---');
    lines.push(`*Relatório gerado automaticamente em ${new Date().toLocaleString('pt-PT')}*`);
    lines.push('*⚡ Powered by UNTILE Accessibility Monitor Tool*');

    return lines.join('\n');
  }

  // Métodos auxiliares
  private extractUrlFromViolations(violations: AccessibilityViolation[]): string {
    return violations.length > 0 && violations[0]?.page ? violations[0].page : 'N/A';
  }

  private getScoreStatus(score: number): { emoji: string; class: string } {
    if (score >= 90) return { emoji: '🟢', class: 'score-excellent' };
    if (score >= 70) return { emoji: '🟡', class: 'score-good' };
    return { emoji: '🔴', class: 'score-poor' };
  }

  private getScoreEmoji(score: number): string {
    if (score >= 90) return '🟢';
    if (score >= 70) return '🟡';
    return '🔴';
  }

  private getRiskEmoji(score: number): string {
    if (score <= 30) return '🟢';
    if (score <= 60) return '🟡';
    return '🔴';
  }

  private getRiskLevelEmoji(level: string): string {
    switch (level) {
      case 'BAIXO': return '🟢';
      case 'MÉDIO': return '🟡';
      case 'ALTO': return '🔴';
      default: return '⚪';
    }
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical': return '🔴';
      case 'serious': return '🟡';
      case 'moderate': return '🟠';
      case 'minor': return '🔵';
      default: return '⚪';
    }
  }

  private categorizeViolationsBySeverity(violations: AccessibilityViolation[]): {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  } {
    return {
      critical: violations.filter(v => v.severity === 'critical').length,
      serious: violations.filter(v => v.severity === 'serious').length,
      moderate: violations.filter(v => v.severity === 'moderate').length,
      minor: violations.filter(v => v.severity === 'minor').length
    };
  }

  private calculateComplianceRate(violations: AccessibilityViolation[]): number {
    // Calcular taxa de conformidade baseada no número de critérios testados vs violações
    const totalCriteria = PRIORITY_WCAG_CRITERIA.length;
    const violatedCriteria = new Set(violations.map(v => v.criteria.id)).size;
    return Math.round(((totalCriteria - violatedCriteria) / totalCriteria) * 100);
  }

  private getPriorityViolations(violations: AccessibilityViolation[]): AccessibilityViolation[] {
    return violations.filter(v => 
      PRIORITY_WCAG_CRITERIA.some(criteria => criteria.id === v.criteria.id)
    );
  }

  private getOtherViolations(violations: AccessibilityViolation[]): AccessibilityViolation[] {
    return violations.filter(v => 
      !PRIORITY_WCAG_CRITERIA.some(criteria => criteria.id === v.criteria.id)
    );
  }

  private formatViolationDetails(violation: AccessibilityViolation, index: number, detailed: boolean): string[] {
    const lines: string[] = [];
    const severityEmoji = this.getSeverityEmoji(violation.severity);
    
    lines.push(`${index}. ${severityEmoji} **${violation.criteria.id} - ${violation.criteria.name}**`);
    lines.push(`   📝 ${violation.description}`);
    lines.push(`   🎯 Severidade: ${violation.severity.toUpperCase()}`);
    lines.push(`   📊 Prioridade: ${violation.criteria.priority}`);
    
    if (detailed && violation.element) {
      const elementPreview = violation.element.substring(0, 100) + (violation.element.length > 100 ? '...' : '');
      lines.push(`   🔍 Elemento: ${elementPreview}`);
    }
    
    lines.push('');
    return lines;
  }

  private generateRecommendations(auditResult: AuditResult): string[] {
    const recommendations: string[] = [];
    const criticalViolations = auditResult.violations.filter(v => v.severity === 'critical').length;
    const score = auditResult.wcagScore;

    if (score === -1) {
      recommendations.push('❌ Não foi possível executar a auditoria completa');
      recommendations.push('🔧 Verifique a configuração do browser e tente novamente');
    } else if (score >= 90) {
      recommendations.push('✅ Excelente conformidade WCAG 2.1 AA');
      recommendations.push('🎉 Continue monitorando para manter a qualidade');
      recommendations.push('📚 Considere implementar critérios WCAG 2.1 AAA para excelência');
    } else if (score >= 70) {
      recommendations.push('⚠️ Boa conformidade, mas há espaço para melhorias');
      recommendations.push('🔧 Priorize a correção das violações críticas');
      if (criticalViolations > 0) {
        recommendations.push(`🚨 Corrija imediatamente as ${criticalViolations} violações críticas`);
      }
    } else if (score >= 50) {
      recommendations.push('⚠️ Conformidade moderada - melhorias necessárias');
      recommendations.push('🚨 Priorize a correção das violações críticas e sérias');
      recommendations.push('📋 Implemente um plano de correção estruturado');
    } else {
      recommendations.push('❌ Baixa conformidade WCAG 2.1 AA');
      recommendations.push('🚨 Correções urgentes necessárias');
      recommendations.push('👨‍💻 Considere contratar especialista em acessibilidade');
      recommendations.push('📚 Treinamento da equipe em acessibilidade é essencial');
    }

    // Recomendações específicas por tipo de violação
    const violationTypes = new Set(auditResult.violations.map(v => v.criteria.id));
    
    if (violationTypes.has('1.4.3')) {
      recommendations.push('🎨 Melhore o contraste de cores para pelo menos 4.5:1');
    }
    
    if (violationTypes.has('4.1.2')) {
      recommendations.push('🏷️ Adicione labels adequados aos elementos interativos');
    }
    
    if (violationTypes.has('1.1.1')) {
      recommendations.push('🖼️ Adicione texto alternativo descritivo às imagens');
    }

    return recommendations;
  }

  private generateNextSteps(auditResult: AuditResult): string[] {
    const steps: string[] = [];
    const criticalCount = auditResult.violations.filter(v => v.severity === 'critical').length;
    const seriousCount = auditResult.violations.filter(v => v.severity === 'serious').length;

    steps.push('1️⃣ **Priorizar correções por severidade:**');
    if (criticalCount > 0) {
      steps.push(`   • Corrigir ${criticalCount} violações críticas (prazo: 1-2 dias)`);
    }
    if (seriousCount > 0) {
      steps.push(`   • Corrigir ${seriousCount} violações sérias (prazo: 1 semana)`);
    }
    
    steps.push('2️⃣ **Implementar testes contínuos de acessibilidade**');
    steps.push('3️⃣ **Treinar equipe em boas práticas de acessibilidade**');
    steps.push('4️⃣ **Realizar auditoria de acompanhamento em 30 dias**');
    steps.push('5️⃣ **Considerar auditoria com utilizadores reais**');

    return steps;
  }

  private generateHtmlViolationsSection(violations: AccessibilityViolation[], detailed: boolean): string {
    if (violations.length === 0) {
      return '<div class="recommendations"><h2>✅ Nenhuma Violação Encontrada</h2><p>🎉 Parabéns! O site está em conformidade com os critérios testados.</p></div>';
    }

    let html = '<h2>🔍 Violações Encontradas</h2>';
    
    violations.forEach((violation, index) => {
      const severityClass = `violation-${violation.severity}`;
      const severityEmoji = this.getSeverityEmoji(violation.severity);
      
      html += `
        <div class="violation ${severityClass}">
          <h3>${index + 1}. ${severityEmoji} ${violation.criteria.id} - ${violation.criteria.name}</h3>
          <p><strong>Severidade:</strong> ${violation.severity.toUpperCase()}</p>
          <p><strong>Descrição:</strong> ${violation.description}</p>
          ${detailed && violation.element ? `<p><strong>Elemento:</strong><br><code>${violation.element.substring(0, 200)}${violation.element.length > 200 ? '...' : ''}</code></p>` : ''}
        </div>
      `;
    });

    return html;
  }

  private generateHtmlRecommendations(auditResult: AuditResult): string {
    const recommendations = this.generateRecommendations(auditResult);
    
    let html = '<div class="recommendations"><h2>💡 Recomendações Personalizadas</h2><ul>';
    recommendations.forEach(rec => {
      html += `<li>${rec}</li>`;
    });
    html += '</ul></div>';
    
    return html;
  }
}