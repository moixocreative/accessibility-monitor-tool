import { AuditResult } from '../types';
export declare class WCAGValidator {
    private browser;
    private useRealBrowser;
    private usePlaywright;
    private checklist;
    private reportGenerator;
    constructor();
    private initBrowser;
    auditSite(url: string, siteId: string, isCompleteAudit?: boolean, useStandardFormula?: boolean, criteriaSet?: 'untile' | 'gov-pt' | 'custom', customCriteria?: string[]): Promise<AuditResult>;
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
    private detectAccessMonitorViolations;
    private detectSkipLinks;
    private detectHeadingSequenceIssues;
    private detectBrSequenceIssues;
    private detectMultipleH1Issues;
    private detectContrastIssues;
    private detectDuplicateIds;
    private detectInteractiveElementIssues;
    private detectLandmarkIssues;
    private mapAxeRuleToWCAG;
    private mapSeverity;
    private calculateWCAGScoreFromAxe;
    private calculateWCAGScore;
    private calculateLegalRiskMetrics;
    private generateSummary;
    private getPage;
    close(): Promise<void>;
}
//# sourceMappingURL=wcag-validator.d.ts.map