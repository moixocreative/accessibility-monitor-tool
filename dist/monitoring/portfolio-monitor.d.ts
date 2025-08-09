import { PortfolioSite } from '../types';
export declare class PortfolioMonitor {
    private validator;
    private emergencyResponse;
    private monitoringJob;
    private sites;
    constructor();
    private loadPortfolioSites;
    startMonitoring(): void;
    private getMonitoringInterval;
    stopMonitoring(): void;
    isMonitoringActive(): boolean;
    getNextScheduledRun(): Date | null;
    getMonitoringStats(): {
        isActive: boolean;
        nextRun: Date | null;
        interval: string;
        lastRun?: Date;
    };
    runPortfolioAudit(): Promise<void>;
    private processCriticalViolations;
    private generatePortfolioReport;
    private calculateComplianceTrend;
    private generateRecommendations;
    getPortfolioStats(): {
        totalSites: number;
        averageScore: number;
        totalViolations: number;
        criticalViolations: number;
        compliancePercentage: number;
    };
    getSites(): PortfolioSite[];
    addSite(site: Omit<PortfolioSite, 'id' | 'lastAudit' | 'wcagScore' | 'violations'>): void;
    cleanup(): Promise<void>;
}
//# sourceMappingURL=portfolio-monitor.d.ts.map