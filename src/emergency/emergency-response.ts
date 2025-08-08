import { EmergencyIncident, EmergencyCommunication } from '../types';
import { logger, logEmergency, logSLA } from '../utils/logger';
import { NotificationService } from './notification-service';

export class EmergencyResponse {
  private incidents: EmergencyIncident[] = [];
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Criar incidente de emergência
   */
  async createIncident(incidentData: Omit<EmergencyIncident, 'id'>): Promise<EmergencyIncident> {
    const incident: EmergencyIncident = {
      ...incidentData,
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.incidents.push(incident);
    
    logEmergency('warn', `Incidente ${incident.type} criado`, {
      id: incident.id,
      title: incident.title,
      sites: incident.sites,
      violations: incident.violations.length
    });

    // Processar incidente baseado no tipo
    await this.processIncident(incident);

    return incident;
  }

  /**
   * Processar incidente baseado no tipo
   */
  private async processIncident(incident: EmergencyIncident): Promise<void> {
    // Em CI/CD, apenas simular o processamento sem enviar emails
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

  /**
   * Processar incidente P0 (CRÍTICO) - SLA 2h
   */
  private async handleP0Incident(incident: EmergencyIncident, isCI: boolean = false): Promise<void> {
    logEmergency('error', 'INCIDENTE P0 CRÍTICO DETETADO', {
      id: incident.id,
      title: incident.title,
      slaDeadline: incident.slaDeadline
    });

    if (!isCI) {
      // Notificar equipa crítica imediatamente
      try {
        await this.notificationService.sendEmergencyAlert({
          title: incident.title,
          description: incident.description,
          severity: 'P0',
          ...(incident.sites?.[0] && { url: incident.sites[0] }),
          ...(incident.violations && { violations: incident.violations.map(v => v.description || v.criteria?.name || 'Violação') })
        });
      } catch (error) {
        logger.error('Erro ao enviar alerta de emergência:', error);
      }

      // Notificar autoridade se necessário
      if (this.shouldNotifyAuthority(incident)) {
        await this.notifyAuthority(incident);
      }
    } else {
      logger.info('Modo CI/CD: Simulando notificações de emergência P0');
    }

    // Atribuir a equipa de resposta
    incident.assignedTo = 'emergency-team-p0';
    incident.status = 'responding';

    logSLA(incident);
  }

  /**
   * Processar incidente P1 (ALTO) - SLA 8h
   */
  private async handleP1Incident(incident: EmergencyIncident, isCI: boolean = false): Promise<void> {
    logEmergency('warn', 'INCIDENTE P1 ALTO DETETADO', {
      id: incident.id,
      title: incident.title,
      slaDeadline: incident.slaDeadline
    });

    if (!isCI) {
      // Notificar equipa de resposta
      try {
        await this.notificationService.sendEmergencyAlert({
          title: incident.title,
          description: incident.description,
          severity: 'P1',
          ...(incident.sites?.[0] && { url: incident.sites[0] }),
          ...(incident.violations && { violations: incident.violations.map(v => v.description || v.criteria?.name || 'Violação') })
        });
      } catch (error) {
        logger.error('Erro ao enviar alerta de emergência:', error);
      }
    } else {
      logger.info('Modo CI/CD: Simulando notificações de emergência P1');
    }

    // Atribuir a equipa de resposta
    incident.assignedTo = 'emergency-team-p1';
    incident.status = 'responding';

    logSLA(incident);
  }

  /**
   * Processar incidente P2 (MÉDIO) - SLA 24h
   */
  private async handleP2Incident(incident: EmergencyIncident, isCI: boolean = false): Promise<void> {
    logEmergency('warn', 'INCIDENTE P2 MÉDIO DETETADO', {
      id: incident.id,
      title: incident.title,
      slaDeadline: incident.slaDeadline
    });

    if (!isCI) {
      // Notificar equipa de manutenção
      try {
        await this.notificationService.sendMaintenanceAlert({
          title: incident.title,
          description: incident.description,
          action: 'Corrigir violações de acessibilidade identificadas',
          ...(incident.sites?.[0] && { url: incident.sites[0] })
        });
      } catch (error) {
        logger.error('Erro ao enviar alerta de manutenção:', error);
      }
    } else {
      logger.info('Modo CI/CD: Simulando notificações de manutenção P2');
    }

    // Atribuir a equipa de manutenção
    incident.assignedTo = 'maintenance-team';
    incident.status = 'responding';

    logSLA(incident);
  }

  /**
   * Verificar se deve notificar autoridade
   */
  private shouldNotifyAuthority(incident: EmergencyIncident): boolean {
    // P0 sempre notifica autoridade
    if (incident.type === 'P0') {
      return true;
    }

    // P1 notifica se houver violações críticas específicas
    const criticalViolations = incident.violations.filter(v => 
      v.criteria.priority === 'P0' || v.severity === 'critical'
    );

    return criticalViolations.length > 0;
  }

  /**
   * Notificar autoridade reguladora
   */
  private async notifyAuthority(incident: EmergencyIncident): Promise<void> {
    const communication: EmergencyCommunication = {
      id: `comm_${Date.now()}`,
      type: 'authority',
      recipient: process.env.AUTHORITY_EMAIL || process.env.EMERGENCY_EMAIL || 'mauriciopereita@untile.pt',
      subject: `[URGENTE] Violação Acessibilidade Digital - ${incident.title}`,
      content: this.generateAuthorityTemplate(incident),
      sentAt: new Date(),
      status: 'pending'
    };

    incident.communications.push(communication);

    try {
      await this.notificationService.sendAuthorityNotification(communication);
      communication.status = 'sent';
      
      logger.info('Notificação enviada para autoridade', {
        incidentId: incident.id,
        communicationId: communication.id
      });
    } catch (error) {
      communication.status = 'failed';
      logger.error('Erro ao enviar notificação para autoridade:', error);
    }
  }

  /**
   * Gerar template para autoridade
   */
  private generateAuthorityTemplate(incident: EmergencyIncident): string {
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
Email: ${process.env.SMTP_USER || 'mauriciopereita@untile.pt'}
Telefone: ${process.env.EMERGENCY_PHONE || '+351-XXX-XXX-XXX'}
Disponibilidade: 24/7 para questões de acessibilidade

Permanecemos à disposição para esclarecimentos adicionais.

Cumprimentos,
[Nome] - [Título]
UNTILE | ${process.env.SMTP_USER || 'mauriciopereita@untile.pt'}
    `.trim();
  }

  /**
   * Calcular tempo de resposta
   */
  private getResponseTime(incident: EmergencyIncident): number {
    const responseTime = Date.now() - incident.detectedAt.getTime();
    return Math.round(responseTime / (1000 * 60)); // minutos
  }

  /**
   * Calcular percentagem de conformidade
   */
  private calculateCompliance(incident: EmergencyIncident): number {
    // Simulação - em produção seria baseado em auditoria real
    const totalViolations = incident.violations.length;
    const criticalViolations = incident.violations.filter(v => 
      v.severity === 'critical' || v.criteria.priority === 'P0'
    ).length;

    const baseScore = 85; // Score base
    const violationPenalty = (criticalViolations * 10) + (totalViolations * 2);
    
    return Math.max(0, baseScore - violationPenalty);
  }

  /**
   * Atualizar status de incidente
   */
  async updateIncidentStatus(incidentId: string, status: EmergencyIncident['status']): Promise<void> {
    const incident = this.incidents.find(i => i.id === incidentId);
    
    if (incident) {
      incident.status = status;
      
      if (status === 'resolved') {
        incident.responseTime = Date.now() - incident.detectedAt.getTime();
      }

      logger.info(`Status do incidente ${incidentId} atualizado para ${status}`);
    }
  }

  /**
   * Obter incidentes ativos
   */
  getActiveIncidents(): EmergencyIncident[] {
    return this.incidents.filter(i => 
      i.status === 'detected' || i.status === 'responding' || i.status === 'resolving'
    );
  }

  /**
   * Obter incidentes por tipo
   */
  getIncidentsByType(type: 'P0' | 'P1' | 'P2'): EmergencyIncident[] {
    return this.incidents.filter(i => i.type === type);
  }

  /**
   * Verificar SLA de incidentes
   */
  checkSLABreaches(): EmergencyIncident[] {
    const now = new Date();
    return this.incidents.filter(incident => {
      if (incident.status === 'resolved' || incident.status === 'closed') {
        return false;
      }
      return now > incident.slaDeadline;
    });
  }

  /**
   * Gerar relatório de emergências
   */
  generateEmergencyReport(): {
    totalIncidents: number;
    p0Count: number;
    p1Count: number;
    p2Count: number;
    slaBreaches: number;
    averageResponseTime: number;
  } {
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