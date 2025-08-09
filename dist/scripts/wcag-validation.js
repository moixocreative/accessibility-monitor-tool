#!/usr/bin/env ts-node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const wcag_validator_1 = require("../validation/wcag-validator");
const wcag_criteria_1 = require("../core/wcag-criteria");
const logger_1 = require("../utils/logger");
const report_generator_1 = require("../reports/report-generator");
async function main() {
    logger_1.logger.info('Iniciando validação WCAG 2.1 AA');
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
    if (isCI) {
        console.log('\n🏗️  AMBIENTE CI/CD DETECTADO');
        console.log('================================');
        console.log('⚠️  Browser não disponível - usando simulação');
        console.log('📊 Resultados serão simulados para teste');
    }
    const url = process.argv[2];
    const auditType = process.argv[3]?.toLowerCase();
    const reportFormat = process.argv[4]?.toLowerCase() || 'console';
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
    const targetUrl = url || 'https://www.untile.pt';
    const isCompleteAudit = auditType === 'complete';
    const auditTypeDisplay = isCompleteAudit ? 'COMPLETA' : 'SIMPLES';
    const validFormats = ['console', 'json', 'html', 'markdown'];
    if (!validFormats.includes(reportFormat)) {
        console.log('\n❌ ERRO: Formato de relatório inválido');
        console.log('================================');
        console.log(`Formato fornecido: ${reportFormat}`);
        console.log(`Formatos válidos: ${validFormats.join(', ')}`);
        process.exit(1);
    }
    try {
        new URL(targetUrl);
    }
    catch (error) {
        console.log('\n❌ ERRO: URL inválida');
        console.log('================================');
        console.log(`URL fornecida: ${targetUrl}`);
        console.log('Certifique-se de incluir o protocolo (http:// ou https://)');
        process.exit(1);
    }
    const validator = new wcag_validator_1.WCAGValidator();
    try {
        console.log('\n🎯 TIPO DE AUDITORIA WCAG 2.1 AA');
        console.log('==================================');
        console.log(`Tipo: ${auditTypeDisplay}`);
        if (isCompleteAudit) {
            console.log('📋 Testando TODOS os critérios WCAG 2.1 AA');
            console.log('⚠️  Auditoria completa pode demorar mais tempo');
        }
        else {
            console.log(`📋 Testando ${wcag_criteria_1.PRIORITY_WCAG_CRITERIA.length} critérios prioritários`);
            console.log(`Critérios críticos (P0): ${(0, wcag_criteria_1.getCriticalCriteria)().length}`);
        }
        console.log(`\n🔍 EXECUTANDO AUDITORIA WCAG`);
        console.log(`URL: ${targetUrl}`);
        console.log(`Tipo: ${auditTypeDisplay}`);
        const siteId = `audit_${Date.now()}`;
        const auditResult = await validator.auditSite(targetUrl, siteId, isCompleteAudit);
        const reportGenerator = new report_generator_1.ReportGenerator();
        const reportOptions = {
            format: reportFormat,
            detailed: true,
            includeRecommendations: true,
            includeLegalRisk: true
        };
        const report = reportGenerator.generateReport(auditResult, reportOptions);
        if (reportFormat === 'console') {
            console.log(report);
        }
        else {
            const fs = await Promise.resolve().then(() => __importStar(require('fs')));
            const path = await Promise.resolve().then(() => __importStar(require('path')));
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
            }
            else if (reportFormat === 'json') {
                console.log('\n💡 Para processar o relatório JSON:');
                console.log(`   Use ferramentas como jq ou importe em suas aplicações`);
            }
            else if (reportFormat === 'markdown') {
                console.log('\n💡 Para visualizar o relatório Markdown:');
                console.log(`   Abra em qualquer editor que suporte Markdown`);
            }
        }
    }
    catch (error) {
        logger_1.logger.error('Erro na validação WCAG:', error);
        console.log('\n❌ ERRO NA AUDITORIA');
        console.log('=====================');
        console.log('Ocorreu um erro durante a auditoria:');
        console.log(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
    finally {
        try {
            console.log('\n🧹 Limpando recursos...');
            await Promise.race([
                validator.close(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Cleanup timeout')), 15000))
            ]);
            console.log('✅ Recursos limpos com sucesso');
        }
        catch (cleanupError) {
            console.log('⚠️  Erro durante limpeza de recursos:', cleanupError);
        }
    }
}
main().catch(error => {
    logger_1.logger.error('Erro fatal na validação WCAG:', error);
    console.log('\n💥 ERRO FATAL');
    console.log('==============');
    console.log('Ocorreu um erro inesperado:');
    console.log(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
//# sourceMappingURL=wcag-validation.js.map