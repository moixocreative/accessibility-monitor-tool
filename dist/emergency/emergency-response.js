"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmergencyResponse = void 0;
const logger_1 = require("../utils/logger");
const notification_service_1 = require("./notification-service");
class EmergencyResponse {
    incidents = [];
    notificationService;
    constructor() {
        this.notificationService = new notification_service_1.NotificationService();
    }
    async createIncident(incidentData) {
        const incident = {
            ...incidentData,
            id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        this.incidents.push(incident);
        (0, logger_1.logEmergency)('warn', `Incidente ${incident.type} criado`, {
            id: incident.id,
            title: incident.title,
            sites: incident.sites,
            violations: incident.violations.length
        });
        await this.processIncident(incident);
        return incident;
    }
    async processIncident(incident) {
        const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
        switch (incident.type) {
            case 'P0':
                await this.handleP0Incident(incident, isCI);
                break;
            case 'P1':
                await this.handleP1Incident(incident, isCI);
                break;
            case 'P2':
                await this.handleP2Incident(incident, isCI);
                break;
        }
    }
    async handleP0Incident(incident, isCI = false) {
        (0, logger_1.logEmergency)('error', 'INCIDENTE P0 CRÍTICO DETETADO', {
            id: incident.id,
            title: incident.title,
            slaDeadline: incident.slaDeadline
        });
        if (!isCI) {
            try {
                await this.notificationService.sendEmergencyAlert({
                    title: incident.title,
                    description: incident.description,
                    severity: 'P0',
                    ...(incident.sites?.[0] && { url: incident.sites[0] }),
                    ...(incident.violations && { violations: incident.violations.map(v => v.description || v.criteria?.name || 'Violação') })
                });
            }
            catch (error) {
                logger_1.logger.error('Erro ao enviar alerta de emergência:', error);
            }
            if (this.shouldNotifyAuthority(incident)) {
                await this.notifyAuthority(incident);
            }
        }
        else {
            logger_1.logger.info('Modo CI/CD: Simulando notificações de emergência P0');
        }
        incident.assignedTo = 'emergency-team-p0';
        incident.status = 'responding';
        (0, logger_1.logSLA)(incident);
    }
    async handleP1Incident(incident, isCI = false) {
        (0, logger_1.logEmergency)('warn', 'INCIDENTE P1 ALTO DETETADO', {
            id: incident.id,
            title: incident.title,
            slaDeadline: incident.slaDeadline
        });
        if (!isCI) {
            try {
                await this.notificationService.sendEmergencyAlert({
                    title: incident.title,
                    description: incident.description,
                    severity: 'P1',
                    ...(incident.sites?.[0] && { url: incident.sites[0] }),
                    ...(incident.violations && { violations: incident.violations.map(v => v.description || v.criteria?.name || 'Violação') })
                });
            }
            catch (error) {
                logger_1.logger.error('Erro ao enviar alerta de emergência:', error);
            }
        }
        else {
            logger_1.logger.info('Modo CI/CD: Simulando notificações de emergência P1');
        }
        incident.assignedTo = 'emergency-team-p1';
        incident.status = 'responding';
        (0, logger_1.logSLA)(incident);
    }
    async handleP2Incident(incident, isCI = false) {
        (0, logger_1.logEmergency)('warn', 'INCIDENTE P2 MÉDIO DETETADO', {
            id: incident.id,
            title: incident.title,
            slaDeadline: incident.slaDeadline
        });
        if (!isCI) {
            try {
                await this.notificationService.sendMaintenanceAlert({
                    title: incident.title,
                    description: incident.description,
                    action: 'Corrigir violações de acessibilidade identificadas',
                    ...(incident.sites?.[0] && { url: incident.sites[0] })
                });
            }
            catch (error) {
                logger_1.logger.error('Erro ao enviar alerta de manutenção:', error);
            }
        }
        else {
            logger_1.logger.info('Modo CI/CD: Simulando notificações de manutenção P2');
        }
        incident.assignedTo = 'maintenance-team';
        incident.status = 'responding';
        (0, logger_1.logSLA)(incident);
    }
    shouldNotifyAuthority(incident) {
        if (incident.type === 'P0') {
            return true;
        }
        const criticalViolations = incident.violations.filter(v => v.criteria.priority === 'P0' || v.severity === 'critical');
        return criticalViolations.length > 0;
    }
    async notifyAuthority(incident) {
        const communication = {
            id: `comm_${Date.now()}`,
            type: 'authority',
            recipient: process.env.AUTHORITY_EMAIL || process.env.EMERGENCY_EMAIL || 'admin@company.com',
            subject: `[URGENTE] Violação Acessibilidade Digital - ${incident.title}`,
            content: this.generateAuthorityTemplate(incident),
            sentAt: new Date(),
            status: 'pending'
        };
        incident.communications.push(communication);
        try {
            await this.notificationService.sendAuthorityNotification(communication);
            communication.status = 'sent';
            logger_1.logger.info('Notificação enviada para autoridade', {
                incidentId: incident.id,
                communicationId: communication.id
            });
        }
        catch (error) {
            communication.status = 'failed';
            logger_1.logger.error('Erro ao enviar notificação para autoridade:', error);
        }
    }
    generateAuthorityTemplate(incident) {
        const violationsSummary = incident.violations
            .map(v => `- ${v.criteria.name} (${v.criteria.id}): ${v.description}`)
            .join('\n');
        return `
Exmo(a) Senhor(a) [Representante da Autoridade],

REF: ${incident.id}
ASSUNTO: Resposta Oficial - Conformidade Acessibilidade Digital

Em resposta ao vosso contacto sobre acessibilidade digital, informamos:

## AÇÕES IMEDIATAS IMPLEMENTADAS

✅ Auditoria técnica completa: Executada em ${this.getResponseTime(incident)} minutos
✅ Violações identificadas: ${incident.violations.length} violações detetadas
✅ Correções implementadas: Em progresso
✅ Conformidade atual: WCAG 2.1 AA ${this.calculateCompliance(incident)}% compliant

## VIOLAÇÕES IDENTIFICADAS

${violationsSummary}

## MEDIDAS PREVENTIVAS

- Monitorização automática: Sistema 24/7 ativo
- Formação equipa: WCAG 2.1 AA certificação
- Procedimentos emergência: SLA ${incident.type === 'P0' ? '2h' : '8h'} estabelecido
- Revisões trimestrais: Manutenção de conformidade

## CONTACTO TÉCNICO

Responsável técnico: [Nome]
Email: ${process.env.SMTP_USER || 'contact@company.com'}
Telefone: ${process.env.EMERGENCY_PHONE || '+351-XXX-XXX-XXX'}
Disponibilidade: 24/7 para questões de acessibilidade

Permanecemos à disposição para esclarecimentos adicionais.

Cumprimentos,
[Nome] - [Título]
UNTILE | ${process.env.SMTP_USER || 'contact@company.com'}
    `.trim();
    }
    getResponseTime(incident) {
        const responseTime = Date.now() - incident.detectedAt.getTime();
        return Math.round(responseTime / (1000 * 60));
    }
    calculateCompliance(incident) {
        const totalViolations = incident.violations.length;
        const criticalViolations = incident.violations.filter(v => v.severity === 'critical' || v.criteria.priority === 'P0').length;
        const baseScore = 85;
        const violationPenalty = (criticalViolations * 10) + (totalViolations * 2);
        return Math.max(0, baseScore - violationPenalty);
    }
    async updateIncidentStatus(incidentId, status) {
        const incident = this.incidents.find(i => i.id === incidentId);
        if (incident) {
            incident.status = status;
            if (status === 'resolved') {
                incident.responseTime = Date.now() - incident.detectedAt.getTime();
            }
            logger_1.logger.info(`Status do incidente ${incidentId} atualizado para ${status}`);
        }
    }
    getActiveIncidents() {
        return this.incidents.filter(i => i.status === 'detected' || i.status === 'responding' || i.status === 'resolving');
    }
    getIncidentsByType(type) {
        return this.incidents.filter(i => i.type === type);
    }
    checkSLABreaches() {
        const now = new Date();
        return this.incidents.filter(incident => {
            if (incident.status === 'resolved' || incident.status === 'closed') {
                return false;
            }
            return now > incident.slaDeadline;
        });
    }
    generateEmergencyReport() {
        const totalIncidents = this.incidents.length;
        const p0Count = this.getIncidentsByType('P0').length;
        const p1Count = this.getIncidentsByType('P1').length;
        const p2Count = this.getIncidentsByType('P2').length;
        const slaBreaches = this.checkSLABreaches().length;
        const resolvedIncidents = this.incidents.filter(i => i.status === 'resolved');
        const averageResponseTime = resolvedIncidents.length > 0
            ? resolvedIncidents.reduce((sum, i) => sum + i.responseTime, 0) / resolvedIncidents.length
            : 0;
        return {
            totalIncidents,
            p0Count,
            p1Count,
            p2Count,
            slaBreaches,
            averageResponseTime
        };
    }
}
exports.EmergencyResponse = EmergencyResponse;
//# sourceMappingURL=emergency-response.js.map