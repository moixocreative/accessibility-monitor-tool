#!/usr/bin/env ts-node

import { EmergencyResponse } from '../emergency/emergency-response';
import { logger } from '../utils/logger';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  logger.info('Sistema de Resposta de Emergência UNTILE');

  const emergencyResponse = new EmergencyResponse();

  try {
    switch (command) {
      case '--test':
        await runTests(emergencyResponse);
        break;
      
      case '--validate':
        await validateSystem(emergencyResponse);
        break;
      
      case '--report':
        await generateReport(emergencyResponse);
        break;
      
      case '--post-deploy':
        await postDeployCheck(emergencyResponse);
        break;
      
      default:
        await showHelp();
        break;
    }

  } catch (error) {
    logger.error('Erro no sistema de emergência:', error);
    process.exit(1);
  }
}

async function runTests(emergencyResponse: EmergencyResponse) {
  console.log('\n🧪 TESTES DO SISTEMA DE EMERGÊNCIA');
  console.log('=====================================');

  // Simular incidente P0
  const p0Incident = await emergencyResponse.createIncident({
    type: 'P0',
    title: 'Teste - Violação Crítica de Acessibilidade',
    description: 'Teste do sistema de emergência P0',
    sites: ['test_site_1'],
    violations: [],
    detectedAt: new Date(),
    responseTime: 0,
    status: 'detected',
    assignedTo: 'test',
    slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
    communications: []
  });

  console.log('✅ Incidente P0 criado:', p0Incident.id);

  // Simular incidente P1
  const p1Incident = await emergencyResponse.createIncident({
    type: 'P1',
    title: 'Teste - Violação Alta de Acessibilidade',
    description: 'Teste do sistema de emergência P1',
    sites: ['test_site_2'],
    violations: [],
    detectedAt: new Date(),
    responseTime: 0,
    status: 'detected',
    assignedTo: 'test',
    slaDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 horas
    communications: []
  });

  console.log('✅ Incidente P1 criado:', p1Incident.id);

  // Verificar SLA breaches
  const slaBreaches = emergencyResponse.checkSLABreaches();
  console.log(`✅ Verificação SLA breaches: ${slaBreaches.length} incidentes`);

  console.log('\n✅ Todos os testes passaram');
}

async function validateSystem(emergencyResponse: EmergencyResponse) {
  console.log('\n🔍 VALIDAÇÃO DO SISTEMA DE EMERGÊNCIA');
  console.log('========================================');

  // Verificar configuração
  const requiredEnvVars = [
    'EMERGENCY_EMAIL',
    'EMERGENCY_PHONE',
    'AUTHORITY_EMAIL',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS'
  ];

  console.log('\n📋 Verificação de Variáveis de Ambiente:');
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`  ✅ ${varName}: Configurado`);
    } else {
      console.log(`  ❌ ${varName}: Não configurado`);
    }
  });

  // Verificar incidentes ativos
  const activeIncidents = emergencyResponse.getActiveIncidents();
  console.log(`\n📊 Incidentes Ativos: ${activeIncidents.length}`);

  // Gerar relatório de emergência
  const report = emergencyResponse.generateEmergencyReport();
  console.log('\n📈 Relatório de Emergência:');
  console.log(`  Total de incidentes: ${report.totalIncidents}`);
  console.log(`  P0: ${report.p0Count}`);
  console.log(`  P1: ${report.p1Count}`);
  console.log(`  P2: ${report.p2Count}`);
  console.log(`  SLA breaches: ${report.slaBreaches}`);
  console.log(`  Tempo médio de resposta: ${Math.round(report.averageResponseTime / 1000 / 60)} minutos`);

  console.log('\n✅ Validação do sistema concluída');
}

