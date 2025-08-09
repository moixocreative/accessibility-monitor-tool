#!/usr/bin/env ts-node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const portfolio_monitor_1 = require("../monitoring/portfolio-monitor");
const emergency_response_1 = require("../emergency/emergency-response");
const logger_1 = require("../utils/logger");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function main() {
    const args = process.argv.slice(2);
    const reportType = args[0];
    const version = args.find(arg => arg.startsWith('--version='))?.split('=')[1];
    const branch = args.find(arg => arg.startsWith('--branch='))?.split('=')[1];
    logger_1.logger.info('Gerador de Relatórios UNTILE');
    const portfolioMonitor = new portfolio_monitor_1.PortfolioMonitor();
    const emergencyResponse = new emergency_response_1.EmergencyResponse();
    const timeout = setTimeout(() => {
        logger_1.logger.error('Timeout na geração de relatório');
        process.exit(1);
    }, 300000);
    try {
        switch (reportType) {
            case '--test':
                await generateTestReport(portfolioMonitor, emergencyResponse);
                break;
            case '--release':
                await generateReleaseReport(portfolioMonitor, emergencyResponse, version);
                break;
            case '--deploy':
                await generateDeployReport(portfolioMonitor, emergencyResponse, branch);
                break;
            default:
                await showHelp();
                break;
        }
    }
    catch (error) {
        logger_1.logger.error('Erro na geração de relatório:', error);
        process.exit(1);
    }
    finally {
        clearTimeout(timeout);
        await portfolioMonitor.cleanup();
    }
}
async function generateTestReport(portfolioMonitor, emergencyResponse) {
    console.log('\n📊 GERANDO RELATÓRIO DE TESTES');
    console.log('================================');
    const stats = portfolioMonitor.getPortfolioStats();
    const emergencyReport = emergencyResponse.generateEmergencyReport();
    const report = {
        timestamp: new Date(),
        type: 'test',
        portfolio: stats,
        emergency: emergencyReport,
        summary: {
            totalSites: stats.totalSites,
            averageScore: stats.averageScore,
            totalViolations: stats.totalViolations,
            criticalViolations: stats.criticalViolations,
            compliancePercentage: stats.compliancePercentage,
            totalIncidents: emergencyReport.totalIncidents,
            slaBreaches: emergencyReport.slaBreaches
        }
    };
    const reportPath = path_1.default.join('reports', `test-report-${Date.now()}.json`);
    fs_1.default.mkdirSync(path_1.default.dirname(reportPath), { recursive: true });
    fs_1.default.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('✅ Relatório de testes gerado:', reportPath);
    console.log('\n📈 RESUMO:');
    console.log(`  Sites: ${stats.totalSites}`);
    console.log(`  Score médio: ${stats.averageScore}%`);
    console.log(`  Violações: ${stats.totalViolations}`);
    console.log(`  Incidentes: ${emergencyReport.totalIncidents}`);
    console.log(`  SLA breaches: ${emergencyReport.slaBreaches}`);
}
async function generateReleaseReport(portfolioMonitor, emergencyResponse, version) {
    console.log('\n📊 GERANDO RELATÓRIO DE RELEASE');
    console.log('=================================');
    const stats = portfolioMonitor.getPortfolioStats();
    const emergencyReport = emergencyResponse.generateEmergencyReport();
    const report = {
        timestamp: new Date(),
        type: 'release',
        version: version || 'unknown',
        portfolio: stats,
        emergency: emergencyReport,
        releaseChecks: {
            wcagCompliance: stats.averageScore >= 80,
            criticalViolations: stats.criticalViolations === 0,
            slaBreaches: emergencyReport.slaBreaches === 0,
            activeIncidents: emergencyResponse.getActiveIncidents().length === 0,
            releaseReady: stats.averageScore >= 80 && stats.criticalViolations === 0
        },
        summary: {
            releaseReady: stats.averageScore >= 80 && stats.criticalViolations === 0,
            totalSites: stats.totalSites,
            averageScore: stats.averageScore,
            criticalViolations: stats.criticalViolations,
            compliancePercentage: stats.compliancePercentage,
            totalIncidents: emergencyReport.totalIncidents,
            slaBreaches: emergencyReport.slaBreaches
        }
    };
    const reportPath = path_1.default.join('reports', `release-report-${version || Date.now()}.json`);
    fs_1.default.mkdirSync(path_1.default.dirname(reportPath), { recursive: true });
    fs_1.default.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('✅ Relatório de release gerado:', reportPath);
    console.log('\n📈 RESUMO:');
    console.log(`  Versão: ${version || 'N/A'}`);
    console.log(`  Sites: ${stats.totalSites}`);
    console.log(`  Score médio: ${stats.averageScore}%`);
    console.log(`  Violações críticas: ${stats.criticalViolations}`);
    console.log(`  Release ready: ${report.releaseChecks.releaseReady ? '✅ SIM' : '❌ NÃO'}`);
}
async function generateDeployReport(portfolioMonitor, emergencyResponse, branch) {
    console.log('\n📊 GERANDO RELATÓRIO DE DEPLOY');
    console.log('================================');
    const stats = portfolioMonitor.getPortfolioStats();
    const emergencyReport = emergencyResponse.generateEmergencyReport();
    const report = {
        timestamp: new Date(),
        type: 'deploy',
        branch: branch || 'unknown',
        portfolio: stats,
        emergency: emergencyReport,
        deployChecks: {
            wcagCompliance: stats.averageScore >= 80,
            criticalViolations: stats.criticalViolations === 0,
            slaBreaches: emergencyReport.slaBreaches === 0,
            activeIncidents: emergencyResponse.getActiveIncidents().length === 0,
            deployReady: stats.averageScore >= 80 && stats.criticalViolations === 0
        },
        summary: {
            deployReady: stats.averageScore >= 80 && stats.criticalViolations === 0,
            totalSites: stats.totalSites,
            averageScore: stats.averageScore,
            criticalViolations: stats.criticalViolations,
            compliancePercentage: stats.compliancePercentage,
            totalIncidents: emergencyReport.totalIncidents,
            slaBreaches: emergencyReport.slaBreaches
        }
    };
    const reportPath = path_1.default.join('reports', `deploy-report-${branch || Date.now()}.json`);
    fs_1.default.mkdirSync(path_1.default.dirname(reportPath), { recursive: true });
    fs_1.default.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('✅ Relatório de deploy gerado:', reportPath);
    console.log('\n📈 RESUMO:');
    console.log(`  Branch: ${branch || 'N/A'}`);
    console.log(`  Sites: ${stats.totalSites}`);
    console.log(`  Score médio: ${stats.averageScore}%`);
    console.log(`  Violações críticas: ${stats.criticalViolations}`);
    console.log(`  Deploy ready: ${report.deployChecks.deployReady ? '✅ SIM' : '❌ NÃO'}`);
}
async function showHelp() {
    console.log('\n📊 GERADOR DE RELATÓRIOS UNTILE');
    console.log('==================================');
    console.log('\nTipos de relatório disponíveis:');
    console.log('  --test                    Relatório de testes');
    console.log('  --release --version=X.X.X Relatório de release');
    console.log('  --deploy --branch=name    Relatório de deploy');
    console.log('\nExemplos:');
    console.log('  yarn report --test');
    console.log('  yarn report --release --version=1.0.0');
    console.log('  yarn report --deploy --branch=development');
}
if (require.main === module) {
    main().catch(error => {
        logger_1.logger.error('Erro fatal:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=generate-report.js.map