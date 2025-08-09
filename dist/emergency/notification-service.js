"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("../utils/logger");
class NotificationService {
    transporter;
    isTestMode;
    shouldSendEmails;
    constructor() {
        this.isTestMode = process.env.NODE_ENV === 'test' || process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
        this.shouldSendEmails = process.env.SEND_EMAILS === 'true' || false;
        if (this.isTestMode || !this.shouldSendEmails) {
            this.transporter = {
                sendMail: async () => {
                    logger_1.logger.info('SIMULAÇÃO: Email simulado enviado (SEND_EMAILS=false ou modo de teste)');
                    return Promise.resolve();
                }
            };
        }
        else {
            this.transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: false,
                auth: {
                    user: process.env.SMTP_USER || 'accessibility@untile.pt',
                    pass: process.env.SMTP_PASS || 'password'
                }
            });
        }
    }
    async sendEmergencyAlert(options) {
        const subject = `[${options.severity}] Alerta de Emergência - ${options.title}`;
        const html = this.generateEmergencyTemplate(options);
        try {
            if (this.isTestMode || !this.shouldSendEmails) {
                logger_1.logger.info('SIMULAÇÃO: Alerta de emergência simulado (SEND_EMAILS=false ou modo de teste)', {
                    severity: options.severity,
                    title: options.title,
                    url: options.url,
                    violations: options.violations?.length || 0
                });
                return;
            }
            await this.sendEmail({
                to: process.env.EMERGENCY_EMAIL || 'your_emergency_email@example.com',
                subject,
                html
            });
            logger_1.logger.info(`Alerta de emergência ${options.severity} enviado`, {
                title: options.title,
                severity: options.severity
            });
        }
        catch (error) {
            logger_1.logger.error('Erro ao enviar alerta de emergência:', error);
            if (!this.isTestMode && this.shouldSendEmails) {
                throw error;
            }
        }
    }
    async sendMaintenanceAlert(options) {
        const subject = `[MANUTENÇÃO] ${options.title}`;
        const html = this.generateMaintenanceTemplate(options);
        try {
            if (this.isTestMode || !this.shouldSendEmails) {
                logger_1.logger.info('SIMULAÇÃO: Alerta de manutenção simulado (SEND_EMAILS=false ou modo de teste)', {
                    title: options.title,
                    action: options.action,
                    url: options.url
                });
                return;
            }
            await this.sendEmail({
                to: process.env.MAINTENANCE_EMAIL || process.env.EMERGENCY_EMAIL || 'your_maintenance_email@example.com',
                subject,
                html
            });
            logger_1.logger.info('Alerta de manutenção enviado', {
                title: options.title,
                action: options.action
            });
        }
        catch (error) {
            logger_1.logger.error('Erro ao enviar alerta de manutenção:', error);
            if (!this.isTestMode && this.shouldSendEmails) {
                throw error;
            }
        }
    }
    async sendAuthorityNotification(incident) {
        const subject = `[URGENTE] Violação Acessibilidade Digital - ${incident.title}`;
        const html = this.generateAuthorityTemplate(incident);
        try {
            if (this.isTestMode || !this.shouldSendEmails) {
                logger_1.logger.info('SIMULAÇÃO: Notificação para autoridade simulada (SEND_EMAILS=false ou modo de teste)', {
                    incidentId: incident.id,
                    title: incident.title,
                    type: incident.type
                });
                return;
            }
            await this.sendEmail({
                to: process.env.AUTHORITY_EMAIL || 'your_authority_email@example.com',
                subject,
                html
            });
            logger_1.logger.info('Notificação para autoridade enviada', {
                incidentId: incident.id,
                title: incident.title
            });
        }
        catch (error) {
            logger_1.logger.error('Erro ao enviar notificação para autoridade:', error);
            if (!this.isTestMode && this.shouldSendEmails) {
                throw error;
            }
        }
    }
    async sendEmail(options) {
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER || 'your_smtp_from@example.com',
            to: options.to,
            subject: options.subject,
            html: options.html
        };
        await this.transporter.sendMail(mailOptions);
    }
    generateEmergencyTemplate(options) {
        const severityColor = {
            P0: '#ff0000',
            P1: '#ff6600',
            P2: '#ffcc00'
        };
        const severityText = {
            P0: 'CRÍTICO',
            P1: 'ALTO',
            P2: 'MÉDIO'
        };
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Alerta de Emergência</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { background-color: ${severityColor[options.severity]}; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .severity { background-color: ${severityColor[options.severity]}; color: white; padding: 10px; display: inline-block; }
            .footer { background-color: #f5f5f5; padding: 20px; margin-top: 20px; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚨 ALERTA DE EMERGÊNCIA</h1>
            <div class="severity">${severityText[options.severity]}</div>
        </div>
        
        <div class="content">
            <h2>${options.title}</h2>
            <p><strong>Descrição:</strong> ${options.description}</p>
            
            ${options.url ? `<p><strong>URL:</strong> <a href="${options.url}">${options.url}</a></p>` : ''}
            
            ${options.violations && options.violations.length > 0 ? `
            <h3>Violations Detected:</h3>
            <ul>
                ${options.violations.map(v => `<li>${v}</li>`).join('')}
            </ul>
            ` : ''}
            
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString('pt-PT')}</p>
        </div>
        
        <div class="footer">
            <p><strong>UNTILE Accessibility Monitoring System</strong></p>
            <p>Email: ${process.env.SMTP_USER || 'your_smtp_user@example.com'} | Telefone: ${process.env.EMERGENCY_PHONE || '+351-XXX-XXX-XXX'}</p>
            <p>Este é um alerta automático. Não responda a este email.</p>
        </div>
    </body>
    </html>
    `.trim();
    }
    generateMaintenanceTemplate(options) {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Alerta de Manutenção</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .action { background-color: #e6f3ff; padding: 15px; border-left: 4px solid #0066cc; }
            .footer { background-color: #f5f5f5; padding: 20px; margin-top: 20px; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔧 ALERTA DE MANUTENÇÃO</h1>
        </div>
        
        <div class="content">
            <h2>${options.title}</h2>
            <p><strong>Descrição:</strong> ${options.description}</p>
            
            ${options.url ? `<p><strong>URL:</strong> <a href="${options.url}">${options.url}</a></p>` : ''}
            
            <div class="action">
                <h3>Ação Necessária:</h3>
                <p>${options.action}</p>
            </div>
            
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString('pt-PT')}</p>
        </div>
        
        <div class="footer">
            <p><strong>UNTILE Accessibility Monitoring System</strong></p>
            <p>Email: ${process.env.SMTP_USER || 'your_smtp_user@example.com'}</p>
            <p>Este é um alerta automático. Não responda a este email.</p>
        </div>
    </body>
    </html>
    `.trim();
    }
    generateAuthorityTemplate(incident) {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Notificação para Autoridade</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { background-color: #cc0000; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .incident { background-color: #fff5f5; padding: 15px; border-left: 4px solid #cc0000; }
            .footer { background-color: #f5f5f5; padding: 20px; margin-top: 20px; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚨 NOTIFICAÇÃO PARA AUTORIDADE</h1>
        </div>
        
        <div class="content">
            <h2>Violation de Acessibilidade Digital</h2>
            
            <div class="incident">
                <h3>Detalhes do Incidente:</h3>
                <p><strong>ID:</strong> ${incident.id}</p>
                <p><strong>Título:</strong> ${incident.title}</p>
                <p><strong>Descrição:</strong> ${incident.description}</p>
                <p><strong>Severidade:</strong> ${incident.severity}</p>
                <p><strong>URL:</strong> ${incident.url || 'N/A'}</p>
                <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-PT')}</p>
            </div>
            
            <h3>Medidas Tomadas:</h3>
            <ul>
                <li>Notificação imediata da equipa técnica</li>
                <li>Início do processo de correção</li>
                <li>Monitorização contínua da situação</li>
            </ul>
            
            <h3>Próximos Passos:</h3>
            <ul>
                <li>Correção das violações identificadas</li>
                <li>Validação da conformidade</li>
                <li>Relatório de resolução</li>
            </ul>
        </div>
        
        <div class="footer">
            <h3>CONTACTO TÉCNICO</h3>
            
            Responsável técnico: [Nome]
            Email: ${process.env.SMTP_USER || 'your_smtp_user@example.com'}
            Telefone: ${process.env.EMERGENCY_PHONE || '+351-XXX-XXX-XXX'}
            Disponibilidade: 24/7 para questões de acessibilidade
            
            Permanecemos à disposição para esclarecimentos adicionais.
            
            Cumprimentos,
            [Nome] - [Título]
            UNTILE | ${process.env.SMTP_USER || 'your_smtp_user@example.com'}
        </div>
    </body>
    </html>
    `.trim();
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification-service.js.map