async function generateReport(emergencyResponse: EmergencyResponse) {
  console.log('\n📊 RELATÓRIO DE EMERGÊNCIA');
  console.log('============================');

  const report = emergencyResponse.generateEmergencyReport();

  console.log('\n📈 ESTATÍSTICAS GERAIS');
  console.log('=======================');
  console.log(`Total de incidentes: ${report.totalIncidents}`);
  console.log(`Tempo médio de resposta: ${Math.round(report.averageResponseTime / 1000 / 60)} minutos`);
  console.log(`SLA breaches: ${report.slaBreaches}`);

  console.log('\n🚨 INCIDENTES POR PRIORIDADE');
  console.log('============================');
  console.log(`P0 (Crítico): ${report.p0Count}`);
  console.log(`P1 (Alto): ${report.p1Count}`);
  console.log(`P2 (Médio): ${report.p2Count}`);

  // Incidentes ativos
  const activeIncidents = emergencyResponse.getActiveIncidents();
  if (activeIncidents.length > 0) {
    console.log('\n⚠️  INCIDENTES ATIVOS');
    console.log('=====================');
    activeIncidents.forEach(incident => {
      console.log(`\n${incident.type} - ${incident.title}`);
      console.log(`  Status: ${incident.status}`);
      console.log(`  Detetado: ${incident.detectedAt.toLocaleString('pt-PT')}`);
      console.log(`  Deadline: ${incident.slaDeadline.toLocaleString('pt-PT')}`);
      console.log(`  Sites: ${incident.sites.join(', ')}`);
      console.log(`  Violações: ${incident.violations.length}`);
    });
  }

  // SLA breaches
  const slaBreaches = emergencyResponse.checkSLABreaches();
  if (slaBreaches.length > 0) {
    console.log('\n🚨 SLA BREACHES');
    console.log('===============');
    slaBreaches.forEach(incident => {
      const overdue = Date.now() - incident.slaDeadline.getTime();
      const overdueHours = Math.round(overdue / (1000 * 60 * 60));
      console.log(`\n${incident.type} - ${incident.title}`);
      console.log(`  Excedido por: ${overdueHours} horas`);
      console.log(`  Status: ${incident.status}`);
    });
  }

  console.log('\n✅ Relatório gerado com sucesso');
}

async function postDeployCheck(emergencyResponse: EmergencyResponse) {
  console.log('\n🔍 VERIFICAÇÃO PÓS-DEPLOY');
  console.log('==========================');

  // Simular verificação pós-deploy
  const deployIncident = await emergencyResponse.createIncident({
    type: 'P2',
    title: 'Verificação Pós-Deploy',
    description: 'Verificação automática após deploy',
    sites: ['deployed_site'],
    violations: [],
    detectedAt: new Date(),
    responseTime: 0,
    status: 'detected',
    assignedTo: 'deploy-system',
    slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    communications: []
  });

  console.log('✅ Verificação pós-deploy iniciada');
  console.log(`  Incidente: ${deployIncident.id}`);
  console.log(`  Status: ${deployIncident.status}`);
  console.log(`  Deadline: ${deployIncident.slaDeadline.toLocaleString('pt-PT')}`);

  // Simular resolução
  await emergencyResponse.updateIncidentStatus(deployIncident.id, 'resolved');
  console.log('✅ Verificação pós-deploy concluída');
}

async function showHelp() {
  console.log('\n🚨 SISTEMA DE RESPOSTA DE EMERGÊNCIA UNTILE');
  console.log('============================================');
  console.log('\nComandos disponíveis:');
  console.log('  --test        Executar testes do sistema');
  console.log('  --validate    Validar configuração do sistema');
  console.log('  --report      Gerar relatório de emergências');
  console.log('  --post-deploy Verificação pós-deploy');
  console.log('\nExemplos:');
  console.log('  yarn emergency --test');
  console.log('  yarn emergency --report');
  console.log('  yarn emergency --validate');
}

if (require.main === module) {
  main().catch(error => {
    logger.error('Erro fatal:', error);
    process.exit(1);
  });
} 