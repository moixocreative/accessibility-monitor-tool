"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioMonitor = void 0;
const cron_1 = require("cron");
const wcag_validator_1 = require("../validation/wcag-validator");
const logger_1 = require("../utils/logger");
const emergency_response_1 = require("../emergency/emergency-response");
class PortfolioMonitor {
    validator;
    emergencyResponse;
    monitoringJob = null;
    sites = [];
    constructor() {
        this.validator = new wcag_validator_1.WCAGValidator();
        this.emergencyResponse = new emergency_response_1.EmergencyResponse();
        this.loadPortfolioSites();
    }
    loadPortfolioSites() {
        this.sites = [
            {
                id: 'site_1',
                name: 'Welligence Website',
                url: 'https://solutions.welligence.com',
                technology: 'webflow',
                client: 'Welligence',
                lastAudit: new Date(),
                wcagScore: 85,
                violations: [],
                status: 'active'
            },
            {
                id: 'site_2',
                name: 'UNTILE Corporate',
                url: 'https://untile.pt',
                technology: 'laravel',
                client: 'UNTILE',
                lastAudit: new Date(),
                wcagScore: 92,
                violations: [],
                status: 'active'
            }
        ];
        logger_1.logger.info(`Portfolio carregado com ${this.sites.length} sites`);
    }
    startMonitoring() {
        const interval = this.getMonitoringInterval();
        this.monitoringJob = new cron_1.CronJob(interval, async () => {
            try {
                logger_1.logger.info('Executando auditoria periódica agendada');
                await this.runPortfolioAudit();
                logger_1.logger.info('Auditoria periódica concluída com sucesso');
            }
            catch (error) {
                logger_1.logger.error('Erro na auditoria periódica:', error);
            }
        }, null, false, 'Europe/Lisbon');
        this.monitoringJob.start();
        logger_1.logger.info('Monitorização do portfolio iniciada', {
            interval,
            nextRun: this.monitoringJob.nextDate().toISO()
        });
    }
    getMonitoringInterval() {
        const config = process.env.MONITORING_INTERVAL || '0 0 * * 1';
        const cronPattern = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;
        if (!cronPattern.test(config)) {
            logger_1.logger.warn('Expressão cron inválida, usando padrão', {
                provided: config,
                default: '0 0 * * 1'
            });
            return '0 0 * * 1';
        }
        return config;
    }
    stopMonitoring() {
        if (this.monitoringJob) {
            this.monitoringJob.stop();
            this.monitoringJob = null;
            logger_1.logger.info('Monitorização do portfolio parada');
        }
    }
    isMonitoringActive() {
        return this.monitoringJob ? true : false;
    }
    getNextScheduledRun() {
        const nextDate = this.monitoringJob?.nextDate();
        return nextDate ? nextDate.toJSDate() : null;
    }
    getMonitoringStats() {
        const lastRun = this.monitoringJob?.lastDate();
        return {
            isActive: this.isMonitoringActive(),
            nextRun: this.getNextScheduledRun(),
            interval: this.getMonitoringInterval(),
            ...(lastRun && { lastRun })
        };
    }
    async runPortfolioAudit() {
        logger_1.logger.info('Iniciando auditoria completa do portfolio');
        const auditResults = [];
        const criticalViolations = [];
        for (const site of this.sites) {
            try {
                (0, logger_1.logAudit)(`Auditoria iniciada para ${site.name}`, { url: site.url });
                const auditResult = await this.validator.auditSite(site.url, site.id, true);
                auditResults.push(auditResult);
                site.lastAudit = auditResult.timestamp;
                site.wcagScore = auditResult.wcagScore;
                site.violations = auditResult.violations;
                const criticalViolationsForSite = auditResult.violations.filter(v => v.severity === 'critical' || v.criteria.priority === 'P0');
                if (criticalViolationsForSite.length > 0) {
                    criticalViolations.push(...criticalViolationsForSite);
                    logger_1.logger.warn(`Violações críticas detectadas em ${site.name}`, {
                        count: criticalViolationsForSite.length,
                        violations: criticalViolationsForSite.map(v => ({
                            criteria: v.criteria.id,
                            severity: v.severity,
                            element: v.element
                        }))
                    });
                }
                (0, logger_1.logAudit)(`Auditoria concluída para ${site.name}`, {
                    score: auditResult.wcagScore,
                    violations: auditResult.violations.length,
                    criticalViolations: criticalViolationsForSite.length
                });
            }
            catch (error) {
                logger_1.logger.error(`Erro na auditoria de ${site.name}:`, error);
                await this.emergencyResponse.createIncident({
                    type: 'P1',
                    title: `Falha na auditoria de ${site.name}`,
                    description: `Erro técnico durante auditoria: ${error}`,
                    sites: [site.id],
                    violations: [],
                    detectedAt: new Date(),
                    responseTime: 0,
                    status: 'detected',
                    assignedTo: 'system',
                    slaDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000),
                    communications: []
                });
            }
        }
        if (criticalViolations.length > 0) {
            await this.processCriticalViolations(criticalViolations);
        }
        await this.generatePortfolioReport(auditResults);
        logger_1.logger.info('Auditoria do portfolio concluída', {
            sitesAudited: auditResults.length,
            criticalViolations: criticalViolations.length
        });
    }
    async processCriticalViolations(violations) {
        logger_1.logger.warn(`Processando ${violations.length} violações críticas`);
        const violationsBySite = violations.reduce((acc, violation) => {
            const siteId = violation.page.split('/')[2] || 'unknown';
            if (!acc[siteId]) {
                acc[siteId] = [];
            }
            acc[siteId].push(violation);
            return acc;
        }, {});
        for (const [siteId, siteViolations] of Object.entries(violationsBySite)) {
            const site = this.sites.find(s => s.id === siteId);
            if (site) {
                const hasP0Violations = siteViolations.some(v => v.criteria.priority === 'P0');
                const incidentType = hasP0Violations ? 'P0' : 'P1';
                await this.emergencyResponse.createIncident({
                    type: incidentType,
                    title: `Violações críticas detectadas em ${site.name}`,
                    description: `${siteViolations.length} violações críticas de acessibilidade detectadas`,
                    sites: [siteId],
                    violations: siteViolations,
                    detectedAt: new Date(),
                    responseTime: 0,
                    status: 'detected',
                    assignedTo: 'system',
                    slaDeadline: new Date(Date.now() + (incidentType === 'P0' ? 2 : 8) * 60 * 60 * 1000),
                    communications: []
                });
            }
        }
    }
    async generatePortfolioReport(auditResults) {
        const totalSites = auditResults.length;
        const averageScore = auditResults.reduce((sum, result) => sum + result.wcagScore, 0) / totalSites;
        const totalViolations = auditResults.reduce((sum, result) => sum + result.violations.length, 0);
        const criticalViolations = auditResults.reduce((sum, result) => sum + result.violations.filter(v => v.severity === 'critical').length, 0);
        const report = {
            timestamp: new Date(),
            totalSites,
            averageScore: Math.round(averageScore),
            totalViolations,
            criticalViolations,
            complianceTrend: this.calculateComplianceTrend(auditResults),
            recommendations: this.generateRecommendations(auditResults)
        };
        logger_1.logger.info('Relatório do portfolio gerado', report);
    }
    calculateComplianceTrend(auditResults) {
        const currentAverage = auditResults.reduce((sum, result) => sum + result.wcagScore, 0) / auditResults.length;
        const previousAverage = 82;
        return currentAverage - previousAverage;
    }
    generateRecommendations(auditResults) {
        const recommendations = [];
        const violationCounts = {};
        auditResults.forEach(result => {
            result.violations.forEach(violation => {
                const criteriaId = violation.criteria.id;
                violationCounts[criteriaId] = (violationCounts[criteriaId] || 0) + 1;
            });
        });
        const topViolations = Object.entries(violationCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);
        if (topViolations.length > 0) {
            recommendations.push(`Focar em melhorias nos critérios: ${topViolations.map(([criteria]) => criteria).join(', ')}`);
        }
        const lowScoreSites = auditResults.filter(result => result.wcagScore < 80);
        if (lowScoreSites.length > 0) {
            recommendations.push(`${lowScoreSites.length} sites necessitam de atenção prioritária (score < 80)`);
        }
        const criticalViolations = auditResults.reduce((sum, result) => sum + result.violations.filter(v => v.severity === 'critical').length, 0);
        if (criticalViolations > 0) {
            recommendations.push(`${criticalViolations} violações críticas requerem correção imediata`);
        }
        return recommendations;
    }
    getPortfolioStats() {
        const totalSites = this.sites.length;
        const averageScore = this.sites.reduce((sum, site) => sum + site.wcagScore, 0) / totalSites;
        const totalViolations = this.sites.reduce((sum, site) => sum + site.violations.length, 0);
        const criticalViolations = this.sites.reduce((sum, site) => sum + site.violations.filter(v => v.severity === 'critical').length, 0);
        return {
            totalSites,
            averageScore: Math.round(averageScore),
            totalViolations,
            criticalViolations,
            compliancePercentage: Math.round(averageScore)
        };
    }
    getSites() {
        return this.sites;
    }
    addSite(site) {
        const newSite = {
            ...site,
            id: `site_${Date.now()}`,
            lastAudit: new Date(),
            wcagScore: 0,
            violations: []
        };
        this.sites.push(newSite);
        logger_1.logger.info('Site adicionado ao portfolio', { name: site.name, url: site.url });
    }
    async cleanup() {
        this.stopMonitoring();
        await this.validator.close();
        logger_1.logger.info('PortfolioMonitor cleanup concluído');
    }
}
exports.PortfolioMonitor = PortfolioMonitor;
//# sourceMappingURL=portfolio-monitor.js.map