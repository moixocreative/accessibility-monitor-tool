import { AuditResult, PageResult, MultiPageReport } from '../types';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

export interface ReportOptions {
  outputDir: string;
  includeChecklist: boolean;
  includeViolations: boolean;
  includeCompliance: boolean;
  includeRecommendations: boolean;
}

export interface MultiPageReportData {
  baseUrl: string;
  totalPages: number;
  pagesAudited: number;
  startTime: Date;
  endTime: Date;
  pageResults: AuditResult[];
  overallCompliance: 'PLENAMENTE CONFORME' | 'PARCIALMENTE CONFORME' | 'NÃO CONFORME';
  complianceDetails: {
    wcagScore: number;
    checklistPercentage: number;
    reason: string;
  };
  summary: {
    averageScore: number;
    totalViolations: number;
    violationsBySeverity: Record<string, number>;
    violationsByType: Record<string, number>;
  };
}

export class HTMLReportGenerator {
  private readonly defaultOptions: ReportOptions = {
    outputDir: 'reports',
    includeChecklist: true,
    includeViolations: true,
    includeCompliance: true,
    includeRecommendations: true
  };

  /**
   * Gerar relatório para uma única página
   */
  async generateSinglePageReport(
    auditResult: AuditResult,
    options: Partial<ReportOptions> = {}
  ): Promise<string> {
    // eslint-disable-next-line no-unused-vars
    const opts = { ...this.defaultOptions, ...options };
    const reportPath = this.generateReportPath(auditResult.siteId, 'single-page');
    
    const html = this.generateSinglePageHTML(auditResult);
    
    await this.saveReport(reportPath, html);
    logger.info(`Relatório de página única gerado: ${reportPath}`);
    
    return reportPath;
  }

  /**
   * Gerar relatório para múltiplas páginas (site completo)
   */
  async generateMultiPageReport(
    reportData: MultiPageReport
  ): Promise<string> {
    const reportPath = this.generateReportPath('multi-page', 'site-audit');
    
    const html = this.generateMultiPageHTML(reportData);
    
    await this.saveReport(reportPath, html);
    logger.info(`Relatório multi-página gerado: ${reportPath}`);
    
    return reportPath;
  }

  /**
   * Gerar HTML para página única com o mesmo estilo do relatório multi-página
   */
  public generateSinglePageHTML(auditResult: AuditResult): string {
    const violationsBySeverity = this.groupViolationsBySeverity(auditResult.violations);
    const complianceLevel = this.calculateComplianceLevel(auditResult.wcagScore, auditResult.checklistResults?.percentage || 0);

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Auditoria de Acessibilidade - ${auditResult.url}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
            margin-top: 20px;
            margin-bottom: 20px;
        }
        
