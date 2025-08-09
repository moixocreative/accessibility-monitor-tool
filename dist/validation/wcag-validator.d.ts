import { AuditResult } from '../types';
export declare class WCAGValidator {
    private browser;
    private useRealBrowser;
    private usePlaywright;
    constructor();
    private initBrowser;
    auditSite(url: string, siteId: string, isCompleteAudit?: boolean): Promise<AuditResult>;
    private runLighthouse;
    private runAxeCore;
    private runAxeCoreComplete;
    private runAxeCoreOptimized;
    private runAxeCoreWithPlaywright;
    private runAxeCoreCompleteWithPlaywright;
    private runAxeCoreWithPuppeteer;
    private runAxeCoreCompleteWithPuppeteer;
    private analyzeViolations;
    private detectCustomViolationsInPage;
    private mapAxeRuleToWCAG;
    private mapSeverity;
    private calculateWCAGScoreFromAxe;
    private calculateWCAGScore;
    private calculateLegalRiskMetrics;
    private generateSummary;
    close(): Promise<void>;
}
//# sourceMappingURL=wcag-validator.d.ts.map