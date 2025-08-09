interface EmergencyAlertOptions {
    title: string;
    description: string;
    severity: 'P0' | 'P1' | 'P2';
    url?: string;
    violations?: string[];
}
interface MaintenanceAlertOptions {
    title: string;
    description: string;
    action: string;
    url?: string;
}
export declare class NotificationService {
    private transporter;
    private isTestMode;
    private shouldSendEmails;
    constructor();
    sendEmergencyAlert(options: EmergencyAlertOptions): Promise<void>;
    sendMaintenanceAlert(options: MaintenanceAlertOptions): Promise<void>;
    sendAuthorityNotification(incident: any): Promise<void>;
    private sendEmail;
    private generateEmergencyTemplate;
    private generateMaintenanceTemplate;
    private generateAuthorityTemplate;
}
export {};
//# sourceMappingURL=notification-service.d.ts.map