        /* Header */
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 30px;
            margin-top: 30px;
        }
        
        .meta-item {
            text-align: center;
        }
        
        .meta-label {
            font-size: 0.9rem;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        
        .meta-value {
            font-size: 1.1rem;
            font-weight: 600;
        }
        
        /* Summary */
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }
        
        .metric-card {
            background: white;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }
        
        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .metric-value {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .metric-label {
            font-size: 1.1rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .score-excellent { color: #28a745; }
        .score-good { color: #ffc107; }
        .score-poor { color: #dc3545; }
        
        /* Compliance Level */
        .compliance {
            grid-column: 1 / -1;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            font-size: 1.5rem;
            font-weight: 700;
            color: white;
            margin-top: 20px;
        }
        
        .compliance.plenamente-conforme { background: linear-gradient(135deg, #28a745, #20c997); }
        .compliance.parcialmente-conforme { background: linear-gradient(135deg, #ffc107, #fd7e14); }
        .compliance.não-conforme { background: linear-gradient(135deg, #dc3545, #e83e8c); }
        
        /* Violations Section */
        .violations-section {
            padding: 40px;
        }
        
        .violations-title {
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 30px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .severity-group {
            margin-bottom: 30px;
        }
        
        .severity-title {
            font-size: 1.3rem;
            font-weight: 600;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            color: white;
        }
        
        .severity-title.severity-critical { background: #dc3545; }
        .severity-title.severity-serious { background: #fd7e14; }
        .severity-title.severity-moderate { background: #ffc107; color: #333; }
        .severity-title.severity-minor { background: #6c757d; }
        
        .violation {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 4px solid;
        }
        
        .violation.critical { border-left-color: #dc3545; }
        .violation.serious { border-left-color: #fd7e14; }
        .violation.moderate { border-left-color: #ffc107; }
        .violation.minor { border-left-color: #6c757d; }
        
        .violation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .violation-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
        }
        
        .violation-rule {
            color: #666;
            font-size: 0.9em;
        }
        
        .violation-detail {
            padding: 15px;
        }
        
        .violation-desc {
            margin-bottom: 15px;
            color: #555;
        }
        
        .violation-element {
            background: #f1f3f4;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            overflow-x: auto;
            margin-top: 10px;
        }
        
        /* Checklist Section */
        .checklist-section {
            padding: 40px;
            background: #f8f9fa;
        }
        
        .checklist-title {
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 30px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .checklist-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background: white;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .checklist-status {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-pass { background: #d4edda; color: #155724; }
        .status-fail { background: #f8d7da; color: #721c24; }
        
        /* Footer */
        .footer {
            background: #343a40;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 0.9em;
        }
        
        .timestamp {
            color: #999;
            font-size: 0.8em;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Relatório de Auditoria de Acessibilidade</h1>
            <div class="meta">
                <div class="meta-item">
                    <div class="meta-label">Página</div>
                    <div class="meta-value">${auditResult.url}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Data</div>
                    <div class="meta-value">${new Date().toLocaleDateString('pt-PT')}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Tipo</div>
                    <div class="meta-value">Página Individual</div>
                </div>
            </div>
        </div>
        
        <div class="summary">
            <div class="metric-card score-${this.getScoreClass(auditResult.wcagScore)}">
                <div class="metric-value">${auditResult.wcagScore.toFixed(1)}</div>
                <div class="metric-label">Score WCAG</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${auditResult.violations.length}</div>
                <div class="metric-label">Total de Violações</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${(auditResult.checklistResults?.percentage || 0).toFixed(1)}%</div>
                <div class="metric-label">Checklist Crítico</div>
            </div>
            
            <div class="compliance compliance-${complianceLevel.toLowerCase().replace(' ', '-')}">
                Nível de Conformidade: ${complianceLevel}
            </div>
        </div>
        
        <div class="violations-section">
            <div class="violations-title">🚨 Detalhes das Violações</div>
            ${this.generateViolationsHTML(violationsBySeverity)}
        </div>
        
        <div class="checklist-section">
            <div class="checklist-title">📋 Checklist dos 10 Aspetos Críticos</div>
            ${this.generateChecklistHTML(auditResult.checklistResults)}
        </div>
        
        <div class="footer">
            <p>Relatório gerado automaticamente pela ferramenta de monitorização de acessibilidade UNTILE</p>
            <p>Data: ${new Date().toLocaleString('pt-PT')}</p>
        </div>
    </div>
</body>
</html>`;
  }



  /**
   * Gerar HTML para violações
   */
  private generateViolationsHTML(violationsBySeverity: Record<string, any[]>): string {
    const severityOrder = ['critical', 'serious', 'moderate', 'minor'];
    const severityLabels: Record<string, string> = {
      critical: 'Críticas',
      serious: 'Sérias', 
      moderate: 'Moderadas',
      minor: 'Menores'
    };

    let html = '';
    
    severityOrder.forEach(severity => {
      const violations = violationsBySeverity[severity] || [];
      if (violations.length === 0) return;

      // Filtrar falsos positivos para violações menores
      let filteredViolations = violations;
      if (severity === 'minor') {
        filteredViolations = violations.filter(violation => {
          const rule = violation.rule || violation.id || '';
          const description = violation.help || violation.description || '';
          
          // Lista de regras que são falsos positivos (sucessos disfarçados de violações)
          const falsePositiveRules = [
            'img_01a', // "Constatei que todas as imagens da página têm o necessário equivalente alternativo em texto"
            'hx_03',   // "Constatei que a sequência hierárquica dos níveis de cabeçalho está correta"
            'a_01b',   // Links que estão corretos
            'color_02', // Cores que estão corretas
            'lang_01', // "Verifiquei que o idioma principal da página está marcado"
            'title_01', // Títulos que estão corretos
            'form_01', // Formulários que estão corretos
            'table_01', // Tabelas que estão corretas
            'media_01', // Media que está correto
            'landmark_01' // Landmarks que estão corretos
          ];
          
          // Verificar se é um falso positivo baseado na regra ou descrição
          if (falsePositiveRules.includes(rule)) {
            return false;
          }
          
          // Verificar se a descrição indica sucesso
          const successIndicators = [
            'constatei que',
            'verifiquei que',
            'está correto',
            'está adequado',
            'tem o necessário',
            'está bem estruturado',
            'passou no teste',
            'está marcado como',
            'está definido',
            'está configurado',
            'está implementado',
            'está presente',
            'está disponível',
            'está funcionando',
            'está operacional'
          ];
          
          return !successIndicators.some(indicator => 
            description.toLowerCase().includes(indicator.toLowerCase())
          );
        });
      }

      if (filteredViolations.length === 0) return;

      html += `
        <div class="severity-group">
          <div class="severity-title severity-${severity}">${severityLabels[severity] || severity} (${filteredViolations.length})</div>
      `;

      filteredViolations.forEach(violation => {
        // Usar os métodos existentes para obter nomes descritivos
        const violationName = this.getViolationDisplayName(violation.rule || violation.id || '');
        const violationDescription = violation.help || violation.description || violationName;
        
        // Obter sugestão de correção
        const fixSuggestion = this.getFixSuggestion(violation.rule || violation.id || '');
        
        html += `
          <div class="violation">
            <div class="violation-header">
              <div class="violation-title">${violationName}</div>
              <div class="violation-rule">${violation.rule || violation.id || 'Regra não especificada'}</div>
            </div>
            <div class="violation-detail">
              <div class="violation-desc">${violationDescription}</div>
              ${violation.element ? `
                <div class="violation-element">
                  <strong>🔍 Código HTML problemático:</strong>
                  <pre>${this.escapeHtml(violation.element)}</pre>
                </div>
              ` : ''}
              <div class="fix-suggestion">
                <strong>💡 Como corrigir:</strong> ${fixSuggestion}
              </div>
            </div>
          </div>
        `;
      });

      html += '</div>';
    });

    return html;
  }

  /**
   * Gerar HTML para checklist
   */
  private generateChecklistHTML(checklistResults: any): string {
    if (!checklistResults) return '<p>Checklist não disponível</p>';

    const items = [
      'Navegação por menus',
      'Títulos e subtítulos',
      'Imagens e gráficos',
      'Formulários',
      'Tabelas',
      'Links',
      'Cores e contrastes',
      'Multimédia',
      'Estrutura e landmarks',
      'Gestão do foco'
    ];

    return `
      <div class="checklist-summary">
        <p><strong>Percentagem de conformidade:</strong> ${checklistResults.percentage}% (${checklistResults.passed}/${checklistResults.total})</p>
      </div>
      <div class="checklist-items">
        ${items.map((item, index) => {
          const passed = index < checklistResults.passed;
          return `
            <div class="checklist-item">
              <span>${item}</span>
              <span class="checklist-status status-${passed ? 'pass' : 'fail'}">
                ${passed ? 'PASSOU' : 'FALHOU'}
              </span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /**
   * Gerar HTML para recomendações
   */
  private generateRecommendationsHTML(auditResult: AuditResult): string {
    const criticalCount = this.countViolationsBySeverity(auditResult.violations, 'critical');
    const seriousCount = this.countViolationsBySeverity(auditResult.violations, 'serious');
    
    let priority = 'Baixa';
    if (criticalCount > 0) priority = 'Alta';
    else if (seriousCount > 0) priority = 'Média';
    
    return `
      <div class="checklist-section">
        <h2>💡 Recomendações e Próximos Passos</h2>
        <div style="background: white; padding: 20px; border-radius: 8px;">
          <h3>Prioridade de Correção: <span style="color: ${priority === 'Alta' ? '#dc3545' : priority === 'Média' ? '#ffc107' : '#28a745'}">${priority}</span></h3>
          ${criticalCount > 0 ? `<p>🚨 <strong>${criticalCount} violação(ões) crítica(s)</strong> devem ser corrigidas imediatamente</p>` : ''}
          ${seriousCount > 0 ? `<p>⚠️ <strong>${seriousCount} violação(ões) séria(s)</strong> devem ser corrigidas o mais cedo possível</p>` : ''}
          <p>📚 Consulte as <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank">WCAG 2.1</a> para orientações detalhadas</p>
        </div>
      </div>
    `;
  }

  /**
   * Gerar HTML para resultado de página individual
   */
  private generatePageResultHTML(pageResult: AuditResult): string {
    const wcagScore = pageResult.wcagScore || 0;
    const scoreClass = this.getScoreClass(wcagScore);
    const complianceLevel = this.calculateSinglePageCompliance(pageResult);
    
    return `
      <div class="page-result">
        <div class="page-header">
          <div class="page-title">${pageResult.url || 'N/A'}</div>
          <div class="page-url">${pageResult.url || 'N/A'}</div>
          <div class="page-score score-${scoreClass}">${wcagScore.toFixed(1)}/10</div>
        </div>
        <div class="page-details">
          <div class="page-stats">
            <div class="page-stat">
              <div class="page-stat-number">${pageResult.violations.length}</div>
              <div class="page-stat-label">Violações</div>
            </div>
            <div class="page-stat">
              <div class="page-stat-number">${this.countViolationsBySeverity(pageResult.violations, 'critical')}</div>
              <div class="page-stat-label">Críticas</div>
            </div>
            <div class="page-stat">
              <div class="page-stat-number">${this.countViolationsBySeverity(pageResult.violations, 'serious')}</div>
              <div class="page-stat-label">Sérias</div>
            </div>
            <div class="page-stat">
              <div class="page-stat-number">${pageResult.checklistResults?.percentage || 0}%</div>
              <div class="page-stat-label">Checklist</div>
            </div>
          </div>
          <div style="margin-top: 10px;">
            <strong>Conformidade:</strong> 
            <span class="compliance-badge compliance-${complianceLevel.toLowerCase().replace(' ', '-')}">
              ${complianceLevel}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Agrupar violações por severidade
   */
  private groupViolationsBySeverity(violations: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {
      critical: [],
      serious: [],
      moderate: [],
      minor: []
    };

    violations.forEach(violation => {
      const severity = violation.severity || 'moderate';
      if (grouped[severity]) {
        grouped[severity].push(violation);
      } else {
        grouped.moderate!.push(violation);
      }
    });

    return grouped;
  }

  /**
   * Contar violações por severidade
   */
  private countViolationsBySeverity(violations: any[], severity: string): number {
    return violations.filter(v => v.severity === severity).length;
  }

  /**
   * Calcular conformidade para página única
   */
  private calculateSinglePageCompliance(auditResult: AuditResult): string {
    const wcagScore = auditResult.wcagScore;
    const checklistPercentage = auditResult.checklistResults?.percentage || 0;

    if (wcagScore > 9 && checklistPercentage >= 75) {
      return 'PLENAMENTE CONFORME';
    } else if (wcagScore > 8 && checklistPercentage >= 50 && checklistPercentage < 75) {
      return 'PARCIALMENTE CONFORME';
    } else {
      return 'NÃO CONFORME';
    }
  }

  /**
   * Calcular conformidade para site completo
   */
  private calculateComplianceLevel(score: number, checklistPercentage: number): string {
    if (score > 9 && checklistPercentage >= 75) {
      return 'Plenamente conforme';
    } else if (score > 8 && checklistPercentage >= 50 && checklistPercentage < 75) {
      return 'Parcialmente conforme';
    } else {
      return 'Não conforme';
    }
  }

  /**
   * Obter classe CSS para score
   */
  private getScoreClass(score: number): string {
    if (score >= 9) return 'excellent';
    if (score >= 7) return 'good';
    return 'poor';
  }

  /**
   * Obter descrição da conformidade
   */
  private getComplianceDescription(complianceLevel: string): string {
    switch (complianceLevel) {
      case 'PLENAMENTE CONFORME':
        return 'O site atende aos mais altos padrões de acessibilidade. Todas as páginas têm score superior a 9 e passam pelo menos 75% dos requisitos da checklist.';
      case 'PARCIALMENTE CONFORME':
        return 'O site tem boa acessibilidade mas ainda precisa de melhorias. Todas as páginas têm score superior a 8 e passam entre 50% e 75% dos requisitos da checklist.';
      case 'NÃO CONFORME':
        return 'O site não atende aos padrões mínimos de acessibilidade. Páginas com score inferior a 8 ou que violam mais de 50% dos requisitos da checklist.';
      default:
        return 'Conformidade não determinada.';
    }
  }

  /**
   * Gerar caminho do relatório
   */
  private generateReportPath(siteId: string, type: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `accessibility-report-${siteId}-${type}-${timestamp}.html`;
    return path.join(this.defaultOptions.outputDir, filename);
  }

  /**
   * Salvar relatório
   */
  private async saveReport(filePath: string, html: string): Promise<void> {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, html, 'utf8');
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Gerar HTML para relatório multi-página usando o template preferido
   */
  public generateMultiPageHTML(reportData: MultiPageReport): string {
    console.log('🔍 Inside generateMultiPageHTML function');
    console.log('📊 Page results count:', reportData.pageResults.length);
    console.log('🔍 Report data keys:', Object.keys(reportData));
    const criticalViolations = this.extractCriticalViolations(reportData.pageResults);
    const otherViolations = this.extractOtherViolations(reportData.pageResults);

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Auditoria de Acessibilidade - ${reportData.baseUrl}</title>
    <style>
        /* Reset e Base */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            margin-top: 20px;
            margin-bottom: 20px;
        }
        
        /* Header */
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header .meta {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        
        .header .meta-item {
            text-align: center;
        }
        
        .header .meta-label {
            font-size: 0.9rem;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .header .meta-value {
            font-size: 1.1rem;
            font-weight: 600;
            margin-top: 5px;
        }
        
        /* Summary Cards */
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }
        
        .metric-card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }
        
        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .metric-card.score-excellent { border-color: #28a745; }
        .metric-card.score-good { border-color: #17a2b8; }
        .metric-card.score-warning { border-color: #ffc107; }
        .metric-card.score-poor { border-color: #dc3545; }
        
        .metric-value {
            font-size: 3rem;
            font-weight: 800;
            margin-bottom: 10px;
        }
        
        .metric-card.score-excellent .metric-value { color: #28a745; }
        .metric-card.score-good .metric-value { color: #17a2b8; }
        .metric-card.score-warning .metric-value { color: #ffc107; }
        .metric-card.score-poor .metric-value { color: #dc3545; }
        
        .metric-label {
            font-size: 1.1rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        /* Compliance Level */
        .compliance {
            grid-column: 1 / -1;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            font-size: 1.5rem;
            font-weight: 700;
            color: white;
            margin-top: 20px;
        }
        
        .compliance.plenamente-conforme { background: linear-gradient(135deg, #28a745, #20c997); }
        .compliance.parcialmente-conforme { background: linear-gradient(135deg, #ffc107, #fd7e14); }
        .compliance.não-conforme { background: linear-gradient(135deg, #dc3545, #e83e8c); }
        
        /* Tabs */
        .tabs {
            display: flex;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
        }
        
        .tab-button {
            flex: 1;
            padding: 20px;
            background: none;
            border: none;
            font-size: 1.1rem;
            font-weight: 600;
            color: #666;
            cursor: pointer;
            transition: all 0.3s ease;
            border-bottom: 3px solid transparent;
        }
        
        .tab-button:hover {
            background: #e9ecef;
            color: #333;
        }
        
        .tab-button.active {
            background: white;
            color: #007bff;
            border-bottom-color: #007bff;
        }
        
        .tab-content {
            display: none;
            padding: 40px;
        }
        
        .tab-content.active {
            display: block;
        }
        
        /* Violations */
        .violations-section {
            margin-bottom: 40px;
        }
        
        .violations-title {
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 30px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .severity-group {
            margin-bottom: 30px;
        }
        
        .severity-title {
            font-size: 1.3rem;
            font-weight: 600;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            color: white;
        }
        
        .severity-title.severity-critical { background: #dc3545; }
        .severity-title.severity-serious { background: #fd7e14; }
        .severity-title.severity-moderate { background: #ffc107; color: #333; }
        .severity-title.severity-minor { background: #6c757d; }
        
        .violation {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 4px solid;
        }
        
        .violation.critical { border-left-color: #dc3545; }
        .violation.serious { border-left-color: #fd7e14; }
        .violation.moderate { border-left-color: #ffc107; }
        .violation.minor { border-left-color: #6c757d; }
        
        .violation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .violation-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
        }
        
        .violation-rule {
            color: #666;
            font-size: 0.9em;
        }
        
        .violation-detail {
            padding: 15px;
        }
        
        .violation-desc {
            margin-bottom: 15px;
            color: #555;
        }
        
        .violation-element {
            background: #f1f3f4;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            overflow-x: auto;
            margin-top: 10px;
        }
        
        .violation-pages {
            background: #e3f2fd;
            border: 1px solid #2196f3;
            border-radius: 4px;
            padding: 10px;
            margin-top: 10px;
            font-size: 0.9em;
            color: #1976d2;
        }
        
        /* Pages Section */
        .pages-section {
            padding: 40px;
        }
        
        .pages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            margin-top: 30px;
        }
        
        .page-card {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }
        
        .page-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .page-card.score-excellent { border-color: #28a745; }
        .page-card.score-good { border-color: #17a2b8; }
        .page-card.score-warning { border-color: #ffc107; }
        .page-card.score-poor { border-color: #dc3545; }
        
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 15px;
        }
        
        .page-url {
            font-size: 1.1rem;
            font-weight: 600;
            color: #0066cc;
            word-break: break-all;
        }
        
        .page-score {
            font-size: 1.5rem;
            font-weight: 700;
            padding: 8px 16px;
            border-radius: 25px;
            color: white;
        }
        
        .page-card.score-excellent .page-score { background: #28a745; }
        .page-card.score-good .page-score { background: #17a2b8; }
        .page-card.score-warning .page-score { background: #ffc107; color: #333; }
        .page-card.score-poor .page-score { background: #dc3545; }
        
        .page-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .stat-item {
            text-align: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #333;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: #666;
            margin-top: 5px;
        }
        
        /* Violations */
        .violations-section {
            margin-top: 20px;
        }
        
        .violations-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 15px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .violation-item {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 4px solid;
        }
        
        .violation-item.critical { border-left-color: #dc3545; }
        .violation-item.serious { border-left-color: #fd7e14; }
        .violation-item.moderate { border-left-color: #ffc107; }
        .violation-item.minor { border-left-color: #6c757d; }
        
        .violation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .violation-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
        }
        
        .violation-severity {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .violation-item.critical .violation-severity { background: #dc3545; color: white; }
        .violation-item.serious .violation-severity { background: #fd7e14; color: white; }
        .violation-item.moderate .violation-severity { background: #ffc107; color: #333; }
        .violation-item.minor .violation-severity { background: #6c757d; color: white; }
        
        .violation-desc {
            color: #555;
            line-height: 1.5;
        }
        
        .violation-element {
            background: #f1f3f4;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            overflow-x: auto;
            margin-top: 10px;
        }
        
        .footer {
            background: #343a40;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 0.9em;
        }
        
        .timestamp {
            color: #999;
            font-size: 0.8em;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Relatório de Auditoria de Acessibilidade</h1>
            <div class="meta">
                <div class="meta-item">
                    <div class="meta-label">Site</div>
                    <div class="meta-value">${reportData.baseUrl}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Páginas Auditadas</div>
                    <div class="meta-value">${reportData.totalPages}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Data</div>
                    <div class="meta-value">${new Date(reportData.timestamp).toLocaleDateString('pt-PT')}</div>
                </div>
            </div>
        </div>
        
        <div class="summary">
            <div class="metric-card score-${this.getScoreClass(reportData.averageScore)}">
                <div class="metric-value">${reportData.averageScore.toFixed(1)}</div>
                <div class="metric-label">Score WCAG Médio</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${reportData.totalViolations}</div>
                <div class="metric-label">Total de Violações</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${reportData.violationsBySeverity.critical || 0}</div>
                <div class="metric-label">Violações Críticas</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${reportData.violationsBySeverity.serious || 0}</div>
                <div class="metric-label">Violações Sérias</div>
            </div>
            
            <div class="compliance compliance-${reportData.complianceLevel.toLowerCase().replace(' ', '-')}">
                Nível de Conformidade: ${reportData.complianceLevel}
            </div>
        </div>
        
        <div class="tabs">
            <button class="tab-button active" onclick="showTab('critical-violations')">
                🚨 Violações Críticas aos 10 Critérios
            </button>
            <button class="tab-button" onclick="showTab('other-violations')">
                📋 Todas as Outras Violações
            </button>
            <button class="tab-button" onclick="showTab('pages-audited')">
                📄 Páginas Auditadas
            </button>
        </div>
        
        <div id="critical-violations" class="tab-content active">
            <div class="violations-section">
                <div class="violations-title">🚨 Violações Críticas aos 10 Critérios de Conformidade</div>
                ${this.generateCriticalViolationsHTML(criticalViolations)}
            </div>
        </div>
        
        <div id="other-violations" class="tab-content">
            <div class="violations-section">
                <div class="violations-title">📋 Todas as Outras Violações</div>
                ${this.generateOtherViolationsHTML(otherViolations)}
            </div>
        </div>
        
        <div id="pages-audited" class="tab-content">
            <div class="pages-section">
                <div class="violations-title">📄 Páginas Auditadas</div>
                <div class="pages-grid">
                    ${reportData.pageResults.map(page => {
                        console.log('🔍 Generating card for page:', page.url);
                        return this.generatePageCardHTML(page);
                    }).join('')}
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Relatório gerado automaticamente pela ferramenta de monitorização de acessibilidade UNTILE</p>
            <p>Data: ${new Date(reportData.timestamp).toLocaleString('pt-PT')}</p>
        </div>
    </div>

    <script>
        function showTab(tabName) {
            // Esconder todos os conteúdos
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Remover classe active de todos os botões
            const tabButtons = document.querySelectorAll('.tab-button');
            tabButtons.forEach(button => button.classList.remove('active'));
            
            // Mostrar conteúdo selecionado
            document.getElementById(tabName).classList.add('active');
            
            // Adicionar classe active ao botão clicado
            event.target.classList.add('active');
        }
    </script>
</body>
</html>`;
  }

  /**
   * Extrair violações críticas (dos 10 critérios do AccessMonitor)
   */
  private extractCriticalViolations(pageResults: PageResult[]): any[] {
    const criticalViolations: any[] = [];
    
    // IDs das violações críticas que o AccessMonitor usa para determinar conformidade
    // Baseado nos 10 critérios críticos de acessibilidade funcional
    const criticalIds = [
      // 1. Menus de Navegação (Links e navegação)
      'a_01b', 'a_10', 'a_11', 'a_12', 'a_13',
      
      // 2. Títulos e Subtítulos  
      'hx_01', 'hx_02', 'hx_03', 'hx_04', 'hx_05', 'title_06',
      
      // 3. Tabelas de Dados
      'table_01', 'table_02', 'table_03', 'table_04', 'table_05',
      
      // 4. Formulários
      'form_01a', 'form_02', 'form_03', 'form_04', 'form_05', 'label_03',
      
      // 5. Imagens e Gráficos
      'img_01', 'img_02', 'img_03', 'img_04', 'img_05',
      
      // 6. Contraste
      'color_01', 'color_02', 'color_03', 'color_04', 'color_05',
      
      // 7. Players de Media
      'media_01', 'media_02', 'media_03', 'media_04', 'media_05',
      
      // 8. Estrutura da Página (Landmarks)
      'landmark_01', 'landmark_02', 'landmark_03', 'landmark_04', 'landmark_05', 'landmark_06',
      
      // 9. Modais e elementos interativos
      'modal_01', 'modal_02', 'modal_03', 'modal_04', 'modal_05',
      
      // 10. Elementos estruturais
      'id_01', 'id_02', 'br_01', 'scrollable_01', 'scrollable_02'
    ];

    pageResults.forEach(page => {
      if (page.violations) {
        page.violations.forEach(violation => {
          if (criticalIds.includes(violation.rule || violation.id)) {
            criticalViolations.push({
              ...violation,
              pageUrl: page.url
            });
          }
        });
      }
    });

    return criticalViolations;
  }

  /**
   * Extrair outras violações (não críticas)
   */
  private extractOtherViolations(pageResults: PageResult[]): any[] {
    const otherViolations: any[] = [];
    const criticalIds = [
      'navigation_01', 'navigation_02', 'navigation_03', 'navigation_04', 'navigation_05',
      'titles_01', 'titles_02', 'titles_03', 'titles_04', 'titles_05',
      'images_01', 'images_02', 'images_03', 'images_04', 'images_05',
      'forms_01', 'forms_02', 'forms_03', 'forms_04', 'forms_05',
      'tables_01', 'tables_02', 'tables_03', 'tables_04', 'tables_05',
      'links_01', 'links_02', 'links_03', 'links_04', 'links_05',
      'colors_01', 'colors_02', 'colors_03', 'colors_04', 'colors_05',
      'media_01', 'media_02', 'media_03', 'media_04', 'media_05',
      'landmarks_01', 'landmarks_02', 'landmarks_03', 'landmarks_04', 'landmarks_05',
      'focus_01', 'focus_02', 'focus_03', 'focus_04', 'focus_05'
    ];

    pageResults.forEach(page => {
      if (page.violations) {
        page.violations.forEach(violation => {
          if (!criticalIds.includes(violation.rule || violation.id)) {
            otherViolations.push({
              ...violation,
              pageUrl: page.url
            });
          }
        });
      }
    });

    return otherViolations;
  }

  /**
   * Mapear códigos de violação para nomes descritivos
   */
  private getViolationDisplayName(ruleId: string): string {
    const violationNames: Record<string, string> = {
      // Links e navegação
      'a_01b': '❌ Links sem texto descritivo - Usuários não sabem para onde vão',
      'a_10': '❌ Links com texto genérico - "Clique aqui" ou "Mais info" não são descritivos',
      'a_11': '❌ Links abrem nova janela sem aviso - Usuários ficam confusos',
      'a_12': '❌ Links com imagem sem texto alternativo - Leitores de ecrã não conseguem ler',
      'a_13': '❌ Links identificados apenas por cor - Daltónicos não conseguem identificar',
      
      // Títulos e estrutura
      'hx_01': '❌ Falta título principal (H1) - Página sem hierarquia clara',
      'hx_01b': '❌ Falta título principal (H1) - Página sem hierarquia clara',
      'hx_02': '❌ Hierarquia de títulos incorreta - H1 → H3 sem H2 (pula níveis)',
      'hx_03': '❌ Títulos vazios ou sem sentido - Não ajudam na navegação',
      'hx_04': '❌ Muitos títulos do mesmo nível - Confunde a estrutura',
      'hx_05': '❌ Títulos identificados apenas por cor - Daltónicos não conseguem identificar',
      'title_06': '❌ Título da página genérico - Não descreve o conteúdo',
      'heading_01': '❌ Falta título principal (H1) - Página sem hierarquia clara',
      'heading_03': '❌ Títulos vazios ou sem sentido - Não ajudam na navegação',
      
      // Tabelas
      'table_01': '❌ Tabela sem cabeçalhos - Leitores de ecrã não conseguem navegar',
      'table_02': '❌ Tabela complexa sem resumo - Usuários não entendem o propósito',
      'table_03': '❌ Células sem associação aos cabeçalhos - Informação perdida',
      'table_04': '❌ Tabela de layout mal marcada - Confunde leitores de ecrã',
      'table_05': '❌ Tabela complexa sem descrição - Usuários não entendem os dados',
      
      // Formulários
      'form_01a': '❌ Campo sem label - Usuários não sabem o que preencher',
      'form_02': '❌ Formulário sem agrupamento - Campos relacionados não estão juntos',
      'form_03': '❌ Campo obrigatório sem indicação - Usuários não sabem o que é obrigatório',
      'form_04': '❌ Mensagem de erro confusa - Usuários não sabem como corrigir',
      'form_05': '❌ Validação apenas no browser - Usuários sem JavaScript ficam sem validação',
      'label_03': '❌ Label não associado ao campo - Leitores de ecrã não conseguem ler',
      
      // Imagens
      'img_01': '❌ Imagem sem texto alternativo - Conteúdo perdido para leitores de ecrã',
      'img_01a': '❌ Imagem sem texto alternativo - Conteúdo perdido para leitores de ecrã',
      'img_02': '❌ Imagem decorativa com alt desnecessário - Polui a leitura',
      'img_03': '❌ Imagem complexa sem descrição - Gráficos e diagramas não são acessíveis',
      'img_04': '❌ Texto alternativo inadequado - Não descreve o conteúdo da imagem',
      'img_05': '❌ Imagem com contraste inadequado - Daltónicos não conseguem ver',
      
      // Contraste e cores
      'color_01': '❌ Contraste inadequado - Texto difícil de ler',
      'color_02': '❌ Informação apenas por cor - Daltónicos não conseguem entender',
      'color_03': '❌ Cores problemáticas para daltónicos - Vermelho/verde confundem',
      'color_04': '❌ Texto com contraste insuficiente - Fundo muito claro/escuro',
      'color_05': '❌ Botões sem contraste adequado - Usuários não conseguem clicar',
      
      // Media
      'media_01': '❌ Vídeo sem legendas - Surdos não conseguem entender',
      'media_02': '❌ Áudio sem transcrição - Surdos não conseguem entender',
      'media_03': '❌ Player sem controles acessíveis - Usuários não conseguem controlar',
      'media_04': '❌ Media sem descrição - Conteúdo perdido para leitores de ecrã',
      'media_05': '❌ Media com autoplay - Reproduz automaticamente sem controlo',
      
      // Landmarks e estrutura
      'landmark_01': '❌ Falta landmark principal (main) - Leitores de ecrã não encontram conteúdo',
      'landmark_02': '❌ Landmarks duplicados - Confunde a navegação',
      'landmark_03': '❌ Navegação sem landmark - Leitores de ecrã não identificam menu',
      'landmark_04': '❌ Conteúdo sem landmark main - Estrutura da página confusa',
      'landmark_05': '❌ Rodapé sem landmark - Leitores de ecrã não identificam footer',
      'landmark_06': '❌ Landmarks mal estruturados - Navegação confusa',
      'landmark_07': '❌ Landmarks mal estruturados - Navegação confusa',
      
      // Modais e interativos
      'modal_01': '❌ Modal sem gestão do foco - Usuários ficam presos no modal',
      'modal_02': '❌ Modal sem tecla escape - Usuários não conseguem fechar',
      'modal_03': '❌ Modal sem título - Usuários não sabem o que é o modal',
      'modal_04': '❌ Modal sem descrição - Conteúdo não é acessível',
      'modal_05': '❌ Modal com overlay confuso - Usuários não conseguem navegar',
      
      // Elementos estruturais
      'id_01': '❌ IDs duplicados - Causa conflitos e comportamentos inesperados',
      'id_02': '❌ IDs inadequados - Não ajudam na identificação',
      'br_01': '❌ Uso inadequado de <br> - Deve usar CSS para formatação',
      'scrollable_01': '❌ Elemento scrollable sem indicação - Usuários não sabem que pode rolar',
      'scrollable_02': '❌ Scroll horizontal forçado - Quebra o layout responsivo',
      
      // ARIA
      'aria_01': '❌ Atributos ARIA incorretos - Confunde leitores de ecrã',
      
      // Botões
      'button_01': '❌ Botão sem texto descritivo - Usuários não sabem o que faz',
      
      // Elementos gerais
      'element_02': '❌ Elemento sem identificação - Leitores de ecrã não conseguem descrever'
    };
    
    return violationNames[ruleId] || `❌ Violação de acessibilidade: ${ruleId}`;
  }

  /**
   * Obter sugestão de correção para uma violação
   */
  private getFixSuggestion(ruleId: string): string {
    const fixSuggestions: Record<string, string> = {
      // Links e navegação
      'a_01b': 'Adicione texto descritivo ao link. Exemplo: <a href="...">Descrição clara do destino</a>',
      'a_10': 'Substitua "Clique aqui" por texto descritivo. Exemplo: <a href="...">Baixar relatório PDF</a>',
      'a_11': 'Adicione aviso de nova janela. Exemplo: <a href="..." target="_blank" aria-label="Abre em nova janela">Link</a>',
      'a_12': 'Adicione alt à imagem no link. Exemplo: <a href="..."><img src="..." alt="Descrição da imagem"></a>',
      'a_13': 'Adicione sublinhado ou ícone além da cor. Exemplo: <a href="..." style="text-decoration: underline;">Link</a>',
      
      // Títulos e estrutura
      'hx_01': 'Adicione um H1 principal à página. Exemplo: <h1>Título Principal da Página</h1>',
      'hx_01b': 'Adicione um H1 principal à página. Exemplo: <h1>Título Principal da Página</h1>',
      'hx_02': 'Corrija a hierarquia: H1 → H2 → H3. Não pule níveis.',
      'hx_03': 'Adicione texto significativo ao título. Exemplo: <h2>Seção de Produtos</h2>',
      'hx_04': 'Use apenas um H1 por página e organize H2, H3 logicamente.',
      'hx_05': 'Adicione sublinhado ou negrito além da cor.',
      'title_06': 'Use título descritivo. Exemplo: <title>Nome da Empresa - Página Específica</title>',
      'heading_01': 'Adicione um H1 principal à página. Exemplo: <h1>Título Principal da Página</h1>',
      'heading_03': 'Adicione texto significativo ao título. Exemplo: <h2>Seção de Produtos</h2>',
      
      // Tabelas
      'table_01': 'Adicione cabeçalhos. Exemplo: <th>Nome da Coluna</th>',
      'table_02': 'Adicione resumo. Exemplo: <table summary="Tabela de produtos com preços">',
      'table_03': 'Associe células aos cabeçalhos. Exemplo: <td headers="col1">Dados</td>',
      'table_04': 'Use CSS para layout, não tabelas. Exemplo: <div class="layout-grid">',
      'table_05': 'Adicione descrição detalhada para tabelas complexas.',
      
      // Formulários
      'form_01a': 'Adicione label. Exemplo: <label for="email">Email:</label><input id="email" type="email">',
      'form_02': 'Agrupe campos relacionados. Exemplo: <fieldset><legend>Dados Pessoais</legend>',
      'form_03': 'Indique campos obrigatórios. Exemplo: <label>Nome *</label> ou use required',
      'form_04': 'Escreva mensagens claras. Exemplo: "Por favor, insira um email válido"',
      'form_05': 'Adicione validação server-side além da client-side.',
      'label_03': 'Associe label ao campo. Exemplo: <label for="campo">Label</label><input id="campo">',
      
      // Imagens
      'img_01': 'Adicione alt descritivo. Exemplo: <img src="..." alt="Descrição da imagem">',
      'img_01a': 'Adicione alt descritivo. Exemplo: <img src="..." alt="Descrição da imagem">',
      'img_02': 'Use alt="" para imagens decorativas. Exemplo: <img src="..." alt="">',
      'img_03': 'Adicione descrição longa para imagens complexas.',
      'img_04': 'Escreva alt que descreva o conteúdo da imagem.',
      'img_05': 'Melhore o contraste da imagem ou adicione texto alternativo.',
      
      // Contraste e cores
      'color_01': 'Aumente o contraste. Use ferramentas como WebAIM Contrast Checker.',
      'color_02': 'Adicione texto ou ícone além da cor. Exemplo: "Erro" + ícone vermelho',
      'color_03': 'Evite combinações vermelho/verde. Use azul/amarelo ou adicione texto.',
      'color_04': 'Aumente o contraste texto/fundo. Mínimo 4.5:1 para texto normal.',
      'color_05': 'Melhore o contraste de botões. Mínimo 3:1 para elementos grandes.',
      
      // Media
      'media_01': 'Adicione legendas ao vídeo. Exemplo: <track kind="subtitles" src="...">',
      'media_02': 'Adicione transcrição do áudio ou legendas.',
      'media_03': 'Adicione controles acessíveis ao player.',
      'media_04': 'Adicione descrição do conteúdo media.',
      'media_05': 'Remova autoplay ou adicione controlo para parar.',
      
      // Landmarks e estrutura
      'landmark_01': 'Adicione landmark main. Exemplo: <main role="main">',
      'landmark_02': 'Remova landmarks duplicados ou use roles diferentes.',
      'landmark_03': 'Adicione landmark nav. Exemplo: <nav role="navigation">',
      'landmark_04': 'Adicione landmark main. Exemplo: <main role="main">',
      'landmark_05': 'Adicione landmark contentinfo. Exemplo: <footer role="contentinfo">',
      'landmark_06': 'Organize landmarks corretamente. Main deve conter o conteúdo principal.',
      'landmark_07': 'Organize landmarks corretamente. Main deve conter o conteúdo principal.',
      
      // Modais e interativos
      'modal_01': 'Gerencie o foco. Mova foco para modal e mantenha-o lá.',
      'modal_02': 'Adicione tecla escape. Exemplo: onKeyDown={handleEscape}',
      'modal_03': 'Adicione título ao modal. Exemplo: <h2>Confirmação</h2>',
      'modal_04': 'Adicione descrição do modal. Exemplo: aria-describedby="modal-desc"',
      'modal_05': 'Melhore o overlay. Torne-o mais visível e acessível.',
      
      // Elementos estruturais
      'id_01': 'Remova IDs duplicados. Cada ID deve ser único na página.',
      'id_02': 'Use IDs descritivos. Exemplo: id="header-navigation"',
      'br_01': 'Use CSS para formatação. Exemplo: margin-bottom: 10px;',
      'scrollable_01': 'Adicione indicação visual de scroll. Exemplo: border ou sombra.',
      'scrollable_02': 'Evite scroll horizontal. Use layout responsivo.',
      
      // ARIA
      'aria_01': 'Corrija atributos ARIA. Use valores válidos e apropriados.',
      
      // Botões
      'button_01': 'Adicione texto descritivo ao botão. Exemplo: <button>Salvar Alterações</button>',
      
      // Elementos gerais
      'element_02': 'Adicione identificação. Use aria-label ou role apropriado.'
    };
    
    return fixSuggestions[ruleId] || 'Consulte as WCAG 2.1 para orientações específicas sobre esta violação.';
  }

  /**
   * Obter nome descritivo para grupos de violações
   */
  private getGroupDisplayName(type: string): string {
    const groupNames: Record<string, string> = {
      'a': 'Links e Navegação',
      'hx': 'Títulos e Estrutura',
      'heading': 'Títulos e Estrutura',
      'img': 'Imagens',
      'form': 'Formulários',
      'table': 'Tabelas',
      'color': 'Contraste e Cores',
      'landmark': 'Landmarks e Estrutura',
      'media': 'Media',
      'modal': 'Modais e Interativos',
      'id': 'Elementos Estruturais',
      'br': 'Elementos Estruturais',
      'scrollable': 'Elementos Estruturais',
      'aria': 'Atributos ARIA',
      'button': 'Botões',
      'element': 'Elementos Gerais',
      'label': 'Labels e Formulários',
      'title': 'Títulos e Estrutura',
      'outros': 'Outras Violações'
    };
    
    return groupNames[type] || `Violações: ${type}`;
  }

  /**
   * Ordenar violações por severidade
   */
  private sortViolationsBySeverity(violations: any[]): any[] {
    const severityOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
    
    return violations.sort((a, b) => {
      const severityA = severityOrder[a.severity as keyof typeof severityOrder] ?? 2;
      const severityB = severityOrder[b.severity as keyof typeof severityOrder] ?? 2;
      
      // Ordenar por severidade (critical primeiro, minor último)
      if (severityA !== severityB) {
        return severityA - severityB;
      }
      
      // Se mesma severidade, ordenar por nome da regra
      const nameA = this.getViolationDisplayName(a.rule || a.id || '');
      const nameB = this.getViolationDisplayName(b.rule || b.id || '');
      return nameA.localeCompare(nameB);
    });
  }

  /**
   * Gerar HTML para violações críticas
   */
  private generateCriticalViolationsHTML(violations: any[]): string {
    // Ordenar violações por severidade
    const sortedViolations = this.sortViolationsBySeverity(violations);
    const groupedByType = this.groupViolationsByType(sortedViolations);
    let html = '';

    Object.entries(groupedByType).forEach(([type, typeViolations]) => {
      // Usar um nome descritivo para o grupo baseado no tipo
      const groupDisplayName = this.getGroupDisplayName(type);
      html += `<div class="severity-group">`;
      html += `<div class="severity-title severity-critical">${groupDisplayName} (${typeViolations.length})</div>`;
      
      typeViolations.forEach(violation => {
        const violationName = this.getViolationDisplayName(violation.rule || violation.id || '');
        html += `
          <div class="violation">
            <div class="violation-header">
              <div class="violation-title">${violationName}</div>
              <div class="violation-rule">${violation.rule || violation.id || 'Regra não especificada'}</div>
            </div>
            <div class="violation-detail">
              <div class="violation-desc">${violation.help || violation.description || 'Descrição não disponível'}</div>
              ${violation.element ? `<div class="violation-element">${this.escapeHtml(violation.element)}</div>` : ''}
              <div class="violation-pages">Página: ${violation.pageUrl}</div>
            </div>
          </div>
        `;
      });
      
      html += `</div>`;
    });

    return html;
  }

  /**
   * Gerar HTML para outras violações
   */
  private generateOtherViolationsHTML(violations: any[]): string {
    // Ordenar violações por severidade
    const sortedViolations = this.sortViolationsBySeverity(violations);
    const violationsBySeverity = this.groupViolationsBySeverity(sortedViolations);
    const severityOrder = ['critical', 'serious', 'moderate', 'minor'];
    const severityLabels: Record<string, string> = {
      critical: 'Críticas',
      serious: 'Sérias', 
      moderate: 'Moderadas',
      minor: 'Menores'
    };

    let html = '';
    
    severityOrder.forEach(severity => {
      const severityViolations = violationsBySeverity[severity] || [];
      if (severityViolations.length === 0) return;

      html += `<div class="severity-group">`;
      html += `<div class="severity-title severity-${severity}">${severityLabels[severity] || severity} (${severityViolations.length})</div>`;

      severityViolations.forEach(violation => {
        const violationName = this.getViolationDisplayName(violation.rule || violation.id || '');
        html += `
          <div class="violation">
            <div class="violation-header">
              <div class="violation-title">${violationName}</div>
              <div class="violation-rule">${violation.rule || violation.id || 'Regra não especificada'}</div>
            </div>
            <div class="violation-detail">
              <div class="violation-desc">${violation.help || violation.description || 'Descrição não disponível'}</div>
              ${violation.element ? `<div class="violation-element">${this.escapeHtml(violation.element)}</div>` : ''}
              <div class="violation-pages">Página: ${violation.pageUrl}</div>
            </div>
          </div>
        `;
      });

      html += `</div>`;
    });

    return html;
  }

  /**
   * Agrupar violações por tipo
   */
  private groupViolationsByType(violations: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};
    
    violations.forEach(violation => {
      const ruleId = violation.rule || violation.id || '';
      const type = ruleId.split('_')[0] || 'outros';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(violation);
    });

    return grouped;
  }

  /**
   * Gerar HTML para violações de uma página individual
   */
  private generatePageViolationsHTML(violations: any[]): string {
    // Ordenar violações por severidade
    const sortedViolations = this.sortViolationsBySeverity(violations);
    const violationsBySeverity = this.groupViolationsBySeverity(sortedViolations);
    const severityOrder = ['critical', 'serious', 'moderate', 'minor'];
    const severityLabels: Record<string, string> = {
      critical: 'Críticas',
      serious: 'Sérias', 
      moderate: 'Moderadas',
      minor: 'Menores'
    };

    let html = '';
    
    severityOrder.forEach(severity => {
      const severityViolations = violationsBySeverity[severity] || [];
      if (severityViolations.length === 0) return;

      html += `<div class="severity-group">`;
      html += `<div class="severity-title severity-${severity}">${severityLabels[severity] || severity} (${severityViolations.length})</div>`;

      severityViolations.forEach(violation => {
        const violationName = this.getViolationDisplayName(violation.rule || violation.id || '');
        html += `
          <div class="violation-item ${violation.severity || 'moderate'}">
            <div class="violation-header">
              <div class="violation-title">${violationName}</div>
              <div class="violation-severity">${violation.severity || 'moderate'}</div>
            </div>
            <div class="violation-desc">${violation.help || violation.description}</div>
            ${violation.element ? `<div class="violation-element">${this.escapeHtml(violation.element)}</div>` : ''}
          </div>
        `;
      });

      html += `</div>`;
    });

    return html;
  }

  /**
   * Gerar HTML para card de página individual
   */
  private generatePageCardHTML(page: PageResult): string {
    const scoreClass = this.getScoreClass(page.wcagScore);
    const checklistPercentage = page.checklistResults?.percentage || 0;
    
    return `<div class="page-card score-${scoreClass}">
      <div class="page-header">
        <div class="page-url">${page.url}</div>
        <div class="page-score">${page.wcagScore.toFixed(1)}</div>
      </div>
      
      <div class="page-stats">
        <div class="stat-item">
          <div class="stat-value">${page.violations.length}</div>
          <div class="stat-label">Violações</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${checklistPercentage.toFixed(1)}%</div>
          <div class="stat-label">Checklist 10 Critérios</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${page.checklistResults?.passed || 0}/${page.checklistResults?.total || 10}</div>
          <div class="stat-label">Critérios Passados</div>
        </div>
      </div>
      
      ${page.violations.length > 0 ? `
        <div class="violations-section">
          <div class="violations-title">🚨 Violações Encontradas</div>
          ${this.generatePageViolationsHTML(page.violations)}
        </div>
      ` : '<p style="text-align: center; color: #28a745; font-weight: 600;">✅ Nenhuma violação encontrada</p>'}
    </div>`;
  }


}
