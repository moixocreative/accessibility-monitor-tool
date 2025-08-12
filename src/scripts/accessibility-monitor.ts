#!/usr/bin/env ts-node

import { AccessibilityAuditor } from './accessibility-audit';
// eslint-disable-next-line no-unused-vars
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

interface MonitorOptions {
  strategy?: 'comprehensive' | 'auto' | 'sitemap' | 'manual';
  maxPages?: number;
  generateIndividualReports?: boolean;
  timeout?: number;
}

class AccessibilityMonitor {
  private auditor: AccessibilityAuditor;

  constructor() {
    this.auditor = new AccessibilityAuditor();
  }

  /**
   * Monitorizar um site completo com estratégia configurável
   */
  async monitorSite(baseUrl: string, options: MonitorOptions = {}): Promise<void> {
    const {
      strategy = 'comprehensive',
      maxPages = Infinity, // Sem limite de páginas para análise completa
      generateIndividualReports = false,
      timeout = 30000
    } = options;

    console.log(`🌐 Iniciando monitorização de acessibilidade`);
    console.log(`📋 URL: ${baseUrl}`);
    console.log(`🔍 Estratégia: ${strategy}`);
    console.log(`📄 Máximo de páginas: ${maxPages}`);
    console.log(`⏱️ Timeout: ${timeout}ms`);
    console.log('='.repeat(60));

    try {
      const result = await this.auditor.auditFullSite(baseUrl, {
        maxPages,
        timeout,
        generateIndividualReports,
        strategy
      });

      console.log('\n✅ Monitorização concluída!');
      console.log(`📊 Score médio: ${result.averageScore.toFixed(2)}`);
      console.log(`🚨 Total de violações: ${result.totalViolations}`);
      console.log(`📋 Nível de conformidade: ${result.complianceLevel}`);
      console.log(`📄 Páginas auditadas: ${result.totalPages}`);

    } catch (error) {
      console.error('❌ Erro durante a monitorização:', error);
      process.exit(1);
    }
  }

  /**
   * Testar uma página específica
   */
  async testSinglePage(url: string): Promise<void> {
    console.log(`🔍 Testando página específica: ${url}`);
    console.log('='.repeat(60));

    try {
      const result = await this.auditor.auditSinglePage(url);
      
      console.log('\n✅ Teste concluído!');
      console.log(`📊 Score WCAG: ${result.score.toFixed(2)}`);
      console.log(`📋 Checklist: ${result.compliance.checklistPercentage}%`);
      console.log(`🚨 Violações: ${result.violations.length}`);
      console.log(`📋 Conformidade: ${result.compliance.level}`);

    } catch (error) {
      console.error('❌ Erro durante o teste:', error);
      process.exit(1);
    }
  }

