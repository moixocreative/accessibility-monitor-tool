#!/usr/bin/env ts-node

import { WCAGValidator } from '../validation/wcag-validator';
import { MultiPageValidator } from '../validation/multi-page-validator';
import { HTMLReportGenerator } from '../reports/html-report-generator';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

interface SimpleAuditOptions {
  url: string;
  strategy: 'comprehensive' | 'auto' | 'sitemap' | 'manual';
  maxPages?: number;
  outputFormat?: 'console' | 'html' | 'json';
}

export class SimpleAudit {
  private validator: WCAGValidator;
  private multiPageValidator: MultiPageValidator;

  constructor() {
    this.validator = new WCAGValidator();
    this.multiPageValidator = new MultiPageValidator();
  }

  async run(options: SimpleAuditOptions): Promise<void> {
    try {
      logger.info(`🔍 Iniciando auditoria AccessMonitor para: ${options.url}`);
      logger.info(`📋 Estratégia: ${options.strategy}`);

      // Configuração para reproduzir exatamente o AccessMonitor
      const auditOptions = {
        useStandardFormula: true, // Fórmula padrão do axe-core (2 pontos por violação)
        criteriaSet: 'gov-pt' as const, // 10 aspetos críticos
        maxPages: options.maxPages || Infinity, // Sem limite de páginas para análise completa
        crawlStrategy: options.strategy
      };

      // Executar auditoria multi-página
      const result = await this.multiPageValidator.auditMultiplePages(options.url, auditOptions);

      // Gerar relatório
      await this.generateReport(result, options);

      logger.info('✅ Auditoria concluída com sucesso');

    } catch (error) {
      logger.error('❌ Erro na auditoria:', error);
      process.exit(1);
    } finally {
      await this.validator.close();
    }
  }

