// Tipos principais do sistema de monitorização de acessibilidade UNTILE

export interface WCAGCriteria {
  id: string;
  name: string;
  level: 'A' | 'AA' | 'AAA';
  principle: 'PERCEIVABLE' | 'OPERABLE' | 'UNDERSTANDABLE' | 'ROBUST';
  priority: 'P0' | 'P1' | 'P2';
  description: string;
  technology: {
    webflow: string;
    laravel: string;
    wordpress: string;
  };
}

export interface AccessibilityViolation {
  id: string;
  criteria: WCAGCriteria;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  element: string;
  page: string;
  timestamp: Date;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
}

export interface PortfolioSite {
  id: string;
  name: string;
  url: string;
  technology: 'webflow' | 'laravel' | 'wordpress';
  client: string;
  lastAudit: Date;
  wcagScore: number;
  violations: AccessibilityViolation[];
  status: 'active' | 'maintenance' | 'archived';
}

export interface AuditResult {
  id: string;
  siteId: string;
  timestamp: Date;
  wcagScore: number;
  violations: AccessibilityViolation[];
  lighthouseScore: {
    accessibility: number;
    performance: number;
    seo: number;
    bestPractices: number;
  };
  axeResults: {
    violations: any[];
    passes: any[];
    incomplete: any[];
    inapplicable: any[];
  };
  summary: {
    totalViolations: number;
    criticalViolations: number;
    priorityViolations: number;
    compliancePercentage: number;
  };
  // MÉTRICAS DE RISCO LEGAL (ALINHADAS COM PORTFOLIO UNTILE)
  legalRiskMetrics?: {
    legalRiskScore: number;
    exposureScore: number;
    riskLevel: 'BAIXO' | 'MÉDIO' | 'ALTO';
    criticalViolations: number;
    seriousViolations: number;
    priorityViolations: number;
  };
}

export interface EmergencyIncident {
  id: string;
  type: 'P0' | 'P1' | 'P2';
  title: string;
  description: string;
  sites: string[];
  violations: AccessibilityViolation[];
  detectedAt: Date;
  responseTime: number;
  status: 'detected' | 'responding' | 'resolving' | 'resolved' | 'closed';
  assignedTo: string;
  slaDeadline: Date;
  communications: EmergencyCommunication[];
}

export interface EmergencyCommunication {
  id: string;
  type: 'authority' | 'client' | 'internal';
  recipient: string;
  subject: string;
  content: string;
  sentAt: Date;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
}

export interface MonitoringConfig {
  interval: number; // milliseconds
  alertThreshold: number;
  emergencyContacts: {
    email: string;
    phone: string;
    slack: string;
  };
  authorityContacts: {
    email: string;
    phone: string;
  };
  wcagLevel: 'A' | 'AA' | 'AAA';
  priorityCriteria: string[];
}

export interface ReportData {
  period: {
    start: Date;
    end: Date;
  };
  portfolio: {
    totalSites: number;
    auditedSites: number;
    averageScore: number;
    complianceTrend: number;
  };
  violations: {
    total: number;
    critical: number;
    priority: number;
    byCriteria: Record<string, number>;
  };
  emergencies: {
    total: number;
    p0: number;
    p1: number;
    p2: number;
    averageResponseTime: number;
  };
  recommendations: string[];
}

// Removed unused enums to fix linting errors 