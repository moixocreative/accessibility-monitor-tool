import { CronJob } from 'cron';
import { PortfolioSite, AuditResult, AccessibilityViolation } from '../types';
import { WCAGValidator } from '../validation/wcag-validator';
import { logger, logAudit } from '../utils/logger';
import { EmergencyResponse } from '../emergency/emergency-response';

export class PortfolioMonitor {
  private validator: WCAGValidator;
  private emergencyResponse: EmergencyResponse;
  private monitoringJob: CronJob | null = null;
  private sites: PortfolioSite[] = [];

  constructor() {
    this.validator = new WCAGValidator();
    this.emergencyResponse = new EmergencyResponse();
    this.loadPortfolioSites();
  }

  /**
   * Carregar sites do portfolio (simulado - em produção viria de base de dados)
   */
  private loadPortfolioSites(): void {
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

    logger.info(`Portfolio carregado com ${this.sites.length} sites`);
  }

  /**
   * Iniciar monitorização contínua
   */
  startMonitoring(): void {
    const interval = this.getMonitoringInterval();
    
    this.monitoringJob = new CronJob(
      interval,
      async () => {
        try {
          logger.info('Executando auditoria periódica agendada');
          await this.runPortfolioAudit();
          logger.info('Auditoria periódica concluída com sucesso');
        } catch (error) {
          logger.error('Erro na auditoria periódica:', error);
        }
      },
      null, // onComplete
      false, // start
      'Europe/Lisbon' // timezone
    );

    this.monitoringJob.start();
    logger.info('Monitorização do portfolio iniciada', { 
      interval,
      nextRun: this.monitoringJob.nextDate().toISO()
    });
  }

    /**
   * Obter intervalo de monitorização configurável
   */
  private getMonitoringInterval(): string {
    const config = process.env.MONITORING_INTERVAL || '0 0 * * 1';
    
    // Validar expressão cron básica
    const cronPattern = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;
    
    if (!cronPattern.test(config)) {
      logger.warn('Expressão cron inválida, usando padrão', { 
        provided: config, 
        default: '0 0 * * 1'
      });
      return '0 0 * * 1'; // Semanalmente às 0h de segunda-feira
    }
    
    return config;
  }

  /**
   * Parar monitorização
   */
  stopMonitoring(): void {
    if (this.monitoringJob) {
      this.monitoringJob.stop();
      this.monitoringJob = null;
      logger.info('Monitorização do portfolio parada');
    }
  }

  /**
   * Verificar se monitorização está ativa
   */
  isMonitoringActive(): boolean {
    return this.monitoringJob ? true : false;
  }

  /**
   * Obter próxima execução agendada
   */
  getNextScheduledRun(): Date | null {
    const nextDate = this.monitoringJob?.nextDate();
    return nextDate ? nextDate.toJSDate() : null;
  }

  /**
   * Obter estatísticas da monitorização
   */
  getMonitoringStats(): {
    isActive: boolean;
    nextRun: Date | null;
    interval: string;
    lastRun?: Date;
  } {
    const lastRun = this.monitoringJob?.lastDate();
    return {
      isActive: this.isMonitoringActive(),
      nextRun: this.getNextScheduledRun(),
      interval: this.getMonitoringInterval(),
      ...(lastRun && { lastRun })
    };
  }