  private async generateReport(result: any, options: SimpleAuditOptions): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];
    const siteName = new URL(options.url).hostname.replace(/\./g, '-');
    const fileName = `accessmonitor-${siteName}-${timestamp}`;

    // Relatório console (sempre gerado)
    this.generateConsoleReport(result, options.url);

    // Relatórios adicionais baseados no formato
    if (options.outputFormat === 'html') {
      await this.generateHtmlReport(result, fileName);
    } else if (options.outputFormat === 'json') {
      await this.generateJsonReport(result, fileName);
    }
  }

  private generateConsoleReport(result: any, url: string): void {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 RELATÓRIO ACCESSMONITOR');
    console.log('='.repeat(80));
    console.log(`🌐 Site: ${url}`);
    console.log(`📅 Data: ${new Date().toLocaleString('pt-PT')}`);
    console.log(`📊 Páginas auditadas: ${result.summary.totalPages || result.pageResults?.length || 0}`);
    console.log(`📈 Pontuação média: ${result.summary.averageScore}/10`);
    console.log(`⚖️ Nível de conformidade: ${result.summary.compliance.level}`);
    console.log(`📋 Critérios cumpridos: ${Math.round(result.summary.compliance.criteriaPassRate * 100)}%`);
    
    console.log('\n📋 JUSTIFICAÇÃO:');
    result.summary.compliance.reasons.forEach((reason: string) => {
      console.log(`  ${reason}`);
    });

    console.log('\n💡 RECOMENDAÇÕES:');
    result.summary.compliance.recommendations.forEach((rec: string) => {
      console.log(`  ${rec}`);
    });

    console.log('\n📄 ANÁLISE POR PÁGINA:');
    console.log('─'.repeat(80));
    result.pageResults.forEach((page: any) => {
      const complianceLevel = page.compliance?.level || 'Não avaliado';
      const status = complianceLevel === 'Plenamente conforme' ? '✅' :
                    complianceLevel === 'Parcialmente conforme' ? '⚠️' : '❌';
      console.log(`${status} ${page.url} - ${page.score}/10 - ${complianceLevel}`);
    });

    console.log('\n' + '='.repeat(80));
  }

  private async generateHtmlReport(result: any, fileName: string): Promise<void> {
    try {
      const reportGenerator = new HTMLReportGenerator();
      
      // Preparar dados para o relatório multi-página
      const reportData = {
        baseUrl: result.baseUrl || result.url || '',
        totalPages: result.summary?.totalPages || result.pageResults?.length || 0,
        pagesAudited: result.pageResults?.length || 0,
        startTime: result.startTime || new Date(),
        endTime: result.endTime || new Date(),
        pageResults: result.pageResults || [],
        overallCompliance: result.summary?.compliance?.level || 'NÃO CONFORME',
        complianceDetails: {
          wcagScore: result.summary?.averageScore || 0,
          checklistPercentage: Math.round((result.summary?.compliance?.criteriaPassRate || 0) * 100),
          reason: result.summary?.compliance?.reasons?.join('; ') || ''
        },
        summary: {
          averageScore: result.summary?.averageScore || 0,
          totalViolations: result.summary?.totalViolations || 0,
          violationsBySeverity: result.summary?.violationsBySeverity || {},
          violationsByType: result.summary?.violationsByType || {}
        }
      };
      
      const reportPath = await reportGenerator.generateMultiPageReport(reportData);
      logger.info(`📄 Relatório HTML gerado: ${reportPath}`);
    } catch (error) {
      logger.warn('Erro ao gerar relatório HTML:', error);
      // Fallback para o método antigo
      const htmlContent = this.generateHtmlContent(result);
      const filePath = path.join(process.cwd(), 'reports', `${fileName}.html`);
      
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, htmlContent);
      logger.info(`📄 Relatório HTML fallback gerado: ${filePath}`);
    }
  }

  private async generateJsonReport(result: any, fileName: string): Promise<void> {
    const filePath = path.join(process.cwd(), 'reports', `${fileName}.json`);
    
    // Criar diretório se não existir
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
    logger.info(`📄 Relatório JSON gerado: ${filePath}`);
  }

  private calculateCompliance(score: number, checklistPercentage: number): string {
    if (score > 9 && checklistPercentage >= 75) {
      return 'PLENAMENTE CONFORME';
    } else if (score > 8 && checklistPercentage >= 50 && checklistPercentage < 75) {
      return 'PARCIALMENTE CONFORME';
    } else {
      return 'NÃO CONFORME';
    }
  }

  private generateHtmlContent(result: any): string {
    return `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório AccessMonitor</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .score { font-size: 24px; font-weight: bold; }
        .compliance { padding: 10px; border-radius: 5px; margin: 10px 0; }
        .plenamente { background: #d4edda; color: #155724; }
        .parcialmente { background: #fff3cd; color: #856404; }
        .nao-conforme { background: #f8d7da; color: #721c24; }
        .page-result { margin: 10px 0; padding: 10px; border-left: 4px solid #007bff; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Relatório AccessMonitor</h1>
        <p><strong>Data:</strong> ${new Date().toLocaleString('pt-PT')}</p>
        <p><strong>Páginas auditadas:</strong> ${result.summary.totalPages}</p>
        <p class="score">Pontuação média: ${result.summary.averageScore}/10</p>
        <div class="compliance ${result.summary.compliance.level.toLowerCase().replace(' ', '-')}">
            <strong>Nível de conformidade:</strong> ${result.summary.compliance.level}
        </div>
        <p><strong>Critérios cumpridos:</strong> ${Math.round(result.summary.compliance.criteriaPassRate * 100)}%</p>
    </div>
    
    <h2>📋 Justificação</h2>
    <ul>
        ${result.summary.compliance.reasons.map((reason: string) => `<li>${reason}</li>`).join('')}
    </ul>
    
    <h2>💡 Recomendações</h2>
    <ul>
        ${result.summary.compliance.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
    </ul>
    
    <h2>📄 Análise por Página</h2>
    ${result.pageResults.map((page: any) => `
        <div class="page-result">
            <strong>${page.url}</strong><br>
            Pontuação: ${page.wcagScore || 0}/10<br>
            Conformidade: ${this.calculateCompliance(page.wcagScore || 0, page.checklistResults?.percentage || 0)}
        </div>
    `).join('')}
</body>
</html>`;
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
🔍 AccessMonitor - Ferramenta de Auditoria de Acessibilidade

USO:
  yarn audit <URL> [estratégia] [formato] [max-páginas]

PARÂMETROS:
  <URL>                    URL base do site (obrigatório)
  [estratégia]            Como descobrir páginas:
                          - comprehensive (padrão) - Usa todos os métodos
                          - auto - Discovery automático
                          - sitemap - Apenas sitemap.xml
                          - manual - Apenas a URL fornecida
  [formato]               Formato do relatório:
                          - console (padrão)
                          - html
                          - json
  [max-páginas]           Número máximo de páginas (padrão: sem limite)

EXEMPLOS:
  yarn audit https://example.com
  yarn audit https://example.com comprehensive html
  yarn audit https://example.com sitemap json 50

NOTA: Esta ferramenta reproduz exatamente os critérios e fórmula do AccessMonitor (acessibilidade.gov.pt)
    `);
    process.exit(0);
  }

  const url = args[0] || '';
  const strategy = (args[1] as 'comprehensive' | 'auto' | 'sitemap' | 'manual') || 'comprehensive';
  const outputFormat = (args[2] as 'console' | 'html' | 'json') || 'console';
  const maxPages = args[3] ? parseInt(args[3]) : Infinity;

  // Validar URL
  try {
    new URL(url);
  } catch {
    console.error('❌ URL inválida:', url);
    process.exit(1);
  }

  // Validar estratégia
  const validStrategies = ['comprehensive', 'auto', 'sitemap', 'manual'];
  if (!validStrategies.includes(strategy)) {
    console.error('❌ Estratégia inválida:', strategy);
    console.error('Estratégias válidas:', validStrategies.join(', '));
    process.exit(1);
  }

  // Validar formato
  const validFormats = ['console', 'html', 'json'];
  if (!validFormats.includes(outputFormat)) {
    console.error('❌ Formato inválido:', outputFormat);
    console.error('Formatos válidos:', validFormats.join(', '));
    process.exit(1);
  }

  // Validar maxPages
  if (maxPages < 1) {
    console.error('❌ Número máximo de páginas deve ser maior que 0');
    process.exit(1);
  }

  const audit = new SimpleAudit();
  await audit.run({
    url,
    strategy,
    maxPages,
    outputFormat
  });
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}
