import { AccessibilityViolation } from '../types';

export interface MultiPageAuditResult {
  baseUrl: string;
  totalPages: number;
  auditedPages: number;
  timestamp: Date;
  overallScore: number;
  pages: PageAuditResult[];
  summary: MultiPageSummary;
  commonIssues: CommonIssue[];
  recommendations: string[];
}

export interface PageAuditResult {
  url: string;
  wcagScore: number;
  violationCount: number;
  violations: AccessibilityViolation[];
  axeResults: any;
  lighthouseScore?: number;
  timestamp: Date;
  error?: string;
}

export interface MultiPageSummary {
  averageScore: number;
  bestPerformingPage: { url: string; score: number };
  worstPerformingPage: { url: string; score: number };
  totalViolations: number;
  criticalViolations: number;
  pagesWithIssues: number;
  compliance: {
    percentage: number;
    status: 'compliant' | 'partial' | 'non-compliant';
  };
}

export interface CommonIssue {
  criteria: string;
  count: number;
  pages: string[];
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  recommendation: string;
}

export class MultiPageReportGenerator {
  
  generateReport(results: MultiPageAuditResult, format: 'console' | 'json' | 'html' | 'markdown' = 'console'): string {
    switch (format) {
      case 'json':
        return this.generateJsonReport(results);
      case 'html':
        return this.generateHtmlReport(results);
      case 'markdown':
        return this.generateMarkdownReport(results);
      default:
        return this.generateConsoleReport(results);
    }
  }

  private generateConsoleReport(results: MultiPageAuditResult): string {
    const { summary, commonIssues, pages } = results;
    
    let report = '\n';
    report += '🔍 MULTI-PAGE ACCESSIBILITY AUDIT REPORT\n';
    report += '═'.repeat(50) + '\n\n';
    
    // Summary
    report += '📊 EXECUTIVE SUMMARY\n';
    report += '─'.repeat(25) + '\n';
    report += `• Base URL: ${results.baseUrl}\n`;
    report += `• Pages Audited: ${results.auditedPages}/${results.totalPages}\n`;
    report += `• Overall Score: ${summary.averageScore.toFixed(1)}/100\n`;
    report += `• Compliance: ${summary.compliance.percentage.toFixed(1)}% (${summary.compliance.status})\n`;
    report += `• Total Violations: ${summary.totalViolations}\n`;
    report += `• Critical Issues: ${summary.criticalViolations}\n\n`;
    
    // Best/Worst pages
    report += '🏆 PERFORMANCE RANKING\n';
    report += '─'.repeat(25) + '\n';
    report += `✅ Best: ${summary.bestPerformingPage.url} (${summary.bestPerformingPage.score.toFixed(1)})\n`;
    report += `❌ Worst: ${summary.worstPerformingPage.url} (${summary.worstPerformingPage.score.toFixed(1)})\n\n`;
    
    // Common issues
    if (commonIssues.length > 0) {
      report += '⚠️  COMMON ISSUES (Multiple Pages)\n';
      report += '─'.repeat(35) + '\n';
      commonIssues.slice(0, 5).forEach((issue, index) => {
        const severity = this.getSeverityIcon(issue.severity);
        report += `${index + 1}. ${severity} ${issue.criteria}\n`;
        report += `   • Affects ${issue.count} pages\n`;
        report += `   • Recommendation: ${issue.recommendation}\n\n`;
      });
    }
    
    // Page details
    report += '📄 PAGE DETAILS\n';
    report += '─'.repeat(20) + '\n';
    pages.slice(0, 10).forEach((page, index) => {
      const status = page.wcagScore >= 80 ? '✅' : page.wcagScore >= 60 ? '⚠️' : '❌';
      report += `${index + 1}. ${status} ${page.url}\n`;
      report += `   Score: ${page.wcagScore.toFixed(1)}/100 | Violations: ${page.violationCount}\n`;
      if (page.error) {
        report += `   Error: ${page.error}\n`;
      }
      report += '\n';
    });
    
    return report;
  }

  private generateJsonReport(results: MultiPageAuditResult): string {
    return JSON.stringify(results, null, 2);
  }