  /**
   * Monitorizar múltiplos sites
   */
  async monitorMultipleSites(sites: string[], options: MonitorOptions = {}): Promise<void> {
    console.log(`🌐 Monitorizando ${sites.length} sites`);
    console.log('='.repeat(60));

    const results = [];

    for (let i = 0; i < sites.length; i++) {
      const site = sites[i];
      console.log(`\n📋 Site ${i + 1}/${sites.length}: ${site}`);
      
      try {
        const result = await this.auditor.auditFullSite(site, {
          maxPages: options.maxPages || Infinity, // Sem limite de páginas para análise completa
          timeout: options.timeout || 30000,
          generateIndividualReports: options.generateIndividualReports || false,
          strategy: options.strategy || 'auto'
        });

        results.push({
          url: site,
          ...result
        });

        console.log(`✅ ${site}: ${result.complianceLevel} (Score: ${result.averageScore.toFixed(2)})`);

      } catch (error) {
        console.error(`❌ Erro em ${site}:`, error);
        results.push({
          url: site,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    // Gerar relatório consolidado
    this.generateConsolidatedReport(results);
  }

  /**
   * Gerar relatório consolidado para múltiplos sites
   */
  private generateConsolidatedReport(results: any[]): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const reportPath = path.join('reports', `consolidated-report-${timestamp}.html`);
    
    const html = this.generateConsolidatedHTML(results);
    
    fs.mkdirSync('reports', { recursive: true });
    fs.writeFileSync(reportPath, html);
    
    console.log(`\n📄 Relatório consolidado: ${reportPath}`);
  }

  /**
   * Gerar HTML para relatório consolidado
   */
  private generateConsolidatedHTML(results: any[]): string {
    const successfulResults = results.filter(r => !r.error);
    // eslint-disable-next-line no-unused-vars
    const failedResults = results.filter(r => r.error);
    
    const complianceStats = {
      plenamente: successfulResults.filter(r => r.complianceLevel === 'Plenamente conforme').length,
      parcialmente: successfulResults.filter(r => r.complianceLevel === 'Parcialmente conforme').length,
      nao: successfulResults.filter(r => r.complianceLevel === 'Não conforme').length
    };

    return `<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Consolidado de Acessibilidade</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2em; font-weight: bold; color: #667eea; }
        .stat-label { color: #6c757d; text-transform: uppercase; font-size: 0.8em; letter-spacing: 1px; }
        .site-result { background: white; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 15px; padding: 20px; }
        .site-url { font-weight: bold; color: #007bff; margin-bottom: 10px; }
        .compliance-badge { display: inline-block; padding: 5px 12px; border-radius: 15px; font-weight: bold; margin-left: 10px; }
        .compliance-plenamente { background: #28a745; color: white; }
        .compliance-parcialmente { background: #ffc107; color: #212529; }
        .compliance-nao { background: #dc3545; color: white; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #6c757d; border-top: 1px solid #dee2e6; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌐 Relatório Consolidado de Acessibilidade</h1>
            <p><strong>Data:</strong> ${new Date().toLocaleString('pt-PT')}</p>
            <p><strong>Sites analisados:</strong> ${results.length}</p>
        </div>

        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
            <h2>📊 Estatísticas Gerais</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${successfulResults.length}</div>
                    <div class="stat-label">Sites Analisados</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${complianceStats.plenamente}</div>
                    <div class="stat-label">Plenamente Conformes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${complianceStats.parcialmente}</div>
                    <div class="stat-label">Parcialmente Conformes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${complianceStats.nao}</div>
                    <div class="stat-label">Não Conformes</div>
                </div>
            </div>
        </div>

        <div>
            <h2>📄 Resultados por Site</h2>
            ${results.map(result => {
                if (result.error) {
                    return `
                        <div class="site-result">
                            <div class="site-url">${result.url}</div>
                            <div class="error">❌ Erro: ${result.error}</div>
                        </div>
                    `;
                }
                
                return `
                    <div class="site-result">
                        <div class="site-url">${result.url}</div>
                        <div class="compliance-badge compliance-${result.complianceLevel.toLowerCase().replace(' ', '')}">
                            ${result.complianceLevel}
                        </div>
                        <p><strong>Score médio:</strong> ${result.averageScore.toFixed(2)}</p>
                        <p><strong>Violações:</strong> ${result.totalViolations}</p>
                        <p><strong>Páginas auditadas:</strong> ${result.totalPages}</p>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div class="footer">
            <p>Relatório gerado automaticamente pela ferramenta de monitorização de acessibilidade UNTILE</p>
            <p>Data: ${new Date().toLocaleString('pt-PT')}</p>
        </div>
    </div>
</body>
</html>`;
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🌐 Accessibility Monitor Tool');
    console.log('='.repeat(40));
    console.log('');
    console.log('Uso:');
    console.log('');
    console.log('📄 Testar página específica:');
    console.log('  yarn monitor <URL_DA_PÁGINA>');
    console.log('');
    console.log('🌐 Monitorizar site completo:');
    console.log('  yarn monitor <URL_BASE> [estratégia] [opções]');
    console.log('');
    console.log('📋 Estratégias disponíveis:');
    console.log('  comprehensive (padrão) - Usa todos os métodos');
    console.log('  auto - Discovery automático');
    console.log('  sitemap - Apenas sitemap.xml');
    console.log('  manual - Apenas a URL fornecida');
    console.log('');
    console.log('⚙️ Opções:');
    console.log('  --max-pages=N - Máximo de páginas a auditar (padrão: sem limite)');
    console.log('  --individual-reports - Gerar relatórios individuais');
    console.log('  --timeout=N - Timeout em milissegundos');
    console.log('');
    console.log('📊 Monitorizar múltiplos sites:');
    console.log('  yarn monitor --sites <URL1> <URL2> <URL3>');
    console.log('');
    process.exit(1);
  }

  const monitor = new AccessibilityMonitor();
  
  // Verificar se é monitorização de múltiplos sites
  if (args[0] === '--sites') {
    const sites = args.slice(1);
    if (sites.length === 0) {
      console.error('❌ Erro: Especifique pelo menos um site');
      process.exit(1);
    }
    
    await monitor.monitorMultipleSites(sites);
    return;
  }

  const url = args[0];
  const strategy = args[1] as any || 'comprehensive';
  
  // Parsear opções
  const options: MonitorOptions = {
    strategy,
    maxPages: Infinity, // Sem limite de páginas para análise completa
    generateIndividualReports: false,
    timeout: 30000
  };

  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--max-pages=')) {
      options.maxPages = parseInt(arg.split('=')[1]);
    } else if (arg === '--individual-reports') {
      options.generateIndividualReports = true;
    } else if (arg.startsWith('--timeout=')) {
      options.timeout = parseInt(arg.split('=')[1]);
    }
  }

  // Verificar se é URL de página específica ou site
  const urlObj = new URL(url);
  const pathSegments = urlObj.pathname.split('/').filter(Boolean);
  
  if (pathSegments.length > 2) {
    // Provavelmente uma página específica
    await monitor.testSinglePage(url);
  } else {
    // Provavelmente um site
    await monitor.monitorSite(url, options);
  }
}

// Executar se for o script principal
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

export { AccessibilityMonitor };