  /**
   * Executar auditoria completa do portfolio
   */
  async runPortfolioAudit(): Promise<void> {
    logger.info('Iniciando auditoria completa do portfolio');

    const auditResults: AuditResult[] = [];
    const criticalViolations: AccessibilityViolation[] = [];

    for (const site of this.sites) {
      try {
        logAudit(`Auditoria iniciada para ${site.name}`, { url: site.url });
        
        // Usar análise completa para monitorização periódica
        const auditResult = await this.validator.auditSite(site.url, site.id, true);
        auditResults.push(auditResult);

        // Atualizar dados do site
        site.lastAudit = auditResult.timestamp;
        site.wcagScore = auditResult.wcagScore;
        site.violations = auditResult.violations;

        // Verificar violações críticas
        const criticalViolationsForSite = auditResult.violations.filter(
          v => v.severity === 'critical' || v.criteria.priority === 'P0'
        );

        if (criticalViolationsForSite.length > 0) {
          criticalViolations.push(...criticalViolationsForSite);
          logger.warn(`Violações críticas detectadas em ${site.name}`, {
            count: criticalViolationsForSite.length,
            violations: criticalViolationsForSite.map(v => ({
              criteria: v.criteria.id,
              severity: v.severity,
              element: v.element
            }))
          });
        }

        logAudit(`Auditoria concluída para ${site.name}`, {
          score: auditResult.wcagScore,
          violations: auditResult.violations.length,
          criticalViolations: criticalViolationsForSite.length
        });

      } catch (error) {
        logger.error(`Erro na auditoria de ${site.name}:`, error);
        
        // Criar incidente de emergência para falha de auditoria
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
          slaDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 horas
          communications: []
        });
      }
    }

    // Processar violações críticas
    if (criticalViolations.length > 0) {
      await this.processCriticalViolations(criticalViolations);
    }

    // Gerar relatório
    await this.generatePortfolioReport(auditResults);

    logger.info('Auditoria do portfolio concluída', {
      sitesAudited: auditResults.length,
      criticalViolations: criticalViolations.length
    });
  }

  /**
   * Processar violações críticas
   */
  private async processCriticalViolations(violations: AccessibilityViolation[]): Promise<void> {
    logger.warn(`Processando ${violations.length} violações críticas`);

    // Agrupar violações por site
    const violationsBySite = violations.reduce((acc, violation) => {
      const siteId = violation.page.split('/')[2] || 'unknown';
      if (!acc[siteId]) {
        acc[siteId] = [];
      }
      acc[siteId].push(violation);
      return acc;
    }, {} as Record<string, AccessibilityViolation[]>);

    // Criar incidentes de emergência para cada site com violações críticas
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

  /**
   * Gerar relatório do portfolio
   */
  private async generatePortfolioReport(auditResults: AuditResult[]): Promise<void> {
    const totalSites = auditResults.length;
    const averageScore = auditResults.reduce((sum, result) => sum + result.wcagScore, 0) / totalSites;
    const totalViolations = auditResults.reduce((sum, result) => sum + result.violations.length, 0);
    const criticalViolations = auditResults.reduce((sum, result) => 
      sum + result.violations.filter(v => v.severity === 'critical').length, 0
    );

    const report = {
      timestamp: new Date(),
      totalSites,
      averageScore: Math.round(averageScore),
      totalViolations,
      criticalViolations,
      complianceTrend: this.calculateComplianceTrend(auditResults),
      recommendations: this.generateRecommendations(auditResults)
    };

    logger.info('Relatório do portfolio gerado', report);
    
    // Em produção, salvar relatório em base de dados ou enviar por email
    // await this.saveReport(report);
  }

  /**
   * Calcular tendência de conformidade
   */
  private calculateComplianceTrend(auditResults: AuditResult[]): number {
    // Simulação - em produção compararia com dados históricos
    const currentAverage = auditResults.reduce((sum, result) => sum + result.wcagScore, 0) / auditResults.length;
    const previousAverage = 82; // Simulado
    return currentAverage - previousAverage;
  }

  /**
   * Gerar recomendações baseadas nos resultados
   */
  private generateRecommendations(auditResults: AuditResult[]): string[] {
    const recommendations: string[] = [];

    // Analisar padrões de violações
    const violationCounts: Record<string, number> = {};
    auditResults.forEach(result => {
      result.violations.forEach(violation => {
        const criteriaId = violation.criteria.id;
        violationCounts[criteriaId] = (violationCounts[criteriaId] || 0) + 1;
      });
    });

    // Identificar critérios mais problemáticos
    const topViolations = Object.entries(violationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (topViolations.length > 0) {
      recommendations.push(
        `Focar em melhorias nos critérios: ${topViolations.map(([criteria]) => criteria).join(', ')}`
      );
    }

    // Verificar sites com baixo score
    const lowScoreSites = auditResults.filter(result => result.wcagScore < 80);
    if (lowScoreSites.length > 0) {
      recommendations.push(
        `${lowScoreSites.length} sites necessitam de atenção prioritária (score < 80)`
      );
    }

    // Verificar violações críticas
    const criticalViolations = auditResults.reduce((sum, result) => 
      sum + result.violations.filter(v => v.severity === 'critical').length, 0
    );
    
    if (criticalViolations > 0) {
      recommendations.push(
        `${criticalViolations} violações críticas requerem correção imediata`
      );
    }

    return recommendations;
  }

  /**
   * Obter estatísticas do portfolio
   */
  getPortfolioStats(): {
    totalSites: number;
    averageScore: number;
    totalViolations: number;
    criticalViolations: number;
    compliancePercentage: number;
  } {
    const totalSites = this.sites.length;
    const averageScore = this.sites.reduce((sum, site) => sum + site.wcagScore, 0) / totalSites;
    const totalViolations = this.sites.reduce((sum, site) => sum + site.violations.length, 0);
    const criticalViolations = this.sites.reduce((sum, site) => 
      sum + site.violations.filter(v => v.severity === 'critical').length, 0
    );

    return {
      totalSites,
      averageScore: Math.round(averageScore),
      totalViolations,
      criticalViolations,
      compliancePercentage: Math.round(averageScore)
    };
  }

  /**
   * Obter sites do portfolio
   */
  getSites(): PortfolioSite[] {
    return this.sites;
  }

  /**
   * Adicionar site ao portfolio
   */
  addSite(site: Omit<PortfolioSite, 'id' | 'lastAudit' | 'wcagScore' | 'violations'>): void {
    const newSite: PortfolioSite = {
      ...site,
      id: `site_${Date.now()}`,
      lastAudit: new Date(),
      wcagScore: 0,
      violations: []
    };

    this.sites.push(newSite);
    logger.info('Site adicionado ao portfolio', { name: site.name, url: site.url });
  }

  /**
   * Limpar recursos
   */
  async cleanup(): Promise<void> {
    this.stopMonitoring();
    await this.validator.close();
    logger.info('PortfolioMonitor cleanup concluído');
  }
} 