  private generateHtmlReport(results: MultiPageAuditResult): string {
    const { summary, commonIssues, pages } = results;
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Auditoria de Acessibilidade - ${results.baseUrl}</title>
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
            font-weight: 500;
        }
        
        /* Tabs Navigation */
        .tabs {
            background: white;
            border-bottom: 2px solid #e9ecef;
        }
        
        .tab-nav {
            display: flex;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
        }
        
        .tab-button {
            flex: 1;
            padding: 20px;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            color: #666;
            transition: all 0.3s ease;
            border-bottom: 3px solid transparent;
        }
        
        .tab-button:hover {
            background: #e9ecef;
            color: #333;
        }
        
        .tab-button.active {
            background: white;
            color: #0066cc;
            border-bottom-color: #0066cc;
        }
        
        .tab-content {
            display: none;
            padding: 40px;
        }
        
        .tab-content.active {
            display: block;
        }
        
        /* Common Issues */
        .issue-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 4px solid;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .issue-card.critical { border-left-color: #dc3545; background: #fff5f5; }
        .issue-card.serious { border-left-color: #fd7e14; background: #fff8f0; }
        .issue-card.moderate { border-left-color: #ffc107; background: #fffbeb; }
        .issue-card.minor { border-left-color: #6c757d; background: #f8f9fa; }
        
        .issue-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .issue-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #333;
        }
        
        .issue-severity {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .issue-card.critical .issue-severity { background: #dc3545; color: white; }
        .issue-card.serious .issue-severity { background: #fd7e14; color: white; }
        .issue-card.moderate .issue-severity { background: #ffc107; color: #333; }
        .issue-card.minor .issue-severity { background: #6c757d; color: white; }
        
        /* Page Details */
        .page-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
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
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .violation-criteria {
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
        }
        
        .violation-severity {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .violation-item.critical .violation-severity { background: #dc3545; color: white; }
        .violation-item.serious .violation-severity { background: #fd7e14; color: white; }
        .violation-item.moderate .violation-severity { background: #ffc107; color: #333; }
        .violation-item.minor .violation-severity { background: #6c757d; color: white; }
        
        .violation-description {
            color: #666;
            margin-bottom: 15px;
            line-height: 1.6;
        }
        
        .violation-element {
            background: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 6px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9rem;
            overflow-x: auto;
            white-space: pre-wrap;
            word-break: break-all;
        }
        
        /* Filters */
        .filters {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            align-items: center;
        }
        
        .filter-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .filter-label {
            font-weight: 600;
            color: #333;
        }
        
        .filter-select {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            background: white;
            font-size: 0.9rem;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .container { margin: 10px; }
            .header { padding: 20px; }
            .header h1 { font-size: 2rem; }
            .summary { padding: 20px; grid-template-columns: 1fr; }
            .tab-content { padding: 20px; }
            .page-header { flex-direction: column; align-items: flex-start; }
            .page-stats { grid-template-columns: 1fr; }
            .filters { flex-direction: column; align-items: stretch; }
        }
        
        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .tab-content.active {
            animation: fadeIn 0.3s ease-out;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🔍 Relatório de Auditoria de Acessibilidade</h1>
            <div class="meta">
                <div class="meta-item">
                    <div class="meta-label">URL Base</div>
                    <div class="meta-value">${results.baseUrl}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Gerado em</div>
                    <div class="meta-value">${results.timestamp.toLocaleString('pt-BR')}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Páginas Auditadas</div>
                    <div class="meta-value">${results.auditedPages}/${results.totalPages}</div>
                </div>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="summary">
            <div class="metric-card ${this.getScoreClass(summary.averageScore)}">
                <div class="metric-value">${summary.averageScore.toFixed(1)}</div>
                <div class="metric-label">Pontuação Geral</div>
            </div>
            <div class="metric-card ${this.getScoreClass(summary.compliance.percentage)}">
                <div class="metric-value">${summary.compliance.percentage.toFixed(1)}%</div>
                <div class="metric-label">Conformidade</div>
            </div>
            <div class="metric-card ${this.getViolationClass(summary.totalViolations)}">
                <div class="metric-value">${summary.totalViolations}</div>
                <div class="metric-label">Total de Violações</div>
            </div>
            <div class="metric-card ${this.getViolationClass(summary.criticalViolations)}">
                <div class="metric-value">${summary.criticalViolations}</div>
                <div class="metric-label">Violações Críticas</div>
            </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="tabs">
            <div class="tab-nav">
                <button class="tab-button active" onclick="showTab('overview')">📊 Visão Geral</button>
                <button class="tab-button" onclick="showTab('issues')">⚠️ Problemas Comuns</button>
                <button class="tab-button" onclick="showTab('pages')">📄 Detalhes das Páginas</button>
                <button class="tab-button" onclick="showTab('recommendations')">💡 Recomendações</button>
            </div>

            <!-- Overview Tab -->
            <div id="overview" class="tab-content active">
                <h2>🏆 Ranking de Performance</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0;">
                    <div style="background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
                        <h3 style="color: #155724; margin-bottom: 10px;">🥇 Melhor Performance</h3>
                        <p style="font-weight: 600; color: #155724;">${summary.bestPerformingPage.url}</p>
                        <p style="font-size: 1.5rem; font-weight: 700; color: #28a745; margin-top: 10px;">${summary.bestPerformingPage.score.toFixed(1)}/100</p>
                    </div>
                    <div style="background: #f8d7da; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545;">
                        <h3 style="color: #721c24; margin-bottom: 10px;">🥉 Pior Performance</h3>
                        <p style="font-weight: 600; color: #721c24;">${summary.worstPerformingPage.url}</p>
                        <p style="font-size: 1.5rem; font-weight: 700; color: #dc3545; margin-top: 10px;">${summary.worstPerformingPage.score.toFixed(1)}/100</p>
                    </div>
                </div>
                
                <h2>📈 Estatísticas Gerais</h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Status de Conformidade:</strong> 
                        <span style="padding: 4px 12px; border-radius: 20px; font-weight: 600; 
                        ${summary.compliance.status === 'compliant' ? 'background: #d4edda; color: #155724;' : 
                          summary.compliance.status === 'partial' ? 'background: #fff3cd; color: #856404;' : 
                          'background: #f8d7da; color: #721c24;'}">
                            ${summary.compliance.status === 'compliant' ? '✅ Conforme' : 
                              summary.compliance.status === 'partial' ? '⚠️ Parcialmente Conforme' : 
                              '❌ Não Conforme'}
                        </span>
                    </p>
                    <p><strong>Páginas com Problemas:</strong> ${summary.pagesWithIssues} de ${results.auditedPages}</p>
                </div>
            </div>

            <!-- Issues Tab -->
            <div id="issues" class="tab-content">
                <h2>⚠️ Problemas Comuns</h2>
                ${commonIssues.length > 0 ? `
                    <div class="filters">
                        <div class="filter-group">
                            <label class="filter-label">Filtrar por Severidade:</label>
                            <select class="filter-select" onchange="filterIssues(this.value)">
                                <option value="all">Todas</option>
                                <option value="critical">Críticas</option>
                                <option value="serious">Sérias</option>
                                <option value="moderate">Moderadas</option>
                                <option value="minor">Menores</option>
                            </select>
                        </div>
                    </div>
                    ${commonIssues.map(issue => `
                        <div class="issue-card ${issue.severity}" data-severity="${issue.severity}">
                            <div class="issue-header">
                                <div class="issue-title">${issue.criteria}</div>
                                <div class="issue-severity">${issue.severity}</div>
                            </div>
                            <p><strong>Afeta:</strong> ${issue.count} página${issue.count > 1 ? 's' : ''}</p>
                            <p><strong>Recomendação:</strong> ${issue.recommendation}</p>
                            <p><strong>Páginas afetadas:</strong> ${issue.pages.slice(0, 5).join(', ')}${issue.pages.length > 5 ? '...' : ''}</p>
                        </div>
                    `).join('')}
                ` : '<p style="text-align: center; color: #666; padding: 40px;">🎉 Nenhum problema comum encontrado!</p>'}
            </div>

            <!-- Pages Tab -->
            <div id="pages" class="tab-content">
                <h2>📄 Detalhes das Páginas</h2>
                <div class="filters">
                    <div class="filter-group">
                        <label class="filter-label">Filtrar por Score:</label>
                        <select class="filter-select" onchange="filterPages(this.value)">
                            <option value="all">Todos</option>
                            <option value="excellent">Excelente (80-100)</option>
                            <option value="good">Bom (60-79)</option>
                            <option value="warning">Atenção (40-59)</option>
                            <option value="poor">Ruim (0-39)</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label class="filter-label">Filtrar por Violações:</label>
                        <select class="filter-select" onchange="filterByViolations(this.value)">
                            <option value="all">Todas</option>
                            <option value="with-violations">Com Violações</option>
                            <option value="without-violations">Sem Violações</option>
                        </select>
                    </div>
                </div>
                
                ${pages.map(page => {
                    const scoreClass = this.getScoreClass(page.wcagScore);
                    return `
                        <div class="page-card ${scoreClass}" data-score="${scoreClass}" data-violations="${page.violationCount > 0 ? 'with-violations' : 'without-violations'}">
                            <div class="page-header">
                                <div class="page-url">${page.url}</div>
                                <div class="page-score">${page.wcagScore.toFixed(1)}/100</div>
                            </div>
                            
                            <div class="page-stats">
                                <div class="stat-item">
                                    <div class="stat-value">${page.violationCount}</div>
                                    <div class="stat-label">Violações</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${page.timestamp.toLocaleString('pt-BR')}</div>
                                    <div class="stat-label">Auditado em</div>
                                </div>
                            </div>
                            
                            ${page.violations.length > 0 ? `
                                <div class="violations-section">
                                    <div class="violations-title">
                                        🔍 Violações Encontradas
                                        <span style="font-size: 0.9rem; color: #666;">(${page.violations.length})</span>
                                    </div>
                                    ${page.violations.map(violation => `
                                        <div class="violation-item ${violation.severity}">
                                            <div class="violation-header">
                                                <div class="violation-criteria">
                                                    ${violation.criteria.id} - ${violation.criteria.name}
                                                </div>
                                                <div class="violation-severity">${violation.severity}</div>
                                            </div>
                                            <div class="violation-description">${violation.description}</div>
                                            ${violation.element && violation.element !== 'N/A' ? `
                                                <div class="violation-element">${this.escapeHtml(violation.element)}</div>
                                            ` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            ` : '<p style="text-align: center; color: #28a745; padding: 20px; font-weight: 600;">✅ Nenhuma violação encontrada!</p>'}
                            
                            ${page.error ? `
                                <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 4px solid #dc3545;">
                                    <strong>❌ Erro durante a auditoria:</strong> ${page.error}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Recommendations Tab -->
            <div id="recommendations" class="tab-content">
                <h2>💡 Recomendações de Melhoria</h2>
                ${results.recommendations && results.recommendations.length > 0 ? `
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
                        <h3 style="color: #0d47a1; margin-bottom: 15px;">🎯 Prioridades de Ação</h3>
                        <ol style="margin-left: 20px; color: #0d47a1;">
                            ${results.recommendations.map(rec => `<li style="margin-bottom: 10px;">${rec}</li>`).join('')}
                        </ol>
                    </div>
                ` : `
                    <div style="text-align: center; color: #666; padding: 40px;">
                        <p>📝 As recomendações serão geradas com base na análise das violações encontradas.</p>
                        <p>Consulte a aba "Problemas Comuns" para ver sugestões específicas.</p>
                    </div>
                `}
                
                <h3>🔧 Próximos Passos Recomendados</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0;">
                    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                        <h4 style="color: #856404; margin-bottom: 10px;">1. Priorizar Violações Críticas</h4>
                        <p style="color: #856404;">Comece corrigindo as ${summary.criticalViolations} violações críticas identificadas.</p>
                    </div>
                    <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8;">
                        <h4 style="color: #0c5460; margin-bottom: 10px;">2. Implementar Testes Automatizados</h4>
                        <p style="color: #0c5460;">Configure testes de acessibilidade no pipeline de CI/CD.</p>
                    </div>
                    <div style="background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
                        <h4 style="color: #155724; margin-bottom: 10px;">3. Treinamento da Equipe</h4>
                        <p style="color: #155724;">Capacite desenvolvedores em boas práticas de acessibilidade.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function showTab(tabName) {
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Remove active class from all tab buttons
            const tabButtons = document.querySelectorAll('.tab-button');
            tabButtons.forEach(button => button.classList.remove('active'));
            
            // Show selected tab content
            document.getElementById(tabName).classList.add('active');
            
            // Add active class to clicked button
            event.target.classList.add('active');
        }
        
        function filterIssues(severity) {
            const issues = document.querySelectorAll('.issue-card');
            issues.forEach(issue => {
                if (severity === 'all' || issue.dataset.severity === severity) {
                    issue.style.display = 'block';
                } else {
                    issue.style.display = 'none';
                }
            });
        }
        
        function filterPages(score) {
            const pages = document.querySelectorAll('.page-card');
            pages.forEach(page => {
                if (score === 'all' || page.dataset.score === score) {
                    page.style.display = 'block';
                } else {
                    page.style.display = 'none';
                }
            });
        }
        
        function filterByViolations(hasViolations) {
            const pages = document.querySelectorAll('.page-card');
            pages.forEach(page => {
                if (hasViolations === 'all' || page.dataset.violations === hasViolations) {
                    page.style.display = 'block';
                } else {
                    page.style.display = 'none';
                }
            });
        }
        
        // Auto-refresh recommendations based on violations
        document.addEventListener('DOMContentLoaded', function() {
            // Add any additional initialization logic here
            console.log('Relatório de Acessibilidade carregado com sucesso!');
        });
    </script>
</body>
</html>`;
  }

  private generateMarkdownReport(results: MultiPageAuditResult): string {
    const { summary, commonIssues, pages } = results;
    
    let report = '# 🔍 Multi-Page Accessibility Audit Report\n\n';
    
    // Summary
    report += '## 📊 Executive Summary\n\n';
    report += `- **Base URL:** ${results.baseUrl}\n`;
    report += `- **Pages Audited:** ${results.auditedPages}/${results.totalPages}\n`;
    report += `- **Overall Score:** ${summary.averageScore.toFixed(1)}/100\n`;
    report += `- **Compliance:** ${summary.compliance.percentage.toFixed(1)}% (${summary.compliance.status})\n`;
    report += `- **Total Violations:** ${summary.totalViolations}\n`;
    report += `- **Critical Issues:** ${summary.criticalViolations}\n\n`;
    
    // Performance
    report += '## 🏆 Performance Ranking\n\n';
    report += `- **Best:** ${summary.bestPerformingPage.url} (${summary.bestPerformingPage.score.toFixed(1)})\n`;
    report += `- **Worst:** ${summary.worstPerformingPage.url} (${summary.worstPerformingPage.score.toFixed(1)})\n\n`;
    
    // Common issues
    if (commonIssues.length > 0) {
      report += '## ⚠️ Common Issues\n\n';
      commonIssues.slice(0, 10).forEach((issue, index) => {
        report += `### ${index + 1}. ${issue.criteria}\n`;
        report += `- **Severity:** ${issue.severity}\n`;
        report += `- **Affects:** ${issue.count} pages\n`;
        report += `- **Recommendation:** ${issue.recommendation}\n\n`;
      });
    }
    
    // Pages
    report += '## 📄 Page Details\n\n';
    report += '| Page | Score | Violations | Status |\n';
    report += '|------|-------|------------|--------|\n';
    pages.forEach(page => {
      const status = page.wcagScore >= 80 ? '✅ Pass' : page.wcagScore >= 60 ? '⚠️ Warning' : '❌ Fail';
      report += `| ${page.url} | ${page.wcagScore.toFixed(1)} | ${page.violationCount} | ${status} |\n`;
    });
    
    return report;
  }

  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical': return '🔴';
      case 'serious': return '🟡';
      case 'moderate': return '🟠';
      case 'minor': return '🔵';
      default: return '⚪';
    }
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'serious': return '#fd7e14';
      case 'moderate': return '#ffc107';
      case 'minor': return '#6c757d';
      default: return '#6c757d';
    }
  }

  private getScoreClass(score: number): string {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-warning';
    return 'score-poor';
  }

  private getViolationClass(count: number): string {
    if (count === 0) return 'score-excellent';
    if (count < 10) return 'score-good';
    if (count < 20) return 'score-warning';
    return 'score-poor';
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}