#!/usr/bin/env ts-node

import { SimpleAudit } from './simple-audit';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

interface SiteConfig {
  url: string;
  name: string;
  description: string;
}

interface BatchConfig {
  sites: SiteConfig[];
  defaultSettings: {
    strategy: 'comprehensive' | 'auto' | 'sitemap' | 'manual';
    maxPages: number;
    outputFormat: 'console' | 'html' | 'json';
  };
}

class BatchAudit {
  private simpleAudit: SimpleAudit;

  constructor() {
    this.simpleAudit = new SimpleAudit();
  }

  async runBatch(configPath: string = 'sites-config.json'): Promise<void> {
    try {
      logger.info(`🔍 Iniciando auditoria em lote usando: ${configPath}`);

      // Carregar configuração
      const config = this.loadConfig(configPath);
      logger.info(`📋 Sites configurados: ${config.sites.length}`);

      // Criar diretório para relatórios
      const reportsDir = path.join(process.cwd(), 'reports', 'batch');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Executar auditoria para cada site
      const results = [];
      for (let i = 0; i < config.sites.length; i++) {
        const site = config.sites[i];
        if (!site) continue;
        
        logger.info(`\n📊 [${i + 1}/${config.sites.length}] Auditando: ${site.name} (${site.url})`);

        try {
          await this.simpleAudit.run({
            url: site.url,
            strategy: config.defaultSettings.strategy,
            maxPages: config.defaultSettings.maxPages,
            outputFormat: config.defaultSettings.outputFormat
          });

          results.push({
            site: site.name,
            url: site.url,
            status: 'success'
          });

        } catch (error) {
          logger.error(`❌ Erro ao auditar ${site.name}:`, error);
          results.push({
            site: site.name,
            url: site.url,
            status: 'error',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }

        // Delay entre auditorias para não sobrecarregar
        if (i < config.sites.length - 1) {
          logger.info('⏳ Aguardando 5 segundos antes da próxima auditoria...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      // Gerar relatório resumo
      await this.generateBatchReport(results, reportsDir);

      logger.info('\n✅ Auditoria em lote concluída!');

    } catch (error) {
      logger.error('❌ Erro na auditoria em lote:', error);
      process.exit(1);
    }
  }

  private loadConfig(configPath: string): BatchConfig {
    try {
      const fullPath = path.resolve(configPath);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Arquivo de configuração não encontrado: ${fullPath}`);
      }

      const configContent = fs.readFileSync(fullPath, 'utf8');
      const config = JSON.parse(configContent) as BatchConfig;

      // Validar configuração
      if (!config.sites || !Array.isArray(config.sites)) {
        throw new Error('Configuração inválida: sites deve ser um array');
      }

      if (!config.defaultSettings) {
        throw new Error('Configuração inválida: defaultSettings é obrigatório');
      }

      return config;

    } catch (error) {
      logger.error('❌ Erro ao carregar configuração:', error);
      throw error;
    }
  }

  private async generateBatchReport(results: any[], reportsDir: string): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];
    const reportPath = path.join(reportsDir, `batch-report-${timestamp}.json`);

    const report = {
      timestamp: new Date().toISOString(),
      totalSites: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      results: results
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    logger.info(`📄 Relatório de lote gerado: ${reportPath}`);

    // Mostrar resumo no console
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMO DA AUDITORIA EM LOTE');
    console.log('='.repeat(80));
    console.log(`📅 Data: ${new Date().toLocaleString('pt-PT')}`);
    console.log(`🌐 Total de sites: ${report.totalSites}`);
    console.log(`✅ Sucessos: ${report.successful}`);
    console.log(`❌ Falhas: ${report.failed}`);
    
    if (report.failed > 0) {
      console.log('\n❌ Sites com erro:');
      results.filter(r => r.status === 'error').forEach(r => {
        console.log(`  - ${r.site} (${r.url}): ${r.error}`);
      });
    }
    
    console.log('='.repeat(80));
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔍 AccessMonitor - Auditoria em Lote

USO:
  yarn audit:batch [config-file]

PARÂMETROS:
  [config-file]          Arquivo de configuração (padrão: sites-config.json)

EXEMPLOS:
  yarn audit:batch
  yarn audit:batch my-sites.json

ARQUIVO DE CONFIGURAÇÃO:
  {
    "sites": [
      {
        "url": "https://example.com",
        "name": "Example Site",
        "description": "Descrição do site"
      }
    ],
    "defaultSettings": {
      "strategy": "comprehensive",
      "maxPages": 20,
      "outputFormat": "console"
    }
  }

NOTA: Esta ferramenta reproduz exatamente os critérios e fórmula do AccessMonitor (acessibilidade.gov.pt)
    `);
    process.exit(0);
  }

  const configPath = args[0] || 'sites-config.json';
  const batchAudit = new BatchAudit();
  await batchAudit.runBatch(configPath);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}
